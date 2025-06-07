const { StatusCodes } = require('http-status-codes');

// Middleware to check if user's email is verified
// Use this middleware on routes that require email verification
const requireEmailVerification = async (req, res, next) => {
  try {
    // This middleware should be used after the protect middleware
    // so req.user should already be available
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    // Check if user's email is verified
    if (!req.user.isEmailVerified) {
      return res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Email verification required. Please verify your email address.',
        emailVerificationRequired: true,
        email: req.user.email
      });
    }

    next();
  } catch (error) {
    console.error('Email verification middleware error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = { requireEmailVerification };