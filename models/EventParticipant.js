const mongoose = require('mongoose');

const EventParticipantSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['creator', 'participant'],
    default: 'participant'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a user can only join an event once
EventParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('EventParticipant', EventParticipantSchema);