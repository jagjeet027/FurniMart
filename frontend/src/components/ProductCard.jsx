import React from 'react';
import { Star, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  
  const handleViewClick = () => {
    // Open in new tab by using window.open instead of navigate
    window.open(`/products/${product._id}`, '_blank');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {product.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
            {product.discount}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.name}</h3>
          <span className="text-lg font-bold text-orange-600">${product.price}</span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < (product.rating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.reviews || 0} reviews)</span>
          </div>
          <span className="text-sm text-gray-500">{product.manufacturer}</span>
        </div>

        <button
          onClick={handleViewClick}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard;