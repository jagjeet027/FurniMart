import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Factory, 
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  Star,
  Heart,
  ArrowRight
} from 'lucide-react';

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState(orderId ? 'details' : 'list');
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Mock API instance (replace with your actual API instance)
  const api = {
    get: async (url) => {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    }
  };

  // Fetch user's orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/orders/myorders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific order details
  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      setError('');
      const order = await api.get(`/orders/${id}`);
      setSelectedOrder(order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for "Browse Products" section
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      // Replace with your actual categories endpoint
      const data = await api.get('/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback categories
      setCategories([
        { _id: '1', name: 'Sofas & Chairs', slug: 'sofas-chairs', image: '/api/placeholder/300/200' },
        { _id: '2', name: 'Tables', slug: 'tables', image: '/api/placeholder/300/200' },
        { _id: '3', name: 'Bedroom', slug: 'bedroom', image: '/api/placeholder/300/200' },
        { _id: '4', name: 'Storage', slug: 'storage', image: '/api/placeholder/300/200' },
        { _id: '5', name: 'Decor', slug: 'decor', image: '/api/placeholder/300/200' },
        { _id: '6', name: 'Lighting', slug: 'lighting', image: '/api/placeholder/300/200' }
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      fetchOrders();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'manufacturing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'manufacturing':
        return <Factory className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTrackingSteps = (order) => {
    const steps = [
      { id: 1, name: 'Order Placed', status: 'pending', completed: false },
      { id: 2, name: 'Processing', status: 'processing', completed: false },
      { id: 3, name: 'Manufacturing', status: 'manufacturing', completed: false },
      { id: 4, name: 'Shipped', status: 'shipped', completed: false },
      { id: 5, name: 'Delivered', status: 'delivered', completed: false }
    ];

    const currentStatus = order.orderStatus?.toLowerCase() || 'pending';
    const statusOrder = ['pending', 'processing', 'manufacturing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    steps.forEach((step, index) => {
      if (index <= currentIndex) {
        step.completed = true;
      }
      if (index === currentIndex) {
        step.current = true;
      }
    });

    return steps;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setView('details');
  };

  const backToList = () => {
    setView('list');
    setSelectedOrder(null);
    if (orderId) {
      navigate('/orders');
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.slug}`);
  };

  const handleBrowseProducts = async () => {
    await fetchCategories();
    navigate('/products');
  };

  const reorderItems = (orderItems) => {
    // Add items to cart and redirect
    const cartItems = orderItems.map(item => ({
      product: item.product,
      name: item.name,
      price: item.price,
      image: item.image,
      qty: item.qty,
      size: item.size
    }));
    
    // Store in localStorage or context
    localStorage.setItem('reorderItems', JSON.stringify(cartItems));
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading orders...</h2>
        </div>
      </div>
    );
  }

  // Order Details View
  if (view === 'details' && selectedOrder) {
    const trackingSteps = getTrackingSteps(selectedOrder);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={backToList}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </button>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
                <p className="text-gray-600 mt-2">Order #{selectedOrder._id}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.orderStatus)}`}>
                  {getStatusIcon(selectedOrder.orderStatus)}
                  <span className="ml-2 capitalize">{selectedOrder.orderStatus || 'Pending'}</span>
                </span>
                <button
                  onClick={() => reorderItems(selectedOrder.orderItems)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Reorder
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Tracking */}
            <div className="lg:col-span-2">
              {/* Tracking Timeline */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Tracking
                </h2>
                
                <div className="space-y-8">
                  {trackingSteps.map((step, index) => (
                    <div key={step.id} className="relative">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          step.completed 
                            ? 'bg-green-500 text-white border-green-500' 
                            : step.current 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-gray-100 text-gray-400 border-gray-300'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            getStatusIcon(step.status)
                          )}
                        </div>
                        <div className="ml-4">
                          <p className={`font-medium ${
                            step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.name}
                          </p>
                          {step.completed && (
                            <p className="text-sm text-gray-500 mt-1">
                              {step.status === 'pending' && formatDate(selectedOrder.createdAt)}
                              {step.status === 'delivered' && selectedOrder.deliveredAt && formatDate(selectedOrder.deliveredAt)}
                              {step.status === 'shipped' && selectedOrder.shippedAt && formatDate(selectedOrder.shippedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`absolute left-5 top-10 w-0.5 h-8 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <img 
                        src={item.image || '/api/placeholder/400/400'} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-gray-600">Size: {item.size}</p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatCurrency(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manufacturing Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <Factory className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Custom Manufacturing</span>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  Your furniture is being custom manufactured to order. This process typically takes 7-14 business days, 
                  followed by quality checks and shipping. Thank you for your patience!
                </p>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.itemsPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.shippingPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.taxPrice)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Status
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm border ${
                    selectedOrder.isPaid 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }`}>
                    {selectedOrder.isPaid ? 'Paid' : 'Pending'}
                  </span>
                  {selectedOrder.isPaid && selectedOrder.paidAt && (
                    <p className="text-sm text-gray-600 mt-1">
                      Paid on {formatDate(selectedOrder.paidAt)}
                    </p>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-800">{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                    <div className="mt-2 pt-2 border-t">
                      <p className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {selectedOrder.shippingAddress.phoneNumber}
                      </p>
                      <p className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {selectedOrder.shippingAddress.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Questions about your order?</p>
                  <a 
                    href="mailto:support@yourstore.com" 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage your furniture orders</p>
            </div>
            <button
              onClick={fetchOrders}
              className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-700 mb-2">No orders found</h2>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? "No orders match your search criteria." 
                  : "You haven't placed any orders yet."}
              </p>
              
              {/* Categories Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Browse Our Categories</h3>
                {categoriesLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {categories.slice(0, 6).map((category) => (
                      <div
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                        className="group cursor-pointer bg-white border rounded-lg overflow-hidden hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleBrowseProducts}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-lg font-semibold">Order #{order._id}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1 capitalize">{order.orderStatus || 'Pending'}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-2" />
                        {order.orderItems.length} item(s)
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CreditCard className="w-4 h-4 mr-2" />
                        {formatCurrency(order.totalPrice)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {order.orderItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
                          <img 
                            src={item.image || '/api/placeholder/400/400'} 
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <span className="text-sm font-medium">{item.name}</span>
                          <span className="text-sm text-gray-600">×{item.qty}</span>
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="flex items-center px-3 py-1 bg-gray-200 rounded-lg">
                          <span className="text-sm text-gray-600">+{order.orderItems.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 md:ml-4 flex gap-2">
                    <button
                      onClick={() => reorderItems(order.orderItems)}
                      className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Reorder
                    </button>
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;