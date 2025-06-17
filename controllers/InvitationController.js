const Invitation = require('../models/InvitationModel');
const Event = require('../models/Events');
const EventParticipant = require('../models/EventParticipant');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Helper function to check if ID is valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

// Helper function to normalize user ID (handle both string and ObjectId)
const normalizeUserId = (userId) => {
  if (!userId) return null;
  
  // If it's already an ObjectId, convert to string
  if (userId instanceof mongoose.Types.ObjectId) {
    return userId.toString();
  }
  
  // If it's a string, return as is
  return userId.toString();
};

// Helper function to populate event with creator info (from your existing code)
async function populateEventWithCreatorInfo(event) {
  if (!event) {
    return null;
  }
  
  let creatorInfo = null;
  
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

// @desc    Get all available users for invitation (excluding existing participants and invitees)
// @route   GET /api/invitations/available-users
// @access  Private
exports.getAvailableUsers = asyncHandler(async (req, res, next) => {
  const { query, eventId, limit = 10 } = req.query;
  
  console.log('Available users request:', { query, eventId, limit, userId: req.user.id });
  
  if (!eventId || !isValidObjectId(eventId)) {
    return next(new ErrorResponse('Valid event ID is required', 400));
  }

  // Verify event exists and user has permission to invite
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Check if user is creator or participant
  const normalizedUserId = normalizeUserId(req.user.id);
  const normalizedCreatorId = normalizeUserId(event.creatorId);
  
  console.log('User authorization check:', { 
    requestUserId: normalizedUserId, 
    eventCreatorId: normalizedCreatorId,
    isCreator: normalizedCreatorId === normalizedUserId
  });

  const isCreator = normalizedCreatorId === normalizedUserId;
  if (!isCreator) {
    const isParticipant = await EventParticipant.findOne({
      eventId: event._id,
      userId: req.user.id
    });
    
    if (!isParticipant) {
      return next(new ErrorResponse('Not authorized to send invitations for this event', 403));
    }
  }

  // Get existing participants and invited users to exclude them
  const existingParticipantIds = await EventParticipant.find({ eventId })
    .distinct('userId');
  
  const existingInvitationIds = await Invitation.find({ 
    eventId, 
    status: { $in: ['pending', 'accepted'] } 
  }).distinct('inviteeId');

  const excludeIds = [...existingParticipantIds, ...existingInvitationIds, req.user.id];

  // Build search query
  let searchQuery = {
    _id: { $nin: excludeIds }
  };

  // Add text search if query provided
  if (query && query.trim().length >= 2) {
    searchQuery.$or = [
      { name: { $regex: query.trim(), $options: 'i' } },
      { email: { $regex: query.trim(), $options: 'i' } }
    ];
  }

  // Get users excluding those already involved
  const users = await User.find(searchQuery)
    .select('name email profileImage')
    .sort({ name: 1 })
    .limit(parseInt(limit));

  console.log(`Found ${users.length} available users for invitation`);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Send invitation to user
// @route   POST /api/invitations
// @access  Private
exports.sendInvitation = asyncHandler(async (req, res, next) => {
  const { eventId, inviteeId, message } = req.body;
  const inviterId = req.user.id;

  console.log('Send invitation request:', { eventId, inviteeId, inviterId, message });

  // Validate required fields
  if (!eventId || !inviteeId) {
    return next(new ErrorResponse('Event ID and invitee ID are required', 400));
  }

  // Validate ObjectIds
  if (!isValidObjectId(eventId) || !isValidObjectId(inviteeId)) {
    return next(new ErrorResponse('Invalid event ID or user ID', 400));
  }

  // Check if trying to invite themselves
  const normalizedInviterId = normalizeUserId(inviterId);
  const normalizedInviteeId = normalizeUserId(inviteeId);
  
  if (normalizedInviterId === normalizedInviteeId) {
    return next(new ErrorResponse('You cannot invite yourself', 400));
  }

  // Verify event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Verify invitee exists
  const invitee = await User.findById(inviteeId);
  if (!invitee) {
    return next(new ErrorResponse(`User not found with id of ${inviteeId}`, 404));
  }

  // Check if user has permission to invite (creator or participant)
  const normalizedCreatorId = normalizeUserId(event.creatorId);
  const isCreator = normalizedCreatorId === normalizedInviterId;
  
  if (!isCreator) {
    const isParticipant = await EventParticipant.findOne({
      eventId: event._id,
      userId: inviterId
    });
    
    if (!isParticipant) {
      return next(new ErrorResponse('Not authorized to send invitations for this event', 403));
    }
  }

  // Check if user is already a participant
  const existingParticipant = await EventParticipant.findOne({
    eventId,
    userId: inviteeId
  });

  if (existingParticipant) {
    return next(new ErrorResponse('User is already a participant in this event', 400));
  }

  // Check if invitation already exists
  const existingInvitation = await Invitation.findOne({
    eventId,
    inviteeId,
    status: { $in: ['pending', 'accepted'] }
  });

  if (existingInvitation) {
    return next(new ErrorResponse('Invitation already sent to this user', 400));
  }

  // Create invitation
  const invitation = await Invitation.create({
    eventId,
    inviterId,
    inviteeId,
    message: message || `You're invited to join "${event.name}"!`,
    status: 'pending'
  });

  console.log('Invitation created:', invitation);

  // Populate invitation with user and event details
  const populatedInvitation = await Invitation.findById(invitation._id)
    .populate('inviterId', 'name profileImage')
    .populate('inviteeId', 'name email profileImage')
    .populate('eventId', 'name date time location coverImage');

  res.status(201).json({
    success: true,
    data: populatedInvitation
  });
});

// @desc    Accept invitation and join event
// @route   PUT /api/invitations/:id/accept
// @access  Private
exports.acceptInvitation = asyncHandler(async (req, res, next) => {
  const invitationId = req.params.id;
  const userId = req.user.id;
  
  console.log('Accept invitation request:', { 
    invitationId, 
    userId, 
    userIdType: typeof userId,
    userFromToken: req.user 
  });
  
  // Validate invitationId
  if (!isValidObjectId(invitationId)) {
    return next(new ErrorResponse(`Invalid invitation ID: ${invitationId}`, 400));
  }

  // Find invitation
  const invitation = await Invitation.findById(invitationId).populate('eventId');
  
  if (!invitation) {
    return next(new ErrorResponse(`Invitation not found with id of ${invitationId}`, 404));
  }

  console.log('Found invitation:', {
    invitationId: invitation._id,
    inviteeId: invitation.inviteeId,
    inviteeIdType: typeof invitation.inviteeId,
    inviterId: invitation.inviterId,
    status: invitation.status
  });

  // Normalize IDs for comparison
  const normalizedUserId = normalizeUserId(userId);
  const normalizedInviteeId = normalizeUserId(invitation.inviteeId);
  
  console.log('ID comparison:', {
    normalizedUserId,
    normalizedInviteeId,
    areEqual: normalizedUserId === normalizedInviteeId,
    originalUserId: userId,
    originalInviteeId: invitation.inviteeId
  });

  // Check if user is the invitee
  if (normalizedUserId !== normalizedInviteeId) {
    console.error('Authorization failed - User ID mismatch:', {
      expectedInviteeId: normalizedInviteeId,
      actualUserId: normalizedUserId,
      rawComparison: userId.toString() === invitation.inviteeId.toString()
    });
    return next(new ErrorResponse('Not authorized to accept this invitation', 403));
  }

  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    return next(new ErrorResponse(`Invitation is ${invitation.status} and cannot be accepted`, 400));
  }

  // Check if event still exists
  if (!invitation.eventId) {
    // Update invitation status to expired
    invitation.status = 'expired';
    await invitation.save();
    return next(new ErrorResponse('Event no longer exists', 404));
  }

  // Check if user is already a participant
  const existingParticipant = await EventParticipant.findOne({
    eventId: invitation.eventId._id,
    userId
  });

  if (existingParticipant) {
    // Update invitation status to accepted
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save();
    
    return next(new ErrorResponse('You are already a participant in this event', 400));
  }

  // Start transaction to ensure data consistency
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Add user as participant
    await EventParticipant.create([{
      eventId: invitation.eventId._id,
      userId,
      role: 'participant'
    }], { session });

    // Increment participant count
    await Event.findByIdAndUpdate(
      invitation.eventId._id,
      { $inc: { participants: 1 } },
      { session }
    );

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    await invitation.save({ session });

    await session.commitTransaction();

    console.log('Invitation accepted successfully');

    // Get updated event details
    const updatedEvent = await Event.findById(invitation.eventId._id);
    const populatedEvent = await populateEventWithCreatorInfo(updatedEvent);

    res.status(200).json({
      success: true,
      data: {
        message: 'Invitation accepted successfully',
        invitation: invitation,
        event: populatedEvent
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error accepting invitation:', error);
    return next(new ErrorResponse('Failed to accept invitation', 500));
  } finally {
    session.endSession();
  }
});

// @desc    Get user's received invitations
// @route   GET /api/invitations/received
// @access  Private
exports.getReceivedInvitations = asyncHandler(async (req, res, next) => {
  const { status = 'all', page = 1, limit = 10 } = req.query;
  
  console.log('Get received invitations:', { userId: req.user.id, status, page, limit });
  
  // Build query
  let query = { inviteeId: req.user.id };
  
  if (status !== 'all') {
    if (!['pending', 'accepted', 'declined', 'expired'].includes(status)) {
      return next(new ErrorResponse('Invalid status filter', 400));
    }
    query.status = status;
  }

  // Calculate pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  
  // Get total count
  const total = await Invitation.countDocuments(query);
  
  // Get invitations
  const invitations = await Invitation.find(query)
    .populate('inviterId', 'name profileImage')
    .populate('eventId', 'name date time location coverImage isPrivate')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  console.log(`Found ${invitations.length} received invitations`);

  // Add event creator info to each invitation
  const enrichedInvitations = await Promise.all(
    invitations.map(async (invitation) => {
      const invitationObj = invitation.toObject();
      if (invitationObj.eventId) {
        const populatedEvent = await populateEventWithCreatorInfo(invitationObj.eventId);
        invitationObj.eventId = populatedEvent;
      }
      return invitationObj;
    })
  );

  // Pagination info
  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalInvitations: total,
    hasNext: startIndex + parseInt(limit) < total,
    hasPrev: parseInt(page) > 1
  };

  res.status(200).json({
    success: true,
    count: enrichedInvitations.length,
    pagination,
    data: enrichedInvitations
  });
});

// @desc    Get user's sent invitations
// @route   GET /api/invitations/sent
// @access  Private
exports.getSentInvitations = asyncHandler(async (req, res, next) => {
  const { eventId, status = 'all', page = 1, limit = 10 } = req.query;
  
  // Build query
  let query = { inviterId: req.user.id };
  
  if (eventId) {
    if (!isValidObjectId(eventId)) {
      return next(new ErrorResponse('Invalid event ID', 400));
    }
    query.eventId = eventId;
  }
  
  if (status !== 'all') {
    if (!['pending', 'accepted', 'declined', 'expired'].includes(status)) {
      return next(new ErrorResponse('Invalid status filter', 400));
    }
    query.status = status;
  }

  // Calculate pagination
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  
  // Get total count
  const total = await Invitation.countDocuments(query);
  
  // Get invitations
  const invitations = await Invitation.find(query)
    .populate('inviteeId', 'name email profileImage')
    .populate('eventId', 'name date time location coverImage')
    .sort('-createdAt')
    .skip(startIndex)
    .limit(parseInt(limit));

  // Pagination info
  const pagination = {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalInvitations: total,
    hasNext: startIndex + parseInt(limit) < total,
    hasPrev: parseInt(page) > 1
  };

  res.status(200).json({
    success: true,
    count: invitations.length,
    pagination,
    data: invitations
  });
});

// @desc    View single invitation details
// @route   GET /api/invitations/:id
// @access  Private
exports.getInvitation = asyncHandler(async (req, res, next) => {
  const invitationId = req.params.id;
  
  // Validate invitationId
  if (!isValidObjectId(invitationId)) {
    return next(new ErrorResponse(`Invalid invitation ID: ${invitationId}`, 400));
  }

  // Find invitation
  const invitation = await Invitation.findById(invitationId)
    .populate('inviterId', 'name profileImage')
    .populate('inviteeId', 'name email profileImage')
    .populate('eventId');

  if (!invitation) {
    return next(new ErrorResponse(`Invitation not found with id of ${invitationId}`, 404));
  }

  // Check if user is authorized to view this invitation
  const userId = normalizeUserId(req.user.id);
  const inviterId = normalizeUserId(invitation.inviterId._id);
  const inviteeId = normalizeUserId(invitation.inviteeId._id);
  
  if (inviterId !== userId && inviteeId !== userId) {
    return next(new ErrorResponse('Not authorized to view this invitation', 403));
  }

  // Get detailed event info with creator
  let eventDetails = null;
  if (invitation.eventId) {
    eventDetails = await populateEventWithCreatorInfo(invitation.eventId);
    
    // If user is the invitee, get participant count and other details
    if (inviteeId === userId) {
      const participantCount = await EventParticipant.countDocuments({
        eventId: invitation.eventId._id
      });
      eventDetails.currentParticipants = participantCount;
    }
  }

  const invitationObj = invitation.toObject();
  invitationObj.eventId = eventDetails;

  res.status(200).json({
    success: true,
    data: invitationObj
  });
});

// @desc    Decline invitation
// @route   PUT /api/invitations/:id/decline
// @access  Private
exports.declineInvitation = asyncHandler(async (req, res, next) => {
  const invitationId = req.params.id;
  const userId = req.user.id;
  
  // Validate invitationId
  if (!isValidObjectId(invitationId)) {
    return next(new ErrorResponse(`Invalid invitation ID: ${invitationId}`, 400));
  }

  // Find invitation
  const invitation = await Invitation.findById(invitationId);
  
  if (!invitation) {
    return next(new ErrorResponse(`Invitation not found with id of ${invitationId}`, 404));
  }

  // Check if user is the invitee
  const normalizedUserId = normalizeUserId(userId);
  const normalizedInviteeId = normalizeUserId(invitation.inviteeId);
  
  if (normalizedUserId !== normalizedInviteeId) {
    return next(new ErrorResponse('Not authorized to decline this invitation', 403));
  }

  // Check if invitation is still pending
  if (invitation.status !== 'pending') {
    return next(new ErrorResponse(`Invitation is ${invitation.status} and cannot be declined`, 400));
  }

  // Update invitation status
  invitation.status = 'declined';
  invitation.respondedAt = new Date();
  await invitation.save();

  res.status(200).json({
    success: true,
    data: {
      message: 'Invitation declined successfully',
      invitation: invitation
    }
  });
});

// @desc    Cancel sent invitation (for inviter)
// @route   DELETE /api/invitations/:id
// @access  Private
exports.cancelInvitation = asyncHandler(async (req, res, next) => {
  const invitationId = req.params.id;
  const userId = req.user.id;
  
  // Validate invitationId
  if (!isValidObjectId(invitationId)) {
    return next(new ErrorResponse(`Invalid invitation ID: ${invitationId}`, 400));
  }

  // Find invitation
  const invitation = await Invitation.findById(invitationId);
  
  if (!invitation) {
    return next(new ErrorResponse(`Invitation not found with id of ${invitationId}`, 404));
  }

  // Check if user is the inviter
  const normalizedUserId = normalizeUserId(userId);
  const normalizedInviterId = normalizeUserId(invitation.inviterId);
  
  if (normalizedInviterId !== normalizedUserId) {
    return next(new ErrorResponse('Not authorized to cancel this invitation', 403));
  }

  // Check if invitation can be cancelled (only pending invitations)
  if (invitation.status !== 'pending') {
    return next(new ErrorResponse(`Cannot cancel ${invitation.status} invitation`, 400));
  }

  // Delete the invitation
  await invitation.remove();

  res.status(200).json({
    success: true,
    data: {
      message: 'Invitation cancelled successfully'
    }
  });
});

// @desc    Get invitation statistics for an event
// @route   GET /api/invitations/event/:eventId/stats
// @access  Private
exports.getEventInvitationStats = asyncHandler(async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  
  // Validate eventId
  if (!isValidObjectId(eventId)) {
    return next(new ErrorResponse(`Invalid event ID: ${eventId}`, 400));
  }

  // Verify event exists and user has permission
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse(`Event not found with id of ${eventId}`, 404));
  }

  // Check if user is creator or participant
  const normalizedUserId = normalizeUserId(userId);
  const normalizedCreatorId = normalizeUserId(event.creatorId);
  const isCreator = normalizedCreatorId === normalizedUserId;
  
  if (!isCreator) {
    const isParticipant = await EventParticipant.findOne({
      eventId: event._id,
      userId
    });
    
    if (!isParticipant) {
      return next(new ErrorResponse('Not authorized to view invitation statistics', 403));
    }
  }

  // Get invitation statistics
  const stats = await Invitation.aggregate([
    { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format stats
  const formattedStats = {
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    expired: 0
  };

  stats.forEach(stat => {
    formattedStats[stat._id] = stat.count;
    formattedStats.total += stat.count;
  });

  // Get current participant count
  const participantCount = await EventParticipant.countDocuments({ eventId });

  res.status(200).json({
    success: true,
    data: {
      eventId,
      invitationStats: formattedStats,
      currentParticipants: participantCount
    }
  });
});