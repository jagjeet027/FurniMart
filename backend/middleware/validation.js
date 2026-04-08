import { body, validationResult } from 'express-validator';

// Organization validation rules
export const validateOrganization = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Organization name must be between 2 and 200 characters'),
    
  body('type')
    .notEmpty()
    .withMessage('Organization type is required')
    .isIn(['College', 'University', 'Technical Institute', 'Training Center', 'Research Institute'])
    .withMessage('Invalid organization type'),
    
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
    
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
    
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please enter a valid website URL'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
    
  body('establishedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Please enter a valid established year'),
    
  body('accreditation')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Accreditation cannot exceed 300 characters'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      });
    }
    next();
  }
];

// Candidate validation rules
export const validateCandidate = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, hyphens, and apostrophes'),
    
  body('rollNo')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Roll number must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9-_/]+$/)
    .withMessage('Roll number can only contain letters, numbers, hyphens, underscores, and forward slashes'),
    
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
    
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please enter a valid phone number'),
    
  body('branch')
    .notEmpty()
    .withMessage('Branch is required')
    .isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Biotechnology', 'Other'])
    .withMessage('Please select a valid branch'),
    
  body('specialization')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Specialization cannot exceed 200 characters'),
    
  body('year')
    .optional()
    .isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Post Graduate'])
    .withMessage('Please select a valid year'),
    
  body('cgpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('CGPA must be between 0 and 10'),
    
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
    
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: err.value
        }))
      });
    }
    next();
  }
];

// Custom validation middleware for file uploads
export const validateFileUpload = (req, res, next) => {
  if (req.file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.'
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  
  next();
};

// Pagination validation middleware
export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (!Number.isInteger(+page) || +page < 1)) {
    return res.status(400).json({
      success: false,
      error: 'Page must be a positive integer'
    });
  }
  
  if (limit && (!Number.isInteger(+limit) || +limit < 1 || +limit > 100)) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be a positive integer between 1 and 100'
    });
  }
  
  next();
};

// ID validation middleware
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID format'
      });
    }
    
    next();
  };
};