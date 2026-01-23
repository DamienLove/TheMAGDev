import React from 'react';
import { Metric, Deployment } from '../types';

const Dashboard: React.FC = () => {
  const metrics: Metric[] = [
    { label: 'Build Velocity', value: '14.2 min', change: 12, trend: 'down' }, // down is good for time
    { label: 'Test Coverage', value: '94.8%', change: 2.4, trend: 'up' },
    { label: 'Active Users', value: '124.5k', change: 8.1, trend: 'up' },
    { label: 'Error Rate', value: '0.02%', change: 0.01, trend: 'neutral' },
  ];

  const deployments: Deployment[] = [
    { id: 'dep-8492', environment: 'Production', status: 'Live', version: 'v2.4.0', time: '2h ago' },
    { id: 'dep-8493', environment: 'Staging', status: 'Building', version: 'v2.4.1-rc', time: 'Just now' },
    { id: 'dep-8491', environment: 'Dev', status: 'Failed', version: 'v2.5.0-alpha', time: '1d ago' },
  ];

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Project Overview</h1>
          <p className="text-slate-400">Manage your deployment pipeline and project health.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center gap-2">
            <span className="material-symbols-rounded text-sm">share</span> Share Report
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <span className="material-symbols-rounded text-sm">rocket_launch</span> New Release
          </button>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((m, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
            <p className="text-slate-400 text-sm font-medium mb-2">{m.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-white">{m.value}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                m.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' : 
                m.trend === 'down' ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 bg-slate-400/10'
              }`}>
                {m.change > 0 ? '+' : ''}{m.change}%
                <span className="material-symbols-rounded text-[14px]">
                  {m.trend === 'up' ? 'trending_up' : m.trend === 'down' ? 'trending_down' : 'remove'}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Deployments */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Deployments</h3>
            <button className="text-indigo-400 text-sm hover:underline">View Pipeline</button>
          </div>
          <div className="space-y-4">
            {deployments.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    dep.status === 'Live' ? 'bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.3)]' :
                    dep.status === 'Building' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                  }`} />
                  <div>
                    <h4 className="text-sm font-medium text-white">{dep.environment}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">{dep.version} • {dep.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                    dep.status === 'Live' ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900' :
                    dep.status === 'Building' ? 'text-amber-400 bg-amber-950/30 border border-amber-900' : 
                    'text-red-400 bg-red-950/30 border border-red-900'
                  }`}>{dep.status}</span>
                  <p className="text-xs text-slate-500 mt-2">{dep.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status / Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">CPU Usage</span>
                <span className="text-white">42%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Memory</span>
                <span className="text-white">78%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-slate-800">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">Clear Cache</button>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">Restart Pods</button>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">Run Migrations</button>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors">View Logs</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;