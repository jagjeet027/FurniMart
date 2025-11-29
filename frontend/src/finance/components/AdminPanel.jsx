import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, AlertCircle, CheckCircle2, RotateCw, Trash2, Server, Database, Network } from 'lucide-react';

const AdminPanel = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');

  // Mock system status data
  const mockSystemStatus = {
    scheduler: {
      isRunning: true,
      jobs: ['dailyRefresh', 'hourlyGovernmentRefresh', 'weeklyCleanup', 'healthCheck'],
      lastRunStatus: {
        dailyRefresh: { status: 'success', lastRun: new Date().toISOString(), error: null },
        hourlyGovernmentRefresh: { status: 'success', lastRun: new Date(Date.now() - 3600000).toISOString(), error: null },
        weeklyCleanup: { status: 'success', lastRun: new Date(Date.now() - 604800000).toISOString(), error: null },
        healthCheck: { status: 'running', lastRun: new Date().toISOString(), error: null },
      }
    },
    cache: {
      redis: { available: true },
      file: { files: 124, totalSize: 52428800 }
    },
    apiIntegration: {
      enabledSources: { MBANK: true, CIBIL: true, GST: true, UDYAM: true },
      rateLimits: {
        MBANK: { used: 450, limit: 1000 },
        CIBIL: { used: 280, limit: 500 },
        GST: { used: 150, limit: 200 },
        UDYAM: { used: 89, limit: 100 }
      }
    },
    system: {
      nodeVersion: 'v18.16.0',
      uptime: 432000,
      memoryUsage: { heapUsed: 134217728 },
      timestamp: new Date().toISOString()
    }
  };

  const fetchSystemStatus = async () => {
    try {
      setSystemStatus(mockSystemStatus);
      addLog('success', 'System status fetched successfully');
    } catch (error) {
      console.error('Error fetching system status:', error);
      addLog('error', `Failed to fetch system status: ${error.message}`);
    }
  };

  const refreshData = async (source, options = {}) => {
    setRefreshing(true);
    addLog('info', `Starting refresh from ${source}...`);

    setTimeout(() => {
      addLog('success', `Data refreshed from ${source} successfully`);
      setRefreshing(false);
      fetchSystemStatus();
    }, 2000);
  };

  const clearCache = async () => {
    try {
      addLog('success', 'Cache cleared successfully');
      fetchSystemStatus();
    } catch (error) {
      addLog('error', `Cache clear error: ${error.message}`);
    }
  };

  const triggerSchedulerJob = async (jobName) => {
    setRefreshing(true);
    addLog('info', `Triggering scheduler job: ${jobName}`);

    setTimeout(() => {
      addLog('success', `Scheduler job ${jobName} completed successfully`);
      setRefreshing(false);
      fetchSystemStatus();
    }, 1500);
  };

  const addLog = (type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{
      type,
      message,
      timestamp,
      id: Date.now() + Math.random()
    }, ...prev.slice(0, 49)]);
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  useEffect(() => {
    fetchSystemStatus();
    setLoading(false);
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const tabButtons = [
    { id: 'status', label: 'System Status', icon: '📊' },
    { id: 'refresh', label: 'Data Refresh', icon: '🔄' },
    { id: 'logs', label: 'Activity Logs', icon: '📋' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <Server className="w-8 h-8 text-blue-200" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Real-time Data Management</h1>
            </div>
            <p className="text-blue-100">Monitor and manage loan data sources, cache, and system health</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabButtons.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'status' && systemStatus && (
            <>
              {/* Scheduler Status */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Scheduler Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Running Status</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">
                        {systemStatus.scheduler.isRunning ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Active Jobs</p>
                    <span className="text-2xl font-bold text-white">{systemStatus.scheduler.jobs?.length || 0}</span>
                  </div>
                </div>

                {systemStatus.scheduler.lastRunStatus && (
                  <div className="space-y-3">
                    <h4 className="text-slate-300 font-semibold mb-4">Job Status</h4>
                    {Object.entries(systemStatus.scheduler.lastRunStatus).map(([jobName, status]) => (
                      <div key={jobName} className="flex items-center justify-between bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-2 h-2 rounded-full ${
                            status.status === 'success' ? 'bg-green-400' :
                            status.status === 'error' ? 'bg-red-400' :
                            status.status === 'running' ? 'bg-yellow-400' : 'bg-slate-500'
                          }`}></div>
                          <span className="text-slate-300 font-medium">{jobName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium ${
                            status.status === 'success' ? 'text-green-400' :
                            status.status === 'error' ? 'text-red-400' :
                            status.status === 'running' ? 'text-yellow-400' : 'text-slate-400'
                          }`}>
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          </span>
                          {status.lastRun && (
                            <span className="text-xs text-slate-400">
                              {new Date(status.lastRun).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cache Status */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Cache Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Redis</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Connected</span>
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Cached Files</p>
                    <span className="text-2xl font-bold text-white">{systemStatus.cache.file.files}</span>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Cache Size</p>
                    <span className="text-lg font-bold text-white">{formatMemory(systemStatus.cache.file.totalSize)}</span>
                  </div>
                </div>
                <button
                  onClick={clearCache}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Cache
                </button>
              </div>

              {/* API Integration Status */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Network className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold text-white">API Integration Status</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(systemStatus.apiIntegration.enabledSources).map(([source, enabled]) => (
                    <div key={source} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="font-semibold text-slate-100">{source}</span>
                      </div>
                      {enabled && systemStatus.apiIntegration.rateLimits[source] && (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${(systemStatus.apiIntegration.rateLimits[source].used / systemStatus.apiIntegration.rateLimits[source].limit) * 100}%`
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-400">
                            {systemStatus.apiIntegration.rateLimits[source].used}/{systemStatus.apiIntegration.rateLimits[source].limit}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* System Info */}
              <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">System Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Node.js Version</p>
                    <p className="text-lg font-bold text-white">{systemStatus.system.nodeVersion}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Uptime</p>
                    <p className="text-lg font-bold text-white">{formatUptime(systemStatus.system.uptime)}</p>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Memory Usage</p>
                    <p className="text-lg font-bold text-white">{formatMemory(systemStatus.system.memoryUsage.heapUsed)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'refresh' && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-6">Data Source Management</h3>
                
                {/* API Data Sources */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">API Data Sources</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => refreshData('api')}
                      disabled={refreshing}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <RotateCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh All APIs
                    </button>
                    <button
                      onClick={() => refreshData('api', { clearCache: 'true' })}
                      disabled={refreshing}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Force Refresh
                    </button>
                  </div>
                </div>

                {/* Web Scraping */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Web Scraping</h4>
                  <button
                    onClick={() => refreshData('scraper')}
                    disabled={refreshing}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Scraped Data
                  </button>
                </div>

                {/* Scheduler Jobs */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-200 mb-4">Scheduler Jobs</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => triggerSchedulerJob('dailyRefresh')}
                      disabled={refreshing}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Daily Refresh
                    </button>
                    <button
                      onClick={() => triggerSchedulerJob('hourlyGovernmentRefresh')}
                      disabled={refreshing}
                      className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Government Schemes
                    </button>
                    <button
                      onClick={() => triggerSchedulerJob('weeklyCleanup')}
                      disabled={refreshing}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Weekly Cleanup
                    </button>
                    <button
                      onClick={() => triggerSchedulerJob('healthCheck')}
                      disabled={refreshing}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Health Check
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  Activity Logs
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Clear Logs
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No logs available. Perform some actions to see logs here.</p>
                  </div>
                ) : (
                  logs.map(log => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${
                        log.type === 'success'
                          ? 'bg-green-900 bg-opacity-20 border-green-500 text-green-300'
                          : log.type === 'error'
                          ? 'bg-red-900 bg-opacity-20 border-red-500 text-red-300'
                          : 'bg-blue-900 bg-opacity-20 border-blue-500 text-blue-300'
                      }`}
                    >
                      <span className="text-xs font-mono text-slate-400 flex-shrink-0">{log.timestamp}</span>
                      <span className="flex-1 text-sm">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            Last updated: {systemStatus?.system?.timestamp ? new Date(systemStatus.system.timestamp).toLocaleString() : 'Never'}
          </p>
          <button
            onClick={fetchSystemStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;