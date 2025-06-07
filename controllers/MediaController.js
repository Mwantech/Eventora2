const Media = require('../models/Media');
const Event = require('../models/Events');
const EventParticipant = require('../models/EventParticipant');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const multer = require('multer');
const mongoose = require('mongoose');
const {
  uploadImage,
  uploadVideo,
  uploadEventMedia,
  deleteFromCloudinary,
  handleCloudinaryError
} = require('../config/cloudinary');

// Helper function to check if ID is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to validate media types
const fileFilter = (req, file, cb) => {
  // Accept only images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Not a supported file format. Please upload images or videos only.'), false);
  }
};

// Initialize multer upload with memory storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit (increased for videos)
  }
});

// Helper to check if user has access to event
const checkEventAccess = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  
  if (!event) {
    throw new ErrorResponse(`Event not found with id of ${eventId}`, 404);
  }
  
  // If event is public, allow access
  if (!event.isPrivate) {
    return { event, hasAccess: true };
  }
  
  // If user is the creator, allow access
  if (event.creatorId.toString() === userId) {
    return { event, hasAccess: true };
  }
  
  // If user is a participant, allow access
  const isParticipant = await EventParticipant.findOne({
    eventId,
    userId
  });
  
  if (isParticipant) {
    return { event, hasAccess: true };
  }
  
  return { event, hasAccess: false };
};

// Helper to populate media with uploader info
const populateMediaWithUploaderInfo = async (media) => {
  if (!media) {
    return null;
  }
  
  const mediaObj = media.toObject ? media.toObject() : media;
  
  try {
    if (mediaObj.userId) {
      const user = await User.findById(mediaObj.userId).select('name profileImage');
      if (user) {
        return {
          ...mediaObj,
          uploadedBy: user.name,
          uploaderProfileImage: user.profileImage
        };
      }
    }
  } catch (err) {
    console.error(`Error populating media uploader info: ${err.message}`);
  }
  
  return {
    ...mediaObj,
    uploadedBy: 'Unknown User',
    uploaderProfileImage: null
  };
};

// @desc    Upload media to an event
// @route   POST /api/events/:eventId/media
// @access  Private
exports.uploadMedia = asyncHandler(async (req, res, next) => {
  // Use multer upload middleware
  const uploadMiddleware = upload.array('files', 10); // Max 10 files at once
  
  uploadMiddleware(req, res, async function(err) {
    if (err) {
      // Handle multer errors
      return next(new ErrorResponse(err.message, 400));
    }
    
    const { eventId } = req.params;
    const userId = req.user.id;
    
    if (!isValidObjectId(eventId)) {
      return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
    }
    
    try {
      // Check if user has access to this event
      const { event, hasAccess } = await checkEventAccess(eventId, userId);
      
      if (!hasAccess) {
        return next(new ErrorResponse(`Not authorized to upload media to this event`, 403));
      }
      
      if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('Please upload at least one file', 400));
      }
      
      // Get caption and tags from request body
      const { caption, tags } = req.body;
      
      // Process tags (convert comma-separated string to array if needed)
      let parsedTags = [];
      if (tags) {
        try {
          if (typeof tags === 'string') {
            // If it's a comma-separated string
            parsedTags = tags.split(',').map(tag => tag.trim());
          } else if (Array.isArray(tags)) {
            // If it's already an array
            parsedTags = tags.map(tag => tag.toString().trim());
          }
          // Filter out empty tags
          parsedTags = parsedTags.filter(tag => tag.length > 0);
        } catch (e) {
          console.error('Error parsing tags:', e);
        }
      }
      
      // Upload files to Cloudinary and create media records
      const uploadPromises = req.files.map(async (file) => {
        // Determine media type based on mimetype
        const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        try {
          // Upload to Cloudinary based on type
          let cloudinaryResult;
          if (type === 'image') {
            cloudinaryResult = await uploadEventMedia(
              file.buffer,
              eventId,
              userId,
              'image'
            );
          } else {
            cloudinaryResult = await uploadEventMedia(
              file.buffer,
              eventId,
              userId,
              'video'
            );
          }
          
          // Create media record with Cloudinary data
          const media = await Media.create({
            eventId,
            userId,
            type,
            filename: cloudinaryResult.public_id,
            filepath: cloudinaryResult.secure_url,
            cloudinaryPublicId: cloudinaryResult.public_id,
            cloudinaryUrl: cloudinaryResult.secure_url,
            caption: caption || '',
            tags: parsedTags,
            likes: 0
          });
          
          return media;
        } catch (uploadError) {
          console.error('Error uploading to Cloudinary:', uploadError);
          throw new ErrorResponse(`Failed to upload ${file.originalname}: ${uploadError.message}`, 500);
        }
      });
      
      // Wait for all media to be uploaded and created
      const mediaRecords = await Promise.all(uploadPromises);
      
      // Populate uploader info for each media
      const populatedMedia = await Promise.all(
        mediaRecords.map(media => populateMediaWithUploaderInfo(media))
      );
      
      res.status(201).json({
        success: true,
        count: mediaRecords.length,
        data: populatedMedia
      });
    } catch (error) {
      // If it's a Cloudinary error, use the specific error handler
      if (error.name === 'Error' && error.http_code) {
        return handleCloudinaryError(error, res, 'Failed to upload media');
      }
      next(error);
    }
  });
});

