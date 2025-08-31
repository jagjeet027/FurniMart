import Organization from '../../models/career/organization.js';
import { validationResult } from 'express-validator';

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
    const stats = await Organization.getOrganizationsWithStats();
    
    res.json({
      success: true,
      data: organizations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      stats: {
        totalOrganizations: total,
        totalCandidates: stats.reduce((sum, org) => sum + org.candidatesCount, 0),
        organizationTypes: await Organization.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ])
      }
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Parse FormData structure from your frontend
    let organizationData, candidates;
    
    try {
      organizationData = JSON.parse(req.body.organizationData);
      candidates = JSON.parse(req.body.candidates);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON data in request'
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

    // Create organization with candidates
    const organization = new Organization({
      ...organizationData,
      candidates: candidates || []
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    
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
      error: 'Failed to register organization'
    });
  }
};
// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add logo path if uploaded
    if (req.file) {
      updateData.logo = `/uploads/${req.file.filename}`;
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
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
        error: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update organization'
    });
  }
};

// Delete organization (soft delete)
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    
    const organization = await Organization.findByIdAndUpdate(
      id,
      { isActive: false },
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

// Add candidate to organization
export const addCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidateData = req.body;

    const organization = await Organization.findById(id);
    
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await organization.addCandidate(candidateData);

    res.status(201).json({
      success: true,
      message: 'Candidate added successfully',
      data: organization
    });
  } catch (error) {
    console.error('Add candidate error:', error);
    
    if (error.message.includes('roll number already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message
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

    const organization = await Organization.findById(id);
    
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await organization.updateCandidate(candidateId, updateData);

    res.json({
      success: true,
      message: 'Candidate updated successfully',
      data: organization
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('roll number already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

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

    const organization = await Organization.findById(id);
    
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    await organization.removeCandidate(candidateId);

    res.json({
      success: true,
      message: 'Candidate removed successfully',
      data: organization
    });
  } catch (error) {
    console.error('Remove candidate error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove candidate'
    });
  }
};

// Get candidates by organization
export const getCandidatesByOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch, year, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const organization = await Organization.findById(id);
    
    if (!organization || !organization.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Organization not found'
      });
    }

    // Filter candidates
    let candidates = organization.candidates;

    if (branch) {
      candidates = candidates.filter(c => c.branch === branch);
    }

    if (year) {
      candidates = candidates.filter(c => c.year === year);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      candidates = candidates.filter(c => 
        searchRegex.test(c.name) || 
        searchRegex.test(c.rollNo) ||
        searchRegex.test(c.email)
      );
    }

    // Sort by name
    candidates.sort((a, b) => a.name.localeCompare(b.name));

    // Pagination
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
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidates'
    });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Organization.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          totalCandidates: { $sum: { $size: '$candidates' } },
          pendingOrganizations: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedOrganizations: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      }
    ]);

    const branchStats = await Organization.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$candidates' },
      {
        $group: {
          _id: '$candidates.branch',
          count: { $sum: 1 },
          avgCGPA: { $avg: '$candidates.cgpa' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recentRegistrations = await Organization.find({ isActive: true })
      .select('name type location registrationDate candidatesCount')
      .sort({ registrationDate: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalOrganizations: 0,
          totalCandidates: 0,
          pendingOrganizations: 0,
          approvedOrganizations: 0
        },
        branchStats,
        recentRegistrations
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