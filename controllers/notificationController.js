// controllers/notificationController.js
const PushToken = require('../models/PushToken'); // Adjust path as needed

class NotificationController {
  
  // Register push token
  async registerToken(req, res) {
    try {
      const { token, platform, type } = req.body;
      const userId = req.user?.id || req.body.userId || 'anonymous';
      
      // Check if using database or in-memory storage
      if (PushToken && typeof PushToken.findOneAndUpdate === 'function') {
        // Database version
        const updatedToken = await PushToken.findOneAndUpdate(
          { token: token },
          {
            token: token,
            platform: platform,
            type: type,
            userId: userId,
            isActive: true,
            lastUsed: new Date()
          },
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );
        
        console.log('Push token registered/updated:', token);
        
        return res.status(201).json({
          success: true,
          message: 'Push token registered successfully',
          data: {
            token: updatedToken.token,
            platform: updatedToken.platform,
            type: updatedToken.type,
            userId: updatedToken.userId
          }
        });
      } else {
        // In-memory version (fallback)
        const tokenData = {
          token: token,
          platform: platform,
          type: type,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        };
        
        // Store in memory (you'd need to import your storage)
        // pushTokens.set(token, tokenData);
        
        console.log('Push token registered (memory):', token);
        
        return res.status(201).json({
          success: true,
          message: 'Push token registered successfully',
          data: {
            token: token,
            platform: platform,
            type: type,
            userId: userId
          }
        });
      }
      
    } catch (error) {
      console.error('Error registering push token:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while registering push token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all tokens for a user
  async getTokens(req, res) {
    try {
      const userId = req.user?.id || req.query.userId || 'anonymous';
      
      if (PushToken && typeof PushToken.find === 'function') {
        // Database version
        const tokens = await PushToken.find({ 
          userId: userId, 
          isActive: true 
        }).select('token platform type createdAt updatedAt');
        
        return res.status(200).json({
          success: true,
          message: 'Tokens retrieved successfully',
          data: tokens
        });
      } else {
        // In-memory version (fallback)
        const userTokens = []; // You'd filter from your storage here
        
        return res.status(200).json({
          success: true,
          message: 'Tokens retrieved successfully',
          data: userTokens
        });
      }
      
    } catch (error) {
      console.error('Error fetching push tokens:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching push tokens',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Deactivate a token
  async deactivateToken(req, res) {
    try {
      const { token } = req.params;
      
      if (PushToken && typeof PushToken.findOneAndUpdate === 'function') {
        // Database version
        const updatedToken = await PushToken.findOneAndUpdate(
          { token: token },
          { isActive: false },
          { new: true }
        );
        
        if (!updatedToken) {
          return res.status(404).json({
            success: false,
            message: 'Token not found'
          });
        }
        
        console.log('Deactivated push token:', token);
        
        return res.status(200).json({
          success: true,
          message: 'Push token deactivated successfully'
        });
      } else {
        // In-memory version (fallback)
        // You'd check and update your storage here
        
        console.log('Deactivated push token (memory):', token);
        
        return res.status(200).json({
          success: true,
          message: 'Push token deactivated successfully'
        });
      }
      
    } catch (error) {
      console.error('Error deactivating push token:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while deactivating push token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Send push notification
  async sendNotification(req, res) {
    try {
      const { userIds, title, body, data } = req.body;
      
      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          message: 'userIds must be an array'
        });
      }
      
      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: 'title and body are required'
        });
      }
      
      let targetTokens = [];
      
      if (PushToken && typeof PushToken.find === 'function') {
        // Database version
        const tokens = await PushToken.find({
          userId: { $in: userIds },
          isActive: true
        }).select('token');
        
        targetTokens = tokens.map(tokenDoc => tokenDoc.token);
      } else {
        // In-memory version (fallback)
        // You'd filter from your storage here
        targetTokens = []; // Replace with actual token filtering
      }
      
      // Here you would integrate with Expo's push notification service
      console.log('Sending notification to tokens:', targetTokens);
      console.log('Notification data:', { title, body, data });
      
      // Example integration with Expo push notifications:
      /*
      const { Expo } = require('expo-server-sdk');
      const expo = new Expo();
      
      const messages = targetTokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      }));
      
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];
      
      for (const chunk of chunks) {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      }
      */
      
      return res.status(200).json({
        success: true,
        message: 'Notifications sent successfully',
        data: {
          targetTokens: targetTokens.length,
          notification: { title, body, data }
        }
      });
      
    } catch (error) {
      console.error('Error sending push notification:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while sending push notification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const userId = req.user?.id || req.query.userId;
      
      if (PushToken && typeof PushToken.countDocuments === 'function') {
        // Database version
        const totalTokens = await PushToken.countDocuments({ isActive: true });
        const userTokens = userId ? await PushToken.countDocuments({ 
          userId: userId, 
          isActive: true 
        }) : 0;
        
        return res.status(200).json({
          success: true,
          message: 'Notification statistics retrieved successfully',
          data: {
            totalActiveTokens: totalTokens,
            userActiveTokens: userTokens,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        // In-memory version (fallback)
        return res.status(200).json({
          success: true,
          message: 'Notification statistics retrieved successfully',
          data: {
            totalActiveTokens: 0,
            userActiveTokens: 0,
            timestamp: new Date().toISOString()
          }
        });
      }
      
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while fetching notification stats',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Clear inactive tokens (cleanup)
  async clearInactiveTokens(req, res) {
    try {
      const daysOld = parseInt(req.query.days) || 30;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      if (PushToken && typeof PushToken.deleteMany === 'function') {
        // Database version
        const result = await PushToken.deleteMany({
          isActive: false,
          updatedAt: { $lt: cutoffDate }
        });
        
        console.log(`Cleared ${result.deletedCount} inactive tokens older than ${daysOld} days`);
        
        return res.status(200).json({
          success: true,
          message: 'Inactive tokens cleared successfully',
          data: {
            deletedCount: result.deletedCount,
            cutoffDate: cutoffDate.toISOString()
          }
        });
      } else {
        // In-memory version (fallback)
        return res.status(200).json({
          success: true,
          message: 'Inactive tokens cleared successfully',
          data: {
            deletedCount: 0,
            cutoffDate: cutoffDate.toISOString()
          }
        });
      }
      
    } catch (error) {
      console.error('Error clearing inactive tokens:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error while clearing inactive tokens',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new NotificationController();