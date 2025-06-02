const express = require('express');
const router = express.Router();

const {
  checkApiKey,
  getDashboardAnalytics,
  getUserAnalytics,
  getMediaAnalytics,
  getPublicUserCount
} = require('../controllers/AnalyticsController');

// Protected routes (require API key)
router.get('/dashboard', checkApiKey, getDashboardAnalytics);
router.get('/users', checkApiKey, getUserAnalytics);
router.get('/media', checkApiKey, getMediaAnalytics);

// Public routes
router.get('/public/users', getPublicUserCount);

module.exports = router;