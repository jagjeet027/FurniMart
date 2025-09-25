// routes/issueRoute.js
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
import adminAuth from '../middleware/adminAuth.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Manufacturer routes (create issues only)
// This route allows manufacturers to create new issues
router.post('/', authenticateToken, createIssue);

// Admin routes (manage all issues)
// Apply admin authentication to all routes below this line
router.use(adminAuth);

// Admin-only routes
router.get('/stats', getIssueStats);           // Get issue statistics
router.get('/', getAllIssues);                // Get all issues with filtering
router.get('/:id', getIssueById);             // Get specific issue details
router.put('/:id', updateIssue);              // Update issue
router.delete('/:id', deleteIssue);           // Delete issue
router.post('/:id/comments', addComment);     // Add comment to issue

export default router;