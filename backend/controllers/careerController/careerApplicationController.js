import Job from '../../models/career/job.js';
import Application from '../../models/career/careerApplication.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// A helper to get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const updateJobApplicationCount = async (jobId) => {
  try {
    const count = await Application.countDocuments({ jobId });
    await Job.findByIdAndUpdate(jobId, { applicationsCount: count });
  } catch (error) {
    console.error('Error updating job application count:', error);
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
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
      coverLetter,
      // Student details
      university,
      degree,
      graduationYear,
      cgpa,
      skills,
      address
    } = req.body;
    
    // Validation
    if (!name || !email || !phone || !experience || !coverLetter) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, phone, experience, and cover letter are required' 
      });
    }

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
    
    // Create application with all student details
    const newApplication = new Application({
      jobId,
      applicantInfo: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        experience: experience.trim(),
        linkedin: linkedin ? linkedin.trim() : undefined,
        portfolio: portfolio ? portfolio.trim() : undefined,
        // Student details
        university: university ? university.trim() : undefined,
        degree: degree ? degree.trim() : undefined,
        graduationYear: graduationYear ? graduationYear.trim() : undefined,
        cgpa: cgpa ? cgpa.trim() : undefined,
        skills: skills ? skills.trim() : undefined,
        address: address ? address.trim() : undefined
      },
      coverLetter: coverLetter.trim(),
      resume: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      } : undefined,
      status: 'submitted',
      applicationDate: new Date()
    });
    
    const savedApplication = await newApplication.save();
    
    // Update job application count
    await updateJobApplicationCount(jobId);
    
    // Send confirmation email (implement email service later)
    // await sendApplicationConfirmationEmail(savedApplication);
    
    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: savedApplication._id,
      status: savedApplication.status
    });
    
  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Clean up uploaded file if application creation fails
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error submitting application', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
      sortOrder = 'desc',
      search
    } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (jobId) {
      query.jobId = jobId;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { 'applicantInfo.name': { $regex: search, $options: 'i' } },
        { 'applicantInfo.email': { $regex: search, $options: 'i' } },
        { 'applicantInfo.university': { $regex: search, $options: 'i' } },
        { 'applicantInfo.degree': { $regex: search, $options: 'i' } }
      ];
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
      currentPage: parseInt(page),
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

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote, rating } = req.body;
    
    // Validate status
    const validStatuses = ['submitted', 'under-review', 'shortlisted', 'interview-scheduled', 'selected', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status', 
        validStatuses 
      });
    }
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    if (status) {
      application.status = status;
    }
    
    if (reviewNote) {
      application.reviewNotes.push({
        reviewer: req.user?.id || null,
        note: reviewNote,
        rating: rating || null,
        date: new Date()
      });
    }
    
    const updatedApplication = await application.save();
    
    // Update job application count
    await updateJobApplicationCount(application.jobId);
    
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

// Get application statistics
export const getApplicationStats = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    
    const statusStats = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const monthlyStats = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const universityStats = await Application.aggregate([
      { $match: { 'applicantInfo.university': { $ne: null } } },
      { $group: { _id: '$applicantInfo.university', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalApplications,
      statusStats,
      monthlyStats,
      universityStats
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ message: 'Error fetching application statistics', error: error.message });
  }
};

// Download resume file
export const downloadResume = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
    });
  } catch (error) {
    console.error('Error in downloadResume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};