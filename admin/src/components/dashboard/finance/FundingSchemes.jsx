import React, { useState } from 'react';
import {
  BarChart3,
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
  DollarSign,
  Settings,
  X,
  Send,
  Download
} from 'lucide-react';

const FundingSchmes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orgs, setOrgs] = useState([
    {
      id: 1,
      organizationName: 'ABC Finance Bank',
      organizationType: 'Bank',
      email: 'contact@abcbank.com',
      phone: '+91-98765-43210',
      country: 'India',
      status: 'approved',
      approvedAt: '2024-01-15',
      loanTypes: ['Personal', 'Business'],
      minLoanAmount: 100000,
      maxLoanAmount: 50000000,
      interestRateRange: '8.5% - 12%',
      submittedAt: '2024-01-10',
      reviewedBy: 'Admin User'
    },
    {
      id: 2,
      organizationName: 'Quick Credit NBFC',
      organizationType: 'NBFC',
      email: 'support@quickcredit.com',
      phone: '+91-87654-32109',
      country: 'India',
      status: 'pending',
      loanTypes: ['Personal'],
      minLoanAmount: 50000,
      maxLoanAmount: 5000000,
      interestRateRange: '12% - 18%',
      submittedAt: '2024-01-20'
    },
    {
      id: 3,
      organizationName: 'FinTech Innovations',
      organizationType: 'Fintech',
      email: 'hello@fintech.com',
      phone: '+91-99999-88888',
      country: 'India',
      status: 'rejected',
      rejectedAt: '2024-01-18',
      rejectionReason: 'Incomplete documentation',
      loanTypes: ['Personal'],
      submittedAt: '2024-01-12'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ decision: '', reason: '' });

  const stats = {
    total: orgs.length,
    approved: orgs.filter(o => o.status === 'approved').length,
    pending: orgs.filter(o => o.status === 'pending').length,
    rejected: orgs.filter(o => o.status === 'rejected').length
  };

  const filteredOrgs = orgs.filter(org => {
    const matchesSearch = org.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || org.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReview = () => {
    if (!reviewForm.decision) {
      alert('Please select a decision');
      return;
    }

    const updatedOrgs = orgs.map(org => {
      if (org.id === selectedOrg.id) {
        if (reviewForm.decision === 'approve') {
          return {
            ...org,
            status: 'approved',
            approvedAt: new Date().toISOString().split('T')[0],
            reviewedBy: 'Admin User'
          };
        } else {
          return {
            ...org,
            status: 'rejected',
            rejectedAt: new Date().toISOString().split('T')[0],
            rejectionReason: reviewForm.reason,
            reviewedBy: 'Admin User'
          };
        }
      }
      return org;
    });

    setOrgs(updatedOrgs);
    setShowReviewModal(false);
    setReviewForm({ decision: '', reason: '' });
    alert('✅ Status updated successfully!');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      setOrgs(orgs.filter(org => org.id !== id));
      alert('✅ Deleted successfully!');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-40" />
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const config = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    const c = config[status];
    const Icon = c.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${c.bg} ${c.text} font-semibold text-sm`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl sticky top-0 z-40 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'organizations', label: '🏢 Organizations' },
              { id: 'settings', label: '⚙️ Settings' }
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
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Users} label="Total Organizations" value={stats.total} color="from-blue-500 to-blue-600" />
              <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="from-green-500 to-green-600" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} color="from-amber-500 to-amber-600" />
              <StatCard icon={XCircle} label="Rejected" value={stats.rejected} color="from-red-500 to-red-600" />
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Download size={20} />
                  Export Report
                </button>
                <button className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <RefreshCw size={20} />
                  Refresh Data
                </button>
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-4 font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Mail size={20} />
                  Send Email
                </button>
                <button className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg p-4 font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Settings size={20} />
                  System Settings
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
              <div className="space-y-4">
                {orgs.slice(-3).map((org, idx) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-all"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold">{org.organizationName}</p>
                      <p className="text-slate-400 text-sm">Submitted on {org.submittedAt}</p>
                    </div>
                    {getStatusBadge(org.status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="space-y-6 animate-fade-in">
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
                    {filteredOrgs.map((org, idx) => (
                      <tr
                        key={org.id}
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
                            className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all transform hover:scale-110"
                          >
                            <Eye size={18} />
                          </button>
                          {org.status === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedOrg(org);
                                setShowReviewModal(true);
                              }}
                              className="p-2 bg-amber-600/20 text-amber-400 rounded-lg hover:bg-amber-600/40 transition-all transform hover:scale-110"
                            >
                              <Send size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(org.id)}
                            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all transform hover:scale-110"
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
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8 space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>

            <div className="space-y-4">
              {[
                { title: 'Email Notifications', desc: 'Send email to orgs when status changes' },
                { title: 'Auto-Approval', desc: 'Automatically approve verified organizations' },
                { title: 'Data Backup', desc: 'Daily backup of organization data' },
                { title: 'Audit Logging', desc: 'Log all admin activities' }
              ].map((setting, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-semibold">{setting.title}</p>
                    <p className="text-slate-400 text-sm">{setting.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-green-600 rounded-full cursor-pointer transition-all hover:bg-green-500"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 animate-scale-in"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{selectedOrg.organizationName}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all transform hover:scale-110"
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
                  <p className="text-slate-400 text-sm font-medium mb-1">Loan Amount</p>
                  <p className="text-white font-semibold flex items-center gap-2"><DollarSign size={16} /> ₹{selectedOrg.minLoanAmount?.toLocaleString()} - ₹{selectedOrg.maxLoanAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-medium mb-1">Interest Rate</p>
                  <p className="text-white font-semibold">{selectedOrg.interestRateRange}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrg && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setShowReviewModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700 animate-scale-in"
          >
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Review Application</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all transform hover:scale-110"
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
                      value="approve"
                      checked={reviewForm.decision === 'approve'}
                      onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}
                      className="w-5 h-5"
                    />
                    <span className="text-white font-semibold">✅ Approve</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-slate-600 rounded-lg cursor-pointer hover:bg-red-500/10 transition-all">
                    <input
                      type="radio"
                      value="reject"
                      checked={reviewForm.decision === 'reject'}
                      onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}
                      className="w-5 h-5"
                    />
                    <span className="text-white font-semibold">❌ Reject</span>
                  </label>
                </div>
              </div>

              {reviewForm.decision === 'reject' && (
                <div className="animate-slide-down">
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

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-slate-600 text-white rounded-lg hover:border-slate-500 transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FundingSchmes;