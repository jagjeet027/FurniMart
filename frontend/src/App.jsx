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
import Faq from './components/Faqsection/Faq.jsx'
import Orders from './orderpages/CheckoutPage.jsx'
import OrderTrackingPage from './orderpages/OrderTrackingPage.jsx';
import ChatScreen from './components/userDashBoard/ChatScreen.jsx';
import ProductManagement from './components/manufacturer/ProductManagement';
import EditProduct from './components/manufacturer/EditProduct.jsx';
import CheckoutPage from './orderpages/CheckoutPage.jsx';
import WishlistPage from './orderpages/wishlistPage.jsx';
import CategoryProductsPage from './components/userDashBoard/CategoryProductsPage.jsx';
import CategoriesOverviewPage from './components/userDashBoard/CategoriesOverviewPage.jsx';
import APIDebugComponent from './services/APIDebugComponent.jsx';
import IdeaSharingPlatform from './components/userDashBoard/IdeaSharingPlatform.jsx';
import ForgotPasswordPage from './components/userDashBoard/ForgotPasswordPage.jsx';
import ResetPasswordPage from './components/userDashBoard/ResetPasswordPage.jsx';
import SearchResultsPage from './components/userDashBoard/SearchResultsPage.jsx';

const App = () => {
  const location = useLocation();

  // Paths that should not show header/footer
  const noHeaderFooterPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/checkout',
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

    '/new-idea'
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
          {/* AUTHENTICATION ROUTES - First Priority */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage/>} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/order-tracking" element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>} />
          
          {/* CHAT AND SUPPORT ROUTES */}
          <Route path="/chatsupport" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatScreen />} />
          
          {/* HOME PAGE ROUTE */}
          <Route path="/" element={
            <div className="space-y-0">
              <FurnitureMarketplace />
              <ProductCard />
            </div>
          } />
          
          {/* PROFILE ROUTES */}
          <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} />
          <Route path ="/new-idea" element={<PrivateRoute><IdeaSharingPlatform/></PrivateRoute>} />
          {/* PRODUCT MANAGEMENT ROUTES - Before dynamic product routes */}
          <Route path="/products/management" element={<PrivateRoute><ProductManagement /></PrivateRoute>} />
          
          {/* CATEGORIES ROUTES */}
          <Route path="/categories" element={<Navigate to="/categories/overview" replace />} />
          <Route path="/categories/overview" element={<CategoriesOverviewPage />} />
          <Route path="/categories/:categoryId/products" element={<CategoryProductsPage />} />
          <Route path="/category/:id" element={<Navigate to="/categories/:id/products" replace />} />
          
          {/* FAQ AND ORDER ROUTES */}
          <Route path="/order" element={<Orders />} />
          <Route path="/faqsection" element={<Faq />} />
          
          {/* MANUFACTURER ROUTES */}
          <Route path="/manufacturer/register" element={<ManufacturerRegistration />} />
          <Route path="/manufacturer/dashboard" element={<PrivateRoute><Dashboard /> </PrivateRoute>}/>
          <Route path="/premium" element={<PrivateRoute><PremiumFeatures /></PrivateRoute>}/>
          
          {/* IDEAS ROUTES */}
          <Route path="/ideas" element={<PrivateRoute><IssuesPage /></PrivateRoute>} />
          <Route path="/idea/:id" element={<PrivateRoute><IssueDetailPage /></PrivateRoute>} />

          {/* DEBUG ROUTE */}
          <Route path="/debug-api" element={<APIDebugComponent />} />
          
          {/* DYNAMIC PRODUCT ROUTES - Must come LAST */}
          <Route path="/products" element={<ProductManagement />} />
          <Route path="/products/:id/edit" element={<PrivateRoute><EditProduct /></PrivateRoute>} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
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