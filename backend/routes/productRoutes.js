import express from "express";
import { 
  addProduct, 
  getAllProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';


const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes (admin only)
router.post("/", addProduct);
router.post("/add",  addProduct); // Keep both routes for backward compatibility
router.put("/:id",  updateProduct);
router.delete("/:id",  deleteProduct);

export default router;