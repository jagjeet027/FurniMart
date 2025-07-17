import jwt from 'jsonwebtoken';
import { User } from '../models/Users.js';
import asyncHandler from 'express-async-handler';

const auth = asyncHandler(async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Log for debugging
    console.log('Authenticated User:', user._id);

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

export default auth;