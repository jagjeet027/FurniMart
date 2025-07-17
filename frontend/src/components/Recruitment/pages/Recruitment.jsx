import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, Star, Mountain } from 'lucide-react';

const Recruitment = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleExplore = () => {
    navigate('/staff/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-100 to-purple-200 text-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="w-full lg:w-1/2">
            <div className="relative h-[500px] sm:h-[600px] transform-gpu transition-all duration-700 hover:scale-105">
              {/* Updated image containers with landscape orientation */}
              <div className="absolute top-0 left-0 w-80 sm:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden transform rotate-[-12deg] hover:rotate-[-8deg] transition-all duration-500 shadow-xl hover:shadow-orange-300/50 group">
                <img
                  src="src/components/Recruitment/pages/orgimg3.jpg"
                  alt="Adventure Team"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="absolute top-20 left-16 w-80 sm:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden transform rotate-[4deg] hover:rotate-[8deg] transition-all duration-500 shadow-xl hover:shadow-rose-300/50 group">
                <img
                  src="src/components/Recruitment/pages/orgimge2.jpg"
                  alt="Innovation"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              <div className="absolute top-40 left-4 w-80 sm:w-96 h-56 sm:h-64 rounded-2xl overflow-hidden transform rotate-[-4deg] hover:rotate-[0deg] transition-all duration-500 shadow-xl hover:shadow-purple-300/50 group">
                <img
                  src="src/components/Recruitment/pages/orgimg1.jpg"
                  alt="Exploration"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              <Mountain className="absolute -top-4 -right-4 w-12 h-12 text-orange-400 animate-float" />
              <Star className="absolute bottom-8 -right-4 w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>

          {/* Right side content remains the same */}
          <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-800">
                Begin Your Epic
                <span className="block mt-2 bg-gradient-to-r from-orange-400 to-purple-600 bg-clip-text text-transparent">Adventure</span>
              </h1>
              <div className="absolute -top-6 -right-6 w-12 h-12 border-4 border-orange-400/30 rounded-full animate-spin-slow"></div>
            </div>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Ready to be part of something extraordinary? Join our tribe of innovators, 
              dreamers, and change-makers. Your journey to greatness starts here.
            </p>

            <div className="relative mt-12 py-8">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 transform -translate-y-1/2"></div>
              <div className="relative flex justify-between">
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Start</span>
                </div>
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Mountain className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Grow</span>
                </div>
                <div className="flex flex-col items-center space-y-2 group">
                  <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Lead</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExplore}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative inline-flex items-center px-8 py-4 text-lg font-bold overflow-hidden rounded-full bg-gradient-to-r from-orange-400 to-purple-500 text-white transition-all duration-300 hover:from-orange-500 hover:to-purple-600 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <ArrowRight 
                  className={`w-6 h-6 transition-transform duration-300 ${
                    isHovered ? 'translate-x-2' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(0, -40px) scale(1); }
          75% { transform: translate(-20px, -20px) scale(0.9); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Recruitment;