const User = require('../models/User');
const Media = require('../models/Media');
const Event = require('../models/Events');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Import Cloudinary utilities
const { 
  uploadProfileImage: uploadToCloudinary, 
  deleteFromCloudinary,
  handleCloudinaryError 
} = require('../config/cloudinary');

// Configure multer for memory storage (since we're using Cloudinary)
const profileStorage = multer.memoryStorage();

const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:userId/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get uploads count from Media collection
    const uploadsCount = await Media.countDocuments({ userId: userId });
    
    // Get events count - FIX: Use 'creatorId' instead of 'createdBy'
    const eventsCount = await Event.countDocuments({ creatorId: userId });

    res.status(StatusCodes.OK).json({
      success: true,
      uploadsCount,
      eventsCount
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
};

// @desc    Upload profile image to Cloudinary
// @route   POST /api/auth/upload-profile-image
// @access  Private
exports.uploadProfileImage = (req, res) => {
  profileUpload.single('profileImage')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'File size too large. Maximum size is 5MB'
          });
        }
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }

    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      console.log('Uploading profile image to Cloudinary for user:', req.user.id);
      
      // Get current user to check for existing profile image
      const currentUser = await User.findById(req.user.id);
      
      // Upload new image to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.user.id);
      
      console.log('Cloudinary upload successful:', {
        public_id: cloudinaryResult.public_id,
        secure_url: cloudinaryResult.secure_url
      });

      // If user had a previous profile image, delete it from Cloudinary
      if (currentUser.profileImage && currentUser.profileImagePublicId) {
        console.log('Deleting old profile image:', currentUser.profileImagePublicId);
        const deleteResult = await deleteFromCloudinary(currentUser.profileImagePublicId, 'image');
        console.log('Old image deletion result:', deleteResult);
      }

      // Update user's profile image in database with Cloudinary URL and public_id
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 
          profileImage: cloudinaryResult.secure_url,
          profileImagePublicId: cloudinaryResult.public_id
        },
        { new: true, runValidators: true }
      );

      res.status(StatusCodes.OK).json({
        success: true,
        profileImageUrl: cloudinaryResult.secure_url,
        message: 'Profile image uploaded successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Error uploading profile image to Cloudinary:', error);
      
      // Handle Cloudinary-specific errors
      if (error.http_code || error.message) {
        return handleCloudinaryError(error, res, 'Profile image upload failed');
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to upload profile image'
      });
    }
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create token and send response
    sendTokenResponse(user, StatusCodes.CREATED, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user and include password field (which is normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token and send response
    sendTokenResponse(user, StatusCodes.OK, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await user.matchPassword(newPassword);
    if (isSamePassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || 'Failed to get user information'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    
    // Only allow certain fields to be updated
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.profileImage) fieldsToUpdate.profileImage = req.body.profileImage;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// @desc    Delete profile image
// @route   DELETE /api/auth/profile-image
// @access  Private
exports.deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user has a profile image, delete it from Cloudinary
    if (user.profileImagePublicId) {
      console.log('Deleting profile image from Cloudinary:', user.profileImagePublicId);
      const deleteResult = await deleteFromCloudinary(user.profileImagePublicId, 'image');
      console.log('Profile image deletion result:', deleteResult);
    }

    // Remove profile image from user record
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $unset: { 
          profileImage: 1, 
          profileImagePublicId: 1 
        } 
      },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile image deleted successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage
      }
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    
    // Handle Cloudinary-specific errors
    if (error.http_code || error.message) {
      return handleCloudinaryError(error, res, 'Profile image deletion failed');
    }

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete profile image'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
};