import React, { useState, useEffect } from 'react';
import { User, Eye, EyeOff, Mail, Zap, Shield, CheckCircle, AlertCircle, Loader2, Check, X } from 'lucide-react';

const Message = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-xs text-sm ${
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
        <span>{message}</span>
      </div>
    </div>
  );
};

const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    const calculateStrength = (pwd) => {
      let score = 0;
      if (pwd.length >= 8) score += 1;
      if (/[a-z]/.test(pwd)) score += 1;
      if (/[A-Z]/.test(pwd)) score += 1;
      if (/\d/.test(pwd)) score += 1;

      const levels = [
        { score: 0, label: 'Weak', color: 'bg-red-500' },
        { score: 1, label: 'Fair', color: 'bg-yellow-500' },
        { score: 2, label: 'Good', color: 'bg-blue-500' },
        { score: 3, label: 'Strong', color: 'bg-green-500' },
        { score: 4, label: 'Excellent', color: 'bg-emerald-500' }
      ];

      return levels[score] || levels[0];
    };

    setStrength(calculateStrength(password));
  }, [password]);

  if (!password) return null;

  return (
    <div className="mt-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-cyan-300">Strength</span>
        <span className="text-xs text-white">{strength.label}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>
    </div>
  );
};

const RegisterPage = ({ onSwitchToLogin, useAuth }) => {
  const { register, loading, isRegistered, checkingRegistration } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    secretCode: ''
  });

  const [validation, setValidation] = useState({
    email: false,
    password: false,
    secretCode: false
  });

  // Validate form fields
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordValid = formData.password.length >= 8 && 
                         /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password);
    
    setValidation({
      email: emailRegex.test(formData.email),
      password: passwordValid,
      secretCode: formData.secretCode.length >= 4
    });
  }, [formData]);

  const handleRegister = async () => {
    // Validate all fields
    if (!validation.email) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    if (!validation.password) {
      setMessage({ text: 'Password must be at least 8 characters with uppercase, lowercase, and number', type: 'error' });
      return;
    }
    if (!validation.secretCode) {
      setMessage({ text: 'Secret code must be at least 4 characters', type: 'error' });
      return;
    }

    setMessage({ text: 'Creating account...', type: 'success' });
    
    const result = await register(formData);
    
    if (result.success) {
      setMessage({ text: 'Account created successfully! Welcome!', type: 'success' });
    } else {
      setMessage({ text: result.error, type: 'error' });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  // Show loading state while checking registration
  if (checkingRegistration || isRegistered === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p className="text-cyan-200">Checking registration status...</p>
        </div>
      </div>
    );
  }

  // Show message if already registered
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-cyan-800 to-blue-900 flex items-center justify-center p-4">
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/30 shadow-2xl text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-4">Registration Disabled</h2>
          <p className="text-cyan-200 mb-6">Admin is already registered. Only one admin account is allowed.</p>
          <button
            onClick={onSwitchToLogin}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all transform hover:scale-105 active:scale-95"
          >
            Go to Login
          </button>
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
      
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="hidden lg:block text-center">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                <User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-cyan-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Join the Adventure</h1>
            <p className="text-cyan-200 text-lg mb-8">Create your admin account</p>
            <div className="space-y-4 text-cyan-300 text-sm">
              <div className="flex items-center justify-center space-x-2">
                <Shield size={16} />
                <span>Secure & Protected</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Zap size={16} />
                <span>Lightning Fast Setup</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle size={16} />
                <span>Easy Management</span>
              </div>
            </div>
          </div>

          {/* Right side - Registration Form */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-cyan-500/30 shadow-2xl max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center lg:hidden">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Admin Account</h2>
              <p className="text-cyan-200 text-sm">Secure registration with enhanced protection</p>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <Mail size={14} className="mr-1" />
                  Email Address
                  {validation.email && <Check size={12} className="ml-1 text-emerald-400" />}
                  {formData.email && !validation.email && <X size={12} className="ml-1 text-red-400" />}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-600/50 rounded-lg text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  placeholder="admin@company.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <Shield size={14} className="mr-1" />
                  Password
                  {validation.password && <Check size={12} className="ml-1 text-emerald-400" />}
                  {formData.password && !validation.password && <X size={12} className="ml-1 text-red-400" />}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 pr-10 bg-cyan-900/30 border border-cyan-600/50 rounded-lg text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    placeholder="Create secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
                <p className="text-cyan-400 text-xs mt-1">Must contain uppercase, lowercase, and number</p>
              </div>

              {/* Secret Code */}
              <div>
                <label className="flex items-center text-cyan-200 text-sm font-medium mb-2">
                  <Zap size={14} className="mr-1" />
                  Secret Code
                  {validation.secretCode && <Check size={12} className="ml-1 text-emerald-400" />}
                  {formData.secretCode && !validation.secretCode && <X size={12} className="ml-1 text-red-400" />}
                </label>
                <input
                  type="password"
                  value={formData.secretCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretCode: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 bg-cyan-900/30 border border-cyan-600/50 rounded-lg text-white placeholder-cyan-300 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  placeholder="Enter your secret access code"
                />
                <p className="text-cyan-400 text-xs mt-1">Minimum 4 characters required</p>
              </div>

              {/* Register Button */}
              <div className="space-y-4 pt-2">
                <button
                  onClick={handleRegister}
                  disabled={loading || !validation.email || !validation.password || !validation.secretCode}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold text-sm hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield size={16} />
                      <span>Create Admin Account</span>
                    </div>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-cyan-300 text-sm">Already have an account? </span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-cyan-400 text-sm font-medium hover:text-cyan-300 underline transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="pt-4 border-t border-cyan-700/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="text-cyan-400">
                    <Shield size={20} className="mx-auto mb-1" />
                    <span className="text-xs">Encrypted</span>
                  </div>
                  <div className="text-cyan-400">
                    <Zap size={20} className="mx-auto mb-1" />
                    <span className="text-xs">Fast Setup</span>
                  </div>
                  <div className="text-cyan-400">
                    <CheckCircle size={20} className="mx-auto mb-1" />
                    <span className="text-xs">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;