import jwt from 'jsonwebtoken';
import { User } from '../models/Users.js';

// Main authentication middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('✅ Token verified for user:', decoded.userId);

      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        console.log('❌ User not found for ID:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // CRITICAL: Always convert to string to avoid comparison issues
      req.userId = user._id.toString();
      req.user = user;

      console.log('✅ User authenticated:', {
        userId: req.userId,
        email: user.email,
        isManufacturer: user.isManufacturer
      });

      next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Alias for compatibility
export const authenticateToken = protect;

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user) {
          req.userId = user._id.toString();
          req.user = user;
        }
      } catch (error) {
        console.log('⚠️ Optional auth token invalid:', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('❌ Optional auth error:', error);
    next();
  }
};

// Manufacturer-only middleware
export const manufacturerOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manufacturer account required.'
      });
    }

    next();
  } catch (error) {
    console.error('❌ Manufacturer auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

export default protect;                         