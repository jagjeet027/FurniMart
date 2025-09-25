// middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';

const adminAuth = async (req, res, next) => {
  try {
    // Get token from various sources
    let token = null;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }
    // Check x-auth-token header
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }
    // Check cookies (if you're using cookies for admin sessions)
    else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (!token) {
      console.log('❌ Admin Auth: No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No admin token provided. Access denied.',
        error: 'NO_ADMIN_TOKEN'
      });
    }

    console.log('🔍 Admin Auth: Verifying token...');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.adminId) {
      console.log('❌ Admin Auth: Invalid token payload');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin token payload.',
        error: 'INVALID_ADMIN_TOKEN'
      });
    }

    // Find admin in database
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      console.log('❌ Admin Auth: Admin not found in database');
      return res.status(401).json({ 
        success: false,
        message: 'Admin not found. Token may be invalid.',
        error: 'ADMIN_NOT_FOUND'
      });
    }

    // Check if admin is registered and active
    if (!admin.isRegistered) {
      console.log('❌ Admin Auth: Admin not registered');
      return res.status(401).json({ 
        success: false,
        message: 'Admin account not fully registered.',
        error: 'ADMIN_NOT_REGISTERED'
      });
    }

    console.log('✅ Admin Auth: Admin authenticated successfully', {
      adminId: admin.adminId,
      email: admin.email
    });

    // Attach admin info to request
    req.adminId = decoded.adminId;
    req.admin = admin;
    
    // Add token info for debugging
    req.tokenInfo = {
      exp: decoded.exp,
      iat: decoded.iat,
      source: req.headers.authorization ? 'authorization_header' : 
              req.headers['x-auth-token'] ? 'x_auth_token_header' : 
              'cookie'
    };

    next();
    
  } catch (error) {
    console.error('❌ Admin Auth Error:', error.name, '-', error.message);
    
    // Handle different JWT errors
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({
          success: false,
          message: 'Admin token has expired. Please login again.',
          error: 'ADMIN_TOKEN_EXPIRED',
          expiredAt: error.expiredAt,
          shouldLogin: true
        });
        
      case 'JsonWebTokenError':
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token. Please login again.',
          error: 'INVALID_ADMIN_TOKEN'
        });
        
      case 'NotBeforeError':
        return res.status(401).json({
          success: false,
          message: 'Admin token not active yet.',
          error: 'ADMIN_TOKEN_NOT_ACTIVE',
          activeAt: error.date
        });
        
      default:
        return res.status(401).json({
          success: false,
          message: 'Admin authentication failed. Please try again.',
          error: 'ADMIN_AUTH_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
};

// Optional admin auth - doesn't fail if no token
export const optionalAdminAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    } else if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.adminId) {
        const admin = await Admin.findById(decoded.adminId);
        
        if (admin && admin.isRegistered) {
          req.adminId = decoded.adminId;
          req.admin = admin;
          console.log('✅ Optional Admin Auth: Admin authenticated');
        }
      }
    }
    
    // Always continue to next middleware (authenticated or not)
    next();
  } catch (error) {
    console.log('ℹ️ Optional admin auth failed, continuing without admin authentication:', error.message);
    // Continue without admin authentication - this is expected behavior for optional auth
    next();
  }
};

// Middleware to check if user has admin OR regular auth
export const requireAdminOrUser = async (req, res, next) => {
  // First try admin auth
  try {
    await adminAuth(req, res, () => {
      // Admin auth successful
      next();
    });
  } catch (adminError) {
    // Admin auth failed, try regular user auth
    try {
      const { authenticateToken } = await import('./authMiddleware.js');
      await authenticateToken(req, res, next);
    } catch (userError) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login as admin or user.',
        error: 'NO_VALID_AUTH'
      });
    }
  }
};

export default adminAuth;