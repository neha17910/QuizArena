const Tournament = require('../models/Tournament');
const Quiz = require('../models/Quiz');

// @desc    Create a tournament
// @route   POST /api/tournaments
// @access  Private (Teacher / Admin)
exports.createTournament = async (req, res, next) => {
  try {
    const { title, description, rounds, rules, startDate, endDate } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Tournament title is required.' });
    }

    const tournament = await Tournament.create({
      title,
      description: description || '',
      organizerId: req.user.id,
      rounds: rounds || [],
      rules: rules || 'Compete in all rounds. Highest cumulative score wins!',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      status: 'upcoming'
    });

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully.',
      tournament
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public / Private
exports.getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find()
      .populate('organizerId', 'name email avatar')
      .populate('rounds.quizId', 'title subject')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tournaments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public / Private
exports.getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizerId', 'name avatar')
      .populate('rounds.quizId', 'title subject description questions');

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    res.status(200).json({
      success: true,
      tournament
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
exports.registerForTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const alreadyRegistered = tournament.participants.some(
      (p) => p.userId && p.userId.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'You are already registered for this tournament!' });
    }

    tournament.participants.push({
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      totalScore: 0,
      roundScores: []
    });

    await tournament.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for the tournament!',
      tournament
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update tournament round or status
// @route   PUT /api/tournaments/:id
// @access  Private (Teacher / Admin)
exports.updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    if (tournament.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const updated = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('rounds.quizId');

    res.status(200).json({
      success: true,
      tournament: updated
    });
  } catch (err) {
    next(err);
  }
};
