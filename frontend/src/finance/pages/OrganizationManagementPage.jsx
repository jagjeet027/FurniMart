// frontend/src/finance/pages/OrganizationManagementPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  X,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../axios/axiosInstance';

const OrganizationManagementPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ status: '', notes: '', reviewerName: '' });
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // ✅ FETCH ORGANIZATIONS ON MOUNT
  useEffect(() => {
    console.log('🚀 OrganizationManagementPage mounted');
    fetchOrganizations();
    fetchStats();
  }, []);

  // ✅ FILTER & SORT
  useEffect(() => {
    let filtered = organizations.filter(org => {
      const matchesSearch = org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || org.status === statusFilter;
      const matchesType = typeFilter === 'all' || org.organizationType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'submissionDate' || sortBy === 'createdAt') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  // ✅ FETCH ORGANIZATIONS FROM BACKEND
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching organizations from backend...');
      
      const response = await api.get('/organizations', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          organizationType: typeFilter !== 'all' ? typeFilter : undefined,
          limit: 100,
          skip: 0
        }
      });

      if (response.data?.data) {
        console.log('✅ Organizations fetched:', response.data.data.length);
        setOrganizations(response.data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch organizations:', error.message);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH STATS FROM BACKEND
  const fetchStats = async () => {
    try {
      console.log('📡 Fetching stats from backend...');
      const response = await api.get('/organizations-stats');
      
      if (response.data?.data) {
        console.log('✅ Stats fetched');
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error.message);
    }
  };

  // ✅ SUBMIT REVIEW TO BACKEND
  const submitReview = async () => {
    try {
      if (!selectedOrg || !reviewData.status || !reviewData.reviewerName) {
        alert('Please fill all required fields');
        return;
      }

      console.log('📤 Submitting review...');
      const response = await api.put(
        `/organizations/${selectedOrg._id}/review`,
        reviewData
      );

      if (response.data?.success) {
        console.log('✅ Review submitted successfully');
        
        // Update local state
        setOrganizations(prev => 
          prev.map(org => 
            org._id === selectedOrg._id 
              ? { ...org, status: reviewData.status, reviewNotes: reviewData.notes }
              : org
          )
        );

        setShowReviewModal(false);
        fetchStats(); // Refresh stats
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('❌ Review submission failed:', error);
      alert('Failed to submit review: ' + (error.response?.data?.message || error.message));
    }
  };

  // ✅ FORMAT DATE
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ GET STATUS BADGE
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'from-amber-100 to-amber-50', textColor: 'text-amber-700', bgColor: 'bg-amber-50', icon: Clock, label: 'Pending' },
      approved: { color: 'from-green-100 to-green-50', textColor: 'text-green-700', bgColor: 'bg-green-50', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'from-red-100 to-red-50', textColor: 'text-red-700', bgColor: 'bg-red-50', icon: XCircle, label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} font-medium text-sm`}>
        <IconComponent size={16} />
        {config.label}
      </div>
    );
  };

  const organizationTypes = [...new Set(organizations.map(org => org.organizationType))];

  // ✅ RENDER
  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <RefreshCw size={48} className="text-blue-600" />
          </motion.div>
          <p className="text-lg text-gray-700 font-medium">Loading organizations...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <Building size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  Organization Management
                </h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <TrendingUp size={16} />
                  Review and manage organization applications
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={fetchOrganizations}
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
        >
          {[
            { label: 'Total', value: stats.total, color: 'from-blue-500 to-blue-600' },
            { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-amber-600' },
            { label: 'Approved', value: stats.approved, color: 'from-green-500 to-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-red-600' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
            >
              <p className="text-white/80 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none bg-white"
              >
                <option value="all">All Types</option>
                {organizationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none bg-white"
              >
                <option value="submissionDate-desc">Newest First</option>
                <option value="submissionDate-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Organizations List */}
        {filteredOrganizations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Building size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800">No organizations found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <motion.div
                key={org._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{org.organizationName}</h3>
                    <p className="text-sm text-gray-600 mt-1">{org.organizationType}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {org.contactPerson}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {org.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(org.status)}
                    <p className="text-xs text-gray-500">{formatDate(org.createdAt || org.submissionDate)}</p>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => {
                          setSelectedOrg(org);
                          setShowDetailsModal(true);
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Details
                      </motion.button>

                      {org.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            setSelectedOrg(org);
                            setReviewData({ status: 'approved', notes: '', reviewerName: '' });
                            setShowReviewModal(true);
                          }}
                          className="px-4 py-2 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Review
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedOrg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">{selectedOrg.organizationName}</h2>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X size={24} className="text-white" />
                </motion.button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Organization Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Name</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Type</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.organizationType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Country</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.country}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Status</p>
                      {getStatusBadge(selectedOrg.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Contact Person</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                      <p className="text-blue-600 font-semibold">{selectedOrg.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Phone</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.phone}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600 font-medium mb-1">Address</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Loan Products</h3>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-2">Types Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrg.loanTypes?.map((type) => (
                        <span key={type} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Loan Amount Range</p>
                    <p className="text-gray-800 font-semibold">₹{selectedOrg.minLoanAmount?.toLocaleString()} - ₹{selectedOrg.maxLoanAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium mb-1">Interest Rate</p>
                    <p className="text-gray-800 font-semibold">{selectedOrg.interestRateRange}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && selectedOrg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">Review Application</h2>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X size={24} className="text-white" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-bold text-gray-800">{selectedOrg.organizationName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrg.organizationType}</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Decision</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all">
                      <input
                        type="radio"
                        value="approved"
                        checked={reviewData.status === 'approved'}
                        onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                        className="w-5 h-5 text-green-600 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Approve</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all">
                      <input
                        type="radio"
                        value="rejected"
                        checked={reviewData.status === 'rejected'}
                        onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700">Reject</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={reviewData.reviewerName}
                    onChange={(e) => setReviewData({...reviewData, reviewerName: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Notes</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                    placeholder="Add any feedback..."
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none resize-none"
                  />
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={submitReview}
                  disabled={!reviewData.status || !reviewData.reviewerName}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Submit
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizationManagementPage;