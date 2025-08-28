import React from 'react';
import { Lightbulb, CheckCircle, Clock } from 'lucide-react';
import StatsCard from '../ManufacturerDashboard/StatsCard';

const InnovationsSection = () => {
  const innovations = [
    {
      id: 1,
      title: 'AI-Powered Quality Control',
      company: 'Tech Manufacturing Co.',
      category: 'Automation',
      status: 'In Development',
      description: 'Advanced machine learning system for real-time quality assessment'
    },
    {
      id: 2,
      title: 'Eco-Friendly Packaging',
      company: 'Green Industries Ltd.',
      category: 'Sustainability',
      status: 'Completed',
      description: 'Biodegradable packaging solution reducing environmental impact by 80%'
    },
    {
      id: 3,
      title: 'IoT Manufacturing Hub',
      company: 'Smart Factory Inc.',
      category: 'IoT',
      status: 'Testing',
      description: 'Connected manufacturing ecosystem with predictive maintenance'
    },
    {
      id: 4,
      title: 'Smart Energy Management',
      company: 'Green Industries Ltd.',
      category: 'Energy',
      status: 'Completed',
      description: 'AI-driven energy optimization system reducing consumption by 40%'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Innovation Hub</h2>
        <p className="text-white/70">Latest innovations and breakthrough technologies from our manufacturers.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Active Projects"
          value="12"
          icon={Lightbulb}
          gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20"
        />
        <StatsCard
          title="Completed"
          value="8"
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500/20 to-green-600/20"
        />
        <StatsCard
          title="In Development"
          value="4"
          icon={Clock}
          gradient="bg-gradient-to-br from-blue-500/20 to-blue-600/20"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {innovations.map(innovation => (
          <div key={innovation.id} className="bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{innovation.title}</h3>
                  <p className="text-white/60 text-sm">{innovation.company}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                innovation.status === 'Completed' 
                  ? 'bg-green-500/20 text-green-300' 
                  : innovation.status === 'Testing'
                  ? 'bg-blue-500/20 text-blue-300'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}>
                {innovation.status}
              </span>
            </div>
            <p className="text-white/70 mb-4">{innovation.description}</p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                {innovation.category}
              </span>
              <button className="text-indigo-300 hover:text-indigo-200 text-sm font-medium">
                Learn More →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InnovationsSection;