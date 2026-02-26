import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  Factory,
  Clock,
  Truck,
  ArrowLeft,
  Banknote,
  QrCode,
  CreditCard as CreditCardIcon,
  Wallet,
  Landmark,
  Bitcoin,
  Package,
  MessageCircle
} from 'lucide-react';
import ChatModal from '../components/userDashBoard/UserChatModal'; // Import the ChatModal component

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [showPaymentSelectionPage, setShowPaymentSelectionPage] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(20);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [orderDetails, setOrderDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    paymentMethod: '',
    paymentType: '',
    notes: ''
  });

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + '/api';
  
  // Mock user info - replace with actual user data from your auth system
  const userInfo = {
    id: localStorage.getItem('userId') || 'user123',
    name: orderDetails.fullName || 'Wholeseller User',
    email: orderDetails.email || 'wholeseller@example.com',
    type: 'wholeseller'
  };
  
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    const initializeProduct = async () => {
      try {
        setLoading(true);

        if (location.state?.product) {
          const { product: productData, quantity: navQuantity, size } = location.state;
          setProduct(productData);
          setQuantity(navQuantity || 20);
          setSelectedSize(size || (productData.sizes ? productData.sizes[0] : ''));
          setLoading(false);
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');

        if (!productId) {
          navigate('/products');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'GET',
          headers: getHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        const productData = data.product || data;

        setProduct(productData);
        setQuantity(20);
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }

        setError('');
      } catch (err) {
        console.error('Error initializing product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    initializeProduct();
  }, [location.state, navigate, API_BASE_URL]);

  const handleChatWithManufacturer = () => {
    if (!product) {
      setError('Product information not available');
      return;
    }
    setShowChatModal(true);
  };

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 20) {
      setQuantity(prev => prev - 1);
      setError('');
    } else if (type === 'decrease' && quantity <= 20) {
      setError('Order minimum 20 products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotals = () => {
    if (!product) return { itemsPrice: 0, shippingPrice: 0, taxPrice: 0, totalPrice: 0 };

    const price = typeof product.price === 'string' ?
      parseFloat(product.price.replace('$', '')) :
      product.price;

    const itemsPrice = price * quantity;
    const shippingPrice = itemsPrice > 100 ? 0 : 0;
    const taxPrice = itemsPrice * 0.08;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  };

  const validateForm = () => {
    const required = ['fullName', 'address', 'city', 'postalCode', 'country', 'phone', 'email'];
    for (let field of required) {
      if (!orderDetails[field].trim()) {
        setError(`${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);
        return false;
      }
    }

    if (quantity < 20) {
      setError('Quantity must be at least 20');
      return false;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError('Please select a size');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderDetails.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleBookOrder = (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }
    setShowPaymentSelectionPage(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!orderDetails.paymentMethod) {
      setError('Please select a payment method.');
      return;
    }
    if (!orderDetails.paymentType) {
      setError('Please select either full payment or 50% advance.');
      return;
    }

    setSubmitting(true);

    try {
      const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateTotals();
      const advanceAmount = (totalPrice * 0.5).toFixed(2);

      const orderData = {
        orderItems: [{
          product: product._id,
          name: product.name,
          image: product.images?.[0] || product.image || '/api/placeholder/400/400',
          price: typeof product.price === 'string' ?
            parseFloat(product.price.replace('$', '')) :
            product.price,
          qty: quantity,
          size: selectedSize || undefined
        }],
        shippingAddress: {
          fullName: orderDetails.fullName,
          address: orderDetails.address,
          city: orderDetails.city,
          postalCode: orderDetails.postalCode,
          country: orderDetails.country,
          phoneNumber: orderDetails.phone,
          email: orderDetails.email
        },
        paymentMethod: orderDetails.paymentMethod,
        paymentType: orderDetails.paymentType,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
        notes: orderDetails.notes,
        amountToPay: orderDetails.paymentType === '50_percent_advance' ? parseFloat(advanceAmount) : totalPrice,
      };

      console.log('Sending order data:', orderData);

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData)
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Server error: ${response.status} - ${responseText}`);
        }
        throw new Error(errorData?.message || 'Failed to create order');
      }

      const result = JSON.parse(responseText);

      console.log('Order created:', result);
      setOrderId(result.order?._id || result._id || Date.now().toString());
      setShowSuccessPage(true);

    } catch (err) {
      console.error('Order creation error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Success Page Component
  if (showSuccessPage) {
    const { totalPrice } = calculateTotals();
    const advanceAmount = (totalPrice * 0.5).toFixed(2);
    const isAdvancePayment = orderDetails.paymentType === '50_percent_advance';
    const remainingAmount = isAdvancePayment ? (totalPrice - parseFloat(advanceAmount)).toFixed(2) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Booked Successfully!</h1>
            <p className="text-gray-600">Your custom furniture order has been placed.</p>
            {isAdvancePayment && (
              <p className="text-orange-600 font-semibold mt-2">
                Remaining amount of ${remainingAmount} will be collected upon delivery.
              </p>
            )}
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Factory className="w-5 h-5 mr-2 text-blue-600" />
              Manufacturing Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Order Confirmed</p>
                  <p className="text-sm text-gray-600">Your order has been received and confirmed</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <Factory className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Manufacturing Started</p>
                  <p className="text-sm text-gray-600">Your custom furniture is being crafted (7-14 days)</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Quality Check</p>
                  <p className="text-sm text-gray-600">Quality assurance and finishing touches (1-2 days)</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Shipping & Delivery</p>
                  <p className="text-sm text-gray-600">Careful packaging and delivery to your door (3-5 days)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-blue-600 font-medium">#{orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{product.name}</span>
              </div>
              {selectedSize && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{selectedSize}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-lg text-green-600">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {orderDetails.paymentMethod === 'credit_card' && 'Credit Card'}
                  {orderDetails.paymentMethod === 'paypal' && 'PayPal'}
                  {orderDetails.paymentMethod === 'cod' && 'Cash on Delivery'}
                  {orderDetails.paymentMethod === 'upi' && 'UPI'}
                  {orderDetails.paymentMethod === 'netbanking' && 'Net Banking'}
                  {orderDetails.paymentMethod === 'wallet' && 'Wallet'}
                </span>
              </div>
              {isAdvancePayment && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium text-blue-600">50% Advance Paid</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium text-orange-600">
                  {new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/order-tracking')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition duration-200 font-medium"
            >
              Track My Order
            </button>
            <button
              onClick={() => setShowChatModal(true)}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition duration-200 font-medium flex items-center justify-center"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat with Manufacturer
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-xl hover:bg-gray-300 transition duration-200 font-medium"
            >
              Continue Shopping
            </button>
          </div>

          {/* Contact Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Questions about your order?
              <a href="mailto:support@yourstore.com" className="text-blue-600 hover:underline ml-1">
                Contact our support team
              </a>
            </p>
          </div>
        </div>

        {/* Chat Modal */}
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          product={product}
          userInfo={userInfo}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading order details...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-6">Unable to load product details for checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } = calculateTotals();
  const advanceAmount = (totalPrice * 0.5).toFixed(2);

  // Payment Selection Page Component
  if (showPaymentSelectionPage) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center items-start">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-6">
          <button
            onClick={() => setShowPaymentSelectionPage(false)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Shipping Details
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Choose Payment Option</h1>
          <p className="text-gray-600 mb-6">Select your preferred payment method and type.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Payment Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Banknote className="h-5 w-5 mr-2" />
              Payment Type
            </h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="full_payment"
                  checked={orderDetails.paymentType === 'full_payment'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="font-medium text-lg">Pay Full Amount:</span>
                <span className="ml-auto font-bold text-blue-600 text-xl">${totalPrice.toFixed(2)}</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="50_percent_advance"
                  checked={orderDetails.paymentType === '50_percent_advance'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <span className="font-medium text-lg">Pay 50% Advance:</span>
                <span className="ml-auto font-bold text-orange-600 text-xl">${advanceAmount}</span>
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Method
            </h2>
            <div className="space-y-4">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={orderDetails.paymentMethod === 'credit_card'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <CreditCardIcon className="h-6 w-6 mr-2 text-blue-600" />
                <span className="font-medium text-lg">Credit/Debit Card</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={orderDetails.paymentMethod === 'paypal'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <img src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-mark-color.svg" alt="PayPal" className="h-6 w-auto mr-2" />
                <span className="font-medium text-lg">PayPal</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={orderDetails.paymentMethod === 'upi'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <QrCode className="h-6 w-6 mr-2 text-green-600" />
                <span className="font-medium text-lg">UPI (Google Pay, PhonePe, etc.)</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="netbanking"
                  checked={orderDetails.paymentMethod === 'netbanking'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <Landmark className="h-6 w-6 mr-2 text-purple-600" />
                <span className="font-medium text-lg">Net Banking</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wallet"
                  checked={orderDetails.paymentMethod === 'wallet'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <Wallet className="h-6 w-6 mr-2 text-indigo-600" />
                <span className="font-medium text-lg">Wallets (Paytm, Mobikwik, etc.)</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={orderDetails.paymentMethod === 'cod'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                <Package className="h-6 w-6 mr-2 text-gray-600" />
                <span className="font-medium text-lg">Cash on Delivery (COD)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={submitting || !orderDetails.paymentMethod || !orderDetails.paymentType}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Processing Payment...
              </>
            ) : (
              orderDetails.paymentType === 'full_payment' ? `Pay $${totalPrice.toFixed(2)} Now` : `Pay $${advanceAmount} Advance`
            )}
          </button>
        </div>
      </div>
    );
  }

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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Summary
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img
                    src={product.images?.[0] || product.image || '/api/placeholder/400/400'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="md:w-2/3">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    ${typeof product.price === 'string' ?
                      parseFloat(product.price.replace('$', '')) :
                      product.price}
                  </p>

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <div className="flex gap-2">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded-lg ${
                              selectedSize === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange('decrease')}
                        disabled={quantity <= 20}
                        className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-xl font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange('increase')}
                        className="p-2 border rounded-lg hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={orderDetails.fullName}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={orderDetails.phone}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={orderDetails.email}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={orderDetails.address}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={orderDetails.city}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={orderDetails.postalCode}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={orderDetails.country}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={orderDetails.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Any special instructions for your custom furniture..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span>Items ({quantity})</span>
                  <span>${itemsPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${taxPrice.toFixed(2)}</span>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shippingPrice === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-700">
                    🎉 Free shipping on orders over $100!
                  </p>
                </div>
              )}

              {/* Manufacturing Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Factory className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-700 font-medium">Custom Manufacturing</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This item will be manufactured to order. Expected delivery: 2-3 weeks.
                </p>
              </div>

              {/* Button Container */}
              <div className="space-y-3">
                <button
                  onClick={handleBookOrder}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Book Your Order'
                  )}
                </button>
                
                <button 
                  onClick={handleChatWithManufacturer}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> 
                  Chat with Manufacturer
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By booking this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>  
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        product={product}
        userInfo={userInfo}
      />
    </div>
  );
};

export default CheckoutPage;