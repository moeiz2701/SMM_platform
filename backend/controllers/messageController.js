// @desc    Start a new conversation (or get existing)
// @route   POST /api/v1/messages/start
// @access  Private

const Message = require('../models/Message');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { createNotificationWithEmail } = require('../utils/notificationHelper');

// @desc    Get conversation between two users
// @route   GET /api/v1/messages/:userId
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const userIdA = req.user._id.toString();
  const userIdB = req.params.userId.toString();
  const participants = [userIdA, userIdB].sort();
  const conversationId = participants.join('_');

  console.log('getConversation:', { userIdA, userIdB, conversationId });

  const messages = await Message.find({ conversationId })
    .populate('sender', 'name profilePhoto')
    .populate('recipient', 'name profilePhoto')
    .sort('createdAt');

  console.log('Messages found:', messages.length);

  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Get all conversations for a user
// @route   GET /api/v1/messages
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  // Find all messages where user is either sender or recipient
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $eq: ['$read', false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        let: { 
          senderId: '$lastMessage.sender',
          recipientId: '$lastMessage.recipient'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$_id', '$$senderId'] },
                  { $eq: ['$_id', '$$recipientId'] }
                ]
              }
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              profilePhoto: 1
            }
          }
        ],
        as: 'participants'
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Mark messages as read
// @route   PUT /api/v1/messages/read/:conversationId
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  await Message.updateMany(
    {
      conversationId: req.params.conversationId,
      recipient: req.user._id,
      read: false
    },
    {
      read: true
    }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.startConversation = asyncHandler(async (req, res, next) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return next(new ErrorResponse('Recipient ID is required', 400));
  }
  const participants = [req.user._id.toString(), recipientId].sort();
  const conversationId = participants.join('_');

  // Check if any messages exist for this conversation
  let message = await Message.findOne({ conversationId });

  // If no messages, create a placeholder message (or just return the conversationId)
  if (!message) {
    // Optionally, create a placeholder message or just return the conversationId
    // Here, we just return the conversationId
    return res.status(200).json({
      success: true,
      data: { _id: conversationId }
    });
  }

  // If messages exist, return the conversationId
  return res.status(200).json({
    success: true,
    data: { _id: conversationId }
  });
});

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { recipientId, content } = req.body;

  if (!recipientId || !content) {
    return next(new ErrorResponse("Recipient ID and message content are required", 400));
  }

  const participants = [req.user._id.toString(), recipientId].sort();
  const conversationId = participants.join("_");

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    conversationId,
    read: false, 
  });

  // Use Message.populate for single document
  const populated = await Message.populate(message, [
    { path: "sender", select: "name profilePhoto" },
    { path: "recipient", select: "name profilePhoto" }
  ]);

  // Create notification for the recipient
  try {
    await createNotificationWithEmail({
      userId: recipientId,
      type: 'message',
      title: 'New Message',
      message: `You have received a new message from ${populated.sender.name}`,
      priority: 'medium',
      actionRequired: false,
      relatedEntity: {
        entityType: 'Message',
        entityId: message._id
      }
    });
  } catch (notificationError) {
    console.error('Error creating message notification:', notificationError);
    // Continue with response even if notification fails
  }

  // Optional: emit via socket.io here if needed

  res.status(201).json({
    success: true,
    data: populated,
  });
});
