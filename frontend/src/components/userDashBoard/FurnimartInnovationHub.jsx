import React, { useState } from 'react';
import { Heart, MessageCircle, Edit3, Trash2, Camera, X, Send, Plus } from 'lucide-react';

const IdeaPostingPage = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: "John Doe",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      title: "Smart Home Automation System",
      content: "An innovative IoT-based home automation system that learns from user behavior and automatically adjusts lighting, temperature, and security based on daily patterns.",
      image: "https://images.unsplash.com/photo-1558618644-fcd25c85cd64?w=600&h=300&fit=crop",
      timestamp: "2 hours ago",
      likes: 15,
      comments: 8,
      manufacturerReviews: [
        { name: "TechCorp", comment: "Interesting concept! We'd like to discuss partnership opportunities.", liked: true }
      ],
      adminReviews: [
        { name: "Admin", comment: "Great innovation potential. Approved for manufacturer review.", liked: true }
      ]
    },
    {
      id: 2,
      user: "Jane Smith",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b593?w=40&h=40&fit=crop&crop=face",
      title: "Eco-Friendly Water Bottle",
      content: "A self-cleaning water bottle made from recycled materials with UV-C sterilization technology.",
      image: null,
      timestamp: "5 hours ago",
      likes: 23,
      comments: 12,
      manufacturerReviews: [],
      adminReviews: []
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
    imagePreview: null
  });

  const [editingPost, setEditingPost] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentUser = {
    name: "Current User",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
  };

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (isEditing) {
          setEditingPost(prev => ({
            ...prev,
            image: event.target.result,
            imagePreview: event.target.result
          }));
        } else {
          setNewPost(prev => ({
            ...prev,
            image: file,
            imagePreview: event.target.result
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (isEditing = false) => {
    if (isEditing) {
      setEditingPost(prev => ({
        ...prev,
        image: null,
        imagePreview: null
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        image: null,
        imagePreview: null
      }));
    }
  };

  const createPost = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      const post = {
        id: posts.length + 1,
        user: currentUser.name,
        userAvatar: currentUser.avatar,
        title: newPost.title,
        content: newPost.content,
        image: newPost.imagePreview,
        timestamp: "Just now",
        likes: 0,
        comments: 0,
        manufacturerReviews: [],
        adminReviews: []
      };
      
      setPosts([post, ...posts]);
      setNewPost({ title: "", content: "", image: null, imagePreview: null });
      setShowCreateForm(false);
    }
  };

  const deletePost = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const startEdit = (post) => {
    setEditingPost({
      ...post,
      imagePreview: post.image
    });
  };

  const saveEdit = () => {
    setPosts(posts.map(post => 
      post.id === editingPost.id 
        ? { ...editingPost, image: editingPost.imagePreview }
        : post
    ));
    setEditingPost(null);
  };

  const cancelEdit = () => {
    setEditingPost(null);
  };

  const likePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">IdeaShare Platform</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              New Idea
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Create Post Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Share Your Idea</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Give your idea a catchy title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Describe your innovative idea in detail..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows="4"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />

              {/* Image Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {newPost.imagePreview ? (
                  <div className="relative">
                    <img
                      src={newPost.imagePreview}
                      alt="Preview"
                      className="max-w-full h-64 object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={() => removeImage(false)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">Add an image to showcase your idea (optional)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, false)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createPost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  Post Idea
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar}
                      alt={post.user}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{post.user}</h3>
                      <p className="text-sm text-gray-500">{post.timestamp}</p>
                    </div>
                  </div>
                  
                  {post.user === currentUser.name && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(post)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Post Content */}
              {editingPost && editingPost.id === post.id ? (
                <div className="px-6 pb-4 space-y-4">
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost(prev => ({ ...prev, content: e.target.value }))}
                    rows="3"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  
                  {/* Edit Image */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {editingPost.imagePreview ? (
                      <div className="relative">
                        <img
                          src={editingPost.imagePreview}
                          alt="Preview"
                          className="max-w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => removeImage(true)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, true)}
                          className="hidden"
                          id={`edit-image-${post.id}`}
                        />
                        <label
                          htmlFor={`edit-image-${post.id}`}
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded cursor-pointer hover:bg-blue-200"
                        >
                          Add Image
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-6 pb-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>
                  
                  {post.image && (
                    <div className="mb-4">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full max-h-96 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Post Actions */}
              {(!editingPost || editingPost.id !== post.id) && (
                <>
                  <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => likePost(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart size={20} />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                        <MessageCircle size={20} />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {(post.manufacturerReviews.length > 0 || post.adminReviews.length > 0) && (
                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <h4 className="font-semibold text-gray-800 mb-3">Reviews</h4>
                      
                      {post.adminReviews.map((review, index) => (
                        <div key={index} className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-blue-800">Admin Review</span>
                            {review.liked && <Heart size={16} className="text-red-500 fill-current" />}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                      
                      {post.manufacturerReviews.map((review, index) => (
                        <div key={index} className="mb-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-green-800">{review.name} (Manufacturer)</span>
                            {review.liked && <Heart size={16} className="text-red-500 fill-current" />}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Camera size={64} className="mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No ideas shared yet</h3>
              <p className="text-gray-500 mt-2">Be the first to share your innovative idea!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaPostingPage;