import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/Users.js';
import AppError from '../utils/appError.js';

// Main authentication middleware - combines all your existing functionality
export const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in various places
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  console.log('Auth Header:', req.headers.authorization);
  console.log('Extracted Token:', token ? 'Token present' : 'No token');

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required. Please log in.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { 
      userId: decoded.id || decoded.userId, 
      exp: new Date(decoded.exp * 1000) 
    });

    // Find user in database with manufacturer profile populated
    const user = await User.findById(decoded.id || decoded.userId)
      .select('-password')
      .populate('manufacturerProfile');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.'
      });
    }

    // Check if user is active (if you have such field)
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Attach user to request object with multiple properties for compatibility
    req.user = user;
    req.userId = user._id;
    
    console.log('User authenticated:', {
      id: user._id,
      email: user.email,
      isManufacturer: user.isManufacturer,
      hasManufacturerProfile: !!user.manufacturerProfile
    });

    next();

  } catch (error) {
    console.error('Authentication Error:', error.name + ':', error.message);
    
    // Handle different JWT errors with specific responses
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        error: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        error: 'INVALID_TOKEN'
      });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not active yet.',
        error: 'TOKEN_NOT_ACTIVE'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Please try again.',
        error: 'TOKEN_VERIFICATION_FAILED'
      });
    }
  }
});

// Legacy protect middleware - keeping for backward compatibility
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'You are not logged in! Please log in.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id || decoded.userId)
      .select('-password')
      .populate('manufacturerProfile');
      
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User no longer exists.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed. Please try again.' 
    });
  }
});

// Alias for authenticateToken - same as auth middleware
export const authenticateToken = auth;

// Optional authentication - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id || decoded.userId)
        .select('-password')
        .populate('manufacturerProfile');
      
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
    
    next();
  } catch (error) {
    console.log('Optional auth failed, continuing without authentication:', error.message);
    // Continue without authentication - this is expected behavior
    next();
  }
});

// Middleware to check if user is manufacturer
export const requireManufacturer = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Check both the isManufacturer flag and manufacturerProfile
  if (!req.user.isManufacturer && !req.user.manufacturerProfile) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manufacturer privileges required.'
    });
  }

  next();
});

// Middleware to check if user is admin
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
});

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.isAdmin || req.user._id.toString() === resourceUserId) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
  });
};

// Default export is the main auth middleware
export default auth;