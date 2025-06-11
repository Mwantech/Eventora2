const Event = require('../models/Events');
const EventParticipant = require('../models/EventParticipant');
const Media = require('../models/Media');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const {
  uploadEventMedia,
  handleCloudinaryError,
  deleteFromCloudinary
} = require('../config/cloudinary');

// Helper function to check if ID is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Only image files are allowed', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// @desc    Upload event image to Cloudinary
// @route   POST /api/events/upload-image
// @access  Private
exports.uploadEventImage = [
  upload.single('eventImage'),
  asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return next(new ErrorResponse('Please upload an image file', 400));
    }

    try {
      // Create a temporary event ID for organizing uploads
      // In a real scenario, you might want to pass the actual event ID
      const tempEventId = `temp_${Date.now()}`;
      
      // Upload to Cloudinary
      const uploadResult = await uploadEventMedia(
        req.file.buffer,
        tempEventId,
        req.user.id,
        'image',
        {
          // Additional options for event cover images
          transformation: [
            {
              width: 800,
              height: 600,
              crop: 'fill',
              quality: 'auto:good',
              fetch_format: 'auto',
            }
          ]
        }
      );

      console.log('Cloudinary upload result:', uploadResult);

      res.status(200).json({
        success: true,
        data: {
          imageUrl: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height
        }
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      return handleCloudinaryError(error, res, 'Failed to upload event image');
    }
  })
];

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add creator to request body
  req.body.creatorId = req.user.id;

  // If coverImage is provided and it's a Cloudinary URL, keep it as is
  // If it's a publicId, we might need to generate the full URL
  if (req.body.coverImage && !req.body.coverImage.startsWith('http')) {
    // Assume it's a public ID and generate the URL
    const { generateOptimizedUrl } = require('../utils/cloudinary');
    req.body.coverImage = generateOptimizedUrl(req.body.coverImage);
  }

  // Create event
  const event = await Event.create(req.body);

  // Add creator as a participant
  await EventParticipant.create({
    eventId: event._id,
    userId: req.user.id,
    role: 'creator',
  });

  res.status(201).json({
    success: true,
    data: await populateEventWithCreatorInfo(event)
  });
});

// @desc    Get all events (public + user's private)
// @route   GET /api/events
// @access  Private
exports.getEvents = asyncHandler(async (req, res, next) => {
  // Find public events and events created by this user
  const events = await Event.find({
    $or: [
      { isPrivate: false },
      { creatorId: req.user.id }
    ]
  }).sort('-createdAt');

  // Populate with creator info
  const populatedEvents = await Promise.all(
    events.map(event => populateEventWithCreatorInfo(event))
  );

  res.status(200).json({
    success: true,
    count: events.length,
    data: populatedEvents
  });
});

