import React, { useState, useEffect } from "react";
import { Upload, X, Plus, Camera, Star, ArrowLeft, Grid, Tag, Layers, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../axios/axiosInstance";

const ProductUploadForm = ({ onSubmitSuccess }) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dqzsq98mj";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "FurniMart";
  const navigate = useNavigate();
  
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [manufacturerInfo, setManufacturerInfo] = useState(null);
  const [isLoadingManufacturer, setIsLoadingManufacturer] = useState(true);
  const [manufacturerError, setManufacturerError] = useState("");
  
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    categoryName: "",
    description: "",
    sizes: [],
    features: [""],
    rating: 0,
    reviews: 0,
    stock: 10,
  });

  const DEFAULT_CATEGORIES = [
    { _id: "main-outdoor-gate", name: "Main Outdoor Gate" },
    { _id: "sofas", name: "Sofas" },
    { _id: "dining-tables", name: "Dining Tables" },
    { _id: "beds", name: "Beds" },
    { _id: "wardrobes", name: "Wardrobes" },
    { _id: "armchairs", name: "Armchairs" },
    { _id: "office-chairs", name: "Office Chairs" },
    { _id: "patio-sets", name: "Patio Sets" },
    { _id: "office-desks", name: "Office Desks" },
    { _id: "windows", name: "Windows" },
    { _id: "swings", name: "Swings" },
    { _id: "chairs", name: "Chairs" },
    { _id: "tables", name: "Tables" },
    { _id: "bookshelves", name: "Bookshelves" },
    { _id: "tv-units", name: "TV Units" },
    { _id: "coffee-tables", name: "Coffee Tables" },
    { _id: "storage-cabinets", name: "Storage Cabinets" },
    { _id: "outdoor-furniture", name: "Outdoor Furniture" },
    { _id: "other", name: "Other" }
  ];

  const token = localStorage.getItem("accessToken");  
  const [newSize, setNewSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchManufacturerInfo = async () => {
      setIsLoadingManufacturer(true);
      setManufacturerError("");
      
      try {
        const response = await api.get('/manufacturers/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.data.success && response.data.data) {
          const manufacturer = response.data.data;
          
          if (manufacturer.status !== 'approved') {
            setManufacturerError(
              manufacturer.status === 'pending' 
                ? 'Your manufacturer registration is pending approval. You cannot add products yet.'
                : 'Your manufacturer registration has been rejected. Please contact support.'
            );
            setManufacturerInfo(null);
          } else {
            setManufacturerInfo(manufacturer);
          }
        } else {
          setManufacturerError('Manufacturer profile not found. Please register as a manufacturer first.');
        }
      } catch (error) {
        console.error("Failed to fetch manufacturer info:", error);
        const errorMsg = error.response?.data?.message || 'Failed to verify manufacturer status';
        setManufacturerError(errorMsg);
        setManufacturerInfo(null);
      } finally {
        setIsLoadingManufacturer(false);
      }
    };

    if (token) {
      fetchManufacturerInfo();
    } else {
      setManufacturerError("Please login to add products");
      setIsLoadingManufacturer(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.get('/categories');
        const categoriesData = response.data.categories || response.data;
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductCounts = async () => {
      const counts = {};
      
      try {
        const response = await api.get('/products');
        const products = response.data.products || response.data;
        
        if (Array.isArray(products) && products.length > 0) {
          products.forEach(product => {
            const categoryId = product.category;
            if (categoryId) {
              counts[categoryId] = (counts[categoryId] || 0) + 1;
            }
          });
        }
        
        setCategoryCounts(counts);
      } catch (error) {
        console.error("Failed to fetch product counts:", error);
      }
    };

    if (!isLoadingCategories && categories.length > 0) {
      fetchProductCounts();
    }
  }, [isLoadingCategories, categories]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
      uploaded: false
    }));
    
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index].url) {
      URL.revokeObjectURL(newImages[index].url);
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const selectedValue = e.target.value;
    const selectedCategory = categories.find(cat => cat._id === selectedValue);
    
    if (selectedValue === "custom") {
      setProductData(prev => ({
        ...prev,
        category: "custom",
        categoryName: ""
      }));
    } else if (selectedCategory) {
      setProductData(prev => ({
        ...prev,
        category: selectedValue,
        categoryName: selectedCategory.name
      }));
    } else {
      setProductData(prev => ({
        ...prev,
        category: selectedValue,
        categoryName: selectedValue
      }));
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action) action();
    }
  };

  const addSize = () => {
    if (newSize.trim()) {
      setProductData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()],
      }));
      setNewSize("");
    }
  };

  const removeSize = (index) => {
    setProductData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const addFeature = () => {
    setProductData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...productData.features];
    newFeatures[index] = value;
    setProductData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const removeFeature = (index) => {
    if (productData.features.length === 1) return;
    
    const newFeatures = productData.features.filter((_, i) => i !== index);
    setProductData((prev) => ({
      ...prev,
      features: newFeatures,
    }));
  };

  const navigateToProducts = () => {
    navigate("/products");
  };

  // Helper function to create category if needed
  const ensureCategoryExists = async (categoryId, categoryName) => {
    try {
      // If it's a custom category, create it first
      if (categoryId === "custom" && categoryName.trim()) {
        console.log("Creating new category:", categoryName);
        
        const response = await api.post('/categories', {
          name: categoryName.trim(),
          description: `Products in the ${categoryName.trim()} category`
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.data && response.data.category && response.data.category._id) {
          console.log("Category created successfully:", response.data.category);
          return {
            categoryId: response.data.category._id,
            categoryName: response.data.category.name
          };
        }
      }
      
      // If it's an existing category, just return it
      return {
        categoryId: categoryId,
        categoryName: categoryName
      };
    } catch (error) {
      console.error("Failed to create category:", error);
      throw new Error(`Failed to create category: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    
    try {
      // Validate category name for custom categories
      if (productData.category === "custom" && !productData.categoryName.trim()) {
        setUploadError("Please enter a category name");
        setIsUploading(false);
        return;
      }

      // Handle category - create if custom
      let finalCategoryId = productData.category;
      let finalCategoryName = productData.categoryName;

      if (productData.category === "custom") {
        try {
          const categoryResult = await ensureCategoryExists(productData.category, productData.categoryName);
          finalCategoryId = categoryResult.categoryId;
          finalCategoryName = categoryResult.categoryName;
          console.log("Using category:", finalCategoryId, finalCategoryName);
        } catch (error) {
          setUploadError(error.message);
          setIsUploading(false);
          return;
        }
      }

      // Upload images
      let imageUrls = [];
      if (images.length > 0) {
        try {
          for (const img of images) {
            if (img.file) {
              const formData = new FormData();
              formData.append("file", img.file);
              formData.append("upload_preset", uploadPreset);
              
              const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                  method: 'POST',
                  body: formData,
                }
              );
              
              if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
              }
              
              const data = await response.json();
              imageUrls.push(data.secure_url);
            } else if (img.url && !img.url.startsWith('blob:')) {
              imageUrls.push(img.url);
            }
          }
        } catch (uploadError) {
          console.error("Failed to upload images:", uploadError);
          setUploadError("Failed to upload images. Please try again.");
          setIsUploading(false);
          return;
        }
      }
      
      const formattedPrice = productData.price.startsWith("$")
        ? productData.price
        : `$${productData.price}`;
      
      const finalProductData = {
        name: productData.name,
        price: formattedPrice,
        category: finalCategoryId,
        categoryName: finalCategoryName,
        description: productData.description,
        sizes: productData.sizes,
        features: productData.features,
        images: imageUrls,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : "",
        rating: productData.rating,
        reviews: productData.reviews,
        stock: parseInt(productData.stock) || 10,
      };
      
      console.log("Submitting product data:", finalProductData);
      
      try {
        const response = await api.post("/products/add", finalProductData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Product uploaded successfully:", response.data);
        setUploadSuccess(true);
        
        setProductData({
          name: "",
          price: "",
          category: "",
          categoryName: "",
          description: "",
          sizes: [],
          features: [""],
          rating: 0,
          reviews: 0,
          stock: 10,
        });
        setImages([]);
        
        if (onSubmitSuccess && typeof onSubmitSuccess === 'function') {
          onSubmitSuccess();
        }
        
      } catch (error) {
        console.error("Error uploading product:", error);
        const errorMsg = error.response?.data?.message || "Failed to save product";
        setUploadError(errorMsg);
      }
      
    } catch (error) {
      console.error("Error during product upload:", error);
      setUploadError(`An error occurred: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingManufacturer) {
    return (
      <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying manufacturer status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (manufacturerError) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Cannot Add Products</h3>
              <p className="text-red-700 mb-4">{manufacturerError}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/manufacturer/register")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Register as Manufacturer
                </button>
                <button
                  onClick={navigateToProducts}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Back to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-orange-800">Upload New Product</h2>
          {manufacturerInfo && (
            <div className="flex items-center mt-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Uploading as: <strong>{manufacturerInfo.businessName}</strong></span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={navigateToProducts}
          className="flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>
      </div>
      
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 shadow-sm">
          {uploadError}
        </div>
      )}

      {uploadSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200 shadow-sm flex justify-between items-center">
          <span>Product uploaded successfully!</span>
          <button
            onClick={navigateToProducts}
            className="px-4 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Products
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload section */}
        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
          <label className="block text-sm font-medium text-orange-700 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-orange-500" />
            Product Images
          </label>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-orange-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-orange-100"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            ))}
            <label className="relative cursor-pointer">
              <div className="w-full h-32 border-2 border-dashed border-orange-300 rounded-lg flex flex-col items-center justify-center hover:border-orange-500 hover:bg-orange-100 transition-colors">
                <Plus className="w-8 h-8 text-orange-400 mb-2" />
                <span className="text-sm text-orange-500">Add Image</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
        
        {/* Basic product info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-orange-500" />
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
              className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center">
              <span className="mr-2 text-orange-500">$</span>
              Price
            </label>
            <input
              type="text"
              name="price"
              value={productData.price}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
              placeholder="299"
              className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
              required
            />
          </div>
        </div>
        
        {/* Rating and stock */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center">
              <Star className="w-4 h-4 mr-2 text-orange-500" />
              Initial Rating (0-5)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                name="rating"
                value={productData.rating}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, null)}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
              />
              <div className="flex ml-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= productData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-orange-500" />
              Stock Count
            </label>
            <input
              type="number"
              name="stock"
              value={productData.stock}
              onChange={handleInputChange}
              onKeyDown={(e) => handleKeyDown(e, null)}
              min="0"
              className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
              required
            />
          </div>
        </div>
        
        {/* Category Selection */}
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
          <label className="block text-sm font-medium text-orange-700 mb-1 flex items-center">
            <Grid className="w-4 h-4 mr-2 text-orange-500" />
            Category
          </label>
          
          {isLoadingCategories ? (
            <div className="w-full h-10 bg-orange-100 animate-pulse rounded-lg"></div>
          ) : (
            <>
              <select
                name="category"
                value={productData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
                required
                disabled={isUploading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name} {categoryCounts[category._id] ? `(${categoryCounts[category._id]} products)` : ''}
                  </option>
                ))}
                <option value="custom">➕ Add New Category</option>
              </select>
              
              <div className="grid grid-cols-4 gap-2 mt-3">
                {categories.slice(0, 8).map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    className={`py-2 px-3 rounded-lg text-sm text-center transition-colors ${
                      productData.category === category._id 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'bg-white hover:bg-orange-100 text-orange-800 border border-orange-200'
                    }`}
                    onClick={() => {
                      setProductData(prev => ({
                        ...prev,
                        category: category._id,
                        categoryName: category.name
                      }));
                    }}
                  >
                    {category.name}
                    {categoryCounts[category._id] ? (
                      <span className="block text-xs mt-1 font-medium">
                        {categoryCounts[category._id]} {categoryCounts[category._id] === 1 ? 'product' : 'products'}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </>
          )}
          
          {productData.category === 'custom' && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
              <label className="block text-sm font-medium text-orange-700 mb-1">
                New Category Name
              </label>
              <input
                type="text"
                name="categoryName"
                value={productData.categoryName}
                onChange={handleInputChange}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="Enter new category name"
                className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                required
              />
              <p className="text-xs text-orange-600 mt-1">
                {productData.categoryName.trim() 
                  ? `Will create category: "${productData.categoryName.trim()}"` 
                  : 'Please enter a category name'}
              </p>
            </div>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-orange-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
            required
          />
        </div>
        
        {/* Sizes */}
        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
          <label className="block text-sm font-medium text-orange-700">
            Product Sizes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, addSize)}
              className="flex-1 px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
              placeholder="Enter size (e.g., 8x6 ft)"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {productData.sizes.map((size, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-sm"
              >
                <span className="text-orange-800">{size}</span>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Product Features
          </label>
          {productData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                className="flex-1 px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
                placeholder="Enter a product feature"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="p-2 text-orange-500 hover:text-orange-700 bg-white rounded-lg border border-orange-200 shadow-sm"
                disabled={productData.features.length === 1}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center text-orange-600 hover:text-orange-800 px-3 py-1 bg-white rounded-lg border border-orange-200 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Feature
          </button>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Uploading Product...</span>
            </div>) : (
            <>
              <Upload className="w-5 h-5 text-white" />
              <span>Upload Product</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ProductUploadForm;