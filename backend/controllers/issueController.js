import mongoose from 'mongoose';
import Issue from '../models/issue.js';
import {User} from '../models/Users.js';
import { Manufacturer } from '../models/manufacturer.js';

// Create new issue
export const createIssue = async (req, res) => {
  try {
    const { name, description, category, } = req.body;
    const userId = req.user.id; // From auth middleware

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Issue name is required'
      });
    }

        // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found. Please complete your manufacturer registration first.'
      });
    }

    // Create new issue
    const newIssue = new Issue({
      name: name.trim(),
      description: description?.trim() || '',
      userId,
      manufacturerId: manufacturer._id,
      category: category || 'general',
    });

    const savedIssue = await newIssue.save();
    
    // Populate manufacturer and user details
    await savedIssue.populate([
      { path: 'userId', select: 'name email' },
      { path: 'manufacturerId', select: 'businessName contact.email contact.contactPerson' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: {
        issue: savedIssue
      }
    });

  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all issues (with filters) - Manufacturer specific
export const getAllIssues = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Only manufacturers can access this endpoint
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can view issues.'
      });
    }

    // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found.'
      });
    }

    // Build filter object - only show this manufacturer's issues
    const filter = { 
      isDeleted: false,
      manufacturerId: manufacturer._id
    };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Get issues with pagination
    const issues = await Issue.find(filter)
      .populate('userId', 'name email')
      .populate('manufacturerId', 'businessName contact.email contact.contactPerson')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const totalIssues = await Issue.countDocuments(filter);
    const totalPages = Math.ceil(totalIssues / limit);

    res.status(200).json({
      success: true,
      data: {
        issues,
        manufacturer: {
          businessName: manufacturer.businessName,
          contact: manufacturer.contact
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalIssues,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single issue by ID - Manufacturer specific
export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // Only manufacturers can access this endpoint
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can view issues.'
      });
    }

    // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found.'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false,
      manufacturerId: manufacturer._id  // Only show this manufacturer's issues
    })
    .populate('userId', 'name email')
    .populate('manufacturerId', 'businessName contact.email contact.contactPerson')
    .populate('assignedTo', 'name email')
    .populate('comments.userId', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        issue
      }
    });

  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update issue - Manufacturer specific
export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, category, resolution } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // Only manufacturers can access this endpoint
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can update issues.'
      });
    }

    // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found.'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false,
      manufacturerId: manufacturer._id  // Only allow updating their own issues
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Build update object - manufacturers can update basic info only
    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category;
    
    // Only allow status update to specific values by manufacturer
    if (status && ['open', 'closed'].includes(status)) {
      updateData.status = status;
    }

    // Update issue
    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate('manufacturerId', 'businessName contact.email contact.contactPerson')
    .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: {
        issue: updatedIssue
      }
    });

  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete issue (soft delete) - Manufacturer specific
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // Only manufacturers can access this endpoint
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can delete issues.'
      });
    }

    // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found.'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false,
      manufacturerId: manufacturer._id  // Only allow deleting their own issues
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Soft delete
    await Issue.findByIdAndUpdate(id, { isDeleted: true });

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add comment to issue - Manufacturer specific
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required'
      });
    }

    // Only manufacturers can access this endpoint
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can add comments.'
      });
    }

    // Find manufacturer record
    const manufacturer = await Manufacturer.findOne({ userId: req.user.id });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found.'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false,
      manufacturerId: manufacturer._id  // Only allow commenting on their own issues
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add comment
    const comment = {
      userId: req.user.id,
      message: message.trim(),
      timestamp: new Date()
    };

    issue.comments.push(comment);
    await issue.save();

    // Populate the new comment
    await issue.populate('comments.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: issue.comments[issue.comments.length - 1]
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const getIssueStats = async (req, res) => {
  try {
    // Check if user exists and has required permissions
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. User not found in request.'
      });
    }

    // Get user ID (handle both req.user.id and req.user._id)
    const userId = req.user.id || req.user._id;

    // Check if user is manufacturer (check both flag and profile)
    if (!req.user.isManufacturer && !req.user.manufacturerProfile) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can view statistics.'
      });
    }

    console.log('Authenticated user:', {
      id: userId,
      email: req.user.email,
      isManufacturer: req.user.isManufacturer,
      hasManufacturerProfile: !!req.user.manufacturerProfile
    });

    // Find manufacturer record with more specific query
    // First try to find by direct manufacturerProfile reference
    let manufacturer;
    
    if (req.user.manufacturerProfile) {
      manufacturer = await Manufacturer.findById(req.user.manufacturerProfile)
        .populate('userId', 'email name');
    } else {
      // Fallback: find by userId
      manufacturer = await Manufacturer.findOne({ 
        userId: userId 
      }).populate('userId', 'email name');
    }
    
    console.log('Found manufacturer:', manufacturer);

    if (!manufacturer) {
      // Log all manufacturers to debug the association issue
      const allManufacturers = await Manufacturer.find({})
        .populate('userId', 'email name')
        .select('userId businessName contact');
      
      console.log('All manufacturers in database:', allManufacturers);
      console.log('Looking for userId:', userId);

      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found for this user.',
        debug: {
          userId: userId,
          userEmail: req.user.email,
          hasManufacturerProfile: !!req.user.manufacturerProfile,
          manufacturerProfileId: req.user.manufacturerProfile,
          availableManufacturers: allManufacturers.map(m => ({
            id: m._id,
            userId: m.userId?._id,
            userEmail: m.userId?.email,
            businessName: m.businessName
          }))
        }
      });
    }

    // Build filter for manufacturer's issues
    const baseFilter = { 
      isDeleted: false, 
      manufacturerId: manufacturer._id 
    };

    console.log('Filtering issues with:', baseFilter);

    // Get statistics with error handling for each aggregation
    const [totalIssues, statusStats,  categoryStats, recentIssues] = await Promise.allSettled([
      // Total issues
      Issue.countDocuments(baseFilter),
      
      // By status
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
            
      // By category
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      
      // Recent issues (last 7 days)
      Issue.countDocuments({
        ...baseFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Handle any rejected promises
    const handleResult = (result, defaultValue) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error('Stats query failed:', result.reason);
        return defaultValue;
      }
    };

    const resolvedStats = {
      total: handleResult(totalIssues, 0),
      statusStats: handleResult(statusStats, []),
      categoryStats: handleResult(categoryStats, []),
      recent: handleResult(recentIssues, 0)
    };

    // Format statistics
    const formattedStats = {
      total: resolvedStats.total,
      recent: resolvedStats.recent,
      byStatus: {},
      byCategory: {}
    };

    // Initialize with default values
    ['open', 'in-progress', 'resolved', 'closed'].forEach(status => {
      formattedStats.byStatus[status] = 0;
    });
    ['technical', 'billing', 'order', 'product', 'general','other'].forEach(category => {
      formattedStats.byCategory[category] = 0;
    });

    // Fill with actual data
    resolvedStats.statusStats.forEach(stat => {
      if (stat._id && typeof stat.count === 'number') {
        formattedStats.byStatus[stat._id] = stat.count;
      }
    });

    resolvedStats.categoryStats.forEach(stat => {
      if (stat._id && typeof stat.count === 'number') {
        formattedStats.byCategory[stat._id] = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: formattedStats,
        manufacturer: {
          id: manufacturer._id,
          businessName: manufacturer.businessName,
          contact: manufacturer.contact,
          userId: manufacturer.userId._id,
          userEmail: manufacturer.userId.email
        }
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};