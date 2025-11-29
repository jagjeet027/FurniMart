import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, MessageSquare, User, Image, FileText, MoreHorizontal, X, Settings, ShoppingCart, Users, DollarSign, HelpCircle, Package, TrendingUp, Bookmark, Upload, Grid, Heart, Shield, Send, Loader, AlertCircle, CheckCircle, Menu, Eye, Download, ZoomIn, Maximize2, Lightbulb } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import api from './axios/axiosInstance';

const FurniGlobalHub = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [postType, setPostType] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState('idea');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeView, setActiveView] = useState('feed');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [postsLoading, setPostsLoading] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  
  // Quotation states
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [quotationForm, setQuotationForm] = useState({
    message: '',
    price: '',
    deliveryTime: ''
  });
  const [quotationLoading, setQuotationLoading] = useState(false);
  
  // View quotations
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);
  const [viewingQuotations, setViewingQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);

  // Post detail modal (zoom)
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);

  const API_BASE_URL = 'http://localhost:5000/api';

  const getRoleBadge = (user) => {
    if (!user) return { text: 'User', color: 'bg-green-500' };
    if (user.isAdmin) return { text: 'Admin', color: 'bg-red-500' };
    if (user.isManufacturer) return { text: 'Manufacturer', color: 'bg-blue-500' };
    return { text: 'User', color: 'bg-green-500' };
  };

  const userRoleBadge = getRoleBadge(authUser);

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    loadSavedPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.get('/posts?page=1&limit=10');
      
      if (response.data.success && Array.isArray(response.data.posts)) {
        setPosts(response.data.posts);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setError('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/products?category=${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setActiveView('products');
    fetchProductsByCategory(category._id);
    setShowMobileCategories(false);
  };

  const handleSidebarItemClick = (view) => {
    setActiveView(view);
    setSelectedCategory(null);
    setError(null);
    setShowMobileSidebar(false);
    
    if (view === 'ecommerce') {
      navigate('/products');
      return;
    }
    
    if (view === 'manpower') {
      navigate('/staff-hiring');
      return;
    }

    if (view === 'cargo') {
      navigate('/cargo-insurance');
      return;
    }

    if (view === 'funding') {
    navigate('/finance');
    return;
  }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} exceeds 5MB limit`);
        return;
      }

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validImageTypes.includes(file.type) && !validDocTypes.includes(file.type)) {
        setError(`${file.name} has invalid file type`);
        return;
      }

      validFiles.push(file);
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    if (!postTitle.trim()) {
      setError('Title is required');
      return;
    }

    if (!postDescription.trim() || postDescription.trim().length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    try {
      setQuotationLoading(true);
      const filesData = await Promise.all(
        selectedFiles.map(async (file) => ({
          url: await fileToBase64(file),
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          fileType: file.type.startsWith('image/') ? 'image' : 'document'
        }))
      );

      const postData = {
        title: postTitle.trim(),
        type: postCategory,
        description: postDescription.trim(),
        category: 'General',
        files: filesData
      };

      const response = await api.post('/posts', postData);

      if (response.data.success) {
        setSuccess('Post created successfully!');
        setShowPostModal(false);
        setPostTitle('');
        setPostDescription('');
        setPostCategory('idea');
        setSelectedFiles([]);
        fetchPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleSendQuotation = (post) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token || !isAuthenticated) {
      setError('Please login to send quotation');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!authUser?.isManufacturer) {
      setError('Only manufacturers can send quotations');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const postOwnerId = post.userId?._id || post.userId;
    const currentUserId = authUser._id || authUser.id;
    
    if (postOwnerId === currentUserId) {
      setError('You cannot send quotation to your own post');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSelectedPost(post);
    setShowQuotationModal(true);
    setQuotationForm({
      message: '',
      price: '',
      deliveryTime: ''
    });
  };

  const handleSubmitQuotation = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token || !isAuthenticated) {
        setError('Please login to submit quotation');
        return;
      }

      if (!quotationForm.message.trim()) {
        setError('Message is required');
        return;
      }

      setQuotationLoading(true);
      setError('');

      const quotationData = {
        postId: selectedPost._id,
        message: quotationForm.message.trim(),
        price: quotationForm.price ? parseFloat(quotationForm.price) : undefined,
        deliveryTime: quotationForm.deliveryTime.trim() || undefined
      };

      const response = await api.post(`/posts/${selectedPost._id}/quotations`, quotationData);

      if (response.data.success) {
        setSuccess('Quotation submitted successfully!');
        setShowQuotationModal(false);
        setSelectedPost(null);
        setQuotationForm({
          message: '',
          price: '',
          deliveryTime: ''
        });
        fetchPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to submit quotation');
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
      setError(error.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setQuotationLoading(false);
    }
  };

  const handleViewQuotations = async (post) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token || !isAuthenticated) {
      setError('Please login to view quotations');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const postOwnerId = post.userId?._id || post.userId;
    const currentUserId = authUser._id || authUser.id;
    
    if (postOwnerId !== currentUserId) {
      setError('Only post owner can view quotations');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setQuotationsLoading(true);
      setSelectedPost(post);
      setShowQuotationsModal(true);

      const response = await api.get(`/posts/${post._id}/quotations`);

      if (response.data.success && Array.isArray(response.data.quotations)) {
        setViewingQuotations(response.data.quotations);
      } else {
        setViewingQuotations([]);
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError('Failed to load quotations');
      setViewingQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const handleViewPostDetail = (post) => {
    setDetailPost(post);
    setShowPostDetail(true);
  };

  const handleSavePost = (postId) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
    setSuccess(savedPosts.includes(postId) ? 'Post removed from saved' : 'Post saved!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const loadSavedPosts = () => {
    const saved = localStorage.getItem('savedPosts');
    if (saved) setSavedPosts(JSON.parse(saved));
  };

  useEffect(() => {
    localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
  }, [savedPosts]);

  const openPostModal = (type) => {
    const token = localStorage.getItem('accessToken');
    
    if (!token || !isAuthenticated) {
      setError('Please login to create a post');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setPostType(type);
    setShowPostModal(true);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleViewProfile = () => {
    navigate('/user-profile');
  };

  const sidebarItems = [
    { icon: FileText, label: 'Post Your Idea / Requirement', view: 'feed', color: 'from-blue-400 to-blue-600', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
    { icon: ShoppingCart, label: 'Global E-Commerce Platform', view: 'ecommerce', color: 'from-green-400 to-green-600', bgLight: 'bg-green-50', textColor: 'text-green-700' },
    { icon: Users, label: 'Hire Skilled Manpower', view: 'manpower', color: 'from-purple-400 to-purple-600', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
    { icon: DollarSign, label: 'Funding Schemes', view: 'funding', color: 'from-pink-400 to-pink-600', bgLight: 'bg-pink-50', textColor: 'text-pink-700' },
    { icon: Package, label: 'Cargo & Insurance', view: 'cargo', color: 'from-orange-400 to-red-600', bgLight: 'bg-orange-50', textColor: 'text-orange-700' },
    { icon: HelpCircle, label: 'Support / Help Center', view: 'support', color: 'from-cyan-400 to-cyan-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-700' },
  ];

  const EcommerceView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Global E-Commerce Platform</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-xl">
          <ShoppingCart className="text-blue-600 mb-4" size={32} />
          <h3 className="font-bold text-base md:text-lg mb-2">Sell Globally</h3>
          <p className="text-sm md:text-base text-gray-600">List your products and reach international buyers</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-xl">
          <TrendingUp className="text-green-600 mb-4" size={32} />
          <h3 className="font-bold text-base md:text-lg mb-2">Market Analytics</h3>
          <p className="text-sm md:text-base text-gray-600">Track your sales and market trends</p>
        </div>
      </div>
    </motion.div>
  );

  const ManpowerView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Hire Skilled Manpower</h2>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-6 rounded-xl">
          <Users className="text-indigo-600 mb-4" size={32} />
          <h3 className="font-bold text-base md:text-lg mb-2">Skilled Workers</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3">Find experienced furniture makers and craftsmen</p>
          <button className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base">Browse Workers</button>
        </div>
      </div>
    </motion.div>
  );

  const FundingView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Funding Schemes</h2>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 rounded-xl">
          <DollarSign className="text-purple-600 mb-4" size={32} />
          <h3 className="font-bold text-base md:text-lg mb-2">MSME Loans</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3">Get up to ₹1 Crore for business expansion</p>
          <button className="bg-purple-600 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base">Apply Now</button>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 md:p-6 rounded-xl">
          <DollarSign className="text-pink-600 mb-4" size={32} />
          <h3 className="font-bold text-base md:text-lg mb-2">Government Subsidies</h3>
          <p className="text-sm md:text-base text-gray-600 mb-3">Special schemes for furniture manufacturers</p>
          <button className="bg-pink-600 text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base">Learn More</button>
        </div>
      </div>
    </motion.div>
  );

  const SupportView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Support / Help Center</h2>
      <div className="space-y-4 md:space-y-6">
        <div className="bg-blue-50 p-4 md:p-6 rounded-xl">
          <h3 className="font-bold text-base md:text-lg mb-3">Frequently Asked Questions</h3>
          <div className="space-y-3">
            <div className="bg-white p-3 md:p-4 rounded-lg">
              <p className="font-semibold text-sm md:text-base text-gray-800">How to post a product?</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">Click on the post button and fill the details...</p>
            </div>
            <div className="bg-white p-3 md:p-4 rounded-lg">
              <p className="font-semibold text-sm md:text-base text-gray-800">Payment methods?</p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">We accept UPI, Net Banking, Cards...</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 md:p-6 rounded-xl">
          <h3 className="font-bold text-base md:text-lg mb-3">Contact Support</h3>
          <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-4">Email: support@furniglobal.com</p>
          <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">Phone: +91-1800-123-4567</p>
          <button className="bg-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base">Chat with Us</button>
        </div>
      </div>
    </motion.div>
  );

  const SettingsView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-4 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Settings</h2>
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-bold mb-2 text-sm md:text-base">Account Settings</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm md:text-base">Edit Profile</button>
        </div>
        <div className="border-b pb-4">
          <h3 className="font-bold mb-2 text-sm md:text-base">Notifications</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm md:text-base">Manage Preferences</button>
        </div>
        <div className="border-b pb-4">
          <h3 className="font-bold mb-2 text-sm md:text-base">Privacy</h3>
          <button className="text-orange-600 hover:text-orange-700 text-sm md:text-base">Privacy Settings</button>
        </div>
      </div>
    </motion.div>
  );

  const ProductsView = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedCategory?.name || 'Products'}</h2>
            <p className="text-gray-600 text-xs md:text-sm mt-1">{products.length} products available</p>
          </div>
          <button onClick={() => { setActiveView('feed'); setSelectedCategory(null); }} className="text-orange-600 hover:text-orange-700 flex items-center gap-2">
            <X size={20} />
            <span className="hidden md:inline">Close</span>
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
          <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p className="text-sm md:text-base text-gray-600">No products available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 md:h-64 overflow-hidden bg-gray-100">
                {product.image || (product.images && product.images[0]) ? (
                  <img src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                )}
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:bg-orange-50">
                  <Heart size={18} className="text-orange-600" />
                </button>
              </div>
              <div className="p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg md:text-2xl font-bold text-orange-600">₹{product.price?.toLocaleString()}</span>
                  <button onClick={() => handleViewProduct(product._id)} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 md:px-6 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition text-xs md:text-sm">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const FeedView = () => (
    <div className="space-y-4 md:space-y-6">
      {success && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 border border-green-200 rounded-xl p-3 md:p-4 text-green-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-3 md:p-4 text-red-700 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <img src={authUser ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.name}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-200" alt="User" />
          <input type="text" placeholder="Post your idea/requirement..." className="flex-1 bg-gray-50 rounded-full px-4 md:px-5 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-orange-300 text-xs md:text-sm border border-gray-200 cursor-pointer" onClick={() => openPostModal('article')} readOnly />
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3 pt-4 border-t border-gray-200">
          <button onClick={() => openPostModal('photo')} className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs md:text-sm font-medium">
            <Image size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Photo</span>
          </button>
          <button onClick={() => openPostModal('document')} className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-xs md:text-sm font-medium">
            <FileText size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Document</span>
          </button>
          <button onClick={() => openPostModal('article')} className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-xs md:text-sm font-medium">
            <FileText size={16} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Article</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-base md:text-lg font-semibold text-gray-800">Latest Posts</h2>
        <select className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
          <option>Sort by: Top</option>
          <option>Sort by: Recent</option>
          <option>Sort by: Popular</option>
        </select>
      </div>

      {postsLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
          <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No Posts Yet</h3>
          <p className="text-sm md:text-base text-gray-600">Be the first to share your ideas and requirements!</p>
        </div>
      ) : (
        posts.map((post) => {
          const imageFiles = post.files?.filter(f => f.fileType === 'image') || [];
          const postUser = post.userId || post.author || {};
          const postOwnerId = postUser._id || postUser.id;
          const currentUserId = authUser?._id || authUser?.id;
          const isOwnPost = postOwnerId === currentUserId;
          const isSaved = savedPosts.includes(post._id);
          
          return (
            <article key={post._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3 md:mb-4 gap-2">
                  <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                    <img src={postUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${postUser.name || 'User'}`} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-orange-200 flex-shrink-0" alt={postUser.name || 'User'} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-gray-900 text-xs md:text-sm truncate">{postUser.name || 'Anonymous User'}</h3>
                        {postUser.isAdmin && <Shield className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500">
                        {postUser.isManufacturer ? '🏭 Manufacturer' : '👤 User'} • {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSavePost(post._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
                  >
                    <Bookmark 
                      size={18} 
                      className={isSaved ? 'text-orange-500 fill-orange-500' : 'text-gray-400'} 
                    />
                  </button>
                </div>

                <div className="mb-2">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{post.title}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {post.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        post.type === 'idea' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {post.type}
                      </span>
                    )}
                    {post.category && (
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs md:text-sm text-gray-700 leading-relaxed mb-3 md:mb-4 line-clamp-3 md:line-clamp-none">
                  {post.description}
                </p>

                {imageFiles.length > 0 && (
                  <div className="rounded-lg overflow-hidden bg-gray-100 mb-3 md:mb-4">
                    <img src={imageFiles[0].url} alt="Post content" className="w-full h-48 md:h-80 object-cover" />
                  </div>
                )}

                <div className="flex items-center justify-between py-2 md:py-3 border-y border-gray-200 mb-2 md:mb-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} className="text-orange-500 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm text-gray-600">{post.quotationsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={16} className="text-gray-500 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm text-gray-600">{post.views || 0}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    post.status === 'open' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {post.status === 'open' ? 'Open' : post.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isOwnPost ? (
                    <button onClick={() => handleViewQuotations(post)} className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white transition text-xs md:text-sm font-semibold py-2 md:py-3 px-3 md:px-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 shadow-md">
                      <Eye size={14} className="md:w-5 md:h-5" />
                      <span>View ({post.quotationsCount || 0})</span>
                    </button>
                  ) : authUser?.isManufacturer ? (
                    <button onClick={() => handleSendQuotation(post)} className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white transition text-xs md:text-sm font-semibold py-2 md:py-3 px-3 md:px-4 rounded-lg hover:from-orange-600 hover:to-amber-600 shadow-md">
                      <Send size={14} className="md:w-5 md:h-5" />
                      <span>Send Quote</span>
                    </button>
                  ) : (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-gray-200 text-gray-400 cursor-not-allowed text-xs md:text-sm font-semibold py-2 md:py-3 px-3 md:px-4 rounded-lg">
                      <Send size={14} className="md:w-5 md:h-5" />
                      <span>Manufacturers Only</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewPostDetail(post)}
                    className="p-2 border border-gray-300 text-gray-600 hover:text-orange-600 hover:border-orange-500 rounded-lg transition"
                    title="View Details"
                  >
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setShowMobileSidebar(!showMobileSidebar)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-orange-600">FurniHub</h1>
        <button onClick={() => setShowMobileCategories(!showMobileCategories)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Grid size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="flex">
        <aside className="hidden lg:block w-72 bg-gradient-to-b from-white via-blue-50 to-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto z-30 shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-8">FurniHub Menu</h2>
            <nav className="space-y-3">
              {sidebarItems.map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSidebarItemClick(item.view)}
                  className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                    activeView === item.view
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/50 scale-105`
                      : `${item.bgLight} hover:shadow-md border-2 border-transparent hover:border-gray-300`
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-4 flex items-center gap-4">
                    <div className={`p-3 rounded-lg transition-all duration-300 ${
                      activeView === item.view
                        ? 'bg-white/20 text-white'
                        : `${item.bgLight} ${item.textColor}`
                    }`}>
                      <item.icon size={24} />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm transition-all ${
                        activeView === item.view
                          ? 'text-white'
                          : item.textColor
                      }`}>
                        {item.label}
                      </p>
                    </div>

                    {activeView === item.view && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-4 w-2 h-2 rounded-full bg-white"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {activeView === item.view && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </aside>

        <AnimatePresence>
          {showMobileSidebar && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileSidebar(false)} className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
              <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-white via-blue-50 to-white z-50 overflow-y-auto shadow-2xl">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-500">
                  <h2 className="text-lg font-bold text-white">🎨 Menu</h2>
                  <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-white/20 rounded-lg transition">
                    <X size={20} className="text-white" />
                  </button>
                </div>
                <nav className="p-4 space-y-3">
                  {sidebarItems.map((item, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSidebarItemClick(item.view)}
                      className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                        activeView === item.view
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : `${item.bgLight} hover:shadow-md border-2 border-transparent hover:border-gray-300`
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className="relative p-4 flex items-center gap-3">
                        <div className={`p-3 rounded-lg transition-all duration-300 ${
                          activeView === item.view
                            ? 'bg-white/20 text-white'
                            : `${item.bgLight} ${item.textColor}`
                        }`}>
                          <item.icon size={20} />
                        </div>
                        
                        <div className="flex-1 text-left">
                          <p className={`font-bold text-xs transition-all ${
                            activeView === item.view
                              ? 'text-white'
                              : item.textColor
                          }`}>
                            {item.label}
                          </p>
                        </div>

                        {activeView === item.view && (
                          <motion.div
                            layoutId="mobileActiveIndicator"
                            className="w-2 h-2 rounded-full bg-white"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {activeView === item.view && (
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-3 md:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {activeView === 'feed' && <FeedView key="feed" />}
                  {activeView === 'ecommerce' && <EcommerceView key="ecommerce" />}
                  {activeView === 'manpower' && <ManpowerView key="manpower" />}
                  {activeView === 'funding' && <FundingView key="funding" />}
                  {activeView === 'support' && <SupportView key="support" />}
                  {activeView === 'settings' && <SettingsView key="settings" />}
                  {activeView === 'products' && <ProductsView key="products" />}
                </AnimatePresence>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-6 space-y-4">
                  {authLoading ? (
                    <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
                      <Loader className="w-6 h-6 text-orange-500 animate-spin" />
                    </div>
                  ) : isAuthenticated && authUser ? (
                    <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl shadow-md p-4 border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-300 shadow-sm flex-shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.name}`} alt="User Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">{authUser.name}</h3>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${userRoleBadge.color} text-white`}>
                              <Shield className="w-3 h-3 mr-1" />
                              {userRoleBadge.text}
                            </span>
                          </div>
                          <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                            <span>📍</span>
                            <span className="truncate">{authUser.address || 'Location not set'}</span>
                          </p>
                        </div>
                      </div>
                      <button onClick={handleViewProfile} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition text-xs shadow-md hover:shadow-lg">View Profile →</button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-3 text-center">Please login to view your profile</p>
                      <button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition text-xs">Login</button>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Browse Collections</h3>
                    <div className="space-y-1">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <button key={category._id} onClick={() => handleCategoryClick(category)} className={`w-full flex items-center justify-between p-2 rounded-lg transition text-left text-xs md:text-sm ${selectedCategory?._id === category._id ? 'bg-orange-100' : 'hover:bg-orange-50'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.icon || '📦'}</span>
                              <span className="text-xs text-gray-700 font-medium">{category.name}</span>
                            </div>
                            <span className="text-xs text-gray-400">{category.productCount || 0}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">Loading...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl shadow-md p-4 text-white">
                    <h3 className="font-bold text-sm mb-2">Need Help?</h3>
                    <p className="text-xs text-orange-50 mb-3">Our expert team is available 24/7 to assist you.</p>
                    <button className="w-full bg-white text-orange-600 font-semibold py-2 rounded-lg hover:bg-orange-50 transition text-xs">Contact Support</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {showMobileCategories && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMobileCategories(false)} className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" />
              <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="lg:hidden fixed right-0 top-0 bottom-0 w-64 bg-white z-50 overflow-y-auto shadow-xl">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-orange-600">Categories</h2>
                  <button onClick={() => setShowMobileCategories(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4 space-y-1">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <button key={category._id} onClick={() => handleCategoryClick(category)} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-left text-sm ${selectedCategory?._id === category._id ? 'bg-orange-100' : 'hover:bg-orange-50'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{category.icon || '📦'}</span>
                          <span className="text-sm text-gray-700 font-medium">{category.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">{category.productCount || 0}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">Loading categories...</p>
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* POST MODAL - NEW VERSION */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center md:justify-end z-50 p-4" onClick={() => setShowPostModal(false)}>
            <motion.div initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={(e) => e.stopPropagation()} className="bg-gradient-to-br from-white to-orange-50 rounded-2xl md:rounded-l-3xl md:rounded-r-none shadow-2xl max-w-2xl w-full h-full md:h-auto max-h-[90vh] overflow-y-auto border-l-4 border-orange-500">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-4 md:p-6 flex items-center justify-between z-10 rounded-t-2xl md:rounded-tl-3xl">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-1">Create New Post</h2>
                  <p className="text-orange-100 text-xs md:text-sm">Share your ideas and requirements</p>
                </div>
                <button onClick={() => setShowPostModal(false)} className="p-2 md:p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition backdrop-blur-sm">
                  <X size={20} className="text-white md:w-6 md:h-6" />
                </button>
              </div>

              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Enter post title"
                    maxLength="200"
                  />
                  <p className="text-xs text-gray-500 mt-1">{postTitle.length}/200 characters</p>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPostCategory('idea')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        postCategory === 'idea'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Lightbulb className={`w-6 h-6 mx-auto mb-2 ${postCategory === 'idea' ? 'text-orange-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${postCategory === 'idea' ? 'text-orange-700' : 'text-gray-700'}`}>
                        Idea
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostCategory('requirement')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        postCategory === 'requirement'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className={`w-6 h-6 mx-auto mb-2 ${postCategory === 'requirement' ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className={`text-sm font-semibold ${postCategory === 'requirement' ? 'text-blue-700' : 'text-gray-700'}`}>
                        Requirement
                      </span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={postDescription}
                    onChange={(e) => setPostDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                    placeholder="Describe your idea or requirement in detail..."
                    rows="6"
                    maxLength="5000"
                  />
                  <p className="text-xs text-gray-500 mt-1">{postDescription.length}/5000 characters</p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-semibold">Click to upload</p>
                      <p className="text-xs text-gray-500 mt-1">Images or Documents (Max 5MB each)</p>
                    </label>
                  </div>

                  {/* Selected Files List */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {file.type.startsWith('image/') ? (
                            <Image className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPostModal(false);
                      setPostTitle('');
                      setPostDescription('');
                      setPostCategory('idea');
                      setSelectedFiles([]);
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                    disabled={quotationLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={quotationLoading || !postTitle.trim() || !postDescription.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {quotationLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      '🚀 Create Post'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUOTATION MODAL - UPDATED */}
      <AnimatePresence>
        {showQuotationModal && selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuotationModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-4 md:p-6 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1">Send Quotation</h3>
                  <p className="text-orange-100 text-xs md:text-sm line-clamp-1">{selectedPost.title}</p>
                </div>
                <button onClick={() => setShowQuotationModal(false)} className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={quotationForm.message}
                    onChange={(e) => setQuotationForm({ ...quotationForm, message: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                    rows="5"
                    placeholder="Describe your quotation offer..."
                    maxLength="2000"
                  />
                  <p className="text-xs text-gray-500 mt-1">{quotationForm.message.length}/2000 characters</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Price (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                    <input
                      type="number"
                      value={quotationForm.price}
                      onChange={(e) => setQuotationForm({ ...quotationForm, price: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Delivery Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Delivery Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={quotationForm.deliveryTime}
                    onChange={(e) => setQuotationForm({ ...quotationForm, deliveryTime: e.target.value })}
                    placeholder="e.g., 15 days, 2 weeks, 1 month"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowQuotationModal(false)}
                    disabled={quotationLoading}
                    className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitQuotation}
                    disabled={!quotationForm.message.trim() || quotationLoading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {quotationLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Send Quotation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POST DETAIL MODAL - NEW (ZOOM VIEW) */}
      <AnimatePresence>
        {showPostDetail && detailPost && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPostDetail(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-4 md:p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-lg md:text-xl font-bold text-white truncate">{detailPost.title}</h2>
                <button 
                  onClick={() => setShowPostDetail(false)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition flex-shrink-0"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-4 md:p-6">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${detailPost.userId?.name || 'User'}`}
                    className="w-12 h-12 rounded-full border-2 border-orange-200"
                    alt="Author"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-sm">{detailPost.userId?.name || 'Anonymous'}</h3>
                    <p className="text-xs text-gray-500">
                      {detailPost.userId?.isManufacturer ? '🏭 Manufacturer' : '👤 User'} • {new Date(detailPost.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Category & Status */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {detailPost.type && (
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      detailPost.type === 'idea' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {detailPost.type}
                    </span>
                  )}
                  {detailPost.category && (
                    <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                      {detailPost.category}
                    </span>
                  )}
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    detailPost.status === 'open' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {detailPost.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                  {detailPost.description}
                </p>

                {/* Images */}
                {detailPost.files?.filter(f => f.fileType === 'image').length > 0 && (
                  <div className="mb-4">
                    <div className="grid gap-2">
                      {detailPost.files.filter(f => f.fileType === 'image').map((image, idx) => (
                        <img 
                          key={idx}
                          src={image.url} 
                          alt={`Post ${idx}`}
                          className="w-full rounded-lg max-h-96 object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {detailPost.files?.filter(f => f.fileType === 'document').length > 0 && (
                  <div className="mb-4 space-y-2">
                    {detailPost.files.filter(f => f.fileType === 'document').map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{doc.filename}</span>
                        <a 
                          href={doc.url}
                          download={doc.filename}
                          className="p-2 hover:bg-gray-200 rounded flex-shrink-0"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 text-xs text-gray-600 py-4 border-t border-gray-200 mb-4">
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} className="text-orange-500" />
                    <span>{detailPost.quotationsCount || 0} Quotations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-500" />
                    <span>{detailPost.views || 0} Views</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleSavePost(detailPost._id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition text-sm ${
                      savedPosts.includes(detailPost._id)
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Bookmark size={16} />
                    <span>{savedPosts.includes(detailPost._id) ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (authUser?.isManufacturer) {
                        handleSendQuotation(detailPost);
                        setShowPostDetail(false);
                      }
                    }}
                    disabled={!authUser?.isManufacturer}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50 text-sm"
                  >
                    <Send size={16} />
                    <span>Send Quote</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW QUOTATIONS MODAL */}
      <AnimatePresence>
        {showQuotationsModal && selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQuotationsModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 p-4 md:p-6 flex items-center justify-between z-10 rounded-t-2xl">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">Quotations Received</h2>
                  <p className="text-blue-100 text-xs md:text-sm line-clamp-1 mt-1">{selectedPost.title}</p>
                </div>
                <button onClick={() => setShowQuotationsModal(false)} className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition">
                  <X size={20} className="text-white" />
                </button>
              </div>

              <div className="p-4 md:p-6">
                {quotationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : viewingQuotations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-800">No Quotations Yet</h3>
                    <p className="text-sm text-gray-600 mt-1">Manufacturers will submit quotations soon</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {viewingQuotations.map((quotation) => (
                      <div key={quotation._id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-start gap-3 mb-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${quotation.manufacturer?.name || 'Manufacturer'}`}
                            className="w-12 h-12 rounded-full border-2 border-blue-300 flex-shrink-0"
                            alt="Manufacturer"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-sm">{quotation.manufacturer?.name || 'Manufacturer'}</h4>
                            <p className="text-xs text-gray-500 break-all">{quotation.manufacturer?.email}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(quotation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${
                            quotation.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700'
                              : quotation.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {quotation.status}
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-3 mb-3">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{quotation.message}</p>
                        </div>

                        {(quotation.price || quotation.deliveryTime) && (
                          <div className="flex flex-wrap gap-3 text-xs bg-white p-3 rounded-lg mb-3">
                            {quotation.price && (
                              <div>
                                <span className="text-gray-600">Price:</span>
                                <span className="font-bold text-green-600 ml-1">₹{quotation.price.toLocaleString()}</span>
                              </div>
                            )}
                            {quotation.deliveryTime && (
                              <div>
                                <span className="text-gray-600">Delivery:</span>
                                <span className="font-bold text-blue-600 ml-1">{quotation.deliveryTime}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {quotation.manufacturer?.phone && (
                          <div className="text-xs text-gray-600 pt-3 border-t border-gray-200">
                            <span className="font-semibold">Contact:</span> {quotation.manufacturer.phone}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FurniGlobalHub;