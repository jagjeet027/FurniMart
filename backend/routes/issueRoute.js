// routes/issueRoutes.js
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
import manufacturerAuth from '../middleware/manufacturerAuth.js'; // Ye middleware chahiye

const router = express.Router();

// Manufacturer apne ideas submit kar sakta hai
router.post('/', manufacturerAuth, createIssue);

// Admin sabhi issues dekh sakta hai aur manage kar sakta hai
router.get('/stats', adminAuth, getIssueStats);
router.get('/', adminAuth, getAllIssues);
router.get('/:id', adminAuth, getIssueById);
router.put('/:id', adminAuth, updateIssue);
router.delete('/:id', adminAuth, deleteIssue);
router.post('/:id/comments', adminAuth, addComment);

export default router;