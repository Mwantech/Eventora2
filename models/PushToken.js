// models/PushToken.js
const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['ios', 'android', 'web'],
    lowercase: true
  },
  type: {
    type: String,
    required: true,
    enum: ['expo', 'fcm', 'apns'],
    lowercase: true,
    default: 'expo'
  },
  userId: {
    type: String,
    required: true,
    index: true,
    default: 'anonymous'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  deviceInfo: {
    deviceId: String,
    deviceName: String,
    osVersion: String,
    appVersion: String
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'push_tokens'
});

// Indexes for better query performance
pushTokenSchema.index({ userId: 1, isActive: 1 });
pushTokenSchema.index({ token: 1, isActive: 1 });
pushTokenSchema.index({ platform: 1, type: 1 });
pushTokenSchema.index({ lastUsed: 1 });
pushTokenSchema.index({ updatedAt: 1 }); // For cleanup operations

// Pre-save middleware to update lastUsed
pushTokenSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive) {
    this.lastUsed = new Date();
  }
  next();
});

// Pre-update middleware to update lastUsed when token is updated
pushTokenSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.isActive === true || update.$set?.isActive === true) {
    this.set({ lastUsed: new Date() });
  }
  next();
});

// Static methods for common operations
pushTokenSchema.statics = {
  // Find active tokens for specific users
  async findActiveTokensByUsers(userIds) {
    return this.find({
      userId: { $in: userIds },
      isActive: true
    }).select('token platform type userId');
  },

  // Find active tokens by platform
  async findActiveTokensByPlatform(platform) {
    return this.find({
      platform: platform,
      isActive: true
    }).select('token userId');
  },

  // Get token statistics
  async getTokenStats() {
    const stats = await this.aggregate([
      {
        $group: {
          _id: {
            platform: '$platform',
            type: '$type',
            isActive: '$isActive'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          platformStats: {
            $push: {
              platform: '$_id.platform',
              type: '$_id.type',
              isActive: '$_id.isActive',
              count: '$count'
            }
          },
          totalTokens: { $sum: '$count' }
        }
      }
    ]);

    return stats[0] || { platformStats: [], totalTokens: 0 };
  },

  // Clean up inactive tokens older than specified days
  async cleanupInactiveTokens(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.deleteMany({
      isActive: false,
      updatedAt: { $lt: cutoffDate }
    });
  },

  // Deactivate tokens that haven't been used in X days
  async deactivateOldTokens(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.updateMany(
      {
        lastUsed: { $lt: cutoffDate },
        isActive: true
      },
      {
        isActive: false
      }
    );
  }
};

// Instance methods
pushTokenSchema.methods = {
  // Mark token as used
  async markAsUsed() {
    this.lastUsed = new Date();
    this.isActive = true;
    return this.save();
  },

  // Deactivate token
  async deactivate() {
    this.isActive = false;
    return this.save();
  },

  // Update device info
  async updateDeviceInfo(deviceInfo) {
    this.deviceInfo = { ...this.deviceInfo, ...deviceInfo };
    this.lastUsed = new Date();
    return this.save();
  }
};

// Virtual for token age in days
pushTokenSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last use
pushTokenSchema.virtual('daysSinceLastUse').get(function() {
  return Math.floor((new Date() - this.lastUsed) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON output
pushTokenSchema.set('toJSON', { virtuals: true });
pushTokenSchema.set('toObject', { virtuals: true });

// Export the model
module.exports = mongoose.model('PushToken', pushTokenSchema);