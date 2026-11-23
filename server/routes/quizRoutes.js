const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  duplicateQuiz
} = require('../controllers/quizController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('teacher', 'admin'), createQuiz)
  .get(optionalAuth, getQuizzes);

router.route('/:id')
  .get(optionalAuth, getQuizById)
  .put(protect, authorize('teacher', 'admin'), updateQuiz)
  .delete(protect, authorize('teacher', 'admin'), deleteQuiz);

router.post('/:id/duplicate', protect, authorize('teacher', 'admin'), duplicateQuiz);

module.exports = router;
