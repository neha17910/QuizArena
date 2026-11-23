const express = require('express');
const router = express.Router();
const { generateQuiz, explainAnswer } = require('../controllers/aiController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.post('/generate-quiz', protect, authorize('teacher', 'admin'), generateQuiz);
router.post('/explain-answer', optionalAuth, explainAnswer);

module.exports = router;
