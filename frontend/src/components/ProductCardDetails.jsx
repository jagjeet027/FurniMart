import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Heart, Star, Package, Filter, Search, Loader2, Truck, Shield, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import UserChatModal from '../components/userDashBoard/UserChatModal';
import { useAuth } from '../contexts/AuthContext';

const ProductCardDetails = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [wishlist, setWishlist] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedChatProduct, setSelectedChatProduct] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProducts();
    loadWishlistFromStorage();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, priceRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, priceRange]);

  const loadWishlistFromStorage = () => {
    try {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        const wishlistData = JSON.parse(storedWishlist);
        const wishlistSet = new Set(wishlistData.map(item => item._id || item.id || item));
        setWishlist(wishlistSet);
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    }
  };

  const handleChatWithManufacturer = (product) => {
    if (user && product.uploadedBy === user._id) {
      alert('You cannot chat about your own product');
      return;
    }
    
    if (!user) {
      alert('Please login to chat with manufacturer');
      navigate('/login');
      return;
    }

    setSelectedChatProduct(product);
    setIsChatModalOpen(true);
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

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (priceRange.min !== '' || priceRange.max !== '') {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price);
        const min = priceRange.min === '' ? 0 : parseFloat(priceRange.min);
        const max = priceRange.max === '' ? Infinity : parseFloat(priceRange.max);
        return !isNaN(price) && price >= min && price <= max;
      });
    }

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
    
    const wishlistArray = Array.from(newWishlist).map(productId => {
      const product = products.find(p => p._id === productId);
      return {
        _id: productId,
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        rating: product?.rating,
        reviews: product?.reviews,
        image: product?.image || null,
        images: product?.images
      };
    });
    
    localStorage.setItem('wishlist', JSON.stringify(wishlistArray));
    
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { 
        productId: Array.from(newWishlist)[Array.from(newWishlist).length - 1],
        inWishlist: newWishlist.size > wishlist.size,
        wishlist: wishlistArray, 
        action: 'update' 
      } 
    }));
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { action: 'add' } 
      }));
    }
    updateWishlist(newWishlist);
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    if (typeof price === 'string' && price.includes('$')) {
      return price;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '$0';
    return `$${numPrice}`;
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const getStarRating = (rating = 4.0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 sm:w-4 sm:h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50' 
              : 'text-gray-300'
        }`}
      />
    ));
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const FilterSidebar = ({ isMobile = false }) => (
    <div className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 ${isMobile ? '' : 'sticky top-20'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Filters</h3>
        </div>
        {isMobile && (
          <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Search Products
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="name">Name (A-Z)</option>
          <option value="price-low">Price (Low to High)</option>
          <option value="price-high">Price (High to Low)</option>
          <option value="rating">Rating</option>
          <option value="reviews">Most Reviews</option>
        </select>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
          Price Range
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            className="w-1/2 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            className="w-1/2 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={() => {
          setSearchTerm('');
          setPriceRange({ min: '', max: '' });
          setSortBy('name');
          if (isMobile) setShowFilters(false);
        }}
        className="w-full py-2 px-4 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-medium text-gray-700">Loading amazing products...</h2>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-red-500 text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Connection Error</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError('');
                fetchProducts();
              }}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <FilterSidebar isMobile={true} />
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">All Products</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Filters</span>
              </button>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Package className="w-3 h-3 inline mr-1" />
                  {products.length} Total
                </div>
                <div className="bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Heart className="w-3 h-3 inline mr-1" />
                  {wishlist.size} Wishlist
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar />
          </div>

          <div className="lg:w-3/4">
            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
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
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-6">
                  {currentProducts.map((product) => (
                    <div 
                      key={product._id} 
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-64 lg:w-72 h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
                          {product.image || (product.images && product.images[0]) ? (
                            <img 
                              src={product.images?.[0] || product.image} 
                              alt={product.name || 'Product Image'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-100"
                            style={{ display: (product.image || (product.images && product.images[0])) ? 'none' : 'flex' }}
                          >
                            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-2" />
                            <p className="text-gray-500 text-xs sm:text-sm font-medium">No Image Available</p>
                          </div>
                          
                          <button 
                            onClick={() => toggleWishlist(product._id)}
                            className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-2 sm:p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg ${
                              wishlist.has(product._id) 
                                ? 'bg-red-500 text-white hover:bg-red-600' 
                                : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlist.has(product._id) ? 'fill-current' : ''}`} />
                          </button>

                          {product.featured && (
                            <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                              ⭐ Featured
                            </div>
                          )}

                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-red-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                            </div>
                          )}
                        </div>

                        <div className="flex-1 p-4 sm:p-5 md:p-6">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <h3 
                                  className="text-base sm:text-lg md:text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors cursor-pointer leading-tight flex-1 pr-2"
                                  onClick={() => handleViewProduct(product._id)}
                                >
                                  {product.name || 'Product Name'}
                                </h3>
                                {product.categoryName && (
                                  <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                                    {product.categoryName}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  {getStarRating(product.rating)}
                                  <span className="text-gray-600 text-xs sm:text-sm ml-1">
                                    ({product.rating || 4.0})
                                  </span>
                                </div>
                                <span className="text-gray-500 text-xs sm:text-sm">
                                  • {product.reviews || 0} reviews
                                </span>
                              </div>

                              {product.description && (
                                <div className="mb-3 sm:mb-4">
                                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                                    {product.description}
                                  </p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProduct(product._id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-xs font-medium mt-1 inline-flex items-center"
                                  >
                                    Read more →
                                  </button>
                                </div>
                              )}

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                  <span className="truncate">Stock: {product.stock || 'Available'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                                  <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                  <span>Free Shipping</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 col-span-2 sm:col-span-1">
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                  <span>Warranty</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3 sm:gap-4">
                              <div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                                      {formatPrice(product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                                    Save {formatPrice(parseFloat(product.originalPrice) - parseFloat(product.price))}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                  onClick={() => handleViewProduct(product._id)}
                                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-initial"
                                >
                                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  View Details
                                </button>
                                
                                <button 
                                  onClick={() => handleChatWithManufacturer(product)}
                                  disabled={user && product.uploadedBy === user._id}
                                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-initial ${
                                    user && product.uploadedBy === user._id
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                                  }`}
                                  title={user && product.uploadedBy === user._id ? "You can't chat about your own product" : "Chat with manufacturer"}
                                >
                                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  Chat
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 sm:mt-8 flex justify-center items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <div className="flex gap-1 sm:gap-2">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-2 text-sm">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => paginate(page)}
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
                    Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6 sm:mb-8">Shopping Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{products.length}</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Total Products</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{filteredProducts.length}</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Filtered Results</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl col-span-2 md:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">{wishlist.size}</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Wishlist Items</div>
            </div>
          </div>
        </div>
      </div>

      {isChatModalOpen && selectedChatProduct && (
        <UserChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedChatProduct(null);
          }}
          product={selectedChatProduct}
          currentUserId={user?._id}
        />
      )}
    </div>
  );
};

export default ProductCardDetails;