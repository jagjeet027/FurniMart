// Fixed routes/organizationRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import Organization from '../../models/career/organization.js';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  addCandidate,
  updateCandidate,
  removeCandidate,
  getCandidatesByOrganization,
  getDashboardStats,
  bulkAddCandidates,
  processStudentFile
} from '../../controllers/careerController/organizationController.js';

const router = express.Router();

// Get current directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for different file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'logo') {
      cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    } else {
      cb(null, 'upload-' + uniqueSuffix + path.extname(file.originalname));
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed for logos'));
    }
  } else if (file.fieldname === 'file') {
    // Check Excel/CSV file types
    const allowedTypes = /xlsx|xls|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv'
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed'));
    }
  } else {
    cb(new Error('Invalid field name'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

const createStudentTemplate = () => {
  const templateData = [
    ['Name', 'Roll No', 'Email', 'Phone', 'Branch', 'Specialization', 'Year', 'CGPA', 'Skills'],
    ['John Doe', 'CS001', 'john.doe@email.com', '+91-9876543210', 'Computer Science', 'Machine Learning', '3rd Year', '8.5', 'Python, JavaScript, React'],
    ['Jane Smith', 'IT002', 'jane.smith@email.com', '+91-9876543211', 'Information Technology', 'Web Development', '2nd Year', '9.2', 'HTML, CSS, JavaScript, Node.js'],
    ['Bob Johnson', 'EC003', 'bob.johnson@email.com', '+91-9876543212', 'Electronics', 'Embedded Systems', '4th Year', '7.8', 'C, C++, Arduino, Raspberry Pi'],
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Name
    { wch: 10 }, // Roll No
    { wch: 25 }, // Email
    { wch: 15 }, // Phone
    { wch: 20 }, // Branch
    { wch: 20 }, // Specialization
    { wch: 12 }, // Year
    { wch: 8 },  // CGPA
    { wch: 30 }  // Skills
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

// Helper function to parse Excel/CSV files
const parseStudentFile = (filePath, originalName) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    });

    if (jsonData.length === 0) {
      throw new Error('File is empty');
    }

    // Get headers (first row)
    const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
    const dataRows = jsonData.slice(1);

    // Map common header variations
    const headerMap = {
      'name': ['name', 'student name', 'student_name', 'studentname', 'full name', 'fullname'],
      'rollno': ['roll no', 'rollno', 'roll_no', 'roll number', 'rollnumber', 'registration no', 'regno', 'reg_no'],
      'email': ['email', 'email address', 'email_address', 'e-mail', 'mail'],
      'phone': ['phone', 'mobile', 'contact', 'phone number', 'mobile number', 'contact number'],
      'branch': ['branch', 'department', 'dept', 'course', 'stream', 'discipline'],
      'specialization': ['specialization', 'specialisation', 'spec', 'major', 'concentration'],
      'year': ['year', 'academic year', 'current year', 'study year', 'class'],
      'cgpa': ['cgpa', 'gpa', 'grade', 'marks', 'percentage', 'score'],
      'skills': ['skills', 'skill', 'technologies', 'tech stack', 'programming languages']
    };

    // Find header indices
    const getHeaderIndex = (fieldName) => {
      const variations = headerMap[fieldName] || [fieldName];
      for (let variation of variations) {
        const index = headers.findIndex(h => h.includes(variation) || variation.includes(h));
        if (index !== -1) return index;
      }
      return -1;
    };

    const indices = {
      name: getHeaderIndex('name'),
      rollNo: getHeaderIndex('rollno'),
      email: getHeaderIndex('email'),
      phone: getHeaderIndex('phone'),
      branch: getHeaderIndex('branch'),
      specialization: getHeaderIndex('specialization'),
      year: getHeaderIndex('year'),
      cgpa: getHeaderIndex('cgpa'),
      skills: getHeaderIndex('skills')
    };

    // Validate required fields
    if (indices.name === -1) {
      throw new Error('Name column not found. Please ensure your file has a column with student names.');
    }
    if (indices.rollNo === -1) {
      throw new Error('Roll number column not found. Please ensure your file has a column with roll numbers.');
    }
    if (indices.branch === -1) {
      throw new Error('Branch column not found. Please ensure your file has a column with student branches.');
    }

    // Process data rows
    const students = [];
    const validationErrors = [];
    const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Biotechnology', 'Other'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated', 'Post Graduate'];

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skipped header
      
      // Skip empty rows
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        return;
      }

      const student = {};
      let hasErrors = false;

      // Extract data
      student.name = indices.name !== -1 ? String(row[indices.name] || '').trim() : '';
      student.rollNo = indices.rollNo !== -1 ? String(row[indices.rollNo] || '').trim() : '';
      student.email = indices.email !== -1 ? String(row[indices.email] || '').trim() : '';
      student.phone = indices.phone !== -1 ? String(row[indices.phone] || '').trim() : '';
      student.branch = indices.branch !== -1 ? String(row[indices.branch] || '').trim() : '';
      student.specialization = indices.specialization !== -1 ? String(row[indices.specialization] || '').trim() : '';
      student.year = indices.year !== -1 ? String(row[indices.year] || '').trim() : '';
      student.cgpa = indices.cgpa !== -1 ? String(row[indices.cgpa] || '').trim() : '';
      student.skills = indices.skills !== -1 ? String(row[indices.skills] || '').trim() : '';

      // Validate required fields
      if (!student.name) {
        validationErrors.push(`Row ${rowNumber}: Name is required`);
        hasErrors = true;
      }
      if (!student.rollNo) {
        validationErrors.push(`Row ${rowNumber}: Roll number is required`);
        hasErrors = true;
      }
      if (!student.branch) {
        validationErrors.push(`Row ${rowNumber}: Branch is required`);
        hasErrors = true;
      }

      // Validate email format
      if (student.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(student.email)) {
          validationErrors.push(`Row ${rowNumber}: Invalid email format`);
          hasErrors = true;
        }
      }

      // Validate branch
      if (student.branch && !branches.some(b => b.toLowerCase() === student.branch.toLowerCase())) {
        // Try to find close match
        const closeMatch = branches.find(b => 
          b.toLowerCase().includes(student.branch.toLowerCase()) || 
          student.branch.toLowerCase().includes(b.toLowerCase())
        );
        if (closeMatch) {
          student.branch = closeMatch;
        } else {
          student.branch = 'Other';
          validationErrors.push(`Row ${rowNumber}: Branch "${student.branch}" mapped to "Other". Valid branches: ${branches.join(', ')}`);
        }
      }

      // Validate year
      if (student.year && !years.some(y => y.toLowerCase() === student.year.toLowerCase())) {
        // Try to find close match or extract year number
        const yearMatch = student.year.match(/(\d+)/);
        if (yearMatch) {
          const yearNum = parseInt(yearMatch[1]);
          if (yearNum >= 1 && yearNum <= 4) {
            student.year = `${yearNum}${yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th'} Year`;
          }
        } else if (student.year.toLowerCase().includes('grad')) {
          student.year = 'Graduated';
        } else if (student.year.toLowerCase().includes('post')) {
          student.year = 'Post Graduate';
        } else {
          validationErrors.push(`Row ${rowNumber}: Invalid year "${student.year}". Valid years: ${years.join(', ')}`);
          student.year = '';
        }
      }

      // Validate and convert CGPA
      if (student.cgpa) {
        const cgpaNum = parseFloat(student.cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
          validationErrors.push(`Row ${rowNumber}: Invalid CGPA "${student.cgpa}". Should be between 0 and 10`);
          student.cgpa = '';
        } else {
          student.cgpa = cgpaNum.toString();
        }
      }

      // Process skills
      if (student.skills) {
        if (typeof student.skills === 'string') {
          student.skills = student.skills.split(',').map(s => s.trim()).filter(s => s);
        }
      } else {
        student.skills = [];
      }

      // Only add student if no critical errors
      if (!hasErrors || (student.name && student.rollNo && student.branch)) {
        students.push(student);
      }
    });

    return {
      success: true,
      data: students,
      validationErrors,
      totalRows: dataRows.length,
      validRows: students.length
    };

  } catch (error) {
    console.error('File parsing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to parse file'
    };
  }
};

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 10MB.'
      });
    }
  }
  
  if (error.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next(error);
};

