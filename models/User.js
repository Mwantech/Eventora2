const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  profileImage: {
    type: String,
    default: function() {
      // Generate default avatar based on name
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.name.replace(/ /g, "")}`;
    }
  },
  // ADD: Field to store Cloudinary public_id for profile images
  profileImagePublicId: {
    type: String,
    default: null
  },
  // ADD: Email verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    select: false // Don't return in queries by default
  },
  emailVerificationCodeExpires: {
    type: Date,
    select: false // Don't return in queries by default
  },
  emailVerificationCodeSentAt: {
    type: Date,
    select: false // Don't return in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// UPDATED: Handle profileImage default value correctly
UserSchema.pre('save', function(next) {
  // Only set default profileImage if it's not already set and this is a new document
  if (this.isNew && !this.profileImage) {
    this.profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.name.replace(/ /g, "")}`;
  }
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification code
UserSchema.methods.generateEmailVerificationCode = function() {
  // Generate 6-digit code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set verification code and expiration (10 minutes from now)
  this.emailVerificationCode = verificationCode;
  this.emailVerificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.emailVerificationCodeSentAt = Date.now();
  
  return verificationCode;
};

// Check if verification code can be sent (10 minutes cooldown)
UserSchema.methods.canSendVerificationCode = function() {
  if (!this.emailVerificationCodeSentAt) {
    return true;
  }
  
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return this.emailVerificationCodeSentAt < tenMinutesAgo;
};

// Verify email verification code
UserSchema.methods.verifyEmailCode = function(code) {
  if (!this.emailVerificationCode || !this.emailVerificationCodeExpires) {
    return false;
  }
  
  // Check if code has expired
  if (Date.now() > this.emailVerificationCodeExpires) {
    return false;
  }
  
  // Check if code matches
  return this.emailVerificationCode === code;
};

// Clear verification code fields
UserSchema.methods.clearVerificationCode = function() {
  this.emailVerificationCode = undefined;
  this.emailVerificationCodeExpires = undefined;
};

module.exports = mongoose.model('User', UserSchema);