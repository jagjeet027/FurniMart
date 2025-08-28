// ==================== src/components/common/LoadingSpinner.jsx ====================
import React from 'react';
import { Shield } from 'lucide-react';

const LoadingSpinner = ({ size = 'default', message = 'Loading...', showLogo = true }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const containerClasses = {
    small: 'p-4',
    default: 'min-h-screen',
    large: 'min-h-screen',
  };

  return (
    <div className={`bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center ${containerClasses[size]}`}>
      <div className="text-center">
        {showLogo && size !== 'small' && (
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`animate-spin rounded-full border-4 border-white/30 border-t-white ${sizeClasses[size]}`}></div>
          
          {size !== 'small' && (
            <div className="space-y-2">
              <p className="text-white font-medium">{message}</p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;