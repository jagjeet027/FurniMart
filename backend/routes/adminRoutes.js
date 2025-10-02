import express from 'express';
import { 
  checkRegistrationStatus, 
  registerAdmin, 
  loginAdmin, 
  refreshToken,
  getAdminProfile  // NEW
} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/check-registration-status', checkRegistrationStatus);
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes
router.post('/refresh-token', adminAuth, refreshToken);
router.get('/profile', adminAuth, getAdminProfile); // NEW - Get admin profile

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'admin-api'
  });
});

export default router;