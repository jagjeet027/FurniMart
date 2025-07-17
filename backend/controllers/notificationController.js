import Notification from '../models/notificationModel.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Get all notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(50);
  
  res.status(200).json(notifications);
});

// Mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isNew: false },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json(notification);
});

export { getNotifications, markNotificationAsRead };