// @desc    Get all media for an event
// @route   GET /api/events/:eventId/media
// @access  Private (for private events) / Public (for public events)
exports.getEventMedia = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const { filter, sort = 'newest' } = req.query;
  
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }
  
  const event = await Event.findById(eventId);
  
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }
  
  // Check access for private events
  if (event.isPrivate) {
    // If no user is authenticated, reject access
    if (!req.user) {
      return next(new ErrorResponse(`Authentication required to access media for this private event`, 401));
    }
    
    // Check if user has access
    const { hasAccess } = await checkEventAccess(eventId, req.user.id);
    
    if (!hasAccess) {
      return next(new ErrorResponse(`Not authorized to access media for this private event`, 403));
    }
  }
  
  // Build query
  const query = { eventId };
  
  // Apply filter
  if (filter === 'images') {
    query.type = 'image';
  } else if (filter === 'videos') {
    query.type = 'video';
  }
  
  // Apply sorting
  let sortOption = {};
  if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sort === 'popular') {
    sortOption = { likes: -1 };
  }
  
  // Execute query
  const media = await Media.find(query).sort(sortOption);
  
  // Populate with uploader info
  const populatedMedia = await Promise.all(
    media.map(item => populateMediaWithUploaderInfo(item))
  );
  
  res.status(200).json({
    success: true,
    count: populatedMedia.length,
    data: populatedMedia
  });
});