// @desc    Get events by user ID (created, joined, or all)
// @route   GET /api/events/user/:userId
// @access  Private
exports.getUserEvents = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { filter = 'all' } = req.query;
  
  // Validate userId
  if (!isValidObjectId(userId)) {
    return next(new ErrorResponse(`Invalid user ID: ${userId}`, 400));
  }
  
  let events = [];
  
  if (filter === 'created' || filter === 'all') {
    // Get events created by the user
    const createdEvents = await Event.find({ creatorId: userId }).sort('-createdAt');
    events = [...events, ...createdEvents];
  }
  
  if (filter === 'joined' || filter === 'all') {
    // Get events joined by the user as a participant
    const joinedEventIds = await EventParticipant.find({ 
      userId,
      role: 'participant'
    }).distinct('eventId');
    
    const joinedEvents = await Event.find({ 
      _id: { $in: joinedEventIds } 
    }).sort('-createdAt');
    
    // If filter is 'all', we need to avoid duplicates
    if (filter === 'all') {
      const createdIds = events.map(e => e._id.toString());
      events = [...events, ...joinedEvents.filter(e => !createdIds.includes(e._id.toString()))];
    } else {
      events = [...events, ...joinedEvents];
    }
  }

  // If filter is 'all', also include public events that the user hasn't created or joined
  if (filter === 'all') {
    // Get all current event IDs to avoid duplicates
    const currentEventIds = events.map(e => e._id.toString());
    
    // Find public events that the user hasn't created or joined
    const publicEvents = await Event.find({
      isPrivate: false,
      _id: { $nin: events.map(e => e._id) }, // Exclude events already in the list
      creatorId: { $ne: userId } // Exclude events created by this user
    }).sort('-createdAt');
    
    // Filter out events where user is already a participant
    const userParticipantEventIds = await EventParticipant.find({ 
      userId 
    }).distinct('eventId');
    
    const filteredPublicEvents = publicEvents.filter(event => 
      !userParticipantEventIds.some(id => id.toString() === event._id.toString())
    );
    
    events = [...events, ...filteredPublicEvents];
  }

  // Remove duplicates based on _id
  const uniqueEvents = events.filter((event, index, self) =>
    index === self.findIndex(e => e._id.toString() === event._id.toString())
  );

  // Sort all events by creation date
  uniqueEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Populate with creator info
  const populatedEvents = await Promise.all(
    uniqueEvents.map(event => populateEventWithCreatorInfo(event))
  );

  res.status(200).json({
    success: true,
    count: populatedEvents.length,
    data: populatedEvents
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public/Private (depends on event privacy)
exports.getEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }
  
  const event = await Event.findById(eventId);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Check if the event is private and user is not authorized
  if (event.isPrivate) {
    // If no user is authenticated, reject access
    if (!req.user) {
      return next(new ErrorResponse(`Authentication required to access this private event`, 401));
    }
    
    // Check if user is the creator
    const isCreator = req.user.id === event.creatorId.toString();
    
    if (!isCreator) {
      // If not creator, check if they're a participant
      const isParticipant = await EventParticipant.findOne({
        eventId: event._id,
        userId: req.user.id
      });
      
      if (!isParticipant) {
        return next(new ErrorResponse(`Not authorized to access this private event`, 403));
      }
    }
  }

  // Get participants with user details
  const participants = await EventParticipant.find({ eventId: event._id })
    .populate('userId', 'name profileImage');

  // Calculate upload counts for each participant
  const participantsWithUploads = await Promise.all(
  participants.map(async (participant) => {
    // Count media uploads by this participant for this event
    const uploadCount = await Media.countDocuments({
      eventId: event._id,
      userId: participant.userId._id
    });

    // Use the actual joinedAt from the EventParticipant document
    // This represents when they actually joined the event
    const joinedAt = participant.joinedAt || participant.createdAt || new Date();

    return {
      ...participant.toObject(),
      uploads: uploadCount,
      joinedAt: joinedAt, // This should be the actual join time
      isCreator: participant.role === 'creator'
    };
  })
);

  // Populate with creator info
  const populatedEvent = await populateEventWithCreatorInfo(event);

  res.status(200).json({
    success: true,
    data: {
      ...populatedEvent,
      participantDetails: participantsWithUploads
    }
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }
  
  let event = await Event.findById(eventId);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Convert both IDs to strings for proper comparison
  const creatorIdStr = event.creatorId.toString();
  const userIdStr = req.user.id.toString();
  
  // Make sure user is event creator (comparing string representations)
  if (creatorIdStr !== userIdStr) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this event`, 403));
  }

  // Validate update data
  const allowedFields = [
    'name', 'date', 'time', 'location', 'description', 
    'isPrivate', 'coverImage'
  ];
  
  // Filter out any fields that shouldn't be updated
  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  // Handle coverImage update - if it's a new Cloudinary URL or publicId
  if (updateData.coverImage) {
    // If it's not already a full URL, assume it's a public ID
    if (!updateData.coverImage.startsWith('http')) {
      const { generateOptimizedUrl } = require('../utils/cloudinary');
      updateData.coverImage = generateOptimizedUrl(updateData.coverImage);
    }
    
    // Optional: Delete old cover image from Cloudinary if it exists
    // This requires storing the public_id in the database
    // if (event.coverImagePublicId) {
    //   await deleteFromCloudinary(event.coverImagePublicId, 'image');
    // }
  }

  // Additional validation for specific fields
  if (updateData.name && updateData.name.trim().length === 0) {
    return next(new ErrorResponse('Event name cannot be empty', 400));
  }

  if (updateData.date && updateData.date.trim().length === 0) {
    return next(new ErrorResponse('Event date cannot be empty', 400));
  }

  // Check if privacy setting is being changed
  const privacyChanged = updateData.hasOwnProperty('isPrivate') && 
                        updateData.isPrivate !== event.isPrivate;

  // If changing from public to private, clear the share link for security
  if (privacyChanged && updateData.isPrivate === true && event.shareLink) {
    updateData.shareLink = null;
  }

  try {
    // Update the event
    event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true
    });

    // If event update failed
    if (!event) {
      return next(new ErrorResponse(`Failed to update event with id of ${eventId}`, 500));
    }

    // Populate with creator info
    const populatedEvent = await populateEventWithCreatorInfo(event);

    res.status(200).json({
      success: true,
      data: populatedEvent
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return next(new ErrorResponse(messages.join(', '), 400));
    }
    
    // Handle other errors
    console.error('Error updating event:', error);
    return next(new ErrorResponse('Failed to update event', 500));
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }
  
  const event = await Event.findById(eventId);

  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Make sure user is event creator
  if (event.creatorId.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this event`, 403));
  }

  // Optional: Clean up Cloudinary images associated with this event
  try {
    const { cleanupUnusedMedia } = require('../utils/cloudinary');
    // Clean up the event folder in Cloudinary
    await cleanupUnusedMedia(`events/${eventId}`);
    console.log(`Cleaned up Cloudinary folder for event ${eventId}`);
  } catch (cleanupError) {
    console.error('Error cleaning up Cloudinary media:', cleanupError);
    // Don't fail the deletion if cleanup fails
  }

  // Delete event and its participants
  await Promise.all([
    event.remove(),
    EventParticipant.deleteMany({ eventId: event._id })
  ]);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join event
