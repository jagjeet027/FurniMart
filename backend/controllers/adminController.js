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
    // Disable caching completely
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Remove ETag header if present
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
    
    // Check if admin already registered
    const existingAdmin = await Admin.findOne({ adminId: "ADmin820" });
    if (existingAdmin && existingAdmin.isRegistered) {
      return res.status(400).json({ 
        message: "Admin already registered. Only one admin allowed." 
      });
    }
    
    // Validate required fields
    if (!email || !password || !secretCode) {
      return res.status(400).json({ 
        message: "Email, password, and secret code are required" 
      });
    }
    
    // Create new admin (will replace existing if any)
    const adminData = {
      email,
      adminId: "ADmin820",
      password,
      secretCode,
      isRegistered: true
    };
    
    // Remove existing admin if any and create new one
    await Admin.deleteMany({ adminId: "ADmin820" });
    const admin = new Admin(adminData);
    await admin.save();
    
    const token = generateToken(admin._id);
    
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
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { adminId, password, secretCode } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ adminId: "ADmin820" });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Check secret code
    const isSecretCodeValid = await admin.compareSecretCode(secretCode);
    if (!isSecretCodeValid) {
      return res.status(401).json({ message: "Invalid secret code" });
    }
    
    // Generate token
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
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Add this to your adminController.js

export const refreshToken = async (req, res) => {
  try {
    // Get admin ID from the middleware (should be set by authMiddleware)
    const adminId = req.adminId;
    
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized - No admin ID found" });
    }
    
    // Find the admin
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    
    // Generate new token
    const newToken = generateToken(admin._id);
    
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
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      message: "Token refresh failed", 
      error: error.message 
    });
  }
};