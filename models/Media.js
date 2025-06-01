const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  filepath: {
    type: String,
    required: [true, 'File path is required']
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [500, 'Caption cannot be more than 500 characters']
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create an index for faster queries on eventId
MediaSchema.index({ eventId: 1 });

// Create an index for faster queries on userId
MediaSchema.index({ userId: 1 });

// Add a virtual for public URL
MediaSchema.virtual('url').get(function() {
  return `/uploads/media/${this.filename}`;
});

// Ensure virtuals are included when document is converted to JSON
MediaSchema.set('toJSON', { virtuals: true });
MediaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Media', MediaSchema);