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

const router = express.Router();

router.use(adminAuth);
router.get('/stats', getIssueStats);

// CRUD routes
router.get('/', getAllIssues);           
router.post('/', createIssue);          
router.get('/:id', getIssueById);      
router.put('/:id', updateIssue);        
router.delete('/:id', deleteIssue);     

// Comments route
router.post('/:id/comments', addComment); 

export default router;