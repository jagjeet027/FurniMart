const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Organization = require('../models/Organization');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/organizations');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// POST /api/organizations/submit - Submit new organization
router.post('/submit', upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      organizationName,
      organizationType,
      registrationNumber,
      establishedYear,
      contactPerson,
      designation,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      zipCode,
      loanTypes,
      minLoanAmount,
      maxLoanAmount,
      interestRateRange,
      description,
      specialPrograms,
      eligibilityCriteria
    } = req.body;

    // Validate required fields
    const requiredFields = {
      organizationName,
      organizationType,
      contactPerson,
      email,
      phone,
      address,
      city,
      country,
      loanTypes
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        missingFields
      });
    }

    // Parse loanTypes if it's a string
    const parsedLoanTypes = typeof loanTypes === 'string' ? JSON.parse(loanTypes) : loanTypes;

    if (!Array.isArray(parsedLoanTypes) || parsedLoanTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one loan type must be selected'
      });
    }

    // Process uploaded files
    const documents = {};
    if (req.files) {
      if (req.files.license) {
        documents.license = {
          filename: req.files.license[0].filename,
          originalName: req.files.license[0].originalname,
          path: req.files.license[0].path,
          uploadedAt: new Date()
        };
      }
      if (req.files.certificate) {
        documents.certificate = {
          filename: req.files.certificate[0].filename,
          originalName: req.files.certificate[0].originalname,
          path: req.files.certificate[0].path,
          uploadedAt: new Date()
        };
      }
    }

    // Get client IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.get('User-Agent');

    // Create new organization submission
    const organizationData = {
      organizationName,
      organizationType,
      registrationNumber: registrationNumber || undefined,
      establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
      
      // Contact Information
      contactPerson,
      designation: designation || undefined,
      email: email.toLowerCase(),
      phone,
      website: website || undefined,
      
      // Address
      address: {
        street: address,
        city,
        state: state || undefined,
        country,
        zipCode: zipCode || undefined
      },
      
      // Loan Products
      loanTypes: parsedLoanTypes,
      minLoanAmount: minLoanAmount ? parseInt(minLoanAmount) : undefined,
      maxLoanAmount: maxLoanAmount ? parseInt(maxLoanAmount) : undefined,
      interestRateRange: interestRateRange || undefined,
      
      // Additional Information
      description: description || undefined,
      specialPrograms: specialPrograms || undefined,
      eligibilityCriteria: eligibilityCriteria || undefined,
      
      // Documents and metadata
      documents: Object.keys(documents).length > 0 ? documents : undefined,
      ipAddress,
      userAgent,
      status: 'pending'
    };

    const organization = new Organization(organizationData);
    const savedOrganization = await organization.save();

    // Send confirmation email (implement email service)
    await sendConfirmationEmail(email, organizationName, savedOrganization._id);

    // Notify admin (implement admin notification)
    await notifyAdmin(savedOrganization);

    res.status(201).json({
      success: true,
      message: 'Organization application submitted successfully',
      submissionId: savedOrganization._id,
      data: {
        id: savedOrganization._id,
        organizationName: savedOrganization.organizationName,
        submissionDate: savedOrganization.createdAt,
        status: savedOrganization.status
      }
    });

  } catch (error) {
    console.error('Error submitting organization:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to submit organization application',
      message: error.message
    });
  }
});

// GET /api/organizations/submissions - Get all submissions (admin only)
router.get('/submissions', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    // Build sort object
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [submissions, totalCount] = await Promise.all([
      Organization.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-userAgent -ipAddress') // Exclude sensitive data
        .lean(),
      Organization.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: submissions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalSubmissions: totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: skip > 0
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions',
      message: error.message
    });
  }
});

// GET /api/organizations/submissions/:id - Get specific submission
router.get('/submissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID format'
      });
    }
    
    const submission = await Organization.findById(id).select('-userAgent -ipAddress').lean();
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submission',
      message: error.message
    });
  }
});

