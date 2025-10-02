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
  ArrowRight,
  Star,
  ChevronRight,
  Package,
  ChevronLeft,
  Search,
  Grid,
  FileText,
  Send,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
  Share2,
  Paperclip,
  Heart,
  ShoppingCart,
  Eye,
  Loader2
} from 'lucide-react';
import api from './axios/axiosInstance';
import { useNavigate } from 'react-router-dom';

// Map category names to icons
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
      // Set mock data on error
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
        
        // Add files if any
        selectedFiles.forEach((file, index) => {
          formData.append('media', file);
        });

        const response = await api.post('/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Refresh posts
        fetchPosts();
        
        setNewPost({ title: '', description: '', media: [] });
        setSelectedFiles([]);
        setShowNewPostForm(false);
      } catch (error) {
        console.error('Error creating post:', error);
        // Fallback: Add post locally
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
        const response = await api.post(`/posts/${postId}/quotations`, {
          message: quotationText[postId]
        });

        // Refresh posts
        fetchPosts();
        setQuotationText({ ...quotationText, [postId]: '' });
      } catch (error) {
        console.error('Error adding quotation:', error);
        // Fallback: Add quotation locally
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
    const diff = Math.floor((now - date) / 1000); // seconds

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
      {/* Create New Post Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowNewPostForm(!showNewPostForm)}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
      >
        <FileText className="h-5 w-5" />
        <span>Post Your Requirement</span>
      </motion.button>

      {/* New Post Form */}
      <AnimatePresence>
        {showNewPostForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 overflow-hidden"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Requirement Post</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="e.g., Looking for Custom Office Desk"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                placeholder="Describe your requirements in detail..."
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Photos/Videos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload files</p>
                  <p className="text-xs text-gray-400 mt-1">Images and videos supported</p>
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={file}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePostSubmit}
                disabled={!newPost.title || !newPost.description}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Post Requirement</span>
              </button>
              <button
                onClick={() => {
                  setShowNewPostForm(false);
                  setNewPost({ title: '', description: '', media: [] });
                  setSelectedFiles([]);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts Feed */}
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
                <h4 className="font-semibold text-gray-800">
                  Quotations ({post.quotations?.length || 0})
                </h4>
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
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(quotation.createdAt)}
                          </span>
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

// Category Products Component
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Posts</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Posts</span>
        </button>
        
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Posts</span>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">
          {categoryName} <span className="text-gray-500">({products.length})</span>
        </h2>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={product.images?.[0] || product.image || 'https://via.placeholder.com/300'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                  }}
                />
                
                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-orange-50 transition-colors">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>

                {/* Quick View */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Quick View</span>
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1 truncate">
                  {product.name}
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < (product.rating || 4) ? 'fill-current' : 'fill-none stroke-current'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    ({product.reviews || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-orange-600">
                      ${product.price || '0.00'}
                    </p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        ${product.originalPrice}
                      </p>
                    )}
                  </div>
                  
                  <button className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors">
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500">This category doesn't have any products yet.</p>
        </div>
      )}
    </div>
  );
};

const FurnitureMarketplace = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    setSelectedCategory({ id: categoryId, name: categoryName });
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleBackToPosts = () => {
    setSelectedCategory(null);
  };

  const renderStaticSidebar = () => {
    if (loading) {
      return (
        <div className="h-96 overflow-y-auto">
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-2 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="h-96 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-2">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <motion.div 
                key={category.id} 
                onClick={() => handleCategoryClick(category.id, category.name)}
                whileHover={{ x: 5 }}
                className="bg-white rounded-lg p-3 text-center hover:bg-orange-50 hover:shadow-md transition-all cursor-pointer border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <IconComponent size={20} className="text-orange-500" />
                  </div>
                  <div className="flex-grow text-left">
                    <h4 className="text-sm font-medium text-gray-800">{category.name}</h4>
                    <p className="text-xs text-gray-500">{category.productCount || 0} products</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-gray-50 min-h-screen pb-20 md:pb-0">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #fb923c;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f97316;
        }
      `}</style>
      
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sofa size={24} className="text-orange-500" />
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
              FurniMart
            </h1>
          </div>

          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-orange-100 p-2 rounded-full transition"
            >
              {mobileMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Static Sidebar */}
          <div className="hidden md:block md:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg sticky top-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Grid className="h-5 w-5 mr-2 text-orange-500" />
                Product Categories
              </h3>
              {renderStaticSidebar()}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-9">
            <AnimatePresence mode="wait">
              {selectedCategory ? (
                <motion.div
                  key="category-products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostRequirements />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-indigo-100 rounded-full mb-4">
              <ShieldCheck size={28} className="text-indigo-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Guaranteed Quality</h4>
            <p className="text-xs text-gray-500">Premium materials & craftsmanship</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-amber-100 rounded-full mb-4">
              <Truck size={28} className="text-amber-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Free Shipping</h4>
            <p className="text-xs text-gray-500">On orders over $500</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-rose-100 rounded-full mb-4">
              <Gift size={28} className="text-rose-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Special Offers</h4>
            <p className="text-xs text-gray-500">Exclusive deals & discounts</p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-xl hover:bg-orange-50 transition-all flex flex-col items-center shadow-lg"
          >
            <div className="p-3 bg-emerald-100 rounded-full mb-4">
              <Tag size={28} className="text-emerald-600" />
            </div>
            <h4 className="text-sm md:text-base text-gray-800 font-semibold mb-1">Best Prices</h4>
            <p className="text-xs text-gray-500">Competitive pricing guaranteed</p>
          </motion.div>
        </div>
      </div>

      {/* Mobile Categories Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 bg-white z-50 overflow-y-auto md:hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Categories</h2>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:bg-orange-100 p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-3">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <motion.div 
                    key={category.id} 
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    whileHover={{ x: 5 }}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-orange-50 transition-all cursor-pointer border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-orange-100 rounded-full">
                        <IconComponent size={24} className="text-orange-500" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-800">{category.name}</h4>
                        <p className="text-sm text-gray-500">{category.productCount || 0} products</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-8">
              <button 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl shadow-md font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Close Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FurnitureMarketplace;