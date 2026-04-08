import React, { useState } from 'react';
import { X } from 'lucide-react';

const ManufacturerDetailsModal = ({ manufacturer, onClose, onStatusUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusUpdate = async (status) => {
    setIsProcessing(true);
    setError(null);
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onStatusUpdate) {
        onStatusUpdate(manufacturer._id, status);
      }
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!manufacturer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b bg-gradient-to-r from-indigo-900 to-purple-900 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{manufacturer.businessName}</h2>
            <p className="text-indigo-200 mt-1">Registration: {manufacturer.registrationNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Business Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Business Type:</span> {manufacturer.businessType}</p>
                  <p><span className="font-medium">Year Established:</span> {manufacturer.yearEstablished}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-sm rounded-full
                      ${manufacturer.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        manufacturer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {manufacturer.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><span className="font-medium">Contact Person:</span> {manufacturer.contact?.contactPerson}</p>
                  <p><span className="font-medium">Email:</span> {manufacturer.contact?.email}</p>
                  <p><span className="font-medium">Phone:</span> {manufacturer.contact?.phone}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{manufacturer.address?.streetAddress}</p>
                  <p>{manufacturer.address?.city}, {manufacturer.address?.state} {manufacturer.address?.postalCode}</p>
                  <p>{manufacturer.address?.country}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Documents</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {manufacturer.documents?.businessLicense && (
                    <div>
                      <p className="font-medium">Business License</p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(manufacturer.documents.businessLicense.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {manufacturer.documents?.taxCertificate && (
                    <div>
                      <p className="font-medium">Tax Certificate</p>
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(manufacturer.documents.taxCertificate.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  {manufacturer.documents?.qualityCertifications && (
                    <div>
                      <p className="font-medium">Quality Certifications</p>
                      {manufacturer.documents.qualityCertifications.map((cert, index) => (
                        <div key={index} className="mt-2 text-sm text-gray-500">
                          <p>Type: {cert.certificationType}</p>
                          <p>Uploaded: {new Date(cert.uploadDate).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {manufacturer.status === 'pending' && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Review Decision</h3>
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Accept Registration'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Reject Registration'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerDetailsModal;