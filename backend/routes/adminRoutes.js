import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

// Public routes
router.get('/check-registration', adminController.checkRegistrationStatus);
router.post('/register', adminController.registerAdmin);
router.post('/login', adminController.loginAdmin);
router.post('/refresh-token', authMiddleware, adminController.refreshToken);


export default router;