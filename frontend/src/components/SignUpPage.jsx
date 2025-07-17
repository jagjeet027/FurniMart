import React, { useState, useEffect } from 'react';
import api from '../axios/axiosInstance.js'
import { useNavigate } from 'react-router-dom';
import { User, Lock, Smartphone, Mail } from 'lucide-react';

const SignupPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const navigate = useNavigate();
  
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setError('');
      setRemainingAttempts(3); // Reset attempts
      const response = await api.post('/api/users/send-otp', { 
        phone: `+91${phone}` 
      });
      
      console.log(response.data);
      setIsOtpSent(true);
      setCountdown(60); 
      if (response.data.developmentOTP) {
        alert(`Development OTP: ${response.data.developmentOTP}`);
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Failed to send OTP');
      setIsOtpSent(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
  
    try {
      console.log('Sending OTP:', {
        phone: `+91${phone}`, 
        otp: otp
      });
  
      const response = await api.post('/api/users/verify-otp', { 
        phone: `+91${phone}`, 
        otp 
      });
      
      setIsOtpVerified(true);
    } catch (error) {
      if (error.response && error.response.data.remainingAttempts !== undefined) {
        console.log('OTP Verification Error:', error.response.data);
        setRemainingAttempts(error.response.data.remainingAttempts);
        setError(`Invalid OTP. ${error.response.data.remainingAttempts} attempts remaining.`);
      } else {
        setError(error.response ? error.response.data.error : 'OTP verification failed');
      }
    }
  };
  const handleRegister = async () => {
    // Additional validations
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isOtpVerified) {
      setError('Please verify OTP first');
      return;
    }

    try {
      setError('');
      await api.post('/api/users/register', {
        name,
        email,
        phone: `+91${phone}`,
        password,
      });
      
      alert('Registration successful!');
      navigate('/login')
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Registration failed');
    }
  };

  const resetForm = () => {
    setPhone('');
    setOtp('');
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setCountdown(0);
    setRemainingAttempts(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
          <h2 className="text-4xl font-bold text-white">Create Account</h2>
          <p className="text-white/80 mt-2">Start your manufacturing journey</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          {!isOtpVerified ? (
            <div>
              <div className="relative mb-4">
                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Phone Number (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={isOtpSent}
                  maxLength={10}
                />
              </div>

              {!isOtpSent ? (
                <button
                  onClick={handleSendOtp}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center"
                >
                  Send OTP
                  <Lock className="ml-2" />
                </button>
              ) : (
                <div>
                  <div className="relative mb-4">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                    />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Remaining Attempts: {remainingAttempts}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleVerifyOtp}
                      className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Verify OTP
                    </button>
                    <button
                      onClick={() => {
                        setIsOtpSent(false);
                        setRemainingAttempts(3);
                      }}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="relative mb-4">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative mb-4">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition"
              >
                Complete Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage