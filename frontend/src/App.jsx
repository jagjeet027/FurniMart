import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from './components/Header';
import FurnitureMarketplace from './FurnitureMarketplace';
import ServiceSection from './components/ServiceSection';
import Banner from './components/Banner';
import CardSection from './components/CardSection';
import LoginPage from './components/LoginPage';
import './index.css';
import Footer from './components/Footer';
import SignupPage from './components/SignUpPage';
import FurnitureShowcase from './components/FurnitureShowcase';
// import Map from './components/Map';
import CategoryList from "./components/CategoryList";
import CategoryDetail from "./components/CategoryDetails";
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/manufacturer/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProductDetailPage from './components/ProductDetailPage';
import ManufacturerRegistration from './components/manufacturer/ManufacturerRegistration';
import PremiumFeatures from './components/manufacturer/PremiumFeatures'
import HomePage from './services/AuthService.jsx';
import Profile from './components/manufacturer/Profile';
import Recruitment from './components/Recruitment/pages/Recruitment';
import StaffHiring from './components/Recruitment/pages/StaffHiring'
import Faq from './components/Faqsection/Faq.jsx'
import Orders from './pages/CheckoutPage.jsx'
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import ChatScreen from './components/userDashBoard/ChatScreen.jsx';
import ProductManagement from './components/manufacturer/ProductManagement';
import EditProduct from './components/manufacturer/EditProduct.jsx';
import CheckoutPage from './pages/CheckoutPage';
import Admin from './components/admin/Admin.jsx';
import ManufactDetailsAdmin from './components/admin/ManufactDetailsAdmin.jsx';
import Userdashboard from './components/admin/Userdashboard.jsx';

// import ChatBot from './components/ChatBot.jsx';

// import { CartProvider, Navbar,Home } from '../src/components/Ecomerse.jsx';

import { socket } from "./services/socketService";

const App = () => {
  const location = useLocation();
  const [issues, setIssues] = useState({});
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Socket event handlers
    const handleSupportIssues = (data) => setIssues(data);
    const handleIssueResponse = (data) => {
      setMessages((prev) => [ 
        ...prev,
        {
          type: "response",
          title: data.issue,
          content: data.response,
        },
      ]);
    };
    socket.on("supportIssues", handleSupportIssues);
    socket.on("issueResponse", handleIssueResponse);
    return () => {
      socket.off("supportIssues", handleSupportIssues);
      socket.off("issueResponse", handleIssueResponse);
    };
  }, []);

  const handleIssueClick = (key) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "issue",
        title: issues[key].title,
        content: issues[key].title,
      },
    ]);
    socket.emit("selectIssue", key);
  };

  // Paths that should not show header/footer
  const noHeaderFooterPaths = [
    '/admin',
    '/admin/manufacturer/dashboard',
    '/userdashboard',

    
    '/manufacturer/register',
    '/manufacturer/dashboard',
    '/manufactdetails',
    '/inventory',
    '/order',
    '/premium',
    '/manufacturer/faqsection',
    '/products/management',
  ];

  // Improved check for paths that should hide header/footer
  const shouldHideHeaderFooter = noHeaderFooterPaths.some(
    (path) => {
      // For exact paths
      if (!path.includes(':')) {
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
      }
      // For parameterized paths
      return new RegExp(`^${path.replace(/:\w+/g, '[^/]+')}$`).test(location.pathname);
    }
  );

  // Special check for product management vs product details
  const isProductManagementPath = location.pathname === '/products' || location.pathname.startsWith('/products/management');
  const isProductDetailsPath = location.pathname.match(/^\/products\/[^/]+$/) && !isProductManagementPath;

  // Final decision on header/footer visibility
  const hideHeaderFooter = shouldHideHeaderFooter && !isProductDetailsPath;

  // Check if current path should have mobile footer
  const shouldShowMobileFooter = !hideHeaderFooter && !location.pathname.startsWith('/manufacturer/dashboard');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        {!hideHeaderFooter && <Header />}
        
        {/* Main Content */}
        <main className={`flex-1 ${shouldShowMobileFooter ? 'pb-16 md:pb-0' : ''}`}>
          <Routes>
            <Route path="/chatsupport" element={<Navigate to="/chat" />} />
            <Route path="/chat" element={<ChatScreen issues={issues} messages={messages} onIssueSelect={handleIssueClick} />} />
            <Route path="/" element={
              <div className="space-y-0">
                <FurnitureMarketplace />
                <Recruitment/>
                <FurnitureShowcase />
                <ServiceSection />
                <Banner />
                <CardSection />
                <Faq/>
              </div>
            } />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/manufactdetails" element ={<ManufactDetailsAdmin/>}/>
        <Route path="/userdashboard/*" element={<Userdashboard />} />



            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<Profile/>} />
            <Route path="/order" element={<Orders />} />
            <Route path="/products" element={<ProductManagement />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/category/:id" element={<CategoryDetail />} />
            <Route path="/products/:id/edit" element={<EditProduct />} />
            <Route path="/faqsection" element={<Faq />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/manufacturer/register" element={<ManufacturerRegistration />} />
            <Route path="/furniture" element={<FurnitureMarketplace />} />
            <Route path="/manufacturer/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
            <Route path="/hompageStaff" element={<HomePage />} />
            <Route path="/premium" element={<PremiumFeatures />}/>
            <Route path="/staff/dashboard"  element={<StaffHiring/>}/>
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/order-tracking" element={<OrderTrackingPage />} />
          </Routes>
        </main>

        {/* Footer */}
        {!hideHeaderFooter && <Footer />}
      </div>
    </AuthProvider>
  );
};

const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;