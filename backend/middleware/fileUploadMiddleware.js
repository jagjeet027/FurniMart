import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

/**
 * File Upload Middleware Configuration
 * Using express-fileupload for handling multipart/form-data
 */

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * File upload configuration options
 */
export const fileUploadOptions = {
  useTempFiles: true,
  tempFileDir: uploadsDir,
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded (max 10MB)',
  uploadTimeout: 60000, // 60 seconds timeout
  debug: process.env.NODE_ENV === 'development',
};

/**
 * File validation middleware
 * Validates file types and sizes
 */
export const validateFiles = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.files) {
      return next();
    }

    const files = [];
    
    // Collect all files from the request
    Object.keys(req.files).forEach(key => {
      const fileOrFiles = req.files[key];
      if (Array.isArray(fileOrFiles)) {
        files.push(...fileOrFiles);
      } else {
        files.push(fileOrFiles);
      }
    });

    // Validate each file
    for (const file of files) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `File ${file.name} exceeds 10MB size limit`
        });
      }

      // Check file type if restrictions are specified
      if (allowedTypes.length > 0) {
        const isValidType = allowedTypes.some(type => {
          if (type.includes('*')) {
            // Handle wildcards like 'image/*'
            const category = type.split('/')[0];
            return file.mimetype.startsWith(category + '/');
          }
          return file.mimetype === type;
        });

        if (!isValidType) {
          return res.status(400).json({
            success: false,
            message: `File ${file.name} has invalid type. Allowed types: ${allowedTypes.join(', ')}`
          });
        }
      }
    }

    next();
  };
};

/**
 * Image validation middleware
 * Only allows image files
 */
export const validateImages = validateFiles([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]);

/**
 * Document validation middleware
 * Only allows PDF and DOC files
 */
export const validateDocuments = validateFiles([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

/**
 * Combined validation for posts (images and documents)
 */
export const validatePostFiles = (req, res, next) => {
  if (!req.files) {
    return next();
  }

  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Validate images
  if (req.files.images) {
    const images = Array.isArray(req.files.images) 
      ? req.files.images 
      : [req.files.images];

    for (const image of images) {
      if (!allowedImageTypes.includes(image.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid image type: ${image.name}. Allowed: JPG, PNG, GIF, WebP`
        });
      }
      
      if (image.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `Image ${image.name} exceeds 10MB size limit`
        });
      }
    }
  }

  // Validate documents
  if (req.files.documents) {
    const documents = Array.isArray(req.files.documents) 
      ? req.files.documents 
      : [req.files.documents];

    for (const doc of documents) {
      if (!allowedDocTypes.includes(doc.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid document type: ${doc.name}. Allowed: PDF, DOC, DOCX`
        });
      }
      
      if (doc.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `Document ${doc.name} exceeds 10MB size limit`
        });
      }
    }
  }

  next();
};

/**
 * Cleanup temp files after request
 * Removes temporary uploaded files
 */
export const cleanupTempFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Clean up temp files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const fileOrFiles = req.files[key];
        const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
        
        files.forEach(file => {
          if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            fs.unlink(file.tempFilePath, (err) => {
              if (err) console.error('Error deleting temp file:', err);
            });
          }
        });
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Express app configuration with file upload
 * Usage in your main server file:
 * 
 * import express from 'express';
 * import { fileUploadOptions, validatePostFiles, cleanupTempFiles } from './middleware/fileUpload.js';
 * 
 * const app = express();
 * 
 * // Global file upload middleware
 * app.use(fileUpload(fileUploadOptions));
 * app.use(cleanupTempFiles);
 * 
 * // Then in your routes:
 * router.post('/posts', validatePostFiles, postController.createPost);
 */

export default {
  fileUploadOptions,
  validateFiles,
  validateImages,
  validateDocuments,
  validatePostFiles,
  cleanupTempFiles
};