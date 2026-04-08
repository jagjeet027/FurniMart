
// routes/notificationRoutes.js
import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  createNotification, 
  deleteNotification 
} from '../controllers/notificationController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// All notification routes require admin authentication
router.get('/', adminAuth, getNotifications);
router.patch('/:id/read', adminAuth, markAsRead);
router.post('/', adminAuth, createNotification);
router.delete('/:id', adminAuth, deleteNotification);

export default router;
