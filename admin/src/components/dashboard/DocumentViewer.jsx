import React, { useState } from 'react';
import { Download, X, FileText, Calendar } from 'lucide-react';
import api from '../../axios/axiosInstance';

const DocumentViewer = ({ document: doc, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication required');
      }

      console.log('Downloading document:', doc.filename);
      
      const response = await api.get(`/manufacturers/documents/${doc.filename}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        },
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download using the global document object
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.filename);
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Document downloaded successfully');
      
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to download this document.');
      } else if (error.response?.status === 404) {
        setError('Document not found. The file may have been deleted.');
      } else {
        setError(error.response?.data?.message || 'Failed to download document. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-indigo-900 to-purple-900 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-white">{doc.type || 'Document'}</h3>
            <p className="text-indigo-200 text-sm mt-1">{doc.filename}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isLoading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isLoading ? 'Downloading...' : 'Download'}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <FileText className="h-4 w-4" />
                      <span>Document Type</span>
                    </div>
                    <p className="font-medium text-gray-900">{doc.type || 'Unknown'}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Upload Date</span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Filename</p>
                    <p className="font-medium text-gray-900 break-all">{doc.filename}</p>
                  </div>
                  {doc.certificationType && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Certificate Type</p>
                      <p className="font-medium text-gray-900">{doc.certificationType}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Note:</span> Click the download button above to save this document to your device.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { DocumentViewer };