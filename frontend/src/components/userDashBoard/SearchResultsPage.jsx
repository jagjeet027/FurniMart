import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Package, ArrowLeft, TrendingUp, Tag, Loader2 } from 'lucide-react';
import api from '../../axios/axiosInstance';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const noResults = searchParams.get('no-results') === 'true';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
        const productsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.products || []);
        
        setProducts(productsData);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to fetch search results');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const addToWishlist = (product) => {
    try {
      const existingWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isAlreadyInWishlist = existingWishlist.some(item => item._id === product._id);
      
      if (!isAlreadyInWishlist) {
        const updatedWishlist = [...existingWishlist, product];
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        
        window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
          detail: { action: 'add', product } 
        }));
        
        alert('Added to wishlist!');
      } else {
        alert('Already in wishlist!');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  const popularSearches = [
    'Modern Sofa',
    'Dining Table',
    'King Size Bed',
    'Office Chair',
    'Bookshelf',
    'Coffee Table',
    'Wardrobe',
    'Study Table'
  ];

  const trendingCategories = [
    { name: 'Living Room', icon: '🛋️' },
    { name: 'Bedroom', icon: '🛏️' },
    { name: 'Office', icon: '💼' },
    { name: 'Dining', icon: '🍽️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-orange-500 mx-auto animate-spin" />
          <p className="mt-4 text-gray-600 text-lg">Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  const hasResults = products.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                Search: "{query}"
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                {hasResults ? `${products.length} products found` : 'No products found'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {hasResults ? (
          /* Products Grid - 2 columns on mobile, responsive on larger screens */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <Link to={`/products/${product._id}`}>
                  <div className="relative overflow-hidden aspect-square">
                    <img
                      src={product.images?.[0] || '/api/placeholder/400/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-2 sm:p-3 md:p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base mb-1 sm:mb-2 hover:text-orange-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div>
                      <p className="text-sm sm:text-lg md:text-xl font-bold text-orange-600">
                        ₹{product.price?.toLocaleString()}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs sm:text-sm text-gray-400 line-through">
                          ₹{product.originalPrice?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mobile: Stacked buttons */}
                  <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 bg-orange-500 text-white py-1.5 sm:py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1 sm:space-x-2"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm font-medium">View</span>
                    </Link>
                    
                    <button
                      onClick={() => addToWishlist(product)}
                      className="sm:flex-none w-full sm:w-auto p-1.5 sm:p-2 border-2 border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="ml-1 text-xs sm:hidden">Wishlist</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Results Found */
          <div className="max-w-2xl mx-auto text-center py-6 sm:py-12 px-3">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
              <div className="mb-6">
                <Package className="h-16 sm:h-24 w-16 sm:w-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  No Products Found
                </h2>
                <p className="text-gray-600 text-sm sm:text-lg">
                  We couldn't find any products matching <span className="font-semibold text-orange-600">"{query}"</span>
                </p>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-center text-sm sm:text-base">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                  Search Tips
                </h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2 text-left max-w-md mx-auto">
                  <li>• Check your spelling</li>
                  <li>• Try more general keywords</li>
                  <li>• Try different keywords</li>
                  <li>• Browse our categories instead</li>
                </ul>
              </div>

              {/* Popular Searches */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-base">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {popularSearches.map((search, index) => (
                    <Link
                      key={index}
                      to={`/search-results?q=${encodeURIComponent(search)}`}
                      className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-full text-xs sm:text-sm font-medium transition-colors"
                    >
                      {search}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Categories */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center justify-center text-sm sm:text-base">
                  <Tag className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-orange-600" />
                  Browse Categories
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                  {trendingCategories.map((category, index) => (
                    <Link
                      key={index}
                      to="/categories/overview"
                      className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all hover:shadow-md"
                    >
                      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{category.icon}</div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">{category.name}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <Link
                  to="/"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm sm:text-base"
                >
                  Back to Home
                </Link>
                <Link
                  to="/categories/overview"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all font-medium text-sm sm:text-base"
                >
                  Browse All Categories
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;