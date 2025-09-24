// Complete Enhanced Organization Controller with proper error handling
import Organization from '../../models/career/organization.js';
import { validationResult } from 'express-validator';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Get all organizations
export const getAllOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get organizations with pagination
    const organizations = await Organization.find(filter)
      .select('-candidates')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Organization.countDocuments(filter);

    // Get statistics
    const stats = await Organization.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          totalCandidates: { $sum: { $size: '$candidates' } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: organizations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: stats[0] || { totalOrganizations: 0, totalCandidates: 0 }
    });
  } catch (error) {
    console.error('Get all organizations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organizations'
    });
  }
};

// Get organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const { id } = req.params;
    
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

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Get organization by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch organization'
    });
  }
};

// Create new organization
export const createOrganization = async (req, res) => {
  try {
    // Parse FormData structure from frontend
    let organizationData, candidates;
    
    try {
      organizationData = JSON.parse(req.body.organizationData);
      candidates = JSON.parse(req.body.candidates);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON data in request body'
      });
    }

    // Validate required fields
    if (!organizationData.name || !organizationData.email || !organizationData.phone || !organizationData.location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, phone, location'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organizationData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ 
      email: organizationData.email.toLowerCase() 
    });
    
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: 'Organization with this email already exists'
      });
    }

    // Add logo path if uploaded
    if (req.file) {
      organizationData.logo = `/uploads/${req.file.filename}`;
    }

    // Validate and process candidates data
    const processedCandidates = [];
    if (candidates && Array.isArray(candidates) && candidates.length > 0) {
      const rollNumbers = new Set();
      
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        
        // Validate required fields
        if (!candidate.name || !candidate.rollNo || !candidate.branch) {
          return res.status(400).json({
            success: false,
            error: `Invalid candidate data at index ${i}: Missing required fields (name, rollNo, branch)`
          });
        }

        // Check for duplicate roll numbers
        const rollNoLower = candidate.rollNo.toLowerCase();
        if (rollNumbers.has(rollNoLower)) {
          return res.status(400).json({
            success: false,
            error: `Duplicate roll number found: ${candidate.rollNo}`
          });
        }
        rollNumbers.add(rollNoLower);

        // Process skills
        if (typeof candidate.skills === 'string') {
          candidate.skills = candidate.skills.split(',').map(s => s.trim()).filter(s => s);
        } else if (!Array.isArray(candidate.skills)) {
          candidate.skills = [];
        }

        // Validate and convert CGPA
        if (candidate.cgpa) {
          const cgpaNum = parseFloat(candidate.cgpa);
          if (!isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 10) {
            candidate.cgpa = cgpaNum;
          } else {
            delete candidate.cgpa;
          }
        }

        // Validate email if provided
        if (candidate.email) {
          if (!emailRegex.test(candidate.email)) {
            return res.status(400).json({
              success: false,
              error: `Invalid email format for candidate at index ${i}: ${candidate.email}`
            });
          }
        }

        processedCandidates.push(candidate);
      }
    }

    // Create organization with candidates
    const organization = new Organization({
      ...organizationData,
      email: organizationData.email.toLowerCase(),
      candidates: processedCandidates
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        id: organization._id,
        name: organization.name,
        email: organization.email,
        candidatesCount: organization.candidates.length,
        registrationDate: organization.registrationDate,
        status: organization.status
      }
    });
  } catch (error) {
    console.error('Create organization error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('File cleanup error:', err);
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Organization with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to register organization'
    });
  }
};

// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID format'
      });
    }

    const updateData = { ...req.body };

    // Add logo path if uploaded
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      updateData.email = updateData.email.toLowerCase();
    }

    // Prevent updating candidates via this route
    delete updateData.candidates; 
    delete updateData.registrationDate;
    delete updateData.isActive;
    delete updateData.status;

    const organization = await Organization.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Organization with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update organization'
    });
  }
};

// Soft delete organization
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID format'
      });
    }
    const organization = await Organization.findByIdAndUpdate(
      id,
      { isActive: false, status: 'Inactive' },
      { new: true }
    );
    if (!organization) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }
    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete organization'
    });
  }
};

