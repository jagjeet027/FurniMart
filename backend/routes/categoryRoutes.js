import express from "express";
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory,
  initializeDefaultCategories
} from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/initialize", initializeDefaultCategories);
router.get("/:id", getCategoryById);

// Protected routes (admin only)
router.post("/",  createCategory);

export default router;