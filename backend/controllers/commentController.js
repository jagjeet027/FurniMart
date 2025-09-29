import Post from '../models/post.js';
import Comment from '../models/comment.js';

class CommentController {
  
  // Add comment to post
  async addComment(req, res) {
    try {
      const { postId } = req.params;
      const { text, parentCommentId } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required'
        });
      }

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      const comment = new Comment({
        postId,
        userId,
        userType: userRole,
        text: text.trim(),
        parentCommentId: parentCommentId || null
      });

      await comment.save();
      await comment.populate({
        path: 'userId',
        select: 'name email role profileImage'
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error adding comment',
        error: error.message
      });
    }
  }

  // Get comments for a post
  async getComments(req, res) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

      const sortOrder = order === 'desc' ? -1 : 1;
      const sortOptions = { [sortBy]: sortOrder };

      const comments = await Comment.find({ 
        postId, 
        parentCommentId: null 
      })
        .populate({
          path: 'userId',
          select: 'name email role profileImage'
        })
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const count = await Comment.countDocuments({ postId, parentCommentId: null });

      const commentIds = comments.map(c => c._id);
      const replies = await Comment.find({
        parentCommentId: { $in: commentIds }
      })
        .populate({
          path: 'userId',
          select: 'name email role profileImage'
        })
        .sort({ createdAt: 1 })
        .lean();

      const repliesMap = {};
      replies.forEach(reply => {
        const parentId = reply.parentCommentId.toString();
        if (!repliesMap[parentId]) {
          repliesMap[parentId] = [];
        }
        repliesMap[parentId].push(reply);
      });

      const commentsWithReplies = comments.map(comment => ({
        ...comment,
        replies: repliesMap[comment._id.toString()] || [],
        repliesCount: (repliesMap[comment._id.toString()] || []).length,
        likesCount: comment.likes?.length || 0
      }));

      res.status(200).json({
        success: true,
        data: commentsWithReplies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalComments: count
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching comments',
        error: error.message
      });
    }
  }

  // Update comment
  async updateComment(req, res) {
    try {
      const { id } = req.params;
      const { text } = req.body;
      const userId = req.user.id;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Comment text is required'
        });
      }

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this comment'
        });
      }

      comment.text = text.trim();
      comment.isEdited = true;
      comment.editedAt = new Date();

      await comment.save();
      await comment.populate({
        path: 'userId',
        select: 'name email role profileImage'
      });

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating comment',
        error: error.message
      });
    }
  }

  // Delete comment
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (comment.userId.toString() !== userId && userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this comment'
        });
      }

      await Comment.deleteMany({ parentCommentId: id });
      await Comment.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting comment',
        error: error.message
      });
    }
  }

  // Like comment
  async toggleCommentLike(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const comment = await Comment.findById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      const likeIndex = comment.likes.findIndex(l => l.userId.toString() === userId);

      if (likeIndex > -1) {
        comment.likes.splice(likeIndex, 1);
      } else {
        comment.likes.push({ userId, createdAt: new Date() });
      }

      await comment.save();

      res.status(200).json({
        success: true,
        message: likeIndex > -1 ? 'Like removed' : 'Comment liked',
        data: {
          likesCount: comment.likes.length,
          isLiked: likeIndex === -1
        }
      });
    } catch (error) {
      console.error('Toggle comment like error:', error);
      res.status(500).json({
        success: false,
        message: 'Error toggling comment like',
        error: error.message
      });
    }
  }
}

export default new CommentController();
