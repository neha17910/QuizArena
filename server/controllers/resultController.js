const Result = require('../models/Result');
const Session = require('../models/Session');
const Answer = require('../models/Answer');

// @desc    Get logged in student's quiz results history
// @route   GET /api/results/student
// @access  Private (Student)
exports.getStudentResults = async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.user.id })
      .populate('quizId', 'title subject category difficulty coverImage')
      .sort({ completedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all results for a live session (teacher report)
// @route   GET /api/results/session/:sessionId
// @access  Private (Teacher / Admin)
exports.getSessionResults = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).populate('quizId');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const results = await Result.find({ sessionId }).sort({ rank: 1 });
    const answers = await Answer.find({ sessionId }).populate('questionId');

    res.status(200).json({
      success: true,
      session,
      results,
      answersCount: answers.length
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed review for a single result
// @route   GET /api/results/:id
// @access  Public / Private
exports.getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quizId')
      .populate('hostId', 'name avatar');

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    // Get specific submitted answers for this player in this session
    const answers = await Answer.find({
      sessionId: result.sessionId,
      playerId: result.playerId
    }).populate('questionId');

    res.status(200).json({
      success: true,
      result,
      answers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export session results as CSV formatted data
// @route   GET /api/results/session/:sessionId/csv
// @access  Private (Teacher / Admin)
exports.exportSessionCSV = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId).populate('quizId');
    const results = await Result.find({ sessionId }).sort({ rank: 1 });

    let csvContent = 'Rank,Player Name,Score,Correct Answers,Total Questions,Accuracy (%),Max Streak\n';
    results.forEach((r) => {
      csvContent += `${r.rank},"${r.playerName}",${r.score},${r.correctAnswers},${r.totalQuestions},${r.accuracy}%,${r.streakMax}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=quiz_results_${session?.roomCode || 'export'}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};
