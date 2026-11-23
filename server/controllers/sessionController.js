const Session = require('../models/Session');
const Quiz = require('../models/Quiz');

// @desc    Verify if room code exists and is active
// @route   POST /api/sessions/join
// @access  Public
exports.verifyRoomCode = async (req, res, next) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) {
      return res.status(400).json({ success: false, message: 'Room code is required.' });
    }

    const session = await Session.findOne({ roomCode: roomCode.toUpperCase().trim() })
      .populate('quizId', 'title description subject category coverImage settings totalQuestions')
      .populate('hostId', 'name avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Room code not found. Please double check.' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This quiz room has already concluded.' });
    }

    res.status(200).json({
      success: true,
      roomCode: session.roomCode,
      sessionId: session._id,
      quiz: session.quizId,
      host: session.hostId,
      status: session.status
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private / Public
exports.getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('quizId')
      .populate('hostId', 'name avatar email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.status(200).json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all sessions hosted by the logged in teacher
// @route   GET /api/sessions
// @access  Private (Teacher / Admin)
exports.getMySessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ hostId: req.user.id })
      .populate('quizId', 'title subject coverImage')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      sessions
    });
  } catch (err) {
    next(err);
  }
};
