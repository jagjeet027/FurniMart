import express from 'express';
import { 
  registerUser, 
  loginUser, 
  refreshToken,
  getUserProfile,
  updateUserToManufacturer,
  logoutUser,
  forgotPassword,
  resetPassword
} from '../controllers/userController.js';
import { updateUserProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';
import loginAuth from '../middleware/loginAuth.js';
import { User } from '../models/Users.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.post('/register', registerUser);
router.post('/login', loginAuth, loginUser);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ===== PROTECTED USER ROUTES =====
router.post('/logout', authenticateToken, logoutUser);
router.get('/me', authenticateToken, getUserProfile);

// NEW: Update user profile (name, phone, address only)
router.patch('/profile', authenticateToken, updateUserProfile);

// Update user to manufacturer
router.put('/me', authenticateToken, updateUserToManufacturer);

// ===== ADMIN ROUTES =====

// Get all users (admin only)
router.get('/all', adminAuth, async (req, res) => {
  try {
    console.log('=== GET ALL USERS (ADMIN) ===');
    console.log('Admin:', req.admin.email);

    const users = await User.find({})
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${users.length} users`);

    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== GET USER BY ID (ADMIN) ===');
    console.log('User ID:', id);
    console.log('Admin:', req.admin.email);

    const user = await User.findById(id)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Found user:', user.email);

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isManufacturer, isAdmin, isActive } = req.body;

    console.log('=== UPDATE USER STATUS (ADMIN) ===');
    console.log('User ID:', id);
    console.log('Updates:', { isManufacturer, isAdmin, isActive });
    console.log('Admin:', req.admin.email);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (typeof isManufacturer !== 'undefined') {
      user.isManufacturer = isManufacturer;
      user.role = isManufacturer ? 'manufacturer' : 'user';
    }
    if (typeof isAdmin !== 'undefined') {
      user.isAdmin = isAdmin;
      if (isAdmin) user.role = 'admin';
    }
    if (typeof isActive !== 'undefined') {
      user.isActive = isActive;
    }

    await user.save();

    console.log('✅ User status updated successfully');

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: user._id,
        email: user.email,
        isManufacturer: user.isManufacturer,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete user (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== DELETE USER (ADMIN) ===');
    console.log('User ID:', id);
    console.log('Admin:', req.admin.email);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admin to delete themselves
    if (req.admin.email === user.email) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own admin account'
      });
    }

    await User.findByIdAndDelete(id);

    console.log('✅ User deleted successfully');

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;