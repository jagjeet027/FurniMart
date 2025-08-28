import React from 'react';
import { Menu } from 'lucide-react';

const MobileMenuButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 
               rounded-full shadow-2xl flex items-center justify-center lg:hidden z-30
               hover:shadow-3xl transition-all duration-300 hover:scale-110"
  >
    <Menu className="h-6 w-6 text-white" />
  </button>
);

export default MobileMenuButton;