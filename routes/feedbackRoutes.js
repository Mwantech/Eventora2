const express = require('express');
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackStats
} = require('../controllers/FeedbackController'); // Adjust path as needed


// PUBLIC ROUTES

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback (public endpoint)
 * @access  Public
 * @body    { message, type?, userId?, userEmail?, platform?, appVersion? }
 */
router.post('/', submitFeedback);

// ADMIN ROUTES (protected)

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback with pagination and filtering
 * @access  Admin only
 * @query   page?, limit?, type?, status?, platform?, sortBy?, sortOrder?
 */
router.get('/',  getAllFeedback);

/**
 * @route   GET /api/feedback/stats
 * @desc    Get feedback statistics
 * @access  Admin only
 */
router.get('/stats',  getFeedbackStats);

/**
 * @route   GET /api/feedback/:id
 * @desc    Get feedback by ID
 * @access  Admin only
 */
router.get('/:id',  getFeedbackById);

/**
 * @route   PUT /api/feedback/:id/status
 * @desc    Update feedback status
 * @access  Admin only
 * @body    { status, adminNotes? }
 */
router.put('/:id/status', updateFeedbackStatus);

module.exports = router;