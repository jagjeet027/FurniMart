import Product from "../models/product.js";
import Category from "../models/category.js";
import { Manufacturer } from "../models/manufacturer.js";
import mongoose from "mongoose";

// Add new product with manufacturer authentication
export const addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const productData = req.body;
    const userId = req.userId; // From authenticateToken middleware
    
    // CRITICAL: Verify manufacturer exists and belongs to authenticated user
    const manufacturer = await Manufacturer.findOne({ 
      userId: userId,
      status: 'approved' // Only approved manufacturers can add products
    }).session(session);
    
    if (!manufacturer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Only approved manufacturers can add products. Please register as a manufacturer first.'
      });
    }
    
    console.log('✅ Manufacturer verified:', manufacturer.businessName);
    
    // Handle category - create it if it doesn't exist
    let categoryId = productData.category;
    let categoryName = productData.categoryName;
    
    // If categoryId is not a valid ObjectId, treat it as a category name
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryName = categoryId;
      
      let category = await Category.findOne({ name: categoryName }).session(session);
      
      if (!category) {
        category = new Category({
          name: categoryName,
          description: `Products in the ${categoryName} category`
        });
        await category.save({ session });
      }
      
      categoryId = category._id;
      categoryName = category.name;
    }
    
    // Create the product with manufacturer information
    const product = new Product({
      ...productData,
      category: categoryId,
      categoryName: categoryName,
      // Override manufacturer fields with verified manufacturer data
      manufacturer: manufacturer.businessName,
      manufacturerInfo: manufacturer.contact.email,
      manufacturerId: manufacturer._id, // Add manufacturer ID reference
      uploadedBy: userId // Track who uploaded the product
    });
    
    await product.save({ session });
    
    // Add product to category's products array
    await Category.findByIdAndUpdate(
      categoryId,
      { $addToSet: { products: product._id } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    console.log('✅ Product added successfully by manufacturer:', manufacturer.businessName);
    
    res.status(201).json({ 
      success: true, 
      product,
      message: "Product added successfully",
      manufacturerInfo: {
        id: manufacturer._id,
        name: manufacturer.businessName
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error adding product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add product", 
      error: error.message 
    });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// Get products by manufacturer
export const getProductsByManufacturer = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find manufacturer by userId
    const manufacturer = await Manufacturer.findOne({ userId });
    
    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturer profile not found'
      });
    }
    
    // Find all products by this manufacturer
    const products = await Product.find({ 
      manufacturerId: manufacturer._id 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      products,
      manufacturer: {
        _id: manufacturer._id,
        businessName: manufacturer.businessName
      },
      count: products.length
    });
  } catch (error) {
    console.error("Error fetching manufacturer products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    console.log('Fetching products for category:', categoryId);
    
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category ID format",
        categoryId: categoryId
      });
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found",
        categoryId: categoryId
      });
    }
    
    const products = await Product.find({ category: categoryId }).sort({ createdAt: -1 });
    
    console.log(`Found ${products.length} products for category ${categoryId}`);
    
    res.status(200).json({ 
      success: true, 
      products,
      category: {
        _id: category._id,
        name: category.name,
        description: category.description
      },
      count: products.length
    });
    
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch products by category",
      error: error.message 
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID format" 
      });
    }
    
    const product = await Product.findById(id).populate('category', 'name description');
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// Update product - only by manufacturer who created it
export const updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const productData = req.body;
    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID format" 
      });
    }
    
    // Find the product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // Verify manufacturer owns this product
    const manufacturer = await Manufacturer.findOne({ 
      userId: userId,
      status: 'approved'
    });
    
    if (!manufacturer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Manufacturer profile not found or not approved'
      });
    }
    
    // Check if product belongs to this manufacturer
    if (existingProduct.manufacturerId?.toString() !== manufacturer._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }
    
    // Handle category if it's being updated
    if (productData.category) {
      let categoryId = productData.category;
      let categoryName = productData.categoryName;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        categoryName = categoryId;
        
        let category = await Category.findOne({ name: categoryName }).session(session);
        
        if (!category) {
          category = new Category({
            name: categoryName,
            description: `Products in the ${categoryName} category`
          });
          await category.save({ session });
        }
        
        categoryId = category._id;
        categoryName = category.name;
        
        productData.category = categoryId;
        productData.categoryName = categoryName;
      }
      
      if (existingProduct.category.toString() !== categoryId.toString()) {
        await Category.findByIdAndUpdate(
          existingProduct.category,
          { $pull: { products: id } },
          { session }
        );
        
        await Category.findByIdAndUpdate(
          categoryId,
          { $addToSet: { products: id } },
          { session }
        );
      }
    }
    
    // Prevent changing manufacturer information
    delete productData.manufacturer;
    delete productData.manufacturerInfo;
    delete productData.manufacturerId;
    delete productData.uploadedBy;
    
    // Update the product
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    console.log('✅ Product updated by manufacturer:', manufacturer.businessName);
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// Delete product - only by manufacturer who created it
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid product ID format" 
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // Verify manufacturer owns this product
    const manufacturer = await Manufacturer.findOne({ 
      userId: userId,
      status: 'approved'
    });
    
    if (!manufacturer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Manufacturer profile not found or not approved'
      });
    }
    
    if (product.manufacturerId?.toString() !== manufacturer._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }
    
    // Remove product from category
    await Category.findByIdAndUpdate(
      product.category,
      { $pull: { products: id } },
      { session }
    );
    
    // Delete the product
    await Product.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    console.log('✅ Product deleted by manufacturer:', manufacturer.businessName);
    
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}