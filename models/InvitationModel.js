const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  inviterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviteeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better performance
InvitationSchema.index({ eventId: 1, inviteeId: 1 });
InvitationSchema.index({ inviterId: 1 });
InvitationSchema.index({ inviteeId: 1 });
InvitationSchema.index({ status: 1 });

// IMPORTANT: Make sure you export using mongoose.model()
module.exports = mongoose.model('Invitation', InvitationSchema);