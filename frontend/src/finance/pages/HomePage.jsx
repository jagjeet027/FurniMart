import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Award, Users, TrendingUp, Shield, Clock, ArrowRight, Zap, Target, Lightbulb, CheckCircle, Home, ShoppingCart, HelpCircle, Building2, Menu, X, GitCompare } from 'lucide-react';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'E-Commerce', icon: ShoppingCart, path: '/' },
    { name: 'Cargo Insurance', icon: TrendingUp, path: '/cargo-insurance' },
    { name: 'Finance', icon: Home, path: '/finance' },
    { name: 'Compare', icon: GitCompare, path: '/compare' },
    { name: 'Support', icon: HelpCircle, path: '/faqsection' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  const categories = [
    { id: 'msme', name: 'MSME Loans', description: 'Business loans for small & medium enterprises', icon: '🏢' },
    { id: 'startup', name: 'Startup Funding', description: 'Capital for new ventures and startups', icon: '🚀' },
    { id: 'agriculture', name: 'Agriculture', description: 'Loans for farming and agribusiness', icon: '🌾' },
    { id: 'education', name: 'Education', description: 'Student and educational loans', icon: '📚' },
    { id: 'housing', name: 'Housing', description: 'Home loans and property financing', icon: '🏠' },
    { id: 'personal', name: 'Personal', description: 'Personal and unsecured loans', icon: '👤' },
  ];

  const lenderTypes = [
    { id: 'government', name: 'Government Schemes', description: 'Backed by government programs with low interest rates', count: 15 },
    { id: 'bank', name: 'Banks & Financial Institutions', description: 'Established banks offering competitive rates', count: 28 },
    { id: 'private', name: 'Private Lenders', description: 'Non-banking financial companies', count: 12 },
    { id: 'microfinance', name: 'Microfinance', description: 'Small loans for entrepreneurs', count: 8 },
  ];

  const stats = [
    { label: 'Total Loan Options', value: '63', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { label: 'Countries Covered', value: '6', icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Government Schemes', value: '15', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { label: 'Bank & Private', value: '40', icon: Award, color: 'from-orange-500 to-red-500' },
  ];

  const features = [
    { icon: Search, title: 'Smart Search', description: 'Advanced filtering across government schemes, banks, and lenders', color: 'from-blue-500 to-cyan-500' },
    { icon: Award, title: 'Easy Comparison', description: 'Compare rates, terms, and benefits side-by-side', color: 'from-purple-500 to-pink-500' },
    { icon: Users, title: 'Eligibility Check', description: 'Personalized recommendations based on your profile', color: 'from-green-500 to-emerald-500' },
    { icon: TrendingUp, title: 'Smart Analytics', description: 'AI-powered insights for better decisions', color: 'from-orange-500 to-red-500' },
    { icon: Shield, title: 'Verified Data', description: 'All information from official trusted sources', color: 'from-indigo-500 to-blue-500' },
    { icon: Clock, title: 'Time Saving', description: 'All options in one place - no more website hopping', color: 'from-rose-500 to-pink-500' },
  ];

  const phoneContent = [
    { title: 'ABC Bank Premium', rate: '8.5%', amount: '₹50L - ₹5Cr', image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&h=600&fit=crop' },
    { title: 'QuickCredit NBFC', rate: '12%', amount: '₹25K - ₹20L', image: 'https://images.unsplash.com/photo-1552058544-f53b5baf6b1b?w=400&h=600&fit=crop' },
    { title: 'Startup India Fund', rate: '6.5%', amount: '₹10L - ₹1Cr', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=600&fit=crop' },
    { title: 'Finance Plus Ltd', rate: '7%', amount: '₹1Cr - ₹10Cr', image: 'https://images.unsplash.com/photo-1579621970563-430f63602d4b?w=400&h=600&fit=crop' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const headerItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700 backdrop-blur-md bg-opacity-95"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">LH</span>
                </div>
                <span className="hidden sm:block text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  LoanHub
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden md:flex items-center gap-2"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <motion.div
                    key={item.path}
                    variants={headerItemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className="relative px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                      
                      {/* Animated Background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-lg -z-10"
                        initial={{ width: 0, opacity: 0 }}
                        whileHover={{ width: '100%', opacity: 1 }}
                        whileTap={{ width: '100%', opacity: 1 }}
                        animate={active ? { width: '100%', opacity: 1 } : { width: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                      />

                      {/* Bottom Border Indicator */}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Right Side - Add Organization Button */}
            <div className="hidden md:flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/add-organization"
                  className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg overflow-hidden shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <Building2 size={18} />
                    <span>Add Organization</span>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-slate-800/50 border-t border-slate-700 overflow-hidden"
              >
                <motion.nav
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-2 p-4"
                >
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <motion.div
                        key={item.path}
                        variants={headerItemVariants}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                            active
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                          }`}
                        >
                          <Icon size={20} />
                          <span>{item.name}</span>
                        </Link>
                      </motion.div>
                    );
                  })}

                  {/* Mobile Add Organization Button */}
                  <motion.div
                    variants={headerItemVariants}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link
                      to="/add-organization"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg transition-all"
                    >
                      <Building2 size={20} />
                      <span>Add Organization</span>
                    </Link>
                  </motion.div>
                </motion.nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20 px-4 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 opacity-30 blur-3xl rounded-full" animate={{ y: [0, -30, 0] }} transition={{ duration: 4, repeat: Infinity }}></motion.div>
          <motion.div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" animate={{ y: [0, 30, 0] }} transition={{ duration: 5, repeat: Infinity }}></motion.div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500 opacity-20 blur-3xl rounded-full"></div>
        </div>

        <div className="container relative z-10 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent leading-tight">
                  Find Your Perfect Loan
                </h1>

                <p className="text-lg md:text-xl text-gray-300 max-w-3xl leading-relaxed">
                  Compare government schemes, bank loans, and private lenders. Make informed financial decisions with transparent comparison and instant eligibility checking.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-8"
              >
                <Link
                  to="/search"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold text-lg overflow-hidden shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <Search className="w-5 h-5" />
                    <span>Start Searching</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  to="/eligibility"
                  className="group px-8 py-4 border-2 border-cyan-400 text-white rounded-lg font-bold text-lg hover:bg-cyan-500/20 transition-all duration-300 hover:border-cyan-300 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm"
                >
                  <Target className="w-5 h-5" />
                  <span>Check Eligibility</span>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-700"
              >
                {[
                  { icon: '💰', label: '63+ Loans', desc: 'to explore' },
                  { icon: '🌍', label: '6 Countries', desc: 'coverage' },
                  { icon: '⚡', label: 'Instant Match', desc: 'in seconds' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="p-4 rounded-lg bg-gradient-to-br from-white/15 to-white/5 border border-white/20 backdrop-blur-md text-center hover:from-white/25 transition-all"
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-white text-sm">{item.label}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Side - Android Phone with 3D Design */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:flex justify-center items-center relative w-full"
            >
              {/* 3D Container */}
              <div className="relative w-full h-96" style={{ perspective: "2000px" }}>
                
                {/* Left Floating Card - Quick Approval */}
                <motion.div
                  animate={{ y: [0, -12, 0], x: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute left-0 top-12 w-48 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-5 border-2 border-green-200 z-20"
                  style={{ transform: "perspective(1000px) rotateY(15deg) rotateX(-10deg)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                      <CheckCircle className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Quick Approval</p>
                      <p className="text-lg font-bold text-gray-900">24 Hours</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Instant verification</p>
                </motion.div>

                {/* Center Phone - 45 Degree Tilt */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-0" style={{ transform: "perspective(2000px) translateX(-50%) rotateY(-35deg) rotateX(5deg) rotateZ(5deg)" }}>
                  {/* Phone Frame */}
                  <div className="w-96 h-auto bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[50px] shadow-2xl overflow-hidden relative border-4 border-gray-900">
                    {/* Dynamic Island */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-56 h-8 bg-black rounded-full z-20 shadow-lg"></div>

                    {/* Screen */}
                    <div className="w-full h-[640px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden rounded-[45px]">
                      {/* Status Bar */}
                      <div className="h-10 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center justify-between px-6 text-white text-xs font-bold">
                        <span className="text-sm">9:41</span>
                        <div className="flex gap-2">
                          <Zap size={16} className="text-yellow-400" />
                          <TrendingUp size={16} className="text-green-400" />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="px-6 py-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                          <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
                            <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" fill="white"></path>
                          </svg>
                        </div>
                        <div className="relative z-10">
                          <h3 className="text-white font-bold text-xl">Loans For You</h3>
                          <p className="text-blue-100 text-sm mt-2">Personalized offers</p>
                        </div>
                      </div>

                      {/* Cards Display */}
                      <div className="flex flex-col gap-4 p-4 h-[500px] overflow-hidden">
                        {/* Loan Card 1 */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg flex-shrink-0 h-72">
                          <div className="w-full h-40 bg-gray-300 relative overflow-hidden">
                            <img 
                              src={phoneContent[0].image} 
                              alt={phoneContent[0].title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                          </div>

                          <div className="p-5 bg-white">
                            <h3 className="text-gray-900 font-bold text-base mb-3">{phoneContent[0].title}</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Interest</p>
                                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{phoneContent[0].rate}</p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Amount</p>
                                <p className="text-xs font-bold text-green-700">{phoneContent[0].amount}</p>
                              </div>
                            </div>
                            <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                              View Details
                            </button>
                          </div>
                        </div>

                        {/* Loan Card 2 */}
                        <div className="bg-white rounded-3xl overflow-hidden shadow-lg flex-shrink-0 h-72">
                          <div className="w-full h-40 bg-gray-300 relative overflow-hidden">
                            <img 
                              src={phoneContent[1].image} 
                              alt={phoneContent[1].title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                          </div>

                          <div className="p-5 bg-white">
                            <h3 className="text-gray-900 font-bold text-base mb-3">{phoneContent[1].title}</h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Interest</p>
                                <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{phoneContent[1].rate}</p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                                <p className="text-xs text-gray-600 font-semibold mb-1">Amount</p>
                                <p className="text-xs font-bold text-green-700">{phoneContent[1].amount}</p>
                              </div>
                            </div>
                            <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home Indicator */}
                    <div className="h-7 bg-black flex items-center justify-center">
                      <div className="w-40 h-1.5 bg-gray-700 rounded-full"></div>
                    </div>

                    {/* Glow Effects */}
                    <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-blue-500 opacity-25 blur-3xl rounded-full"></div>
                    <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-500 opacity-25 blur-3xl rounded-full"></div>
                  </div>
                </div>

                {/* Right Floating Card - Best Rates */}
                <motion.div
                  animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.2 }}
                  className="absolute right-0 top-20 w-48 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-5 border-2 border-blue-200 z-20"
                  style={{ transform: "perspective(1000px) rotateY(-15deg) rotateX(-10deg)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                      <TrendingUp className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-bold">Best Rates</p>
                      <p className="text-lg font-bold text-gray-900">From 6.5%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">Competitive rates</p>
                </motion.div>

                {/* Bottom Right Card - Rating */}
                <motion.div
                  animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.4 }}
                  className="absolute right-12 -bottom-8 w-48 bg-white rounded-2xl shadow-2xl p-5 border-2 border-purple-200 z-10"
                  style={{ transform: "perspective(1000px) rotateY(-20deg) rotateX(5deg)" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-lg">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900">50K+ Users</p>
                  <p className="text-xs text-gray-600">"Amazing!"</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">By The Numbers</h2>
            <p className="text-gray-400">Comprehensive lending ecosystem at your fingertips</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`p-8 rounded-2xl bg-gradient-to-br ${stat.color} hover:opacity-100 shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/20 group cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/90 font-semibold">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Loan Categories</h2>
            <p className="text-gray-400">Choose the perfect loan type for your needs</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {categories.map((category) => (
              <motion.div
                key={category.id}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/20 hover:border-blue-400/60 transition-all duration-300 overflow-hidden backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/15 group-hover:to-purple-500/15 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{category.description}</p>
                  <Link
                    to={`/search?category=${category.id}`}
                    className="inline-flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-sm font-bold"
                  >
                    Explore
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lender Types Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Lender Types</h2>
            <p className="text-gray-400">Diverse lending options to meet your requirements</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {lenderTypes.map((type) => (
              <motion.div
                key={type.id}
                variants={itemVariants}
                whileHover={{ x: 8 }}
                className="p-8 rounded-xl bg-gradient-to-r from-slate-800/70 to-slate-900/70 border border-white/20 hover:border-cyan-400/60 transition-all duration-300 group backdrop-blur"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{type.name}</h3>
                    <p className="text-gray-300">{type.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-cyan-400">{type.count}</div>
                    <div className="text-xs text-gray-400">options</div>
                  </div>
                </div>
                <Link
                  to={`/search?lenderType=${type.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2 mt-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 group-hover:gap-3"
                >
                  Explore {type.name}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose LoanCompare?</h2>
            <p className="text-gray-400">The most comprehensive loan comparison platform</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -12 }}
                  className={`p-8 rounded-xl bg-gradient-to-br ${feature.color} opacity-20 hover:opacity-30 border border-white/20 transition-all duration-300 group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-14 h-14 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-30 blur-3xl rounded-full" animate={{ x: [0, 30, 0] }} transition={{ duration: 6, repeat: Infinity }}></motion.div>
          <motion.div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 opacity-30 blur-3xl rounded-full" animate={{ x: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity }}></motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl relative z-10 text-center"
        >
          <div className="space-y-8">
            <h2 className="text-5xl font-bold text-white">Ready to Find Your Perfect Loan?</h2>
            <p className="text-xl text-gray-300">
              Join thousands of organizations who've found their ideal financing solution
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
            >
              <Link
                to="/search"
                className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Start Your Search</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                to="/eligibility"
                className="px-10 py-4 border-2 border-cyan-400 text-white rounded-lg font-bold text-lg hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm"
              >
                <Lightbulb className="w-5 h-5" />
                <span>Check Eligibility</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;