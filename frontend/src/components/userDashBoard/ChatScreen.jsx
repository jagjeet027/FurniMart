
import React, { useState } from 'react';
import {IssuesPanel} from './IssuesPanel';
import {ChatPanel} from './ChatPanel';

const responses = {
  'Beach Getaways': "Popular beach destinations include Bali, Maldives, and the Caribbean. Would you like specific recommendations?",
  'Mountain Treks': "Consider the Himalayas, Alps, or Andes for spectacular mountain adventures. Which region interests you?",
  'City Explorations': "Discover cultural landmarks in Paris, Tokyo, or New York. What type of city experience are you looking for?",
  'Hiking Tours': "From day hikes to multi-week treks, we can help plan your perfect hiking adventure. What's your experience level?",
  'Water Sports': "Try surfing, diving, or kayaking at top destinations worldwide. Which water sport interests you?",
  'Cultural Experiences': "Immerse yourself in local traditions, festivals, and cuisine. Which culture would you like to explore?",
  'Packing Tips': "Essential items include versatile clothing, comfortable shoes, and travel documents. Need a detailed packing list?",
  'Budget Planning': "Let's help you plan costs for transportation, accommodation, and activities. What's your budget range?",
  'Safety Advice': "Stay informed about local conditions, keep emergency contacts handy, and get travel insurance. Need specific safety tips?"
};

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);

  const handleTopicSelect = (topic) => {
    setMessages(prev => [
      ...prev,
      { type: 'user', content: topic },
      { type: 'bot', content: responses[topic] }
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Query To be asked by the customer!</h1>
        </div>
        <div className="flex">
          <IssuesPanel onTopicSelect={handleTopicSelect} />
          <ChatPanel messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;