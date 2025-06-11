const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  uploadProfileImage,
  deleteProfileImage,
  getUserStats,
  verifyEmail,
  resendVerificationCode
} = require('../controllers/AuthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Auth-specific rate limiter for public routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for protected routes
  skip: (req) => {
    // Skip rate limiting if Authorization header is present (protected routes)
    return req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
  }
});

// Apply auth limiter to all routes in this router
router.use(authLimiter);

// Public routes (these will be rate limited)
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

// Protected routes that require authentication only (these will skip rate limiting)
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

// Protected routes that require both authentication and email verification (these will skip rate limiting)
router.put('/updateprofile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-profile-image', protect, uploadProfileImage);
router.delete('/profile-image', protect, deleteProfileImage);
router.get('/:userId/stats', getUserStats);

module.exports = router;