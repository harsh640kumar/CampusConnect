const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  title,
  message,
  type = 'system',
  link = '',
  metadata = {},
}) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      metadata,
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};

const notifyMany = async (notifications) => {
  try {
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('[NotificationService] Error bulk creating notifications:', error.message);
    return [];
  }
};

module.exports = { createNotification, notifyMany };
