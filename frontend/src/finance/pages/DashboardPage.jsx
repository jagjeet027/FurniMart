import React, { useState } from 'react';
import { Heart, Award, Eye, ExternalLink, Trash2, TrendingUp, BarChart3, Globe, Users, Clock, Plus, CheckCircle, AlertCircle, X } from 'lucide-react';

const LoanDashboard = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [showForm, setShowForm] = useState(false);
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
  ];

  const sectors = [
    { value: 'technology', label: 'Technology' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Services' },
    { value: 'agriculture', label: 'Agriculture' },
  ];

  const sampleLoans = [
    {
      id: 1,
      name: 'TechStart Fund',
      lender: 'Digital Finance Co',
      type: 'bank',
      interestRate: '8.5%',
      amount: { min: 100000, max: 5000000 },
      processingTime: '3-5 days',
      isSaved: true,
    },
    {
      id: 2,
      name: 'SME Growth Loan',
      lender: 'Enterprise Bank',
      type: 'bank',
      interestRate: '9.2%',
      amount: { min: 500000, max: 10000000 },
      processingTime: '5-7 days',
      isSaved: true,
    },
    {
      id: 3,
      name: 'Quick Business Boost',
      lender: 'Fintech Plus',
      type: 'fintech',
      interestRate: '12.5%',
      amount: { min: 50000, max: 2000000 },
      processingTime: '1-2 days',
      isSaved: false,
    },
  ];

  const comparisonLoans = sampleLoans.slice(0, 2);
  const savedLoans = sampleLoans.filter(l => l.isSaved);

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const statsData = [
    { icon: TrendingUp, label: 'Total Applications', value: '2,845', color: 'from-blue-500 to-blue-600' },
    { icon: Globe, label: 'Countries', value: '12', color: 'from-indigo-500 to-indigo-600' },
    { icon: Users, label: 'Active Users', value: '15.2K', color: 'from-slate-600 to-slate-700' },
    { icon: Clock, label: 'Avg. Processing', value: '3.5 days', color: 'from-blue-600 to-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">LoanHub</h1>
          </div>
          <div className="hidden md:flex gap-8">
            <button className="text-slate-600 hover:text-blue-600 font-medium transition">Dashboard</button>
            <button className="text-slate-600 hover:text-blue-600 font-medium transition">Analytics</button>
            <button className="text-slate-600 hover:text-blue-600 font-medium transition">Eligibility</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-blue-50 rounded-full">
              <span className="text-sm font-semibold text-blue-600">✨ Welcome Back</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Find Your Perfect <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Loan Today</span>
            </h2>
            <p className="text-lg text-slate-600">Discover loans tailored to your needs with our intelligent matching system. Quick approvals, transparent terms.</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition duration-300 transform hover:scale-105">
              <Plus size={20} />
              Check Eligibility
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/50 backdrop-blur">
              <div className="space-y-4">
                <div className="h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-full w-1/2"></div>
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-slate-700 font-medium">Fast Approval</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-slate-700 font-medium">Low Interest Rates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500" size={20} />
                    <span className="text-slate-700 font-medium">Zero Collateral</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border border-slate-200/50 hover:border-blue-200">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300`}>
                  <Icon className="text-white" size={24} />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Tabs Section */}
        <div className="space-y-8">
          <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
            {[
              { id: 'saved', label: '❤️ Saved Loans', count: savedLoans.length },
              { id: 'comparison', label: '🏆 Comparison', count: comparisonLoans.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition duration-300 relative group whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label} ({tab.count})
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Saved Loans Grid */}
          {activeTab === 'saved' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLoans.map((loan, idx) => (
                <div key={loan.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 border border-slate-200/50 hover:border-blue-200">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">{loan.name}</h3>
                        <p className="text-sm text-slate-500">{loan.lender}</p>
                      </div>
                      <button className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Interest Rate</span>
                        <span className="font-bold text-blue-600">{loan.interestRate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Amount</span>
                        <span className="font-bold text-slate-900">{formatAmount(loan.amount.min)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Processing</span>
                        <span className="font-bold text-slate-900">{loan.processingTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button className="flex-1 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
                        <Eye className="inline mr-2" size={16} />
                        Details
                      </button>
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition">
                        <ExternalLink className="inline mr-2" size={16} />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Section */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {comparisonLoans.map((loan) => (
                  <div key={loan.id} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:border-blue-200 transition">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">{loan.name}</h3>
                      <p className="text-slate-600">{loan.lender}</p>
                      
                      <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Interest Rate</span>
                          <span className="font-bold text-blue-600 text-lg">{loan.interestRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Min Amount</span>
                          <span className="font-bold">{formatAmount(loan.amount.min)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Max Amount</span>
                          <span className="font-bold">{formatAmount(loan.amount.max)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Processing Time</span>
                          <span className="font-bold">{loan.processingTime}</span>
                        </div>
                      </div>

                      <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition">
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Ideal Loan?</h2>
          <p className="text-lg text-blue-100 mb-8">Complete your eligibility check and get personalized recommendations instantly</p>
          <button onClick={() => setShowForm(true)} className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:shadow-lg transition duration-300 transform hover:scale-105">
            Start Your Journey →
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Check Your Eligibility</h2>
              <button onClick={() => setShowForm(false)} className="text-xl hover:opacity-80">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Age</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="25" onChange={(e) => setFormData({...formData, age: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Annual Income</label>
                  <input type="number" className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" placeholder="500000" onChange={(e) => setFormData({...formData, income: e.target.value})} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Organization Type</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" onChange={(e) => setFormData({...formData, organizationType: e.target.value})}>
                    <option>Select type</option>
                    {organizationTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Business Sector</label>
                  <select className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" onChange={(e) => setFormData({...formData, sector: e.target.value})}>
                    <option>Select sector</option>
                    {sectors.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 border border-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition">
                  Check Eligibility
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanDashboard;