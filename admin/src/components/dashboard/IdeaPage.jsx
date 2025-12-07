import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Plus, Search, Filter, AlertCircle, Clock, CheckCircle2,
  XCircle, Eye, Edit3, MessageSquare, Trash2, BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const IssuesPage = () => {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalIssues: 0,
    hasNext: false,
    hasPrev: false
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    status: 'open'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Token management utility
  const handleTokenError = (error) => {
    if (error.response?.status === 401 && 
        (error.response?.data?.message === 'Token expired' || 
         error.response?.data?.message === 'Invalid token' || 
         error.response?.data?.message === 'No token provided')) {
      
      // Clear local storage - FIXED: using adminToken
      localStorage.removeItem('adminToken');
      localStorage.removeItem('refreshToken');
      
      // Call logout if available
      if (logout) {
        logout();
      }
      
      // Redirect to login
      navigate('/login', { 
        replace: true,
        state: { message: 'Your session has expired. Please log in again.' }
      });
      
      return true; // Indicates token error was handled
    }
    return false; // Not a token error
  };

  // Enhanced axios request with token handling
  const makeAuthenticatedRequest = async (requestConfig) => {
    try {
      // FIXED: Get token from adminToken in localStorage or from context
      const authToken = localStorage.getItem('adminToken') || token;
      
      if (!authToken) {
        navigate('/login', { 
          replace: true,
          state: { message: 'Please log in to continue.' }
        });
        return null;
      }

      const config = {
        ...requestConfig,
        headers: {
          ...requestConfig.headers,
          Authorization: `Bearer ${authToken}`
        }
      };

      return await axios(config);
    } catch (error) {
      const wasTokenError = handleTokenError(error);
      if (!wasTokenError) {
        throw error; // Re-throw if not a token error
      }
      return null;
    }
  };

  // Fetch issues with token handling
  const fetchIssues = async () => {
    // FIXED: Check for admin user instead of manufacturer
    if (!user || (!user.isManufacturer && !user.adminId)) {
      setError('Access denied. Only manufacturers and admins can view issues.');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await makeAuthenticatedRequest({
        method: 'GET',
        url: `http://localhost:5000/api/issues?${params}`
      });

      if (response) {
        setIssues(response.data.data.issues);
        setPagination(response.data.data.pagination);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError(err.response?.data?.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics with token handling
  const fetchStats = async () => {
    try {
      const response = await makeAuthenticatedRequest({
        method: 'GET',
        url: 'http://localhost:5000/api/issues/stats'
      });

      if (response) {
        setStats(response.data.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Don't set error state for stats failure, just log it
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page
    }));
  };

  // Create issue with token handling
  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest({
        method: 'POST',
        url: 'http://localhost:5000/api/issues',
        data: formData
      });

      if (response) {
        setShowCreateModal(false);
        setFormData({ name: '', description: '', category: 'general', status: 'open' });
        fetchIssues();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update issue with token handling
  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest({
        method: 'PUT',
        url: `http://localhost:5000/api/issues/${selectedIssue._id}`,
        data: formData
      });

      if (response) {
        setShowEditModal(false);
        setSelectedIssue(null);
        setFormData({ name: '', description: '', category: 'general', status: 'open' });
        fetchIssues();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete issue with token handling
  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await makeAuthenticatedRequest({
        method: 'DELETE',
        url: `http://localhost:5000/api/issues/${issueId}`
      });

      if (response) {
        fetchIssues();
        fetchStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  // View issue details with token handling
  const handleViewIssue = async (issueId) => {
    try {
      const response = await makeAuthenticatedRequest({
        method: 'GET',
        url: `http://localhost:5000/api/issues/${issueId}`
      });

      if (response) {
        setSelectedIssue(response.data.data.issue);
        setShowViewModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch issue details');
    }
  };

  // Edit issue
  const handleEditClick = (issue) => {
    setSelectedIssue(issue);
    setFormData({
      name: issue.name,
      description: issue.description || '',
      category: issue.category,
      status: issue.status
    });
    setShowEditModal(true);
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    const statusMap = {
      open: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    return statusMap[status] || statusMap.open;
  };

  if (!user || (!user.isManufacturer && !user.adminId)) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only manufacturers and admins can access the issues management system.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
          <p className="text-gray-600">Track and manage your support issues</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Issue
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Issues</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus.open}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus.resolved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Recent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="order">Order</option>
            <option value="product">Product</option>
            <option value="general">General</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first issue.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            Create Issue
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => {
                  const statusInfo = getStatusInfo(issue.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{issue.name}</div>
                          {issue.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {issue.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon size={12} className="mr-1" />
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {issue.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewIssue(issue._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEditClick(issue)}
                            className="text-amber-600 hover:text-amber-900"
                            title="Edit Issue"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Issue"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.currentPage - 1) * filters.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * filters.limit, pagination.totalIssues)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalIssues}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handleFilterChange('page', index + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === index + 1
                            ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Issue Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Issue</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateIssue}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter issue name"
                  required
                  maxLength={200}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="order">Order</option>
                  <option value="product">Product</option>
                  <option value="general">General</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED: Edit Issue Modal - was completely missing */}
      {showEditModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Issue</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateIssue}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter issue name"
                  required
                  maxLength={200}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="order">Order</option>
                  <option value="product">Product</option>
                  <option value="general">General</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  rows={4}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Issue Modal */}
      {showViewModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Issue Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedIssue.name}</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedIssue.status).color}`}>
                    {selectedIssue.status.charAt(0).toUpperCase() + selectedIssue.status.slice(1).replace('-', ' ')}
                  </span>
                 
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedIssue.category.charAt(0).toUpperCase() + selectedIssue.category.slice(1)}
                  </span>
                </div>
              </div>

              {selectedIssue.description && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedIssue.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Created</h5>
                  <p className="text-gray-600">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Updated</h5>
                  <p className="text-gray-600">{new Date(selectedIssue.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedIssue.assignedTo && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Assigned To</h5>
                  <p className="text-gray-600">{selectedIssue.assignedTo.name || selectedIssue.assignedTo.email}</p>
                </div>
              )}

              {selectedIssue.comments && selectedIssue.comments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Comments ({selectedIssue.comments.length})</h5>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedIssue.comments.map((comment, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.userId?.name || comment.userId?.email || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedIssue);
                }}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 size={16} />
                Edit Issue
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;