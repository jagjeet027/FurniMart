import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lightbulb, FileText, MapPin, Building2, Image, X, Loader, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../axios/axiosInstance';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [canEdit, setCanEdit] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    department: '',
    type: 'Idea',
    image: '',
    location: ''
  });

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      
      if (response.data.success) {
        const post = response.data.post;
        
        // Check ownership
        if (post.user._id !== user._id) {
          setError('You can only edit your own posts');
          setTimeout(() => navigate('/community'), 2000);
          return;
        }

        // Check if within 1 hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (new Date(post.createdAt) < oneHourAgo) {
          setCanEdit(false);
          setError('This post can no longer be edited (1 hour limit exceeded)');
        }

        setFormData({
          title: post.title,
          content: post.content,
          department: post.department,
          type: post.type,
          image: post.image || '',
          location: post.location
        });
        
        if (post.image) {
          setImagePreview(post.image);
        }
      }
    } catch (err) {
      console.error('Fetch post error:', err);
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim() || !formData.department.trim() || !formData.location.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!canEdit) {
      setError('This post can no longer be edited');
      return;
    }

    try {
      setSaving(true);
      const response = await api.patch(`/posts/${id}`, formData);

      if (response.data.success) {
        navigate('/community');
      } else {
        setError(response.data.message || 'Failed to update post');
      }
    } catch (err) {
      console.error('Update post error:', err);
      setError(err.response?.data?.message || 'Failed to update post');
      if (err.response?.data?.canEdit === false) {
        setCanEdit(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <Loader className="w-12 h-12 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
          <p className="text-gray-600 mt-1">Update your post details</p>
        </div>

        {/* Error/Warning Message */}
        {error && (
          <div className={`mb-6 p-4 ${canEdit ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg flex items-start gap-3`}>
            <AlertCircle className={`w-5 h-5 ${canEdit ? 'text-red-600' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <span className={`${canEdit ? 'text-red-700' : 'text-yellow-700'} text-sm`}>{error}</span>
            </div>
            <button onClick={() => setError('')}>
              <X className={`w-4 h-4 ${canEdit ? 'text-red-700' : 'text-yellow-700'}`} />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Post Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'Idea' })}
                disabled={!canEdit}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'Idea'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Lightbulb className={`w-6 h-6 mx-auto mb-2 ${formData.type === 'Idea' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-semibold ${formData.type === 'Idea' ? 'text-orange-700' : 'text-gray-700'}`}>
                  Idea
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'requirement' })}
                disabled={!canEdit}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.type === 'requirement'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <FileText className={`w-6 h-6 mx-auto mb-2 ${formData.type === 'requirement' ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`text-sm font-semibold ${formData.type === 'requirement' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Requirement
                </span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!canEdit}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter a descriptive title..."
              maxLength="200"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={!canEdit}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Describe your idea or requirement in detail..."
              rows="6"
            />
          </div>

          {/* Department & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={!canEdit}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!canEdit}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., New Delhi, India"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Update Image (Optional)
            </label>
            {!imagePreview ? (
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg ${canEdit ? 'cursor-pointer hover:border-orange-500' : 'cursor-not-allowed opacity-50'} transition-colors`}>
                <Image className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={!canEdit}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !canEdit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}