const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require('http-status-codes');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Force HTTPS URLs
});

// Verify Cloudinary configuration on startup
const verifyCloudinaryConfig = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
    console.error('Please check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    return false;
  }
};

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto', // Automatically detect file type
      quality: 'auto', // Automatic quality optimization
      fetch_format: 'auto', // Automatic format optimization
      ...options, // Allow custom options to override defaults
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(buffer);
  });
};

// Upload image with optimizations
const uploadImage = async (buffer, options = {}) => {
  const imageOptions = {
    resource_type: 'image',
    transformation: [
      {
        quality: 'auto:good', // Good quality with automatic optimization
        fetch_format: 'auto', // Convert to WebP/AVIF when supported
        flags: 'progressive', // Progressive JPEG loading
      }
    ],
    ...options,
  };

  return await uploadToCloudinary(buffer, imageOptions);
};

// Upload video with optimizations
const uploadVideo = async (buffer, options = {}) => {
  const videoOptions = {
    resource_type: 'video',
    quality: 'auto', // Automatic video quality
    format: 'mp4', // Ensure MP4 format for compatibility
    transformation: [
      {
        quality: 'auto:good',
        format: 'mp4',
      }
    ],
    ...options,
  };

  return await uploadToCloudinary(buffer, videoOptions);
};

// Upload profile image with specific transformations
const uploadProfileImage = async (buffer, userId, options = {}) => {
  const profileOptions = {
    resource_type: 'image',
    folder: 'profiles', // Organize in profiles folder
    public_id: `profile_${userId}_${Date.now()}`, // Unique ID for profile
    transformation: [
      {
        width: 400,
        height: 400,
        crop: 'fill', // Crop to square
        gravity: 'face', // Focus on face if detected
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    overwrite: true, // Allow overwriting existing profile images
    ...options,
  };

  return await uploadToCloudinary(buffer, profileOptions);
};

// Upload event media with folder organization
const uploadEventMedia = async (buffer, eventId, userId, mediaType = 'auto', options = {}) => {
  const eventMediaOptions = {
    resource_type: mediaType,
    folder: `events/${eventId}`, // Organize by event ID
    public_id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    transformation: mediaType === 'image' ? [
      {
        quality: 'auto:good',
        fetch_format: 'auto',
        flags: 'progressive',
      }
    ] : mediaType === 'video' ? [
      {
        quality: 'auto:good',
        format: 'mp4',
      }
    ] : undefined,
    ...options,
  };

  return await uploadToCloudinary(buffer, eventMediaOptions);
};

// Delete media from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    if (result.result === 'ok') {
      console.log(`✅ Successfully deleted ${publicId} from Cloudinary`);
      return { success: true, result };
    } else {
      console.warn(`⚠️ Cloudinary deletion result: ${result.result} for ${publicId}`);
      return { success: false, result };
    }
  } catch (error) {
    console.error(`❌ Error deleting ${publicId} from Cloudinary:`, error);
    return { success: false, error: error.message };
  }
};

// Delete multiple media files
const deleteMultipleFromCloudinary = async (publicIds, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });
    
    console.log(`✅ Bulk deletion result:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Error in bulk deletion:`, error);
    return { success: false, error: error.message };
  }
};

// Generate optimized URL for existing media
const generateOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
};

// Generate thumbnail URL
const generateThumbnailUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: 300,
        height: 300,
        crop: 'fill',
        quality: 'auto:good',
        fetch_format: 'auto',
      }
    ],
    ...options,
  });
};

// Generate video poster/thumbnail
const generateVideoPoster = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'video',
    format: 'jpg',
    quality: 'auto',
    transformation: [
      {
        width: 640,
        height: 360,
        crop: 'fill',
        start_offset: '10%', // Take frame from 10% into video
      }
    ],
    ...options,
  });
};

// Get media info from Cloudinary
const getMediaInfo = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error getting media info for ${publicId}:`, error);
    return { success: false, error: error.message };
  }
};

// List all resources in a folder
const listFolderContents = async (folderPath, resourceType = 'image', maxResults = 100) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix: folderPath,
      max_results: maxResults,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(`Error listing folder contents for ${folderPath}:`, error);
    return { success: false, error: error.message };
  }
};

// Clean up unused media (for maintenance tasks)
const cleanupUnusedMedia = async (folderPath, usedPublicIds = []) => {
  try {
    // Get all media in folder
    const folderContents = await listFolderContents(folderPath);
    
    if (!folderContents.success) {
      return folderContents;
    }
    
    // Find unused media
    const allPublicIds = folderContents.data.resources.map(resource => resource.public_id);
    const unusedPublicIds = allPublicIds.filter(id => !usedPublicIds.includes(id));
    
    if (unusedPublicIds.length === 0) {
      return { success: true, message: 'No unused media found', deletedCount: 0 };
    }
    
    // Delete unused media
    const deleteResult = await deleteMultipleFromCloudinary(unusedPublicIds);
    
    return {
      success: deleteResult.success,
      deletedCount: unusedPublicIds.length,
      deletedIds: unusedPublicIds,
      result: deleteResult.result
    };
  } catch (error) {
    console.error('Error in cleanup:', error);
    return { success: false, error: error.message };
  }
};

// Error handler for Cloudinary operations
const handleCloudinaryError = (error, res, customMessage = 'Media operation failed') => {
  console.error('Cloudinary Error:', error);
  
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = customMessage;
  
  if (error.http_code) {
    statusCode = error.http_code;
  }
  
  if (error.message) {
    if (error.message.includes('File size too large')) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = 'File size exceeds the maximum limit';
    } else if (error.message.includes('Invalid image file')) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = 'Invalid file format. Please upload a valid image or video file';
    } else if (error.message.includes('Resource not found')) {
      statusCode = StatusCodes.NOT_FOUND;
      message = 'Media not found';
    }
  }
  
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

module.exports = {
  cloudinary,
  verifyCloudinaryConfig,
  uploadToCloudinary,
  uploadImage,
  uploadVideo,
  uploadProfileImage,
  uploadEventMedia,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  generateOptimizedUrl,
  generateThumbnailUrl,
  generateVideoPoster,
  getMediaInfo,
  listFolderContents,
  cleanupUnusedMedia,
  handleCloudinaryError,
};