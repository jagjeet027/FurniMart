// controllers/postController.js
import asyncHandler from 'express-async-handler';
import { Post } from '../models/Post.js';
import { Quotation } from '../models/quotation.js';
import { User } from '../models/Users.js';

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
  try {
    const { title, type, description, category, files } = req.body;
    const userId = req.user.id || req.userId;

    // Validate required fields
    if (!title || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, type, and description are required'
      });
    }

    // Validate type
    if (!['idea', 'requirement'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "idea" or "requirement"'
      });
    }

    // Create post
    const post = new Post({
      title: title.trim(),
      type,
      description: description.trim(),
      category: category || 'General',
      files: files || [],
      userId
    });

    await post.save();

    // Populate user details
    await post.populate('author', 'name email isManufacturer');

    console.log(`✅ Post created successfully by user: ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all posts (with pagination)
export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { type, status, search } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (type && ['idea', 'requirement'].includes(type)) {
      filter.type = type;
    }
    
    if (status && ['open', 'closed'].includes(status)) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get posts with pagination
    const posts = await Post.find(filter)
      .populate('author', 'name email isManufacturer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's own posts
export const getMyPosts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id || req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ userId, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ userId, isActive: true });

    // Add quotation counts to posts
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const quotationsCount = await Quotation.countDocuments({ 
          postId: post._id, 
          isActive: true 
        });
        return {
          ...post.toObject(),
          quotationsCount
        };
      })
    );

    res.status(200).json({
      success: true,
      posts: postsWithCounts,
      total,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single post by ID
export const getPostById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, isActive: true })
      .populate('author', 'name email isManufacturer phone address');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add quotation count
    const quotationsCount = await Quotation.countDocuments({ 
      postId: post._id, 
      isActive: true 
    });

    res.status(200).json({
      success: true,
      post: {
        ...post.toObject(),
        quotationsCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update post
export const updatePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.userId;
    const { title, description, status, category, files } = req.body;

    const post = await Post.findOne({ _id: id, isActive: true });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this post'
      });
    }

    // Update fields
    if (title) post.title = title.trim();
    if (description) post.description = description.trim();
    if (status) post.status = status;
    if (category) post.category = category;
    
    // Handle file updates
    if (files && Array.isArray(files)) {
      // Append new files to existing files
      post.files = [...(post.files || []), ...files];
    }

    await post.save();
    await post.populate('author', 'name email isManufacturer');

    // Add quotation count
    const quotationsCount = await Quotation.countDocuments({ 
      postId: post._id, 
      isActive: true 
    });

    console.log(`✅ Post updated successfully: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: {
        ...post.toObject(),
        quotationsCount
      }
    });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete post (soft delete)
export const deletePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.userId;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check ownership
    if (post.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post'
      });
    }

    post.isActive = false;
    await post.save();

    console.log(`✅ Post deleted successfully: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get quotations for a post
export const getPostQuotations = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.userId;

    const post = await Post.findOne({ _id: id, isActive: true });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only post owner can view quotations
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view quotations for this post'
      });
    }

    const quotations = await Quotation.find({ postId: id, isActive: true })
      .populate('manufacturer', 'name email phone address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      quotations
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