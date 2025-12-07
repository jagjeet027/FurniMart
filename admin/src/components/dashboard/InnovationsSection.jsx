import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, CheckCircle, Clock, ThumbsUp, ThumbsDown, 
  MessageCircle, Send, Heart, Trash2, Search,
  Eye, AlertCircle, Loader, Crown, Building2, User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../axios/axiosInstance';

const InnovationsSection = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [loadingComments, setLoadingComments] = useState({});

  const categories = [
    'Innovation', 'Storage Solutions', 'Office Furniture', 'Living Room', 
    'Bedroom', 'Outdoor', 'Lighting', 'Decor', 'Custom Design', 'Other'
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
      setError(err.response?.data?.message || 'Failed to load innovations. Please try again.');
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

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
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
      alert(err.response?.data?.message || 'Failed to like post');
    }
  };

  const handleDislike = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to dislike posts');
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
      alert(err.response?.data?.message || 'Failed to dislike post');
    }
  };

  const handleAddComment = async (postId) => {
    if (!isAuthenticated) {
      alert('Please login to comment');
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
      alert(err.response?.data?.message || 'Failed to add comment');
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
      return;
    }

    try {
      await api.post(`/comments/${commentId}/like`);
      fetchComments(postId);
    } catch (err) {
      console.error('Error liking comment:', err);
      alert(err.response?.data?.message || 'Failed to like comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this innovation?')) return;
    
    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(p => p._id !== postId));
      alert('Innovation deleted successfully!');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(err.response?.data?.message || 'Failed to delete innovation');
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          icon: Crown,
          text: 'Admin',
          bgColor: 'bg-purple-500/20',
          textColor: 'text-purple-300',
          iconColor: 'text-purple-400'
        };
      case 'manufacturer':
        return {
          icon: Building2,
          text: 'Manufacturer',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-300',
          iconColor: 'text-blue-400'
        };
      default:
        return {
          icon: User,
          text: 'User',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-300',
          iconColor: 'text-green-400'
        };
    }
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

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.status === 'published').length,
    thisMonth: posts.filter(p => {
      const postDate = new Date(p.createdAt);
      const now = new Date();
      return postDate.getMonth() === now.getMonth() && 
             postDate.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Innovation Hub</h2>
        <p className="text-white/70">Latest innovations and breakthrough technologies from our community.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-sm font-medium mb-1">Total Innovations</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <Lightbulb className="w-12 h-12 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl border border-green-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300 text-sm font-medium mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-white">{stats.active}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300 text-sm font-medium mb-1">This Month</p>
              <p className="text-3xl font-bold text-white">{stats.thisMonth}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400/70 w-5 h-5 group-hover:text-cyan-300 transition-colors" />
            <input
              type="text"
              placeholder="Search innovations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white/15 transition-all hover:bg-white/15"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative group">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none flex-1 lg:flex-none pl-4 pr-10 py-3 bg-gradient-to-br from-white/15 to-white/10 border border-white/30 rounded-xl text-white font-medium focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:from-white/20 hover:to-white/15 transition-all cursor-pointer min-w-[160px]"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)`
                }}
              >
                <option value="all" className="bg-slate-800 text-white">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none flex-1 lg:flex-none pl-4 pr-10 py-3 bg-gradient-to-br from-white/15 to-white/10 border border-white/30 rounded-xl text-white font-medium focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 hover:from-white/20 hover:to-white/15 transition-all cursor-pointer min-w-[140px]"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)`
                }}
              >
                <option value="createdAt" className="bg-slate-800 text-white">Latest</option>
                <option value="views" className="bg-slate-800 text-white">Most Viewed</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Lightbulb className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No innovations yet</h3>
          <p className="text-white/60">Check back soon for new ideas!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map(post => {
            const roleBadge = getRoleBadge(post.userId?.role);
            const RoleIcon = roleBadge.icon;

            return (
              <div key={post._id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:bg-white/15 transition-all">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userId?.profileImage || '/api/placeholder/48/48'}
                        alt={post.userId?.name}
                        className="w-12 h-12 rounded-full ring-2 ring-cyan-400/30"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{post.userId?.name || 'Anonymous'}</h3>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${roleBadge.bgColor}`}>
                            <RoleIcon className={`w-3 h-3 ${roleBadge.iconColor}`} />
                            <span className={`text-xs font-medium ${roleBadge.textColor}`}>{roleBadge.text}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-white/60 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.views || 0} views</span>
                        </div>
                      </div>
                    </div>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                    <p className="text-white/80 leading-relaxed">{post.description}</p>
                  </div>

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    {post.tags?.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                    {post.tags?.length > 3 && (
                      <span className="px-3 py-1 bg-white/10 text-white/50 rounded-full text-sm">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          post.isLiked 
                            ? 'bg-cyan-500/20 text-cyan-300' 
                            : 'hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.likesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => handleDislike(post._id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          post.isDisliked 
                            ? 'bg-white/20 text-white' 
                            : 'hover:bg-white/10 text-white/70'
                        }`}
                      >
                        <ThumbsDown className={`w-5 h-5 ${post.isDisliked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{post.dislikesCount || 0}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-white/10 text-white/70 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">{post.commentsCount || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post._id] && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      {/* Add Comment */}
                      {isAuthenticated && (
                        <div className="mb-4">
                          <div className="flex space-x-3">
                            <img
                              src={user?.profileImage || '/api/placeholder/40/40'}
                              alt={user?.name}
                              className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-cyan-400/30"
                            />
                            <div className="flex-1">
                              <textarea
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                                placeholder="Share your thoughts..."
                                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                                rows="2"
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={!commentText[post._id]?.trim()}
                                className="mt-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          <Loader className="w-6 h-6 text-cyan-400 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {comments[post._id]?.length === 0 ? (
                            <p className="text-center text-white/50 py-4">No comments yet. Be the first to comment!</p>
                          ) : (
                            comments[post._id]?.map(comment => {
                              const commentRoleBadge = getRoleBadge(comment.userId?.role);
                              const CommentRoleIcon = commentRoleBadge.icon;

                              return (
                                <div key={comment._id} className="flex space-x-3">
                                  <img
                                    src={comment.userId?.profileImage || '/api/placeholder/40/40'}
                                    alt={comment.userId?.name}
                                    className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white/20"
                                  />
                                  <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-white text-sm">
                                          {comment.userId?.name || 'Anonymous'}
                                        </h4>
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full ${commentRoleBadge.bgColor}`}>
                                          <CommentRoleIcon className={`w-2.5 h-2.5 ${commentRoleBadge.iconColor}`} />
                                          <span className={`text-xs ${commentRoleBadge.textColor}`}>{commentRoleBadge.text}</span>
                                        </div>
                                      </div>
                                      <span className="text-xs text-white/50">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-white/80 text-sm mb-2">{comment.text}</p>
                                    <button
                                      onClick={() => handleLikeComment(comment._id, post._id)}
                                      className="flex items-center space-x-1 text-white/60 hover:text-pink-400 transition-colors"
                                    >
                                      <Heart className={`w-4 h-4 ${comment.likes?.some(l => l.userId === user?._id) ? 'fill-current text-pink-400' : ''}`} />
                                      <span className="text-xs">{comment.likes?.length || 0}</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InnovationsSection;