// @desc    Get single media item
// @route   GET /api/media/:id
// @access  Private (for private events) / Public (for public events)
exports.getMediaById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid media ID: ${id}`, 400));
  }
  
  const media = await Media.findById(id);
  
  if (!media) {
    return next(new ErrorResponse(`Media not found with id of ${id}`, 404));
  }
  
  // Check if the media belongs to a private event
  const event = await Event.findById(media.eventId);
  
  if (!event) {
    return next(new ErrorResponse(`Associated event not found`, 404));
  }
  
  // Check access for private events
  if (event.isPrivate) {
    // If no user is authenticated, reject access
    if (!req.user) {
      return next(new ErrorResponse(`Authentication required to access this media`, 401));
    }
    
    // Check if user has access
    const { hasAccess } = await checkEventAccess(media.eventId, req.user.id);
    
    if (!hasAccess) {
      return next(new ErrorResponse(`Not authorized to access this media`, 403));
    }
  }
  
  // Populate with uploader info
  const populatedMedia = await populateMediaWithUploaderInfo(media);
  
  res.status(200).json({
    success: true,
    data: populatedMedia
  });
});

// @desc    Update media (caption, tags)
// @route   PUT /api/media/:id
// @access  Private (only uploader can update)
exports.updateMedia = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid media ID: ${id}`, 400));
  }
  
  let media = await Media.findById(id);
  
  if (!media) {
    return next(new ErrorResponse(`Media not found with id of ${id}`, 404));
  }
  
  // Check if user is the uploader
  if (media.userId.toString() !== userId) {
    return next(new ErrorResponse(`User not authorized to update this media`, 403));
  }
  
  // Only allow updating caption and tags
  const { caption, tags } = req.body;
  const updateData = {};
  
  if (caption !== undefined) {
    updateData.caption = caption;
  }
  
  if (tags !== undefined) {
    // Process tags (convert comma-separated string to array if needed)
    let parsedTags = [];
    try {
      if (typeof tags === 'string') {
        // If it's a comma-separated string
        parsedTags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        // If it's already an array
        parsedTags = tags.map(tag => tag.toString().trim());
      }
      // Filter out empty tags
      updateData.tags = parsedTags.filter(tag => tag.length > 0);
    } catch (e) {
      console.error('Error parsing tags:', e);
      updateData.tags = [];
    }
  }
  
  // Update media
  media = await Media.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
  
  // Populate with uploader info
  const populatedMedia = await populateMediaWithUploaderInfo(media);
  
  res.status(200).json({
    success: true,
    data: populatedMedia
  });
});

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private (only uploader or event creator can delete)
exports.deleteMedia = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid media ID: ${id}`, 400));
  }
  
  const media = await Media.findById(id);
  
  if (!media) {
    return next(new ErrorResponse(`Media not found with id of ${id}`, 404));
  }
  
  // Check if media exists in the event
  const event = await Event.findById(media.eventId);
  
  if (!event) {
    return next(new ErrorResponse(`Associated event not found`, 404));
  }
  
  // Allow deletion if user is media uploader or event creator
  const isUploader = media.userId.toString() === userId;
  const isEventCreator = event.creatorId.toString() === userId;
  
  if (!isUploader && !isEventCreator) {
    return next(new ErrorResponse(`User not authorized to delete this media`, 403));
  }
  
  // Delete from Cloudinary if we have a public ID
  if (media.cloudinaryPublicId || media.filename) {
    try {
      const publicId = media.cloudinaryPublicId || media.filename;
      const resourceType = media.type === 'video' ? 'video' : 'image';
      
      const deleteResult = await deleteFromCloudinary(publicId, resourceType);
      
      if (!deleteResult.success) {
        console.warn(`Warning: Could not delete media from Cloudinary: ${deleteResult.error}`);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    } catch (err) {
      console.error(`Error deleting media from Cloudinary:`, err);
      // Continue with database deletion even if Cloudinary deletion fails
    }
  }
  
  // Delete media record
  await media.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Like or unlike media
// @route   POST /api/media/:id/like
// @access  Private
exports.toggleLikeMedia = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  
  if (!isValidObjectId(id)) {
    return next(new ErrorResponse(`Invalid media ID: ${id}`, 400));
  }
  
  const media = await Media.findById(id);
  
  if (!media) {
    return next(new ErrorResponse(`Media not found with id of ${id}`, 404));
  }
  
  // Check if user has access to the event
  const { hasAccess } = await checkEventAccess(media.eventId, userId);
  
  if (!hasAccess) {
    return next(new ErrorResponse(`Not authorized to interact with this media`, 403));
  }
  
  // Fix: Use new keyword with ObjectId constructor
  const userIdObj = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = media.likedBy.some(id => id.equals(userIdObj));
  
  if (alreadyLiked) {
    // Unlike: Remove user from likedBy array and decrement likes count
    media.likedBy = media.likedBy.filter(id => !id.equals(userIdObj));
    if (media.likes > 0) {
      media.likes -= 1;
    }
  } else {
    // Like: Add user to likedBy array and increment likes count
    media.likedBy.push(userIdObj);
    media.likes += 1;
  }
  
  await media.save();
  
  // Populate with uploader info
  const populatedMedia = await populateMediaWithUploaderInfo(media);
  
  res.status(200).json({
    success: true,
    data: populatedMedia,
    message: alreadyLiked ? 'Media unliked' : 'Media liked'
  });
});