// @route   POST /api/events/:id/join
// @access  Private
exports.joinEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Check if already joined
  const existingParticipant = await EventParticipant.findOne({ eventId, userId });
  if (existingParticipant) {
    return next(new ErrorResponse('You have already joined this event', 400));
  }

  // Add as participant
  await EventParticipant.create({ eventId, userId, role: 'participant' });

  // Increment participant count
  event.participants += 1;
  await event.save();

  res.status(200).json({
    success: true,
    data: { message: 'Successfully joined the event' }
  });
});

// @desc    Leave event
// @route   DELETE /api/events/:id/leave
// @access  Private
exports.leaveEvent = asyncHandler(async (req, res, next) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Check if creator is trying to leave
  if (event.creatorId.toString() === userId) {
    return next(new ErrorResponse('Event creator cannot leave the event', 400));
  }

  // Check if participant exists
  const participant = await EventParticipant.findOne({ eventId, userId });
  if (!participant) {
    return next(new ErrorResponse('You are not a participant in this event', 400));
  }

  // Remove participant
  await participant.remove();

  // Decrement participant count
  if (event.participants > 0) {
    event.participants -= 1;
    await event.save();
  }

  res.status(200).json({
    success: true,
    data: { message: 'Successfully left the event' }
  });
});

// @desc    Generate a share link for an event
// @route   POST /api/events/:id/share
// @access  Private (only authenticated users can generate share links)
exports.generateShareLink = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  // Validate ObjectId
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid event ID: ${id}`, 400));
  }
  
  // Find the event
  const event = await Event.findById(id);
  
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${id}`, 404));
  }
  
  // Verify that req.user exists
  if (!req.user) {
    return next(new ErrorResponse(`Authentication required to generate share link`, 401));
  }
  
  // Check if user is authorized to share this event
  // For private events, only creator or participants can share
  if (event.isPrivate) {
    const isCreator = event.creatorId.toString() === req.user.id;
    
    if (!isCreator) {
      // Check if user is a participant
      const isParticipant = await EventParticipant.findOne({
        eventId: event._id,
        userId: req.user.id
      });
      
      if (!isParticipant) {
        return next(new ErrorResponse(`Not authorized to share this private event`, 403));
      }
    }
  }
  
  // Generate a random token for the share link
  const token = crypto.randomBytes(20).toString('hex');
  
  // URL for sharing
  const shareLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/event/${id}/${token}`;
  
  // Save the share link to the event
  event.shareLink = shareLink;
  await event.save();
  
  res.status(200).json({
    success: true,
    data: {
      token: token
    }
  });
});

// @desc    Join event via share link
// @route   POST /api/events/share/:id/:token/join
// @access  Public (no authentication required for shared links)
exports.joinEventViaShareLink = asyncHandler(async (req, res, next) => {
  const { id, token } = req.params;
  
  // Validate id
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid event ID: ${id}`, 400));
  }
  
  // Validate token
  if (!token) {
    return next(new ErrorResponse('Share token is required', 400));
  }
  
  // Find event by share link token
  const event = await Event.findOne({ 
    _id: id,
    shareLink: { $regex: new RegExp(token, 'i') }
  });

  if (!event) {
    return next(new ErrorResponse('Invalid or expired share link', 404));
  }

  // Check if user is authenticated
  if (!req.user) {
    return next(new ErrorResponse('Authentication required to join event', 401));
  }

  const userId = req.user.id;

  // Check if already joined
  const existingParticipant = await EventParticipant.findOne({ 
    eventId: event._id, 
    userId 
  });
  
  if (existingParticipant) {
    return next(new ErrorResponse('You have already joined this event', 400));
  }

  // Check if user is the creator
  if (event.creatorId.toString() === userId) {
    return next(new ErrorResponse('Event creator is already a participant', 400));
  }

  // Add as participant
  await EventParticipant.create({ 
    eventId: event._id, 
    userId, 
    role: 'participant' 
  });

  // Increment participant count
  event.participants += 1;
  await event.save();

  // Populate with creator info
  const populatedEvent = await populateEventWithCreatorInfo(event);

  res.status(200).json({
    success: true,
    data: {
      message: 'Successfully joined the event via share link',
      event: populatedEvent
    }
  });
});

