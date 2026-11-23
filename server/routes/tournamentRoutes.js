const express = require('express');
const router = express.Router();
const {
  createTournament,
  getTournaments,
  getTournamentById,
  registerForTournament,
  updateTournament
} = require('../controllers/tournamentController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('teacher', 'admin'), createTournament)
  .get(optionalAuth, getTournaments);

router.route('/:id')
  .get(optionalAuth, getTournamentById)
  .put(protect, authorize('teacher', 'admin'), updateTournament);

router.post('/:id/register', protect, registerForTournament);

module.exports = router;