// PUT /api/organizations/submissions/:id/review - Review submission (admin only)
router.put('/submissions/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, reviewerName } = req.body;
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID format'
      });
    }
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be either "approved" or "rejected"'
      });
    }
    
    const organization = await Organization.findById(id);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found'
      });
    }
    
    // Update organization using the model methods
    let updatedOrganization;
    if (status === 'approved') {
      updatedOrganization = await organization.approve(reviewerName || 'Admin', reviewNotes);
    } else {
      updatedOrganization = await organization.reject(reviewerName || 'Admin', reviewNotes);
    }
    
    // Send notification email to organization
    await sendReviewNotificationEmail(
      updatedOrganization.email,
      updatedOrganization.organizationName,
      status,
      reviewNotes
    );
    
    // If approved, add to loan providers list
    if (status === 'approved') {
      await addApprovedOrganization(updatedOrganization);
    }
    
    res.json({
      success: true,
      message: `Organization ${status} successfully`,
      data: {
        id: updatedOrganization._id,
        organizationName: updatedOrganization.organizationName,
        status: updatedOrganization.status,
        reviewedBy: updatedOrganization.reviewedBy,
        reviewedAt: updatedOrganization.reviewedAt,
        reviewNotes: updatedOrganization.reviewNotes
      }
    });

  } catch (error) {
    console.error('Error reviewing submission:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review submission',
      message: error.message
    });
  }
});

// GET /api/organizations/stats - Get submission statistics
router.get('/stats', async (req, res) => {
  try {
    // Use the Organization model's getStats method
    const [aggregatedStats] = await Organization.getStats();
    
    // Extract counts from aggregation results
    const stats = {
      total: aggregatedStats.total[0]?.count || 0,
      pending: aggregatedStats.pending[0]?.count || 0,
      approved: aggregatedStats.approved[0]?.count || 0,
      rejected: aggregatedStats.rejected[0]?.count || 0,
      
      byType: aggregatedStats.byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      byCountry: aggregatedStats.byCountry.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      
      recentSubmissions: aggregatedStats.recentSubmissions.map(sub => ({
        id: sub._id,
        organizationName: sub.organizationName,
        organizationType: sub.organizationType,
        country: sub.address?.country,
        submissionDate: sub.createdAt,
        status: sub.status
      }))
    };
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Helper functions
async function sendConfirmationEmail(email, organizationName, submissionId) {
  // Implement email service (e.g., using nodemailer, SendGrid, etc.)
  console.log(`Sending confirmation email to ${email} for ${organizationName} (ID: ${submissionId})`);
  
  // Email template example:
  const emailContent = `
    Dear ${organizationName} Team,
    
    Thank you for submitting your organization for inclusion in our loan comparison platform.
    
    Submission ID: ${submissionId}
    Organization: ${organizationName}
    
    We will review your application within 2-3 business days and get back to you.
    
    Best regards,
    LoanCompare Team
  `;
  
  // TODO: Implement actual email sending
  return Promise.resolve();
}

async function sendReviewNotificationEmail(email, organizationName, status, reviewNotes) {
  console.log(`Sending review notification to ${email} - Status: ${status}`);
  
  const emailContent = status === 'approved' 
    ? `Congratulations! ${organizationName} has been approved and added to our platform.`
    : `We regret to inform you that ${organizationName} application was not approved. ${reviewNotes || ''}`;
  
  // TODO: Implement actual email sending
  return Promise.resolve();
}

async function notifyAdmin(submission) {
  console.log(`New organization submission: ${submission.organizationName} (ID: ${submission._id})`);
  
  // TODO: Implement admin notification (email, Slack, etc.)
  return Promise.resolve();
}

async function addApprovedOrganization(submission) {
  console.log(`Adding approved organization to loan providers: ${submission.organizationName}`);
  
  // TODO: Add organization to the main loan providers database/list
  // This would typically involve creating loan products based on the submission data
  
  return Promise.resolve();
}

module.exports = router;