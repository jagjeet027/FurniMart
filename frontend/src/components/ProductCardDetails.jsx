import React, { useState, useEffect } from 'react';
// Corrected import: added Minus and Plus
import { ShoppingCart, Eye, Heart, Star, Package, Filter, Search, Loader2, RefreshCw, Truck, Shield, ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';

import { useCart } from '../contexts/CartContext'

const ProductCardDetails = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [wishlist, setWishlist] = useState(new Set());
  
  // Use CartProvider context instead of local cart state
  const { addToCart, updateCartQuantity, removeFromCart, getCartItemQuantity, isInCart, getTotalItems } = useCart();

  // Mock API base URL - replace with your actual backend URL
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    loadWishlistFromStorage();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, priceRange]);

  // Remove loadCartFromStorage and updateCartInStorage functions as they're handled by context

  const loadWishlistFromStorage = () => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const wishlistData = JSON.parse(storedWishlist);
        const wishlistSet = new Set(wishlistData.map(item => item.id || item));
        setWishlist(wishlistSet);
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message}. Please check if your backend server is running on ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
        const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
        return !isNaN(price) && price >= min && price <= max;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviews || 0) - (a.reviews || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

    setFilteredProducts(filtered);
  };

  const updateWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    
    // Convert Set to array format for storage
    const wishlistArray = Array.from(newWishlist).map(productId => {
      const product = products.find(p => p._id === productId);
      return {
        id: productId,
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        image: product?.image || null,
        addedAt: new Date().toISOString()
      };
    });
    
    localStorage.setItem('wishlist', JSON.stringify(wishlistArray));
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { wishlist: wishlistArray, action: 'update' } 
    }));
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
      // Trigger animation for addition
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { action: 'add' } 
      }));
    }
    updateWishlist(newWishlist);
  };

  // Updated toggle cart function using context
  const toggleCart = (productId) => {
    if (isInCart(productId)) {
      removeFromCart(productId);
    } else {
      addToCart(productId, 1);
    }
  };

  // Remove duplicate addToCart function as it's provided by context

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleViewProduct = (productId) => {
    console.log('Viewing product:', productId);
    // Add navigation logic here if needed
    // Example: navigate(`/products/${productId}`)
  };

  const getStarRating = (rating = 4.0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading amazing products...</h2>
          <p className="text-gray-500 mt-2">Please wait while we fetch your products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError('');
                fetchProducts();
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500">
              Make sure your backend server is running on localhost:5000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <Package className="w-3 h-3 inline mr-1" />
                {products.length} Total
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
                <ShoppingCart className="w-3 h-3 inline mr-1" />
                {getTotalItems()} In Cart
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex items-center mb-4">
                <Filter className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-semibold text-gray-800">Filters</h3>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Rating</option>
                  <option value="reviews">Most Reviews</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange({ min: '', max: '' });
                  setSortBy('name');
                }}
                className="w-full py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products List - Linear Layout */}
          <div className="lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || priceRange.min || priceRange.max 
                    ? "Try adjusting your filters to see more results."
                    : "No products are available at the moment."
                  }
                </p>
                {(searchTerm || priceRange.min || priceRange.max) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setPriceRange({ min: '', max: '' });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredProducts.map((product) => {
                  // Updated to use context methods
                  const cartQuantity = getCartItemQuantity(product._id);
                  const isItemInCart = isInCart(product._id);
                  
                  return (
                    <div 
                      key={product._id} 
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Product Image */}
                        <div className="md:w-72 h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name || 'Product Image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                console.log('Image failed to load:', product.image);
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          {/* Fallback when no image or image fails to load */}
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-100"
                            style={{ display: product.image ? 'none' : 'flex' }}
                          >
                            <Package className="w-16 h-16 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm font-medium">No Image Available</p>
                          </div>
                          
                          {/* Wishlist Button */}
                          <button 
                            onClick={() => toggleWishlist(product._id)}
                            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                              wishlist.has(product._id) 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                            title={wishlist.has(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          >
                            <Heart className={`w-4 h-4 ${wishlist.has(product._id) ? 'fill-current' : ''}`} />
                          </button>

                          {/* Featured Badge */}
                          {product.featured && (
                            <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              ⭐ Featured
                            </div>
                          )}

                          {/* Discount Badge */}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="absolute bottom-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </div>
                          )}

                          {/* Cart Badge */}
                          {isItemInCart && (
                            <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                              In Cart ({cartQuantity})
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                                  {product.name || 'Product Name'}
                                </h3>
                                {product.categoryName && (
                                  <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium whitespace-nowrap">
                                    {product.categoryName}
                                  </span>
                                )}
                              </div>

                              {/* Rating & Reviews */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-1">
                                  {getStarRating(product.rating)}
                                  <span className="text-gray-600 text-sm ml-1">
                                    ({product.rating || 4.0})
                                  </span>
                                </div>
                                <span className="text-gray-500 text-sm">
                                  • {product.reviews || 0} reviews
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                {product.description || "This is an amazing product with excellent quality and features that will meet all your needs."}
                              </p>

                              {/* Features */}
                              {product.features && product.features.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex flex-wrap gap-2">
                                    {product.features.slice(0, 4).map((feature, index) => (
                                      <span 
                                        key={index} 
                                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                    {product.features.length > 4 && (
                                      <span className="text-gray-500 text-xs flex items-center">
                                        +{product.features.length - 4} more features
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Product Info Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Package className="w-4 h-4 text-green-500" />
                                  <span>Stock: {product.stock || 'Available'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Truck className="w-4 h-4 text-blue-500" />
                                  <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Shield className="w-4 h-4 text-purple-500" />
                                  <span>Warranty</span>
                                </div>
                              </div>
                            </div>

                            {/* Price and Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 gap-4">
                              {/* Price Section */}
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold text-green-600">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <p className="text-sm text-green-600 font-medium">
                                    Save {formatPrice(product.originalPrice - product.price)}
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3">
                                {/* Enhanced Cart Button with Quantity Controls */}
                                {isItemInCart ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                      <button
                                        onClick={() => updateCartQuantity(product._id, cartQuantity - 1)}
                                        className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                        disabled={cartQuantity <= 1}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                        {cartQuantity}
                                      </span>
                                      <button
                                        onClick={() => updateCartQuantity(product._id, cartQuantity + 1)}
                                        className="p-2 hover:bg-gray-100"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <button 
                                      onClick={() => toggleCart(product._id)}
                                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-red-500 hover:bg-red-600 text-white"
                                      title="Remove from Cart"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => toggleCart(product._id)}
                                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-w-[140px] bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                                    title="Add to Cart"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    Add to Cart
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleViewProduct(product._id)}
                                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                  title="View Product Details"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t border-gray-200 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Your Shopping Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">{products.length}</div>
              <div className="text-gray-700 font-medium">Total Products</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">{filteredProducts.length}</div>
              <div className="text-gray-700 font-medium">Filtered Results</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-red-600 mb-2">{wishlist.size}</div>
              <div className="text-gray-700 font-medium">Wishlist Items</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {getTotalItems()}
              </div>
              <div className="text-gray-700 font-medium">Cart Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardDetails;