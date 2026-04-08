import asyncHandler from 'express-async-handler';
import { User } from '../models/Users.js';

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id || req.userId;
    const { name, phone, address } = req.body;

    // Validate input
    if (!name && !phone && !address) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name, phone, or address) is required to update'
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only allowed fields
    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters long'
        });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      // Validate phone if provided and not empty
      if (phone && phone.trim()) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid 10-digit phone number'
          });
        }
        user.phone = phone.trim();
      } else {
        user.phone = undefined; // Allow clearing phone
      }
    }

    if (address !== undefined) {
      user.address = address.trim() || undefined; // Allow clearing address
    }

    // Save updated user
    await user.save();

    console.log(`✅ Profile updated successfully for: ${user.email}`);

    // Return updated user data
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isManufacturer: user.isManufacturer || false,
        isAdmin: user.isAdmin || false,
        role: user.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export { updateUserProfile };