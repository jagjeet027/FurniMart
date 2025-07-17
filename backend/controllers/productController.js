import Product from "../models/product.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

// Add new product with category creation/association
export const addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const productData = req.body;
    
    // Handle category - create it if it doesn't exist
    let categoryId = productData.category;
    let categoryName = productData.categoryName;
    
    // If categoryId is not a valid ObjectId, treat it as a category name
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryName = categoryId; // The value is actually a name, not an ID
      
      // Look up or create category by name
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
    
    // Create the product with the category information
    const product = new Product({
      ...productData,
      category: categoryId,
      categoryName: categoryName
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
    
    res.status(201).json({ 
      success: true, 
      product,
      message: "Product added successfully" 
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

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await Product.find({ category: categoryId });
    
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products by category" });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Handle category if it's being updated
    if (productData.category) {
      let categoryId = productData.category;
      let categoryName = productData.categoryName;
      
      // If categoryId is not a valid ObjectId, treat it as a category name
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        categoryName = categoryId; // The value is actually a name, not an ID
        
        // Look up or create category by name
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
      
      // Get the old product to see if category changed
      const oldProduct = await Product.findById(id);
      
      if (oldProduct && oldProduct.category.toString() !== categoryId.toString()) {
        // Remove product from old category
        await Category.findByIdAndUpdate(
          oldProduct.category,
          { $pull: { products: id } },
          { session }
        );
        
        // Add product to new category
        await Category.findByIdAndUpdate(
          categoryId,
          { $addToSet: { products: id } },
          { session }
        );
      }
    }
    
    // Update the product
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, session }
    );
    
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ success: true, product });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Product not found" });
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
    
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};