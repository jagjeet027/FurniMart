import React from 'react';
import ManufacturerChat from '../components/manufacturer/ManufacturerChat';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ManufacturerChatPage = () => {
  const { user, isAuthenticated } = useAuth();

  // Redirect if not authenticated or not a manufacturer
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isManufacturer) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen w-full">
      <ManufacturerChat manufacturerId={user._id} />
    </div>
  );
};

export default ManufacturerChatPage;