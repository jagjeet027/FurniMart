import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../axios/axiosInstance'; // Changed from axios to api
import { 
  Plus, Heart, MessageCircle, Trash2, Edit2, X, Send, 
  ThumbsDown, ThumbsUp, Search, TrendingUp, Clock, 
  Eye, AlertCircle, Loader, Filter, Lightbulb 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const IdeaSharingPlatform = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Innovation',
    tags: ''
  });

  const [commentText, setCommentText] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const categories = [
    'Storage Solutions', 'Office Furniture', 'Living Room', 
    'Bedroom', 'Outdoor', 'Lighting', 'Decor', 'Custom Design', 
    'Innovation', 'Other'
  ];

  useEffect(() => {
    fetchPosts();
  }, [filterCategory, sortBy, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 20,
        sortBy,
        order: 'desc'
      });

      if (filterCategory && filterCategory !== 'all') {
        params.append('category', filterCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await api.get(`/posts?${params}`);
      
      setPosts(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      setLoadingComments(prev => ({ ...prev, [postId]: true }));
      const response = await api.get(`/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: response.data.data || [] }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please login to create a post');
      navigate('/login');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const response = await api.post('/posts', postData);

      setPosts([response.data.data, ...posts]);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', category: 'Innovation', tags: '' });
      alert('Idea posted successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !editingPost) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const postData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      const response = await api.put(`/posts/${editingPost._id}`, postData);

      setPosts(posts.map(p => p._id === editingPost._id ? response.data.data : p));
      setShowEditModal(false);
      setEditingPost(null);
      setFormData({ title: '', description: '', category: 'Innovation', tags: '' });
      alert('Idea updated successfully!');
    } catch (err) {
      console.error('Error updating post:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this idea?')) return;
    
    try {
      await api.delete(`/posts/${postId}`);

      setPosts(posts.filter(p => p._id !== postId));
      alert('Idea deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete post');
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);

      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, ...response.data.data }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDislike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to dislike posts');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/dislike`);

      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, ...response.data.data }
          : post
      ));
    } catch (err) {
      console.error('Error disliking post:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
      navigate('/login');
      return;
    }

    const text = commentText[postId]?.trim();
    if (!text) return;

    try {
      await api.post(`/posts/${postId}/comments`, { text });

      fetchComments(postId);
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      setPosts(posts.map(p => 
        p._id === postId 
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
          : p
      ));
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  const toggleComments = (postId) => {
    const isOpen = showComments[postId];
    
    if (!isOpen && !comments[postId]) {
      fetchComments(postId);
    }
    
    setShowComments(prev => ({ ...prev, [postId]: !isOpen }));
  };

  const handleLikeComment = async (commentId, postId) => {
    if (!isAuthenticated) {
      alert('Please login to like comments');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/comments/${commentId}/like`);
      
      fetchComments(postId);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      category: post.category,
      tags: post.tags?.join(', ') || ''
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingPost(null);
    setFormData({ title: '', description: '', category: 'Innovation', tags: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Lightbulb className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">FurniMart Innovation Hub</h1>
                <p className="text-amber-100 text-sm hidden sm:block">Share Your Furniture Ideas</p>
              </div>
            </div>
            
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-white text-amber-600 px-4 sm:px-6 py-2.5 rounded-full font-semibold hover:bg-amber-50 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Share Idea</span>
                <span className="sm:hidden">Post</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 lg:flex-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 lg:flex-none px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="createdAt">Latest</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No ideas yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share your furniture innovation!</p>
            {isAuthenticated && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Share Your Idea</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <div key={post._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100">
                <div className="p-4 sm:p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userId?.profileImage || '/api/placeholder/40/40'}
                        alt={post.userId?.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-amber-200"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.userId?.name || 'Anonymous'}</h3>
                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>
                    </div>

                    {user && user._id === post.userId?._id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(post)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{post.description}</p>
                  </div>

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm font-medium">
                      {post.category}
                    </span>
                    {post.tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                        #{tag}
                      </span>
                    ))}
                    {post.tags?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs sm:text-sm">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                          post.isLiked 
                            ? 'bg-red-50 text-red-600' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium text-sm sm:text-base">{post.likesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(post._id)}
                        className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                          post.isDisliked 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        <ThumbsDown className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isDisliked ? 'fill-current' : ''}`} />
                        <span className="font-medium text-sm sm:text-base">{post.dislikesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-medium text-sm sm:text-base">{post.commentsCount || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      {/* Add Comment */}
                      {isAuthenticated && (
                        <div className="mb-4">
                          <div className="flex space-x-3">
                            <img
                              src={user?.profileImage || '/api/placeholder/40/40'}
                              alt={user?.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1">
                              <textarea
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                placeholder="Share your thoughts..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm"
                                rows="2"
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={!commentText[post._id]?.trim()}
                                className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                <Send className="w-4 h-4" />
                                <span>Comment</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comments List */}
                      {loadingComments[post._id] ? (
                        <div className="flex justify-center py-4">
                          <Loader className="w-6 h-6 text-amber-600 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments[post._id]?.length === 0 ? (
                            <p className="text-center text-gray-500 py-4 text-sm">No comments yet. Be the first to comment!</p>
                          ) : (
                            comments[post._id]?.map(comment => (
                              <div key={comment._id} className="flex space-x-3">
                                <img
                                  src={comment.userId?.profileImage || '/api/placeholder/40/40'}
                                  alt={comment.userId?.name}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 text-sm">{comment.userId?.name || 'Anonymous'}</h4>
                                    <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">{comment.text}</p>
                                  <button
                                    onClick={() => handleLikeComment(comment._id, post._id)}
                                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                                  >
                                    <Heart className={`w-4 h-4 ${comment.likes?.some(l => l.userId === user?._id) ? 'fill-current text-red-600' : ''}`} />
                                    <span className="text-xs">{comment.likes?.length || 0}</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {showEditModal ? 'Edit Idea' : 'Share New Idea'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Give your idea a catchy title"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  placeholder="Describe your idea in detail..."
                  rows="6"
                  maxLength={5000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., modern, eco-friendly, space-saving"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdatePost : handleCreatePost}
                  disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                  className="flex-1 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  <span>{showEditModal ? 'Update Idea' : 'Share Idea'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default IdeaSharingPlatform;