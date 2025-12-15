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
  Loader,
  Building,
  Calendar,
  FileText,
  Globe,
  DollarSign,
  Award,
  TrendingUp,
  User
} from 'lucide-react';
import api from '../../../axios/axiosInstance.js';

const FundingSchemes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ status: '', reason: '', reviewerName: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    byType: [],
    recentSubmissions: 0
  });

  // ✅ FETCH ORGANIZATIONS ON MOUNT
  useEffect(() => {
    console.log('🚀 FundingSchemes component mounted');
    fetchOrganizations();
    fetchStats();
  }, []);

  // ✅ FILTER ORGANIZATIONS
  useEffect(() => {
    const filtered = organizations.filter(org => {
      const matchesSearch = 
        (org.organizationName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (org.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (org.contactPerson?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (org.organizationType?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
      const matchesType = filterType === 'all' || org.organizationType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
    setFilteredOrgs(filtered);
  }, [organizations, searchTerm, filterStatus, filterType]);

  // ✅ FETCH FROM BACKEND - Using correct /api/finance/organizations endpoint
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching organizations from /api/finance/organizations...');
      
      const response = await api.get('/finance/organizations', {
        params: {
          limit: 100,
          skip: 0
        }
      });

      console.log('📥 Response received:', response.data);

      if (response.data?.success && response.data?.data) {
        console.log('✅ Organizations fetched:', response.data.data.length);
        setOrganizations(response.data.data);
      } else if (Array.isArray(response.data?.data)) {
        console.log('✅ Organizations fetched (no success flag):', response.data.data.length);
        setOrganizations(response.data.data);
      } else if (Array.isArray(response.data)) {
        console.log('✅ Organizations fetched (direct array):', response.data.length);
        setOrganizations(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('❌ Failed to fetch organizations:', err);
      setError(err.message || 'Failed to load organizations. Please try again.');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH STATS FROM BACKEND - Using correct endpoint
  const fetchStats = async () => {
    try {
      console.log('📡 Fetching stats from /api/finance/organizations-stats...');
      const response = await api.get('/finance/organizations-stats');

      console.log('📥 Stats response:', response.data);

      if (response.data?.success && response.data?.data) {
        console.log('✅ Stats fetched:', response.data.data);
        setStats(response.data.data);
      } else if (response.data?.data) {
        console.log('✅ Stats fetched (no success flag):', response.data.data);
        setStats(response.data.data);
      } else if (response.data) {
        console.log('✅ Stats fetched (direct data):', response.data);
        setStats(response.data);
      }
    } catch (err) {
      console.error('❌ Failed to fetch stats:', err);
      // Fallback to local calculation
      calculateLocalStats();
    }
  };

  // Calculate stats locally as fallback
  const calculateLocalStats = () => {
    const total = organizations.length;
    const approved = organizations.filter(o => o.status === 'approved').length;
    const pending = organizations.filter(o => o.status === 'pending').length;
    const rejected = organizations.filter(o => o.status === 'rejected').length;
    
    // Calculate by type - ensure it's an array format
    const byTypeObj = {};
    organizations.forEach(org => {
      const type = org.organizationType || 'Unknown';
      byTypeObj[type] = (byTypeObj[type] || 0) + 1;
    });
    
    // Convert to array format to match backend response
    const byType = Object.entries(byTypeObj).map(([_id, count]) => ({ _id, count }));

    // Recent submissions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSubmissions = organizations.filter(
      o => new Date(o.createdAt) > sevenDaysAgo
    ).length;

    setStats({ total, approved, pending, rejected, byType, recentSubmissions });
  };

  // ✅ SUBMIT REVIEW - Using correct endpoint
  const handleReview = async () => {
    if (!reviewForm.status || !reviewForm.reviewerName) {
      alert('Please fill in all required fields (Status and Your Name)');
      return;
    }

    if (reviewForm.status === 'rejected' && !reviewForm.reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmittingReview(true);
    try {
      console.log('📝 Submitting review for organization:', selectedOrg._id);
      
      const response = await api.put(
        `/finance/organizations/${selectedOrg._id}/review`,
        {
          status: reviewForm.status,
          reviewNotes: reviewForm.reason,
          reviewerName: reviewForm.reviewerName
        }
      );

      console.log('📥 Review response:', response.data);

      if (response.data?.success) {
        console.log('✅ Review submitted successfully');
        
        // Update local state
        setOrganizations(prev =>
          prev.map(org =>
            org._id === selectedOrg._id
              ? { 
                  ...org, 
                  status: reviewForm.status, 
                  reviewNotes: reviewForm.reason,
                  reviewedBy: reviewForm.reviewerName,
                  reviewedAt: new Date().toISOString()
                }
              : org
          )
        );

        setShowReviewModal(false);
        setReviewForm({ status: '', reason: '', reviewerName: '' });
        setSelectedOrg(null);
        
        // Refresh stats
        fetchStats();
        
        alert(`✅ Organization ${reviewForm.status} successfully!`);
      } else {
        throw new Error(response.data?.message || 'Review submission failed');
      }
    } catch (err) {
      console.error('❌ Review submission failed:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit review';
      alert('Failed to submit review: ' + errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ✅ DELETE ORGANIZATION - Using correct endpoint
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('🗑️ Deleting organization:', id);
      
      const response = await api.delete(`/finance/organizations/${id}`);
      
      console.log('📥 Delete response:', response.data);

      if (response.data?.success || response.status === 200) {
        console.log('✅ Organization deleted successfully');
        
        setOrganizations(prev => prev.filter(org => org._id !== id));
        alert('✅ Organization deleted successfully!');
        
        // Refresh stats
        fetchStats();
      } else {
        throw new Error(response.data?.message || 'Delete failed');
      }
    } catch (err) {
      console.error('❌ Delete failed:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete organization';
      alert('Failed to delete organization: ' + errorMsg);
    }
  };

  // ✅ STAT CARD COMPONENT
  const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <p className="text-white/80 font-medium mb-1 text-sm">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
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
    const c = config[status] || config.pending;
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ GET UNIQUE ORGANIZATION TYPES
  const uniqueTypes = [...new Set(organizations.map(org => org.organizationType).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Funding Schemes Management</h1>
              <p className="text-blue-100 text-sm mt-1">Manage and review organization submissions</p>
            </div>
            <button
              onClick={() => {
                fetchOrganizations();
                fetchStats();
              }}
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
              { id: 'organizations', label: '🏢 Organizations' },
              { id: 'analytics', label: '📈 Analytics' }
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
              onClick={() => {
                fetchOrganizations();
                fetchStats();
              }}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
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
              <StatCard 
                icon={Users} 
                label="Total Organizations" 
                value={stats.total} 
                color="from-blue-500 to-blue-600"
                subtitle="All submissions"
              />
              <StatCard 
                icon={CheckCircle} 
                label="Approved" 
                value={stats.approved} 
                color="from-green-500 to-green-600"
                subtitle="Active organizations"
              />
              <StatCard 
                icon={Clock} 
                label="Pending Review" 
                value={stats.pending} 
                color="from-amber-500 to-amber-600"
                subtitle="Awaiting action"
              />
              <StatCard 
                icon={XCircle} 
                label="Rejected" 
                value={stats.rejected} 
                color="from-red-500 to-red-600"
                subtitle="Declined applications"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Submissions */}
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  Recent Submissions
                </h2>
                {organizations.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No organizations found</p>
                ) : (
                  <div className="space-y-4">
                    {organizations
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)
                      .map((org) => (
                        <div
                          key={org._id}
                          className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedOrg(org);
                            setShowDetailsModal(true);
                          }}
                        >
                          <div className="flex-1">
                            <p className="text-white font-semibold">{org.organizationName}</p>
                            <p className="text-slate-400 text-sm">{org.organizationType}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              Submitted {formatDate(org.createdAt)}
                            </p>
                          </div>
                          {getStatusBadge(org.status)}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Organizations by Type */}
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Building className="w-6 h-6" />
                  Organizations by Type
                </h2>
                {(() => {
                  const byTypeData = stats.byType || [];
                  
                  // Handle if byType is an array of objects [{_id, count}]
                  let typeEntries = [];
                  if (Array.isArray(byTypeData)) {
                    typeEntries = byTypeData.map(item => [item._id || 'Unknown', item.count || 0]);
                  } else {
                    typeEntries = Object.entries(byTypeData);
                  }
                  
                  if (typeEntries.length === 0) {
                    return <p className="text-slate-400 text-center py-8">No data available</p>;
                  }
                  
                  return (
                    <div className="space-y-3">
                      {typeEntries
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <span className="text-slate-300 font-medium">{type}</span>
                            <span className="text-white font-bold text-lg">{count}</span>
                          </div>
                        ))}
                    </div>
                  );
                })()}
              </div>
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
                  placeholder="Search organizations, email, contact person..."
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

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 rounded-lg border-2 border-slate-700 focus:border-blue-500 outline-none bg-slate-800 text-white font-medium transition-all"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-slate-400">
                Showing <span className="text-white font-bold">{filteredOrgs.length}</span> of{' '}
                <span className="text-white font-bold">{organizations.length}</span> organizations
              </p>
            </div>

            {/* Organizations Table */}
            {loading ? (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-12 flex items-center justify-center">
                <Loader className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="ml-4 text-slate-300">Loading organizations...</p>
              </div>
            ) : filteredOrgs.length === 0 ? (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                <p className="text-slate-400 text-lg">No organizations found</p>
                {searchTerm || filterStatus !== 'all' || filterType !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                      setFilterType('all');
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700 border-b border-slate-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-white font-semibold">Organization</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Type</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Location</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-white font-semibold">Submitted</th>
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
                            <p className="text-slate-400 text-sm flex items-center gap-1 mt-1">
                              <Mail size={12} />
                              {org.email}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{org.organizationType}</td>
                          <td className="px-6 py-4">
                            <p className="text-slate-300">{org.address?.city || 'N/A'}</p>
                            <p className="text-slate-500 text-sm">{org.address?.country || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">{getStatusBadge(org.status)}</td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {formatDate(org.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedOrg(org);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all"
                                title="View Details"
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
                                  title="Review"
                                >
                                  <Send size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(org._id)}
                                className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Approval Rate
                </h3>
                <p className="text-4xl font-bold text-green-400">
                  {stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0}%
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {stats.approved} out of {stats.total} approved
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Rate
                </h3>
                <p className="text-4xl font-bold text-amber-400">
                  {stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {stats.pending} awaiting review
                </p>
              </div>

              <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Rejection Rate
                </h3>
                <p className="text-4xl font-bold text-red-400">
                  {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}%
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  {stats.rejected} declined
                </p>
              </div>
            </div>

            {/* Loan Types Distribution */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Popular Loan Types
              </h2>
              <div className="space-y-3">
                {(() => {
                  const loanTypeCounts = {};
                  organizations.forEach(org => {
                    org.loanTypes?.forEach(type => {
                      loanTypeCounts[type] = (loanTypeCounts[type] || 0) + 1;
                    });
                  });
                  
                  const entries = Object.entries(loanTypeCounts);
                  
                  if (entries.length === 0) {
                    return <p className="text-slate-400 text-center py-8">No loan type data available</p>;
                  }
                  
                  return entries
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-700 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300 font-medium">{type}</span>
                            <span className="text-white font-bold">{count}</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min((count / organizations.length) * 100 * 3, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            </div>
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
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedOrg.organizationName}</h2>
                <p className="text-blue-100 text-sm">{selectedOrg.organizationType}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <span className="text-slate-300 font-medium">Current Status</span>
                {getStatusBadge(selectedOrg.status)}
              </div>

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Organization Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Registration Number</p>
                    <p className="text-white font-semibold">{selectedOrg.registrationNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Established Year</p>
                    <p className="text-white font-semibold">{selectedOrg.establishedYear || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Contact Person</p>
                    <p className="text-white font-semibold">{selectedOrg.contactPerson}</p>
                    {selectedOrg.designation && (
                      <p className="text-slate-400 text-xs mt-1">{selectedOrg.designation}</p>
                    )}
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Email</p>
                    <p className="text-white font-semibold flex items-center gap-2 break-all">
                      <Mail size={14} />
                      {selectedOrg.email}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Phone</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Phone size={14} />
                      {selectedOrg.phone}
                    </p>
                  </div>
                  {selectedOrg.website && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm font-medium mb-1">Website</p>
                      <a 
                        href={selectedOrg.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 font-semibold flex items-center gap-2 hover:text-blue-300 break-all"
                      >
                        <Globe size={14} />
                        {selectedOrg.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </h3>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <p className="text-white">
                    {selectedOrg.address?.street && `${selectedOrg.address.street}, `}
                    {selectedOrg.address?.city && `${selectedOrg.address.city}, `}
                    {selectedOrg.address?.state && `${selectedOrg.address.state}, `}
                    {selectedOrg.address?.country || 'N/A'}
                    {selectedOrg.address?.zipCode && ` - ${selectedOrg.address.zipCode}`}
                  </p>
                </div>
              </div>

              {/* Loan Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Loan Information
                </h3>
                
                {selectedOrg.loanTypes && selectedOrg.loanTypes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-slate-400 text-sm font-medium mb-2">Loan Types Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrg.loanTypes.map((type) => (
                        <span 
                          key={type} 
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedOrg.minLoanAmount && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm font-medium mb-1">Min Loan Amount</p>
                      <p className="text-white font-semibold">₹{Number(selectedOrg.minLoanAmount).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedOrg.maxLoanAmount && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm font-medium mb-1">Max Loan Amount</p>
                      <p className="text-white font-semibold">₹{Number(selectedOrg.maxLoanAmount).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedOrg.interestRateRange && (
                    <div className="bg-slate-700 p-4 rounded-lg col-span-2">
                      <p className="text-slate-400 text-sm font-medium mb-1">Interest Rate Range</p>
                      <p className="text-white font-semibold">{selectedOrg.interestRateRange}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              {(selectedOrg.description || selectedOrg.specialPrograms || selectedOrg.eligibilityCriteria) && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    {selectedOrg.description && (
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm font-medium mb-2">Description</p>
                        <p className="text-slate-200 text-sm">{selectedOrg.description}</p>
                      </div>
                    )}
                    {selectedOrg.specialPrograms && (
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm font-medium mb-2">Special Programs</p>
                        <p className="text-slate-200 text-sm">{selectedOrg.specialPrograms}</p>
                      </div>
                    )}
                    {selectedOrg.eligibilityCriteria && (
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <p className="text-slate-400 text-sm font-medium mb-2">Eligibility Criteria</p>
                        <p className="text-slate-200 text-sm">{selectedOrg.eligibilityCriteria}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submission Info */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Submission Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm font-medium mb-1">Submitted On</p>
                    <p className="text-white font-semibold">{formatDate(selectedOrg.createdAt)}</p>
                  </div>
                  {selectedOrg.reviewedAt && (
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <p className="text-slate-400 text-sm font-medium mb-1">Reviewed On</p>
                      <p className="text-white font-semibold">{formatDate(selectedOrg.reviewedAt)}</p>
                    </div>
                  )}
                  {selectedOrg.reviewedBy && (
                    <div className="bg-slate-700 p-4 rounded-lg col-span-2">
                      <p className="text-slate-400 text-sm font-medium mb-1">Reviewed By</p>
                      <p className="text-white font-semibold">{selectedOrg.reviewedBy}</p>
                    </div>
                  )}
                  {selectedOrg.reviewNotes && (
                    <div className="bg-slate-700 p-4 rounded-lg col-span-2">
                      <p className="text-slate-400 text-sm font-medium mb-1">Review Notes</p>
                      <p className="text-slate-200 text-sm">{selectedOrg.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {selectedOrg.status === 'pending' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setReviewForm({ status: '', reason: '', reviewerName: '' });
                    setShowReviewModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Review This Organization
                </button>
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
                <p className="text-slate-500 text-xs mt-1">{selectedOrg.email}</p>
              </div>

              <div>
                <p className="text-white font-bold mb-3">Decision *</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-green-500/10 transition-all">
                    <input
                      type="radio"
                      value="approved"
                      checked={reviewForm.status === 'approved'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">Approve</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-red-500/10 transition-all">
                    <input
                      type="radio"
                      value="rejected"
                      checked={reviewForm.status === 'rejected'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">Reject</span>
                  </label>
                </div>
              </div>

              {reviewForm.status === 'rejected' && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={reviewForm.reason}
                    onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}
                    placeholder="Please provide a clear reason for rejection..."
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition-all"
                    rows="4"
                  />
                </div>
              )}

              {reviewForm.status === 'approved' && (
                <div>
                  <label className="block text-white font-bold mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={reviewForm.reason}
                    onChange={(e) => setReviewForm({ ...reviewForm, reason: e.target.value })}
                    placeholder="Add any notes or comments..."
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white outline-none focus:border-blue-500 transition-all"
                    rows="3"
                  />
                </div>
              )}

              <div>
                <label className="block text-white font-bold mb-2">Your Name *</label>
                <input
                  type="text"
                  value={reviewForm.reviewerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })}
                  placeholder="Enter your full name"
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Review
                    </>
                  )}
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