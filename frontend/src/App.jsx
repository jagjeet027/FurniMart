// App.js - Updated routing configuration

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from './components/Header';
import FurnitureMarketplace from './FurnitureMarketplace';
import LoginPage from './components/LoginPage';
import './index.css';
import Footer from './components/Footer';
import SignupPage from './components/SignUpPage';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './components/manufacturer/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProductCard from './components/ProductCardDetails.jsx';
import ProductDetailPage from './components/ProductDetailPage';
import ManufacturerRegistration from './components/manufacturer/ManufacturerRegistration';
import PremiumFeatures from './components/manufacturer/PremiumFeatures'
import IssuesPage from './components/manufacturer/IdeaPage.jsx';
import IssueDetailPage from './components/manufacturer/IdeaDetailPage.jsx';
import Profile from './components/manufacturer/Profile';
import StaffHiring from './components/Recruitment/pages/StaffHiring'
import Faq from './components/Faqsection/Faq.jsx'
import Orders from './orderpages/CheckoutPage.jsx'
import OrderTrackingPage from './orderpages/OrderTrackingPage.jsx';
import ChatScreen from './components/userDashBoard/ChatScreen.jsx';
import ProductManagement from './components/manufacturer/ProductManagement';
import EditProduct from './components/manufacturer/EditProduct.jsx';
import CheckoutPage from './orderpages/CheckoutPage.jsx';
import WishlistPage from './orderpages/wishlistPage.jsx';
import CartPage from './orderpages/CartPage.jsx';
import CategoryProductsPage from './components/userDashBoard/CategoryProductsPage.jsx';
import CategoriesOverviewPage from './components/userDashBoard/CategoriesOverviewPage.jsx';
import APIDebugComponent from './services/APIDebugComponent.jsx';
import CareerHomePage from './careerPortal/CareerHomePage.jsx';

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
    '/ideas',
    '/idea/:id',
    '/manufacturer/register',
    '/manufacturer/dashboard',
    '/manufactdetails',
    '/inventory',
    '/order',
    '/premium',
    '/manufacturer/faqsection',
    '/products/management',
    '/categories/management',
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

  const isProductManagementPath = location.pathname === '/products' || location.pathname.startsWith('/products/management');
  const isProductDetailsPath = location.pathname.match(/^\/products\/[^/]+$/) && !isProductManagementPath;

  const hideHeaderFooter = shouldHideHeaderFooter && !isProductDetailsPath;
  const shouldShowMobileFooter = !hideHeaderFooter && !location.pathname.startsWith('/manufacturer/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideHeaderFooter && <Header />}
      <main className={`flex-1 ${shouldShowMobileFooter ? 'pb-16 md:pb-0' : ''}`}>
        <Routes>
          <Route path="/chatsupport" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatScreen issues={issues} messages={messages} onIssueSelect={handleIssueClick} />} />
          
          {/* HOME PAGE ROUTE */}
          <Route path="/" element={
            <div className="space-y-0">
            <FurnitureMarketplace />
            <ProductCard />
            </div>
            } />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />


          <Route path="/products" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/products/:id/edit" element={<PrivateRoute><EditProduct /></PrivateRoute>} />

          <Route path="/categories" element={<Navigate to="/categories/overview" replace />} />
          <Route path="/categories/overview" element={<CategoriesOverviewPage />} />
          
          <Route path="/categories/:categoryId/products" element={<CategoryProductsPage />} />
          <Route path="/category/:id" element={<Navigate to="/categories/:id/products" replace />} />
          <Route path="/order" element={<Orders />} />
          <Route path="/faqsection" element={<Faq />} />
          <Route path="/manufacturer/register" element={<ManufacturerRegistration />} />
          <Route path="/manufacturer/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
          
          <Route path="ideas" element={<PrivateRoute><IssuesPage /></PrivateRoute>} />
          <Route path="idea/:id" element={<PrivateRoute><IssueDetailPage /></PrivateRoute>} />

          <Route path="/premium" element={<PrivateRoute><PremiumFeatures /></PrivateRoute>}/>
          <Route path="/recruitment/staff/dashboard" element={<PrivateRoute><StaffHiring/></PrivateRoute>}/>
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/order-tracking" element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path= "/cart" element={<PrivateRoute><CartPage/></PrivateRoute>} />
          <Route path="/debug-api" element={<APIDebugComponent />} />
          <Route path="/career/portal" element={<CareerHomePage />} />
        </Routes>
      </main>

      {/* Footer */}
      {!hideHeaderFooter && <Footer />}
    </div>
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