// routes/notifications.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Validation middleware
const validateTokenRegistration = (req, res, next) => {
  const { token, platform, type } = req.body;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Token is required and must be a string'
    });
  }
  
  if (!platform || !['ios', 'android'].includes(platform)) {
    return res.status(400).json({
      success: false,
      message: 'Platform must be either "ios" or "android"'
    });
  }
  
  if (!type || type !== 'expo') {
    return res.status(400).json({
      success: false,
      message: 'Type must be "expo"'
    });
  }
  
  next();
};

const validateNotificationPayload = (req, res, next) => {
  const { userIds, title, body } = req.body;
  
  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'userIds must be a non-empty array'
    });
  }
  
  if (!title || typeof title !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Title is required and must be a string'
    });
  }
  
  if (!body || typeof body !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Body is required and must be a string'
    });
  }
  
  next();
};

// Optional authentication middleware (uncomment if you have auth)
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   
//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: 'Access token required'
//     });
//   }
//   
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({
//         success: false,
//         message: 'Invalid or expired token'
//       });
//     }
//     req.user = user;
//     next();
//   });
// };

// Routes

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register a new push notification token
 * @access  Public (or Private if auth middleware is used)
 */
router.post('/register-token', 
  validateTokenRegistration,
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.registerToken
);

/**
 * @route   GET /api/notifications/tokens
 * @desc    Get all active tokens for a user
 * @access  Public (or Private if auth middleware is used)
 */
router.get('/tokens', 
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.getTokens
);

/**
 * @route   DELETE /api/notifications/tokens/:token
 * @desc    Deactivate a specific push token
 * @access  Public (or Private if auth middleware is used)
 */
router.delete('/tokens/:token', 
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.deactivateToken
);

/**
 * @route   POST /api/notifications/send
 * @desc    Send push notification to specified users
 * @access  Private (usually requires authentication)
 */
router.post('/send', 
  validateNotificationPayload,
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.sendNotification
);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private (usually requires authentication)
 */
router.get('/stats', 
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.getNotificationStats
);

/**
 * @route   DELETE /api/notifications/cleanup
 * @desc    Clear inactive tokens older than specified days
 * @access  Private (usually requires authentication)
 */
router.delete('/cleanup', 
  // authenticateToken, // Uncomment if you want to require authentication
  notificationController.clearInactiveTokens
);

// Health check for notification service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notification service is healthy',
    timestamp: new Date().toISOString(),
    service: 'push-notifications'
  });
});

module.exports = router;