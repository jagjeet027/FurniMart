import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search, Loader2 } from 'lucide-react';
import api from '../../axios/axiosInstance';
import ProductCard from '../ProductCard';

const CategoryProductsPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryId]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, sortBy, priceRange]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if categoryId exists
      if (!categoryId) {
        throw new Error('No category ID provided');
      }

      // Check if it's a valid MongoDB ObjectId (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(categoryId);
      if (!isValidObjectId) {
        setError(`Invalid category ID format: "${categoryId}". Please check the URL and try again.`);
        return;
      }

      // Fetch category details - using the correct backend endpoint
      let categoryData = null;
      try {
        const categoryResponse = await api.get(`/categories/${categoryId}`);
        categoryData = categoryResponse.data.category || categoryResponse.data;
      } catch (categoryErr) {
        // Create fallback category data
        categoryData = {
          _id: categoryId,
          name: 'Category',
          description: 'Product category'
        };
      }
      
      setCategory(categoryData);

      // Fetch products by category - using the correct backend endpoint
      let productsData = [];
      try {
        const productsResponse = await api.get(`/products/category/${categoryId}`);
        
        if (productsResponse.data.success && productsResponse.data.products) {
          productsData = productsResponse.data.products;
        } else {
          productsData = productsResponse.data || [];
        }
        
      } catch (productsErr) {
        // Fallback: Try to get all products and filter client-side
        try {
          const allProductsResponse = await api.get('/products');
          let allProducts = allProductsResponse.data.products || allProductsResponse.data || [];
          
          // Filter products that belong to this category
          productsData = allProducts.filter(product => {
            return (
              product.category === categoryId || 
              product.categoryId === categoryId ||
              (product.category && product.category._id === categoryId) ||
              (product.category && product.category.toString() === categoryId)
            );
          });
          
        } catch (fallbackErr) {
          throw new Error('Unable to fetch products');
        }
      }
      
      // Ensure productsData is an array
      if (!Array.isArray(productsData)) {
        productsData = [];
      }
      
      setProducts(productsData);
      
    } catch (err) {
      setError(err.message || 'Failed to load products. Please try again later.');
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
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
      detail: { wishlist: newWishlist } 
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading products...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError('');
                fetchCategoryAndProducts();
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition mr-4"
            >
              Try Again
            </button>
            <Link 
              to="/categories/overview" 
              className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition inline-flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Categories</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Category Not Found</h2>
          <Link 
            to="/categories/overview" 
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition flex items-center justify-center space-x-2 inline-flex"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/categories/overview" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
          </div>
          
          {category.description && (
            <p className="text-gray-600 mb-4">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
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
                    placeholder="Search in this category..."
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

          {/* Products List - Linear Layout Only */}
          <div className="lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || priceRange.min || priceRange.max 
                    ? "Try adjusting your filters to see more results."
                    : "This category doesn't have any products yet."
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
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div key={product._id} className="w-full">
                    <ProductCard 
                      product={product} 
                      updateWishlist={updateWishlist}
                      listView={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryProductsPage;