// middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import asyncHandler from 'express-async-handler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

const adminAuth = asyncHandler(async (req, res, next) => {
  try {
    console.log('🔍 Admin Auth - Checking authorization...');
    
    let token;
    
    // Check multiple sources for the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token found in Authorization header');
    } else if (req.headers['authorization']) {
      token = req.headers['authorization'].replace('Bearer ', '');
      console.log('✅ Token found in authorization header (alternative)');
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
      console.log('✅ Token found in adminToken cookie');
    } else if (req.headers['x-admin-token']) {
      token = req.headers['x-admin-token'];
      console.log('✅ Token found in x-admin-token header');
    }
    
    // IMPORTANT: Check localStorage token from frontend (stored by AuthContext)
    if (!token && req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      console.log('✅ Token found in x-auth-token header');
    }
    
    if (!token) {
      console.log('❌ No admin token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided',
        error: 'NO_ADMIN_TOKEN'
      });
    }
    
    console.log('🔐 Verifying admin token...');
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', { adminId: decoded.adminId, email: decoded.email });
    
    if (!decoded.adminId) {
      console.log('❌ Invalid token - no adminId found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token structure',
        error: 'INVALID_ADMIN_TOKEN'
      });
    }
    
    // Find the admin user
    const admin = await Admin.findById(decoded.adminId).select('-password -__v');
    
    if (!admin) {
      console.log('❌ Admin not found in database:', decoded.adminId);
      return res.status(401).json({ 
        success: false,
        message: 'Admin not found',
        error: 'ADMIN_NOT_FOUND'
      });
    }
    
    console.log('✅ Admin authenticated successfully:', {
      id: admin._id,
      email: admin.email,
      adminId: admin.adminId
    });
    
    // Attach admin info to request
    req.admin = admin;
    req.adminId = admin._id;
    
    next();
    
  } catch (error) {
    console.error('❌ Admin auth error:', error.name, '-', error.message);
    
    let errorResponse = {
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_FAILED'
    };
    
    if (error.name === 'TokenExpiredError') {
      errorResponse.message = 'Token expired';
      errorResponse.error = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorResponse.message = 'Invalid token';
      errorResponse.error = 'INVALID_TOKEN';
    } else if (error.name === 'NotBeforeError') {
      errorResponse.message = 'Token not active yet';
      errorResponse.error = 'TOKEN_NOT_ACTIVE';
    }
    
    return res.status(401).json(errorResponse);
  }
});

export const protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if admin exists
      const admin = await Admin.findById(decoded.adminId);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
        });
      }

      // Attach admin info to request
      req.adminId = decoded.adminId;
      req.admin = admin;
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default adminAuth;