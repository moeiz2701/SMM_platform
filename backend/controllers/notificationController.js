const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort('-createdAt')
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Get unread notifications count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({ 
    user: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: count
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return next(
      new ErrorResponse(`No notification found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Create notification (internal use)
// @route   POST /api/v1/notifications
// @access  Private
exports.createNotification = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const notification = await Notification.create(req.body);

  // Real-time notification would be implemented here (e.g., via Socket.io)
  
  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Process action for notification
// @route   PUT /api/v1/notifications/:id/action
// @access  Private
exports.processNotificationAction = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id,
      actionRequired: true
    },
    {
      actionTaken: true,
      actionResult: req.body.result
    },
    { new: true }
  );

  if (!notification) {
    return next(
      new ErrorResponse(`No actionable notification found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});