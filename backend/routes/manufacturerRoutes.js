import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { Manufacturer } from '../models/manufacturer.js';
import {User}from '../models/Users.js'; 
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/manufacturers/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only certain file types
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed!'));
    }
  }
});

// POST /api/manufacturers/register
router.post('/register', 
  authenticateToken, // Ensure user is authenticated
  upload.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
    { name: 'qualityCertifications', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      console.log('User from auth:', req.user); // Debug log
      console.log('Request body:', req.body); // Debug log
      console.log('Uploaded files:', req.files); // Debug log

      const {
        businessName,
        businessType,
        yearEstablished,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        contactPerson,
        email,
        phone
      } = req.body;

      // Validate required fields
      if (!businessName || !businessType || !yearEstablished || !streetAddress || 
          !city || !state || !postalCode || !country || !contactPerson || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if required files are uploaded
      if (!req.files?.businessLicense || !req.files?.taxCertificate) {
        return res.status(400).json({
          success: false,
          message: 'Business license and tax certificate are required'
        });
      }

      // Check if user is already a manufacturer
      const existingManufacturer = await Manufacturer.findOne({ userId: req.userId });
      if (existingManufacturer) {
        return res.status(400).json({
          success: false,
          message: 'You are already registered as a manufacturer'
        });
      }

      // Prepare documents data
      const documents = {
        businessLicense: {
          filename: req.files.businessLicense[0].originalname,
          path: req.files.businessLicense[0].path,
          uploadDate: new Date()
        },
        taxCertificate: {
          filename: req.files.taxCertificate[0].originalname,
          path: req.files.taxCertificate[0].path,
          uploadDate: new Date()
        },
        qualityCertifications: []
      };

      // Handle quality certifications if provided
      if (req.files.qualityCertifications) {
        documents.qualityCertifications = req.files.qualityCertifications.map(file => ({
          filename: file.originalname,
          path: file.path,
          certificationType: 'General', // You might want to make this dynamic
          uploadDate: new Date()
        }));
      }

      // Create manufacturer record
      const manufacturer = new Manufacturer({
        userId: req.userId,
        businessName,
        businessType,
        yearEstablished: parseInt(yearEstablished),
        address: {
          streetAddress,
          city,
          state,
          postalCode,
          country
        },
        contact: {
          contactPerson,
          email,
          phone
        },
        documents,
        status: 'pending'
      });

      await manufacturer.save();

      // Update user's manufacturer status
      await User.findByIdAndUpdate(req.userId, { isManufacturer: true });

      res.status(201).json({
        success: true,
        message: 'Manufacturer registration submitted successfully',
        data: {
          manufacturerId: manufacturer._id,
          status: manufacturer.status
        }
      });

    } catch (error) {
      console.error('Manufacturer registration error:', error);
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error during manufacturer registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// GET /api/manufacturers/all - Get all manufacturers (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const manufacturers = await Manufacturer.find({})
      .populate('userId', 'email username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: manufacturers,
      count: manufacturers.length
    });
  } catch (error) {
    console.error('Get all manufacturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET /api/manufacturers/me - Get current user's manufacturer info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const manufacturer = await Manufacturer.findOne({ userId: req.userId });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found'
      });
    }

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('Get manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
// GET /api/manufacturers/:id - Get manufacturer by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const manufacturer = await Manufacturer.findById(id)
      .populate('userId', 'email username');

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('Get manufacturer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.get('/documents/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'manufacturers', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving document'
    });
  }
});

// PATCH /api/manufacturers/:id/status - Update manufacturer status
// Enhanced document download route with better error handling and security
router.get('/documents/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // First, find the manufacturer record that contains this document
    const manufacturer = await Manufacturer.findOne({
      $or: [
        { 'documents.businessLicense.filename': filename },
        { 'documents.taxCertificate.filename': filename },
        { 'documents.qualityCertifications.filename': filename }
      ]
    });

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Document not found in records'
      });
    }

    // Check if user has permission to access this document
    // Allow access if: user is the manufacturer owner, or user is admin
    if (manufacturer.userId.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the actual file path from the document record
    let actualFilePath = null;
    
    // Check business license
    if (manufacturer.documents.businessLicense?.filename === filename) {
      actualFilePath = manufacturer.documents.businessLicense.path;
    }
    // Check tax certificate
    else if (manufacturer.documents.taxCertificate?.filename === filename) {
      actualFilePath = manufacturer.documents.taxCertificate.path;
    }
    // Check quality certifications
    else {
      const qualityCert = manufacturer.documents.qualityCertifications?.find(
        cert => cert.filename === filename
      );
      if (qualityCert) {
        actualFilePath = qualityCert.path;
      }
    }

    if (!actualFilePath) {
      return res.status(404).json({
        success: false,
        message: 'Document path not found'
      });
    }

    // Resolve the full file path
    const fullPath = path.resolve(actualFilePath);
    
    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.resolve('uploads/manufacturers/');
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid file path'
      });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found at path: ${fullPath}`);
      return res.status(404).json({
        success: false,
        message: 'Physical file not found on server'
      });
    }

    // Get file stats for additional info
    const stats = fs.statSync(fullPath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    // Set appropriate content type based on file extension
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(fullPath);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while serving document'
    });
  }
});

// Alternative route: Download by document ID (more secure)
router.get('/documents/:manufacturerId/:documentType/:documentId?', authenticateToken, async (req, res) => {
  try {
    const { manufacturerId, documentType, documentId } = req.params;
    
    const manufacturer = await Manufacturer.findById(manufacturerId);
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Check permissions
    if (manufacturer.userId.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let documentInfo = null;
    
    switch (documentType) {
      case 'business-license':
        documentInfo = manufacturer.documents.businessLicense;
        break;
      case 'tax-certificate':
        documentInfo = manufacturer.documents.taxCertificate;
        break;
      case 'quality-certification':
        if (documentId) {
          documentInfo = manufacturer.documents.qualityCertifications.find(
            cert => cert._id.toString() === documentId
          );
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
    }

    if (!documentInfo) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const filePath = path.resolve(documentInfo.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found'
      });
    }

    // Set headers and send file
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${documentInfo.filename}"`);
    
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error serving document by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Utility route to list all documents for a manufacturer
router.get('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const manufacturer = await Manufacturer.findById(id);
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Check permissions
    if (manufacturer.userId.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const documents = {
      businessLicense: manufacturer.documents.businessLicense ? {
        filename: manufacturer.documents.businessLicense.filename,
        uploadDate: manufacturer.documents.businessLicense.uploadDate,
        downloadUrl: `/api/manufacturers/documents/${manufacturer.documents.businessLicense.filename}`
      } : null,
      taxCertificate: manufacturer.documents.taxCertificate ? {
        filename: manufacturer.documents.taxCertificate.filename,
        uploadDate: manufacturer.documents.taxCertificate.uploadDate,
        downloadUrl: `/api/manufacturers/documents/${manufacturer.documents.taxCertificate.filename}`
      } : null,
      qualityCertifications: manufacturer.documents.qualityCertifications?.map(cert => ({
        id: cert._id,
        filename: cert.filename,
        certificationType: cert.certificationType,
        uploadDate: cert.uploadDate,
        downloadUrl: `/api/manufacturers/documents/${cert.filename}`
      })) || []
    };

    res.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Error listing documents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    // Find and update manufacturer
    const manufacturer = await Manufacturer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'email username');

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    res.json({
      success: true,
      message: `Manufacturer status updated to ${status}`,
      data: manufacturer
    });

  } catch (error) {
    console.error('Error updating manufacturer status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status'
    });
  }
});

export default router;