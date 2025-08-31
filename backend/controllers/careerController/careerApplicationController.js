  import Job from '../../models/career/job.js';
  import Application from '../../models/career/careerApplication.js';
  import multer from 'multer';
  import path from 'path';
  import { fileURLToPath } from 'url';

  // A helper to get the directory name in ES modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Note: The 'uploads/resumes/' directory must exist
      cb(null, path.join(__dirname, '..', '..', 'uploads', 'resumes'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  export const upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /pdf|doc|docx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
      }
    }
  });

  // Submit new application
  export const submitApplication = async (req, res) => {
    try {
      const { jobId } = req.params;
      const {
        name,
        email,
        phone,
        experience,
        linkedin,
        portfolio,
        coverLetter
      } = req.body;
      
      // Check if job exists and is active
      const job = await Job.findById(jobId);
      if (!job || !job.isActive) {
        return res.status(404).json({ message: 'Job not found or no longer active' });
      }
      
      // Check for duplicate application
      const existingApplication = await Application.findOne({
        jobId,
        'applicantInfo.email': email.toLowerCase()
      });
      
      if (existingApplication) {
        return res.status(409).json({ 
          message: 'You have already applied for this position',
          applicationId: existingApplication._id
        });
      }
      
      // Create application
      const newApplication = new Application({
        jobId,
        applicantInfo: {
          name,
          email: email.toLowerCase(),
          phone,
          experience,
          linkedin,
          portfolio
        },
        coverLetter,
        resume: req.file ? {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        } : undefined
      });
      
      const savedApplication = await newApplication.save();
      
      // Update job application count
      await Job.findByIdAndUpdate(jobId, {
        $inc: { applicationsCount: 1 }
      });
      
      // Send confirmation email (implement email service)
      // await sendApplicationConfirmationEmail(savedApplication);
      
      res.status(201).json({
        message: 'Application submitted successfully',
        applicationId: savedApplication._id,
        status: savedApplication.status
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({ message: 'Error submitting application', error: error.message });
    }
  };

  // Get all applications (Admin only)
  export const getAllApplications = async (req, res) => {
    try {
      const { 
        status, 
        jobId, 
        department, 
        page = 1, 
        limit = 20,
        sortBy = 'applicationDate',
        sortOrder = 'desc'
      } = req.query;
      
      let query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (jobId) {
        query.jobId = jobId;
      }
      
      const applications = await Application.find(query)
        .populate('jobId', 'title department location salary')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      // Filter by department if specified
      let filteredApplications = applications;
      if (department) {
        filteredApplications = applications.filter(app => 
          app.jobId && app.jobId.department === department
        );
      }
      
      const totalApplications = await Application.countDocuments(query);
      
      res.json({
        applications: filteredApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: page,
        totalApplications
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ message: 'Error fetching applications', error: error.message });
    }
  };

  // Get single application by ID (Admin only)
  export const getApplicationById = async (req, res) => {
    try {
      const { id } = req.params;
      
      const application = await Application.findById(id)
        .populate('jobId')
        .populate('reviewNotes.reviewer', 'name email')
        .populate('interview.interviewer', 'name email');
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      res.json(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ message: 'Error fetching application details', error: error.message });
    }
  };

  // Update application status (Admin only)
  export const updateApplicationStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNote, rating } = req.body;
      
      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      application.status = status;
      
      if (reviewNote) {
        application.reviewNotes.push({
          reviewer: req.user.id,
          note: reviewNote,
          rating: rating
        });
      }
      
      const updatedApplication = await application.save();
      
      // Send status update email to applicant
      // await sendStatusUpdateEmail(updatedApplication);
      
      res.json({
        message: 'Application status updated successfully',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ message: 'Error updating application status', error: error.message });
    }
  };

  // Schedule interview (Admin only)
  export const scheduleInterview = async (req, res) => {
    try {
      const { id } = req.params;
      const { date, time, interviewer, mode } = req.body;
      
      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      application.interview = {
        scheduled: true,
        date: new Date(date),
        time,
        interviewer,
        mode
      };
      
      application.status = 'Interview Scheduled';
      
      const updatedApplication = await application.save();
      
      // Send interview email
      // await sendInterviewScheduleEmail(updatedApplication);
      
      res.json({
        message: 'Interview scheduled successfully',
        application: updatedApplication
      });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(500).json({ message: 'Error scheduling interview', error: error.message });
    }
  };

  // Get application analytics (Admin only)
  export const getApplicationAnalytics = async (req, res) => {
    try {
      const totalApplications = await Application.countDocuments();
      
      const statusBreakdown = await Application.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const departmentApplications = await Application.aggregate([
        {
          $lookup: {
            from: 'jobs',
            localField: 'jobId',
            foreignField: '_id',
            as: 'job'
          }
        },
        { $unwind: '$job' },
        { $group: { _id: '$job.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      const recentApplications = await Application.aggregate([
        {
          $match: {
            applicationDate: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$applicationDate' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      res.json({
        totalApplications,
        statusBreakdown,
        departmentApplications,
        recentApplications
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Error fetching analytics', error: error.message });
    }
  };