// Test connection route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Download student template
router.get('/student-template', (req, res) => {
  try {
    const template = createStudentTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="student-template.xlsx"');
    res.send(template);
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
});

// Parse student file route
router.post('/parse-student-file', upload.single('file'), handleMulterError, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const result = parseStudentFile(req.file.path, req.file.originalname);
    
    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('File cleanup error:', err);
    });

    res.json(result);
  } catch (error) {
    console.error('Parse file error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('File cleanup error:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to parse file'
    });
  }
});

// Dashboard statistics route
router.get('/dashboard/stats', getDashboardStats);

// Organization CRUD routes
router.get('/', getAllOrganizations);
router.get('/:id', getOrganizationById);
router.post('/', upload.single('logo'), handleMulterError, createOrganization);
router.put('/:id', upload.single('logo'), handleMulterError, updateOrganization);
router.delete('/:id', deleteOrganization);

// Candidate routes
router.get('/:id/candidates', getCandidatesByOrganization);
router.post('/:id/candidates', addCandidate);
router.put('/:id/candidates/:candidateId', updateCandidate);
router.delete('/:id/candidates/:candidateId', removeCandidate);

// Bulk operations
router.post('/:id/candidates/bulk', bulkAddCandidates);

router.get('/:id/candidates/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'csv' } = req.query;

    // Validate organization ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID format'
      });
    }

    const organization = await Organization.findById(id);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const candidates = organization.candidates || [];

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Name,Roll No,Email,Phone,Branch,Specialization,Year,CGPA,Skills\n';
      const csvData = candidates.map(candidate => {
        const skills = Array.isArray(candidate.skills) ? candidate.skills.join(';') : '';
        return `"${candidate.name || ''}","${candidate.rollNo || ''}","${candidate.email || ''}","${candidate.phone || ''}","${candidate.branch || ''}","${candidate.specialization || ''}","${candidate.year || ''}","${candidate.cgpa || ''}","${skills}"`;
      }).join('\n');

      const csvContent = csvHeader + csvData;
      
      // Set proper headers for CSV
      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${organization.name.replace(/[^a-z0-9]/gi, '_')}-candidates.csv"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
      
      // Send CSV content
      return res.send(csvContent);
      
    } else if (format === 'excel') {
      // Convert to Excel format
      const excelData = [
        ['Name', 'Roll No', 'Email', 'Phone', 'Branch', 'Specialization', 'Year', 'CGPA', 'Skills'],
        ...candidates.map(candidate => [
          candidate.name || '',
          candidate.rollNo || '',
          candidate.email || '',
          candidate.phone || '',
          candidate.branch || '',
          candidate.specialization || '',
          candidate.year || '',
          candidate.cgpa || '',
          Array.isArray(candidate.skills) ? candidate.skills.join(', ') : ''
        ])
      ];

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Name
        { wch: 15 }, // Roll No
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 20 }, // Branch
        { wch: 20 }, // Specialization
        { wch: 12 }, // Year
        { wch: 8 },  // CGPA
        { wch: 30 }  // Skills
      ];
      worksheet['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Set proper headers for Excel
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${organization.name.replace(/[^a-z0-9]/gi, '_')}-candidates.xlsx"`);
      res.setHeader('Content-Length', excelBuffer.length);
      
      // Send Excel buffer
      return res.send(excelBuffer);
      
    } else {
      // Return JSON format
      res.json({
        success: true,
        data: {
          organization: {
            name: organization.name,
            type: organization.type,
            location: organization.location
          },
          candidates,
          exportedAt: new Date().toISOString(),
          totalCandidates: candidates.length
        }
      });
    }
  } catch (error) {
    console.error('Export candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export candidates'
    });
  }
});