// Get candidates by organization
export const getCandidatesByOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, search, branch, year } = req.query;
    const skip = (page - 1) * limit;

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

    let candidates = organization.candidates || [];

    // Apply filters
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      candidates = candidates.filter(candidate => 
        searchRegex.test(candidate.name) || 
        searchRegex.test(candidate.rollNo) || 
        searchRegex.test(candidate.email)
      );
    }

    if (branch) {
      candidates = candidates.filter(candidate => candidate.branch === branch);
    }

    if (year) {
      candidates = candidates.filter(candidate => candidate.year === year);
    }

    // Apply pagination
    const total = candidates.length;
    const paginatedCandidates = candidates.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedCandidates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      organization: {
        id: organization._id,
        name: organization.name,
        type: organization.type
      }
    });
  } catch (error) {
    console.error('Get candidates by organization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidates'
    });
  }
};

// Add candidate to organization
export const addCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID format'
      });
    }

    // Validate required fields
    if (!candidateData.name || !candidateData.rollNo || !candidateData.branch) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, rollNo, branch'
      });
    }

    const organization = await Organization.findById(id);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Check for duplicate roll number
    const existingCandidate = organization.candidates.find(
      c => c.rollNo.toLowerCase() === candidateData.rollNo.toLowerCase()
    );
    
    if (existingCandidate) {
      return res.status(409).json({
        success: false,
        error: 'Student with this roll number already exists'
      });
    }

    // Validate email if provided
    if (candidateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(candidateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    // Process skills
    if (typeof candidateData.skills === 'string') {
      candidateData.skills = candidateData.skills.split(',').map(s => s.trim()).filter(s => s);
    } else if (!Array.isArray(candidateData.skills)) {
      candidateData.skills = [];
    }

    // Add candidate to organization
    organization.candidates.push({
      ...candidateData,
      addedDate: new Date()
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: organization.candidates[organization.candidates.length - 1]
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add candidate'
    });
  }
};

// Update candidate
export const updateCandidate = async (req, res) => {
  try {
    const { id, candidateId } = req.params;
    const updateData = req.body;

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

    const candidateIndex = organization.candidates.findIndex(
      c => c._id.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    // Check for duplicate roll number (excluding current candidate)
    if (updateData.rollNo) {
      const duplicateCandidate = organization.candidates.find(
        (c, index) => index !== candidateIndex && 
        c.rollNo.toLowerCase() === updateData.rollNo.toLowerCase()
      );
      
      if (duplicateCandidate) {
        return res.status(409).json({
          success: false,
          error: 'Student with this roll number already exists'
        });
      }
    }

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }

    // Process skills
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim()).filter(s => s);
    } else if (!Array.isArray(updateData.skills)) {
      updateData.skills = organization.candidates[candidateIndex].skills;
    }

    // Update candidate
    Object.assign(organization.candidates[candidateIndex], updateData);
    organization.candidates[candidateIndex].updatedDate = new Date();

    await organization.save();

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: organization.candidates[candidateIndex]
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update candidate'
    });
  }
};

