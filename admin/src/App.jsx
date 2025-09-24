import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ManufacturerDashboard from './components/dashboard/ManufacturerDashboard/ManufacturerDashboard';
import AuthProvider, { useAuth } from '../src/contexts/AuthContext.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-xl font-medium">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="text-white text-xl font-medium">Loading...</div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Main Auth Router Component
const AuthRouter = () => {
  const [currentView, setCurrentView] = useState('login');
  const { isRegistered, checkRegistrationStatus, securityQuestions } = useAuth();

  useEffect(() => {
    checkRegistrationStatus();
  }, [checkRegistrationStatus]);

  const handleSwitchToRegister = () => setCurrentView('register');
  const handleSwitchToLogin = () => setCurrentView('login');

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            {currentView === 'login' ? (
              <LoginPage 
                onSwitchToRegister={handleSwitchToRegister}
                useAuth={useAuth}
              />
            ) : (
              <RegisterPage 
                onSwitchToLogin={handleSwitchToLogin}
                securityQuestions={securityQuestions}
                useAuth={useAuth}
              />
            )}
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            {isRegistered === false ? (
              <RegisterPage 
                onSwitchToLogin={handleSwitchToLogin}
                securityQuestions={securityQuestions}
                useAuth={useAuth}
              />
            ) : (
              <Navigate to="/login" replace />
            )}
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <ManufacturerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect based on auth status */}
      <Route 
        path="/" 
        element={
          <Navigate to={isRegistered === false ? "/register" : "/login"} replace />
        } 
      />
      
      {/* Catch all route */}
      <Route 
        path="*" 
        element={
          <Navigate to="/" replace />
        } 
      />
    </Routes>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AuthRouter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;