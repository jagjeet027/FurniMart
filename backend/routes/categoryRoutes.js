import express from "express";
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory,
  updateCategory,      // ADD THIS
  deleteCategory,      // ADD THIS
  initializeDefaultCategories
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/initialize", initializeDefaultCategories);
router.get("/:id", getCategoryById);

// Protected routes (admin only)
router.post("/", createCategory);
router.put("/:id", updateCategory);     // ADD THIS
router.delete("/:id", deleteCategory);  // ADD THIS

export default router;