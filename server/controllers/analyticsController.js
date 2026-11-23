const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Session = require('../models/Session');
const Result = require('../models/Result');
const Answer = require('../models/Answer');
const User = require('../models/User');

// @desc    Teacher Analytics Dashboard
// @route   GET /api/analytics/teacher
// @access  Private (Teacher / Admin)
exports.getTeacherAnalytics = async (req, res, next) => {
  try {
    const teacherId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Quizzes created and hosted
    const totalQuizzesCreated = await Quiz.countDocuments({ createdBy: teacherId });
    const sessions = await Session.find({ hostId: teacherId });
    const totalQuizzesHosted = sessions.length;
    const sessionIds = sessions.map((s) => s._id);

    // 2. Results aggregation for this teacher
    const results = await Result.find({ hostId: teacherId });
    const totalStudentsParticipated = results.length;

    let averageQuizScore = 0;
    let averageAccuracy = 0;
    if (results.length > 0) {
      averageQuizScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
      averageAccuracy = Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / results.length);
    }

    // 3. Question-wise accuracy & difficulty from Answer collection
    const questionStats = await Answer.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      {
        $group: {
          _id: '$questionId',
          totalAnswers: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: '_id',
          as: 'questionDetails'
        }
      },
      { $unwind: '$questionDetails' },
      {
        $project: {
          questionText: '$questionDetails.questionText',
          questionType: '$questionDetails.questionType',
          totalAnswers: 1,
          correctAnswers: 1,
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalAnswers'] }, 100] },
              0
            ]
          },
          avgResponseTime: { $round: ['$avgResponseTime', 1] }
        }
      },
      { $sort: { accuracy: 1 } }
    ]);

    const mostDifficultQuestion = questionStats[0] || null;
    const mostSuccessfulQuestion = questionStats[questionStats.length - 1] || null;

    // 4. Score distribution breakdown (0-200, 201-500, 501-800, 801+)
    const scoreDistribution = [
      { range: '0 - 250', count: results.filter((r) => r.score <= 250).length },
      { range: '251 - 500', count: results.filter((r) => r.score > 250 && r.score <= 500).length },
      { range: '501 - 750', count: results.filter((r) => r.score > 500 && r.score <= 750).length },
      { range: '751+', count: results.filter((r) => r.score > 750).length }
    ];

    // 5. Correct vs Incorrect overall pie
    const totalCorrect = results.reduce((acc, r) => acc + (r.correctAnswers || 0), 0);
    const totalQuestions = results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);
    const totalIncorrect = Math.max(0, totalQuestions - totalCorrect);
    const pieData = [
      { name: 'Correct Answers', value: totalCorrect, fill: '#10B981' },
      { name: 'Incorrect Answers', value: totalIncorrect, fill: '#EF4444' }
    ];

    // 6. Recent sessions participation trend
    const participationTrend = sessions.slice(-7).map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      participants: s.participants ? s.participants.length : 0,
      code: s.roomCode
    }));

    res.status(200).json({
      success: true,
      metrics: {
        totalQuizzesCreated,
        totalQuizzesHosted,
        totalStudentsParticipated,
        averageQuizScore,
        averageAccuracy,
        mostDifficultQuestion,
        mostSuccessfulQuestion
      },
      charts: {
        questionAccuracy: questionStats.slice(0, 10),
        scoreDistribution,
        pieData,
        participationTrend
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Student Performance & Learning Progress Dashboard
// @route   GET /api/analytics/student
// @access  Private (Student)
exports.getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(studentId);

    const results = await Result.find({ userId: studentId })
      .populate('quizId', 'title subject category')
      .sort({ completedAt: 1 });

    const totalQuizzesAttempted = results.length;
    const totalScore = results.reduce((acc, r) => acc + r.score, 0);
    const averageScore = totalQuizzesAttempted > 0 ? Math.round(totalScore / totalQuizzesAttempted) : 0;
    const averageAccuracy = totalQuizzesAttempted > 0
      ? Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalQuizzesAttempted)
      : 0;

    // Subject strength aggregation
    const subjectMap = {};
    results.forEach((r) => {
      const subj = r.quizId?.subject || 'General';
      if (!subjectMap[subj]) {
        subjectMap[subj] = { subject: subj, totalScore: 0, count: 0, accuracySum: 0 };
      }
      subjectMap[subj].totalScore += r.score;
      subjectMap[subj].accuracySum += r.accuracy || 0;
      subjectMap[subj].count += 1;
    });

    const subjectsArray = Object.values(subjectMap).map((s) => ({
      subject: s.subject,
      avgAccuracy: Math.round(s.accuracySum / s.count),
      attempts: s.count
    }));

    subjectsArray.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
    const strongestSubjects = subjectsArray.slice(0, 2);
    const weakestSubjects = subjectsArray.slice(-2).reverse();

    // Timeline progress chart
    const timelineData = results.slice(-10).map((r, idx) => ({
      quizNumber: idx + 1,
      quizTitle: r.quizId?.title?.substring(0, 15) || `Quiz ${idx + 1}`,
      score: r.score,
      accuracy: r.accuracy || 0,
      rank: r.rank
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalQuizzesAttempted,
        totalScore,
        averageScore,
        averageAccuracy,
        level: user.level,
        xp: user.xp,
        currentStreak: user.stats?.currentStreak || 0,
        maxStreak: user.stats?.maxStreak || 0,
        badges: user.badges || []
      },
      strongestSubjects,
      weakestSubjects,
      timelineData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin Platform Analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalQuizzes = await Quiz.countDocuments();
    const activeRooms = await Session.countDocuments({ status: { $in: ['waiting', 'active', 'question_active'] } });
    const completedSessions = await Session.countDocuments({ status: 'completed' });

    // Users registered recently
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-passwordHash');
    const recentQuizzes = await Quiz.find().populate('createdBy', 'name email').sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      counts: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalQuizzes,
        activeRooms,
        completedSessions
      },
      recentUsers,
      recentQuizzes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Global Campus Hall of Fame & Leaderboard
// @route   GET /api/analytics/global-leaderboard
// @access  Public
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name avatar level xp stats badges createdAt')
      .sort({ xp: -1, 'stats.totalScore': -1 })
      .limit(25);

    const leaderboard = students.map((s, idx) => ({
      rank: idx + 1,
      id: s._id,
      name: s.name,
      avatar: s.avatar,
      level: s.level || 1,
      xp: s.xp || 0,
      totalQuizzes: s.stats?.totalQuizzes || 0,
      accuracy: s.stats?.accuracy || 0,
      maxStreak: s.stats?.maxStreak || 0,
      badgesCount: s.badges?.length || 0
    }));

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (err) {
    next(err);
  }
};
