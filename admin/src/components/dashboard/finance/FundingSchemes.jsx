import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  X,
  Send,
  AlertCircle,
  Loader
} from 'lucide-react';
import { 
  getOrganizations, 
  getOrganizationStats, 
  reviewOrganization,
  deleteOrganization 
} from '../../../services/adminApiService';

const FundingSchemes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ status: '', reason: '', reviewerName: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  // ✅ FETCH ORGANIZATIONS ON MOUNT
  useEffect(() => {
    console.log('🚀 FundingSchemes component mounted');
    fetchOrganizations();
    fetchStats();
  }, []);

  useEffect(() => {
  const filtered = organizations.filter(org => {
    const matchesSearch = 
      (org.organizationName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (org.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (org.contactPerson?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  setFilteredOrgs(filtered);
}, [organizations, searchTerm, filterStatus]);

  // ✅ FETCH FROM BACKEND
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching organizations from backend...');
      
      const response = await getOrganizations({
        limit: 100,
        skip: 0
      });

      if (response.success && response.data) {
        console.log('✅ Organizations fetched:', response.data.length);
        setOrganizations(response.data);
      } else {
        throw new Error('Failed to fetch organizations');
      }
    } catch (err) {
      console.error('❌ Failed to fetch organizations:', err.message);
      setError('Failed to load organizations. Please try again.');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH STATS FROM BACKEND
  const fetchStats = async () => {
    try {
      console.log('📡 Fetching stats...');
      const response = await getOrganizationStats();

      if (response.success && response.data) {
        console.log('✅ Stats fetched:', response.data);
        setStats(response.data);
      }
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err.message);
      // Calculate stats from organizations if API fails
      calculateLocalStats();
    }
  };

  // Calculate stats locally as fallback
  const calculateLocalStats = () => {
    const total = organizations.length;
    const approved = organizations.filter(o => o.status === 'approved').length;
    const pending = organizations.filter(o => o.status === 'pending').length;
    const rejected = organizations.filter(o => o.status === 'rejected').length;
    setStats({ total, approved, pending, rejected });
  };

  // ✅ SUBMIT REVIEW
  const handleReview = async () => {
    if (!reviewForm.status || !reviewForm.reviewerName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmittingReview(true);
    try {
      console.log('📝 Submitting review for organization:', selectedOrg._id);
      
      const response = await reviewOrganization(selectedOrg._id, {
        status: reviewForm.status,
        reviewNotes: reviewForm.reason,
        reviewerName: reviewForm.reviewerName
      });

      if (response.success) {
        console.log('✅ Review submitted successfully');
        
        // Update local state
        setOrganizations(prev =>
          prev.map(org =>
            org._id === selectedOrg._id
              ? { ...org, status: reviewForm.status, reviewNotes: reviewForm.reason }
              : org
          )
        );

        setShowReviewModal(false);
        setReviewForm({ status: '', reason: '', reviewerName: '' });
        fetchStats(); // Refresh stats
        alert('✅ Status updated successfully!');
      }
    } catch (err) {
      console.error('❌ Review submission failed:', err);
      alert('Failed to submit review: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ✅ DELETE ORGANIZATION
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;

    try {
      console.log('🗑️ Deleting organization:', id);
      
      await deleteOrganization(id);
      
      setOrganizations(prev => prev.filter(org => org._id !== id));
      alert('✅ Organization deleted successfully!');
      fetchStats();
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert('Failed to delete organization: ' + (err.response?.data?.message || err.message));
    }
  };

  // ✅ STAT CARD COMPONENT
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-40" />
      </div>
    </div>
  );

  // ✅ STATUS BADGE
  const getStatusBadge = (status) => {
    const config = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    const c = config[status];
    const StatusIcon = c.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${c.bg} ${c.text} font-semibold text-sm`}>
        <StatusIcon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  // ✅ FORMAT DATE
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">Funding Schemes Management</h1>
            <button
              onClick={fetchOrganizations}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'organizations', label: '🏢 Organizations' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 font-semibold border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={fetchOrganizations}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Users} label="Total Organizations" value={stats.total} color="from-blue-500 to-blue-600" />
              <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="from-green-500 to-green-600" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="from-amber-500 to-amber-600" />
              <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="from-red-500 to-red-600" />
            </div>

            {/* Recent Submissions */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
              {filteredOrgs.length === 0 ? (
                <p className="text-slate-400">No organizations found</p>
              ) : (
                <div className="space-y-4">
                  {filteredOrgs.slice(0, 5).map((org, idx) => (
                    <div
                      key={org._id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
                    >
                      <div className="flex-1">
                        <p className="text-white font-semibold">{org.organizationName}</p>
                        <p className="text-slate-400 text-sm">Submitted on {formatDate(org.createdAt)}</p>
                      </div>
                      {getStatusBadge(org.status)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-slate-700 focus:border-blue-500 outline-none bg-slate-800 text-white transition-all"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-blue-500 outline-none bg-slate-800 text-white font-medium transition-all"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Organizations Table */}
            {loading ? (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-12 flex items-center justify-center">
                <div className="animate-spin">
                  <Loader className="w-8 h-8 text-blue-400" />
                </div>
                <p className="ml-4 text-slate-300">Loading organizations...</p>
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                <p className="text-slate-400 text-lg">No organizations found</p>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700 border-b border-slate-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-white font-semibold">Organization</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Type</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Country</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrgs.map((org) => (
                        <tr
                          key={org._id}
                          className="border-b border-slate-700 hover:bg-slate-700/50 transition-all"
                        >
                          <td className="px-6 py-4">
                            <p className="text-white font-semibold">{org.organizationName}</p>
                            <p className="text-slate-400 text-sm">{org.email}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{org.organizationType}</td>
                          <td className="px-6 py-4 text-slate-300">{org.country}</td>
                          <td className="px-6 py-4">{getStatusBadge(org.status)}</td>
                          <td className="px-6 py-4 flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrg(org);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all"
                            >
                              <Eye size={18} />
                            </button>
                            {org.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setReviewForm({ status: '', reason: '', reviewerName: '' });
                                  setShowReviewModal(true);
                                }}
                                className="p-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/40 transition-all"
                              >
                                <Send size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(org._id)}
                              className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedOrg.organizationName}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Email</p>
                  <p className="text-white font-semibold flex items-center gap-2"><Mail size={16} /> {selectedOrg.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Phone</p>
                  <p className="text-white font-semibold flex items-center gap-2"><Phone size={16} /> {selectedOrg.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Type</p>
                  <p className="text-white font-semibold">{selectedOrg.organizationType}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Country</p>
                  <p className="text-white font-semibold flex items-center gap-2"><MapPin size={16} /> {selectedOrg.country}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Status</p>
                  {getStatusBadge(selectedOrg.status)}
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Submitted</p>
                  <p className="text-white font-semibold">{formatDate(selectedOrg.createdAt)}</p>
                </div>
              </div>

              {selectedOrg.loanTypes && selectedOrg.loanTypes.length > 0 && (
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Loan Types</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrg.loanTypes.map((type) => (
                      <span key={type} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrg.description && (
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-2">Description</p>
                  <p className="text-slate-200 text-sm">{selectedOrg.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrg && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Review Application</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-white font-bold">{selectedOrg.organizationName}</p>
                <p className="text-slate-400 text-sm">{selectedOrg.organizationType}</p>
              </div>

              <div>
                <p className="text-white font-bold mb-3">Decision</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-green-500/10 transition-all">
                    <input
                      type="radio"
                      value="approved"
                      checked={reviewForm.status === 'approved'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-white font-semibold">✅ Approve</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-red-500/10 transition-all">
                    <input
                      type="radio"
                      value="rejected"
                      checked={reviewForm.status === 'rejected'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span className="text-white font-semibold">❌ Reject</span>
                  </label>
                </div>
              </div>

              {reviewForm.status === 'rejected' && (
                <div>
                  <label className="block text-white font-bold mb-2">Reason</label>
                  <textarea
                    value={reviewForm.reason}
                    onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}
                    placeholder="Why are you rejecting this application?"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition-all"
                    rows="3"
                  />
                </div>
              )}

              <div>
                <label className="block text-white font-bold mb-2">Your Name</label>
                <input
                  type="text"
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-slate-600 text-white rounded-lg hover:border-slate-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={isSubmittingReview || !reviewForm.status || !reviewForm.reviewerName}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundingSchemes;