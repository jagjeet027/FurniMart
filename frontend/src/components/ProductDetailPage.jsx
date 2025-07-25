import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Repeat, 
  Check, 
  Tag,
  Award,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import api from '../axios/axiosInstance';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [quantity, setQuantity] = useState(20);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        const productData = response.data.product;
        
        setSelectedProduct(productData);
        setSelectedSize(productData.sizes ? productData.sizes[0] : null);
        
        // Fetch similar products
        if (productData.category) {
          const similarResponse = await api.get(`/products`, {
            params: {
              category: productData.category,
              exclude: id,
              limit: 4
            }
          });
          
          if (similarResponse.data.products) {
            setSimilarProducts(similarResponse.data.products.filter(p => p._id !== id));
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleSimilarProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleBuyNow = () => {
    // Navigate to checkout page with the selected product details
    navigate('/checkout', {
      state: {
        product: selectedProduct,
        quantity: quantity,
        size: selectedSize
      }
    });
  };


  const handleQuantity = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 20) {
      setQuantity(prev => prev - 1);
    } else {
      alert('Order minimum is 20 products');
      setQuantity(20);
    }
  };
  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading product...</h2>
        </div>
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {error || "Product Not Found"}
          </h2>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition flex items-center justify-center space-x-2 inline-flex"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const availableSizes = selectedProduct.sizes || [];

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="container mx-auto grid lg:grid-cols-2 gap-6">
        {/* Left Side: Image Gallery */}
        <div className="space-y-4">
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <img 
              src={selectedProduct.images?.[selectedImage] || selectedProduct.image} 
              alt={selectedProduct.name} 
              className="w-full h-[400px] md:h-[500px] object-cover"
            />
            
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white">
                <Heart className="h-4 w-4 text-red-500" />
              </button>
              <button className="bg-white/80 p-2 rounded-full shadow-md hover:bg-white">
                <Repeat className="h-4 w-4 text-blue-500" />
              </button>
            </div>
          </div>
          {selectedProduct.images && selectedProduct.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {selectedProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`${selectedProduct.name} view ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{selectedProduct.name}</h1>
            <div className="flex flex-wrap items-center mt-2 space-x-2">
              <div className="flex">{renderRatingStars(selectedProduct.rating)}</div>
              <span className="text-sm text-gray-600">({selectedProduct.reviews || 0} Reviews)</span>
              <span className="text-sm text-green-600 flex items-center">
                <Check className="mr-1 h-4 w-4" /> In Stock
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center flex-wrap">
              <span className="text-3xl font-bold text-blue-600 mr-2">${selectedProduct.price}</span>
              {selectedProduct.discount && (
                <>
                  <span className="line-through text-gray-500 mr-2">
                    ${(selectedProduct.price * (1 + selectedProduct.discount/100)).toFixed(2)}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                    {selectedProduct.discount}% off
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Size Selection */}
          {availableSizes.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 text-sm border rounded-lg ${
                      selectedSize === size 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-base font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{selectedProduct.description}</p>
          </div>

          {/* Quantity */}
          <div className="flex items-center">
            <span className="mr-4 text-sm">Quantity:</span>
            <div className="flex items-center border rounded-lg text-sm">
              <button 
                onClick={handleQuantity}
                className="px-2 py-1 border-r"
              >
                -
              </button>
              <span className="px-3">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 border-l"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm">
              <ShoppingCart className="mr-2 h-4 w-4" /> Chat with Manufacturer
            </button>
            <button 
              className="bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 flex items-center justify-center text-sm"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>

          {/* Product Highlights */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 rounded-xl p-4">
              <Truck className="mx-auto mb-2 h-8 w-8 text-blue-500" />
              <span className="text-sm">Free Shipping</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <Shield className="mx-auto mb-2 h-8 w-8 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <Award className="mx-auto mb-2 h-8 w-8 text-purple-500" />
              <span className="text-sm">Quality Assured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="container mx-auto mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => handleSimilarProductClick(product._id)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
              >
                <img 
                  src={product.images?.[0] || product.image} 
                  alt={product.name}
                  className="w-full h-32 md:h-48 object-cover"
                />
                <div className="p-2 md:p-4">
                  <h3 className="text-sm md:text-base font-semibold truncate">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-1 md:mt-2">
                    <span className="text-sm md:text-base text-blue-600 font-bold">
                      ${product.price}
                    </span>
                    <div className="flex">
                      {renderRatingStars(product.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;