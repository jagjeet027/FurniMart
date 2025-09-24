// Create a new component: ManufacturerProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ManufacturerProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is manufacturer and approved
  const isApprovedManufacturer = user?.isManufacturer && 
                                user?.manufacturerStatus === 'approved' && 
                                user?.manufacturerApproved === true;

  if (!isApprovedManufacturer) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ManufacturerProtectedRoute;

// Usage in your main router file (App.js or routes):
// import ManufacturerProtectedRoute from './components/ManufacturerProtectedRoute';

// <Route 
//   path="/manufacturer/dashboard/*" 
//   element={
//     <ManufacturerProtectedRoute>
//       <ManufacturerDashboard />
//     </ManufacturerProtectedRoute>
//   } 
// />