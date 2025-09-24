import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Lock, Zap, Shield, CheckCircle, AlertCircle, Loader2, UserCheck, RefreshCw, Clock } from 'lucide-react';

const Message = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-xs text-sm ${
      type === 'success' ? 'bg-emerald-600 text-white' : 
      type === 'warning' ? 'bg-amber-600 text-white' :
      'bg-red-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={16} /> : 
         type === 'warning' ? <AlertCircle size={16} /> :
         <AlertCircle size={16} />}
        <span>{message}</span>
      </div>
    </div>
  );
};

// NEW: Component to show token refresh status
const TokenStatus = ({ timeToExpiry, refreshing, onRefresh }) => {
  const [showStatus, setShowStatus] = useState(false);
  
  // Show status if token expires within 4 hours
  useEffect(() => {
    setShowStatus(timeToExpiry > 0 && timeToExpiry < (4 * 60 * 60 * 1000));
  }, [timeToExpiry]);

  if (!showStatus) return null;

  const hours = Math.floor(timeToExpiry / (60 * 60 * 1000));
  const minutes = Math.floor((timeToExpiry % (60 * 60 * 1000)) / (60 * 1000));

  return (
    <div className="fixed bottom-4 right-4 bg-amber-900/90 backdrop-blur-sm border border-amber-600/50 rounded-lg p-3 text-amber-200 text-sm max-w-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span>Session expires in {hours}h {minutes}m</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded text-xs transition-colors"
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

const LoginPage = ({ onSwitchToRegister, useAuth }) => {
  const { 
    login, 
    loading, 
    isRegistered, 
    checkingRegistration, 
    refreshing,
    timeToExpiry,
    manualRefreshToken,
    isAuthenticated 
  } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    adminId: 'ADmin820',
    password: '',
    secretCode: ''
  });

  const handleLogin = async () => {
    // Validate fields
    if (!formData.password.trim()) {
      setMessage({ text: 'Password is required', type: 'error' });
      return;
    }
    if (!formData.secretCode.trim()) {
      setMessage({ text: 'Secret code is required', type: 'error' });
      return;
    }

    setMessage({ text: 'Signing you in...', type: 'success' });
    
    const result = await login(formData);
    
    if (result.success) {
      setMessage({ text: 'Welcome back! Login successful.', type: 'success' });
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  // NEW: Handle manual token refresh
  const handleTokenRefresh = async () => {
    const result = await manualRefreshToken();
    
    if (result.success) {
      setMessage({ text: 'Session refreshed successfully!', type: 'success' });
    } else {
      setMessage({ text: result.error || 'Failed to refresh session', type: 'error' });
    }
  };

  // NEW: Show refresh status when user is authenticated but on login page
  // (This might happen during session restoration)
  useEffect(() => {
    if (refreshing) {
      setMessage({ text: 'Refreshing your session...', type: 'warning' });
    }
  }, [refreshing]);

  // Show loading state while checking registration
  if (checkingRegistration || isRegistered === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p className="text-cyan-200">Checking system status...</p>
          {refreshing && (
            <p className="text-amber-200 text-sm mt-2 flex items-center justify-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Refreshing session...
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4 overflow-hidden">
      {message && (
        <Message 
          message={message.text} 
          type={message.type} 
          onClose={() => setMessage(null)} 
        />
      )}

      {/* NEW: Token status component */}
      <TokenStatus 
        timeToExpiry={timeToExpiry}
        refreshing={refreshing}
        onRefresh={handleTokenRefresh}
      />
      
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block text-center">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                <UserCheck className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full animate-pulse"></div>
              {/* NEW: Show refresh indicator */}
              {refreshing && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <RefreshCw size={14} className="animate-spin text-amber-900" />
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-cyan-200 text-lg mb-8">Access your admin dashboard</p>
            
            {/* NEW: Show refresh status */}
            {refreshing && (
              <div className="mb-6 p-3 bg-amber-900/30 border border-amber-600/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-amber-200 text-sm">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Refreshing your session...</span>
                </div>
              </div>
            )}

            <div className="space-y-4 text-cyan-300 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Shield size={16} />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap size={16} />
                <span>Quick Access</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle size={16} />
                <span>Protected Dashboard</span>
              </div>
              {/* NEW: Auto-refresh feature indicator */}
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw size={16} />
                <span>Auto Session Refresh</span>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-2xl max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center lg:hidden relative">
                <UserCheck className="w-8 h-8 text-white" />
                {/* NEW: Mobile refresh indicator */}
                {refreshing && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <RefreshCw size={10} className="animate-spin text-amber-900" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-cyan-200 text-sm">Enter your credentials to continue</p>
              
              {/* NEW: Mobile refresh status */}
              {refreshing && (
                <div className="mt-3 p-2 bg-amber-900/30 border border-amber-600/30 rounded-lg lg:hidden">
                  <div className="flex items-center justify-center gap-2 text-amber-200 text-xs">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Refreshing session...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              {/* Admin ID (Read-only) */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <User size={14} className="mr-1" />
                  Admin ID
                </label>
                <input
                  type="text"
                  value={formData.adminId}
                  readOnly
                  className="w-full px-4 py-3 bg-cyan-900/20 border border-cyan-600/30 rounded-lg text-cyan-300 text-sm cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <Lock size={14} className="mr-1" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    disabled={loading || refreshing}
                    className="w-full px-4 py-3 pr-10 bg-cyan-900/30 border border-cyan-600/50 rounded-lg text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || refreshing}
                    className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Secret Code */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <Zap size={14} className="mr-1" />
                  Secret Code
                </label>
                <input
                  type="password"
                  value={formData.secretCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretCode: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  disabled={loading || refreshing}
                  className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-600/50 rounded-lg text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all disabled:opacity-50"
                  placeholder="Enter your secret code"
                />
              </div>

              {/* Login Button */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={handleLogin}
                  disabled={loading || refreshing || !formData.password.trim() || !formData.secretCode.trim()}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Signing In...</span>
                    </div>
                  ) : refreshing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="animate-spin" size={16} />
                      <span>Refreshing Session...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <UserCheck size={16} />
                      <span>Sign In</span>
                    </div>
                  )}
                </button>

                {/* NEW: Manual refresh button (only show if authenticated but session needs refresh) */}
                {isAuthenticated && timeToExpiry > 0 && timeToExpiry < (4 * 60 * 60 * 1000) && (
                  <button
                    onClick={handleTokenRefresh}
                    disabled={refreshing}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 rounded-lg font-medium text-sm hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all"
                  >
                    {refreshing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Refreshing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw size={14} />
                        <span>Refresh Session</span>
                      </div>
                    )}
                  </button>
                )}

                {/* Register Link - Only show if not registered */}
                {!isRegistered && (
                  <div className="text-center">
                    <span className="text-cyan-300 text-sm">Need to create an account? </span>
                    <button
                      onClick={onSwitchToRegister}
                      disabled={loading || refreshing}
                      className="text-cyan-400 text-sm font-medium hover:text-cyan-300 underline transition-colors disabled:opacity-50"
                    >
                      Register Now
                    </button>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="pt-4 border-t border-cyan-700/50">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="text-cyan-400">
                    <Shield size={18} className="mx-auto mb-1" />
                    <span className="text-xs">Encrypted</span>
                  </div>
                  <div className="text-cyan-400">
                    <Lock size={18} className="mx-auto mb-1" />
                    <span className="text-xs">Secure</span>
                  </div>
                  <div className="text-cyan-400">
                    <CheckCircle size={18} className="mx-auto mb-1" />
                    <span className="text-xs">Protected</span>
                  </div>
                  {/* NEW: Auto-refresh indicator */}
                  <div className={`transition-colors ${refreshing ? 'text-amber-400' : 'text-cyan-400'}`}>
                    <RefreshCw size={18} className={`mx-auto mb-1 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="text-xs">Auto-Refresh</span>
                  </div>
                </div>
              </div>

              {/* NEW: Session info (for debugging/info purposes) */}
              {timeToExpiry > 0 && (
                <div className="pt-3 border-t border-cyan-700/30">
                  <div className="text-center text-cyan-400 text-xs">
                    {(() => {
                      const hours = Math.floor(timeToExpiry / (60 * 60 * 1000));
                      const minutes = Math.floor((timeToExpiry % (60 * 60 * 1000)) / (60 * 1000));
                      return (
                        <div className="flex items-center justify-center gap-2">
                          <Clock size={12} />
                          <span>Session: {hours}h {minutes}m remaining</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;