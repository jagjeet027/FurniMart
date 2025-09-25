import mongoose from 'mongoose';
import Issue from '../models/issue.js';
import {User} from '../models/Users.js';
import { Manufacturer } from '../models/manufacturer.js';

// Create new issue - ONLY FOR MANUFACTURERS
export const createIssue = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.user.id; // From manufacturer auth middleware

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

    console.log('✅ Admin access confirmed:', {
      adminId: req.adminId,
      email: req.admin?.email
    });

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

    console.log('✅ Issues retrieved successfully:', {
      count: issues.length,
      totalCount: totalIssues
    });

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
    console.log('🔍 Getting issue by ID for admin:', req.params.id);
    
    // Check if request is from admin
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
    .populate('assignedTo', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    console.log('✅ Issue found:', issue._id);

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
    console.log('✏️ Updating issue for admin:', req.params.id);
    
    // Check if request is from admin
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const { name, description, status, category, assignedTo, priority, resolution } = req.body;

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

    // Build update object - Admin can update everything
    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category) updateData.category = category;
    if (resolution !== undefined) updateData.resolution = resolution.trim();
    
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

    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found or already deleted'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Issue permanently deleted from database'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add comment to issue - ONLY FOR ADMIN
// Note: This function expects a comments field in the schema. 
// If you want to add comments, you'll need to update your Issue schema first.
export const addComment = async (req, res) => {
  try {
    console.log('💬 Adding comment for admin:', req.params.id);
    
    return res.status(501).json({
      success: false,
      message: 'Comments feature not implemented. Please add a comments field to your Issue schema first.'
    });
    
    /* Uncomment this code after adding comments field to your schema:
    
    // Check if request is from admin
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
      isAdminComment: true // Flag to identify admin comments
    };

    issue.comments.push(comment);
    issue.updatedAt = new Date();
    await issue.save();

    // Populate the new comment
    await issue.populate('comments.userId', 'name email');

    console.log('✅ Comment added:', issue._id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: issue.comments[issue.comments.length - 1]
      }
    });
    */

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
    console.log('📊 Getting issue statistics for admin...');
    
    // Check if request is from admin
    if (!req.admin && !req.adminId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    console.log('✅ Admin access confirmed for stats');

    // Build base filter - Admin sees all issues
    const baseFilter = { 
      isDeleted: false
    };

    // Get statistics
    const [totalIssues, statusStats, categoryStats, recentIssues] = await Promise.allSettled([
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

    // Handle results
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

    ['technical', 'billing', 'order', 'product', 'general', 'other'].forEach(category => {
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

    console.log('✅ Statistics retrieved:', formattedStats);

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