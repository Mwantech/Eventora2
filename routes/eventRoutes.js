const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  joinEvent,
  leaveEvent,
  getEventByShareLink,
  generateShareLink,
  joinEventViaShareLink,
  uploadEventImage
} = require('../controllers/EventController');

const router = express.Router();

// Protect middleware
const { protect } = require('../middleware/authMiddleware');

// Image upload route - should be placed before other routes to avoid conflicts
router.route('/upload-image')
  .post(protect, uploadEventImage);

// Routes
router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.route('/user/:userId')
  .get(protect, getUserEvents);

// Share link routes - GET doesn't need auth, but JOIN does
router.route('/share/:id/:token')
  .get(getEventByShareLink);

router.route('/share/:id/:token/join')
  .post(protect, joinEventViaShareLink);  // ADD protect middleware here

router.route('/:id/share')
  .post(protect, generateShareLink);
 
router.route('/:id')
  .get(protect, getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route('/:id/join')
  .post(protect, joinEvent);

router.route('/:id/leave')
  .delete(protect, leaveEvent);

module.exports = router;