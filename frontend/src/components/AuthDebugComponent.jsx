import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Cookies from 'js-cookie';

const AuthDebugComponent = () => {
  const { getAuthStatus, user, logout } = useAuth();

  const authStatus = getAuthStatus();
  
  const handleClearAll = () => {
    localStorage.clear();
    Cookies.remove('refreshToken');
    window.location.reload();
  };

  const handleForceLogin = () => {
    // Simulate a login for testing
    const testUser = { id: 1, email: 'test@example.com', name: 'Test User' };
    const testToken = 'test-token-123';
    
    localStorage.setItem('accessToken', testToken);
    localStorage.setItem('userData', JSON.stringify(testUser));
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Authenticated:</strong> 
          <span className={authStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {authStatus.isAuthenticated ? ' ✓ Yes' : ' ✗ No'}
          </span>
        </div>
        
        <div>
          <strong>Loading:</strong> 
          <span className={authStatus.isLoading ? 'text-yellow-600' : 'text-green-600'}>
            {authStatus.isLoading ? ' ⏳ Yes' : ' ✓ No'}
          </span>
        </div>
        
        <div>
          <strong>Init Complete:</strong> 
          <span className={authStatus.initComplete ? 'text-green-600' : 'text-yellow-600'}>
            {authStatus.initComplete ? ' ✓ Yes' : ' ⏳ No'}
          </span>
        </div>
        
        <div>
          <strong>Access Token:</strong> 
          <span className={authStatus.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
            {authStatus.hasAccessToken ? ' ✓ Present' : ' ✗ Missing'}
          </span>
        </div>
        
        <div>
          <strong>Refresh Token:</strong> 
          <span className={authStatus.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
            {authStatus.hasRefreshToken ? ' ✓ Present' : ' ✗ Missing'}
          </span>
        </div>
        
        <div>
          <strong>User Data:</strong> 
          <span className={authStatus.hasUserData ? 'text-green-600' : 'text-red-600'}>
            {authStatus.hasUserData ? ' ✓ Present' : ' ✗ Missing'}
          </span>
        </div>

        {user && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <button 
          onClick={handleClearAll}
          className="w-full px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Clear All Data
        </button>
        
        <button 
          onClick={handleForceLogin}
          className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Force Test Login
        </button>
        
        {authStatus.isAuthenticated && (
          <button 
            onClick={logout}
            className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthDebugComponent;