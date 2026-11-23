import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/soundEffects';
import { speakText, stopSpeech } from '../utils/speech';
import QRCodeDisplay from '../components/QRCodeDisplay';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import {
  Users,
  Copy,
  Check,
  Zap,
  Clock,
  Volume2,
  VolumeX,
  Code2,
  Trophy,
  Award,
  ArrowRight,
  Flame,
  AlertTriangle,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function WaitingRoom() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user, guestPlayer } = useAuth();

  // Room State
  const [gameState, setGameState] = useState('waiting'); // 'waiting' | 'question' | 'leaderboard' | 'final'
  const [quizTitle, setQuizTitle] = useState(location.state?.quizTitle || 'Live Quiz Arena');
  const [participants, setParticipants] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Question State
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [totalTime, setTotalTime] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);

  // Power-ups Inventory (1 per quiz game)
  const [powerups, setPowerups] = useState({
    fiftyFifty: true,
    multiplier2x: true,
    freezeTime: true
  });
  const [eliminatedOptionIds, setEliminatedOptionIds] = useState([]);
  const [activeMultiplier, setActiveMultiplier] = useState(1);

  // Leaderboard / Reveal State
  const [revealData, setRevealData] = useState(null);

  // Final Results
  const [finalData, setFinalData] = useState(null);

  // Reactions
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const myPlayerId = user?.id || guestPlayer?.playerId || `p_${Date.now()}`;
  const myPlayerName = location.state?.playerName || user?.name || guestPlayer?.name || 'Player';
  const myAvatar = location.state?.avatar || user?.avatar || guestPlayer?.avatar;

  // Anti-cheating: detect tab switches
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameState === 'question' && socket) {
        socket.emit('player:tab_switch', {
          roomCode,
          playerId: myPlayerId
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameState, socket, roomCode, myPlayerId]);

  useEffect(() => {
    if (!socket) return;

    // Join room event
    socket.emit('room:join', {
      roomCode,
      playerId: myPlayerId,
      playerName: myPlayerName,
      avatar: myAvatar,
      userId: user?.id || null,
      isGuest: !user
    });

    // Handle room joined ack
    socket.on('room:joined', (data) => {
      setQuizTitle(data.quizTitle || quizTitle);
      if (data.status === 'question_active') {
        setGameState('question');
      }
    });

    // Handle other players joining
    socket.on('player:joined', ({ participants: list, player }) => {
      sounds.playTick();
      setParticipants(list || []);
    });

    // Handle player leave
    socket.on('player:left', ({ playerId }) => {
      setParticipants((prev) => prev.filter((p) => p.playerId !== playerId));
    });

    // Host starts quiz
    socket.on('quiz:started', () => {
      sounds.playFanfare();
      setGameState('question');
    });

    // Question Starts
    socket.on('question:start', (payload) => {
      sounds.playTick();
      sounds.startBattleBGM();
      setGameState('question');
      setCurrentQuestion(payload);
      setTimeRemaining(payload.timeRemaining || payload.timeLimit || 30);
      setTotalTime(payload.timeLimit || 30);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setRevealData(null);
      setEliminatedOptionIds([]);
      setActiveMultiplier(1);
    });

    // Timer Tick
    socket.on('timer:tick', ({ timeRemaining: tr, totalTime: tt }) => {
      setTimeRemaining(tr);
      if (tt) setTotalTime(tt);
      if (tr <= 5 && tr > 0) {
        sounds.playHeartbeat();
      }
    });

    // Answer Acknowledged
    socket.on('answer:acknowledged', (ack) => {
      setMyScore(ack.currentScore);
      setMyStreak(ack.streak);
    });

    // Question Ended & Leaderboard Reveal
    socket.on('question:end', (data) => {
      sounds.stopBattleBGM();
      setGameState('leaderboard');
      setRevealData(data);
      // Play sound depending on correctness
      const wasCorrect = data.options?.some(
        (opt) => (opt.isCorrect || opt.id === data.correctAnswer) && (opt.id === selectedAnswer || opt.text === selectedAnswer)
      );
      if (wasCorrect) {
        sounds.playCorrect();
      } else {
        sounds.playWrong();
      }
    });

    // Quiz Concluded
    socket.on('quiz:end', (data) => {
      sounds.stopBattleBGM();
      setGameState('final');
      setFinalData(data);
      sounds.playFanfare();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    });

    // Powerup broadcast
    socket.on('powerup:broadcast', ({ playerName, powerupName }) => {
      toast(`${playerName} activated ${powerupName}!`, { icon: '⚡' });
    });

    // Floating reaction received
    socket.on('reaction:broadcast', ({ emoji, id }) => {
      setFloatingEmojis((prev) => [...prev.slice(-10), { emoji, id }]);
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
      }, 2500);
    });

    return () => {
      socket.off('room:joined');
      socket.off('player:joined');
      socket.off('player:left');
      socket.off('quiz:started');
      socket.off('question:start');
      socket.off('timer:tick');
      socket.off('answer:acknowledged');
      socket.off('question:end');
      socket.off('quiz:end');
      socket.off('powerup:broadcast');
      socket.off('reaction:broadcast');
      sounds.stopBattleBGM();
      stopSpeech();
    };
  }, [socket, roomCode, myPlayerId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReaction = (emoji) => {
    if (!socket) return;
    socket.emit('reaction:send', {
      roomCode,
      emoji,
      playerName: myPlayerName
    });
  };

  // Powerup Handlers
  const handleUseFiftyFifty = () => {
    if (!powerups.fiftyFifty || !currentQuestion?.options || answerSubmitted) return;
    sounds.playPowerup();
    const opts = currentQuestion.options;
    // Eliminate up to 2 options
    const toEliminate = opts.slice(1, 3).map((o) => o.id);
    setEliminatedOptionIds(toEliminate);
    setPowerups((prev) => ({ ...prev, fiftyFifty: false }));
    toast.success('⚡ 50/50 Activated! Two incorrect options eliminated.');
    socket.emit('player:powerup', {
      roomCode,
      playerId: myPlayerId,
      powerupType: 'fifty_fifty',
      powerupName: '⚡ 50/50 Lifeline'
    });
  };

  const handleUseMultiplier2x = () => {
    if (!powerups.multiplier2x || answerSubmitted) return;
    sounds.playPowerup();
    setActiveMultiplier(2);
    setPowerups((prev) => ({ ...prev, multiplier2x: false }));
    toast.success('🔥 2X Points Multiplier Armed for this question!');
    socket.emit('player:powerup', {
      roomCode,
      playerId: myPlayerId,
      powerupType: 'multiplier_2x',
      powerupName: '🔥 2X Points Booster'
    });
  };

  const handleUseFreezeTime = () => {
    if (!powerups.freezeTime || answerSubmitted) return;
    sounds.playPowerup();
    setTimeRemaining((prev) => prev + 5);
    setPowerups((prev) => ({ ...prev, freezeTime: false }));
    toast.success('❄️ Time Freeze! +5s bonus time added.');
    socket.emit('player:powerup', {
      roomCode,
      playerId: myPlayerId,
      powerupType: 'freeze_time',
      powerupName: '❄️ +5s Freeze Buffer'
    });
  };

  const handleSubmitAnswer = (ans) => {
    if (answerSubmitted || timeRemaining <= 0 || !socket) return;
    sounds.playClick();
    setSelectedAnswer(ans);
    setAnswerSubmitted(true);

    socket.emit('answer:submit', {
      roomCode,
      playerId: myPlayerId,
      questionIndex: currentQuestion.questionIndex,
      answer: ans,
      timeRemaining,
      multiplier: activeMultiplier
    });
  };

  const handleReadAloud = () => {
    if (!currentQuestion?.questionText) return;
    sounds.playClick();
    speakText(currentQuestion.questionText);
  };

  return (
    <div className="min-h-[90vh] flex flex-col justify-between max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
      {/* Floating live emojis container */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-20 text-4xl animate-float"
            style={{ left: `${Math.random() * 80 + 10}%` }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      {/* STATE 1: WAITING ROOM LOBBY */}
      {gameState === 'waiting' && (
        <div className="space-y-8 my-auto text-center">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/25">
              Live Arena Lobby
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white">{quizTitle}</h1>
            <p className="text-sm text-slate-400">Waiting for host to initiate the countdown...</p>
          </div>

          {/* Room PIN & QR Code Box */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-3xl mx-auto">
            <div className="flex-1 w-full p-6 rounded-3xl bg-slate-900 border-2 border-purple-500/40 shadow-2xl shadow-purple-500/10 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Share Room PIN with Classmates
              </span>
              <div className="flex items-center justify-center space-x-3">
                <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-widest text-white">
                  {roomCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 transition-colors"
                  title="Copy PIN"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">Join at quizarena.app or enter PIN on home screen</p>
            </div>

            <QRCodeDisplay roomCode={roomCode} quizTitle={quizTitle} />
          </div>

          {/* Connected Players Grid */}
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">
                {participants.length} Warriors Joined
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-3 max-h-60 overflow-y-auto p-2">
              {participants.map((p) => (
                <div
                  key={p.playerId}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-2xl border transition-all ${
                    p.playerId === myPlayerId
                      ? 'bg-purple-900/40 border-purple-500 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <img
                    src={p.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot'}
                    alt={p.name}
                    className="w-7 h-7 rounded-full bg-slate-800"
                  />
                  <span className="text-xs font-bold truncate max-w-[120px]">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE QUESTION SCREEN */}
      {gameState === 'question' && currentQuestion && (
        <div className="space-y-6 my-auto max-w-4xl mx-auto w-full">
          {/* Header Bar: Question number, Timer, Score, Streak */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-bold font-mono">
                Q {currentQuestion.questionIndex + 1} / {currentQuestion.totalQuestions}
              </span>
              <button
                onClick={handleReadAloud}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Read question aloud (Text-to-Speech)"
              >
                <Volume2 className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            {/* Circular Timer Counter */}
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span
                className={`font-mono font-extrabold text-xl ${
                  timeRemaining <= 5 ? 'text-rose-500 animate-pulse' : 'text-white'
                }`}
              >
                {timeRemaining}s
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-bold">
              <span className="text-amber-400 flex items-center">
                <Flame className="w-4 h-4 mr-0.5 fill-amber-400" />
                {myStreak}x
              </span>
              <span className="text-emerald-400 font-mono text-sm">{myScore} pts</span>
            </div>
          </div>

          {/* Linear Countdown Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeRemaining <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}
              style={{ width: `${Math.max(0, (timeRemaining / totalTime) * 100)}%` }}
            ></div>
          </div>

          {/* Question Prompt Card */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-4 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Code Snippet if code_based */}
            {currentQuestion.codeSnippet && (
              <div className="max-w-xl mx-auto p-4 rounded-2xl bg-slate-950 font-mono text-xs sm:text-sm text-emerald-400 text-left border border-slate-800 overflow-x-auto">
                <pre>{currentQuestion.codeSnippet}</pre>
              </div>
            )}

            {/* Image if image_based */}
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question Diagram"
                className="max-h-60 rounded-2xl mx-auto border border-slate-800"
              />
            )}
          </div>

          {/* In-Game Power-up Lifelines Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              disabled={!powerups.fiftyFifty || answerSubmitted}
              onClick={handleUseFiftyFifty}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                powerups.fiftyFifty && !answerSubmitted
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <span>⚡ 50/50 Lifeline</span>
            </button>
            <button
              type="button"
              disabled={!powerups.multiplier2x || answerSubmitted}
              onClick={handleUseMultiplier2x}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeMultiplier === 2
                  ? 'bg-rose-500 border-rose-400 text-white animate-pulse shadow-lg shadow-rose-500/40'
                  : powerups.multiplier2x && !answerSubmitted
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <span>🔥 2X Points Multiplier</span>
            </button>
            <button
              type="button"
              disabled={!powerups.freezeTime || answerSubmitted}
              onClick={handleUseFreezeTime}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                powerups.freezeTime && !answerSubmitted
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <span>❄️ +5s Time Freeze</span>
            </button>
          </div>

          {/* Options Grid (Kahoot colorful vibe) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(currentQuestion.options || []).map((opt, idx) => {
              const bgColors = [
                'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 border-rose-500/40',
                'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-blue-500/40',
                'from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 border-amber-500/40',
                'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-500/40'
              ];
              const isSelected = selectedAnswer === opt.id || selectedAnswer === opt.text;
              const isEliminated = eliminatedOptionIds.includes(opt.id);

              if (isEliminated) {
                return (
                  <div
                    key={opt.id || idx}
                    className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-600 line-through font-bold text-lg text-left opacity-30 select-none flex items-center justify-between"
                  >
                    <span>{opt.text}</span>
                    <span className="text-xs font-mono">50/50 Eliminated</span>
                  </div>
                );
              }

              return (
                <button
                  key={opt.id || idx}
                  disabled={answerSubmitted || timeRemaining <= 0}
                  onClick={() => handleSubmitAnswer(opt.id || opt.text)}
                  className={`p-6 rounded-2xl bg-gradient-to-r ${bgColors[idx % 4]} border text-white font-bold text-lg text-left shadow-lg active:scale-98 transition-all flex items-center justify-between ${
                    isSelected ? 'ring-4 ring-white scale-102' : ''
                  } ${answerSubmitted && !isSelected ? 'opacity-40' : ''}`}
                >
                  <span>{opt.text}</span>
                  {isSelected && <Check className="w-6 h-6 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          {/* Submission Status Banner */}
          {answerSubmitted && (
            <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-500/40 text-center text-sm font-bold text-purple-300 animate-pulse">
              ✓ Answer locked in! Waiting for all players or timer countdown...
            </div>
          )}
        </div>
      )}

      {/* STATE 3: LEADERBOARD & CORRECT ANSWER REVEAL */}
      {gameState === 'leaderboard' && revealData && (
        <div className="space-y-6 my-auto max-w-3xl mx-auto w-full">
          {/* Answer Explanation Banner */}
          <div className="p-6 rounded-3xl bg-slate-900/95 border border-purple-500/40 text-center space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question Summary
            </span>
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-bold text-base">
              Correct Answer: {revealData.correctAnswer}
            </div>
            {revealData.explanation && (
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                💡 {revealData.explanation}
              </p>
            )}
          </div>

          {/* Live Top 10 Leaderboard */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Live Arena Rankings</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">After Question {revealData.questionIndex + 1}</span>
            </div>

            <div className="space-y-2">
              {(revealData.leaderboard || []).map((p, idx) => (
                <div
                  key={p.playerId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    p.playerId === myPlayerId
                      ? 'bg-purple-900/40 border-purple-500 text-white ring-2 ring-purple-500/30'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full bg-slate-800" />
                    <span className="font-bold text-sm">{p.name}</span>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    {p.streak >= 2 && (
                      <span className="text-amber-400 text-xs flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-0.5 fill-amber-400" />
                        {p.streak}
                      </span>
                    )}
                    <span className="font-extrabold text-white text-sm">{p.score} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: FINAL PODIUM & WINNERS SCREEN */}
      {gameState === 'final' && finalData && (
        <div className="space-y-8 my-auto max-w-4xl mx-auto w-full text-center">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Quiz Completed
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Victory Podium</h1>
          </div>

          {/* 3D Olympic Podium View */}
          <div className="flex items-end justify-center gap-4 pt-10 pb-6">
            {/* 2nd Place (Silver) */}
            {finalData.podium?.[1] && (
              <div className="flex flex-col items-center w-28 sm:w-36 space-y-2">
                <img
                  src={finalData.podium[1].avatar}
                  alt={finalData.podium[1].name}
                  className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-300 p-1"
                />
                <span className="text-xs font-bold text-white truncate max-w-full">
                  {finalData.podium[1].name}
                </span>
                <span className="text-xs font-mono text-slate-300 font-extrabold">
                  {finalData.podium[1].score} pts
                </span>
                <div className="w-full h-28 rounded-t-2xl bg-gradient-to-b from-slate-400 to-slate-600 flex items-center justify-center font-extrabold text-3xl text-slate-900 shadow-lg">
                  2
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {finalData.podium?.[0] && (
              <div className="flex flex-col items-center w-32 sm:w-44 space-y-2 -translate-y-4">
                <div className="text-3xl animate-bounce">👑</div>
                <img
                  src={finalData.podium[0].avatar}
                  alt={finalData.podium[0].name}
                  className="w-18 h-18 rounded-2xl bg-slate-800 border-4 border-amber-400 p-1 shadow-xl shadow-amber-400/30"
                />
                <span className="text-sm font-extrabold text-white truncate max-w-full">
                  {finalData.podium[0].name}
                </span>
                <span className="text-xs font-mono text-amber-300 font-extrabold">
                  {finalData.podium[0].score} pts
                </span>
                <div className="w-full h-40 rounded-t-2xl bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center font-extrabold text-4xl text-slate-950 shadow-2xl shadow-amber-500/20">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {finalData.podium?.[2] && (
              <div className="flex flex-col items-center w-28 sm:w-36 space-y-2">
                <img
                  src={finalData.podium[2].avatar}
                  alt={finalData.podium[2].name}
                  className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-700 p-1"
                />
                <span className="text-xs font-bold text-white truncate max-w-full">
                  {finalData.podium[2].name}
                </span>
                <span className="text-xs font-mono text-amber-500 font-extrabold">
                  {finalData.podium[2].score} pts
                </span>
                <div className="w-full h-20 rounded-t-2xl bg-gradient-to-b from-amber-700 to-amber-900 flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
                  3
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/student')}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Reaction Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 p-2 rounded-full bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md">
        {['🔥', '👏', '❤️', '🧠', '⚡', '🎉'].map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleSendReaction(emoji)}
            className="w-9 h-9 rounded-full hover:bg-slate-800 flex items-center justify-center text-lg active:scale-125 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
