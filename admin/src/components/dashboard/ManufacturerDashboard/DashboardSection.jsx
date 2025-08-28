import React from 'react';
import { Users, CheckCircle, Clock, DollarSign, Building2 } from 'lucide-react';
import StatsCard from '../ManufacturerDashboard/StatsCard';

const DashboardSection = ({ manufacturers }) => {
  const stats = {
    total: manufacturers.length,
    active: manufacturers.filter(m => m?.status === 'approved').length,
    pending: manufacturers.filter(m => m?.status === 'pending').length,
    totalRevenue: manufacturers.reduce((sum, m) => sum + (Number(m?.revenue) || 0), 0)
  };

  return (
    <div className="space-y-6">
            
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Manufacturer Count"
          value={stats.total}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
        />
        <StatsCard
          title="Recruitment status"
          value={stats.active}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
        />
        <StatsCard
          title="Users Feedback"
          value={stats.pending}
          icon={Clock}
          gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20"
        />
        <StatsCard
          title="Scholers Feedback"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
        />
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {manufacturers.slice(0, 5).map(manufacturer => (
            <div key={manufacturer._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <p className="text-white font-medium">{manufacturer.businessName}</p>
                  <p className="text-white/60 text-sm">
                    Registered on {new Date(manufacturer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                manufacturer.status === 'approved' 
                  ? 'bg-green-500/20 text-green-300' 
                  : manufacturer.status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {manufacturer.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;