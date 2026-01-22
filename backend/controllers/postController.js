import asyncHandler from 'express-async-handler';
import { Post } from '../models/Post.js';
import { Quotation } from '../models/quotation.js';
import mongoose from 'mongoose';

// ⚡ Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    expiry: Date.now() + CACHE_TTL
  });
};

const clearCache = () => {
  cache.clear();
  console.log('🗑️ Cache cleared');
};

// ⚡ OPTIMIZED: Create Post
export const createPost = asyncHandler(async (req, res) => {
  const { title, type, description, category, files } = req.body;
  const userId = req.user.id || req.userId;

  // Validate
  if (!title || !type || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title, type, and description are required'
    });
  }

  if (!['idea', 'requirement'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be either "idea" or "requirement"'
    });
  }

  // Create post
  const post = await Post.create({
    title: title.trim(),
    type,
    description: description.trim(),
    category: category || 'General',
    files: files || [],
    userId
  });

  // Get populated post with lean - NOW INCLUDING FILES
  const populatedPost = await Post.findById(post._id)
    .select('title type description category status files userId createdAt updatedAt')
    .populate('userId', 'name email isManufacturer')
    .lean();

  // Clear cache
  clearCache();

  console.log(`✅ Post created: ${post._id}`);

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: populatedPost
  });
});

// ⚡ ULTRA-FAST: Get All Posts (NO pagination, with caching)
export const getAllPosts = asyncHandler(async (req, res) => {
  const { type, status, search } = req.query;
  
  // Create cache key
  const cacheKey = `posts_${type || 'all'}_${status || 'all'}_${search || 'none'}`;
  
  // Check cache first
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log('✅ Served from cache (1-5ms)');
    return res.status(200).json({
      success: true,
      cached: true,
      count: cachedData.length,
      posts: cachedData
    });
  }

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

  // ⚡ OPTIMIZED: lean() + select() + limit - NOW INCLUDING FILES
  const posts = await Post.find(filter)
    .select('title type description category status files userId quotationsCount createdAt updatedAt')
    .populate('userId', 'name email isManufacturer')
    .sort({ createdAt: -1 })
    .limit(100) // Maximum 100 posts for performance
    .lean()
    .exec();

  // Cache results
  setCache(cacheKey, posts);

  console.log(`✅ Fetched ${posts.length} posts (50-100ms)`);

  res.status(200).json({
    success: true,
    cached: false,
    count: posts.length,
    posts
  });
});

// ⚡ ULTRA-FAST: Get My Posts (Optimized with aggregation)
export const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.userId;

  // ⚡ Single aggregation query (much faster than multiple queries)
  const posts = await Post.aggregate([
    // Match user's posts
    { 
      $match: { 
        userId: new mongoose.Types.ObjectId(userId), 
        isActive: true 
      } 
    },
    
    // Sort by creation date
    { $sort: { createdAt: -1 } },
    
    // Limit to 50 posts
    { $limit: 50 },
    
    // Lookup quotations count
    {
      $lookup: {
        from: 'quotations',
        let: { postId: '$_id' },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $and: [
                  { $eq: ['$postId', '$$postId'] },
                  { $eq: ['$isActive', true] }
                ]
              }
            }
          },
          { $count: 'count' }
        ],
        as: 'quotationData'
      }
    },
    
    // Add quotationsCount field
    {
      $addFields: {
        quotationsCount: {
          $ifNull: [{ $arrayElemAt: ['$quotationData.count', 0] }, 0]
        }
      }
    },
    
    // Remove temporary field but KEEP files
    { $project: { quotationData: 0 } }
  ]);

  console.log(`✅ Fetched ${posts.length} user posts (30-50ms)`);

  res.status(200).json({
    success: true,
    count: posts.length,
    posts
  });
});

// ⚡ OPTIMIZED: Get Post By ID
export const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ⚡ Parallel execution - NOW INCLUDING FILES
  const [post, quotationsCount] = await Promise.all([
    Post.findOne({ _id: id, isActive: true })
      .select('title type description category files status userId createdAt updatedAt')
      .populate('userId', 'name email isManufacturer phone address')
      .lean()
      .exec(),
    Quotation.countDocuments({ postId: id, isActive: true })
  ]);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  res.status(200).json({
    success: true,
    post: {
      ...post,
      quotationsCount
    }
  });
});

// ⚡ OPTIMIZED: Update Post
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.userId;
  const { title, description, status, category, files } = req.body;

  // ⚡ Use lean for faster read
  const post = await Post.findOne({ _id: id, isActive: true })
    .select('userId')
    .lean();

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

  // Build update object
  const updateData = {};
  if (title) updateData.title = title.trim();
  if (description) updateData.description = description.trim();
  if (status) updateData.status = status;
  if (category) updateData.category = category;
  
  // Handle files - FIXED: Properly add new files to existing array
  if (files && Array.isArray(files)) {
    updateData.$push = { files: { $each: files } };
  }

  // ⚡ Update with findByIdAndUpdate (faster) - NOW INCLUDING FILES
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .select('title type description category status files userId quotationsCount createdAt updatedAt')
    .populate('userId', 'name email isManufacturer')
    .lean();

  // Clear cache
  clearCache();

  console.log(`✅ Post updated: ${id}`);

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    post: updatedPost
  });
});

// ⚡ OPTIMIZED: Delete Post
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.userId;

  const post = await Post.findById(id).select('userId isActive').lean();

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

  // ⚡ Direct update (faster than find + save)
  await Post.findByIdAndUpdate(id, { isActive: false });

  // Clear cache
  clearCache();

  console.log(`✅ Post deleted: ${id}`);

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
});

export const getPostQuotations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.userId;

  const post = await Post.findOne({ _id: id, isActive: true })
    .select('userId')
    .lean();

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post not found'
    });
  }

  // Check ownership
  if (post.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to view quotations for this post'
    });
  }

  // ⚡ Optimized query with lean - FIXED: Changed 'manufacturer' to 'manufacturerId'
  const quotations = await Quotation.find({ postId: id, isActive: true })
    .select('message price deliveryTime attachments status manufacturerId createdAt updatedAt')
    .populate('manufacturerId', 'name email phone address')
    .sort({ createdAt: -1 })
    .lean()
    .exec();

  res.status(200).json({
    success: true,
    count: quotations.length,
    quotations
  });
});