const Notification = require('../models/Notification');

// Create notification for upcoming posts
exports.createPostReminder = async (post) => {
  const scheduledTime = new Date(post.scheduledTime);
  const reminderTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000); // 30 minutes before

  await Notification.create({
    type: 'post',
    title: 'Upcoming Post',
    message: `Your post "${post.title}" is scheduled for ${scheduledTime.toLocaleString()}`,
    relatedEntity: {
      entityType: 'post',
      entityId: post._id
    },
    priority: 'medium',
    user: post.user
  });
};

// Create notification for budget threshold
exports.createBudgetThresholdNotification = async (budget, threshold) => {
  await Notification.create({
    type: 'budget',
    title: 'Budget Threshold Reached',
    message: `Your budget "${budget.name}" has reached ${threshold}% of its total allocation`,
    relatedEntity: {
      entityType: 'budget',
      entityId: budget._id
    },
    priority: 'high',
    actionRequired: true,
    user: budget.user
  });
};

// Create notification for post status
exports.createPostStatusNotification = async (post, platform, status) => {
  let message;
  let priority = 'medium';

  if (status === 'success') {
    message = `Your post "${post.title}" was successfully published on ${platform}`;
  } else {
    message = `Failed to publish post "${post.title}" on ${platform}`;
    priority = 'high';
    actionRequired = true;
  }

  await Notification.create({
    type: 'post',
    title: `Post ${status === 'success' ? 'Published' : 'Failed'}`,
    message,
    relatedEntity: {
      entityType: 'post',
      entityId: post._id
    },
    priority,
    actionRequired: status !== 'success',
    user: post.user
  });
};

// Batch create notifications
exports.batchCreateNotifications = async (notifications) => {
  await Notification.insertMany(notifications);
};