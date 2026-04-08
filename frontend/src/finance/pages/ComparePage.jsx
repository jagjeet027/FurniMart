import React, { useState } from 'react';
import { Award, X, ExternalLink, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const ComparePage = () => {
  // Sample loan data
  const [loans] = useState([
    {
      id: 1,
      name: 'Business Loan Pro',
      lender: 'HDFC Bank',
      lenderType: 'bank',
      category: 'business',
      interestRate: '8.5% - 12%',
      loanAmount: { min: 100000, max: 50000000 },
      processingFee: '1.5%',
      repaymentTerm: { min: 12, max: 60 },
      collateral: true,
      processingTime: '5-7 days',
      eligibility: { minAge: 21, maxAge: 65, minIncome: 300000, creditScoreMin: 650, businessAge: 2 },
      benefits: ['No collateral waiver', 'Quick approval', 'Flexible repayment'],
      applicationUrl: '#'
    },
    {
      id: 2,
      name: 'Quick Cash',
      lender: 'ICICI Bank',
      lenderType: 'bank',
      category: 'personal',
      interestRate: '9% - 14%',
      loanAmount: { min: 50000, max: 25000000 },
      processingFee: '2%',
      repaymentTerm: { min: 6, max: 48 },
      collateral: false,
      processingTime: '3-5 days',
      eligibility: { minAge: 23, maxAge: 60, minIncome: 250000, creditScoreMin: 600, businessAge: 0 },
      benefits: ['Zero collateral', 'Instant approval', 'Online application'],
      applicationUrl: '#'
    },
    {
      id: 3,
      name: 'Growth Fund',
      lender: 'Axis Bank',
      lenderType: 'bank',
      category: 'business',
      interestRate: '7.5% - 11%',
      loanAmount: { min: 200000, max: 100000000 },
      processingFee: '1%',
      repaymentTerm: { min: 24, max: 84 },
      collateral: true,
      processingTime: '7-10 days',
      eligibility: { minAge: 25, maxAge: 70, minIncome: 500000, creditScoreMin: 700, businessAge: 3 },
      benefits: ['Lowest interest rate', 'Highest loan amount', 'Expert guidance'],
      applicationUrl: '#'
    }
  ]);

  const [comparisonList, setComparisonList] = useState([1, 2, 3]);

  const compareLoans = loans.filter(loan => comparisonList.includes(loan.id));

  const removeFromComparison = (loanId) => {
    setComparisonList(comparisonList.filter(id => id !== loanId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const formatAmount = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const getInterestRateValue = (rateString) => {
    const match = rateString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getBestValueIndicator = (loans, field) => {
    if (loans.length === 0) return {};
    
    let bestIndex = -1;
    
    switch (field) {
      case 'interestRate':
        const rates = loans.map(loan => getInterestRateValue(loan.interestRate));
        const minRate = Math.min(...rates);
        bestIndex = rates.indexOf(minRate);
        break;
      case 'processingFee':
        const fees = loans.map(loan => parseFloat(loan.processingFee.replace('%', '')));
        const minFee = Math.min(...fees);
        bestIndex = fees.indexOf(minFee);
        break;
      case 'maxAmount':
        const amounts = loans.map(loan => loan.loanAmount.max);
        const maxAmount = Math.max(...amounts);
        bestIndex = amounts.indexOf(maxAmount);
        break;
      default:
        bestIndex = -1;
    }
    
    return { bestIndex };
  };

  if (compareLoans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Award size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">No Loans Selected for Comparison</h2>
            <p className="text-gray-600 mb-8">Add loans to your comparison list to see them side-by-side</p>
            <button onClick={() => setComparisonList([1, 2, 3])} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              <ArrowLeft size={16} />
              Back to Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const interestBest = getBestValueIndicator(compareLoans, 'interestRate');
  const feeBest = getBestValueIndicator(compareLoans, 'processingFee');
  const amountBest = getBestValueIndicator(compareLoans, 'maxAmount');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-full mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Loan Comparison</h1>
              <p className="text-gray-600 mt-1">Compare {compareLoans.length} selected loans side-by-side</p>
            </div>
            <div className="flex gap-3">
              <button onClick={clearComparison} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                Clear All
              </button>
              <button onClick={() => setComparisonList([1, 2, 3])} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                <ArrowLeft size={16} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <th className="px-6 py-4 text-left font-semibold w-40 sticky left-0 bg-blue-700">Features</th>
                  {compareLoans.map((loan) => (
                    <th key={loan.id} className="px-6 py-4 text-left min-w-64">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-lg">{loan.name}</div>
                          <div className="text-blue-100 text-sm">{loan.lender}</div>
                        </div>
                        <button
                          onClick={() => removeFromComparison(loan.id)}
                          className="text-blue-100 hover:text-white transition flex-shrink-0"
                          title="Remove from comparison"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Basic Info */}
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Lender Type</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        loan.lenderType === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {loan.lenderType.charAt(0).toUpperCase() + loan.lenderType.slice(1)}
                      </span>
                    </td>
                  ))}
                </tr>
                
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Category</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        loan.category === 'business' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {loan.category.toUpperCase()}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Interest Rate</td>
                  {compareLoans.map((loan, index) => (
                    <td key={loan.id} className={`px-6 py-4 ${index === interestBest.bestIndex ? 'bg-green-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{loan.interestRate}</span>
                        {index === interestBest.bestIndex && (
                          <CheckCircle size={18} className="text-green-600" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Loan Amount Range</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {formatAmount(loan.loanAmount.min)} - {formatAmount(loan.loanAmount.max)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Maximum Amount</td>
                  {compareLoans.map((loan, index) => (
                    <td key={loan.id} className={`px-6 py-4 ${index === amountBest.bestIndex ? 'bg-green-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{formatAmount(loan.loanAmount.max)}</span>
                        {index === amountBest.bestIndex && (
                          <CheckCircle size={18} className="text-green-600" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Processing Fee</td>
                  {compareLoans.map((loan, index) => (
                    <td key={loan.id} className={`px-6 py-4 ${index === feeBest.bestIndex ? 'bg-green-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{loan.processingFee}</span>
                        {index === feeBest.bestIndex && (
                          <CheckCircle size={18} className="text-green-600" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Repayment Term</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {loan.repaymentTerm.min === 0 && loan.repaymentTerm.max === 0 
                        ? 'Grant (No repayment)' 
                        : `${loan.repaymentTerm.min}-${loan.repaymentTerm.max} months`}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Collateral Required</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4">
                      {loan.collateral ? (
                        <span className="flex items-center gap-2 text-red-600 font-medium">
                          <XCircle size={18} />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                          <CheckCircle size={18} />
                          No
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Processing Time</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">{loan.processingTime}</td>
                  ))}
                </tr>

                {/* Eligibility Criteria */}
                <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
                  <td colSpan={compareLoans.length + 1} className="px-6 py-4">
                    <strong className="text-blue-900 text-lg">Eligibility Criteria</strong>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Age Range</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {loan.eligibility.minAge} - {loan.eligibility.maxAge} years
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Minimum Income</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {loan.eligibility.minIncome === 0 ? 'No requirement' : formatAmount(loan.eligibility.minIncome)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Minimum Credit Score</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {loan.eligibility.creditScoreMin === 0 ? 'Not required' : loan.eligibility.creditScoreMin}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Business Age</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4 text-gray-700">
                      {loan.eligibility.businessAge === 0 ? 'New business accepted' : `${loan.eligibility.businessAge}+ months`}
                    </td>
                  ))}
                </tr>

                {/* Benefits */}
                <tr className="bg-gradient-to-r from-green-100 to-green-50">
                  <td colSpan={compareLoans.length + 1} className="px-6 py-4">
                    <strong className="text-green-900 text-lg">Key Benefits</strong>
                  </td>
                </tr>

                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Benefits</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4">
                      <ul className="space-y-2">
                        {loan.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <span className="text-green-600 mt-1">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-700 bg-gray-50 sticky left-0">Actions</td>
                  {compareLoans.map((loan) => (
                    <td key={loan.id} className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm">
                          View Details
                        </button>
                        <button className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                          <ExternalLink size={14} />
                          Apply Now
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Comparison Tips</h3>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong className="text-gray-800">Interest Rate:</strong>
                <p className="text-gray-600 text-sm">Lower rates mean less total cost over the loan term</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong className="text-gray-800">Processing Fee:</strong>
                <p className="text-gray-600 text-sm">One-time fee charged by the lender</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong className="text-gray-800">Collateral:</strong>
                <p className="text-gray-600 text-sm">Whether you need to provide security against the loan</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold flex-shrink-0">•</span>
              <div>
                <strong className="text-gray-800">Processing Time:</strong>
                <p className="text-gray-600 text-sm">How quickly you can expect approval and disbursement</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;