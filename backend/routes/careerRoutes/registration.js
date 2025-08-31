import express from 'express';
import {
  registerIndividual,
  getAllIndividuals,
  getIndividualById,
  downloadResume,
  getRegistrationStats,
  upload
} from '../../controllers/careerController/registrationController.js';

const router = express.Router();

// Individual registration route
router.post('/register/individual', 
  upload.single('resume'), 
  registerIndividual
);

// Get all individuals (admin route)
router.get('/individuals', getAllIndividuals);

// Get individual by ID
router.get('/individuals/:id', getIndividualById);

// Download resume
router.get('/resume/:filename', downloadResume);

// Get registration statistics
router.get('/stats/registrations', getRegistrationStats);

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 10MB.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        message: 'Unexpected file field.' 
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid file type. Only PDF and Word documents are allowed.' 
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Server error', 
    error: error.message 
  });
});

export default router;