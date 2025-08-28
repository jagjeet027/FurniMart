import React from 'react';
import { DollarSign, TrendingUp, Building2 } from 'lucide-react';
import StatsCard from './StatsCard';

const RevenueSection = ({ manufacturers }) => {
  const revenueData = manufacturers.map(m => ({
    name: m.businessName,
    revenue: m.revenue || 0,
    status: m.status
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = manufacturers.reduce((sum, m) => sum + (m.revenue || 0), 0);
  const avgRevenue = totalRevenue / manufacturers.length || 0;
  const topPerformer = revenueData[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Revenue Analysis</h2>
        <p className="text-white/70">Comprehensive revenue insights and performance metrics.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
        />
        <StatsCard
          title="Average Revenue"
          value={`$${Math.round(avgRevenue).toLocaleString()}`}
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
        />
        <StatsCard
          title="Top Performer"
          value={topPerformer?.name?.substring(0, 15) + '...' || 'N/A'}
          icon={Building2}
          gradient="bg-gradient-to-br from-purple-500/20 to-purple-600/20"
        />
      </div>
      
      <div className="bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          {revenueData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  #{index + 1}
                </div>
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'approved' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${item.revenue.toLocaleString()}</p>
                <p className="text-white/60 text-sm">
                  {((item.revenue / totalRevenue) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueSection;