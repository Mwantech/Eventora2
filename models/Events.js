const mongoose = require('mongoose');
const QRCode = require('qrcode');
const crypto = require('crypto');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an event name'],
    trim: true,
    maxlength: [100, 'Event name cannot be more than 100 characters']
  },
  date: {
    type: String,
    required: [true, 'Please provide an event date']
  },
  time: {
    type: String
  },
  location: {
    type: String
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  coverImage: {
    type: String
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: {
    type: Number,
    default: 1
  },
  shareLink: {
    type: String,
    unique: true
  },
  qrCodeUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique share link and QR code before saving
EventSchema.pre('save', async function(next) {
  if (!this.shareLink) {
    // Generate a unique share link with a random string
    const randomString = crypto.randomBytes(8).toString('hex');
    this.shareLink = `${process.env.CLIENT_URL || ''}/event/${this._id}/${randomString}`;
    
    // Generate QR code for the share link
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(this.shareLink);
      this.qrCodeUrl = qrCodeDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);