import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from './components/Header';
import SurakshitSafar from './cargo/Surakshitsafar.jsx'
import FurniturePlatform from './furniGlobalHub.jsx'
import ProfilePage from '../src/post/Profilepage.jsx';
import LoginPage from './components/LoginPage';
import './index.css';
import Footer from './components/Footer';
import SignupPage from './components/SignUpPage';
import { AuthProvider } from './contexts/AuthContext';
import { LoanProvider } from './contexts/LoanContext'; // Add this import
import Dashboard from './components/manufacturer/Dashboard';    
import PrivateRoute from './components/PrivateRoute';
import ProductCard from './components/ProductCardDetails.jsx';
import ProductDetailPage from './components/ProductDetailPage';
import ManufacturerRegistration from './components/manufacturer/ManufacturerRegistration';
import PremiumFeatures from './components/manufacturer/PremiumFeatures'
import IssuesPage from './components/manufacturer/IdeaPage.jsx';
import IssueDetailPage from './components/manufacturer/IdeaDetailPage.jsx';
import Faq from './components/Faqsection/Faq.jsx'
import Orders from './orderpages/CheckoutPage.jsx'
import OrderTrackingPage from './orderpages/OrderTrackingPage.jsx';
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

import StaffHiring from './career/StaffHiring.jsx';
import JobApplicationForm from './career/JobApplicationForm.jsx';
import RegisterIndividuals from './career/RegisterIndividuals.jsx';
import OrganizationRegister from './career/OrganizationRegister.jsx';
import NotFoundPage from './components/NotFound';
import ChatHistory from './components/userDashBoard/ChatHistory.jsx';

// finance imports
import HomePage from '.././src/finance/pages/HomePage';
import SearchPage from '.././src/finance/pages/SearchPage';
import ComparePage from '.././src/finance/pages/ComparePage';
import LoanDetailsPage from '.././src/finance/pages/LoanDetailsPage';
import EligibilityPage from '.././src/finance/pages/EligibilityPage';
import AddOrganizationPage from '.././src/finance/pages/AddOrganizationPage';
import OrganizationManagementPage from '.././src/finance/pages/OrganizationManagementPage';
import AdminPanel from '../src/finance/components/AdminPanel';


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
    '/cargo-insurance',
    '/inventory',
    '/order',
    '/premium',
    '/manufacturer/faqsection',
    '/products/management',
    '/categories/management',
    '/new-idea',
    '/user-profile',
    '/staff-hiring',
    '/careers',
    '/jobs/:jobId/apply',
    '/register/individual-applicant',
    '/register/organization-applicant',

    '/finance',
    '/search',
    '/compare',
    '/loan/:id',
    '/eligibility',
    '/add-organization',
    '/admin/organizations',
    '/admin',
    
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

          <Route path="/user-profile" element={<ProfilePage/>}/>
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
          <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
          <Route path="/order-tracking" element={<PrivateRoute><OrderTrackingPage /></PrivateRoute>} />
          <Route path="/chat-history" element={<ChatHistory />} />
          
          {/* HOME PAGE ROUTE */}
          <Route path="/" element={
            <div className="space-y-0">
              <FurniturePlatform />              
            </div>
          } />
          <Route path="/cargo-insurance" element={<SurakshitSafar />} />
          {/* finance route */}

          <Route path="/finance" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/loan/:id" element={<LoanDetailsPage />} />
          <Route path="/eligibility" element={<EligibilityPage />} />
          <Route path="/add-organization" element={<AddOrganizationPage />} />
          <Route path="/admin/organizations" element={<OrganizationManagementPage />} />
          <Route path="/admin" element={<AdminPanel />} />


          <Route path='/products' element={<ProductCard />}  />
          <Route path ="/new-idea" element={<PrivateRoute><IdeaSharingPlatform/></PrivateRoute>} />
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

          {/* CAREER ROUTES */}
          <Route path="/staff-hiring" element={<StaffHiring />} /> 
          <Route path="/careers" element={<StaffHiring />} />
          <Route path="/jobs/:jobId/apply" element={<JobApplicationForm />} />
          <Route path="/register/individual-applicant" element={<RegisterIndividuals/>}/>
          <Route path="register/organization-applicant" element={<OrganizationRegister/>} />

          {/* 404 NOT FOUND ROUTE - Must be LAST */}
          <Route path="*" element={<NotFoundPage />} />
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
      <LoanProvider>
        <App />
      </LoanProvider>
    </AuthProvider>
  </Router>
);

export default AppWrapper;