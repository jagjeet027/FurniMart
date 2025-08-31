import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Users, 
  Briefcase,
  TrendingUp,
  Zap,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  Award,
  Rocket
} from "lucide-react";

const ModernStaffHiring = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    location: '',
    experience: '',
    page: 1,
    limit: 6
  });
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const API_BASE_URL = 'http://localhost:5000/api/careers';

  // Navigation handlers
  const handleIndividualRegister = () => {
    navigate('/register/individual-applicant');
  };

  const handleOrganizationRegister = () => {
    navigate('/register/organization-applicant');
  };

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.experience) queryParams.append('experience', filters.experience);
      queryParams.append('page', filters.page);
      queryParams.append('limit', filters.limit);

      const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setTotalJobs(data.totalJobs || 0);
      setTotalPages(data.totalPages || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
      // Set empty state on error
      setJobs([]);
      setTotalJobs(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for filter
  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  // Fetch job statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/jobs/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(null);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Competitive';
    if (typeof salary === 'object') {
      const min = salary.min || '';
      const max = salary.max || '';
      const currency = salary.currency || '₹';
      if (min && max) {
        return `${currency}${min} - ${currency}${max} LPA`;
      } else if (min) {
        return `${currency}${min}+ LPA`;
      } else if (max) {
        return `Up to ${currency}${max} LPA`;
      }
    }
    return salary;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyStyles = {
      'Urgent': 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25',
      'Hot': 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/25',
      'New': 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25',
      'High': 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25'
    };
    
    if (urgency && urgencyStyles[urgency]) {
      return (
        <div className={`relative px-3 py-1 text-xs font-bold rounded-full border ${urgencyStyles[urgency]} animate-pulse`}>
          <Zap className="w-3 h-3 inline mr-1" />
          {urgency}
        </div>
      );
    }
    return null;
  };

  const JobCard = ({ job, index }) => (
    <div className={`group relative bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-400/20 animate-fade-in-up`}
         style={{ animationDelay: `${index * 100}ms` }}>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-75 blur transition-opacity duration-500 -z-10"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {job.title}
              </h3>
              {getUrgencyBadge(job.urgency)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Building2 className="w-4 h-4" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Clock className="w-4 h-4" />
                <span>{job.type || job.jobType}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
              <div className="flex items-center gap-1 hover:text-green-300 transition-colors">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{formatSalary(job.salary)}</span>
              </div>
              <div className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <User className="w-4 h-4" />
                <span>{job.experience || job.experienceLevel}</span>
              </div>
              {job.applicationsCount && (
                <div className="flex items-center gap-1 hover:text-purple-300 transition-colors">
                  <Users className="w-4 h-4" />
                  <span>{job.applicationsCount} Applied</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-4 line-clamp-3 group-hover:text-slate-200 transition-colors">
          {job.description}
        </p>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 4).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-slate-700 text-cyan-300 text-xs rounded-full border border-slate-600 hover:border-cyan-400 transition-colors"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 4 && (
              <span className="text-xs text-slate-500">+{job.tags.length - 4} more</span>
            )}
          </div>
        )}

        {(job.postedDate || job.createdAt) && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>Posted {new Date(job.postedDate || job.createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );

  const StatCard = ({ icon, title, value, gradient, delay = 0 }) => (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 hover:border-cyan-400 transition-all duration-500 group animate-fade-in-up`}
         style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-cyan-900">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Career Portal</span>
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-fade-in">
              Shape Your Future
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-300 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
              Discover {totalJobs || 'amazing'} opportunities across cutting-edge departments and join our mission to innovate.
            </p>
          </div>

          {/* Registration Cards */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Individual Registration */}
            <div className="group relative animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 group-hover:border-cyan-400 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-all duration-300">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    Join as Individual
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    Perfect for job seekers, freelancers, and professionals looking to discover their next career opportunity in innovative companies.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30">Resume Upload</span>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30">Job Alerts</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Career Growth</span>
                  </div>
                  
                  <button 
                    onClick={handleIndividualRegister}
                    className="group/btn relative w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Get Started Now</span>
                      <Rocket className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Organization Registration */}
            <div className="group relative animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl blur-xl opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-tilt-reverse"></div>
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 group-hover:border-purple-400 transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-all duration-300">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                    Register Organization
                  </h3>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    For companies, startups, and organizations looking to hire top talent and build exceptional teams from colleges and Universities.
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30">Talent Pool</span>
                    <span className="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-full border border-pink-500/30">Bulk Hiring</span>
                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">Analytics</span>
                  </div>
                  
                  <button 
                    onClick={handleOrganizationRegister}
                    className="group/btn relative w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold transition-all duration-300 hover:from-purple-600 hover:to-pink-700 hover:shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Start Hiring</span>
                      <Target className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {stats && (
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StatCard 
                icon={<Briefcase className="w-6 h-6 text-white" />}
                title="Active Jobs"
                value={stats.totalJobs || totalJobs}
                gradient="from-cyan-500 to-blue-600"
                delay={1200}
              />
              <StatCard 
                icon={<Users className="w-6 h-6 text-white" />}
                title="Total Applications"
                value={stats.totalApplications}
                gradient="from-purple-500 to-pink-600"
                delay={1400}
              />
              <StatCard 
                icon={<Building2 className="w-6 h-6 text-white" />}
                title="Departments"
                value={stats.departmentStats?.length || departments.length || 0}
                gradient="from-green-500 to-emerald-600"
                delay={1600}
              />
            </div>
          )}
        </div>
      </div>

      {/* Job Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            Available Positions
          </h2>
          <p className="text-xl text-slate-400">
            Explore {totalJobs || jobs.length} exciting opportunities across our innovative teams
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="mb-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Search positions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
              />
            </div>
            
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
            />

            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent hover:border-slate-500 transition-all"
            >
              <option value="">All Experience Levels</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Expert Level">Expert Level</option>
            </select>
          </div>
        </div>

        {/* Job Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400 absolute top-0 left-0"></div>
            </div>
          </div>
        ) : error && jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-400 text-lg mb-4">Error: {error}</p>
              <p className="text-red-300 text-sm mb-4">Make sure your backend server is running on port 5000</p>
              <button 
                onClick={fetchJobs}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md mx-auto">
              <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No positions found matching your criteria.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {jobs.map((job, index) => (
                <JobCard key={job._id || job.id} job={job} index={index} />
              ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(filters.page - 2, totalPages - 4)) + i;
                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-xl transition-all border ${
                            filters.page === pageNum
                              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-transparent shadow-lg shadow-cyan-500/25'
                              : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 hover:text-white transition-all border border-slate-600"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

}
export default ModernStaffHiring;