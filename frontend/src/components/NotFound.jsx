import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft, Package, ShoppingBag, MessageCircle, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Home",
      description: "Back to homepage",
      path: "/",
      color: "blue"
    },
    {
      icon: <Package className="w-5 h-5" />,
      title: "Products",
      description: "Browse all products",
      path: "/products",
      color: "green"
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      title: "Categories",
      description: "Explore categories",
      path: "/categories/overview",
      color: "purple"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Support",
      description: "Get help",
      path: "/chat",
      color: "orange"
    }
  ];

  const colorClasses = {
    blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Main 404 Section */}
        <div className="text-center mb-12">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 leading-none animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-yellow-500 animate-bounce" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
              Oops! Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300 w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium hover:from-blue-700 hover:to-blue-800 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Popular Pages
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Here are some helpful links to get you started
            </p>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)}
                className={`group flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-r ${colorClasses[link.color]} text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  {link.icon}
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-semibold text-base sm:text-lg mb-0.5">
                    {link.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-white/90">
                    {link.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Search Suggestion */}
          <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">
                  Looking for something specific?
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Try searching for products or use our navigation menu
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Search Products →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="text-center mt-8 px-4">
          <p className="text-sm text-gray-500">
            Lost? Don't worry, even furniture gets rearranged sometimes! 🛋️
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;