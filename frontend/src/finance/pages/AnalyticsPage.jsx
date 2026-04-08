import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, Globe, Users, Clock, ExternalLink } from 'lucide-react';
import { getApplicationStats, getApplicationAnalytics, getPopularLoans } from '../services/apiService';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [popularLoans, setPopularLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [statsResponse, applicationsResponse, popularLoansResponse] = await Promise.all([
        getApplicationStats(),
        getApplicationAnalytics(20, 0),
        getPopularLoans()
      ]);

      setStats(statsResponse.data);
      setApplications(applicationsResponse.data);
      setPopularLoans(popularLoansResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <TrendingUp size={48} className="text-blue-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Loading Analytics...</h2>
            <p className="text-gray-600 mt-2">Fetching application data from database</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-lg"
          >
            <BarChart size={48} className="text-red-500" />
            <h2 className="text-2xl font-bold text-gray-800 mt-4">Analytics Unavailable</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAnalyticsData} 
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BarChart size={48} className="text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Loan Application Analytics</h1>
          <p className="text-gray-600 text-lg">Track and analyze user engagement with loan schemes</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ExternalLink, value: stats?.total?.[0]?.count || 0, label: 'Total Applications', color: 'blue' },
              { icon: Globe, value: stats?.byCountry?.length || 0, label: 'Countries', color: 'green' },
              { icon: Users, value: stats?.byCategory?.length || 0, label: 'Loan Categories', color: 'purple' },
              { icon: TrendingUp, value: stats?.recent?.length || 0, label: 'Active Days (30d)', color: 'orange' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <stat.icon className={`text-${stat.color}-600`} size={32} />
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Loans */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Applied Loans</h2>
            {popularLoans.length > 0 ? (
              <div className="space-y-4">
                {popularLoans.map((loan, index) => (
                  <motion.div 
                    key={loan.loan_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">{loan.loan_name}</h3>
                      <p className="text-sm text-gray-600">{loan.lender} • {loan.country}</p>
                      <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-${loan.category === 'education' ? 'blue' : loan.category === 'business' ? 'green' : loan.category === 'personal' ? 'purple' : 'gray'}-100 text-${loan.category === 'education' ? 'blue' : loan.category === 'business' ? 'green' : loan.category === 'personal' ? 'purple' : 'gray'}-800`}>
                        {loan.category.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">{loan.application_count}</span>
                      <span className="block text-xs text-gray-500">applications</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No application data available yet</p>
              </div>
            )}
          </motion.div>

          {/* Applications by Country */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications by Country</h2>
            {stats?.byCountry && stats.byCountry.length > 0 ? (
              <div className="space-y-4">
                {stats.byCountry.map((item, index) => (
                  <motion.div 
                    key={item.country}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{item.country}</span>
                      <span className="text-sm font-semibold text-blue-600">{item.count}</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / stats.byCountry[0].count) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No country data available yet</p>
              </div>
            )}
          </motion.div>

          {/* Applications by Category */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications by Category</h2>
            {stats?.byCategory && stats.byCategory.length > 0 ? (
              <div className="space-y-4">
                {stats.byCategory.map((item, index) => (
                  <motion.div 
                    key={item.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${item.category === 'education' ? 'blue' : item.category === 'business' ? 'green' : item.category === 'personal' ? 'purple' : 'gray'}-100 text-${item.category === 'education' ? 'blue' : item.category === 'business' ? 'green' : item.category === 'personal' ? 'purple' : 'gray'}-800`}>
                      {item.category.toUpperCase()}
                    </span>
                    <div className="flex-grow relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / stats.byCategory[0].count) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="absolute h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No category data available yet</p>
              </div>
            )}
          </motion.div>

          {/* Recent Applications */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Applications</h2>
            {applications.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {applications.slice(0, 10).map((app, index) => (
                  <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-900">{app.loan_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{app.lender} • {app.country}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded bg-${app.category === 'education' ? 'blue' : app.category === 'business' ? 'green' : app.category === 'personal' ? 'purple' : 'gray'}-100 text-${app.category === 'education' ? 'blue' : app.category === 'business' ? 'green' : app.category === 'personal' ? 'purple' : 'gray'}-800`}>
                          {app.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={14} />
                          {formatDate(app.timestamp)}
                        </span>
                      </div>
                    </div>
                    <motion.a 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={app.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <ExternalLink size={14} />
                      View
                    </motion.a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent applications to show</p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-between bg-white rounded-xl shadow-lg p-6"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalyticsData} 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Refresh Data
          </motion.button>
          <p className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;