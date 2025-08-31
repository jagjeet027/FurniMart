import React, { useState, useEffect } from 'react';
import { 
  Search, Users, Building2, FileText, TrendingUp, Download, Eye, Calendar, 
  MapPin, Mail, Phone, GraduationCap, Briefcase, ChevronDown, ChevronUp,
  ExternalLink, Award, Code, BookOpen, User, Building, Filter, RefreshCw,
  ArrowUpDown, ChevronLeft, ChevronRight, X, Globe, Star, Loader
} from 'lucide-react';

const ApplicationsDashboard = () => {
  const [activeTab, setActiveTab] = useState('individuals');
  const [searchQuery, setSearchQuery] = useState('');
  const [individuals, setIndividuals] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [sortField, setSortField] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalIndividuals: 0,
    totalOrganizations: 0,
    totalCandidates: 0,
    recentApplications: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    experienceLevel: '',
    organizationType: '',
    status: ''
  });

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const [individualsRes, organizationsRes] = await Promise.all([
        fetch('http://localhost:5000/api/registration/stats/registrations'),
        fetch('http://localhost:5000/api/organizations/dashboard/stats')
      ]);

      const individualsData = await individualsRes.json();
      const organizationsData = await organizationsRes.json();

      if (individualsData.success && organizationsData.success) {
        setStats({
          totalIndividuals: individualsData.data.totalRegistrations || 0,
          totalOrganizations: organizationsData.data.overview.totalOrganizations || 0,
          totalCandidates: organizationsData.data.overview.totalCandidates || 0,
          recentApplications: organizationsData.data.recentRegistrations?.length || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch individuals
  const fetchIndividuals = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        search: searchQuery,
        experienceLevel: filters.experienceLevel
      });

      const response = await fetch(`http://localhost:5000/api/registration/individuals?${params}`);
      const data = await response.json();

      if (data.success) {
        setIndividuals(data.data.individuals);
        setPagination(prev => ({
          ...prev,
          page: data.data.pagination.currentPage,
          total: data.data.pagination.totalIndividuals,
          totalPages: data.data.pagination.totalPages
        }));
      } else {
        setError('Failed to fetch individuals');
      }
    } catch (error) {
      setError('Error fetching individuals');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch organizations
  const fetchOrganizations = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        search: searchQuery,
        type: filters.organizationType,
        status: filters.status
      });

      const response = await fetch(`http://localhost:5000/api/organizations?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrganizations(data.data);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.current,
          total: data.pagination.total,
          totalPages: data.pagination.pages
        }));
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (error) {
      setError('Error fetching organizations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'individuals') {
      fetchIndividuals(1);
    } else {
      fetchOrganizations(1);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (activeTab === 'individuals') {
      fetchIndividuals(newPage);
    } else {
      fetchOrganizations(newPage);
    }
  };

  // Handle resume download
  const handleResumeDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:5000/api/registration/resume/${filename}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
    }
  };

  // Toggle row expansion
  const toggleRowExpansion = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Show details modal
  const showDetails = (item) => {
    setSelectedDetails(item);
    setShowDetailsModal(true);
  };

  // Handle sorting
  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  // Load data on component mount and tab change
  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'individuals') {
      fetchIndividuals(1);
    } else {
      fetchOrganizations(1);
    }
  }, [activeTab, filters]);

  const statsCards = [
    {
      id: 'individuals',
      title: 'Individual Applications',
      value: stats.totalIndividuals,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 'organizations',
      title: 'Organizations',
      value: stats.totalOrganizations,
      icon: Building2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      id: 'candidates',
      title: 'Total Candidates',
      value: stats.totalCandidates,
      icon: GraduationCap,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 'recent',
      title: 'Recent Applications',
      value: stats.recentApplications,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    }
  ];

  const renderIndividualsTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('personalInfo.firstName')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Name</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experience Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Applied Date</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {individuals.map((individual) => (
              <React.Fragment key={individual._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {individual.personalInfo.firstName} {individual.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {individual._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {individual.professionalInfo.experienceLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs">{individual.personalInfo.email}</span>
                      </div>
                      {individual.personalInfo.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-xs">{individual.personalInfo.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(individual.personalInfo.location.city || individual.personalInfo.location.state) && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs">
                          {individual.personalInfo.location.city}
                          {individual.personalInfo.location.city && individual.personalInfo.location.state && ', '}
                          {individual.personalInfo.location.state}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs">
                        {new Date(individual.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRowExpansion(individual._id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Toggle Details"
                      >
                        {expandedRows.has(individual._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => showDetails(individual)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {individual.professionalInfo.resume && (
                        <button
                          onClick={() => handleResumeDownload(individual.professionalInfo.resume.filename)}
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Download Resume"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(individual._id) && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Skills</h4>
                          {individual.professionalInfo.skills && individual.professionalInfo.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {individual.professionalInfo.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No skills listed</p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Links</h4>
                          <div className="space-y-2">
                            {individual.professionalInfo.portfolio && (
                              <a
                                href={individual.professionalInfo.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
                              >
                                <Globe className="w-4 h-4 mr-2" />
                                Portfolio
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                            {individual.professionalInfo.linkedin && (
                              <a
                                href={individual.professionalInfo.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-900 text-sm"
                              >
                                <Briefcase className="w-4 h-4 mr-2" />
                                LinkedIn
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrganizationsTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Organization</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <span>Registered</span>
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {organizations.map((organization) => (
              <React.Fragment key={organization._id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {organization.logo ? (
                          <img
                            src={`http://localhost:5000${organization.logo}`}
                            alt={`${organization.name} logo`}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {organization.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {organization._id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {organization.type}
                      </span>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          organization.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : organization.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {organization.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs">{organization.email}</span>
                      </div>
                      {organization.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-xs">{organization.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs">{organization.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {organization.candidatesCount || organization.candidates?.length || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-xs">
                        {new Date(organization.registrationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleRowExpansion(organization._id)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                        title="Toggle Details"
                      >
                        {expandedRows.has(organization._id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => showDetails(organization)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors"
                        title="View Full Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {organization.website && (
                        <a
                          href={organization.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                          title="Visit Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(organization._id) && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Organization Details</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            {organization.description && (
                              <p><strong>Description:</strong> {organization.description}</p>
                            )}
                            {organization.establishedYear && (
                              <p><strong>Established:</strong> {organization.establishedYear}</p>
                            )}
                            {organization.accreditation && (
                              <p><strong>Accreditation:</strong> {organization.accreditation}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Statistics</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>Total Candidates:</strong> {organization.candidatesCount || organization.candidates?.length || 0}</p>
                            <p><strong>Status:</strong> 
                              <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                                organization.status === 'approved' ? 'bg-green-100 text-green-800' :
                                organization.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {organization.status}
                              </span>
                            </p>
                            <p><strong>Organization Age:</strong> {organization.establishedYear ? new Date().getFullYear() - organization.establishedYear : 'N/A'} years</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Details Modal Component
  const DetailsModal = ({ item, onClose }) => {
    if (!item) return null;

    const isOrganization = item.name !== undefined;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {isOrganization ? item.name : `${item.personalInfo.firstName} ${item.personalInfo.lastName}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {isOrganization ? (
              // Organization Details
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Type</p>
                        <p className="text-sm text-gray-600">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{item.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{item.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{item.phone}</p>
                      </div>
                    </div>
                    {item.website && (
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Website</p>
                          <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {item.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                  <div className="space-y-3">
                    {item.establishedYear && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Established Year</p>
                        <p className="text-sm text-gray-600">{item.establishedYear}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'approved' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Total Candidates</p>
                      <p className="text-sm text-gray-600">{item.candidatesCount || item.candidates?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Registration Date</p>
                      <p className="text-sm text-gray-600">{new Date(item.registrationDate).toLocaleDateString()}</p>
                    </div>
                    {item.accreditation && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Accreditation</p>
                        <p className="text-sm text-gray-600">{item.accreditation}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {item.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                )}
              </div>
            ) : (
              // Individual Details
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Full Name</p>
                        <p className="text-sm text-gray-600">{item.personalInfo.firstName} {item.personalInfo.lastName}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">{item.personalInfo.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-600">{item.personalInfo.phone}</p>
                      </div>
                    </div>
                    {(item.personalInfo.location.city || item.personalInfo.location.state) && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Location</p>
                          <p className="text-sm text-gray-600">
                            {item.personalInfo.location.city}
                            {item.personalInfo.location.city && item.personalInfo.location.state && ', '}
                            {item.personalInfo.location.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Experience Level</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.professionalInfo.experienceLevel}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Registration Date</p>
                      <p className="text-sm text-gray-600">{new Date(item.registrationDate).toLocaleDateString()}</p>
                    </div>
                    {item.professionalInfo.resume && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resume</p>
                        <button
                          onClick={() => handleResumeDownload(item.professionalInfo.resume.filename)}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {item.professionalInfo.resume.originalName || 'Download Resume'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {item.professionalInfo.skills && item.professionalInfo.skills.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.professionalInfo.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Links</h3>
                  <div className="flex flex-wrap gap-4">
                    {item.professionalInfo.portfolio && (
                      <a
                        href={item.professionalInfo.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Portfolio
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {item.professionalInfo.linkedin && (
                      <a
                        href={item.professionalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applications Dashboard</h1>
          <p className="text-gray-600">Manage and review all applications with advanced filtering and sorting</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                onClick={() => {
                  if (stat.id === 'individuals') setActiveTab('individuals');
                  else if (stat.id === 'organizations') setActiveTab('organizations');
                }}
                className={`${stat.bgColor} rounded-lg p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 border-2 ${
                  (stat.id === 'individuals' && activeTab === 'individuals') ||
                  (stat.id === 'organizations' && activeTab === 'organizations')
                    ? 'border-blue-500 shadow-lg'
                    : 'border-transparent hover:shadow-md'
                }`}
              >
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {activeTab === 'individuals' && (
                <select
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Experience Levels</option>
                  <option value="Entry Level (0-1 years)">Entry Level (0-1 years)</option>
                  <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                  <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
                  <option value="Senior Level (5-10 years)">Senior Level (5-10 years)</option>
                  <option value="Expert Level (10+ years)">Expert Level (10+ years)</option>
                </select>
              )}

              {activeTab === 'organizations' && (
                <>
                  <select
                    value={filters.organizationType}
                    onChange={(e) => handleFilterChange('organizationType', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="College">College</option>
                    <option value="University">University</option>
                    <option value="Technical Institute">Technical Institute</option>
                    <option value="Training Center">Training Center</option>
                    <option value="Research Institute">Research Institute</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </>
              )}
              
              <button
                onClick={() => {
                  if (activeTab === 'individuals') {
                    fetchIndividuals(1);
                  } else {
                    fetchOrganizations(1);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('individuals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'individuals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Individuals ({stats.totalIndividuals})</span>
              </button>
              <button
                onClick={() => setActiveTab('organizations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === 'organizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Organizations ({stats.totalOrganizations})</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading {activeTab}...</p>
          </div>
        )}

        {/* Content Tables */}
        {!loading && !error && (
          <>
            {activeTab === 'individuals' && renderIndividualsTable()}
            {activeTab === 'organizations' && renderOrganizationsTable()}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && (
          (activeTab === 'individuals' && individuals.length === 0) ||
          (activeTab === 'organizations' && organizations.length === 0)
        ) && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-500">
              {searchQuery || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search criteria or filters.' 
                : `No ${activeTab} have applied yet.`
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm mt-6">
            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
                {[...Array(Math.min(pagination.totalPages, 7))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 4) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 3) {
                    pageNum = pagination.totalPages - 6 + i;
                  } else {
                    pageNum = pagination.page - 3 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && (
          <DetailsModal 
            item={selectedDetails} 
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedDetails(null);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationsDashboard;