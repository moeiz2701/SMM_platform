const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorResponse = require('./errorResponse');
const { sendEmail } = require('./sendEmail');

/**
 * Create a notification and send email
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID
 * @param {string} notificationData.type - Notification type
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} [notificationData.priority] - Notification priority
 * @param {boolean} [notificationData.actionRequired] - Whether action is required
 * @returns {Promise<Object>} Created notification
 */
exports.createNotificationWithEmail = async (notificationData) => {
  try {
    // Create the notification
    const notification = await Notification.create({
      user: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority,
      actionRequired: notificationData.actionRequired
    });

    // Get the user's email
    const user = await User.findById(notificationData.userId);
    
    if (!user || !user.email) {
      throw new ErrorResponse('User email not found', 404);
    }

    // Prepare email content
    const emailSubject = `${notificationData.type.charAt(0).toUpperCase() + notificationData.type.slice(1)} Notification`;
    const priorityText = notificationData.priority ? ` (${notificationData.priority.toUpperCase()} Priority)` : '';
    
    // HTML email template
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notificationData.title}${priorityText}</h2>
        <p style="color: #666; font-size: 16px;">${notificationData.message}</p>
        ${notificationData.actionRequired ? `
          <p style="background: #fff4e5; padding: 10px; border-radius: 4px; color: #ff9800;">
            <strong>Action Required:</strong> Please review this notification in your dashboard.
          </p>
        ` : ''}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px;">
            To view more details or take action, please visit your dashboard.
          </p>
        </div>
      </div>
    `;

    // Send email
    await sendEmail({
      email: user.email,
      subject: emailSubject,
      html: htmlContent,
      text: notificationData.message // Fallback plain text version
    });

    return notification;
  } catch (err) {
    console.error('Error creating notification or sending email:', err);
    // If email fails but notification was created, return the notification
    if (err.code !== 404) {
      return err.notification;
    }
    throw err;
  }
};
