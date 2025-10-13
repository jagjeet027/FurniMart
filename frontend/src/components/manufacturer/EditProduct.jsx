import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  X, 
  Plus, 
  Camera, 
  Star, 
  Grid, 
  Tag, 
  Layers, 
  Save, 
  Trash2,
  Building2
} from "lucide-react";
import api from "../../axios/axiosInstance";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dqzsq98mj";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "FurniMart";
  
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState({
    name: "",
    price: "",
    category: "",
    categoryName: "",
    description: "",
    manufacturer: "",
    manufacturerInfo: "",
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

  const token = localStorage.getItem("token");
  const [newSize, setNewSize] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products/${id}`);
        const product = response.data.product || response.data;
        
        let formattedPrice = product.price;
        if (typeof formattedPrice === 'string' && formattedPrice.startsWith('$')) {
          formattedPrice = formattedPrice.substring(1);
        }
        
        const processedProduct = {
          name: product.name || "",
          price: formattedPrice || "",
          description: product.description || "",
          category: product.category || "",
          categoryName: product.categoryName || "",
          manufacturer: product.manufacturer || "",
          manufacturerInfo: product.manufacturerInfo || "",
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          features: Array.isArray(product.features) && product.features.length > 0 
            ? product.features 
            : [""],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          stock: product.stock || 10,
        };
        
        setProductData(processedProduct);
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const formattedImages = product.images.map(img => ({
            url: img,
            uploaded: true
          }));
          setImages(formattedImages);
        } else if (product.imageUrl) {
          setImages([{ url: product.imageUrl, uploaded: true }]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setUploadError("Failed to load product data. Please try again.");
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await api.get('/categories');
        const categoriesData = response.data.categories || response.data;
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData);
          } else {
          console.log("No categories found in API response, using defaults");
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
    if (newImages[index].url && newImages[index].url.startsWith('blob:')) {
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

  // Prevent form submission on Enter key
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

  const ensureCategoryExists = async (categoryId, categoryName) => {
    try {
      const categoryExists = categories.some(cat => cat._id === categoryId);
      
      if (!categoryId || !categoryExists) {
        const response = await api.post('/categories', {
          name: categoryName,
          description: `Products in the ${categoryName} category`
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.data && response.data.category && response.data.category._id) {
          return response.data.category._id;
        }
      }
      
      return categoryId;
    } catch (error) {
      console.error("Failed to create category:", error);
      return categoryId || categoryName;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    setIsUploading(true);
    setUploadError("");
    
    try {
      await api.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUploadSuccess(true);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error("Failed to delete product:", error);
      setUploadError("Failed to delete product. Please try again.");
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadError("");
    setUploadSuccess(false);
    
    try {
      const categoryId = await ensureCategoryExists(productData.category, productData.categoryName);
      
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
            } else if (img.url) {
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
        ...productData,
        category: categoryId,
        price: formattedPrice,
        images: imageUrls,
        stock: parseInt(productData.stock) || 10,
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : "",
      };
      
      try {
        const response = await api.put(`/products/${id}`, finalProductData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        console.log("Product updated successfully:", response.data);
        setUploadSuccess(true);
        
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } catch (error) {
        console.error("Failed to update product:", error);
        setUploadError("Failed to update product. Please try again.");
      }
    } catch (error) {
      console.error("Error during product update:", error);
      setUploadError(`An error occurred: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-r from-white to-orange-50 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-orange-800">Edit Product</h2>
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
          <span>Product updated successfully!</span>
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
                  onError={(e) => {
                    e.target.src = '/api/placeholder/400/300';
                    e.target.onerror = null;
                  }}
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
            {images.length < 4 && (
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
            )}
          </div>
          <p className="text-xs text-orange-500 mt-1">Add up to 4 high-quality product images</p>
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
              Rating (0-5)
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
            </div>
          )}
        </div>
        
        {/* Selected Category Display */}
        {productData.category && productData.category !== 'custom' && (
          <div className="px-4 py-3 bg-orange-100 rounded-lg border border-orange-200 shadow-sm">
            <p className="text-sm text-orange-700 flex items-center">
              <Tag className="w-4 h-4 mr-2 text-orange-500" />
              Selected Category: <span className="font-medium ml-1">{productData.categoryName}</span>
              {categoryCounts[productData.category] && (
                <span className="ml-2 px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full text-xs">
                  {categoryCounts[productData.category]} {categoryCounts[productData.category] === 1 ? 'product' : 'products'}
                </span>
              )}
            </p>
          </div>
        )}
        
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
        
        {/* Manufacturer info - READ ONLY */}
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-gray-500" />
              Manufacturer Name
            </label>
            <input
              type="text"
              value={productData.manufacturer}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              readOnly
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Manufacturer information cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-gray-500" />
              Manufacturer Info
            </label>
            <input
              type="text"
              value={productData.manufacturerInfo}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              readOnly
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Manufacturer information cannot be changed</p>
          </div>
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
            {productData.sizes.length === 0 && (
              <p className="text-sm text-orange-500 italic">No sizes added yet</p>
            )}
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Product Features
          </label>
          <div className="space-y-3">
            {productData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, null)}
                  className="flex-1 px-4 py-2 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
                  placeholder={`Feature ${index + 1}`}
                  required={index === 0}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-2 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 shadow-sm disabled:opacity-50"
                  disabled={productData.features.length === 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="w-full px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 shadow-sm flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Feature
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-4 justify-between pt-4 border-t border-orange-200">
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-colors flex items-center justify-center disabled:bg-gray-400"
            disabled={isUploading}
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Product
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={navigateToProducts}
              className="px-6 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 shadow-md transition-colors disabled:bg-gray-200"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 shadow-md transition-colors flex items-center justify-center disabled:bg-orange-300"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      
      {/* Additional Product Metadata */}
      <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-100 shadow-sm">
        <h3 className="text-lg font-medium text-orange-800 mb-3">Product Metadata</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <span className="font-medium text-orange-700 mr-2">Product ID:</span>
            <span className="text-gray-700">{id}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-orange-700 mr-2">Reviews:</span>
            <span className="text-gray-700">{productData.reviews}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-orange-700 mr-2">Rating:</span>
            <div className="flex items-center">
              <span className="text-gray-700 mr-1">{productData.rating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${
                      star <= productData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-orange-700 mr-2">Stock Level:</span>
            <span className={`px-2 py-0.5 rounded-full text-white ${
              productData.stock > 10 
                ? 'bg-green-500' 
                : productData.stock > 0 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}>
              {productData.stock > 10 
                ? 'In Stock' 
                : productData.stock > 0 
                  ? 'Low Stock' 
                  : 'Out of Stock'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;