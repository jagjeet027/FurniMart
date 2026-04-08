import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User } from '../models/Users.js';
import AppError from '../utils/appError.js';

// Main authentication middleware - enhanced version
export const auth = asyncHandler(async (req, res, next) => {
  let token;
  let tokenSource = 'none';

  // Check for token in various places (in order of priority)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
    tokenSource = 'authorization_header';
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
    tokenSource = 'access_token_cookie';
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    tokenSource = 'token_cookie';
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
    tokenSource = 'x_auth_token_header';
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
    tokenSource = 'x_access_token_header';
  }

  console.log(`🔍 Auth check - Token source: ${tokenSource}, Token present: ${token ? 'Yes' : 'No'}`);

  // Check if token exists
  if (!token) {
    console.log('❌ No access token found');
    return res.status(401).json({
      success: false,
      message: 'Access token is required. Please log in.',
      error: 'NO_TOKEN'
    });
  }

  try {
    // Verify the access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Extract user ID (handle both 'id' and 'userId' for backward compatibility)
    const userId = decoded.id || decoded.userId;
    
    if (!userId) {
      console.log('❌ Invalid token payload - no user ID found');
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.',
        error: 'INVALID_TOKEN_PAYLOAD'
      });
    }
    
    console.log(`✅ Token verified successfully:`, { 
      userId: userId, 
      email: decoded.email,
      exp: new Date(decoded.exp * 1000),
      tokenSource: tokenSource
    });

    // Find user in database (exclude sensitive fields)
    const user = await User.findById(userId).select('-password -refreshToken -__v');
    
    if (!user) {
      console.log(`❌ User not found in database with ID: ${userId}`);
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Check if user account is active (if you have such field)
    if (user.hasOwnProperty('isActive') && user.isActive === false) {
      console.log(`❌ User account is deactivated: ${userId}`);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.',
        error: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if user is verified (if you have email/phone verification)
    if (user.hasOwnProperty('isVerified') && user.isVerified === false) {
      console.log(`❌ User account is not verified: ${userId}`);
      return res.status(401).json({
        success: false,
        message: 'Account is not verified. Please verify your account.',
        error: 'ACCOUNT_NOT_VERIFIED'
      });
    }

    // Attach user to request object with multiple properties for compatibility
    req.user = user;
    req.userId = user._id;
    
    // Add decoded token info for debugging/logging
    req.tokenInfo = {
      exp: decoded.exp,
      iat: decoded.iat,
      source: tokenSource
    };
    
    console.log(`✅ User authenticated successfully:`, {
      id: user._id,
      email: user.email,
      name: user.name,
      isManufacturer: user.isManufacturer || false,
      isAdmin: user.isAdmin || false,
      role: user.role || 'user'
    });

    next();

  } catch (error) {
    console.error(`❌ Authentication Error (${tokenSource}):`, error.name, '-', error.message);
    
    // Handle different JWT errors with specific responses
    switch (error.name) {
      case 'TokenExpiredError':
        return res.status(401).json({
          success: false,
          message: 'Access token has expired. Please refresh your session.',
          error: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt,
          shouldRefresh: true
        });
        
      case 'JsonWebTokenError':
        return res.status(401).json({
          success: false,
          message: 'Invalid access token. Please login again.',
          error: 'INVALID_TOKEN'
        });
        
      case 'NotBeforeError':
        return res.status(401).json({
          success: false,
          message: 'Token not active yet.',
          error: 'TOKEN_NOT_ACTIVE',
          activeAt: error.date
        });
        
      case 'Error':
        if (error.message.includes('jwt malformed')) {
          return res.status(401).json({
            success: false,
            message: 'Malformed access token. Please login again.',
            error: 'MALFORMED_TOKEN'
          });
        }
        break;
        
      default:
        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Please try again.',
          error: 'TOKEN_VERIFICATION_FAILED',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
  }
});

// Legacy protect middleware - keeping for backward compatibility
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'You are not logged in! Please log in.',
      error: 'NO_TOKEN'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId;

    // Find user by ID
    const user = await User.findById(userId).select('-password -refreshToken -__v');
      
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User no longer exists.',
        error: 'USER_NOT_FOUND'
      });
    }

    // Set both req.user and req.userId for compatibility
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    let errorResponse = { 
      success: false,
      message: 'Authentication failed. Please try again.',
      error: 'AUTH_FAILED'
    };

    if (error.name === 'TokenExpiredError') {
      errorResponse.message = 'Token has expired. Please login again.';
      errorResponse.error = 'TOKEN_EXPIRED';
      errorResponse.shouldRefresh = true;
    } else if (error.name === 'JsonWebTokenError') {
      errorResponse.message = 'Invalid token. Please login again.';
      errorResponse.error = 'INVALID_TOKEN';
    }

    return res.status(401).json(errorResponse);
  }
});

