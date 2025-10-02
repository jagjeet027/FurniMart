// middleware/flexibleAuth.js
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import { User } from '../models/Users.js';
import asyncHandler from 'express-async-handler';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

/**
 * Flexible authentication middleware that accepts both user and admin tokens
 * This is useful for routes that should be accessible by both users and admins
 */
const flexibleAuth = asyncHandler(async (req, res, next) => {
  try {
    console.log('🔍 Flexible Auth - Checking authorization...');
    
    let token;
    
    // Check multiple sources for the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token found in Authorization header');
    } else if (req.headers['authorization']) {
      token = req.headers['authorization'].replace('Bearer ', '');
      console.log('✅ Token found in authorization header (alternative)');
    } else if (req.cookies?.token || req.cookies?.adminToken) {
      token = req.cookies.token || req.cookies.adminToken;
      console.log('✅ Token found in cookies');
    } else if (req.headers['x-admin-token'] || req.headers['x-auth-token']) {
      token = req.headers['x-admin-token'] || req.headers['x-auth-token'];
      console.log('✅ Token found in custom headers');
    }
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required. Please login.',
        error: 'NO_TOKEN'
      });
    }
    
    console.log('🔐 Verifying token...');
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded:', { 
      adminId: decoded.adminId, 
      userId: decoded.userId,
      email: decoded.email 
    });
    
    // Check if it's an admin token
    if (decoded.adminId) {
      console.log('🔑 Admin token detected, authenticating as admin...');
      
      const admin = await Admin.findById(decoded.adminId).select('-password -__v');
      
      if (!admin) {
        console.log('❌ Admin not found in database:', decoded.adminId);
        return res.status(401).json({ 
          success: false,
          message: 'Admin not found',
          error: 'ADMIN_NOT_FOUND'
        });
      }
      
      console.log('✅ Admin authenticated:', {
        id: admin._id,
        email: admin.email,
        adminId: admin.adminId
      });
      
      // Attach admin info to request
      req.admin = admin;
      req.adminId = admin._id;
      req.isAdmin = true;
      req.user = { isAdmin: true }; // For backward compatibility
      
      return next();
    }
    
    // Check if it's a user token
    if (decoded.userId) {
      console.log('👤 User token detected, authenticating as user...');
      
      const user = await User.findById(decoded.userId).select('-password -__v');
      
      if (!user) {
        console.log('❌ User not found in database:', decoded.userId);
        return res.status(401).json({ 
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND'
        });
      }
      
      console.log('✅ User authenticated:', {
        id: user._id,
        email: user.email,
        isManufacturer: user.isManufacturer
      });
      
      // Attach user info to request
      req.user = user;
      req.userId = user._id;
      req.isAdmin = false;
      
      return next();
    }
    
    // Token doesn't have userId or adminId
    console.log('❌ Invalid token - no userId or adminId found');
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token structure',
      error: 'INVALID_TOKEN'
    });
    
  } catch (error) {
    console.error('❌ Flexible auth error:', error.name, '-', error.message);
    
    let errorResponse = {
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_FAILED'
    };
    
    if (error.name === 'TokenExpiredError') {
      errorResponse.message = 'Token expired. Please login again.';
      errorResponse.error = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorResponse.message = 'Invalid token. Please login again.';
      errorResponse.error = 'INVALID_TOKEN';
    } else if (error.name === 'NotBeforeError') {
      errorResponse.message = 'Token not active yet';
      errorResponse.error = 'TOKEN_NOT_ACTIVE';
    }
    
    return res.status(401).json(errorResponse);
  }
});

export default flexibleAuth;