router.get('/search/candidates', async (req, res) => {
  try {
    const { query, branch, year, cgpaMin, cgpaMax, skills, limit = 20 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }

    const matchStage = {
      isActive: true
    };

    const pipeline = [
      { $match: matchStage },
      { $unwind: '$candidates' }
    ];

    // Build candidate filter
    const candidateFilter = {};

    if (query) {
      candidateFilter.$or = [
        { 'candidates.name': { $regex: query, $options: 'i' } },
        { 'candidates.rollNo': { $regex: query, $options: 'i' } },
        { 'candidates.email': { $regex: query, $options: 'i' } }
      ];
    }

    if (branch) {
      candidateFilter['candidates.branch'] = branch;
    }

    if (year) {
      candidateFilter['candidates.year'] = year;
    }

    if (cgpaMin || cgpaMax) {
      candidateFilter['candidates.cgpa'] = {};
      if (cgpaMin) candidateFilter['candidates.cgpa'].$gte = parseFloat(cgpaMin);
      if (cgpaMax) candidateFilter['candidates.cgpa'].$lte = parseFloat(cgpaMax);
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      candidateFilter['candidates.skills'] = { $in: skillsArray };
    }

    if (Object.keys(candidateFilter).length > 0) {
      pipeline.push({ $match: candidateFilter });
    }

    pipeline.push(
      {
        $project: {
          candidate: '$candidates',
          organization: {
            id: '$_id',
            name: '$name',
            type: '$type',
            location: '$location'
          }
        }
      },
      { $limit: parseInt(limit) }
    );

    const results = await Organization.aggregate(pipeline);

    res.json({
      success: true,
      data: results,
      query: {
        searchTerm: query,
        filters: { branch, year, cgpaMin, cgpaMax, skills },
        totalResults: results.length
      }
    });
  } catch (error) {
    console.error('Search candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search candidates'
    });
  }
});

// Global error handler
router.use((error, req, res, next) => {
  console.error('Route error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default router;