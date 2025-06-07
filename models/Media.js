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
  // Cloudinary specific fields
  cloudinaryPublicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  cloudinaryUrl: {
    type: String,
    required: [true, 'Cloudinary URL is required']
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

// Create an index for cloudinaryPublicId for faster deletion queries
MediaSchema.index({ cloudinaryPublicId: 1 });

// Add a virtual for public URL (returns Cloudinary URL)
MediaSchema.virtual('url').get(function() {
  return this.cloudinaryUrl || this.filepath;
});

// Ensure virtuals are included when document is converted to JSON
MediaSchema.set('toJSON', { virtuals: true });
MediaSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure cloudinaryPublicId is set from filename if not provided
MediaSchema.pre('save', function(next) {
  if (!this.cloudinaryPublicId && this.filename) {
    this.cloudinaryPublicId = this.filename;
  }
  next();
});

module.exports = mongoose.model('Media', MediaSchema);