// Alias for authenticateToken - same as auth middleware
export const authenticateToken = auth;

// Optional authentication - doesn't fail if no token is provided
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Check for token in multiple places
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded.userId;
      
      if (userId) {
        const user = await User.findById(userId).select('-password -refreshToken -__v');
        
        if (user && (!user.hasOwnProperty('isActive') || user.isActive !== false)) {
          req.user = user;
          req.userId = user._id;
          console.log('✅ Optional auth: User authenticated');
        }
      }
    }
    
    // Always continue to next middleware (authenticated or not)
    next();
  } catch (error) {
    console.log('ℹ️ Optional auth failed, continuing without authentication:', error.message);
    // Continue without authentication - this is expected behavior for optional auth
    next();
  }
});

// Middleware to check if user is manufacturer
export const requireManufacturer = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED'
    });
  }

  // Check if user has manufacturer privileges
  if (!req.user.isManufacturer) {
    console.log(`❌ Access denied for user ${req.user._id}: Not a manufacturer`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Manufacturer privileges required.',
      error: 'INSUFFICIENT_PRIVILEGES'
    });
  }

  console.log(`✅ Manufacturer access granted to user: ${req.user._id}`);
  next();
});

// Middleware to check if user is admin
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      error: 'NOT_AUTHENTICATED'
    });
  }

  if (!req.user.isAdmin) {
    console.log(`❌ Access denied for user ${req.user._id}: Not an admin`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      error: 'INSUFFICIENT_PRIVILEGES'
    });
  }

  console.log(`✅ Admin access granted to user: ${req.user._id}`);
  next();
});

// Middleware to check if user owns the resource or is admin
export const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED'
      });
    }

    // Get resource user ID from params, body, or query
    const resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] || 
                          req.query[resourceUserIdField];
    
    // Check if user is admin or owns the resource
    const isAdmin = req.user.isAdmin;
    const isOwner = req.user._id.toString() === (resourceUserId ? resourceUserId.toString() : null);
    
    if (isAdmin || isOwner) {
      console.log(`✅ Ownership/Admin access granted to user: ${req.user._id} (Admin: ${isAdmin}, Owner: ${isOwner})`);
      next();
    } else {
      console.log(`❌ Access denied for user ${req.user._id}: Not owner or admin`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources or need admin privileges.',
        error: 'INSUFFICIENT_PRIVILEGES'
      });
    }
  });
};

// Middleware to check multiple roles
export const requireAnyRole = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        error: 'NOT_AUTHENTICATED'
      });
    }

    const userRoles = [];
    
    // Build user roles array
    if (req.user.isAdmin) userRoles.push('admin');
    if (req.user.isManufacturer) userRoles.push('manufacturer');
    if (req.user.role) userRoles.push(req.user.role);
    
    // If no specific roles, add 'user' as default
    if (userRoles.length === 0) userRoles.push('user');

    // Check if user has any of the required roles
    const hasRequiredRole = roles.some(role => userRoles.includes(role.toLowerCase()));

    if (!hasRequiredRole) {
      console.log(`❌ Access denied for user ${req.user._id}: Required roles: ${roles.join(', ')}, User roles: ${userRoles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
        error: 'INSUFFICIENT_PRIVILEGES',
        requiredRoles: roles,
        userRoles: userRoles
      });
    }

    console.log(`✅ Role-based access granted to user: ${req.user._id} (Roles: ${userRoles.join(', ')})`);
    next();
  });
};

// Middleware for rate limiting per user
export const createUserRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated requests
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user request history
    let requests = userRequests.get(userId) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
        limit: maxRequests,
        windowMs: windowMs,
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    requests.push(now);
    userRequests.set(userId, requests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [key, value] of userRequests.entries()) {
        const filtered = value.filter(timestamp => timestamp > windowStart);
        if (filtered.length === 0) {
          userRequests.delete(key);
        } else {
          userRequests.set(key, filtered);
        }
      }
    }

    next();
  });
};

// Default export
export default auth;