// Try different import methods to ensure compatibility
let Feedback;
try {
  Feedback = require('../models/feedback');
} catch (error) {
  console.error('Error importing Feedback model:', error);
  try {
    Feedback = require('../models/Feedback'); // Try with capital F
  } catch (error2) {
    console.error('Error importing Feedback model (capital F):', error2);
  }
}

// Add a check to ensure Feedback is properly imported
if (!Feedback) {
  console.error('Failed to import Feedback model');
}

// Submit feedback (public endpoint)
const submitFeedback = async (req, res) => {
  try {
    // Check if Feedback model is available
    if (!Feedback) {
      console.error('Feedback model not available');
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Model not available'
      });
    }

    const {
      message,
      type = 'general',
      userId,
      userEmail,
      platform,
      appVersion
    } = req.body;

    console.log('Received feedback data:', {
      message: message ? message.substring(0, 50) + '...' : 'No message',
      type,
      userId,
      userEmail,
      platform,
      appVersion
    });

    // Validate required fields
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required'
      });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message must be less than 2000 characters'
      });
    }

    // Validate feedback type
    const validTypes = ['bug', 'feature', 'general'];
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type. Must be one of: bug, feature, general'
      });
    }

    console.log('About to create Feedback instance...');

    // Create feedback - Add more detailed logging
    const feedbackData = {
      message: message.trim(),
      type,
      userId: userId || null,
      userEmail: userEmail || null,
      platform,
      appVersion,
      status: 'new'
    };

    console.log('Creating feedback with data:', feedbackData);

    const feedback = new Feedback(feedbackData);

    console.log('Feedback instance created, saving...');

    await feedback.save();

    console.log('New feedback submitted successfully:', {
      id: feedback._id,
      type: feedback.type,
      userId: feedback.userId,
      platform: feedback.platform
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        id: feedback._id,
        type: feedback.type,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback. Please try again.',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

// Get all feedback (admin endpoint)
const getAllFeedback = async (req, res) => {
  try {
    if (!Feedback) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Model not available'
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      status,
      platform,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email') // Populate user info if available
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get feedback by ID (admin endpoint)
const getFeedbackById = async (req, res) => {
  try {
    if (!Feedback) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Model not available'
      });
    }

    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update feedback status (admin endpoint)
const updateFeedbackStatus = async (req, res) => {
  try {
    if (!Feedback) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Model not available'
      });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['new', 'reviewing', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: new, reviewing, resolved, closed'
      });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get feedback statistics (admin endpoint)
const getFeedbackStats = async (req, res) => {
  try {
    if (!Feedback) {
      return res.status(500).json({
        success: false,
        message: 'Internal server error: Model not available'
      });
    }

    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          },
          byStatus: {
            $push: {
              status: '$status',
              count: 1
            }
          },
          byPlatform: {
            $push: {
              platform: '$platform',
              count: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          total: 1,
          byType: {
            $reduce: {
              input: '$byType',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{ k: '$$this.type', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.type', input: '$$value' } }, 0] }, '$$this.count'] } }]
                    ]
                  }
                ]
              }
            }
          },
          byStatus: {
            $reduce: {
              input: '$byStatus',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{ k: '$$this.status', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.status', input: '$$value' } }, 0] }, '$$this.count'] } }]
                    ]
                  }
                ]
              }
            }
          },
          byPlatform: {
            $reduce: {
              input: '$byPlatform',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{ k: '$$this.platform', v: { $add: [{ $ifNull: [{ $getField: { field: '$$this.platform', input: '$$value' } }, 0] }, '$$this.count'] } }]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      byType: {},
      byStatus: {},
      byPlatform: {}
    };

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedbackStatus,
  getFeedbackStats
};