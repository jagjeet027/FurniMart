import express from 'express';
import Job from '../../models/career/job.js';
import Application from '../../models/career/careerApplication.js';
import * as jobController from '../../controllers/careerController/jobController.js';
import * as applicationController from '../../controllers/careerController/careerApplicationController.js';
// import { authenticateToken, isAdmin } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();


// Public routes - No authentication required for viewing jobs
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/:id', jobController.getJobById);
router.get('/departments', jobController.getDepartments);

router.post('/jobs', jobController.createJob);
router.put('/jobs/:id', jobController.updateJob);
router.delete('/jobs/:id',  jobController.deleteJob);
router.get('/admin/jobs/stats', jobController.getJobStats);

router.post('/jobs/:jobId/apply',
  applicationController.upload.single('resume'),
  applicationController.submitApplication
);

router.get('/admin/applications',
  applicationController.getAllApplications
);

router.get('/admin/applications/:id',
  applicationController.getApplicationById
);

router.put('/admin/applications/:id/status',
  applicationController.updateApplicationStatus
);

router.post('/admin/applications/:id/interview',
  applicationController.scheduleInterview
);

router.get('/admin/analytics',
  applicationController.getApplicationAnalytics
);


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
        size: req.file.size
      }
    });
  }
);

router.get('/admin/resume/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../uploads/resumes/', filename);
  
  res.download(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});


router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
    }
  }
  
  res.status(500).json({ message: 'Server error', error: error.message });
});

export default router;
