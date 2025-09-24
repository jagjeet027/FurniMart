  import express from "express";
  import { 
    addProduct, 
    getAllProducts,
    getProductsByCategory,
    getProductById,
    updateProduct,
    deleteProduct
  } from "../Controllers/productController.js";


  const router = express.Router();

  // Public routes
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);  // KEY ROUTE
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;