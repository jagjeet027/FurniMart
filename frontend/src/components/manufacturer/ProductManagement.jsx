import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Search, ArrowLeft, Plus, AlertCircle, Loader, X, RefreshCw } from 'lucide-react';
import ProductUploadForm from './ProductUploadForm';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../axios/axiosInstance';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const token = localStorage.getItem("accessToken");

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        setError('Please login to view products');
        navigate('/login');
        return;
      }

      // ✅ FIXED: Fetch only manufacturer's own products
      const response = await api.get('/products/manufacturer/my-products', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      console.log("My Products data:", response.data);
      const productsData = Array.isArray(response.data.products) ? response.data.products : [];
      setProducts(productsData);
      
      // Extract unique categories
      const categoryMap = new Map();
      productsData.forEach(product => {
        if (product.category) {
          categoryMap.set(product.category, product.categoryName || product.category);
        }
      });
      const uniqueCategories = Array.from(categoryMap, ([id, name]) => ({ id, name }));
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      console.error('Data fetch error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'You need to be an approved manufacturer to view products.');
      } else {
        setError(err.response?.data?.message || 'Failed to load data. Please try again.');
      }
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchData();
  }, [token, navigate]);

  const handleEditProduct = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleAddProduct = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (shouldRefresh = false) => {
    setIsModalOpen(false);
    if (shouldRefresh) {
      fetchProducts();
    }
  };

  const fetchProducts = async () => {
    try {
      setRefreshing(true);
      
      // ✅ FIXED: Fetch only manufacturer's own products
      const response = await api.get('/products/manufacturer/my-products', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      const productsData = Array.isArray(response.data.products) ? response.data.products : [];
      
      setTimeout(() => {
        setProducts(productsData);
        
        const categoryMap = new Map();
        productsData.forEach(product => {
          if (product.category) {
            categoryMap.set(product.category, product.categoryName || product.category);
          }
        });
        const uniqueCategories = Array.from(categoryMap, ([id, name]) => ({ id, name }));
        setCategories(uniqueCategories);
        
        setError(null);
        setRefreshing(false);
      }, 600);
    } catch (err) {
      console.error('Product refresh error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError(err.response?.data?.message || 'Access denied.');
      } else {
        setError(err.response?.data?.message || 'Failed to refresh products. Please try again.');
      }
      setRefreshing(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setDeleteLoading(productId);
        setDeletingId(productId);
        
        console.log('🗑️ Deleting product:', productId);
        
        const response = await api.delete(`/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Delete response:', response.data);
        
        setTimeout(() => {
          setProducts(products.filter(product => product._id !== productId));
          setDeleteLoading(null);
          setDeletingId(null);
        }, 800);
        
        setError(null);
      } catch (err) {
        console.error('❌ Delete error:', err);
        
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => navigate('/login'), 1500);
        } else if (err.response?.status === 403) {
          const errorMsg = err.response?.data?.message || 'You can only delete your own products.';
          setError(errorMsg);
        } else {
          setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
        }
        setDeleteLoading(null);
        setDeletingId(null);
      }
    }
  };

  const clearError = () => setError(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (typeof price === 'string') {
      return price.startsWith('$') ? price : `$${price}`;
    }
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/manufacturer/dashboard')}
            className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            My Products
          </h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              aria-label="Search products"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full sm:w-auto shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchProducts}
            disabled={refreshing}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-600 transition-colors w-full sm:w-auto justify-center shadow-sm"
            aria-label="Refresh products"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddProduct}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center shadow-sm"
            aria-label="Add new product"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center">
              <AlertCircle className="mr-2" size={18} />
              <span>{error}</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearError} 
              className="text-red-700" 
              aria-label="Dismiss error"
            >
              <X size={18} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 flex flex-col items-center justify-center"
        >
          <Loader className="animate-spin mb-4 text-blue-600" size={40} />
          <p className="text-lg text-blue-800">Loading your products...</p>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm p-8"
        >
          <div className="flex flex-col items-center max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || selectedCategory ? 
                "No matching products found" : 
                "You haven't added any products yet"}
            </h3>
            <p className="mb-6">
              {searchTerm || selectedCategory ? 
                "Try adjusting your search or filters." : 
                "Start building your product catalog by adding your first product."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddProduct}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Add Your First Product</span>
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: deletingId === product._id ? 0 : 1, 
                  scale: deletingId === product._id ? 0.8 : 1,
                  rotateZ: deletingId === product._id ? -5 : 0
                }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.imageUrl || '/api/placeholder/400/300'}
                    alt={product.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/300';
                      e.target.onerror = null;
                    }}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditProduct(product._id)}
                      className="p-1.5 bg-white rounded-full shadow hover:bg-blue-50 transition-colors"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Edit size={16} className="text-blue-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15, backgroundColor: "#FEE2E2" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deleteLoading === product._id}
                      className={`p-1.5 bg-white rounded-full shadow transition-colors ${
                        deleteLoading === product._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-label={`Delete ${product.name}`}
                    >
                      {deleteLoading === product._id ? (
                        <Loader size={16} className="text-red-600 animate-spin" />
                      ) : (
                        <Trash2 size={16} className="text-red-600" />
                      )}
                    </motion.button>
                  </div>
                  {product.category && (
                    <motion.span 
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
                    >
                      {product.categoryName || product.category}
                    </motion.span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{product.name}</h3>
                  {product.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      product.stock <= 5 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stock <= 5 ? `Only ${product.stock} left!` : `Stock: ${product.stock}`}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-xl"
            >
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: "#F3F4F6" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCloseModal()} 
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Close modal"
              >
                <X size={24} />
              </motion.button>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
                <ProductUploadForm onSubmitSuccess={() => handleCloseModal(true)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;