import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, Package, ArrowRight, Grid, Layers } from 'lucide-react';
import api from '../../axios/axiosInstance';

const CategoriesOverviewPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      // Try different API endpoints for categories
      let categoriesData = [];
      const categoryEndpoints = ['/categories', '/category', '/api/categories'];
      
      for (const endpoint of categoryEndpoints) {
        try {
          console.log(`Trying categories endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          categoriesData = response.data.categories || response.data || [];
          console.log(`Successfully fetched ${categoriesData.length} categories from ${endpoint}`);
          break;
        } catch (endpointErr) {
          console.log(`Endpoint ${endpoint} failed:`, endpointErr.response?.status);
          continue;
        }
      }

      if (!Array.isArray(categoriesData)) {
        categoriesData = [];
      }
      
      // Fetch product counts and sample images for each category
      const categoriesWithDetails = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            // Try multiple product endpoints
            let products = [];
            const productEndpoints = [
              `/products/category/${category._id}`,
              `/products?category=${category._id}`,
              `/category/${category._id}/products`,
              `/products`
            ];

            for (const prodEndpoint of productEndpoints) {
              try {
                const productsResponse = await api.get(prodEndpoint);
                let fetchedProducts = productsResponse.data.products || productsResponse.data || [];
                
                // Filter if using general products endpoint
                if (prodEndpoint === '/products' && Array.isArray(fetchedProducts)) {
                  fetchedProducts = fetchedProducts.filter(product => 
                    product.category === category._id || 
                    product.categoryId === category._id ||
                    product.category?._id === category._id
                  );
                }
                
                products = Array.isArray(fetchedProducts) ? fetchedProducts : [];
                break;
              } catch (prodErr) {
                continue;
              }
            }
            
            return {
              ...category,
              productCount: products.length,
              sampleImages: products.slice(0, 4).map(p => p.images?.[0] || p.image).filter(Boolean),
              latestProducts: products.slice(0, 3)
            };
          } catch (err) {
            console.error(`Error fetching products for category ${category.name}:`, err);
            return {
              ...category,
              productCount: 0,
              sampleImages: [],
              latestProducts: []
            };
          }
        })
      );

      setCategories(categoriesWithDetails);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}/products`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading categories...</h2>
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
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
         <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No Categories Found' : 'No Categories Available'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try searching with different keywords.' 
                  : 'Categories will appear here once they are added.'
                }
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {searchTerm ? `Search Results (${filteredCategories.length})` : `All Categories (${filteredCategories.length})`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
                >
                  {/* Category Images Preview */}
                  <div className="relative h-48 bg-gray-100">
                    {category.sampleImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 h-full p-2">
                        {category.sampleImages.slice(0, 4).map((image, index) => (
                          <div
                            key={index}
                            className={`rounded-lg overflow-hidden ${
                              category.sampleImages.length === 1 ? 'col-span-2' :
                              category.sampleImages.length === 3 && index === 0 ? 'col-span-2' : ''
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${category.name} product ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No products yet</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Product Count Badge */}
                    <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Latest Products Preview */}
                    {category.latestProducts.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Latest Products
                        </p>
                        <div className="space-y-1">
                          {category.latestProducts.map((product) => (
                            <p key={product._id} className="text-xs text-gray-600 truncate">
                              • {product.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Category Button */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-center text-sm text-blue-600 font-medium">
                        <Grid className="w-4 h-4 mr-1" />
                        View All Products
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stats Section */}
      {filteredCategories.length > 0 && (
        <div className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {filteredCategories.length}
                </div>
                <div className="text-gray-600">Categories Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {filteredCategories.reduce((total, cat) => total + cat.productCount, 0)}
                </div>
                <div className="text-gray-600">Total Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(filteredCategories.reduce((total, cat) => total + cat.productCount, 0) / filteredCategories.length)}
                </div>
                <div className="text-gray-600">Avg Products per Category</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesOverviewPage;