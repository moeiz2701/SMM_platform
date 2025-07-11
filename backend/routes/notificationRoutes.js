const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  processNotificationAction
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getNotifications);

router
  .route('/unread-count')
  .get(protect, getUnreadCount);

router
  .route('/:id/read')
  .put(protect, markAsRead);

router
  .route('/mark-all-read')
  .put(protect, markAllAsRead);

router
  .route('/:id/action')
  .put(protect, processNotificationAction);

module.exports = router;