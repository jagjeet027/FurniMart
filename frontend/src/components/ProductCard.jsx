import React, { useState, useEffect } from 'react';
import { Star, Share2, Heart, ShoppingCart, Eye, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, updateWishlist, listView = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Check if product is in wishlist when component mounts
  useEffect(() => {
    checkWishlistStatus();
  }, [product._id]);

  // Listen for wishlist updates
  useEffect(() => {
    const handleWishlistUpdate = (event) => {
      if (event.detail && event.detail.productId === product._id) {
        setIsInWishlist(event.detail.inWishlist);
      } else {
        checkWishlistStatus();
      }
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, [product._id]);

  const checkWishlistStatus = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsInWishlist(wishlist.some(item => item._id === product._id));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      setIsInWishlist(false);
    }
  };
  
  const handleViewClick = () => {
    navigate(`/products/${product._id}`);
  };
  
  const handleWishlistClick = (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      let newWishlist;
      
      if (isInWishlist) {
        newWishlist = wishlist.filter(item => item._id !== product._id);
      } else {
        newWishlist = [...wishlist, {
          _id: product._id,
          name: product.name,
          price: product.price,
          rating: product.rating,
          reviews: product.reviews,
          image: product.image,
          images: product.images
        }];
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(!isInWishlist);
      
      if (updateWishlist) {
        updateWishlist(newWishlist);
      }
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('wishlistUpdated', { 
        detail: { 
          productId: product._id,
          inWishlist: !isInWishlist,
          wishlist: newWishlist
        } 
      }));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };
  
  const handleShareClick = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Product link copied to clipboard!');
      });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Add to cart logic here
    console.log('Add to cart:', product._id);
  };

  const handleImageHover = (index) => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex(index);
    }
  };

  const renderRatingStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        className={`w-4 h-4 ${index < (rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const currentImage = productImages[currentImageIndex] || product.image;

  if (listView) {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative sm:w-1/3 h-64 sm:h-48">
            <img
              src={currentImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            )}
            
            {/* Image Indicators */}
            {productImages.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Discount Badge */}
            {product.discount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                {product.discount}% OFF
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                  {product.manufacturer && (
                    <p className="text-xs text-gray-500">by {product.manufacturer}</p>
                  )}
                </div>
                <div className="flex flex-col items-end ml-4">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  {product.discount && (
                    <span className="text-sm text-gray-500 line-through">
                      ${(product.price * (1 + product.discount/100)).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-3">
                  {renderRatingStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">({product.reviews || 0} reviews)</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex space-x-2">
                  <button 
                    onClick={handleWishlistClick}
                    className={`p-2 rounded-full transition-all ${
                      isInWishlist 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    onClick={handleShareClick}
                    className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all"
                    title="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddToCart}
                    className="px-3 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleViewClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleViewClick}
    >
      <div className="relative">
        <div 
          className="relative h-64 bg-gray-100 overflow-hidden"
          onMouseEnter={() => handleImageHover(1)}
          onMouseLeave={() => handleImageHover(0)}
        >
          <img
            src={currentImage}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleWishlistClick}
            className={`p-2 rounded-full shadow-md transition-all ${
              isInWishlist 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-white/90 text-gray-600 hover:bg-white'
            }`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={handleShareClick}
            className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all"
            title="Share product"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewClick();
            }}
            className="p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all"
            title="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-md">
            <Tag className="w-3 h-3 inline mr-1" />
            {product.discount}% OFF
          </div>
        )}

        {/* Image Indicators */}
        {productImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {productImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Product Info */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
          {product.manufacturer && (
            <p className="text-xs text-gray-500">by {product.manufacturer}</p>
          )}
        </div>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-blue-600">${product.price}</span>
            {product.discount && (
              <span className="text-sm text-gray-500 line-through">
                ${(product.price * (1 + product.discount/100)).toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              {renderRatingStars(product.rating)}
            </div>
            <span className="text-xs text-gray-600">({product.reviews || 0} reviews)</span>
          </div>
        </div>

        {/* Product Features/Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add to Cart
          </button>
          <button
            onClick={handleViewClick}
            className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;