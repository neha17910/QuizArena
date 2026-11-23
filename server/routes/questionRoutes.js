const express = require('express');
const router = express.Router();
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  bulkAddQuestions
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('teacher', 'admin'), addQuestion);
router.post('/bulk', protect, authorize('teacher', 'admin'), bulkAddQuestions);
router.route('/:id')
  .put(protect, authorize('teacher', 'admin'), updateQuestion)
  .delete(protect, authorize('teacher', 'admin'), deleteQuestion);

module.exports = router;
