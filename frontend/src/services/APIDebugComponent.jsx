import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import api from '../axios/axiosInstance';

const APIDebugComponent = () => {
  const [results, setResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { name: 'Categories List', url: '/categories', method: 'GET' },
    { name: 'Categories (alt)', url: '/category', method: 'GET' },
    { name: 'Products List', url: '/products', method: 'GET' },
    { name: 'Products by Category (if you have category ID)', url: '/products/category/CATEGORY_ID', method: 'GET' },
    { name: 'Single Category (if you have category ID)', url: '/categories/CATEGORY_ID', method: 'GET' },
  ];

  const testEndpoint = async (endpoint) => {
    try {
      console.log(`Testing: ${endpoint.method} ${endpoint.url}`);
      
      let response;
      if (endpoint.method === 'GET') {
        response = await api.get(endpoint.url);
      }
      
      return {
        ...endpoint,
        status: 'success',
        statusCode: response.status,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        ...endpoint,
        status: 'error',
        statusCode: error.response?.status || 'Network Error',
        data: null,
        error: error.response?.data || error.message
      };
    }
  };

  const testAllEndpoints = async () => {
    setTesting(true);
    setResults([]);
    
    const testResults = [];
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      testResults.push(result);
      setResults([...testResults]); // Update results as we go
    }
    
    setTesting(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">API Endpoint Debugger</h2>
            <p className="text-gray-600">Test your backend API endpoints to identify issues</p>
          </div>
          <button
            onClick={testAllEndpoints}
            disabled={testing}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
          >
            <Play className="w-4 h-4 mr-2" />
            {testing ? 'Testing...' : 'Test All Endpoints'}
          </button>
        </div>

        <div className="space-y-4">
          {endpoints.map((endpoint, index) => {
            const result = results.find(r => r.url === endpoint.url);
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {result && getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">{endpoint.name}</h3>
                      <p className="text-sm text-gray-600">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                          {endpoint.method}
                        </span>
                        <span className="ml-2 font-mono">{endpoint.url}</span>
                      </p>
                    </div>
                  </div>
                  
                  {result && (
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        result.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {result.statusCode}
                      </span>
                      <button
                        onClick={() => testEndpoint(endpoint).then(res => {
                          const newResults = results.filter(r => r.url !== endpoint.url);
                          setResults([...newResults, res]);
                        })}
                        className="text-blue-600 hover:bg-blue-100 p-1 rounded"
                        title="Retry this endpoint"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mt-3 space-y-2">
                    {result.status === 'success' ? (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-green-800 font-semibold">✅ Success</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(result.data, null, 2))}
                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                            title="Copy response"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-green-700">
                          <p>Data type: {Array.isArray(result.data) ? 'Array' : typeof result.data}</p>
                          {Array.isArray(result.data) && <p>Array length: {result.data.length}</p>}
                          {result.data && typeof result.data === 'object' && (
                            <p>Keys: {Object.keys(result.data).join(', ')}</p>
                          )}
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-green-700 font-medium">View Response Data</summary>
                          <pre className="mt-2 bg-white border border-green-200 rounded p-2 text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-red-800 font-semibold">❌ Error</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(result.error, null, 2))}
                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                            title="Copy error"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-red-700 font-medium">View Error Details</summary>
                          <pre className="mt-2 bg-white border border-red-200 rounded p-2 text-xs overflow-auto max-h-40">
                            {JSON.stringify(result.error, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Recommendations:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {results.filter(r => r.status === 'success').length === 0 && (
                <p className="text-red-600">
                  ⚠️ No endpoints are working. Please check your backend server and API configuration.
                </p>
              )}
              
              {results.find(r => r.url === '/categories' && r.status === 'success') && (
                <p className="text-green-600">
                  ✅ Categories endpoint is working. Use /categories for fetching category list.
                </p>
              )}
              
              {results.find(r => r.url === '/products' && r.status === 'success') && (
                <p className="text-green-600">
                  ✅ Products endpoint is working. You can filter products by category on frontend.
                </p>
              )}
              
              {results.find(r => r.url.includes('/products/category/') && r.status === 'error') && (
                <p className="text-orange-600">
                  ⚠️ Category-specific product endpoint not available. Consider implementing /products/category/:id on your backend.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIDebugComponent;