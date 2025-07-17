import React from 'react';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Information */}
        <div>
          <h4 className="font-bold text-xl mb-4">Furnimart</h4>
          <p className="text-gray-400 text-sm">
            Connecting manufacturers and customers directly, 
            revolutionizing the furniture shopping experience 
            with transparency and efficiency.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-xl mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Products</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Manufacturers</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="font-bold text-xl mb-4">Customer Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Shipping Information</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Returns & Exchanges</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">Order Tracking</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white">FAQs</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-bold text-xl mb-4">Contact Us</h4>
          <div className="space-y-2">
            <p className="text-gray-400">Email: support@furnimart.com</p>
            <p className="text-gray-400">Phone: +1 (555) 123-4567</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright and Legal */}
      <div className="border-t border-gray-800 mt-8 pt-6 text-center">
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Furnimart. All Rights Reserved.
          <span className="ml-4">
            <a href="#" className="hover:text-white">Privacy Policy</a> | 
            <a href="#" className="ml-2 hover:text-white">Terms of Service</a>
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;