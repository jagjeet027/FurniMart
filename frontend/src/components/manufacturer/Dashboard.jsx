import React, { useState, useEffect } from 'react';
import {
  Bell, Plus, Users, Sofa, Target, Activity,
  BarChart2, ArrowUp, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProductUploadForm from './ProductUploadForm';
import api from '../../axios/axiosInstance' ; // Make sure this path is correct for your project structure

const BASE_URL = import.meta.env.VITE_API_URL || 'https://backendbizness.onrender.com/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [chartData, setChartData] = useState([]);
  
  // Add missing state variables
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [manufacturerData, setManufacturerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated to match the path in ProductManagement component
  const handleNavigateToProducts = () => {
    navigate('/products/management');
  };
  
  const statsList = [
    { label: 'Total Orders', value: '1,234', trend: '+20%', icon: Users, bgColor: 'from-blue-500 to-blue-600' },
    { label: 'Products Sold', value: '456', trend: '+15%', icon: Sofa, bgColor: 'from-purple-500 to-purple-600' },
    { label: 'New Customers', value: '789', trend: '+5%', icon: Users, bgColor: 'from-yellow-500 to-yellow-600' },
    { label: 'Monthly Revenue', value: '$12,345', trend: '+30%', icon: Target, bgColor: 'from-emerald-500 to-emerald-600' },
  ];

  const recentActivities = [
    { user: 'Jane Doe', action: 'purchased Modern Sofa Set', time: '2h ago', avatar: '/api/placeholder/32/32' },
    { user: 'John Smith', action: 'ordered Dining Table', time: '3h ago', avatar: '/api/placeholder/32/32' },
    { user: 'Mary Johnson', action: 'reviewed Leather Armchair', time: '5h ago', avatar: '/api/placeholder/32/32' },
  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsAuthenticated(true);
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          setUser(userInfo);
        } catch (err) {
          console.error('Error parsing user info:', err);
        }
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchManufacturerData = async () => {
      if (!isAuthenticated || !user || !user._id) {
        setLoading(false);
        return;
      }
  
      try {
        const response = await api.get(`${BASE_URL}/manufacturers/${user._id}`, {
        });
        
        setManufacturerData(response.data.data.manufacturer);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching manufacturer data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchManufacturerData();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const generateChartData = () => {
      return Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        orders: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 1000) + 500,
      }));
    };
    setChartData(generateChartData());
  }, []);

  const handleProductSubmit = async (formData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Create a new FormData object for file uploads
      const productData = new FormData();
      
      // Add all form fields to the FormData object
      Object.keys(formData).forEach(key => {
        if (key === 'images' && formData.images) {
          // Handle multiple file uploads
          for (let i = 0; i < formData.images.length; i++) {
            productData.append('images', formData.images[i]);
          }
        } else if (key === 'manufacturerId' && !formData.manufacturerId && user) {
          // Set manufacturer ID if not provided
          productData.append('manufacturerId', user._id);
        } else {
          productData.append(key, formData[key]);
        }
      });
      
      // Post the data to your API
        const response = await api.post(`${BASE_URL}/products`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Product added successfully:', response.data);
      // Close the form
      setShowProductForm(false);
      // Show success message or notification here
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Close the product form
  const handleCancelProductForm = () => {
    setShowProductForm(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onPremiumClick={() => setShowPremiumFeatures(true)}
      />
      
      {/* Main Content */}
      <main className={`
        flex-1 transition-all duration-300 relative
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        w-full
      `}>
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Welcome back, {manufacturerData?.name || 'User'}! 👋</h1>
              <p className="text-gray-600 mt-1">Here's what's happening at FurniMart today.</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => setShowProductForm(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add Product</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {statsList.map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-30 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className={`bg-gradient-to-r ${stat.bgColor} p-3 rounded-lg`}>
                        <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <span className="flex items-center text-emerald-500 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        {stat.trend}
                      </span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 mt-4">{stat.value}</h3>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Sales Overview</h2>
                <select className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#d97706" />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="orders" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h2>
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start group">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="w-8 h-8 rounded-full mr-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{activity.user}</p>
                      <p className="text-gray-600 text-sm truncate">{activity.action}</p>
                      <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-8">
            {[
              { icon: Sofa, label: 'Add Furniture', bgColor: 'from-amber-500 to-amber-600', onClick: () => setShowProductForm(true) },
              { icon: Users, label: 'Manage Products', bgColor: 'from-amber-600 to-amber-700', onClick: handleNavigateToProducts },
              { icon: Activity, label: 'Sales Report', bgColor: 'from-amber-700 to-amber-800' }
            ].map((action, index) => (
              <button
                key={index}
                className="relative group overflow-hidden rounded-xl"
                onClick={action.onClick}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.bgColor} transition-transform group-hover:scale-105`}></div>
                <div className="relative flex items-center justify-center space-x-2 py-4 text-white">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Upload Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
                  <button 
                    onClick={handleCancelProductForm} 
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <ProductUploadForm 
                  onSubmit={handleProductSubmit} 
                  onCancel={handleCancelProductForm}
                  manufacturerId={user?._id}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto"></div>
              <p className="text-center mt-4 text-gray-700">Loading...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;