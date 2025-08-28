import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Package, Users, DollarSign, TrendingUp, Bell, Settings, 
  Calendar, ShoppingCart, Clock, AlertCircle, CheckCircle, 
  Truck, XCircle, Loader
} from 'lucide-react';

const Userdashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0
  });

  // API base URL - adjust according to your backend
  const API_BASE_URL = 'http://localhost:5000/api';

  // Status configuration for better UI
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800', icon: Loader },
    shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
  };

  // Fetch user orders with proper error handling
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Fetching orders from:', `${API_BASE_URL}/orders/myorders`);
      console.log('Token exists:', !!token);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        method: 'GET',
        headers,
        mode: 'cors'
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch orders'}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);
      
      const ordersData = data.orders || [];
      setOrders(ordersData);
      calculateStats(ordersData);
      generateNotifications(ordersData);
      
    } catch (err) {
      console.error('Fetch error details:', err);
      setError(err.message);
      
      // Fallback to mock data for demonstration
      console.log('Using mock data due to API error');
      const mockOrders = generateMockOrders();
      setOrders(mockOrders);
      calculateStats(mockOrders);
      generateNotifications(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demonstration when API fails
  const generateMockOrders = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const mockOrders = [];
    
    for (let i = 0; i < 10; i++) {
      mockOrders.push({
        _id: `mock_order_${i}`,
        orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
        totalPrice: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        orderItems: [
          { name: `Product ${i}`, quantity: Math.floor(Math.random() * 3) + 1 }
        ],
        guestCustomer: {
          name: `Customer ${i}`,
          email: `customer${i}@example.com`
        }
      });
    }
    
    return mockOrders;
  };

  // Calculate dashboard statistics
  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length;
    const pendingOrders = ordersData.filter(order => order.orderStatus === 'pending').length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    
    // For active customers, we'll use unique customer info
    const uniqueCustomers = new Set();
    ordersData.forEach(order => {
      if (order.user) {
        uniqueCustomers.add(order.user._id);
      } else if (order.guestCustomer) {
        uniqueCustomers.add(order.guestCustomer.email);
      }
    });

    setStats({
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeCustomers: uniqueCustomers.size
    });
  };

  // Generate notifications based on recent orders
  const generateNotifications = (ordersData) => {
    const recentOrders = ordersData
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const diffHours = (now - orderDate) / (1000 * 60 * 60);
        return diffHours <= 24; // Orders from last 24 hours
      })
      .slice(0, 5);

    const notifications = recentOrders.map(order => ({
      id: order._id,
      message: `Order #${order._id.slice(-6)} is ${order.orderStatus}`,
      time: new Date(order.createdAt).toLocaleTimeString(),
      type: order.orderStatus
    }));

    setNotifications(notifications);
  };

  // Generate sales data for chart
  const generateSalesData = () => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
      
      last6Months.push({
        name: monthName,
        value: monthlyRevenue
      });
    }
    
    return last6Months;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Refresh data
  const refreshData = () => {
    fetchOrders();
  };

  // Test API connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Test connection response:', response.status);
    } catch (err) {
      console.log('Test connection failed:', err.message);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOrders();
    testConnection();
    
    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  User's Portal
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={refreshData}
                className="p-2 rounded-full hover:bg-gray-100"
                title="Refresh Data"
                disabled={loading}
              >
                <TrendingUp className={`h-6 w-6 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Settings className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">API Connection Issue</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {error} - Showing demo data instead.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mb-4 text-sm text-gray-600">
          API Endpoint: {API_BASE_URL}/orders/myorders
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateSalesData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                {orders.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Items
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.slice(0, 10).map((order) => {
                        const StatusIcon = statusConfig[order.orderStatus]?.icon || Clock;
                        return (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              #{order._id.slice(-6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.totalPrice)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[order.orderStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.orderItems?.length || 0} items
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
                {loading && <Loader className="h-4 w-4 animate-spin inline ml-2" />}
              </h3>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const count = orders.filter(order => order.orderStatus === status).length;
                  const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">{count}</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userdashboard;