import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sofa, 
  Lamp, 
  Bed, 
  Briefcase, 
  Trees, 
  Menu,
  X,
  ShieldCheck,
  Truck,
  Gift,
  Tag,
  ChevronRight,
  Package,
  ChevronLeft,
  Grid,
  FileText,
  Send,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Paperclip,
  Loader2,
  ArrowLeft,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import api from './axios/axiosInstance';
import ProductCard from './components/ProductCard';

const categoryIcons = {
  'Sofas': Sofa,
  'Dining Tables': Lamp,
  'Beds': Bed,
  'Office Desks': Briefcase,
  'Patio Sets': Trees,
  'Armchairs': Sofa,
  'Wardrobes': Bed,
  'Office Chairs': Briefcase,
  'default': Sofa
};

// Post Requirements Component
const PostRequirements = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    media: []
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quotationText, setQuotationText] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/posts');
      const postsData = Array.isArray(response.data) ? response.data : 
                       (response.data.posts || response.data.data || []);
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([
        {
          _id: '1',
          author: { name: "John Doe", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          title: "Looking for Custom Office Desk",
          description: "I need a custom-made office desk with specific dimensions (6ft x 3ft) with built-in cable management and drawer space. Preferably in walnut finish.",
          media: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600"],
          quotations: [
            {
              _id: '1',
              author: { name: "Premium Furniture Co.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=PF" },
              message: "We can deliver this in 3 weeks. Estimated price: $1,200-$1,500",
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const fileURLs = files.map(file => URL.createObjectURL(file));
    setSelectedFiles([...selectedFiles, ...fileURLs]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async () => {
    if (newPost.title && newPost.description) {
      try {
        const formData = new FormData();
        formData.append('title', newPost.title);
        formData.append('description', newPost.description);
        
        selectedFiles.forEach((file, index) => {
          formData.append('media', file);
        });

        await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        fetchPosts();
        setNewPost({ title: '', description: '', media: [] });
        setSelectedFiles([]);
        setShowNewPostForm(false);
      } catch (error) {
        console.error('Error creating post:', error);
        const post = {
          _id: Date.now().toString(),
          author: { name: "Current User", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User" },
          createdAt: new Date().toISOString(),
          title: newPost.title,
          description: newPost.description,
          media: selectedFiles,
          quotations: []
        };
        setPosts([post, ...posts]);
        setNewPost({ title: '', description: '', media: [] });
        setSelectedFiles([]);
        setShowNewPostForm(false);
      }
    }
  };

  const handleQuotationSubmit = async (postId) => {
    if (quotationText[postId]?.trim()) {
      try {
        await api.post(`/posts/${postId}/quotations`, {
          message: quotationText[postId]
        });
        fetchPosts();
        setQuotationText({ ...quotationText, [postId]: '' });
      } catch (error) {
        console.error('Error adding quotation:', error);
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return {
              ...post,
              quotations: [
                ...(post.quotations || []),
                {
                  _id: Date.now().toString(),
                  author: { name: "Your Company", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=YC" },
                  message: quotationText[postId],
                  createdAt: new Date().toISOString()
                }
              ]
            };
          }
          return post;
        }));
        setQuotationText({ ...quotationText, [postId]: '' });
      }
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      setPosts(posts.filter(post => post._id !== postId));
    }
    setActiveMenu(null);
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
      });
    }
    setActiveMenu(null);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowNewPostForm(!showNewPostForm)}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
      >
        <FileText className="h-4 w-4" />
        <span>Post Your Requirement</span>
      </motion.button>

      <AnimatePresence>
        {showNewPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 overflow-hidden"
          >
            <h3 className="text-base font-bold text-gray-800 mb-3">Create New Requirement Post</h3>
            
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="e.g., Looking for Custom Office Desk"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                placeholder="Describe your requirements in detail..."
                rows="4"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Attach Photos/Videos (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Paperclip className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Click to upload files</p>
                  <p className="text-xs text-gray-400 mt-0.5">Images and videos supported</p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img src={file} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handlePostSubmit}
                disabled={!newPost.title || !newPost.description}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Post Requirement</span>
              </button>
              <button
                onClick={() => {
                  setShowNewPostForm(false);
                  setNewPost({ title: '', description: '', media: [] });
                  setSelectedFiles([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
                    alt={post.author?.name || "User"}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{post.author?.name || "Anonymous"}</h4>
                    <p className="text-xs text-gray-500">{formatTimestamp(post.createdAt)}</p>
                  </div>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(activeMenu === post._id ? null : post._id)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-600" />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenu === post._id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
                      >
                        <button
                          onClick={() => setActiveMenu(null)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit Post</span>
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Post</span>
                        </button>
                        <button
                          onClick={() => handleShare(post)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                        >
                          <Share2 className="h-4 w-4" />
                          <span>Share Post</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h3>
              <p className="text-gray-600 leading-relaxed">{post.description}</p>

              {post.media && post.media.length > 0 && (
                <div className={`mt-4 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {post.media.map((media, index) => (
                    <img
                      key={index}
                      src={media}
                      alt={`Post media ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <h4 className="font-semibold text-gray-800">Quotations ({post.quotations?.length || 0})</h4>
              </div>

              <div className="space-y-3 mb-4">
                {(post.quotations || []).map((quotation) => (
                  <div key={quotation._id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <img
                        src={quotation.author?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=U"}
                        alt={quotation.author?.name || "User"}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm text-gray-800">
                            {quotation.author?.name || "Anonymous"}
                          </h5>
                          <span className="text-xs text-gray-500">{formatTimestamp(quotation.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{quotation.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={quotationText[post._id] || ''}
                  onChange={(e) => setQuotationText({ ...quotationText, [post._id]: e.target.value })}
                  placeholder="Add your quotation or review..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuotationSubmit(post._id);
                    }
                  }}
                />
                <button
                  onClick={() => handleQuotationSubmit(post._id)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requirements Posted Yet</h3>
          <p className="text-gray-500">Be the first to post your furniture requirement!</p>
        </div>
      )}
    </div>
  );
};

// Category Products Component with Horizontal Scrolling
const CategoryProducts = ({ categoryId, categoryName, onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId]);

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoints = [
        `/products/category/${categoryId}`,
        `/products?category=${categoryId}`,
        `/category/${categoryId}/products`,
        `/products`
      ];

      let productsData = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          let fetchedProducts = response.data.products || response.data || [];
          
          if (endpoint === '/products' && Array.isArray(fetchedProducts)) {
            fetchedProducts = fetchedProducts.filter(product => 
              product.category === categoryId || 
              product.categoryId === categoryId ||
              product.category?._id === categoryId
            );
          }
          
          productsData = Array.isArray(fetchedProducts) ? fetchedProducts : [];
          if (productsData.length > 0) break;
        } catch (err) {
          continue;
        }
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Instant feedback - call onBack immediately
    onBack();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.button
          onClick={handleBack}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-orange-600 hover:text-orange-700 font-medium"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Posts</span>
        </motion.button>
        
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <motion.button
          onClick={handleBack}
          className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-orange-600 hover:text-orange-700 font-medium"
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Posts</span>
        </motion.button>
        
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">{error}</h3>
          <button
            onClick={fetchCategoryProducts}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Display products in rows of 2 with horizontal scrolling
  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={handleBack}
            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-medium"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>
          
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">{categoryName}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{products.length} Products Available</p>
          </div>
        </div>
      </div>

      {/* Products in Horizontal Scrollable Rows */}
      {products.length > 0 ? (
        <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar pr-2">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {row.map((product) => (
                <div key={product._id} className="w-full">
                  <ProductCard product={product} listView={true} />
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-xl shadow-lg"
        >
          <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500">This category doesn't have any products yet.</p>
        </motion.div>
      )}
    </div>
  );
};

const FurnitureMarketplace = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      
      const categoriesData = Array.isArray(response.data) ? response.data : 
                           (response.data.categories || []);
      
      const categoriesWithDetails = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            let productCount = 0;
            const productEndpoints = [
              `/products/category/${category._id}`,
              `/products?category=${category._id}`,
              `/products`
            ];

            for (const endpoint of productEndpoints) {
              try {
                const productsResponse = await api.get(endpoint);
                let fetchedProducts = productsResponse.data.products || productsResponse.data || [];
                
                if (endpoint === '/products' && Array.isArray(fetchedProducts)) {
                  fetchedProducts = fetchedProducts.filter(product => 
                    product.category === category._id || 
                    product.categoryId === category._id ||
                    product.category?._id === category._id
                  );
                }
                
                productCount = Array.isArray(fetchedProducts) ? fetchedProducts.length : 0;
                if (productCount > 0) break;
              } catch (prodErr) {
                continue;
              }
            }
            
            return {
              name: category.name,
              icon: categoryIcons[category.name] || categoryIcons.default,
              id: category._id || category.id,
              productCount: productCount
            };
          } catch (err) {
            return {
              name: category.name,
              icon: categoryIcons[category.name] || categoryIcons.default,
              id: category._id || category.id,
              productCount: 0
            };
          }
        })
      );
      
      setCategories(categoriesWithDetails);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    setIsTransitioning(true);
    setSelectedCategory({ id: categoryId, name: categoryName });
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    // Reset transition state after a short delay
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleBackToPosts = () => {
    setIsTransitioning(true);
    setSelectedCategory(null);
    // Reset transition state immediately
    setTimeout(() => setIsTransitioning(false), 50);
  };

  const renderEnhancedSidebar = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2">
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <motion.div 
              key={category.id} 
              onClick={() => handleCategoryClick(category.id, category.name)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-3 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-300 group"
            >
              <div className="flex items-center space-x-3">
                <motion.div 
                  className="flex-shrink-0 p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg group-hover:from-orange-500 group-hover:to-orange-600 transition-all"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <IconComponent size={18} className="text-orange-600 group-hover:text-white transition-colors" />
                </motion.div>
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h4>
                  <p className="text-xs text-gray-500 group-hover:text-orange-500 transition-colors">
                    {category.productCount || 0} products
                  </p>
                </div>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex-shrink-0"
                >
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-gray-50 min-h-screen pb-20 md:pb-0">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #fb923c, #f97316);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #f97316, #ea580c);
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-end mb-4">
          <motion.button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Enhanced Static Sidebar */}
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="hidden md:block md:col-span-4 lg:col-span-3"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center text-gray-800">
                  <Grid className="h-4 w-4 mr-2 text-orange-500" />
                  Categories
                </h3>
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                  className="p-1.5 bg-orange-100 rounded-lg cursor-pointer"
                >
                  <Filter className="h-3 w-3 text-orange-600" />
                </motion.div>
              </div>
              {renderEnhancedSidebar()}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-8 lg:col-span-9"
          >
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <motion.div
                  key="category-products"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <CategoryProducts 
                    categoryId={selectedCategory.id}
                    categoryName={selectedCategory.name}
                    onBack={handleBackToPosts}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <PostRequirements />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Enhanced Features Section */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { icon: ShieldCheck, title: "Guaranteed Quality", desc: "Premium materials", color: "indigo" },
            { icon: Truck, title: "Free Shipping", desc: "On orders over $500", color: "amber" },
            { icon: Gift, title: "Special Offers", desc: "Exclusive deals", color: "rose" },
            { icon: Tag, title: "Best Prices", desc: "Competitive pricing", color: "emerald" }
          ].map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white p-4 rounded-2xl hover:shadow-2xl transition-all flex flex-col items-center text-center group cursor-pointer border-2 border-transparent hover:border-orange-200"
              >
                <motion.div 
                  className={`p-3 bg-${feature.color}-100 rounded-2xl mb-3 group-hover:scale-110 transition-transform`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <IconComponent size={24} className={`text-${feature.color}-600`} />
                </motion.div>
                <h4 className="text-xs md:text-sm text-gray-800 font-bold mb-1 group-hover:text-orange-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Enhanced Mobile Categories Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 bg-gradient-to-br from-white to-orange-50 z-50 overflow-y-auto md:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                  <p className="text-sm text-gray-500 mt-1">Explore our collection</p>
                </div>
                <motion.button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-white rounded-lg shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-gray-700" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                {categories.map((category, index) => {
                  const IconComponent = category.icon;
                  return (
                    <motion.div 
                      key={category.id} 
                      onClick={() => handleCategoryClick(category.id, category.name)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-white rounded-xl p-5 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 transition-all cursor-pointer border-2 border-gray-100 hover:border-orange-300 shadow-md hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <IconComponent size={28} className="text-orange-600" />
                        </motion.div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-gray-800 text-lg">{category.name}</h4>
                          <p className="text-sm text-gray-500">{category.productCount || 0} products</p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-gray-400" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              
              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button 
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg hover:shadow-xl transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Close Menu
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FurnitureMarketplace;