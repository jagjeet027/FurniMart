import React from 'react';
import { ArrowRight, Globe, Users, Package, TrendingUp, Shield } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                FurniMart
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Products</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Suppliers</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">About</a>
              <a href="#" className="text-gray-700 hover:text-amber-600 transition-colors">Contact</a>
            </nav>
            <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              Join Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-red-600 bg-clip-text text-transparent">
                    Choose FurniMart
                  </span>
                  <br />
                  <span className="text-gray-800">
                    for Your B2B Success
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  India's Premier B2B Furniture Marketplace connecting wholesalers and manufacturers across the globe. Sell bulk furniture products country to country with confidence.
                </p>
              </div>

              {/* Why Choose FurniMart */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Why Choose FurniMart?
                </h2>
                
                <div className="grid gap-4">
                  <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-xl backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Global Reach</h3>
                      <p className="text-gray-600">Connect with buyers and sellers worldwide. Expand your business across international markets.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-xl backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Verified Partners</h3>
                      <p className="text-gray-600">Trade with confidence through our verified network of wholesalers and manufacturers.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-xl backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Bulk Trading</h3>
                      <p className="text-gray-600">Specialized platform for bulk furniture trading with competitive wholesale pricing.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 bg-white/70 rounded-xl backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Secure Transactions</h3>
                      <p className="text-gray-600">Advanced security measures ensure safe and reliable business transactions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2 text-lg font-semibold">
                  <span>Start Selling</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border-2 border-amber-600 text-amber-700 px-8 py-4 rounded-xl hover:bg-amber-50 transition-all duration-300 text-lg font-semibold">
                  Explore Products
                </button>
              </div>
            </div>

            {/* Right Side - Pentagon Image Grid */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-8 items-center justify-center">
                
                {/* Pentagon 1 - Top Left */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 transform rotate-12 hover:rotate-0 transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-amber-500/25"
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                       }}>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Quality Products
                    </p>
                  </div>
                </div>

                {/* Pentagon 2 - Top Right */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 transform -rotate-12 hover:rotate-0 transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-orange-500/25"
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                       }}>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Global Network
                    </p>
                  </div>
                </div>

                {/* Pentagon 3 - Center */}
                <div className="relative group col-span-2 flex justify-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-red-400 to-pink-500 transform hover:scale-110 transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-red-500/25 z-10"
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                       }}>
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Users className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-base font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Trusted Partners
                    </p>
                  </div>
                </div>

                {/* Pentagon 4 - Bottom Left */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 transform rotate-6 hover:rotate-0 transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-pink-500/25"
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                       }}>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Growth Focus
                    </p>
                  </div>
                </div>

                {/* Pentagon 5 - Bottom Right */}
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-indigo-500 transform -rotate-6 hover:rotate-0 transition-all duration-500 flex items-center justify-center shadow-2xl hover:shadow-purple-500/25"
                       style={{
                         clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                       }}>
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                    <p className="text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Secure Trading
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-br from-red-200 to-pink-200 rounded-full opacity-40 animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">10k+</div>
              <div className="text-gray-600 mt-2">Active Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">50+</div>
              <div className="text-gray-600 mt-2">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">1M+</div>
              <div className="text-gray-600 mt-2">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">24/7</div>
              <div className="text-gray-600 mt-2">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;