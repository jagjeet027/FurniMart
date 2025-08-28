import React, { useState } from 'react';
import { CheckCircle, Download, X } from 'lucide-react';
import api from '../../../axios/axiosInstance';

const DocumentViewer = ({ document, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      const response = await api.get(`/manufacturers/documents/${document.filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-4 border-b bg-gradient-to-r from-indigo-900 to-purple-900 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">{document.filename}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-600">
                <p>Document Type: {document.type || 'Unknown'}</p>
                <p>Upload Date: {new Date(document.uploadDate).toLocaleDateString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  Click the download button above to view the document
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