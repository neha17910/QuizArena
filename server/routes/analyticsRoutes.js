const express = require('express');
const router = express.Router();
const {
  getTeacherAnalytics,
  getStudentAnalytics,
  getAdminAnalytics,
  getGlobalLeaderboard
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/teacher', protect, authorize('teacher', 'admin'), getTeacherAnalytics);
router.get('/student', protect, getStudentAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/global-leaderboard', getGlobalLeaderboard);

module.exports = router;
