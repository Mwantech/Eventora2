const express = require('express');
const {
    getAvailableUsers,
  sendInvitation,
  getReceivedInvitations,
  getSentInvitations,
  getInvitation,
  acceptInvitation,
  declineInvitation,
  cancelInvitation,
  getEventInvitationStats
} = require('../controllers/InvitationController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// User search for invitations
router.get('/available-users', getAvailableUsers);

// Invitation management
router.post('/', sendInvitation);
router.get('/received', getReceivedInvitations);
router.get('/sent', getSentInvitations);

// Individual invitation actions
router.get('/:id', getInvitation);
router.put('/:id/accept', acceptInvitation);
router.put('/:id/decline', declineInvitation);
router.delete('/:id', cancelInvitation);

// Event invitation statistics
router.get('/event/:eventId/stats', getEventInvitationStats);

module.exports = router;