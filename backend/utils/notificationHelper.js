// utils/notificationHelper.js
import Notification from '../models/notificationModel.js';

export const createManufacturerNotification = async (type, manufacturerData, adminId) => {
  try {
    let message = '';
    let notificationType = 'manufacturer_registration';
    let priority = 'medium';

    switch (type) {
      case 'new_registration':
        message = `New manufacturer registration: ${manufacturerData.businessName} has submitted their application.`;
        priority = 'high';
        break;
      case 'approved':
        message = `Manufacturer approved: ${manufacturerData.businessName} has been approved and notified via email.`;
        notificationType = 'success';
        break;
      case 'rejected':
        message = `Manufacturer rejected: ${manufacturerData.businessName} has been rejected and notified via email.`;
        notificationType = 'warning';
        break;
      default:
        message = `Manufacturer update: ${manufacturerData.businessName}`;
    }

    const notification = new Notification({
      message,
      type: notificationType,
      relatedId: manufacturerData._id,
      relatedModel: 'Manufacturer',
      priority,
      metadata: {
        manufacturerName: manufacturerData.businessName,
        manufacturerEmail: manufacturerData.contact?.email,
        actionBy: adminId,
        timestamp: new Date().toISOString()
      }
    });

    await notification.save();
    console.log('✅ Notification created:', message);
    return notification;

  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};