import Category from "../models/category.js";
import Product from "../models/product.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Get category by ID with its products
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    
    // Fetch products for this category
    const products = await Product.find({ category: id });
    
    res.status(200).json({ 
      success: true, 
      category: {
        ...category._doc,
        products
      }
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category" });
  }
};

// Create new category if it doesn't exist
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Check if category already exists
    let category = await Category.findOne({ name });
    
    if (category) {
      return res.status(200).json({ success: true, category, message: "Category already exists" });
    }
    
    // Create new category
    category = new Category({
      name,
      description: description || `Products in the ${name} category`
    });
    
    await category.save();
    
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ success: false, message: "Failed to create category" });
  }
};

// Initialize default categories
export const initializeDefaultCategories = async (req, res) => {
  try {
    const defaultCategories = [
      "Main Outdoor Gate",
      "Sofas",
      "Dining Tables",
      "Beds",
      "Wardrobes", 
      "Armchairs",
      "Office Chairs",
      "Patio Sets",
      "Office Desks",
      "Other"
    ];
    
    const existingCategories = await Category.find({ name: { $in: defaultCategories } });
    const existingCategoryNames = existingCategories.map(cat => cat.name);
    
    const categoriesToCreate = defaultCategories.filter(
      catName => !existingCategoryNames.includes(catName)
    );
    
    if (categoriesToCreate.length > 0) {
      const newCategories = categoriesToCreate.map(name => ({
        name,
        description: `Products in the ${name} category`
      }));
      
      await Category.insertMany(newCategories);
    }
    
    const allCategories = await Category.find({}).sort({ name: 1 });
    
    res.status(200).json({ 
      success: true, 
      categories: allCategories,
      message: `${categoriesToCreate.length} categories initialized`
    });
  } catch (error) {
    console.error("Error initializing categories:", error);
    res.status(500).json({ success: false, message: "Failed to initialize categories" });
  }
};