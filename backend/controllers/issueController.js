import mongoose from 'mongoose';
import Issue from '../models/issue.js';
import {User} from '../models/Users.js';
import { Manufacturer } from '../models/manufacturer.js';

// Create new issue - FOR MANUFACTURERS
export const createIssue = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.user.id; // From manufacturer auth middleware

    console.log('📝 Creating issue for manufacturer:', userId);

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
      status: 'open' // Default status
    });

    const savedIssue = await newIssue.save();
    
    // Populate manufacturer and user details
    await savedIssue.populate([
      { path: 'userId', select: 'name email' },
      { path: 'manufacturerId', select: 'businessName contact.email contact.contactPerson' }
    ]);

    console.log('✅ Issue created successfully:', savedIssue._id);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: {
        issue: savedIssue
      }
    });

  } catch (error) {
    console.error('❌ Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all issues - ONLY FOR ADMIN
export const getAllIssues = async (req, res) => {
  try {
    console.log('🔍 Getting all issues for admin...');
    
    // Check if request is from admin
    if (!req.admin && !req.adminId) {
      console.log('❌ Access denied: Not an admin');
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - Admin can see ALL issues
    const filter = { 
      isDeleted: false
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

    console.log('✅ Issues retrieved successfully:', issues.length);

    res.status(200).json({
      success: true,
      data: {
        issues,
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
    console.error('❌ Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single issue by ID - ONLY FOR ADMIN
export const getIssueById = async (req, res) => {
  try {
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false
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
    console.error('❌ Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update issue - ONLY FOR ADMIN
export const updateIssue = async (req, res) => {
  try {
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const { name, description, status, category, assignedTo, priority } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Build update object
    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category;
    if (priority) updateData.priority = priority;
    
    // Admin can update to any status
    if (status) {
      const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
      }
    }

    // Admin can assign issues
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    updateData.updatedAt = new Date();

    // Update issue
    const updatedIssue = await Issue.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate('manufacturerId', 'businessName contact.email contact.contactPerson')
    .populate('assignedTo', 'name email');

    console.log('✅ Issue updated:', updatedIssue._id);

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: {
        issue: updatedIssue
      }
    });

  } catch (error) {
    console.error('❌ Error updating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete issue - ONLY FOR ADMIN
export const deleteIssue = async (req, res) => {
  try {
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or already deleted'
      });
    }

    console.log('✅ Issue deleted:', id);

    res.status(200).json({
      success: true,
      message: 'Issue permanently deleted from database'
    });

  } catch (error) {
    console.error('❌ Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add comment to issue - ONLY FOR ADMIN
export const addComment = async (req, res) => {
  try {
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

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

    const issue = await Issue.findOne({ 
      _id: id, 
      isDeleted: false
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Add comment with admin ID
    const comment = {
      userId: req.adminId,
      message: message.trim(),
      timestamp: new Date(),
      isAdminComment: true
    };

    issue.comments.push(comment);
    issue.updatedAt = new Date();
    await issue.save();

    await issue.populate('comments.userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: issue.comments[issue.comments.length - 1]
      }
    });

  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get issue statistics - ONLY FOR ADMIN
export const getIssueStats = async (req, res) => {
  try {
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const baseFilter = { 
      isDeleted: false
    };

    const [totalIssues, statusStats, categoryStats, recentIssues] = await Promise.all([
      Issue.countDocuments(baseFilter),
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Issue.countDocuments({
        ...baseFilter,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const formattedStats = {
      total: totalIssues,
      recent: recentIssues,
      byStatus: {
        open: 0,
        'in-progress': 0,
        resolved: 0,
        closed: 0
      },
      byCategory: {
        technical: 0,
        billing: 0,
        order: 0,
        product: 0,
        general: 0,
        other: 0
      }
    };

    statusStats.forEach(stat => {
      if (stat._id) formattedStats.byStatus[stat._id] = stat.count;
    });

    categoryStats.forEach(stat => {
      if (stat._id) formattedStats.byCategory[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        statistics: formattedStats
      }
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};