const express = require('express');
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
const { requireEmailVerification } = require('../middleware/emailVerification');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationCode);

// Protected routes that require authentication only
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

// Protected routes that require both authentication and email verification
router.put('/updateprofile', protect, requireEmailVerification, updateProfile);
router.put('/change-password', protect, requireEmailVerification, changePassword);
router.post('/upload-profile-image', protect, requireEmailVerification, uploadProfileImage);
router.delete('/profile-image', protect, requireEmailVerification, deleteProfileImage);
router.get('/:userId/stats', getUserStats);

module.exports = router;