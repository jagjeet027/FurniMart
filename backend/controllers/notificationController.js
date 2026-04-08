// controllers/notificationController.js
import Notification from '../models/notificationModel.js';

// Get all notifications (admin only)
export const getNotifications = async (req, res) => {
  try {
    console.log('=== GET NOTIFICATIONS (ADMIN) ===');
    console.log('Admin:', req.admin.email);

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 notifications
      .lean();

    console.log(`✅ Found ${notifications.length} notifications`);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create notification (for system events)
export const createNotification = async (req, res) => {
  try {
    const { message, type, relatedId, relatedModel } = req.body;

    console.log('=== CREATE NOTIFICATION ===');
    console.log('Type:', type);
    console.log('Message:', message);

    const notification = new Notification({
      message,
      type: type || 'info',
      relatedId,
      relatedModel,
      isRead: false,
      createdAt: new Date()
    });

    await notification.save();

    console.log('✅ Notification created');

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: notification
    });

  } catch (error) {
    console.error('❌ Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete notification (admin only)
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE NOTIFICATION ===');
    console.log('Notification ID:', id);
    console.log('Admin:', req.admin.email);

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notification.findByIdAndDelete(id);

    console.log('✅ Notification deleted');

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Mark notification as read (admin only)
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== MARK NOTIFICATION AS READ ===');
    console.log('Notification ID:', id);
    console.log('Admin:', req.admin.email);

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    notification.readBy = req.admin._id;
    await notification.save();

    console.log('✅ Notification marked as read');

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV== 'development' ? error.message : undefined
    });
  }
};