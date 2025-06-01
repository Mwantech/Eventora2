const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :eventId from parent routes
const {
  uploadMedia,
  getEventMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
  toggleLikeMedia
} = require('../controllers/MediaController');
const { protect } = require('../middleware/authMiddleware');

// Upload media to a specific event
router.post('/events/:eventId/media', protect, uploadMedia);

// Get all media for a specific event
router.get('/events/:eventId/media', protect, getEventMedia);

// Get a specific media item by ID
router.get('/media/:id', protect, getMediaById);

// Update media caption or tags (only uploader should be able to do this)
router.put('/media/:id', protect, updateMedia);


router.delete('/media/:id', protect, deleteMedia);

router.post('/media/:id/like', protect, toggleLikeMedia);

module.exports = router;
