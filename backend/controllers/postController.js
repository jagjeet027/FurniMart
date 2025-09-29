// controllers/postController.js
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import {User} from "../models/Users.js";
import {Manufacturer} from "../models/manufacturer.js";


class PostController {
  // Create new post
  async createPost(req, res) {
    try {
      const { title, description, category, tags, images } = req.body;
      const userId = req.user.id;

      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          message: "Title, description, and category are required",
        });
      }

      const post = new Post({
        userId,
        title,
        description,
        category,
        tags: tags || [],
        images: images || [],
        status: "published",
      });

      await post.save();

      // Populate user details
      await post.populate({
        path: "userId",
        select: "name email role profileImage",
      });

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post,
      });
    } catch (error) {
      console.error("Create post error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating post",
        error: error.message,
      });
    }
  }

  // Get all posts with filters and pagination
  async getAllPosts(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        tags,
        search,
        sortBy = "createdAt",
        order = "desc",
        userId,
      } = req.query;

      const query = { status: "published" };

      if (category) query.category = category;
      if (tags) query.tags = { $in: tags.split(",") };
      if (userId) query.userId = userId;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const sortOrder = order === "desc" ? -1 : 1;
      const sortOptions = { [sortBy]: sortOrder };

      const posts = await Post.find(query)
        .populate({
          path: "userId",
          select: "name email role profileImage",
        })
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Post.countDocuments(query);

      // Get comment counts for each post
      const postIds = posts.map((p) => p._id);
      const commentCounts = await Comment.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } },
      ]);

      const commentCountMap = {};
      commentCounts.forEach((cc) => {
        commentCountMap[cc._id.toString()] = cc.count;
      });

      // Add counts to posts
      const postsWithCounts = posts.map((post) => ({
        ...post,
        likesCount: post.likes?.length || 0,
        dislikesCount: post.dislikes?.length || 0,
        commentsCount: commentCountMap[post._id.toString()] || 0,
        isLiked: post.likes?.some(
          (like) => like.userId.toString() === req.user?.id
        ),
        isDisliked: post.dislikes?.some(
          (dislike) => dislike.userId.toString() === req.user?.id
        ),
      }));

      res.status(200).json({
        success: true,
        data: postsWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error("Get all posts error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching posts",
        error: error.message,
      });
    }
  }

  // Get single post by ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const post = await Post.findById(id)
        .populate({
          path: "userId",
          select: "name email role profileImage",
        })
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Increment view count if user hasn't viewed before
      if (userId) {
        const hasViewed = post.viewedBy?.some(
          (v) => v.userId.toString() === userId
        );
        if (!hasViewed) {
          await Post.findByIdAndUpdate(id, {
            $inc: { views: 1 },
            $push: { viewedBy: { userId, viewedAt: new Date() } },
          });
          post.views += 1;
        }
      }

      // Get comment count
      const commentsCount = await Comment.countDocuments({ postId: id });

      const postWithCounts = {
        ...post,
        likesCount: post.likes?.length || 0,
        dislikesCount: post.dislikes?.length || 0,
        commentsCount,
        isLiked: post.likes?.some((like) => like.userId.toString() === userId),
        isDisliked: post.dislikes?.some(
          (dislike) => dislike.userId.toString() === userId
        ),
      };

      res.status(200).json({
        success: true,
        data: postWithCounts,
      });
    } catch (error) {
      console.error("Get post by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching post",
        error: error.message,
      });
    }
  }

  // Update post
  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, description, category, tags, images, status } = req.body;
      const userId = req.user.id;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Check if user is the owner
      if (post.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this post",
        });
      }

      // Update fields
      if (title) post.title = title;
      if (description) post.description = description;
      if (category) post.category = category;
      if (tags) post.tags = tags;
      if (images) post.images = images;
      if (status) post.status = status;

      await post.save();
      await post.populate({
        path: "userId",
        select: "name email role profileImage",
      });

      res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: post,
      });
    } catch (error) {
      console.error("Update post error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating post",
        error: error.message,
      });
    }
  }

  // Delete post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Check if user is owner or admin
      if (post.userId.toString() !== userId && userRole !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this post",
        });
      }

      // Delete all comments associated with this post
      await Comment.deleteMany({ postId: id });

      // Delete the post
      await Post.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Post and associated comments deleted successfully",
      });
    } catch (error) {
      console.error("Delete post error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting post",
        error: error.message,
      });
    }
  }

  // Like/Unlike post
  async toggleLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Remove dislike if exists
      post.dislikes = post.dislikes.filter(
        (d) => d.userId.toString() !== userId
      );

      // Toggle like
      const likeIndex = post.likes.findIndex(
        (l) => l.userId.toString() === userId
      );

      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push({
          userId,
          userType: userRole,
          createdAt: new Date(),
        });
      }

      await post.save();

      res.status(200).json({
        success: true,
        message: likeIndex > -1 ? "Like removed" : "Post liked",
        data: {
          likesCount: post.likes.length,
          dislikesCount: post.dislikes.length,
          isLiked: likeIndex === -1,
          isDisliked: false,
        },
      });
    } catch (error) {
      console.error("Toggle like error:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling like",
        error: error.message,
      });
    }
  }

  // Dislike/Remove dislike post
  async toggleDislike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const post = await Post.findById(id);

      if (!post) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Remove like if exists
      post.likes = post.likes.filter((l) => l.userId.toString() !== userId);

      // Toggle dislike
      const dislikeIndex = post.dislikes.findIndex(
        (d) => d.userId.toString() === userId
      );

      if (dislikeIndex > -1) {
        post.dislikes.splice(dislikeIndex, 1);
      } else {
        post.dislikes.push({
          userId,
          userType: userRole,
          createdAt: new Date(),
        });
      }

      await post.save();

      res.status(200).json({
        success: true,
        message: dislikeIndex > -1 ? "Dislike removed" : "Post disliked",
        data: {
          likesCount: post.likes.length,
          dislikesCount: post.dislikes.length,
          isLiked: false,
          isDisliked: dislikeIndex === -1,
        },
      });
    } catch (error) {
      console.error("Toggle dislike error:", error);
      res.status(500).json({
        success: false,
        message: "Error toggling dislike",
        error: error.message,
      });
    }
  }

  // Get user's own posts
  async getMyPosts(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const query = { userId };
      if (status) query.status = status;

      const posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Post.countDocuments(query);

      // Get comment counts
      const postIds = posts.map((p) => p._id);
      const commentCounts = await Comment.aggregate([
        { $match: { postId: { $in: postIds } } },
        { $group: { _id: "$postId", count: { $sum: 1 } } },
      ]);

      const commentCountMap = {};
      commentCounts.forEach((cc) => {
        commentCountMap[cc._id.toString()] = cc.count;
      });

      const postsWithCounts = posts.map((post) => ({
        ...post,
        likesCount: post.likes?.length || 0,
        dislikesCount: post.dislikes?.length || 0,
        commentsCount: commentCountMap[post._id.toString()] || 0,
      }));

      res.status(200).json({
        success: true,
        data: postsWithCounts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
        },
      });
    } catch (error) {
      console.error("Get my posts error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching posts",
        error: error.message,
      });
    }
  }
}

export default new PostController();
