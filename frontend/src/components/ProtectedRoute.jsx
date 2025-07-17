// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

// ProtectedRoute.js
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return token ? children : null;
};

export default ProtectedRoute