// Update the existing getEventByShareLink method to allow access to private events
// @desc    Get event by share link (Updated to allow private event access)
// @route   GET /api/events/share/:id/:token
// @access  Public
exports.getEventByShareLink = asyncHandler(async (req, res, next) => {
  const { id, token } = req.params;
  
  // Validate id
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid event ID: ${id}`, 400));
  }
  
  // Validate token
  if (!token) {
    return next(new ErrorResponse('Share token is required', 400));
  }
  
  // Find event by share link token - this bypasses privacy settings
  const event = await Event.findOne({ 
    _id: id,
    shareLink: { $regex: new RegExp(token, 'i') }
  });

  if (!event) {
    return next(new ErrorResponse('Invalid or expired share link', 404));
  }

  // Get participants with user details (if user is authenticated)
  let participantDetails = [];
  if (req.user) {
    const participants = await EventParticipant.find({ eventId: event._id })
      .populate('userId', 'name profileImage');

    // Calculate upload counts for each participant
    participantDetails = await Promise.all(
      participants.map(async (participant) => {
        const uploadCount = await Media.countDocuments({
          eventId: event._id,
          userId: participant.userId._id
        });

        return {
          ...participant.toObject(),
          uploads: uploadCount,
          joinedAt: participant.createdAt || new Date(),
          isCreator: participant.role === 'creator'
        };
      })
    );
  }

  // Populate with creator info
  const populatedEvent = await populateEventWithCreatorInfo(event);

  // Add additional info for share link access
  const responseData = {
    ...populatedEvent,
    accessedViaShareLink: true,
    canJoin: req.user ? true : false, // User needs to be authenticated to join
    participantDetails
  };

  res.status(200).json({
    success: true,
    data: responseData
  });
});

// Helper function to populate event with creator info
async function populateEventWithCreatorInfo(event) {
  if (!event) {
    return null;
  }
  
  let creatorInfo = null;
  
  // Check if creatorId exists before finding user
  if (event.creatorId) {
    creatorInfo = await User.findById(event.creatorId).select('name profileImage');
  }
  
  const eventObj = event.toObject ? event.toObject() : event;
  
  return {
    ...eventObj,
    creatorName: creatorInfo ? creatorInfo.name : 'Unknown',
    creatorProfileImage: creatorInfo ? creatorInfo.profileImage : null
  };
}