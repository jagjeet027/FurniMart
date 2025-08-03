import React, { useState, useEffect } from 'react';
import { 
  Sofa, Lamp, Bed, Armchair, Table, 
  Utensils, BookOpen, ShoppingCart, Heart,
  ShieldCheck, Star, Box, Blocks, Search,
  Filter, Grid, Zap, Award, Clock, Gift,
  Truck, ChevronRight, ArrowRight, Loader2
} from 'lucide-react';

const FurniMart = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlist, setWishlist] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    { title: "Mega Furniture Sale", subtitle: "Up to 50% OFF", bg: "from-blue-600 to-purple-600", cta: "Shop Now" },
    { title: "New Collection", subtitle: "Modern Living Essentials", bg: "from-green-600 to-blue-600", cta: "Explore" },
    { title: "Free Delivery", subtitle: "On orders above ₹25,000", bg: "from-purple-600 to-pink-600", cta: "Order Now" }
  ];

  // Mock data for categories
  const mockCategories = [
    { _id: 'all', name: 'All Products' },
    { _id: 'living-room', name: 'Living Room' },
    { _id: 'bedroom', name: 'Bedroom' },
    { _id: 'dining', name: 'Dining' },
    { _id: 'office', name: 'Office' },
    { _id: 'outdoor', name: 'Outdoor' }
  ];

  // Mock data for products
  const mockProducts = [
    {
      _id: '1',
      name: 'Premium Leather Sofa',
      categoryName: 'Living Room',
      category: 'living-room',
      price: 45000,
      originalPrice: 55000,
      rating: 4.8,
      reviews: 234,
      description: 'Luxurious 3-seater leather sofa with premium Italian leather upholstery.',
      image: '🛋️',
      trending: true,
      bestseller: false
    },
    {
      _id: '2',
      name: 'Modern Coffee Table',
      categoryName: 'Living Room',
      category: 'living-room',
      price: 12000,
      originalPrice: 15000,
      rating: 4.6,
      reviews: 156,
      description: 'Sleek glass-top coffee table with wooden legs.',
      image: '📋',
      trending: false,
      bestseller: true
    },
    {
      _id: '3',
      name: 'King Size Bed',
      categoryName: 'Bedroom',
      category: 'bedroom',
      price: 35000,
      originalPrice: 42000,
      rating: 4.7,
      reviews: 189,
      description: 'Comfortable king size bed with storage drawers.',
      image: '🛏️',
      trending: true,
      bestseller: true
    },
    {
      _id: '4',
      name: 'Office Chair Ergonomic',
      categoryName: 'Office',
      category: 'office',
      price: 8500,
      originalPrice: null,
      rating: 4.5,
      reviews: 312,
      description: 'Ergonomic office chair with lumbar support and adjustable height.',
      image: '🪑',
      trending: false,
      bestseller: false
    },
    {
      _id: '5',
      name: 'Dining Table Set',
      categoryName: 'Dining',
      category: 'dining',
      price: 25000,
      originalPrice: 30000,
      rating: 4.9,
      reviews: 98,
      description: '6-seater wooden dining table with matching chairs.',
      image: '🍽️',
      trending: false,
      bestseller: true
    },
    {
      _id: '6',
      name: 'Table Lamp Modern',
      categoryName: 'Living Room',
      category: 'living-room',
      price: 3500,
      originalPrice: 4200,
      rating: 4.4,
      reviews: 87,
      description: 'Contemporary table lamp with adjustable brightness.',
      image: '💡',
      trending: true,
      bestseller: false
    },
    {
      _id: '7',
      name: 'Wardrobe 4-Door',
      categoryName: 'Bedroom',
      category: 'bedroom',
      price: 28000,
      originalPrice: null,
      rating: 4.6,
      reviews: 145,
      description: 'Spacious 4-door wardrobe with mirror and drawers.',
      image: '🗄️',
      trending: false,
      bestseller: false
    },
    {
      _id: '8',
      name: 'Patio Furniture Set',
      categoryName: 'Outdoor',
      category: 'outdoor',
      price: 18000,
      originalPrice: 22000,
      rating: 4.3,
      reviews: 76,
      description: 'Weather-resistant patio furniture set with cushions.',
      image: '🏡',
      trending: false,
      bestseller: false
    },
    {
      _id: '9',
      name: 'Recliner Chair',
      categoryName: 'Living Room',
      category: 'living-room',
      price: 22000,
      originalPrice: 26000,
      rating: 4.7,
      reviews: 203,
      description: 'Comfortable recliner chair with massage function.',
      image: '🪑',
      trending: true,
      bestseller: false
    },
    {
      _id: '10',
      name: 'Study Desk',
      categoryName: 'Office',
      category: 'office',
      price: 7500,
      originalPrice: 9000,
      rating: 4.5,
      reviews: 134,
      description: 'Compact study desk with built-in storage compartments.',
      image: '💻',
      trending: false,
      bestseller: true
    },
    {
      _id: '11',
      name: 'Bookshelf 5-Tier',
      categoryName: 'Office',
      category: 'office',
      price: 5500,
      originalPrice: null,
      rating: 4.4,
      reviews: 91,
      description: 'Tall wooden bookshelf with 5 adjustable shelves.',
      image: '📚',
      trending: false,
      bestseller: false
    },
    {
      _id: '12',
      name: 'Bar Stool Set',
      categoryName: 'Dining',
      category: 'dining',
      price: 8000,
      originalPrice: 10000,
      rating: 4.2,
      reviews: 67,
      description: 'Set of 2 adjustable bar stools with footrest.',
      image: '🪑',
      trending: false,
      bestseller: false
    }
  ];

  // Initialize mock data
  useEffect(() => {
    const initializeMockData = () => {
      setLoading(true);
      
      // Simulate API loading time
      setTimeout(() => {
        setCategories(mockCategories);
        
        // Transform products to match expected format
        const transformedProducts = mockProducts.map(product => ({
          ...product,
          price: `₹${product.price.toLocaleString()}`,
          originalPrice: product.originalPrice ? `₹${product.originalPrice.toLocaleString()}` : null,
          discount: product.originalPrice ? 
            `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%` : null,
        }));
        
        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        setLoading(false);
      }, 1000);
    };

    initializeMockData();
  }, []);

  // Filter products based on category and search
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory || 
        product.categoryName === selectedCategory
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Auto-rotating banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading FurniMart products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative h-96 overflow-hidden mb-8">
        <div className={`absolute inset-0 bg-gradient-to-r ${bannerSlides[currentSlide].bg} transition-all duration-1000`}>
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-2xl">
              <h2 className="text-5xl font-bold mb-4">{bannerSlides[currentSlide].title}</h2>
              <p className="text-xl mb-8">{bannerSlides[currentSlide].subtitle}</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <span>{bannerSlides[currentSlide].cta}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-6 border-b mb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 text-gray-700">
              <Truck className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Free Delivery</h3>
                <p className="text-sm text-gray-500">On orders above ₹25,000</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Quality Assured</h3>
                <p className="text-sm text-gray-500">Premium materials only</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Quick Installation</h3>
                <p className="text-sm text-gray-500">Professional setup included</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Gift className="w-8 h-8 text-pink-600" />
              <div>
                <h3 className="font-semibold">Easy Returns</h3>
                <p className="text-sm text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search furniture..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category._id)}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    selectedCategory === category._id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'all' ? 'All Products' : categories.find(c => c._id === selectedCategory)?.name} 
            <span className="text-gray-500 font-normal ml-2">({filteredProducts.length} products)</span>
          </h2>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Sort by: Popularity</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Customer Rating</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <p className="text-gray-400">Try adjusting your search or category filters</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product._id || product.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group border overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-50 flex items-center justify-center text-6xl p-8 group-hover:bg-gray-100 transition-colors">
                    {product.image}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.trending && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          Trending
                        </span>
                      )}
                      {product.bestseller && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Bestseller
                        </span>
                      )}
                      {product.discount && (
                        <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          {product.discount} OFF
                        </span>
                      )}
                    </div>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product._id || product.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          wishlist.has(product._id || product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Category */}
                    <p className="text-sm text-gray-500 mb-2">{product.categoryName}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    
                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    )}
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                Load More Products
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default FurniMart;