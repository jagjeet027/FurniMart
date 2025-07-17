import Order from '../models/Order.js'
import jwt from 'jsonwebtoken';
import { User } from '../models/Users.js';

// Helper function to verify token (optional)
const verifyToken = async (req) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return { success: false, message: 'No token provided' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, message: 'Authentication failed' };
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (No authentication required)
const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      itemsPrice, 
      taxPrice, 
      shippingPrice, 
      totalPrice,
      notes
    } = req.body;
    
    // Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }
    
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country ||
        !shippingAddress.phoneNumber || !shippingAddress.email) {
      return res.status(400).json({ message: 'Shipping address is incomplete' });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    
    if (itemsPrice === undefined || taxPrice === undefined || 
        shippingPrice === undefined || totalPrice === undefined) {
      return res.status(400).json({ message: 'Price information is incomplete' });
    }
    
    // Try to get user from token, but don't require it
    const authResult = await verifyToken(req);
    
    const order = new Order({
      orderItems,
      user: authResult.success ? authResult.user._id : null, // Optional user
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      notes: notes || '',
      // Add guest customer info if no user
      guestCustomer: !authResult.success ? {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phoneNumber
      } : null
    });
    
    const createdOrder = await order.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Order created successfully',
      order: createdOrder 
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const authResult = await verifyToken(req);
    
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message });
    }
    
    const orders = await Order.find({ user: authResult.user._id });
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public (for order tracking)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Optional: Check if user owns this order if authenticated
    const authResult = await verifyToken(req);
    if (authResult.success && order.user) {
      if (order.user._id.toString() !== authResult.user._id.toString() && !authResult.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Public (for payment callbacks)
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer?.email_address
    };
    
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderToPaid:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const authResult = await verifyToken(req);
    
    if (!authResult.success) {
      return res.status(401).json({ message: authResult.message });
    }
    
    if (!authResult.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized, admin only' });
    }
    
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.orderStatus = status;
    
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }
    
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  getMyOrders,
  createOrder,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus
};