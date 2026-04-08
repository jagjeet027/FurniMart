import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Plus, CheckCircle, XCircle, Clock, DollarSign, FileText, Shield, TrendingUp, Zap, Award, Users, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoan } from '../../contexts/LoanContext';
import { trackLoanApplication } from '../services/apiService';

const LoanDetailsPage = () => {
  const { id } = useParams();
  const { loans, dispatch, savedLoans, comparisonList } = useLoan();
  const [activeTab, setActiveTab] = useState('overview');
  
  const loan = loans.find(l => l.id === id);

  if (!loan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <XCircle size={48} className="text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loan Not Found</h2>
          <p className="text-gray-600 mb-6">The requested loan could not be found.</p>
          <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
            <ArrowLeft size={18} />
            Back to Search
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  const toggleSaveLoan = () => {
    if (savedLoans.includes(loan.id)) {
      dispatch({ type: 'REMOVE_SAVED_LOAN', payload: loan.id });
    } else {
      dispatch({ type: 'SAVE_LOAN', payload: loan.id });
    }
  };

  const toggleComparison = () => {
    if (comparisonList.includes(loan.id)) {
      dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: loan.id });
    } else if (comparisonList.length < 4) {
      dispatch({ type: 'ADD_TO_COMPARISON', payload: loan.id });
    }
  };

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const handleApplyClick = async (e) => {
    await trackLoanApplication(loan);
  };

  const isInComparison = comparisonList.includes(loan.id);
  const isSaved = savedLoans.includes(loan.id);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Back Button & Title */}
            <div className="flex items-start gap-4">
              <Link
                to="/search"
                className="p-2 hover:bg-white/20 rounded-lg transition-all mt-1"
              >
                <ArrowLeft size={24} className="text-white" />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{loan.name}</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <Briefcase size={18} />
                  {loan.lender}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSaveLoan}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  isSaved
                    ? 'bg-red-500 text-white hover:shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/50'
                }`}
              >
                <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleComparison}
                disabled={!isInComparison && comparisonList.length >= 4}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                  isInComparison
                    ? 'bg-green-500 text-white hover:shadow-lg'
                    : comparisonList.length >= 4
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/50'
                }`}
              >
                <Plus size={18} />
                {isInComparison ? 'Added' : 'Compare'}
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={loan.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyClick}
                className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Apply Now
              </motion.a>
            </div>
          </div>

          {/* Badge Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            <span className="px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-full backdrop-blur border border-white/30">
              {loan.lenderType.charAt(0).toUpperCase() + loan.lenderType.slice(1)}
            </span>
            <span className="px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-full backdrop-blur border border-white/30">
              {loan.category.toUpperCase()}
            </span>
            <span className="px-4 py-2 bg-white/20 text-white text-sm font-semibold rounded-full backdrop-blur border border-white/30">
              {loan.country}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Key Information Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: DollarSign, label: 'Interest Rate', value: loan.interestRate, color: 'from-blue-500 to-blue-600' },
            { icon: TrendingUp, label: 'Loan Amount', value: `${formatAmount(loan.loanAmount.min)} - ${formatAmount(loan.loanAmount.max)}`, color: 'from-green-500 to-green-600' },
            { icon: Clock, label: 'Processing Time', value: loan.processingTime, color: 'from-orange-500 to-orange-600' },
            { icon: FileText, label: 'Processing Fee', value: loan.processingFee, color: 'from-purple-500 to-purple-600' },
            { icon: Shield, label: 'Collateral', value: loan.collateral ? 'Required' : 'Not Required', color: loan.collateral ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600' },
            { icon: Zap, label: 'Repayment Term', value: loan.repaymentTerm.min === 0 && loan.repaymentTerm.max === 0 ? 'Grant' : `${loan.repaymentTerm.min}-${loan.repaymentTerm.max} months`, color: 'from-indigo-500 to-indigo-600' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className={`bg-gradient-to-br ${item.color} rounded-xl p-6 text-white shadow-md border border-white/10 hover:border-white/30 transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={24} />
                  <p className="text-white/80 font-medium text-sm">{item.label}</p>
                </div>
                <p className="text-2xl font-bold">{item.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-8 sticky top-24 z-30"
        >
          <div className="flex flex-wrap gap-2">
            {['Overview', 'Eligibility', 'Documents', 'Process'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.toLowerCase()
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 mb-12"
        >
          {/* Overview Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Description */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <motion.div className="p-2 bg-blue-100 rounded-lg">
                      <FileText size={24} className="text-blue-600" />
                    </motion.div>
                    About This Loan
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{loan.description}</p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <motion.div className="p-2 bg-green-100 rounded-lg">
                      <Award size={24} className="text-green-600" />
                    </motion.div>
                    Key Benefits
                  </h2>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {loan.benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 8 }}
                        className="flex gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-all"
                      >
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{benefit}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Features */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <motion.div className="p-2 bg-purple-100 rounded-lg">
                      <Zap size={24} className="text-purple-600" />
                    </motion.div>
                    Special Features
                  </h2>
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {loan.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ x: 8 }}
                        className="flex gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all"
                      >
                        <CheckCircle size={20} className="text-purple-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Eligibility Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'eligibility' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <motion.div className="p-2 bg-indigo-100 rounded-lg">
                    <Users size={24} className="text-indigo-600" />
                  </motion.div>
                  Eligibility Criteria
                </h2>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { label: 'Age Range', value: `${loan.eligibility.minAge} - ${loan.eligibility.maxAge} years` },
                    { label: 'Minimum Income', value: loan.eligibility.minIncome === 0 ? 'No requirement' : formatAmount(loan.eligibility.minIncome) },
                    { label: 'Credit Score', value: loan.eligibility.creditScoreMin === 0 ? 'Not required' : `${loan.eligibility.creditScoreMin}+` },
                    { label: 'Organization Type', value: loan.eligibility.organizationType.join(', ') },
                    { label: 'Business Age', value: loan.eligibility.businessAge === 0 ? 'New business accepted' : `${loan.eligibility.businessAge}+ months` },
                    { label: 'Eligible Sectors', value: loan.eligibility.sector.join(', ') }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:border-indigo-400 transition-all"
                    >
                      <p className="text-sm font-bold text-indigo-600 mb-2">{item.label}</p>
                      <p className="text-gray-800 font-semibold">{item.value}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'documents' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <motion.div className="p-2 bg-blue-100 rounded-lg">
                    <FileText size={24} className="text-blue-600" />
                  </motion.div>
                  Required Documents
                </h2>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {loan.documents.map((document, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -4 }}
                      className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all"
                    >
                      <FileText size={20} className="text-blue-600 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{document}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'process' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                  <motion.div className="p-2 bg-green-100 rounded-lg">
                    <Zap size={24} className="text-green-600" />
                  </motion.div>
                  Application Process
                </h2>
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {[
                    { step: 1, title: 'Prepare Documents', desc: 'Gather all required documents listed above' },
                    { step: 2, title: 'Submit Application', desc: 'Click "Apply Now" to visit the lender\'s application portal' },
                    { step: 3, title: 'Verification', desc: 'Lender will verify your documents and eligibility' },
                    { step: 4, title: 'Approval & Disbursement', desc: `Expected processing time: ${loan.processingTime}` }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ x: 8 }}
                      className="flex gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:border-green-400 transition-all"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      >
                        {item.step}
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-600 shadow-2xl p-4"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-3 h-3 bg-blue-600 rounded-full"
              />
              <span className="text-gray-800 font-semibold hidden sm:block">
                Ready to apply for this loan?
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSaveLoan}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  isSaved
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={18} className="inline mr-2" fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </motion.button>
              {comparisonList.length > 0 && (
                <Link
                  to="/compare"
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-200 transition-all"
                >
                  Compare ({comparisonList.length})
                </Link>
              )}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={loan.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleApplyClick}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Apply Now
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoanDetailsPage;