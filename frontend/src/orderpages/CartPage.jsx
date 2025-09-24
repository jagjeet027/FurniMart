import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Heart, 
  ArrowLeft, 
  Package,
  Truck,
  Shield,
  Star,
  Gift,
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Tag,
  Percent
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { cartItems, updateCartQuantity, removeFromCart, clearCart, isLoading } = useCart();
  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // API base URL - matches your ProductCardDetails structure
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (!isLoading) {
      fetchCartItems();
    }
  }, [cartItems, isLoading]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event) => {
      console.log('Cart updated:', event.detail);
      if (!isLoading) {
        fetchCartItems();
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [isLoading]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (cartItems.size === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      console.log('Fetching cart items for:', Array.from(cartItems.keys()));

      // Fetch product details for cart items using the Map from context
      const cartPromises = Array.from(cartItems.entries()).map(async ([productId, quantity]) => {
        try {
          console.log(`Fetching product details for ID: ${productId}`);
          const response = await fetch(`${API_BASE_URL}/products/${productId}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch product ${productId}`);
          }
          
          const data = await response.json();
          console.log(`Product data for ${productId}:`, data);
          
          // Handle different response formats
          let productData;
          if (data.product) {
            productData = data.product;
          } else if (data.data) {
            productData = data.data;
          } else {
            productData = data;
          }
          
          // Ensure we have required fields
          if (!productData._id && !productData.id) {
            console.warn(`Product ${productId} missing ID field:`, productData);
            productData._id = productId; // Set fallback ID
          }
          
          return {
            ...productData,
            _id: productData._id || productData.id || productId,
            quantity: parseInt(quantity) || 1,
            cartId: `cart_${productId}_${Date.now()}`
          };
        } catch (err) {
          console.error(`Error fetching product ${productId}:`, err);
          
          // Return placeholder product data instead of null
          return {
            _id: productId,
            name: `Product ${productId}`,
            price: '99',
            rating: 4.0,
            reviews: 0,
            image: null,
            images: [],
            quantity: parseInt(quantity) || 1,
            cartId: `cart_${productId}_${Date.now()}`,
            error: true,
            errorMessage: err.message
          };
        }
      });

      const resolvedItems = await Promise.all(cartPromises);
      const validItems = resolvedItems.filter(item => item !== null);
      
      console.log('Final cart products:', validItems);
      setCartProducts(validItems);
      
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError(`Failed to load cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    try {
      updateCartQuantity(productId, newQuantity);
      
      // Update local state immediately for better UX
      setCartProducts(prevProducts => 
        prevProducts.map(item => 
          (item._id === productId || item.id === productId) 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
      
      showNotification('Quantity updated');
    } catch (err) {
      console.error('Error updating quantity:', err);
      showNotification('Failed to update quantity', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = (productId) => {
    try {
      removeFromCart(productId);
      
      // Update local state
      setCartProducts(prevProducts => 
        prevProducts.filter(item => 
          item._id !== productId && item.id !== productId
        )
      );
      
      setShowRemoveModal(null);
      showNotification('Item removed from cart');
    } catch (err) {
      console.error('Error removing item:', err);
      showNotification('Failed to remove item', 'error');
    }
  };

  const moveToWishlist = (item) => {
    try {
      // Create storage utility
      const createStorage = () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
          }
        } catch (e) {
          console.warn('localStorage not available, using memory storage');
        }
        
        if (!window._appStorage) window._appStorage = {};
        return {
          getItem: (key) => window._appStorage[key] || null,
          setItem: (key, value) => { window._appStorage[key] = value; }
        };
      };

      const storage = createStorage();
      
      // Get existing wishlist
      const existingWishlistStr = storage.getItem('wishlist');
      let existingWishlist = [];
      
      if (existingWishlistStr) {
        try {
          existingWishlist = JSON.parse(existingWishlistStr);
        } catch (e) {
          console.error('Error parsing wishlist:', e);
          existingWishlist = [];
        }
      }

      const wishlistItem = {
        _id: item._id || item.id,
        name: item.name || 'Product Name',
        price: item.price,
        rating: item.rating || 4.0,
        reviews: item.reviews || 0,
        image: item.image,
        images: item.images || [],
        addedAt: new Date().toISOString()
      };
      
      // Check if item already exists in wishlist
      const itemId = item._id || item.id;
      if (!existingWishlist.some(w => (w._id === itemId || w.id === itemId))) {
        existingWishlist.push(wishlistItem);
        storage.setItem('wishlist', JSON.stringify(existingWishlist));
        
        // Dispatch wishlist update event
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { action: 'add', wishlist: existingWishlist } 
        }));
      }
      
      // Remove from cart
      removeItem(itemId);
      showNotification('Item moved to wishlist');
      
    } catch (err) {
      console.error('Error moving to wishlist:', err);
      showNotification('Failed to move to wishlist', 'error');
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setUpdating(true);
      
      // Mock promo code validation - replace with actual API call
      const validCodes = {
        'SAVE10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
        'WELCOME20': { discount: 0.2, type: 'percentage', description: '20% off for new customers' },
        'FREESHIP': { discount: 50, type: 'fixed', description: 'Free shipping' },
        'FURNITURE25': { discount: 0.25, type: 'percentage', description: '25% off furniture' }
      };

      const code = promoCode.toUpperCase();
      if (validCodes[code]) {
        setAppliedPromo({
          code,
          ...validCodes[code]
        });
        showNotification(`Promo code "${code}" applied successfully!`);
        setPromoCode('');
      } else {
        showNotification('Invalid or expired promo code', 'error');
      }
    } catch (err) {
      console.error('Error applying promo code:', err);
      showNotification('Failed to apply promo code', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    showNotification('Promo code removed');
  };

  // FIXED NAVIGATION FUNCTIONS
  const navigateBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1); // Go back to previous page
      } else {
        navigate('/categories/overview'); // Fallback to home
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigate('/categories/overview');
    }
  };

  const navigateHome = () => {
    try {
      navigate('/categories/overview');
    } catch (error) {
      console.error('Home navigation error:', error);
      window.location.href = '/categories/overview';
    }
  };

  const navigateCheckout = () => {
    try {
      console.log('Navigating to checkout from cart...');
      console.log('Current pathname:', location.pathname);
      console.log('Cart products count:', cartProducts.length);
      console.log('Total amount:', total);
      
      // Navigate to checkout with cart data
      navigate('/checkout', {
        state: {
          cartItems: cartProducts,
          cartTotal: total,
          appliedPromo: appliedPromo,
          fromCart: true
        }
      });
    } catch (error) {
      console.error('Checkout navigation error:', error);
      // Fallback navigation
      try {
        window.location.href = '/checkout';
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
        showNotification('Navigation error. Please try again.', 'error');
      }
    }
  };

  // Enhanced formatPrice function with better error handling
  const formatPrice = (price, showCurrency = true) => {
    if (!price) return showCurrency ? '$0.00' : '0.00';
    
    // If price is already formatted string, return as is
    if (typeof price === 'string') {
      if (price.includes('$') && showCurrency) return price;
      if (price.includes('$') && !showCurrency) return price.replace('$', '');
      
      // Parse string price
      const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (isNaN(numPrice)) return showCurrency ? '$0.00' : '0.00';
      return showCurrency ? `$${numPrice.toFixed(2)}` : numPrice.toFixed(2);
    }
    
    // Handle numeric price
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return showCurrency ? '$0.00' : '0.00';
    
    return showCurrency ? `$${numPrice.toFixed(2)}` : numPrice.toFixed(2);
  };

  const getStarRating = (rating = 4.0) => {
    const numRating = parseFloat(rating) || 4.0;
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating) 
            ? 'text-yellow-400 fill-current' 
            : i < numRating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  // Calculate totals using cartProducts
  const subtotal = cartProducts.reduce((sum, item) => {
    const priceStr = item.price || '0';
    const price = parseFloat(priceStr.toString().replace(/[^0-9.]/g, '')) || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);
  
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.08; // 8% tax
  
  let promoDiscount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percentage') {
      promoDiscount = subtotal * appliedPromo.discount;
    } else {
      promoDiscount = appliedPromo.discount;
    }
  }
  
  const total = Math.max(0, subtotal + shipping + tax - promoDiscount);

  // Get total quantity from cartProducts
  const totalQuantity = cartProducts.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading your cart...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cart Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchCartItems}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry
            </button>
            <button
              onClick={navigateHome}
              className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-medium"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={navigateBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
                <p className="text-gray-600 mt-1">
                  {cartProducts.length} item{cartProducts.length !== 1 ? 's' : ''} in your cart
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <ShoppingCart className="w-4 h-4 inline mr-1" />
                {totalQuantity} Items
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                Total: {formatPrice(total)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {cartProducts.length === 0 ? (
          // Empty Cart State
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. 
              Start shopping to fill it up with amazing products!
            </p>
            <div className="space-y-4">
              <button
                onClick={navigateHome}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Continue Shopping
              </button>
              <div className="text-sm text-gray-500">
                <p>Need help? <a href="/chat" className="text-blue-600 hover:underline">Contact Support</a></p>
              </div>
            </div>
          </div>
        ) : (
          // Cart Content
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Cart Items</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartProducts.map((item) => (
                    <div key={item.cartId || item._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image - Fixed to handle both image formats */}
                        <div className="sm:w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group">
                          {item.error && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              API Error
                            </div>
                          )}
                          
                          {(item.images && item.images[0]) || item.image ? (
                            <img 
                              src={item.images?.[0] || item.image} 
                              alt={item.name || 'Product Image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.log('Image failed to load:', item.image);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100"
                            style={{ display: ((item.images && item.images[0]) || item.image) ? 'none' : 'flex' }}
                          >
                            <Package className="w-8 h-8 text-gray-400 mb-1" />
                            <p className="text-gray-500 text-xs">No Image</p>
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800 truncate pr-4">
                                {item.name || 'Product Name'}
                              </h3>
                              {item.error && (
                                <p className="text-sm text-red-600 mt-1">
                                  Failed to load product details
                                </p>
                              )}
                            </div>
                            {item.categoryName && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium whitespace-nowrap">
                                {item.categoryName}
                              </span>
                            )}
                          </div>

                          {/* Product ID for debugging */}
                          <div className="text-xs text-gray-400 mb-2">
                            ID: {item._id || item.id}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center">
                              {getStarRating(item.rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({item.rating || 4.0}) • {item.reviews || 0} reviews
                            </span>
                          </div>

                          {/* Features */}
                          {item.features && item.features.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {item.features.slice(0, 3).map((feature, index) => (
                                <span 
                                  key={index}
                                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Price and Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-xl font-bold text-blue-600">
                                  {formatPrice(item.price)}
                                </span>
                                {item.originalPrice && parseFloat(item.originalPrice.toString().replace(/[^0-9.]/g, '')) > parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) && (
                                  <span className="ml-2 text-sm text-gray-500 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatPrice(item.price, false)} × {item.quantity} = {formatPrice(parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) * item.quantity)}
                                </div>
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <button
                                  onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updating}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                                  disabled={updating}
                                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => moveToWishlist(item)}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Heart className="w-4 h-4" />
                                Save for Later
                              </button>
                              <button
                                onClick={() => setShowRemoveModal(item)}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm sticky top-20">
                {/* Promo Code Section */}
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Promo Code</h3>
                  
                  {appliedPromo ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">{appliedPromo.code}</span>
                          </div>
                          <p className="text-sm text-green-600 mt-1">{appliedPromo.description}</p>
                        </div>
                        <button
                          onClick={removePromoCode}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && applyPromoCode()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={applyPromoCode}
                        disabled={!promoCode.trim() || updating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
                {/* Order Summary */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalQuantity} items)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        Shipping
                        {shipping === 0 && <span className="text-green-600 text-xs ml-1">(Free!)</span>}
                      </span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          Discount ({appliedPromo.code})
                        </span>
                        <span>-{formatPrice(promoDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-800">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-800 mb-2">Cart Summary</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Items: {totalQuantity}</div>
                      <div>Subtotal: {formatPrice(subtotal)}</div>
                      <div>Shipping: {formatPrice(shipping)}</div>
                      <div>Tax: {formatPrice(tax)}</div>
                      {promoDiscount > 0 && <div>Discount: -{formatPrice(promoDiscount)}</div>}
                      <div className="font-semibold text-gray-800 pt-2 border-t">
                        Final Total: {formatPrice(total)}
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-800 mb-3">Your Benefits</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>30-day money-back guarantee</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>Free shipping on orders over $500</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Professional assembly available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>Gift wrapping available</span>
                      </div>
                    </div>
                  </div>

                  {/* Clear Cart Button */}
                  {cartProducts.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear your entire cart?')) {
                          clearCart();
                          setCartProducts([]);
                          showNotification('Cart cleared successfully', 'info');
                        }
                      }}
                      className="w-full mb-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-medium text-sm"
                    >
                      Clear Cart
                    </button>
                  )}

                  {/* Checkout Button */}
                  <button
                    onClick={navigateCheckout}
                    disabled={cartProducts.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    Proceed to Checkout • {formatPrice(total)}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    Secure checkout with SSL encryption
                  </div>

                  {/* Continue Shopping */}
                  <button
                    onClick={navigateHome}
                    className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remove Item Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Remove Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "{showRemoveModal.name}" from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => removeItem(showRemoveModal._id || showRemoveModal.id)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
              >
                Remove
              </button>
              <button
                onClick={() => setShowRemoveModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
          <div>Cart Items: {cartItems.size}</div>
          <div>Products Loaded: {cartProducts.length}</div>
          <div>Subtotal: {formatPrice(subtotal)}</div>
          <div>Total: {formatPrice(total)}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Cart Context Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default CartPage;