import express from 'express';
import {
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders
} from '../controllers/orderController.js';

const router = express.Router();

// Get user's orders - no middleware
router.get('/myorders', getMyOrders);

// Create a new order - no middleware
router.post('/', createOrder);

// Get a specific order - no middleware
router.get('/:id', getOrderById);

// Update order to paid - no middleware
router.put('/:id/pay', updateOrderToPaid);

// Update order status - no middleware
router.put('/:id/status', updateOrderStatus);

export default router;