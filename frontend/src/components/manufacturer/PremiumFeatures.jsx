import React, { useState, useEffect } from 'react';
import { 
  Check, X, TrendingUp, Users, Globe, ShoppingBag,
  Sidebar
} from 'lucide-react';
import api from '../../axios/axiosInstance'

const PremiumFeatures = () => {
  const [error, setError] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [manufacturerId, setManufacturerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState({
    show: false,
    status: '',
    message: '',
    transactionId: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  });

  const features = [
    {
      title: "Provide Innovation in your Business",
      description: "Transform your business with cutting-edge AI solutions and smart payment processing",
      icon: TrendingUp,
      highlight: "Next-Gen AI",
      color: "bg-gradient-to-br from-violet-500 to-purple-600"
    },
    {
      title: "Provide you the best Employers",
      description: "Access top-tier professionals with AI-driven recruitment and HR automation",
      icon: Users,
      highlight: "Smart Hiring",
      color: "bg-gradient-to-br from-fuchsia-500 to-pink-600"
    },
    {
      title: "Provide user Global Logistic",
      description: "Expand to 190+ countries with intelligent logistics and localized solutions",
      icon: Globe,
      highlight: "Worldwide Access",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600"
    },
    {
      title: "Sell Products Global Market",
      description: "Lead your industry with ML-powered insights and dynamic market analysis",
      icon: ShoppingBag,
      highlight: "Market Leader",
      color: "bg-gradient-to-br from-teal-500 to-emerald-600"
    }
  ];

  // Fetch manufacturer ID from backend
  useEffect(() => {
    const fetchManufacturerData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the existing manufacturer route instead of auth/profile
        const { data } = await api.get('/manufacturers/me'); // Changed from '/auth/profile'
        
        if (data.success && data.data) {
          const manufacturerData = data.data;
          setManufacturerId(manufacturerData._id);
          
          // Set form data from manufacturer contact info
          if (manufacturerData.contact?.email) {
            setFormData(prev => ({ ...prev, email: manufacturerData.contact.email }));
          }
          if (manufacturerData.contact?.phone) {
            setFormData(prev => ({ ...prev, phone: manufacturerData.contact.phone }));
          }
        } else {
          throw new Error('Manufacturer profile not found. Please complete your manufacturer registration first.');
        }
      } catch (error) {
        console.error('Failed to fetch manufacturer data:', error);
        if (error.response?.status === 404) {
          setError('Manufacturer profile not found. Please complete your manufacturer registration first.');
        } else {
          setError(error.response?.data?.message || error.message || 'Failed to load manufacturer data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturerData();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        document.body.removeChild(script);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (!manufacturerId) {
      setError('Manufacturer ID not available. Please refresh the page.');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [plan.title]: true }));
      setError(null);

      const isRazorpayLoaded = await loadRazorpay();
      if (!isRazorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      const { data } = await api.post('/payments/create-order', {
        amount: parseInt(plan.price),
        manufacturerId: manufacturerId,
        planType: plan.title
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Your Company Name",
        description: `Payment for ${plan.title}`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const verificationData = await api.post('/payments/verify-payment', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              manufacturerId: manufacturerId
            });

            if (verificationData.data.success) {
              setPaymentStatus({
                show: true,
                status: 'success',
                message: 'Payment successful! Your account has been upgraded.',
                transactionId: response.razorpay_payment_id
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            setPaymentStatus({
              show: true,
              status: 'error',
              message: 'Payment verification failed. Please contact support.',
              transactionId: ''
            });
          } finally {
            setLoadingStates(prev => ({ ...prev, [plan.title]: false }));
          }
        },
        prefill: {
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#7C3AED"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to initiate payment');
    } finally {
      setLoadingStates(prev => ({ ...prev, [plan.title]: false }));
    }
  };

  const plans = [
    {
      title: "Enterprise Partnership",
      price: "10%",
      period: "Billed annually",
      highlight: "Most Popular",
      features: [
        "Complete supply chain optimization suite",
        "24/7 dedicated support with 1-hour response time",
        "Custom branding and white-label options",
        "Enterprise-grade security with ISO 27001"
      ]
    },
    {
      title: "Annual Premium",
      price: "30000", // Removed comma for proper parsing
      period: "One-time payment",
      highlight: "Best Value",
      features: [
        "Full production analytics suite",
        "Strategic consulting sessions",
        "AI-powered insights and recommendations",
        "99.9% uptime SLA"
      ]
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-16">
      <Sidebar/>
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div 
              key={index} 
              className={`${feature.color} rounded-xl p-6 text-white transform transition-transform hover:scale-105`}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold bg-white/20 px-2 py-1 rounded">
                  {feature.highlight}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-white/80">{feature.description}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {plans.map((plan, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg relative">
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-violet-600 text-white px-4 py-1 rounded-full text-sm">
                  {plan.highlight}
                </span>
              </div>
            )}
            <h3 className="text-2xl font-bold mb-4">{plan.title}</h3>
            <p className="text-4xl font-bold mb-2">
              {plan.title === "Enterprise Partnership" ? plan.price : `₹${plan.price}`}
            </p>
            <p className="text-gray-600 mb-6">{plan.period}</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePayment(plan)}
              disabled={loadingStates[plan.title] || !manufacturerId}
              className="w-full bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingStates[plan.title] ? 'Processing...' : 
               !manufacturerId ? 'Profile Loading...' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {paymentStatus.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              {paymentStatus.status === 'success' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-500" />
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">
                {paymentStatus.status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
              </h3>
              <p className="text-gray-600 mb-4">{paymentStatus.message}</p>
              {paymentStatus.transactionId && (
                <p className="text-sm text-gray-500 mb-4">
                  Transaction ID: {paymentStatus.transactionId}
                </p>
              )}
              <button
                onClick={() => setPaymentStatus({ show: false, status: '', message: '', transactionId: '' })}
                className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumFeatures;