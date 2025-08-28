import express from 'express';
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  addComment,
  getIssueStats
} from '../controllers/issueController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes - all require authentication
router.post('/', createIssue);                    // Create new issue
router.get('/', getAllIssues);                    // Get all issues with filters
router.get('/stats', getIssueStats);              // Get issue statistics
router.get('/:id', getIssueById);                 // Get single issue by ID
router.put('/:id', updateIssue);                  // Update issue
router.delete('/:id', deleteIssue);               // Delete issue (soft delete)
router.post('/:id/comments', addComment);         // Add comment to issue

export default router;