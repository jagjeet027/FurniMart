import React, { useState } from 'react';
import { 
  Sofa, Lamp, Bed, Armchair, Table, 
  Utensils, BookOpen, 
  ShieldCheck, Star, Box, Blocks 
} from 'lucide-react';

const FurnitureShowcase = () => {
  const furnitureCategories = [
    {
      name: "Living Room",
      items: [
        { icon: <Sofa />, name: "Sectional Sofa", description: "Spacious and modular seating solution" },
        { icon: <Armchair />, name: "Accent Chair", description: "Stylish individual seating" },
        { icon: <Lamp />, name: "Floor Lamp", description: "Elegant lighting design" }
      ]
    },
    {
      name: "Bedroom",
      items: [
        { icon: <Bed />, name: "King Size Bed", description: "Luxurious sleeping experience" },
        { icon: <Blocks />, name: "Modular Wardrobe", description: "Customizable storage solution" },
        { icon: <Box />, name: "Bedside Chest", description: "Compact storage companion" }
      ]
    },
    {
      name: "Dining",
      items: [
        { icon: <Table />, name: "Dining Table", description: "Elegant gathering centerpiece" },
        { icon: <Utensils />, name: "Dining Chairs", description: "Comfortable seating ensemble" },
        { icon: <Utensils />, name: "Serving Trolley", description: "Functional dining accessory" }
      ]
    },
    {
      name: "Home Office",
      items: [
        { icon: <BookOpen />, name: "Study Desk", description: "Ergonomic workspace design" },
        { icon: <Star />, name: "Office Chair", description: "Comfort meets productivity" },
        { icon: <ShieldCheck />, name: "Bookshelf", description: "Stylish knowledge storage" }
      ]
    }
  ];
  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen overflow-hidden py-16 px-4">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-blob-slow"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-16">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
          Furniture Universe
        </h1>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto">
          Explore Our Comprehensive Furniture Collection
        </p>
      </div>

      {/* Marquee-like Floating Sections */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 z-20">
        {furnitureCategories.map((category, categoryIndex) => (
          <div 
            key={category.name}
            className="relative group transform transition-all duration-500 hover:scale-105 hover:rotate-3 hover:shadow-2xl"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-50 group-hover:opacity-75 transition-opacity blur-lg"></div>
            
            <div className="relative bg-white rounded-2xl p-6 shadow-xl overflow-hidden">
              <div className="flex items-center mb-4 space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  {category.items[0].icon}
                </div>
                <h2 className="text-2xl font-bold text-purple-800">
                  {category.name}
                </h2>
              </div>

              <div className="space-y-4">
                {category.items.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="flex items-center space-x-4 transform transition-transform hover:translate-x-2 hover:text-purple-600"
                  >
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Decorative Wave */}
      <svg 
        className="absolute bottom-0 left-0 w-full h-48 text-white opacity-80" 
        preserveAspectRatio="none" 
        viewBox="0 0 1440 320"
        fill="currentColor"
      >
        <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,229.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320L192,320L96,320L0,320Z"></path>
      </svg>

      {/* Additional Floating Elements */}
      <div className="absolute top-20 right-20 w-24 h-24 bg-purple-100 rounded-full animate-float opacity-50"></div>
      <div className="absolute bottom-20 left-20 w-16 h-16 bg-blue-100 rounded-full animate-float-slow opacity-40"></div>
    </div>
  );
};

export default FurnitureShowcase;