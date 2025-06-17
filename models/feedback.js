const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'general'],
    default: 'general'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  userEmail: {
    type: String,
    required: false
  },
  platform: {
    type: String,
    enum: ['ios', 'android', 'web'],
    required: false
  },
  appVersion: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'resolved', 'closed'],
    default: 'new'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date,
    required: false
  },
  adminNotes: {
    type: String,
    required: false
  }
});

// Make sure you're exporting the model correctly
module.exports = mongoose.model('Feedback', feedbackSchema);