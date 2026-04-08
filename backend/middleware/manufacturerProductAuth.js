// middleware/manufacturerProductAuth.js
import { Manufacturer } from '../models/manufacturer.js';
import { User } from '../models/Users.js';

/**
 * Middleware to verify user is an approved manufacturer before product operations
 */
export const verifyManufacturer = async (req, res, next) => {
  try {
    const userId = req.userId; // From authenticateToken middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Check if user exists and has manufacturer role
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isManufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only manufacturers can perform this action.',
        hint: 'Please register as a manufacturer first'
      });
    }
    
    // Find and verify manufacturer profile
    const manufacturer = await Manufacturer.findOne({ userId: userId });
    
    if (!manufacturer) {
      return res.status(403).json({
        success: false,
        message: 'Manufacturer profile not found',
        hint: 'Please complete your manufacturer registration'
      });
    }
    
    // Check manufacturer approval status
    if (manufacturer.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your manufacturer account is ${manufacturer.status}`,
        status: manufacturer.status,
        hint: manufacturer.status === 'pending' 
          ? 'Please wait for admin approval before adding products'
          : 'Your manufacturer account has been rejected. Please contact support.'
      });
    }
    
    // Attach manufacturer info to request for use in controllers
    req.manufacturer = {
      id: manufacturer._id,
      businessName: manufacturer.businessName,
      email: manufacturer.contact.email,
      userId: manufacturer.userId
    };
    
    console.log('✅ Manufacturer verified:', manufacturer.businessName);
    next();
    
  } catch (error) {
    console.error('❌ Manufacturer verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying manufacturer status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const verifyProductOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const manufacturerId = req.manufacturer?.id;
    
    if (!manufacturerId) {
      return res.status(403).json({
        success: false,
        message: 'Manufacturer information not found'
      });
    }
    
    const Product = (await import('../models/product.js')).default;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product has manufacturerId field (new products will have it)
    if (!product.manufacturerId) {
      return res.status(403).json({
        success: false,
        message: 'This product was uploaded before manufacturer tracking was implemented. Please contact admin to claim ownership.',
        hint: 'Legacy product without manufacturer ID'
      });
    }
    
    // Check if product belongs to this manufacturer
    if (product.manufacturerId.toString() !== manufacturerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own products.',
        productOwner: product.manufacturer
      });
    }
    
    req.product = product;
    console.log('✅ Product ownership verified');
    next();
    
  } catch (error) {
    console.error('❌ Product ownership verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying product ownership',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default {
  verifyManufacturer,
  verifyProductOwnership
};