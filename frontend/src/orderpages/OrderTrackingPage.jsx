import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  MapPin,
  CreditCard,
  Calendar,
  PhoneIcon,
  Mail,
  Download,
  MessageCircle,
  DollarSign
} from 'lucide-react';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthToken = () => localStorage.getItem('token');

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Load order details
  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);

        // Fetch order
        const orderResponse = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          headers: getHeaders()
        });

        if (!orderResponse.ok) {
          throw new Error('Order not found');
        }

        const orderData = await orderResponse.json();
        setOrder(orderData.order || orderData);

        // Fetch payment details
        const paymentResponse = await fetch(`${API_BASE_URL}/payments/details/${orderId}`, {
          headers: getHeaders()
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          setPaymentDetails(paymentData.data);
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId, API_BASE_URL]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'manufacturing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'successful':
      case 'fully_paid':
        return 'bg-green-100 text-green-800';
      case 'pending_verification':
      case '50_percent_advance_paid':
        return 'bg-orange-100 text-orange-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'manufacturing':
        return <Package className="w-6 h-6 text-orange-600" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-purple-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading Order Details...</h2>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to find your order'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2 inline" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const statusSteps = ['pending', 'processing', 'manufacturing', 'quality_check', 'shipped', 'delivered'];
  const currentStatusIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Tracking</h1>
              <p className="text-gray-600">Order ID: <span className="font-mono text-blue-600">#{order._id?.slice(-12)}</span></p>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 ${getStatusColor(order.orderStatus)}`}>
              <p className="text-sm font-semibold uppercase">{order.orderStatus.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Order Status Timeline
              </h2>

              <div className="space-y-4">
                {statusSteps.map((status, index) => (
                  <div key={status} className="flex items-start">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      index <= currentStatusIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < currentStatusIndex ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : index === currentStatusIndex ? (
                        <Clock className="w-5 h-5 animate-spin" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 capitalize">{status.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">
                        {status === 'delivered' && order.deliveredAt && formatDate(order.deliveredAt)}
                        {status === 'manufacturing' && order.manufacturingStartedAt && formatDate(order.manufacturingStartedAt)}
                        {status === 'pending' && formatDate(order.createdAt)}
                        {!['delivered', 'manufacturing', 'pending'].includes(status) && (
                          index <= currentStatusIndex ? 'Completed' : 'Pending'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {order.estimatedDeliveryDate && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Estimated Delivery Date
                  </p>
                  <p className="text-blue-700 mt-1">{formatDate(order.estimatedDeliveryDate)}</p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b flex">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Order Details
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === 'payment'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Payment Info
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-6 py-4 font-medium border-b-2 transition ${
                    activeTab === 'activity'
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  Activity Log
                </button>
              </div>

              <div className="p-6">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-blue-600" />
                        Products
                      </h3>
                      <div className="space-y-4">
                        {order.orderItems?.map((item, index) => (
                          <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{item.name}</p>
                              {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                                <p className="font-semibold text-blue-600">₹{item.price}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                        <p className="text-gray-600">{order.shippingAddress?.address}</p>
                        <p className="text-gray-600">
                          {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                        </p>
                        <p className="text-gray-600">{order.shippingAddress?.country}</p>
                        <div className="flex gap-6 mt-4 pt-4 border-t">
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2" />
                            {order.shippingAddress?.phoneNumber}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {order.shippingAddress?.email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Tab */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                        Payment Summary
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items Price:</span>
                          <span className="font-medium">₹{order.itemsPrice?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium">₹{order.shippingPrice?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax (18% GST):</span>
                          <span className="font-medium">₹{order.taxPrice?.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                          <span className="font-semibold text-gray-800">Total Amount:</span>
                          <span className="font-bold text-lg text-blue-600">₹{order.totalPrice?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                          <p className="font-medium text-gray-800 capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Payment Type</p>
                          <p className="font-medium text-gray-800 capitalize">{order.paymentType?.replace('_', ' ')}</p>
                        </div>

                        <div className={`p-4 rounded-lg ${getPaymentStatusColor(order.paymentStatus)}`}>
                          <p className="text-sm font-semibold mb-1">Payment Status</p>
                          <p className="font-medium capitalize">{order.paymentStatus?.replace('_', ' ')}</p>
                        </div>

                        {order.isPaid && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-600 mb-1">Payment Received</p>
                            <p className="font-medium text-green-800">{formatDate(order.paidAt)}</p>
                          </div>
                        )}

                        {order.advancePaid && !order.isPaid && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-600 mb-1">Advance Paid</p>
                            <p className="font-medium text-orange-800">₹{order.advancePaidAmount?.toFixed(2)}</p>
                            <p className="text-sm text-orange-600 mt-2">
                              Remaining: ₹{order.remainingAmount?.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {paymentDetails && paymentDetails.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
                        {paymentDetails.map((payment, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Transaction ID:</span>
                              <span className="font-mono text-blue-600 break-all">{payment.transactionId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium">₹{payment.amount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(payment.status)}`}>
                                {payment.status?.replace('_', ' ')}
                              </span>
                            </div>
                            {payment.verifiedAt && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Verified:</span>
                                <span className="font-medium text-green-600">{formatDate(payment.verifiedAt)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Log Tab */}
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
                    {order.activityLog && order.activityLog.length > 0 ? (
                      <div className="space-y-4">
                        {order.activityLog.slice().reverse().map((activity, index) => (
                          <div key={index} className="p-4 border-l-4 border-blue-600 bg-blue-50 rounded">
                            <p className="font-medium text-gray-800">{activity.action}</p>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatDate(activity.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No activity recorded yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Order Date</p>
                  <p className="font-medium text-gray-800">{formatDate(order.createdAt)}</p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-purple-700">₹{order.totalPrice?.toFixed(2)}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Payment Status</p>
                  <p className="font-medium text-green-800">{order.isPaid ? '✅ Paid' : '⏳ Pending'}</p>
                </div>

                {order.trackingNumber && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-600 mb-1">Tracking Number</p>
                    <p className="font-mono text-sm text-orange-800 break-all">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Order Info Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="opacity-80">Order ID</p>
                  <p className="font-mono text-xs break-all">{order._id}</p>
                </div>
                <div>
                  <p className="opacity-80">Items</p>
                  <p className="font-medium">{order.orderItems?.length} Product(s)</p>
                </div>
                <div>
                  <p className="opacity-80">Status</p>
                  <p className="font-medium capitalize">{order.orderStatus?.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;