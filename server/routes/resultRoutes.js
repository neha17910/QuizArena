const express = require('express');
const router = express.Router();
const {
  getStudentResults,
  getSessionResults,
  getResultById,
  exportSessionCSV
} = require('../controllers/resultController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');

router.get('/student', protect, getStudentResults);
router.get('/session/:sessionId', protect, authorize('teacher', 'admin'), getSessionResults);
router.get('/session/:sessionId/csv', protect, authorize('teacher', 'admin'), exportSessionCSV);
router.get('/:id', optionalAuth, getResultById);

module.exports = router;
