import Category from "../models/category.js";
import Product from "../models/product.js";
import mongoose from "mongoose";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    
    // Optionally include product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return {
          ...category._doc,
          productCount
        };
      })
    );
    
    res.status(200).json({ 
      success: true, 
      categories: categoriesWithCount,
      count: categoriesWithCount.length 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Get category by ID with its products - FIXED
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching category by ID:', id);
    
    // Validate if id is a valid ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category ID format",
        categoryId: id
      });
    }
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found",
        categoryId: id
      });
    }
    
    // Fetch products for this category
    const products = await Product.find({ category: id }).sort({ createdAt: -1 });
    
    console.log(`Found category: ${category.name} with ${products.length} products`);
    
    res.status(200).json({ 
      success: true, 
      category: {
        ...category._doc,
        products,
        productCount: products.length
      }
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch category",
      error: error.message
    });
  }
};

// Create new category if it doesn't exist
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Category name is required" 
      });
    }
    
    // Check if category already exists (case insensitive)
    let category = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (category) {
      return res.status(200).json({ 
        success: true, 
        category, 
        message: "Category already exists" 
      });
    }
    
    // Create new category
    category = new Category({
      name: name.trim(),
      description: description || `Products in the ${name} category`
    });
    
    await category.save();
    
    res.status(201).json({ 
      success: true, 
      category,
      message: "Category created successfully"
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create category",
      error: error.message
    });
  }
};

// Initialize default categories
export const initializeDefaultCategories = async (req, res) => {
  try {
    const defaultCategories = [
      { name: "Main Outdoor Gate", description: "Outdoor gates and entrance solutions" },
      { name: "Sofas", description: "Comfortable seating solutions for your living room" },
      { name: "Dining Tables", description: "Tables for dining and family gatherings" },
      { name: "Beds", description: "Comfortable beds for a good night's sleep" },
      { name: "Wardrobes", description: "Storage solutions for your clothing" },
      { name: "Armchairs", description: "Single seat comfort chairs" },
      { name: "Office Chairs", description: "Ergonomic chairs for workplace comfort" },
      { name: "Patio Sets", description: "Outdoor furniture sets for patios and gardens" },
      { name: "Office Desks", description: "Work desks for home and office use" },
      { name: "Other", description: "Miscellaneous furniture items" }
    ];
    
    const existingCategories = await Category.find({ 
      name: { $in: defaultCategories.map(cat => cat.name) } 
    });
    const existingCategoryNames = existingCategories.map(cat => cat.name);
    
    const categoriesToCreate = defaultCategories.filter(
      catData => !existingCategoryNames.includes(catData.name)
    );
    
    if (categoriesToCreate.length > 0) {
      await Category.insertMany(categoriesToCreate);
    }
    
    const allCategories = await Category.find({}).sort({ name: 1 });
    
    res.status(200).json({ 
      success: true, 
      categories: allCategories,
      message: `${categoriesToCreate.length} new categories initialized`,
      totalCategories: allCategories.length
    });
  } catch (error) {
    console.error("Error initializing categories:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to initialize categories",
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category ID format" 
      });
    }
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Category name is required" 
      });
    }
    
    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: "A category with this name already exists" 
      });
    }
    
    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), description },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      category,
      message: "Category updated successfully"
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update category",
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    // Validate if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category ID format" 
      });
    }
    
    const category = await Category.findById(id);
    
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        message: "Category not found" 
      });
    }
    
    // Check if there are products in this category
    const productCount = await Product.countDocuments({ category: id });
    
    if (productCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It contains ${productCount} product(s). Please move or delete these products first.`,
        productCount
      });
    }
    
    // Delete the category
    await Category.findByIdAndDelete(id).session(session);
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ 
      success: true, 
      message: "Category deleted successfully" 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    console.error("Error deleting category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete category",
      error: error.message
    });
  }
};