// routes/manufacturerRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';
import flexibleAuth from '../middleware/flexibleAuth.js';
import {
  getMyManufacturer,
  registerManufacturer,
  getAllManufacturers,
  getManufacturerById,
  updateManufacturerStatus,
  deleteManufacturer,
  downloadDocument
} from '../controllers/manufacturerController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/manufacturers/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
      cb(new Error('Only images and documents (PDF, DOC, DOCX) are allowed!'));
    }
  }
});

// Admin routes - MUST come BEFORE /:id route
router.get('/all', adminAuth, getAllManufacturers);

// Protected routes
router.get('/me', authenticateToken, getMyManufacturer);

router.post('/register', 
  authenticateToken,
  upload.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxCertificate', maxCount: 1 },
    { name: 'qualityCertifications', maxCount: 5 }
  ]),
  registerManufacturer
);

// FIXED: Use flexibleAuth for document downloads (accepts both user and admin tokens)
router.get('/documents/:filename', flexibleAuth, downloadDocument);

// This MUST come after /all and other specific routes
router.get('/:id', authenticateToken, getManufacturerById);

// Admin routes
router.patch('/:id/status', adminAuth, updateManufacturerStatus);
router.delete('/:id', adminAuth, deleteManufacturer);

export default router;