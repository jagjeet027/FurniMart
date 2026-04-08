import React, { useState } from 'react';
import { CheckCircle, AlertCircle, X, Zap, TrendingUp, Award, Clock, DollarSign, Target, ArrowRight, Eye } from 'lucide-react';

const EligibilityPage = () => {
  const [showForm, setShowForm] = useState(true);
  const [eligibilityResults, setEligibilityResults] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    creditScore: '',
    organizationType: '',
    businessAge: '',
    sector: '',
    loanAmount: ''
  });

  const organizationTypes = [
    { value: 'startup', label: 'Startup' },
    { value: 'sme', label: 'Small/Medium Enterprise' },
    { value: 'ngo', label: 'Non-Profit Organization' },
    { value: 'individual', label: 'Individual' },
    { value: 'farmer', label: 'Farmer' },
  ];

  const sectors = [
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Services' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'fintech', label: 'FinTech' },
  ];

  

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const handleEligibilitySubmit = () => {
    if (formData.age && formData.income && formData.organizationType && formData.sector) {
      const userAge = parseInt(formData.age);
      const userIncome = parseInt(formData.income);
      
      const eligible = sampleLoans.filter(loan => {
        return userAge >= loan.eligibility.minAge && 
               userAge <= loan.eligibility.maxAge && 
               userIncome >= loan.eligibility.minIncome;
      }).sort((a, b) => b.matchScore - a.matchScore);

      setEligibilityResults(eligible);
      setShowForm(false);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      income: '',
      creditScore: '',
      organizationType: '',
      businessAge: '',
      sector: '',
      loanAmount: ''
    });
    setEligibilityResults(null);
    setShowForm(true);
  };

  // Form Page
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Zap className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Eligibility Checker</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-600">🎯 Quick & Easy</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              Find Loans You're <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Eligible For</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Answer a few quick questions and discover personalized loan options matched to your profile</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-12 md:px-12">
              <h3 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h3>
              <p className="text-blue-100">We'll match you with the best loan options available</p>
            </div>

            <div className="p-8 md:p-12">
              <div className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Personal Information</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Age *</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        placeholder="25"
                        min="18"
                        max="80"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Annual Income (₹) *</label>
                      <input
                        type="number"
                        value={formData.income}
                        onChange={(e) => setFormData({...formData, income: e.target.value})}
                        placeholder="500000"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Credit Score (Optional)</label>
                      <input
                        type="number"
                        value={formData.creditScore}
                        onChange={(e) => setFormData({...formData, creditScore: e.target.value})}
                        placeholder="750"
                        min="300"
                        max="900"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Organization Details</h4>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Organization Type *</label>
                      <select
                        value={formData.organizationType}
                        onChange={(e) => setFormData({...formData, organizationType: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                      >
                        <option value="">Select type</option>
                        {organizationTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Business Age (months) *</label>
                      <input
                        type="number"
                        value={formData.businessAge}
                        onChange={(e) => setFormData({...formData, businessAge: e.target.value})}
                        placeholder="12"
                        min="0"
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-900">Business Sector *</label>
                      <select
                        value={formData.sector}
                        onChange={(e) => setFormData({...formData, sector: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                      >
                        <option value="">Select sector</option>
                        {sectors.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Loan Requirements Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">Loan Requirements</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-900">Required Loan Amount (₹) (Optional)</label>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({...formData, loanAmount: e.target.value})}
                      placeholder="1000000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleEligibilitySubmit}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Check My Eligibility
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Quick & Simple</h3>
              <p className="text-slate-600 text-sm">Takes only 2 minutes to complete the eligibility check</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Personalized Results</h3>
              <p className="text-slate-600 text-sm">Get loans matched to your specific needs and profile</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Target className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Best Options</h3>
              <p className="text-slate-600 text-sm">Ranked by compatibility with your requirements</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Your Results</h1>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Modify Criteria
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {eligibilityResults && eligibilityResults.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="mb-12">
              <div className="inline-block px-4 py-2 bg-green-50 rounded-full mb-6">
                <span className="text-sm font-semibold text-green-600">✅ Eligible</span>
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Congratulations!</h2>
              <p className="text-lg text-slate-600">You're eligible for <span className="font-bold text-blue-600">{eligibilityResults.length} loan{eligibilityResults.length !== 1 ? 's' : ''}</span></p>
            </div>

            {/* Eligible Loans */}
            <div className="space-y-6">
              {eligibilityResults.map((loan, idx) => (
                <div key={loan.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-slate-200/50 hover:border-blue-200">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">#{idx + 1}</span>
                          <span className="text-sm font-semibold text-blue-600">Match Score: {loan.matchScore}%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{loan.name}</h3>
                        <p className="text-slate-600">{loan.lender}</p>
                      </div>
                      <div className="text-right">
                        <div className="inline-block px-4 py-2 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600 font-semibold">Eligible ✓</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-6">{loan.description}</p>

                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-5 gap-4 mb-8">
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Interest Rate</p>
                        <p className="text-2xl font-bold text-blue-600">{loan.interestRate}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Amount Range</p>
                        <p className="text-lg font-bold text-slate-900">{formatAmount(loan.amount.min)} - {formatAmount(loan.amount.max)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Processing Time</p>
                        <p className="text-lg font-bold text-slate-900">{loan.processingTime}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Processing Fee</p>
                        <p className="text-lg font-bold text-slate-900">{loan.processingFee}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-slate-600 text-sm font-medium mb-1">Collateral</p>
                        <p className={`text-lg font-bold ${loan.collateral ? 'text-red-600' : 'text-green-600'}`}>
                          {loan.collateral ? 'Required' : 'Not Required'}
                        </p>
                      </div>
                    </div>

                    {/* Why Eligible */}
                    <div className="bg-blue-50 rounded-xl p-6 mb-6">
                      <h4 className="font-bold text-slate-900 mb-3">Why you're eligible:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-slate-700">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          Age requirement: {loan.eligibility.minAge}-{loan.eligibility.maxAge} years
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          Income requirement: {loan.eligibility.minIncome === 0 ? 'No minimum' : `₹${loan.eligibility.minIncome.toLocaleString()}+`}
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          Lender: {loan.lender}
                        </li>
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button className="flex-1 px-6 py-3 border border-blue-300 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                        <Eye size={18} />
                        View Details
                      </button>
                      <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2">
                        <ArrowRight size={18} />
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Steps */}
            <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Next Steps</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Review Options</p>
                    <p className="text-blue-100 text-sm">Compare all eligible loans and their features</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Apply Online</p>
                    <p className="text-blue-100 text-sm">Submit your application directly to the lender</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Get Approved</p>
                    <p className="text-blue-100 text-sm">Receive your loan approval quickly</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle size={64} className="text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Eligible Loans Found</h3>
            <p className="text-slate-600 mb-8">Based on your profile, you don't meet the criteria for our listed loans. Try adjusting your details.</p>
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityPage;