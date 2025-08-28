import React, { useState, useEffect } from 'react';
import { Bell, Users, DollarSign, CheckCircle, Search, X, Filter, Download, ArrowUpDown, Printer, RefreshCcw, Eye } from 'lucide-react';
import api from '../../../axios/axiosInstance';
import { DocumentViewer} from '../ManufacturerDashboard/DocumentViewer';


const sendStatusEmail = async (email, status, manufacturerId) => {
  try {
    const response = await api.post('/notifications/email', {
      email,
      status,
      manufacturerId
    });
    return response.data;
  } catch (error) {
    console.error('Error sending status email:', error);
    throw error;
  }
};

const StatsCard = ({ title, value, icon: Icon, gradient, onClick }) => (
  <div 
    onClick={onClick}
    className={`group ${gradient} p-6 rounded-2xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-opacity-30 transition-all relative overflow-hidden transform hover:scale-105 duration-200`}
  >
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <Icon className="h-10 w-10 text-current opacity-40" />
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-current/0 via-current/5 to-current/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
  </div>
);

const StatsModal = ({ title, manufacturers, onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'businessName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  // Sort function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort data
  const filteredAndSortedData = manufacturers ? [...manufacturers]
    .filter(m => 
      m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, k) => obj?.[k], a) : 
        a[sortConfig.key];
      let bVal = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, k) => obj?.[k], b) : 
        b[sortConfig.key];
      
      aVal = aVal ?? '';
      bVal = bVal ?? '';
      
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? 
          aVal.localeCompare(bVal) : 
          bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }) : [];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-11/12 max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-indigo-900 to-purple-900">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-indigo-200 mt-1">
                  Showing {filteredAndSortedData.length} of {manufacturers?.length || 0} manufacturers
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button 
                  onClick={onClose} 
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search manufacturers..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {[
                    { label: 'Business Name', key: 'businessName' },
                    { label: 'Registration', key: 'registrationNumber' },
                    { label: 'Business Type', key: 'businessType' },
                    { label: 'Status', key: 'status' },
                    { label: 'Revenue', key: 'revenue' },
                    { label: 'Country', key: 'address.country' }
                  ].map(({ label, key }) => (
                    <th 
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-2">
                        {label}
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedData.map((manufacturer) => (
                  <tr key={manufacturer._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{manufacturer.businessName}</div>
                        <div className="text-sm text-gray-500">{manufacturer.contact?.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {manufacturer.registrationNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {manufacturer.businessType}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        manufacturer.status === 'approved' ? 'bg-green-100 text-green-800' :
                        manufacturer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {manufacturer.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      ${manufacturer.revenue?.toLocaleString() ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {manufacturer.address?.country ?? 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedManufacturer(manufacturer)}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedManufacturer && (
        <ManufacturerDetailsModal
          manufacturer={selectedManufacturer}
          onClose={() => setSelectedManufacturer(null)}
          onStatusUpdate={() => {
            setSelectedManufacturer(null);
          }}
        />
      )}
    </>
  );
};

const NotificationItem = ({ notification, onRead }) => (
  <div 
    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notification.isNew ? 'bg-blue-50' : ''}`}
    onClick={() => onRead(notification.id)}
  >
    <div className="flex justify-between items-start">
      <p className="text-sm text-gray-800">{notification.message}</p>
      {notification.isNew && (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
          New
        </span>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
  </div>
);

// Notifications Panel Component
const NotificationsPanel = ({ notifications, onRead, onClose }) => (
  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
    <div className="p-4 border-b bg-gradient-to-r from-indigo-900 to-purple-900">
      <h3 className="text-lg font-semibold text-white">Notifications</h3>
    </div>
    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
      {notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No notifications
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem 
            key={notification.id}
            notification={notification}
            onRead={onRead}
          />
        ))
      )}
    </div>
  </div>
);

// Manufacturer List Item Component
const ManufacturerListItem = ({ manufacturer, onViewDetails }) => (
  <div className="p-6 hover:bg-white/5 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-white">{manufacturer.businessName}</h3>
        <p className="text-white/60 mt-1">Reg: {manufacturer.registrationNumber}</p>
        <div className="flex gap-3 mt-2">
          <span className={`px-3 py-1 rounded-full text-sm
            ${manufacturer.status === 'approved' 
              ? 'bg-green-500/20 text-green-300' 
              : manufacturer.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-red-500/20 text-red-300'}`}>
            {manufacturer.status}
          </span>
          <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-300">
            {manufacturer.businessType}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-4">
        <div className="text-right">
          <p className="text-white/60">Registered</p>
          <p className="text-white mt-1">
            {new Date(manufacturer.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => onViewDetails(manufacturer)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>
      </div>
    </div>
  </div>
);

// Document List Component
const DocumentList = ({ documents }) => (
  <div className="space-y-4 text-sm text-gray-500">
    {documents?.businessLicense && (
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Business License</span>
      </div>
    )}
    {documents?.taxCertificate && (
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>Tax Certificate</span>
      </div>
    )}
    {documents?.qualityCertifications?.length > 0 && (
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span>{documents.qualityCertifications.length} Quality Certs</span>
      </div>
    )}
  </div>
);

const ManufacturerDetailsModal = ({ manufacturer, onClose, onStatusUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleStatusUpdate = async (status) => {
  setIsProcessing(true);
  setError(null);
  try {
    // Update manufacturer status
    const response = await api.patch(`/manufacturers/${manufacturer._id}/status`, { status });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update status');
    }

    // Send email notification
    try {
      await api.post('/notifications/email', {
        email: manufacturer.contact.email,
        status,
        manufacturerId: manufacturer._id
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Continue even if email fails - don't block the status update
    }

    // Show success message
    alert(`Manufacturer ${status === 'approved' ? 'approved' : 'rejected'} successfully! Email notification sent.`);
    
    // Call the callback to update parent state
    onStatusUpdate(manufacturer._id, status);
    onClose();

  } catch (error) {
    console.error('Error updating status:', error);
    setError(error.response?.data?.message || 'Failed to update status. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};

  if (!manufacturer) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-900 to-purple-900 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">{manufacturer.businessName}</h2>
              <p className="text-indigo-200 mt-1">Registration: {manufacturer.registrationNumber}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Business Type:</span> {manufacturer.businessType}</p>
                    <p><span className="font-medium">Year Established:</span> {manufacturer.yearEstablished}</p>
                    <p>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-sm rounded-full
                        ${manufacturer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          manufacturer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {manufacturer.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Contact Person:</span> {manufacturer.contact?.contactPerson}</p>
                    <p><span className="font-medium">Email:</span> {manufacturer.contact?.email}</p>
                    <p><span className="font-medium">Phone:</span> {manufacturer.contact?.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>{manufacturer.address?.streetAddress}</p>
                    <p>{manufacturer.address?.city}, {manufacturer.address?.state} {manufacturer.address?.postalCode}</p>
                    <p>{manufacturer.address?.country}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Documents</h3>
                  <EnhancedDocumentList 
                    documents={manufacturer.documents}
                    onViewDocument={setSelectedDocument}
                  />
                </div>

                {manufacturer.status === 'pending' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Review Decision</h3>
                    {error && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate('approved')}
                        disabled={isProcessing}
                        className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isProcessing ? 'Processing...' : 'Accept Registration'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={isProcessing}
                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isProcessing ? 'Processing...' : 'Reject Registration'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDocument && (
        <DocumentViewer 
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
};
const EnhancedDocumentList = ({ documents, onViewDocument }) => (
  <div className="space-y-3">
    {documents?.businessLicense && (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div>
            <p className="font-medium text-sm">Business License</p>
            <p className="text-xs text-gray-500">
              {new Date(documents.businessLicense.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewDocument({
            ...documents.businessLicense,
            type: 'Business License'
          })}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
        >
          View
        </button>
      </div>
    )}

    {documents?.taxCertificate && (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div>
            <p className="font-medium text-sm">Tax Certificate</p>
            <p className="text-xs text-gray-500">
              {new Date(documents.taxCertificate.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewDocument({
            ...documents.taxCertificate,
            type: 'Tax Certificate'
          })}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
        >
          View
        </button>
      </div>
    )}

    {documents?.qualityCertifications?.map((cert, index) => (
      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <div>
            <p className="font-medium text-sm">Quality Certificate {index + 1}</p>
            <p className="text-xs text-gray-500">
              Type: {cert.certificationType} • {new Date(cert.uploadDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => onViewDocument({
            ...cert,
            type: `Quality Certificate - ${cert.certificationType}`
          })}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition-colors"
        >
          View
        </button>
      </div>
    ))}
  </div>
);

const ManufactDetailsAdmin = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statsModalData, setStatsModalData] = useState({ title: '', manufacturers: [] });
  const [selectedDocument, setSelectedDocument] = useState(null);


  const fetchManufacturers = async () => {
  setLoading(true);
  setError(null);
  try {
    // Remove the query params construction since the backend doesn't support these filters
    const response = await api.get('/manufacturers/all', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Fix: api.get() returns response object, not fetch response
    if (!response.data.success) {
      throw new Error('Failed to fetch manufacturers');
    }

    const { data } = response.data;
    setManufacturers(data || []);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    setError(error.response?.data?.message || error.message || 'Failed to load manufacturers');
    setManufacturers([]);
  } finally {
    setLoading(false);
  }
};

  const fetchManufacturerDetails = async (manufacturerId) => {
  try {
    const response = await api.get(`/manufacturers/${manufacturerId}`);

    if (!response.data.success) {
      throw new Error('Failed to fetch manufacturer details');
    }

    const { data } = response.data;
    setSelectedManufacturer(data);
  } catch (error) {
    console.error('Error fetching manufacturer details:', error);
    setError(error.response?.data?.message || 'Failed to load manufacturer details');
  }
};

const handleStatusUpdate = async (manufacturerId, newStatus) => {
  try {
    // Update the manufacturers list immediately for better UX
    setManufacturers(prev => 
      prev.map(m => 
        m._id === manufacturerId ? { ...m, status: newStatus } : m
      )
    );
    
    // Refresh the manufacturers list from server
    await fetchManufacturers();
    
  } catch (error) {
    console.error('Error updating manufacturer status:', error);
    setError('Failed to update manufacturer status. Please try again.');
    
    // Refresh to get correct data
    await fetchManufacturers();
  }
};

  const handleStatsClick = (type) => {
    let filteredMfrs = [];
    let title = '';

    switch (type) {
      case 'total':
        filteredMfrs = manufacturers;
        title = 'All Manufacturers';
        break;
      case 'active':
        filteredMfrs = manufacturers.filter(m => m.status === 'approved');
        title = 'Active Manufacturers';
        break;
      case 'pending':
        filteredMfrs = manufacturers.filter(m => m.status === 'pending');
        title = 'Pending Manufacturers';
        break;
      default:
        return;
    }

    setStatsModalData({ title, manufacturers: filteredMfrs });
    setShowStatsModal(true);
  };

  const fetchNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    
    if (!response.data.success) {
      throw new Error('Failed to fetch notifications');
    }

    const data = response.data.data || [];
    const formattedNotifications = data.map(notification => ({
      ...notification,
      id: notification._id,
      time: new Date(notification.createdAt).toLocaleString()
    }));
    setNotifications(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setNotifications([]);
  }
};

 const markNotificationRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    
    if (!response.data.success) {
      throw new Error('Failed to mark notification as read');
    }
    
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isNew: false } : n
    ));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

  // Add debounce for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchManufacturers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterStatus]);

  // Initial fetch
  useEffect(() => {
    fetchManufacturers();
    fetchNotifications();
  }, []);

  // Filter manufacturers
  const filteredManufacturers = manufacturers.filter(m => {
    if (!m) return false;
    
    const matchesSearch = 
      (m.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.registrationNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.contact?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && m.status === filterStatus;
  });

  // Calculate stats
  const stats = {
    total: manufacturers.length,
    active: manufacturers.filter(m => m?.status === 'approved').length,
    pending: manufacturers.filter(m => m?.status === 'pending').length,
    totalRevenue: manufacturers.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0)
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
                    
          <div className="flex items-center gap-4">

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all relative"
              >
                <Bell className="h-6 w-6 text-white" />
                {notifications.some(n => n.isNew) && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              
              {/* Notifications Panel */}
              {showNotifications && (
                <NotificationsPanel 
                  notifications={notifications}
                  onRead={markNotificationRead}
                  onClose={() => setShowNotifications(false)}
                />
              )}
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search manufacturers..."
                className="w-64 pl-10 pr-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Manufacturers"
            value={stats.total}
            icon={Users}
            gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
            onClick={() => handleStatsClick('total')}
          />
          <StatsCard
            title="Active Manufacturers"
            value={stats.active}
            icon={CheckCircle}
            gradient="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
            onClick={() => handleStatsClick('active')}
          />
          <StatsCard
            title="Pending Approval"
            value={stats.pending}
            icon={Users}
            gradient="bg-gradient-to-br from-pink-500/20 to-pink-600/20"
            onClick={() => handleStatsClick('pending')}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
          />
        </div>

        {/* Manufacturers List */}
        <div className="bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden">
          {/* List Header */}
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Manufacturers</h2>
              <p className="text-indigo-200 mt-1">Latest registrations and updates</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              <button 
                onClick={fetchManufacturers}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCcw className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* List Content */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white"></div>
              <p className="text-white mt-4">Loading manufacturers...</p>
            </div>
          ) : filteredManufacturers.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              No manufacturers found matching your criteria
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredManufacturers.map(manufacturer => (
                <ManufacturerListItem 
                  key={manufacturer._id}
                  manufacturer={manufacturer}
                  onViewDetails={() => setSelectedManufacturer(manufacturer)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {showStatsModal && (
        <StatsModal
          title={statsModalData.title}
          manufacturers={statsModalData.manufacturers}
          onClose={() => setShowStatsModal(false)}
        />
      )}
      {selectedManufacturer && (
        <ManufacturerDetailsModal 
          manufacturer={selectedManufacturer}
          onClose={() => setSelectedManufacturer(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default ManufactDetailsAdmin;