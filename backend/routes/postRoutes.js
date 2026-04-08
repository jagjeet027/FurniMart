import express from 'express';
import { auth, requireManufacturer } from '../middleware/authMiddleware.js';
import {
  createPost,
  getAllPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostQuotations
} from '../controllers/postController.js';
import {
  createQuotation,
  getMyQuotations,
  updateQuotationStatus,
  deleteQuotation
} from '../controllers/quotationController.js';

const router = express.Router();

// ⚡ Post routes (Optimized order - most specific first)
router.get('/my-posts', auth, getMyPosts); // Must be before /:id
router.get('/', getAllPosts); // Public route - no auth needed
router.post('/', auth, createPost);
router.get('/:id', getPostById);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
  
// ⚡ Quotation routes for posts
router.get('/:id/quotations', auth, getPostQuotations);
router.post('/:id/quotations', auth, requireManufacturer, createQuotation);

export default router;