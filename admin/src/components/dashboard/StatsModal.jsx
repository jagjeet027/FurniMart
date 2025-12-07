import React, { useState } from 'react';
import { Search, X, ArrowUpDown, Printer, Eye } from 'lucide-react';

const StatsModal = ({ title, manufacturers, onClose }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'businessName', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);

  // Sort function
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Filter and sort data
  const filteredAndSortedData = manufacturers ? [...manufacturers]
    .filter(m => 
      m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.status?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, k) => obj?.[k], a) : 
        a[sortConfig.key];
      let bVal = sortConfig.key.includes('.') ? 
        sortConfig.key.split('.').reduce((obj, k) => obj?.[k], b) : 
        b[sortConfig.key];
      
      aVal = aVal ?? '';
      bVal = bVal ?? '';
      
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? 
          aVal.localeCompare(bVal) : 
          bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }) : [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-11/12 max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-indigo-900 to-purple-900">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-indigo-200 mt-1">
                Showing {filteredAndSortedData.length} of {manufacturers?.length || 0} manufacturers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
                onClick={() => window.print()}
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search manufacturers..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  { label: 'Business Name', key: 'businessName' },
                  { label: 'Registration', key: 'registrationNumber' },
                  { label: 'Business Type', key: 'businessType' },
                  { label: 'Status', key: 'status' },
                  { label: 'Revenue', key: 'revenue' },
                  { label: 'Country', key: 'address.country' }
                ].map(({ label, key }) => (
                  <th 
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {label}
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedData.map((manufacturer) => (
                <tr key={manufacturer._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{manufacturer.businessName}</div>
                      <div className="text-sm text-gray-500">{manufacturer.contact?.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {manufacturer.registrationNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {manufacturer.businessType}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      manufacturer.status === 'approved' ? 'bg-green-100 text-green-800' :
                      manufacturer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {manufacturer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    ${manufacturer.revenue?.toLocaleString() ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {manufacturer.address?.country ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedManufacturer(manufacturer)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;