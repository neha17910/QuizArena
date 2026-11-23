const express = require('express');
const router = express.Router();
const { verifyRoomCode, getSessionById, getMySessions } = require('../controllers/sessionController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.post('/join', verifyRoomCode);
router.get('/', protect, authorize('teacher', 'admin'), getMySessions);
router.get('/:id', optionalAuth, getSessionById);

module.exports = router;
