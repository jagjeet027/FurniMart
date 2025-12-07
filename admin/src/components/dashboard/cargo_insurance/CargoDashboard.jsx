// Updated CargoDashboard.jsx - With Real API Integration

import React, { useState, useEffect } from 'react';
import {
  Search, Building, Clock, DollarSign, Activity, BarChart3, PieChart, Settings,
  Bell, Eye, Trash2, ExternalLink, X, TrendingUp, Download
} from 'lucide-react';
import api from '../../../axios/axiosInstance';

function CargoDashboard() {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [adminFilters, setAdminFilters] = useState({
    status: "all",
    paymentStatus: "all",
    search: ""
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch dashboard statistics
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/dashboard/stats');
      setDashboardStats(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending companies
  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/companies/pending', {
        params: {
          search: adminFilters.search,
          sortBy: 'newest'
        }
      });
      setCompanies(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pending companies');
      console.error('Error fetching pending companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all companies
  const fetchAllCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/companies', {
        params: {
          status: adminFilters.status !== 'all' ? adminFilters.status : undefined,
          paymentStatus: adminFilters.paymentStatus !== 'all' ? adminFilters.paymentStatus : undefined,
          search: adminFilters.search,
          page,
          limit: 10
        }
      });
      setCompanies(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch companies');
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/analytics/data');
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/payments', {
        params: { page, limit: 10 }
      });
      setPayments(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch payments');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipments
  const fetchShipments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/shipments', {
        params: { page, limit: 10 }
      });
      setShipments(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch shipments');
      console.error('Error fetching shipments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quotes
  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cargo/admin/quotes', {
        params: { page, limit: 10 }
      });
      setQuotes(response.data.data);
      setTotalPages(response.data.pages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch quotes');
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setAdminTab(tabId);
    setPage(1);

    switch (tabId) {
      case 'dashboard':
        fetchDashboardStats();
        break;
      case 'pending':
        fetchPendingCompanies();
        break;
      case 'companies':
        fetchAllCompanies();
        break;
      case 'analytics':
        fetchAnalytics();
        break;
      case 'payments':
        fetchPayments();
        break;
      case 'shipments':
        fetchShipments();
        break;
      case 'quotes':
        fetchQuotes();
        break;
      default:
        break;
    }
  };

  // Handle approve company
  const handleApproveCompany = async (companyId) => {
    try {
      setLoading(true);
      await api.post(`/cargo/admin/companies/${companyId}/approve`);
      
      // Refresh data
      if (adminTab === 'pending') {
        fetchPendingCompanies();
      } else {
        fetchAllCompanies();
      }
      
      setSelectedCompany(null);
      alert('Company approved successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve company');
    } finally {
      setLoading(false);
    }
  };

  // Handle reject company
  const handleRejectCompany = async (companyId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      setLoading(true);
      await api.post(`/cargo/admin/companies/${companyId}/reject`, { reason });
      
      // Refresh data
      if (adminTab === 'pending') {
        fetchPendingCompanies();
      } else {
        fetchAllCompanies();
      }
      
      setSelectedCompany(null);
      alert('Company rejected successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject company');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete company
  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;

    try {
      setLoading(true);
      await api.delete(`/cargo/admin/companies/${companyId}`);
      
      // Refresh data
      fetchAllCompanies();
      alert('Company deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete company');
    } finally {
      setLoading(false);
    }
  };

  // Export data
  const handleExportData = async () => {
    try {
      const response = await api.get('/cargo/admin/companies/export/data', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'companies_data.csv');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (err) {
      alert('Failed to export data');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg hover:scale-105 hover:-translate-y-1 transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Cargo Insurance Admin</h1>
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "pending", label: "Pending Requests", icon: Clock, badge: dashboardStats?.pendingCompanies },
              { id: "companies", label: "All Companies", icon: Building },
              { id: "payments", label: "Payments", icon: DollarSign },
              { id: "shipments", label: "Shipments", icon: Activity },
              { id: "quotes", label: "Quotes", icon: TrendingUp },
              { id: "analytics", label: "Analytics", icon: PieChart },
              { id: "settings", label: "Settings", icon: Settings }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  adminTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg m-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {adminTab === "dashboard" && dashboardStats && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-gray-400">Monitor your platform's performance</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Total Companies" 
                  value={dashboardStats.totalCompanies} 
                  icon={Building} 
                  color="bg-blue-600" 
                />
                <StatCard 
                  title="Pending Approvals" 
                  value={dashboardStats.pendingCompanies} 
                  icon={Clock} 
                  color="bg-yellow-600" 
                />
                <StatCard 
                  title="Total Revenue" 
                  value={`₹${(dashboardStats.totalRevenue / 1000).toFixed(0)}K`} 
                  icon={DollarSign} 
                  color="bg-green-600" 
                />
                <StatCard 
                  title="Total Clicks" 
                  value={dashboardStats.totalClicks} 
                  icon={Activity} 
                  color="bg-purple-600" 
                />
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Submissions</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dashboardStats.recentSubmissions?.map((company) => (
                    <div 
                      key={company._id}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-white">{company.name}</p>
                        <p className="text-sm text-gray-400">{company.email}</p>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-3 py-1 rounded-full ${
                          company.status === 'approved' ? 'bg-green-600' :
                          company.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                        } text-white`}>
                          {company.status}
                        </span>
                        <span className="text-gray-300">{company.views} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {adminTab === "pending" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Pending Requests</h2>
                  <p className="text-gray-400">{companies.length} companies awaiting approval</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input 
                    type="text" 
                    placeholder="Search companies..." 
                    className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={adminFilters.search} 
                    onChange={(e) => setAdminFilters({...adminFilters, search: e.target.value})} 
                  />
                </div>
              </div>
              
              {companies.length === 0 ? (
                <div className="bg-gray-900 rounded-xl p-12 text-center border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3>
                  <p className="text-gray-400">All company requests have been reviewed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <div 
                      key={company._id}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                        <p className="text-sm text-gray-400">{company.email}</p>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contact:</span>
                          <span className="text-white">{company.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Coverage:</span>
                          <span className="text-white">{company.coverage}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => setSelectedCompany(company)} 
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          <Eye className="h-4 w-4 inline mr-2" />
                          View
                        </button>
                        <button 
                          onClick={() => handleApproveCompany(company._id)} 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectCompany(company._id)} 
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminTab === "companies" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">All Companies</h2>
                  <p className="text-gray-400">{companies.length} companies</p>
                </div>
                <select 
                  value={adminFilters.status} 
                  onChange={(e) => {
                    setAdminFilters({...adminFilters, status: e.target.value});
                    setPage(1);
                  }} 
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Coverage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Stats</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {companies.map((company) => (
                      <tr key={company._id} className="hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">{company.name}</div>
                          <div className="text-sm text-gray-400">{company.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            company.status === 'approved' ? 'bg-green-600 text-white' :
                            company.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {company.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white">{company.coverage}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          <div>{company.views} views</div>
                          <div>{company.clicks} clicks</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteCompany(company._id)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded ${
                        page === p
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Company Details Modal */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
          >
            <div className="p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Company Details</h3>
              <button 
                onClick={() => setSelectedCompany(null)} 
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                  <p className="text-white font-semibold">{selectedCompany.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    selectedCompany.status === 'approved' ? 'bg-green-600 text-white' :
                    selectedCompany.status === 'pending' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {selectedCompany.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <p className="text-white">{selectedCompany.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
                  <p className="text-white">{selectedCompany.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                  <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                    <ExternalLink className="h-4 w-4 inline mr-1" />
                    Visit
                  </a>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Coverage</label>
                  <p className="text-white">{selectedCompany.coverage}</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-white mb-3">Submission Details</h4>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted by:</span>
                    <span className="text-white">{selectedCompany.submittedBy?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white text-sm">{selectedCompany.submittedBy?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Submitted Date:</span>
                    <span className="text-white">{new Date(selectedCompany.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-700 flex space-x-3">
              {selectedCompany.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleApproveCompany(selectedCompany._id)} 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleRejectCompany(selectedCompany._id)} 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
              <button 
                onClick={() => setSelectedCompany(null)} 
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CargoDashboard;