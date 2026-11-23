const express = require('express');
const router = express.Router();
const {
  addToQuestionBank,
  getQuestionBank,
  updateQuestionInBank,
  deleteQuestionFromBank,
  addBankQuestionsToQuiz,
  importQuestionsFromCSV
} = require('../controllers/questionBankController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('teacher', 'admin'));

router.route('/')
  .post(addToQuestionBank)
  .get(getQuestionBank);

router.post('/add-to-quiz', addBankQuestionsToQuiz);
router.post('/import-csv', importQuestionsFromCSV);

router.route('/:id')
  .put(updateQuestionInBank)
  .delete(deleteQuestionFromBank);

module.exports = router;
