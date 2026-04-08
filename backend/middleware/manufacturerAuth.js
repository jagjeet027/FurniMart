// middleware/manufacturerAuth.js
import jwt from 'jsonwebtoken';
import { User } from '../models/Users.js';

const manufacturerAuth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Check if user is a manufacturer
    if (!user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can perform this action.'
      });
    }

    // Attach user info to request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      isManufacturer: user.isManufacturer
    };

    next();
  } catch (error) {
    console.error('Manufacturer auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

export default manufacturerAuth;