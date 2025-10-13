// routes/postRoutes.js
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

// Post routes
router.post('/', auth, createPost);
router.get('/', getAllPosts);
router.get('/my-posts', auth, getMyPosts);
router.get('/:id', getPostById);
router.patch('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);
  
// Quotation routes for posts
router.get('/:id/quotations', auth, getPostQuotations);
router.post('/:id/quotations', auth, requireManufacturer, createQuotation);

// Quotation management routes
router.get('/quotations/my-quotations', auth, requireManufacturer, getMyQuotations);
router.patch('/quotations/:id/status', auth, updateQuotationStatus);
router.delete('/quotations/:id', auth, deleteQuotation);

export default router;