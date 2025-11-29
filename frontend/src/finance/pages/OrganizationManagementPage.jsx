import React, { useState, useEffect } from 'react';
import {
  Building,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    fetchOrganizations();
    fetchStats();
  }, []);

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

      if (sortBy === 'submissionDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredOrganizations(filtered);
  }, [organizations, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizations/submissions');
      if (response.ok) {
        const result = await response.json();
        setOrganizations(result.data || []);
      } else {
        setOrganizations(generateDemoData());
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations(generateDemoData());
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/organizations/stats');
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        // Calculate stats from demo data
        const demo = generateDemoData();
        setStats({
          total: demo.length,
          pending: demo.filter(o => o.status === 'pending').length,
          approved: demo.filter(o => o.status === 'approved').length,
          rejected: demo.filter(o => o.status === 'rejected').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateDemoData = () => [
    {
      id: 1,
      organizationName: "ABC Bank Ltd",
      organizationType: "Bank",
      contactPerson: "John Doe",
      email: "john@abcbank.com",
      phone: "+1-555-0123",
      address: "123 Main St, City, State",
      country: "India",
      submissionDate: "2024-01-15T10:30:00Z",
      status: "pending",
      loanTypes: ["Personal Loan", "Home Loan", "Car Loan"],
      minLoanAmount: 50000,
      maxLoanAmount: 5000000,
      interestRateRange: "8.5% - 15.5%"
    },
    {
      id: 2,
      organizationName: "QuickCredit NBFC",
      organizationType: "NBFC",
      contactPerson: "Jane Smith",
      email: "jane@quickcredit.com",
      phone: "+1-555-0456",
      address: "456 Business Ave, Metro City",
      country: "India",
      submissionDate: "2024-01-10T14:20:00Z",
      status: "approved",
      loanTypes: ["Personal Loan", "Business Loan"],
      minLoanAmount: 25000,
      maxLoanAmount: 2000000,
      interestRateRange: "12% - 18%"
    },
    {
      id: 3,
      organizationName: "Finance Plus Ltd",
      organizationType: "Bank",
      contactPerson: "Mike Johnson",
      email: "mike@financeplus.com",
      phone: "+1-555-0789",
      address: "789 Finance Park, Tech City",
      country: "United States",
      submissionDate: "2024-01-08T09:15:00Z",
      status: "rejected",
      loanTypes: ["Business Loan"],
      minLoanAmount: 100000,
      maxLoanAmount: 10000000,
      interestRateRange: "7% - 12%"
    }
  ];

  const handleReview = (org) => {
    setSelectedOrg(org);
    setReviewData({
      status: org.status === 'pending' ? 'approved' : org.status,
      notes: '',
      reviewerName: 'Admin'
    });
    setShowReviewModal(true);
  };

  const handleViewDetails = (org) => {
    setSelectedOrg(org);
    setShowDetailsModal(true);
  };

  const submitReview = async () => {
    try {
      const response = await fetch(`/api/organizations/submissions/${selectedOrg.id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setOrganizations(prev => 
          prev.map(org => 
            org.id === selectedOrg.id 
              ? { ...org, status: reviewData.status, reviewNotes: reviewData.notes }
              : org
          )
        );
        setShowReviewModal(false);
        fetchStats();
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-3 bg-white/20 rounded-xl backdrop-blur"
              >
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
              whileTap={{ scale: 0.95 }}
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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8"
        >
          {[
            { label: 'Total Applications', value: stats.total, icon: Building, color: 'from-blue-500 to-blue-600', lightColor: 'from-blue-100 to-blue-50' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600', lightColor: 'from-amber-100 to-amber-50' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-green-600', lightColor: 'from-green-100 to-green-50' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', lightColor: 'from-red-100 to-red-50' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`bg-gradient-to-br ${stat.lightColor} rounded-xl p-6 border border-white/50 backdrop-blur-sm hover:border-white/80 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
                    <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`p-4 bg-gradient-to-br ${stat.color} rounded-xl`}
                  >
                    <Icon size={28} className="text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8"
        >
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search by organization name, email, or contact person..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-all text-gray-700"
              />
            </div>

            {/* Filter Selects */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <motion.select
                  whileHover={{ borderColor: '#3b82f6' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all text-gray-700"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </motion.select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Type</label>
                <motion.select
                  whileHover={{ borderColor: '#3b82f6' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all text-gray-700"
                >
                  <option value="all">All Types</option>
                  {organizationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </motion.select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <motion.select
                  whileHover={{ borderColor: '#3b82f6' }}
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all text-gray-700"
                >
                  <option value="submissionDate-desc">Newest First</option>
                  <option value="submissionDate-asc">Oldest First</option>
                  <option value="organizationName-asc">Name A-Z</option>
                  <option value="organizationName-desc">Name Z-A</option>
                </motion.select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Organizations Table/Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredOrganizations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Building size={48} className="text-gray-300" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No organizations found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Organization</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Contact</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Submitted</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrganizations.map((org, idx) => (
                        <motion.tr
                          key={org.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ backgroundColor: '#f0f9ff' }}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-all"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-semibold text-gray-800">{org.organizationName}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin size={14} />
                                {org.country}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                              {org.organizationType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-800">{org.contactPerson}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={14} />
                                {org.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(org.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(org.submissionDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewDetails(org)}
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </motion.button>
                              {org.status === 'pending' && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReview(org)}
                                  className="p-2 hover:bg-green-100 text-green-600 rounded-lg transition-all"
                                  title="Review Application"
                                >
                                  <CheckCircle size={18} />
                                </motion.button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {filteredOrganizations.map((org, idx) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-md border border-gray-100 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{org.organizationName}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {org.country}
                        </p>
                      </div>
                      {getStatusBadge(org.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs font-medium">Type</p>
                        <p className="font-medium text-gray-800">{org.organizationType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-medium">Contact</p>
                        <p className="font-medium text-gray-800">{org.contactPerson}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-xs font-medium mb-1">Email</p>
                      <p className="text-sm text-blue-600 break-all">{org.email}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(org)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        Details
                      </motion.button>
                      {org.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReview(org)}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-600 font-medium rounded-lg hover:bg-green-100 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Review
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Building size={28} className="text-white" />
                  <h2 className="text-2xl font-bold text-white">{selectedOrg.organizationName}</h2>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X size={24} className="text-white" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Organization Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Organization Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Organization Name</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Type</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.organizationType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Status</p>
                      {getStatusBadge(selectedOrg.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Country</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.country}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600 font-medium mb-1">Submitted On</p>
                      <p className="text-gray-800 font-semibold">{formatDate(selectedOrg.submissionDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Contact Person</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Email</p>
                      <p className="text-blue-600 font-semibold break-all">{selectedOrg.email}</p>
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

                {/* Loan Products */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Loan Products</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">Loan Types</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrg.loanTypes?.map((type, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
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
                      <p className="text-sm text-gray-600 font-medium mb-1">Interest Rate Range</p>
                      <p className="text-gray-800 font-semibold">{selectedOrg.interestRateRange}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
                >
                  Close
                </motion.button>
                {selectedOrg.status === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleReview(selectedOrg);
                    }}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Review Application
                  </motion.button>
                )}
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white">Review Application</h2>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X size={24} className="text-white" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="font-bold text-gray-800">{selectedOrg.organizationName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrg.organizationType}</p>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3">Review Decision</label>
                    <div className="space-y-3">
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all"
                      >
                        <input
                          type="radio"
                          value="approved"
                          checked={reviewData.status === 'approved'}
                          onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                          className="w-5 h-5 text-green-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <CheckCircle size={18} className="text-green-600" />
                          <span className="font-medium text-gray-700">Approve Application</span>
                        </div>
                      </motion.label>

                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all"
                      >
                        <input
                          type="radio"
                          value="rejected"
                          checked={reviewData.status === 'rejected'}
                          onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                          className="w-5 h-5 text-red-600 cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <XCircle size={18} className="text-red-600" />
                          <span className="font-medium text-gray-700">Reject Application</span>
                        </div>
                      </motion.label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Reviewer Name</label>
                    <input
                      type="text"
                      value={reviewData.reviewerName}
                      onChange={(e) => setReviewData({...reviewData, reviewerName: e.target.value})}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">Review Notes</label>
                    <textarea
                      value={reviewData.notes}
                      onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                      placeholder="Add any notes or feedback..."
                      rows="4"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex gap-3 rounded-b-2xl border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitReview}
                  disabled={!reviewData.status || !reviewData.reviewerName}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
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