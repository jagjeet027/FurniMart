// routes/postRoutes.js
import express from 'express';
import  authenticate  from '../middleware/auth.js';
import PostController from '../controllers/postController.js';
import CommentController from '../controllers/commentController.js';

const router = express.Router();

// Post routes
router.post('/posts', authenticate, PostController.createPost);
router.get('/posts', PostController.getAllPosts); // Public
router.get('/posts/my-posts', authenticate, PostController.getMyPosts);
router.get('/posts/:id', PostController.getPostById);
router.put('/posts/:id', authenticate, PostController.updatePost);
router.delete('/posts/:id', authenticate, PostController.deletePost);
router.post('/posts/:id/like', authenticate, PostController.toggleLike);
router.post('/posts/:id/dislike', authenticate, PostController.toggleDislike);

// Comment routes
router.post('/posts/:postId/comments', authenticate, CommentController.addComment);
router.get('/posts/:postId/comments', CommentController.getComments);
router.put('/comments/:id', authenticate, CommentController.updateComment);
router.delete('/comments/:id', authenticate, CommentController.deleteComment);
router.post('/comments/:id/like', authenticate, CommentController.toggleCommentLike);

export default router;
