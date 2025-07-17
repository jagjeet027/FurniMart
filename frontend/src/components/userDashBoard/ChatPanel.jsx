// ChatPanel.jsx
import React from 'react';

export const ChatPanel = ({ messages }) => {
  return (
    <div className="w-2/3 p-4">
      <div className="h-[500px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-4 ${
              msg.type === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
              msg.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
