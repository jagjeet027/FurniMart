// IssuesPanel.jsx
import React from 'react';

export const IssuesPanel = ({ topics, onTopicSelect }) => {
  const categories = {
    'Popular Destinations': [
      'how to login',
      'How to become a member of the Furnimart',
      'City Explorations'
    ],
    'Adventure Types': [
      'Hiking Tours',
      'Water Sports',
      'Cultural Experiences'
    ],
    'Travel Planning': [
      'Packing Tips',
      'Budget Planning',
      'Safety Advice'
    ]
  };

  return (
    <div className="w-1/3 border-r p-4">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-700">{category}</h3>
          <ul>
            {items.map(item => (
              <li 
                key={item}
                onClick={() => onTopicSelect(item)}
                className="py-2 px-3 hover:bg-gray-100 rounded cursor-pointer text-gray-600 hover:text-gray-900"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
