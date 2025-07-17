// Sidebar.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const Sidebar = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
      </div>
      
      <div className="divide-y">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
              activeCategory?.name === category.name
                ? 'bg-orange-50 text-orange-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${
              activeCategory?.name === category.name
                ? 'text-orange-600'
                : 'text-gray-400'
            }`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;