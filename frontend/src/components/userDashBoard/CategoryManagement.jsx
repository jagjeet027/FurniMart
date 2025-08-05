import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Package, Search } from 'lucide-react';
import api from '../../axios/axiosInstance';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      const categoriesData = response.data.categories || response.data || [];
      
      // Fetch product counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const productsResponse = await api.get(`/products/category/${category._id}`);
            const products = productsResponse.data.products || [];
            return {
              ...category,
              productCount: products.length
            };
          } catch (err) {
            return {
              ...category,
              productCount: 0
            };
          }
        })
      );
      
      setCategories(categoriesWithCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const response = await api.post('/categories', newCategory);
      setCategories([...categories, { ...response.data.category, productCount: 0 }]);
      setNewCategory({ name: '', description: '' });
      setShowAddForm(false);
      setError('');
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (categoryId) => {
    if (!editingCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      const response = await api.put(`/categories/${categoryId}`, {
        name: editingCategory.name,
        description: editingCategory.description
      });
      
      setCategories(categories.map(cat => 
        cat._id === categoryId 
          ? { ...response.data.category, productCount: cat.productCount }
          : cat
      ));
      setEditingCategory(null);
      setError('');
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat._id !== categoryId));
      setError('');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-gray-600">Manage your product categories</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddCategory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Category
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCategory({ name: '', description: '' });
                setError('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.' 
              : 'Create your first category to get started.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div key={category._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {editingCategory && editingCategory._id === category._id ? (
                // Edit Form
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="Description (optional)"
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateCategory(category._id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors flex items-center"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{category.name}</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{category.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                      ID: {category._id.slice(-6)}
                    </span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                    <button
                      onClick={() => window.open(`/categories/${category._id}/products`, '_blank')}
                      className="flex-1 bg-blue-50 text-blue-600 py-1 px-2 rounded text-xs hover:bg-blue-100 transition-colors"
                    >
                      View Products
                    </button>
                    <button
                      onClick={() => window.open(`/products/add?category=${category._id}`, '_blank')}
                      className="flex-1 bg-green-50 text-green-600 py-1 px-2 rounded text-xs hover:bg-green-100 transition-colors"
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {categories.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {categories.length}
              </div>
              <div className="text-sm text-blue-700">Total Categories</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {categories.reduce((total, cat) => total + cat.productCount, 0)}
              </div>
              <div className="text-sm text-green-700">Total Products</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {categories.filter(cat => cat.productCount > 0).length}
              </div>
              <div className="text-sm text-purple-700">Active Categories</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {categories.length > 0 ? Math.round(categories.reduce((total, cat) => total + cat.productCount, 0) / categories.length) : 0}
              </div>
              <div className="text-sm text-orange-700">Avg Products/Category</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;