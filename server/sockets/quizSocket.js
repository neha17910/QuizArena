const Session = require('../models/Session');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { evaluateAnswer, calculateScore } = require('../utils/scoring');

// Active rooms in-memory registry for ultra-fast, low-latency live synchronization
const activeRooms = new Map();

function setupQuizSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    /**
     * HOST: Create live room
     */
    socket.on('room:create', async ({ quizId, hostId, settings }) => {
      try {
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          return socket.emit('error', { message: 'Quiz has no questions or does not exist.' });
        }

        // Generate a 6-character random uppercase alphanumeric room code
        let roomCode = '';
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        for (let i = 0; i < 6; i++) {
          roomCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Create Session in MongoDB
        const session = await Session.create({
          quizId: quiz._id,
          hostId: hostId,
          roomCode,
          status: 'waiting',
          totalQuestions: quiz.questions.length,
          settings: {
            timeLimitPerQuestion: settings?.timeLimitPerQuestion || quiz.settings?.timeLimitPerQuestion || 30,
            positiveMarking: settings?.positiveMarking || quiz.settings?.positiveMarking || 100,
            negativeMarking: settings?.negativeMarking || quiz.settings?.negativeMarking || 0,
            showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? true,
            enableLeaderboard: quiz.settings?.enableLeaderboard ?? true,
            soundEffects: quiz.settings?.soundEffects ?? true
          }
        });

        // Store active room state
        const roomData = {
          roomCode,
          sessionId: session._id.toString(),
          quizId: quiz._id.toString(),
          quizTitle: quiz.title,
          hostSocketId: socket.id,
          hostId,
          status: 'waiting',
          questions: quiz.questions,
          currentQuestionIndex: -1,
          timerInterval: null,
          timeRemaining: 0,
          totalTime: 30,
          settings: session.settings,
          participants: new Map(), // playerId -> participant object
          submissions: new Map() // questionIndex -> Map(playerId -> submission)
        };

        activeRooms.set(roomCode, roomData);
        socket.join(`room:${roomCode}`);

        socket.emit('room:created', {
          roomCode,
          sessionId: session._id,
          quizTitle: quiz.title,
          totalQuestions: quiz.questions.length,
          settings: roomData.settings
        });

        console.log(`[Socket] Room created: ${roomCode} by host: ${hostId}`);
      } catch (err) {
        console.error('[Socket] room:create error:', err);
        socket.emit('error', { message: 'Failed to create room.' });
      }
    });

    /**
     * PLAYER: Join room
     */
    socket.on('room:join', async ({ roomCode, playerId, playerName, avatar, userId, isGuest }) => {
      try {
        const code = (roomCode || '').toUpperCase().trim();
        const room = activeRooms.get(code);

        if (!room) {
          return socket.emit('room:error', { message: 'Invalid room code. Please check and try again.' });
        }

        if (room.status === 'completed') {
          return socket.emit('room:error', { message: 'This quiz session has already finished.' });
        }

        socket.join(`room:${code}`);

        // Check if player is reconnecting
        let participant = room.participants.get(playerId);
        if (participant) {
          participant.socketId = socket.id;
          participant.isConnected = true;
          console.log(`[Socket] Player ${playerName} (${playerId}) reconnected to ${code}`);
        } else {
          participant = {
            socketId: socket.id,
            playerId: playerId || `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId: userId || null,
            name: playerName || 'Anonymous Player',
            avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerName}`,
            isGuest: !!isGuest,
            score: 0,
            streak: 0,
            maxStreak: 0,
            correctCount: 0,
            tabSwitches: 0,
            isConnected: true,
            answers: []
          };
          room.participants.set(participant.playerId, participant);

          // Update MongoDB session with participant
          await Session.findByIdAndUpdate(room.sessionId, {
            $push: {
              participants: {
                socketId: socket.id,
                playerId: participant.playerId,
                userId: participant.userId,
                name: participant.name,
                avatar: participant.avatar,
                isGuest: participant.isGuest
              }
            }
          });
        }

        // Send confirmation to joining player
        socket.emit('room:joined', {
          roomCode: code,
          quizTitle: room.quizTitle,
          status: room.status,
          totalQuestions: room.questions.length,
          currentQuestionIndex: room.currentQuestionIndex,
          player: participant
        });

        // Broadcast player list to entire room (including host)
        const participantList = Array.from(room.participants.values()).map((p) => ({
          playerId: p.playerId,
          name: p.name,
          avatar: p.avatar,
          score: p.score,
          streak: p.streak,
          isConnected: p.isConnected
        }));

        io.to(`room:${code}`).emit('player:joined', {
          player: {
            playerId: participant.playerId,
            name: participant.name,
            avatar: participant.avatar
          },
          participants: participantList,
          totalCount: participantList.length
        });

        // If a question is already active, send the question payload (without correct answer!)
        if (room.status === 'question_active' && room.currentQuestionIndex >= 0) {
          const q = room.questions[room.currentQuestionIndex];
          const sanitizedOptions = (q.options || []).map((opt) => ({
            id: opt.id,
            text: opt.text,
            matchPair: opt.matchPair,
            imageUrl: opt.imageUrl
          }));

          socket.emit('question:start', {
            questionIndex: room.currentQuestionIndex,
            totalQuestions: room.questions.length,
            questionText: q.questionText,
            questionType: q.questionType,
            options: sanitizedOptions,
            codeSnippet: q.codeSnippet,
            codeLanguage: q.codeLanguage,
            imageUrl: q.imageUrl,
            points: q.points,
            timeLimit: q.timeLimit || room.settings.timeLimitPerQuestion || 30,
            timeRemaining: room.timeRemaining
          });
        }
      } catch (err) {
        console.error('[Socket] room:join error:', err);
        socket.emit('room:error', { message: 'Could not join room.' });
      }
    });

    /**
     * HOST: Start quiz
     */
    socket.on('quiz:start', async ({ roomCode }) => {
      try {
        const code = (roomCode || '').toUpperCase().trim();
        const room = activeRooms.get(code);

        if (!room) return socket.emit('error', { message: 'Room not found.' });
        if (room.hostSocketId !== socket.id) {
          return socket.emit('error', { message: 'Only the host can start the quiz.' });
        }

        room.status = 'active';
        await Session.findByIdAndUpdate(room.sessionId, {
          status: 'active',
          startedAt: new Date()
        });

        io.to(`room:${code}`).emit('quiz:started', {
          roomCode: code,
          totalQuestions: room.questions.length
        });

        // Launch first question after 3 second countdown
        setTimeout(() => {
          startNextQuestion(io, room);
        }, 3000);
      } catch (err) {
        console.error('[Socket] quiz:start error:', err);
      }
    });

    /**
     * PLAYER: Submit answer
     */
    socket.on('answer:submit', async ({ roomCode, playerId, questionIndex, answer, timeRemaining, multiplier }) => {
      try {
        const code = (roomCode || '').toUpperCase().trim();
        const room = activeRooms.get(code);

        if (!room || room.status !== 'question_active') {
          return socket.emit('answer:rejected', { reason: 'Question is not active for submissions.' });
        }

        if (room.currentQuestionIndex !== questionIndex) {
          return socket.emit('answer:rejected', { reason: 'Mismatched question index.' });
        }

        const participant = room.participants.get(playerId);
        if (!participant) {
          return socket.emit('answer:rejected', { reason: 'Participant not registered in this room.' });
        }

        // Ensure sub map exists
        if (!room.submissions.has(questionIndex)) {
          room.submissions.set(questionIndex, new Map());
        }
        const currentSubmissions = room.submissions.get(questionIndex);

        // Anti-cheating: Prevent duplicate submissions
        if (currentSubmissions.has(playerId)) {
          return socket.emit('answer:rejected', { reason: 'Answer already submitted for this question.' });
        }

        const currentQuestion = room.questions[questionIndex];
        const { isCorrect, isPoll } = evaluateAnswer(currentQuestion, answer);

        const responseTime = Math.max(0, (room.totalTime - (timeRemaining || 0)));
        const scoreResult = calculateScore({
          question: currentQuestion,
          isCorrect,
          timeRemaining: timeRemaining || 0,
          totalTime: room.totalTime,
          currentStreak: participant.streak,
          settings: room.settings
        });

        // Apply 2x Multiplier powerup if active
        if (multiplier && multiplier > 1 && isCorrect) {
          scoreResult.awardedPoints = scoreResult.awardedPoints * multiplier;
        }

        participant.score += scoreResult.awardedPoints;
        participant.streak = scoreResult.newStreak;
        if (participant.streak > participant.maxStreak) {
          participant.maxStreak = participant.streak;
        }
        if (isCorrect) {
          participant.correctCount += 1;
        }

        const submissionRecord = {
          playerId,
          playerName: participant.name,
          answer,
          isCorrect,
          responseTime,
          awardedPoints: scoreResult.awardedPoints,
          streak: participant.streak
        };
        currentSubmissions.set(playerId, submissionRecord);

        // Record Answer in MongoDB
        try {
          await Answer.create({
            sessionId: room.sessionId,
            questionId: currentQuestion._id,
            questionIndex,
            playerId,
            userId: participant.userId,
            playerName: participant.name,
            submittedAnswer: answer,
            isCorrect,
            responseTime,
            awardedPoints: scoreResult.awardedPoints,
            streak: participant.streak
          });
        } catch (dbErr) {
          console.warn('[Socket] Could not persist answer to DB:', dbErr.message);
        }

        // Acknowledge submission to the student immediately
        socket.emit('answer:acknowledged', {
          questionIndex,
          submitted: true,
          awardedPoints: scoreResult.awardedPoints,
          currentScore: participant.score,
          streak: participant.streak
        });

        // Notify host about progress
        const answeredCount = currentSubmissions.size;
        const totalActivePlayers = Array.from(room.participants.values()).filter((p) => p.isConnected).length;
        io.to(room.hostSocketId).emit('answer:progress', {
          answeredCount,
          totalActivePlayers
        });

        // If all connected players have answered, close question early!
        if (answeredCount >= totalActivePlayers && totalActivePlayers > 0) {
          clearInterval(room.timerInterval);
          closeCurrentQuestion(io, room);
        }
      } catch (err) {
        console.error('[Socket] answer:submit error:', err);
      }
    });

    /**
     * HOST: Next question or End quiz manually
     */
    socket.on('question:next', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = activeRooms.get(code);
      if (!room || room.hostSocketId !== socket.id) return;

      if (room.currentQuestionIndex + 1 < room.questions.length) {
        startNextQuestion(io, room);
      } else {
        finishQuiz(io, room);
      }
    });

    /**
     * HOST: Skip current question
     */
    socket.on('question:skip', ({ roomCode }) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = activeRooms.get(code);
      if (!room || room.hostSocketId !== socket.id) return;
      clearInterval(room.timerInterval);
      closeCurrentQuestion(io, room);
    });

    /**
     * FAIR PLAY: Anti-cheating tab switch alert
     */
    socket.on('player:tab_switch', ({ roomCode, playerId }) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = activeRooms.get(code);
      if (!room) return;

      const participant = room.participants.get(playerId);
      if (participant) {
        participant.tabSwitches = (participant.tabSwitches || 0) + 1;
        // Notify host
        io.to(room.hostSocketId).emit('fair_play:alert', {
          playerId,
          playerName: participant.name,
          tabSwitches: participant.tabSwitches,
          message: `${participant.name} switched tabs or minimized the browser.`
        });
      }
    });

    /**
     * POWER-UP ACTIVATION: 50-50, 2X Multiplier, Freeze Time
     */
    socket.on('player:powerup', ({ roomCode, playerId, powerupType, powerupName }) => {
      const code = (roomCode || '').toUpperCase().trim();
      const room = activeRooms.get(code);
      if (!room) return;

      const participant = room.participants.get(playerId);
      if (participant) {
        io.to(`room:${code}`).emit('powerup:broadcast', {
          playerId,
          playerName: participant.name,
          powerupType,
          powerupName: powerupName || powerupType,
          id: Math.random().toString(36).substr(2, 9)
        });
      }
    });

    /**
     * REAL-TIME REACTIONS: Emojis floating across screens
     */
    socket.on('reaction:send', ({ roomCode, emoji, playerName }) => {
      const code = (roomCode || '').toUpperCase().trim();
      io.to(`room:${code}`).emit('reaction:broadcast', {
        emoji,
        playerName: playerName || 'Player',
        id: Math.random().toString(36).substr(2, 9)
      });
    });

    /**
     * DISCONNECT: Mark participant or host disconnected
     */
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      for (const [code, room] of activeRooms.entries()) {
        if (room.hostSocketId === socket.id) {
          // Host disconnected
          io.to(`room:${code}`).emit('host:disconnected', {
            message: 'Host has temporarily disconnected. Waiting for reconnection...'
          });
        } else {
          // Check if it is a participant
          for (const participant of room.participants.values()) {
            if (participant.socketId === socket.id) {
              participant.isConnected = false;
              io.to(`room:${code}`).emit('player:left', {
                playerId: participant.playerId,
                name: participant.name
              });
              break;
            }
          }
        }
      }
    });
  });
}

/**
 * Starts the next question in the room
 */
function startNextQuestion(io, room) {
  clearInterval(room.timerInterval);

  room.currentQuestionIndex += 1;
  const q = room.questions[room.currentQuestionIndex];
  if (!q) {
    return finishQuiz(io, room);
  }

  room.status = 'question_active';
  const timeLimit = q.timeLimit || room.settings.timeLimitPerQuestion || 30;
  room.totalTime = timeLimit;
  room.timeRemaining = timeLimit;

  // Clean options for players (DO NOT send isCorrect!)
  const sanitizedOptions = (q.options || []).map((opt) => ({
    id: opt.id,
    text: opt.text,
    matchPair: opt.matchPair,
    imageUrl: opt.imageUrl
  }));

  const questionPayload = {
    questionIndex: room.currentQuestionIndex,
    totalQuestions: room.questions.length,
    questionText: q.questionText,
    questionType: q.questionType,
    options: sanitizedOptions,
    codeSnippet: q.codeSnippet,
    codeLanguage: q.codeLanguage,
    imageUrl: q.imageUrl,
    points: q.points,
    timeLimit,
    timeRemaining: timeLimit
  };

  io.to(`room:${room.roomCode}`).emit('question:start', questionPayload);

  // Authoritative server timer loop
  room.timerInterval = setInterval(() => {
    room.timeRemaining -= 1;
    io.to(`room:${room.roomCode}`).emit('timer:tick', {
      timeRemaining: Math.max(0, room.timeRemaining),
      totalTime: room.totalTime
    });

    if (room.timeRemaining <= 0) {
      clearInterval(room.timerInterval);
      closeCurrentQuestion(io, room);
    }
  }, 1000);
}

/**
 * Closes the current question, reveals correct answer, and computes leaderboard
 */
function closeCurrentQuestion(io, room) {
  room.status = 'question_ended';
  const q = room.questions[room.currentQuestionIndex];
  const submissions = room.submissions.get(room.currentQuestionIndex) || new Map();

  // Calculate option statistics (how many picked each option)
  const optionStats = {};
  if (q.options) {
    q.options.forEach((opt) => {
      optionStats[opt.id] = 0;
    });
  }

  for (const sub of submissions.values()) {
    if (sub.answer && optionStats[sub.answer] !== undefined) {
      optionStats[sub.answer] += 1;
    }
  }

  // Generate sorted leaderboard
  const participants = Array.from(room.participants.values());
  participants.sort((a, b) => b.score - a.score);

  const leaderboard = participants.slice(0, 10).map((p, idx) => ({
    rank: idx + 1,
    playerId: p.playerId,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    streak: p.streak,
    correctCount: p.correctCount
  }));

  // Find correct answer details
  const correctAnswerPayload = {
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || '',
    options: q.options || [],
    optionStats,
    leaderboard,
    questionIndex: room.currentQuestionIndex,
    isLastQuestion: room.currentQuestionIndex + 1 >= room.questions.length
  };

  io.to(`room:${room.roomCode}`).emit('question:end', correctAnswerPayload);
}

/**
 * Concludes the quiz, generates final podium, awards XP & badges, saves Results to MongoDB
 */
async function finishQuiz(io, room) {
  clearInterval(room.timerInterval);
  room.status = 'completed';

  const participants = Array.from(room.participants.values());
  participants.sort((a, b) => b.score - a.score);

  const totalQuestions = room.questions.length;
  const podium = participants.slice(0, 3).map((p, idx) => ({
    rank: idx + 1,
    playerId: p.playerId,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    correctCount: p.correctCount,
    accuracy: totalQuestions > 0 ? Math.round((p.correctCount / totalQuestions) * 100) : 0
  }));

  const fullLeaderboard = participants.map((p, idx) => ({
    rank: idx + 1,
    playerId: p.playerId,
    name: p.name,
    avatar: p.avatar,
    score: p.score,
    correctCount: p.correctCount,
    maxStreak: p.maxStreak,
    accuracy: totalQuestions > 0 ? Math.round((p.correctCount / totalQuestions) * 100) : 0,
    tabSwitches: p.tabSwitches || 0
  }));

  const totalParticipants = participants.length;
  const averageScore = totalParticipants > 0 ? Math.round(participants.reduce((acc, p) => acc + p.score, 0) / totalParticipants) : 0;
  const highestScore = participants[0]?.score || 0;

  // Persist Results in MongoDB
  try {
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      const accuracy = totalQuestions > 0 ? Math.round((p.correctCount / totalQuestions) * 100) : 0;
      const rank = i + 1;
      const awardedXP = Math.round(p.score / 2) + (rank === 1 ? 200 : rank === 2 ? 100 : rank === 3 ? 50 : 25);

      const badgesEarned = [];
      if (p.correctCount === totalQuestions && totalQuestions > 0) badgesEarned.push('Perfect Score');
      if (p.maxStreak >= 5) badgesEarned.push('Five Quiz Streak');
      if (rank === 1) badgesEarned.push('Quiz Champion');
      if (rank <= 3) badgesEarned.push('Top Performer');

      await Result.create({
        sessionId: room.sessionId,
        quizId: room.quizId,
        hostId: room.hostId,
        playerId: p.playerId,
        userId: p.userId,
        playerName: p.name,
        avatar: p.avatar,
        isGuest: p.isGuest,
        score: p.score,
        correctAnswers: p.correctCount,
        totalQuestions,
        accuracy,
        rank,
        streakMax: p.maxStreak,
        awardedXP,
        badgesEarned,
        completedAt: new Date()
      });

      // Update registered User model if student is logged in
      if (p.userId) {
        const user = await User.findById(p.userId);
        if (user) {
          user.stats.totalQuizzes = (user.stats.totalQuizzes || 0) + 1;
          user.stats.totalScore = (user.stats.totalScore || 0) + p.score;
          user.stats.correctAnswers = (user.stats.correctAnswers || 0) + p.correctCount;
          user.stats.totalQuestionsAnswered = (user.stats.totalQuestionsAnswered || 0) + totalQuestions;
          user.stats.accuracy = Math.round((user.stats.correctAnswers / Math.max(1, user.stats.totalQuestionsAnswered)) * 100);
          if (p.maxStreak > (user.stats.maxStreak || 0)) {
            user.stats.maxStreak = p.maxStreak;
          }
          user.addXP(awardedXP);

          for (const badge of badgesEarned) {
            if (!user.badges.some((b) => b.name === badge)) {
              user.badges.push({
                badgeType: badge.toLowerCase().replace(/ /g, '_'),
                name: badge,
                description: `Earned for outstanding performance in ${room.quizTitle}`
              });
            }
          }
          await user.save();
        }
      }
    }

    // Update session in DB
    await Session.findByIdAndUpdate(room.sessionId, {
      status: 'completed',
      endedAt: new Date()
    });

    // Update Quiz playCount and averageScore
    await Quiz.findByIdAndUpdate(room.quizId, {
      $inc: { playCount: 1 },
      averageScore
    });
  } catch (saveErr) {
    console.error('[Socket] Error saving quiz results to DB:', saveErr);
  }

  io.to(`room:${room.roomCode}`).emit('quiz:end', {
    podium,
    fullLeaderboard,
    summaryStats: {
      totalParticipants,
      averageScore,
      highestScore,
      totalQuestions
    }
  });

  console.log(`[Socket] Room ${room.roomCode} finished successfully.`);
}

module.exports = setupQuizSocket;
