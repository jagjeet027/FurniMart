import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, X, Shield, MessageSquare, MoreHorizontal, ChevronLeft, ChevronRight, PlusCircle, Loader, Upload, FileText, Image as ImageIcon, Trash2, AlertCircle, CheckCircle, Eye, Edit, Share2, Copy, Menu, Download, ZoomIn, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../axios/axiosInstance';

// Image Viewer Modal Component
const ImageViewer = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex].url;
    link.download = images[currentIndex].filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <p className="text-sm font-medium truncate max-w-xs">{images[currentIndex].filename}</p>
            <p className="text-xs text-gray-300">{currentIndex + 1} / {images.length}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].filename}
          className="max-w-full max-h-full object-contain"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentIndex ? 'border-orange-500 scale-110' : 'border-white/30'
                }`}
              >
                <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UserProfile() {
  const { user: authUser, refreshUserData } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [showMoreCount, setShowMoreCount] = useState(5);
  const postsPerPage = 5;

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Image viewer state
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    type: 'idea',
    description: '',
    category: 'General'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);

  // Quotations modal
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);

  // Menu state
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (authUser) {
      fetchUserProfile();
      fetchUserPosts();
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser) {
      fetchUserPosts();
    }
  }, [currentPage]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/users/me');

      if (response.data.success) {
        setUser(response.data.user);
        setEditForm({
          name: response.data.user.name || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || ''
        });
      } else {
        setError(response.data.message || 'Failed to fetch profile');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to load profile';
      setError(errorMsg);
      
      if (authUser) {
        setUser(authUser);
        setEditForm({
          name: authUser.name || '',
          phone: authUser.phone || '',
          address: authUser.address || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await api.get(`/posts/my-posts?page=${currentPage}&limit=${postsPerPage}`);

      if (response.data.success) {
        setUserPosts(response.data.posts || []);
        setTotalPosts(response.data.total || 0);
      }
    } catch (err) {
      console.error('Posts fetch error:', err);
      if (err.response?.status === 404) {
        setUserPosts([]);
        setTotalPosts(0);
      }
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!editForm.name || editForm.name.trim().length < 2) {
        setError('Name must be at least 2 characters long');
        setSaving(false);
        return;
      }

      if (editForm.phone && editForm.phone.trim() && !/^[0-9]{10}$/.test(editForm.phone.trim())) {
        setError('Please provide a valid 10-digit phone number');
        setSaving(false);
        return;
      }

      const response = await api.patch('/users/profile', editForm);

      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        await refreshUserData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // File handling
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        newErrors.push(`${file.name}: File size exceeds 5MB`);
        return;
      }

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!validImageTypes.includes(file.type) && !validDocTypes.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type. Only images and documents (PDF, DOC, DOCX) are allowed`);
        return;
      }

      validFiles.push(file);
    });

    setFileErrors(newErrors);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetPostForm = () => {
    setPostForm({
      title: '',
      type: 'idea',
      description: '',
      category: 'General'
    });
    setSelectedFiles([]);
    setFileErrors([]);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      setError('');
      
      if (!postForm.title.trim()) {
        setError('Title is required');
        setUploading(false);
        return;
      }
      
      if (!postForm.description.trim() || postForm.description.trim().length < 10) {
        setError('Description must be at least 10 characters long');
        setUploading(false);
        return;
      }

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
        title: postForm.title.trim(),
        type: postForm.type,
        description: postForm.description.trim(),
        category: postForm.category,
        files: filesData
      };

      const response = await api.post('/posts', postData);

      if (response.data.success) {
        setSuccess('Post created successfully!');
        setShowModal(false);
        resetPostForm();
        setCurrentPage(1);
        fetchUserPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const fetchQuotations = async (postId) => {
    try {
      setQuotationsLoading(true);
      const response = await api.get(`/posts/${postId}/quotations`);

      if (response.data.success) {
        setQuotations(response.data.quotations || []);
      }
    } catch (err) {
      console.error('Quotations fetch error:', err);
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  const handleViewQuotations = (post) => {
    setSelectedPost(post);
    setShowQuotationsModal(true);
    fetchQuotations(post._id);
  };

  // Menu actions
  const handleEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      type: post.type,
      description: post.description,
      category: post.category
    });
    setShowEditModal(true);
    setOpenMenuId(null);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      setError('');

      const updateData = {
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        category: postForm.category
      };

      // Add new files if any
      if (selectedFiles.length > 0) {
        const filesData = await Promise.all(
          selectedFiles.map(async (file) => ({
            url: await fileToBase64(file),
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            fileType: file.type.startsWith('image/') ? 'image' : 'document'
          }))
        );
        updateData.files = filesData;
      }

      const response = await api.patch(`/posts/${editingPost._id}`, updateData);

      if (response.data.success) {
        setSuccess('Post updated successfully!');
        setShowEditModal(false);
        setEditingPost(null);
        resetPostForm();
        fetchUserPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to update post');
      }
    } catch (err) {
      console.error('Post update error:', err);
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setUploading(false);
    }
  };

  const handleSharePost = (post) => {
    const shareUrl = `${window.location.origin}/posts/${post._id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: shareUrl
      }).catch(err => console.log('Share cancelled'));
    } else {
      navigator.clipboard.writeText(shareUrl);
      setSuccess('Link copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setOpenMenuId(null);
  };

  const handleCopyLink = (post) => {
    const shareUrl = `${window.location.origin}/posts/${post._id}`;
    navigator.clipboard.writeText(shareUrl);
    setSuccess('Link copied to clipboard!');
    setTimeout(() => setSuccess(''), 3000);
    setOpenMenuId(null);
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await api.delete(`/posts/${postId}`);

      if (response.data.success) {
        setSuccess('Post deleted successfully!');
        fetchUserPosts();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Post delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete post');
    }
    setOpenMenuId(null);
  };

  const handleImageClick = (post, imageIndex) => {
    const images = post.files.filter(f => f.fileType === 'image');
    setViewerImages(images);
    setViewerInitialIndex(imageIndex);
    setShowImageViewer(true);
  };

  const handleShowMore = () => {
    setShowMoreCount(prev => prev + 5);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (user) => {
    if (user.isAdmin) return { text: 'Admin', color: 'bg-red-500' };
    if (user.isManufacturer) return { text: 'Manufacturer', color: 'bg-blue-500' };
    return { text: 'User', color: 'bg-green-500' };
  };

  const displayedPosts = userPosts.slice(0, showMoreCount);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load profile</p>
          <button 
            onClick={fetchUserProfile}
            className="mt-4 px-5 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex max-w-7xl mx-auto relative">
        {/* Left Sidebar - Profile Section */}
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 
          fixed lg:sticky 
          top-0 lg:top-0
          left-0
          w-80 
          bg-white 
          border-r border-gray-200 
          h-screen 
          overflow-y-auto 
          z-50 
          transition-transform duration-300 ease-in-out
        `}>
          {/* Mobile Close Button */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Profile</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{success}</span>
              </div>
              <button onClick={() => setSuccess('')} className="flex-shrink-0 ml-2">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
              <button onClick={() => setError('')} className="flex-shrink-0 ml-2">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-3">
                <User className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1 break-words max-w-full px-2">{user.name}</h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${roleBadge.color} text-white`}>
                <Shield className="w-3 h-3 mr-1" />
                {roleBadge.text}
              </span>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-5">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mb-4 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit Profile</span>
              </button>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1 mb-1">
                  <User className="w-3 h-3" />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg break-words">
                    {user.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1 mb-1">
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </label>
                <p className="text-sm text-gray-900 font-medium bg-gray-100 px-3 py-2 rounded-lg cursor-not-allowed break-all">
                  {user.email}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1 mb-1">
                  <Phone className="w-3 h-3" />
                  <span>Phone</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm"
                    placeholder="Phone number"
                    maxLength="10"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                    {user.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>Address</span>
                </label>
                {isEditing ? (
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none text-sm resize-none"
                    rows="2"
                    placeholder="Your address"
                  />
                ) : (
                  <p className="text-sm text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg break-words">
                    {user.address || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 flex items-center space-x-1 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>Member Since</span>
                </label>
                <p className="text-sm text-gray-900 font-medium bg-gray-100 px-3 py-2 rounded-lg">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      name: user.name || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    });
                  }}
                  disabled={saving}
                  className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-xs font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right Section - Posts Feed */}
        <main className="flex-1 p-4 sm:p-6 w-full lg:w-auto">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">My Posts</h1>
              <p className="text-xs sm:text-sm text-gray-600">Create and manage your posts</p>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full mb-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center space-x-2 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Post</span>
            </button>

            {/* Posts List */}
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500 text-sm mb-3">No posts yet</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {displayedPosts.map((post) => {
                    const imageFiles = post.files?.filter(f => f.fileType === 'image') || [];
                    const docFiles = post.files?.filter(f => f.fileType === 'document') || [];
                    
                    return (
                      <article
                        key={post._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="p-4">
                          {/* Post Header */}
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 mb-1 text-sm break-words">{post.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                <span className="whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                                  post.type === 'idea' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {post.type}
                                </span>
                                <span>•</span>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium whitespace-nowrap">
                                  {post.category}
                                </span>
                              </div>
                            </div>
                            
                            {/* Menu Button */}
                            <div className="relative menu-container flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === post._id ? null : post._id);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreHorizontal size={16} className="text-gray-400" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {openMenuId === post._id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  <button
                                    onClick={() => handleEditPost(post)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit size={14} />
                                    <span>Edit Post</span>
                                  </button>
                                  <button
                                    onClick={() => handleSharePost(post)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Share2 size={14} />
                                    <span>Share</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyLink(post)}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Copy size={14} />
                                    <span>Copy Link</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeletePost(post._id)}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-xs text-gray-700 leading-relaxed mb-3 break-words">
                            {post.description}
                          </p>

                          {/* Post Images - Responsive Layout */}
                          {imageFiles.length > 0 && (
                            <div className="mb-3">
                              {imageFiles.length === 1 ? (
                                <button
                                  onClick={() => handleImageClick(post, 0)}
                                  className="w-full rounded-lg overflow-hidden bg-gray-100 relative group"
                                >
                                  <img
                                    src={imageFiles[0].url}
                                    alt={imageFiles[0].filename}
                                    className="w-full h-64 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ZoomIn className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                </button>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  {imageFiles.slice(0, 4).map((file, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleImageClick(post, idx)}
                                      className="rounded-lg overflow-hidden bg-gray-100 relative group"
                                    >
                                      <img
                                        src={file.url}
                                        alt={file.filename}
                                        className="w-full h-40 object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                      </div>
                                      {idx === 3 && imageFiles.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                          <span className="text-white text-xl font-bold">+{imageFiles.length - 4}</span>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Document Files */}
                          {docFiles.length > 0 && (
                            <div className="mb-3 space-y-1">
                              {docFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs">
                                  <FileText className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                  <span className="flex-1 truncate">{file.filename}</span>
                                  <a
                                    href={file.url}
                                    download={file.filename}
                                    className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download className="w-4 h-4 text-gray-600" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Engagement Stats */}
                          <div className="flex items-center justify-between py-2 border-t border-gray-200 gap-2">
                            <button
                              onClick={() => handleViewQuotations(post)}
                              className="flex items-center gap-2 text-xs text-gray-600 hover:text-orange-500 transition-colors"
                            >
                              <MessageSquare size={14} className="text-orange-500 flex-shrink-0" />
                              <span className="whitespace-nowrap">{post.quotationsCount || 0} quotations</span>
                              <Eye size={14} className="flex-shrink-0" />
                            </button>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                              post.status === 'open' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Show More Button */}
                {showMoreCount < userPosts.length && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleShowMore}
                      className="px-6 py-3 bg-white border-2 border-orange-500 text-orange-500 rounded-lg font-semibold hover:bg-orange-50 transition-all flex items-center gap-2"
                    >
                      <span>Show More</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Pagination Info */}
                {totalPosts > 0 && (
                  <div className="text-center mt-4 text-sm text-gray-600">
                    Showing {displayedPosts.length} of {totalPosts} posts
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer
          images={viewerImages}
          initialIndex={viewerInitialIndex}
          onClose={() => setShowImageViewer(false)}
        />
      )}

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Create New Post</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetPostForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="idea"
                      checked={postForm.type === 'idea'}
                      onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                      className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Idea</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="requirement"
                      checked={postForm.type === 'requirement'}
                      onChange={(e) => setPostForm({ ...postForm, type: e.target.value })}
                      className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Requirement</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="General">General</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  rows="5"
                  placeholder="Describe your idea or requirement in detail..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {postForm.description.length} / 5000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachments (Images or Documents)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 sm:w-10 h-8 sm:h-10 text-gray-400 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images (JPG, PNG, GIF) or Documents (PDF, DOC, DOCX)
                    </p>
                    <p className="text-xs text-gray-500">Max file size: 5MB</p>
                  </label>
                </div>

                {fileErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {fileErrors.map((error, idx) => (
                      <p key={idx} className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        <span className="break-words">{error}</span>
                      </p>
                    ))}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetPostForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Post</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Edit Post</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingPost(null);
                  resetPostForm();
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={postForm.category}
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="General">General</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Food">Food</option>
                  <option value="Technology">Technology</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                  rows="5"
                  placeholder="Describe your idea or requirement in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add New Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition-colors">
                  <input
                    type="file"
                    id="edit-file-upload"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600">Click to add more files</p>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPost(null);
                    resetPostForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Post</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotations Modal */}
      {showQuotationsModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">Quotations</h3>
                <p className="text-xs text-gray-500 mt-1 break-words">for "{selectedPost.title}"</p>
              </div>
              <button
                onClick={() => {
                  setShowQuotationsModal(false);
                  setSelectedPost(null);
                  setQuotations([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {quotationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : quotations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No quotations yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Manufacturers will submit quotations for your post
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.map((quotation) => (
                    <div
                      key={quotation._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm break-words">
                              {quotation.manufacturer?.name || 'Manufacturer'}
                            </h4>
                            <p className="text-xs text-gray-500 break-all">
                              {quotation.manufacturer?.email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(quotation.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                          quotation.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : quotation.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {quotation.status}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed break-words">
                          {quotation.message}
                        </p>
                      </div>

                      {(quotation.price || quotation.deliveryTime) && (
                        <div className="flex flex-wrap gap-4 text-xs bg-gray-50 p-3 rounded-lg">
                          {quotation.price && (
                            <div>
                              <span className="text-gray-500">Price: </span>
                              <span className="font-semibold text-gray-900">
                                ₹{quotation.price.toLocaleString()}
                              </span>
                            </div>
                          )}
                          {quotation.deliveryTime && (
                            <div>
                              <span className="text-gray-500">Delivery: </span>
                              <span className="font-semibold text-gray-900">
                                {quotation.deliveryTime}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {quotation.manufacturer?.phone && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="break-all">{quotation.manufacturer.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}