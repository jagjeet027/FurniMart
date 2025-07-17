import express from 'express';
import { 
  sendOTP, 
  verifyOTP, 
  registerUser, 
  loginUser, 
  refreshToken,
  getUserProfile,  // ADD THIS IMPORT
  updateUserToManufacturer,
  logoutUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import loginAuth from '../middleware/loginAuth.js';

const router = express.Router();

// Public routes with basic validation
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', registerUser);
router.post('/login', loginAuth, loginUser);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getUserProfile);  // ADD THIS ROUTE - GET user profile
router.put('/me', protect, updateUserToManufacturer);  // PUT to update user

export default router;