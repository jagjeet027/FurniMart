import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';
import { Manufacturer } from '../models/manufacturer.js';
import { User } from '../models/Users.js'; 
import { sendStatusEmail } from '../services/emailService.js';
import fs from 'fs';
import { createManufacturerNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/manufacturers/')
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

// GET /api/manufacturers/all - ADMIN ONLY
router.get('/all', adminAuth, async (req, res) => {
  try {
    console.log('=== GET ALL MANUFACTURERS (ADMIN) ===');
    console.log('Admin:', req.admin.email);

    const manufacturers = await Manufacturer.find({})
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${manufacturers.length} manufacturers`);

    res.json({
      success: true,
      data: manufacturers,
      count: manufacturers.length
    });
  } catch (error) {
    console.error('❌ Get all manufacturers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/manufacturers/me - Get current user's manufacturer info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    console.log('=== GET MY MANUFACTURER INFO ===');
    console.log('User ID:', req.userId);

    const manufacturer = await Manufacturer.findOne({ userId: req.userId })
      .lean();
    
    if (!manufacturer) {
      console.log('❌ Manufacturer profile not found');
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found'
      });
    }

    console.log('✅ Found manufacturer:', manufacturer.businessName);

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('❌ Get manufacturer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/register', 
  authenticateToken,
  upload.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
    { name: 'qualityCertifications', maxCount: 5 }
  ]),
  async (req, res) => {
    try {
      console.log('=== MANUFACTURER REGISTRATION ===');
      console.log('User ID:', req.userId);

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
        console.log('❌ Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      // Check if required files are uploaded
      if (!req.files?.businessLicense || !req.files?.taxCertificate) {
        console.log('❌ Missing required files');
        return res.status(400).json({
          success: false,
          message: 'Business license and tax certificate are required'
        });
      }

      // Check if user is already a manufacturer
      const existingManufacturer = await Manufacturer.findOne({ userId: req.userId });
      if (existingManufacturer) {
        console.log('❌ User already registered as manufacturer');
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
          certificationType: 'General',
          uploadDate: new Date()
        }));
      }

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

      // Create notification for admin
      await createManufacturerNotification('new_registration', manufacturer);

      console.log('✅ Manufacturer registered successfully');

      res.status(201).json({
        success: true,
        message: 'Manufacturer registration submitted successfully',
        data: {
          manufacturerId: manufacturer._id,
          status: manufacturer.status
        }
      });

    } catch (error) {
      console.error('❌ Manufacturer registration error:', error);
      
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

// GET /api/manufacturers/:id - Get manufacturer by ID (Admin or Owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== GET MANUFACTURER BY ID ===');
    console.log('Manufacturer ID:', id);
    console.log('Requesting user:', req.userId);
    
    const manufacturer = await Manufacturer.findById(id)
      .populate('userId', 'email name')
      .lean();

    if (!manufacturer) {
      console.log('❌ Manufacturer not found');
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Check if user has permission to view this manufacturer
    if (manufacturer.userId._id.toString() !== req.userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    console.log('✅ Found manufacturer:', manufacturer.businessName);

    res.json({
      success: true,
      data: manufacturer
    });
  } catch (error) {
    console.error('❌ Get manufacturer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Document download route
router.get('/documents/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('=== DOWNLOAD DOCUMENT ===');
    console.log('Filename:', filename);
    console.log('User:', req.userId);
    
    const manufacturer = await Manufacturer.findOne({
      $or: [
        { 'documents.businessLicense.filename': filename },
        { 'documents.taxCertificate.filename': filename },
        { 'documents.qualityCertifications.filename': filename }
      ]
    }).lean();

    if (!manufacturer) {
      console.log('❌ Document not found in records');
      return res.status(404).json({
        success: false,
        message: 'Document not found in records'
      });
    }

    // Check permission
    if (manufacturer.userId.toString() !== req.userId && !req.user.isAdmin) {
      console.log('❌ Access denied');
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the actual file path
    let actualFilePath = null;
    
    if (manufacturer.documents.businessLicense?.filename === filename) {
      actualFilePath = manufacturer.documents.businessLicense.path;
    } else if (manufacturer.documents.taxCertificate?.filename === filename) {
      actualFilePath = manufacturer.documents.taxCertificate.path;
    } else {
      const qualityCert = manufacturer.documents.qualityCertifications?.find(
        cert => cert.filename === filename
      );
      if (qualityCert) {
        actualFilePath = qualityCert.path;
      }
    }

    if (!actualFilePath || !fs.existsSync(actualFilePath)) {
      console.log('❌ File not found');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Security check
    const fullPath = path.resolve(actualFilePath);
    const uploadsDir = path.resolve('uploads/manufacturers/');
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Invalid file path'
      });
    }

    const stats = fs.statSync(fullPath);
    const fileExtension = path.extname(filename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf': contentType = 'application/pdf'; break;
      case '.jpg':
      case '.jpeg': contentType = 'image/jpeg'; break;
      case '.png': contentType = 'image/png'; break;
      case '.doc': contentType = 'application/msword'; break;
      case '.docx': contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('❌ Error serving document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while serving document'
    });
  }
});

router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('=== UPDATE MANUFACTURER STATUS ===');
    console.log('Manufacturer ID:', id);
    console.log('New Status:', status);
    console.log('Admin:', req.admin.email);

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    // Find manufacturer to get userId and contact info
    const manufacturer = await Manufacturer.findById(id).populate('userId', 'email name');
    if (!manufacturer) {
      console.log('❌ Manufacturer not found');
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Store previous status for notification
    const previousStatus = manufacturer.status;

    // Update manufacturer status
    manufacturer.status = status;
    await manufacturer.save();

    // Update user's isManufacturer status
    if (status === 'approved') {
      await User.findByIdAndUpdate(manufacturer.userId._id, { isManufacturer: true });
      console.log('✅ User updated to manufacturer');
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(manufacturer.userId._id, { isManufacturer: false });
      console.log('✅ User manufacturer status revoked');
    }

    // Send email notification using your email service
    try {
      const emailResult = await sendStatusEmail(
        manufacturer.contact.email, 
        status, 
        manufacturer._id
      );
      console.log('✅ Status email sent successfully:', emailResult.messageId);
    } catch (emailError) {
      console.error('❌ Failed to send status email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // Create notification for status change
    if (previousStatus !== status) {
      await createManufacturerNotification(status, manufacturer, req.admin._id);
    }

    console.log('✅ Status updated successfully');

    res.json({
      success: true,
      message: `Manufacturer status updated to ${status}`,
      data: {
        id: manufacturer._id,
        businessName: manufacturer.businessName,
        status: manufacturer.status,
        userId: manufacturer.userId._id,
        userEmail: manufacturer.contact.email
      }
    });

  } catch (error) {
    console.error('❌ Error updating manufacturer status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/manufacturers/:id - Delete manufacturer (ADMIN ONLY)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== DELETE MANUFACTURER ===');
    console.log('Manufacturer ID:', id);
    console.log('Admin:', req.admin.email);

    // Find manufacturer to get file paths and userId
    const manufacturer = await Manufacturer.findById(id);
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer not found'
      });
    }

    // Delete associated files
    const filesToDelete = [];
    
    if (manufacturer.documents.businessLicense?.path) {
      filesToDelete.push(manufacturer.documents.businessLicense.path);
    }
    
    if (manufacturer.documents.taxCertificate?.path) {
      filesToDelete.push(manufacturer.documents.taxCertificate.path);
    }
    
    if (manufacturer.documents.qualityCertifications) {
      manufacturer.documents.qualityCertifications.forEach(cert => {
        if (cert.path) filesToDelete.push(cert.path);
      });
    }

    // Delete files from filesystem
    filesToDelete.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Deleted file: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Error deleting file ${filePath}:`, error);
      }
    });

    // Delete manufacturer record
    await Manufacturer.findByIdAndDelete(id);

    // Update user's isManufacturer status to false
    await User.findByIdAndUpdate(manufacturer.userId, { isManufacturer: false });

    console.log('✅ Manufacturer deleted successfully');

    res.json({
      success: true,
      message: 'Manufacturer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting manufacturer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting manufacturer',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;