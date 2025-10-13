// controllers/quotationController.js
import asyncHandler from 'express-async-handler';
import { Quotation } from '../models/quotation.js';
import { Post } from '../models/Post.js';

// Create quotation (manufacturers only)
export const createQuotation = asyncHandler(async (req, res) => {
  try {
    const { postId, message, price, deliveryTime, attachments } = req.body;
    const manufacturerId = req.user.id || req.userId;

    // Check if user is manufacturer
    if (!req.user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Only manufacturers can submit quotations'
      });
    }

    // Validate required fields
    if (!postId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Post ID and message are required'
      });
    }

    // Check if post exists
    const post = await Post.findOne({ _id: postId, isActive: true });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is still open
    if (post.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'This post is no longer accepting quotations'
      });
    }

    // Check if manufacturer already submitted quotation
    const existingQuotation = await Quotation.findOne({
      postId,
      manufacturerId,
      isActive: true
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quotation for this post'
      });
    }

    // Create quotation
    const quotation = new Quotation({
      postId,
      manufacturerId,
      message: message.trim(),
      price: price || undefined,
      deliveryTime: deliveryTime || undefined,
      attachments: attachments || []
    });

    await quotation.save();

    // Update post quotations count
    post.quotationsCount = (post.quotationsCount || 0) + 1;
    post.quotations.push(quotation._id);
    await post.save();

    // Populate manufacturer details
    await quotation.populate('manufacturer', 'name email phone address');

    console.log(`✅ Quotation created by manufacturer: ${manufacturerId} for post: ${postId}`);

    res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully',
      quotation
    });
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quotation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get manufacturer's own quotations
export const getMyQuotations = asyncHandler(async (req, res) => {
  try {
    const manufacturerId = req.user.id || req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quotations = await Quotation.find({ 
      manufacturerId, 
      isActive: true 
    })
      .populate('postId', 'title type description status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Quotation.countDocuments({ 
      manufacturerId, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      quotations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching quotations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update quotation status (post owner only)
export const updateQuotationStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id || req.userId;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const quotation = await Quotation.findOne({ _id: id, isActive: true })
      .populate('postId');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check if user owns the post
    if (quotation.postId.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this quotation'
      });
    }

    quotation.status = status;
    await quotation.save();

    console.log(`✅ Quotation status updated: ${id} to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Quotation status updated successfully',
      quotation
    });
  } catch (error) {
    console.error('❌ Error updating quotation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quotation status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete quotation
export const deleteQuotation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.userId;

    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }

    // Check ownership
    if (quotation.manufacturerId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this quotation'
      });
    }

    quotation.isActive = false;
    await quotation.save();

    // Update post quotations count
    const post = await Post.findById(quotation.postId);
    if (post) {
      post.quotationsCount = Math.max(0, (post.quotationsCount || 1) - 1);
      await post.save();
    }

    console.log(`✅ Quotation deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Quotation deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting quotation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quotation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

