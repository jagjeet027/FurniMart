import React from 'react';

const StatsCard = ({ title, value, icon: Icon, gradient, onClick }) => (
  <div 
    onClick={onClick}
    className={`group ${gradient} p-6 rounded-2xl border border-white/10 backdrop-blur-sm cursor-pointer hover:bg-opacity-30 transition-all relative overflow-hidden transform hover:scale-105 duration-200`}
  >
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <Icon className="h-10 w-10 text-current opacity-40" />
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-current/0 via-current/5 to-current/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
  </div>
);

export default StatsCard;