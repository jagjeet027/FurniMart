import express from 'express';
import Job from '../../models/career/job.js';
import Application from '../../models/career/careerApplication.js';
import * as jobController from '../../controllers/careerController/jobController.js';
import * as applicationController from '../../controllers/careerController/careerApplicationController.js';
import multer from 'multer';
// import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes - No authentication required for viewing jobs
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);
router.get('/departments', jobController.getDepartments);

// Job management routes (Admin)
router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id', jobController.deleteJob);

// IMPORTANT: Stats routes must come BEFORE parameterized routes
router.get('/admin/jobs/stats', jobController.getJobStats);
router.get('/admin/applications/stats', applicationController.getApplicationStats);

// Application routes
router.post('/jobs/:jobId/apply',
  applicationController.upload.single('resume'),
  applicationController.submitApplication
);

// Admin application management routes
router.get('/admin/applications', applicationController.getAllApplications);

// IMPORTANT: Specific routes (stats, resume) must come before parameterized routes (:id)
router.get('/admin/resume/:filename', applicationController.downloadResume);

// Parameterized routes come AFTER specific routes
router.get('/admin/applications/:id', applicationController.getApplicationById);
router.put('/admin/applications/:id/status', applicationController.updateApplicationStatus);

// File upload test route
router.post('/upload-resume',
  applicationController.upload.single('resume'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  }
);

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  res.status(500).json({ message: 'Server error', error: error.message });
});

export default router;