import Admin from '../models/admin.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

// Generate JWT token
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '24h' });
};

// Check if admin is already registered
export const checkRegistrationStatus = async (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    res.removeHeader('ETag');
    
    const admin = await Admin.findOne({ adminId: "ADmin820" });
    
    if (admin && admin.isRegistered) {
      return res.status(200).json({ 
        isRegistered: true, 
        message: "Admin already registered. Please login.",
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({ 
      isRegistered: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking admin registration status:', error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Register admin
export const registerAdmin = async (req, res) => {
  try {
    const { email, password, secretCode } = req.body;
    
    const existingAdmin = await Admin.findOne({ adminId: "ADmin820" });
    if (existingAdmin && existingAdmin.isRegistered) {
      return res.status(400).json({ 
        message: "Admin already registered. Only one admin allowed." 
      });
    }
    
    if (!email || !password || !secretCode) {
      return res.status(400).json({ 
        message: "Email, password, and secret code are required" 
      });
    }
    
    const adminData = {
      email,
      adminId: "ADmin820",
      password,
      secretCode,
      isRegistered: true
    };
    
    await Admin.deleteMany({ adminId: "ADmin820" });
    const admin = new Admin(adminData);
    await admin.save();
    
    const token = generateToken(admin._id);
    
    console.log('✅ Admin registered successfully:', admin.email);
    
    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        adminId: admin.adminId
      }
    });
    
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message 
    });
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { adminId, password, secretCode } = req.body;    
    const admin = await Admin.findOne({ adminId: "ADmin820" });
    if (!admin) {
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }
    
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "Invalid credentials" 
      });
    }
    
    const isSecretCodeValid = await admin.compareSecretCode(secretCode);
    if (!isSecretCodeValid) {
      console.log('❌ Invalid secret code');
      return res.status(401).json({ 
        message: "Invalid secret code" 
      });
    }
    
    const token = generateToken(admin._id);
    
    
    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        adminId: admin.adminId
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: "Login failed", 
      error: error.message 
    });
  }
};

// Get admin profile (NEW)
export const getAdminProfile = async (req, res) => {
  try {    
    const admin = await Admin.findById(req.adminId).select('-password -secretCode');
    
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        adminId: admin.adminId,
        isRegistered: admin.isRegistered,
        createdAt: admin.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const adminId = req.adminId;
    
    if (!adminId) {
      console.log('❌ No admin ID found in refresh request');
      return res.status(401).json({ 
        message: "Unauthorized - No admin ID found" 
      });
    }
    
    console.log('=== ADMIN TOKEN REFRESH ===');
    console.log('Admin ID:', adminId);
    
    const admin = await Admin.findById(adminId);
    if (!admin) {
      console.log('❌ Admin not found during token refresh');
      return res.status(404).json({ 
        message: "Admin not found" 
      });
    }
    
    const newToken = generateToken(admin._id);
    
    console.log('✅ Admin token refreshed successfully');
    
    res.json({
      message: "Token refreshed successfully",
      token: newToken,
      admin: {
        id: admin._id,
        email: admin.email,
        adminId: admin.adminId
      },
      refreshedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Admin token refresh error:', error);
    res.status(500).json({ 
      message: "Token refresh failed", 
      error: error.message 
    });
  }
};