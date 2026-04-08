import IndividualUser from '../../models/career/individualUser.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF and Word documents
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Register Individual User
export const registerIndividual = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      experienceLevel,
      city,
      state,
      linkedin,
      portfolio,
      skills
    } = req.body;

    // Check if user already exists
    const existingUser = await IndividualUser.findOne({ 'personalInfo.email': email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Parse skills if it's a JSON string
    let skillsArray = [];
    if (skills) {
      try {
        skillsArray = typeof skills === 'string' ? JSON.parse(skills) : skills;
      } catch (error) {
        skillsArray = Array.isArray(skills) ? skills : [];
      }
    }

    // Prepare resume data if file was uploaded
    let resumeData = null;
    if (req.file) {
      resumeData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    // Create new individual user
    const user = new IndividualUser({
      personalInfo: {
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        email: email?.trim().toLowerCase(),
        phone: phone?.trim(),
        location: {
          city: city?.trim() || '',
          state: state?.trim() || ''
        }
      },
      professionalInfo: {
        experienceLevel,
        skills: skillsArray,
        linkedin: linkedin?.trim() || '',
        portfolio: portfolio?.trim() || '',
        resume: resumeData
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome aboard!',
      data: {
        user: {
          id: user._id,
          name: user.fullName,
          email: user.personalInfo.email,
          experienceLevel: user.professionalInfo.experienceLevel,
          registrationDate: user.registrationDate
        }
      }
    });

  } catch (error) {
    console.error('Individual registration error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// Get all registered individuals (for admin)
export const getAllIndividuals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', experienceLevel = '' } = req.query;
    
    const query = { isActive: true };
    
    // Add search filter
    if (search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'professionalInfo.skills': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add experience level filter
    if (experienceLevel) {
      query['professionalInfo.experienceLevel'] = experienceLevel;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [individuals, total] = await Promise.all([
      IndividualUser.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ registrationDate: -1 }),
      IndividualUser.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        individuals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalIndividuals: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get individuals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get individual by ID
export const getIndividualById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const individual = await IndividualUser.findById(id);
    
    if (!individual) {
      return res.status(404).json({
        success: false,
        message: 'Individual not found'
      });
    }

    res.json({
      success: true,
      data: { individual }
    });

  } catch (error) {
    console.error('Get individual by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Download resume
export const downloadResume = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    res.download(filePath);

  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get registration statistics
export const getRegistrationStats = async (req, res) => {
  try {
    const totalRegistrations = await IndividualUser.countDocuments({ isActive: true });
    
    // Get registrations by experience level
    const experienceStats = await IndividualUser.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$professionalInfo.experienceLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get registrations by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await IndividualUser.aggregate([
      { $match: { registrationDate: { $gte: sixMonthsAgo }, isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: '$registrationDate' },
            month: { $month: '$registrationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalRegistrations,
        experienceStats,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get registration stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};