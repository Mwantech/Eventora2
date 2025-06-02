const User = require('../models/User');
const Event = require('../models/Events');
const Media = require('../models/Media');

// Middleware to check API key for protected routes
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== process.env.ANALYTICS_API_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Invalid API key'
    });
  }
  
  next();
};

// @desc    Get comprehensive analytics data
// @route   GET /api/analytics/dashboard
// @access  Protected (API Key required)
const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalMedia = await Media.countDocuments();

    // Get users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get events created in the last 30 days
    const newEventsLast30Days = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get media uploaded in the last 30 days
    const newMediaLast30Days = await Media.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get public vs private events
    const publicEvents = await Event.countDocuments({ isPrivate: false });
    const privateEvents = await Event.countDocuments({ isPrivate: true });

    // Get media type breakdown
    const imageCount = await Media.countDocuments({ type: 'image' });
    const videoCount = await Media.countDocuments({ type: 'video' });

    // Get total likes across all media
    const totalLikesResult = await Media.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);
    const totalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;

    // Get average participants per event
    const avgParticipantsResult = await Event.aggregate([
      { $group: { _id: null, avgParticipants: { $avg: '$participants' } } }
    ]);
    const avgParticipants = avgParticipantsResult.length > 0 ? 
      Math.round(avgParticipantsResult[0].avgParticipants * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalMedia,
          totalLikes
        },
        growth: {
          newUsersLast30Days,
          newEventsLast30Days,
          newMediaLast30Days
        },
        breakdown: {
          events: {
            public: publicEvents,
            private: privateEvents
          },
          media: {
            images: imageCount,
            videos: videoCount
          }
        },
        engagement: {
          totalLikes,
          avgParticipantsPerEvent: avgParticipants
        },
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics data'
    });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/users
// @access  Protected (API Key required)
const getUserAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Get user registration trends (last 12 months)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sixMonthsAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        recentUsers,
        trends: userTrends,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user analytics'
    });
  }
};

// @desc    Get media analytics
// @route   GET /api/analytics/media
// @access  Protected (API Key required)
const getMediaAnalytics = async (req, res) => {
  try {
    const totalMedia = await Media.countDocuments();
    
    // Get media by type
    const mediaByType = await Media.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalLikes: { $sum: '$likes' }
        }
      }
    ]);

    // Get top liked media
    const topLikedMedia = await Media.find()
      .sort({ likes: -1 })
      .limit(10)
      .select('filename type likes caption eventId userId')
      .populate('eventId', 'name')
      .populate('userId', 'name');

    // Get media upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const uploadTrends = await Media.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Get total likes
    const totalLikesResult = await Media.aggregate([
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } }
    ]);
    const totalLikes = totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0;

    res.status(200).json({
      success: true,
      data: {
        totalMedia,
        totalLikes,
        mediaByType,
        topLikedMedia,
        uploadTrends,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Media analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching media analytics'
    });
  }
};

// @desc    Get public user count (for public display)
// @route   GET /api/analytics/public/users
// @access  Public
const getPublicUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Optional: Add some growth metrics for public display
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        message: `Join ${totalUsers.toLocaleString()}+ users on our platform!`,
        growth: {
          newThisWeek: newUsersThisWeek
        },
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Public user count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user count'
    });
  }
};

module.exports = {
  checkApiKey,
  getDashboardAnalytics,
  getUserAnalytics,
  getMediaAnalytics,
  getPublicUserCount
};