// Remove candidate
export const removeCandidate = async (req, res) => {
  try {
    const { id, candidateId } = req.params;

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

    const candidateIndex = organization.candidates.findIndex(
      c => c._id.toString() === candidateId
    );

    if (candidateIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    organization.candidates.splice(candidateIndex, 1);
    await organization.save();

    res.json({
      success: true,
      message: 'Candidate removed successfully'
    });
  } catch (error) {
    console.error('Remove candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove candidate'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Organization.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          totalCandidates: { $sum: { $size: '$candidates' } },
          averageCandidatesPerOrg: { $avg: { $size: '$candidates' } }
        }
      }
    ]);

    const organizationsByType = await Organization.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const candidatesByBranch = await Organization.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $unwind: '$candidates'
      },
      {
        $group: {
          _id: '$candidates.branch',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const recentOrganizations = await Organization.find({ isActive: true })
      .select('name type location registrationDate candidates')
      .sort({ registrationDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { 
          totalOrganizations: 0, 
          totalCandidates: 0, 
          averageCandidatesPerOrg: 0 
        },
        organizationsByType,
        candidatesByBranch,
        recentOrganizations
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

// Bulk add candidates
export const bulkAddCandidates = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidates } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid organization ID format'
      });
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No candidates provided'
      });
    }

    const organization = await Organization.findById(id);
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    const existingRollNumbers = organization.candidates.map(c => c.rollNo.toLowerCase());
    const validCandidates = [];
    const errors = [];

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      
      // Validate required fields
      if (!candidate.name || !candidate.rollNo || !candidate.branch) {
        errors.push(`Candidate ${i + 1}: Missing required fields`);
        continue;
      }

      // Check for duplicate roll numbers
      if (existingRollNumbers.includes(candidate.rollNo.toLowerCase())) {
        errors.push(`Candidate ${i + 1}: Roll number ${candidate.rollNo} already exists`);
        continue;
      }

      // Validate email if provided
      if (candidate.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(candidate.email)) {
          errors.push(`Candidate ${i + 1}: Invalid email format`);
          continue;
        }
      }

      // Process skills
      if (typeof candidate.skills === 'string') {
        candidate.skills = candidate.skills.split(',').map(s => s.trim()).filter(s => s);
      } else if (!Array.isArray(candidate.skills)) {
        candidate.skills = [];
      }

      candidate.addedDate = new Date();
      validCandidates.push(candidate);
      existingRollNumbers.push(candidate.rollNo.toLowerCase());
    }

    if (validCandidates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid candidates to add',
        errors
      });
    }

    // Add valid candidates to organization
    organization.candidates.push(...validCandidates);
    await organization.save();

    res.status(201).json({
      success: true,
      message: `Successfully added ${validCandidates.length} candidates`,
      data: {
        addedCount: validCandidates.length,
        totalErrors: errors.length,
        errors: errors.slice(0, 10) // Limit error messages
      }
    });
  } catch (error) {
    console.error('Bulk add candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk add candidates'
    });
  }
};

// Process student file (for parsing Excel/CSV)
export const processStudentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let students = [];
    let validationErrors = [];

    if (fileExtension === '.csv') {
      // Handle CSV files
      const csvData = fs.readFileSync(filePath, 'utf8');
      const lines = csvData.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const student = {};
        
        headers.forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          const value = values[index] || '';
          
          if (lowerHeader.includes('name')) student.name = value;
          else if (lowerHeader.includes('roll')) student.rollNo = value;
          else if (lowerHeader.includes('email')) student.email = value;
          else if (lowerHeader.includes('phone')) student.phone = value;
          else if (lowerHeader.includes('branch')) student.branch = value;
          else if (lowerHeader.includes('special')) student.specialization = value;
          else if (lowerHeader.includes('year')) student.year = value;
          else if (lowerHeader.includes('cgpa') || lowerHeader.includes('gpa')) student.cgpa = value;
          else if (lowerHeader.includes('skill')) student.skills = value;
        });

        if (student.name && student.rollNo && student.branch) {
          students.push(student);
        } else {
          validationErrors.push(`Row ${i + 1}: Missing required fields`);
        }
      }
    } else {
      // Handle Excel files
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      students = jsonData.map((row, index) => {
        const student = {};
        Object.keys(row).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('name')) student.name = row[key];
          else if (lowerKey.includes('roll')) student.rollNo = row[key];
          else if (lowerKey.includes('email')) student.email = row[key];
          else if (lowerKey.includes('phone')) student.phone = row[key];
          else if (lowerKey.includes('branch')) student.branch = row[key];
          else if (lowerKey.includes('special')) student.specialization = row[key];
          else if (lowerKey.includes('year')) student.year = row[key];
          else if (lowerKey.includes('cgpa') || lowerKey.includes('gpa')) student.cgpa = row[key];
          else if (lowerKey.includes('skill')) student.skills = row[key];
        });

        if (!student.name || !student.rollNo || !student.branch) {
          validationErrors.push(`Row ${index + 2}: Missing required fields`);
          return null;
        }

        return student;
      }).filter(student => student !== null);
    }

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error('File cleanup error:', err);
    });

    res.json({
      success: true,
      data: students,
      validationErrors,
      message: `Parsed ${students.length} students from file`
    });
  } catch (error) {
    console.error('Process student file error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('File cleanup error:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process file'
    });
  }
};