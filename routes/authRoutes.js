const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  updateProfile,
  uploadProfileImage,
  getUserStats,
  changePassword,
  logout 
} = require('../controllers/AuthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - require authentication
router.use(protect); // Apply protection to all routes below

router.get('/logout', logout);
router.get('/me', getMe);
router.put('/updateprofile', updateProfile);

router.put('/change-password', protect, changePassword);
router.post('/upload-profile-image', uploadProfileImage);
router.get('/:userId/stats', getUserStats);

module.exports = router;