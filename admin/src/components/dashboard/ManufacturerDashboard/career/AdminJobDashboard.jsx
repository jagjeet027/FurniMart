import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Building2,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  User,
  Upload,
  Save,
  X,
  TrendingUp,
  FileText,
  Eye,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminJobDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    departmentStats: [],
    urgencyStats: [],
    locationStats: []
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(8);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api/careers';

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const urgencyLevels = ['High', 'Urgent', 'Hot', 'New', 'Featured'];
  const remoteOptions = ['No', 'Hybrid', 'Full Remote'];

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    salary: '',
    experience: '',
    urgency: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    tags: [''],
    remoteOptions: 'No',
    applicationDeadline: ''
  });

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { department: filterDepartment })
      });

      const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics from API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/stats`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to fetch statistics.');
    }
  };

  // Fetch departments for filter dropdown
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
    fetchStats();
    fetchDepartments();
  }, [currentPage, searchTerm, filterDepartment]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Clean up array fields by removing empty strings
      const cleanedData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: formData.benefits.filter(ben => ben.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== '')
      };

      const url = editingJob 
        ? `${API_BASE_URL}/jobs/${editingJob._id}` 
        : `${API_BASE_URL}/jobs`;
      
      const method = editingJob ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save job');
      }

      const result = await response.json();
      setSuccess(editingJob ? 'Job updated successfully!' : 'Job created successfully!');
      
      await fetchJobs();
      await fetchStats();
      resetForm();
      setShowCreateForm(false);
      setEditingJob(null);
    } catch (error) {
      console.error('Error saving job:', error);
      setError(error.message || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      type: job.type || '',
      salary: job.salary || '',
      experience: job.experience || '',
      urgency: job.urgency || '',
      description: job.description || '',
      requirements: job.requirements?.length ? job.requirements : [''],
      responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
      benefits: job.benefits?.length ? job.benefits : [''],
      tags: job.tags?.length ? job.tags : [''],
      remoteOptions: job.remoteOptions || 'No',
      applicationDeadline: job.applicationDeadline ? 
        new Date(job.applicationDeadline).toISOString().split('T')[0] : ''
    });
    setEditingJob(job);
    setShowCreateForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setError('');
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete job');
        }

        setSuccess('Job deleted successfully!');
        await fetchJobs();
        await fetchStats();
      } catch (error) {
        console.error('Error deleting job:', error);
        setError(error.message || 'Failed to delete job');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      type: '',
      salary: '',
      experience: '',
      urgency: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      tags: [''],
      remoteOptions: 'No',
      applicationDeadline: ''
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const StatCard = ({ icon, title, value, gradient, trend, subtitle }) => (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all duration-500 group`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
              {icon}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  // Alert component for success/error messages
  const Alert = ({ type, message, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="ml-4">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Alerts */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
          />
        )}
        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              Job Management Dashboard
            </h1>
            <p className="text-slate-400 mt-2">Manage job postings and track recruitment metrics</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingJob(null);
              setShowCreateForm(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-cyan-500/25"
          >
            <Plus className="w-5 h-5" />
            Create New Job
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase className="w-6 h-6 text-white" />}
            title="Total Jobs Posted"
            value={stats.totalJobs || 0}
            gradient="from-cyan-500 to-blue-600"
            trend={true}
            subtitle="Active listings"
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Total Applications"
            value={stats.totalApplications || 0}
            gradient="from-green-500 to-emerald-600"
            trend={true}
            subtitle="All applications"
          />
          <StatCard
            icon={<Building2 className="w-6 h-6 text-white" />}
            title="Departments"
            value={stats.departmentStats?.length || 0}
            gradient="from-purple-500 to-pink-600"
            subtitle="Active departments"
          />
          <StatCard
            icon={<Target className="w-6 h-6 text-white" />}
            title="Locations"
            value={stats.locationStats?.length || 0}
            gradient="from-orange-500 to-red-600"
            subtitle="Job locations"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 text-sm">
                {jobs.length} jobs found
              </span>
            </div>
          </div>
        </div>

        {/* Job Creation/Edit Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingJob ? 'Edit Job' : 'Create New Job'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="e.g. Senior Full Stack Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Department *
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.length > 0 ? departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      )) : [
                        'Technology', 'Sales', 'Quality Assurance', 'Analytics', 
                        'Customer Relations', 'Design', 'Marketing', 'Finance', 'Operations'
                      ].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="e.g. Gurugram, India"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Job Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select Type</option>
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Remote Options
                    </label>
                    <select
                      value={formData.remoteOptions}
                      onChange={(e) => handleInputChange('remoteOptions', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      {remoteOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Salary *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="e.g. ₹15-25 LPA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Experience Level *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="e.g. 3-5 years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Urgency Level
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                      <option value="">Select Urgency</option>
                      {urgencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Detailed job description..."
                  />
                </div>

                {/* Dynamic Arrays */}
                {[
                  { field: 'requirements', label: 'Requirements', placeholder: 'Add requirement...' },
                  { field: 'responsibilities', label: 'Responsibilities', placeholder: 'Add responsibility...' },
                  { field: 'benefits', label: 'Benefits', placeholder: 'Add benefit...' },
                  { field: 'tags', label: 'Skills/Tags', placeholder: 'Add skill/tag...' }
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-slate-300">
                        {label}
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayField(field)}
                        className="flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData[field].map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayInputChange(field, index, e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                            placeholder={placeholder}
                          />
                          {formData[field].length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayField(field, index)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-cyan-500/25"
                  >
                    <Save className="w-5 h-5" />
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-xl font-semibold text-white">Job Listings</h3>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No jobs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="text-left p-4 text-slate-300 font-medium">Job Details</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Department</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Type & Location</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Salary</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Applications</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Status</th>
                      <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job._id} className="border-t border-slate-700 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <h4 className="text-white font-medium mb-1">{job.title}</h4>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-400 text-sm">
                                {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
                              </span>
                              {job.urgency && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.urgency === 'Urgent' ? 'bg-red-500/20 text-red-300' :
                                  job.urgency === 'Hot' ? 'bg-orange-500/20 text-orange-300' :
                                  job.urgency === 'High' ? 'bg-purple-500/20 text-purple-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {job.urgency}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-slate-300">{job.department}</span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-300">
                            <div className="flex items-center gap-1 mb-1">
                              <Clock className="w-3 h-3" />
                              {job.type}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </div>
                            {job.remoteOptions !== 'No' && (
                              <span className="text-cyan-400 text-xs">{job.remoteOptions}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-green-400 font-medium">{job.salary}</span>
                          <div className="text-xs text-slate-400">{job.experience}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300">{job.applications?.length || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">
                              {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(job)}
                              className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:bg-slate-500/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-cyan-500 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Department Stats */}
        {stats.departmentStats && stats.departmentStats.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Jobs by Department</h3>
              <div className="space-y-3">
                {stats.departmentStats.map((dept, index) => (
                  <div key={dept._id} className="flex items-center justify-between">
                    <span className="text-slate-300">{dept._id}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${(dept.count / Math.max(...stats.departmentStats.map(d => d.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8 text-right">{dept.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Jobs by Location</h3>
              <div className="space-y-3">
                {stats.locationStats?.slice(0, 6).map((location, index) => (
                  <div key={location._id} className="flex items-center justify-between">
                    <span className="text-slate-300">{location._id}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{ 
                            width: `${(location.count / Math.max(...stats.locationStats.map(l => l.count))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-8 text-right">{location.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobDashboard;