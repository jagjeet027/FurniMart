import express from 'express';
import userRoutes from './userRoutes.js';
import manufacturerRoutes from './manufacturerRoutes.js';
import adminRoutes from './adminRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = express.Router();

// Base route configurations
router.use('/users', userRoutes);
router.use('/manufacturers', manufacturerRoutes);
router.use('/admin', adminRoutes);
router.use('/product', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
// Initialize default categories when the server starts
import { initializeDefaultCategories } from "./controllers/categoryController.js";
app.get("/api/initialize-categories", initializeDefaultCategories);

export default router;