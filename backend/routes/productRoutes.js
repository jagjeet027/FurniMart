import express from "express";
import { 
  addProduct, 
  getAllProducts,
  getProductsByCategory,
  getProductsByManufacturer,
  getProductById,
  updateProduct,
  deleteProduct
} from "../Controllers/productController.js";
import { authenticateToken } from '../middleware/authMiddleware.js';
import { verifyManufacturer, verifyProductOwnership } from '../middleware/manufacturerProductAuth.js';

const router = express.Router();

// Public routes - no authentication needed
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes - require manufacturer authentication
// Step 1: authenticateToken verifies JWT and sets req.userId
// Step 2: verifyManufacturer checks if user is an approved manufacturer
router.post("/", 
  authenticateToken, 
  verifyManufacturer, 
  addProduct
);

router.post("/add", 
  authenticateToken, 
  verifyManufacturer, 
  addProduct
);

// Get manufacturer's own products
router.get("/manufacturer/my-products", 
  authenticateToken, 
  verifyManufacturer, 
  getProductsByManufacturer
);

// Update product - verify ownership
// Step 3: verifyProductOwnership ensures manufacturer owns this product
router.put("/:id", 
  authenticateToken, 
  verifyManufacturer,
  verifyProductOwnership,
  updateProduct
);

// Delete product - verify ownership
router.delete("/:id", 
  authenticateToken, 
  verifyManufacturer,
  verifyProductOwnership,
  deleteProduct
);

export default router;