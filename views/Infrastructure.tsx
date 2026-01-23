import React, { useState } from 'react';

interface BackendModule {
  name: string;
  status: 'Online' | 'Syncing' | 'Offline' | 'Config Required';
  icon: string;
}

interface BackendService {
  id: string;
  name: string;
  provider: string;
  project: string;
  status: 'Active' | 'Warning' | 'Disconnected';
  modules: BackendModule[];
  color: string;
  icon: string;
}

const Infrastructure: React.FC = () => {
  const [services, setServices] = useState<BackendService[]>([
    {
      id: 'firebase-1',
      name: 'Google Firebase',
      provider: 'GCP',
      project: 'nexus-prod-v1',
      status: 'Active',
      color: 'text-orange-500',
      icon: 'local_fire_department',
      modules: [
        { name: 'Authentication', status: 'Online', icon: 'group' },
        { name: 'Firestore Database', status: 'Online', icon: 'database' },
        { name: 'Cloud Storage', status: 'Online', icon: 'folder' },
        { name: 'Cloud Functions', status: 'Online', icon: 'functions' }
      ]
    },
    {
      id: 'supabase-1',
      name: 'Supabase',
      provider: 'AWS/Self-Hosted',
      project: 'nexus-edge-db',
      status: 'Warning',
      color: 'text-emerald-500',
      icon: 'bolt',
      modules: [
        { name: 'PostgreSQL', status: 'Syncing', icon: 'table_chart' },
        { name: 'Realtime Subscriptions', status: 'Online', icon: 'sensors' },
        { name: 'Edge Functions', status: 'Online', icon: 'terminal' }
      ]
    },
    {
      id: 'appwrite-1',
      name: 'Appwrite',
      provider: 'DigitalOcean',
      project: 'unmapped',
      status: 'Disconnected',
      color: 'text-pink-500',
      icon: 'terminal',
      modules: []
    }
  ]);

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">Infrastructure Stack</h1>
          <p className="text-zinc-400 text-sm">Manage multi-cloud backend services and service mesh connectivity.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
          <span className="material-symbols-rounded text-sm">add</span> Provision New Service
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            {/* Service Header */}
            <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between hover:bg-zinc-800/30 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${service.color} shadow-lg group-hover:scale-105 transition-transform`}>
                  <span className="material-symbols-rounded text-3xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">{service.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`size-1.5 rounded-full ${
                      service.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 
                      service.status === 'Warning' ? 'bg-amber-500 animate-pulse' : 'bg-zinc-600'
                    }`}></span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{service.project}</span>
                  </div>
                </div>
              </div>
              <span className="material-symbols-rounded text-zinc-600 group-hover:text-zinc-400 transition-colors">settings</span>
            </div>

            {/* Modules List */}
            <div className="flex-1 p-2">
              {service.modules.length > 0 ? (
                <div className="space-y-1">
                  {service.modules.map((mod, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 rounded-xl transition-colors group/mod cursor-pointer">
                      <span className="material-symbols-rounded text-zinc-500 group-hover/mod:text-indigo-400 transition-colors text-xl">{mod.icon}</span>
                      <p className="text-zinc-300 text-xs font-medium flex-1">{mod.name}</p>
                      {mod.status === 'Syncing' ? (
                        <span className="material-symbols-rounded text-indigo-500 text-sm animate-spin">sync</span>
                      ) : (
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{mod.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-4">
                  <p className="text-zinc-500 text-xs italic">No active modules connected to this instance.</p>
                  <button className="w-full py-2.5 rounded-xl border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all">Connect Provider API</button>
                </div>
              )}
            </div>

            {/* Service Footer / Quick Info */}
            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex items-center justify-between">
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">Provider:</span>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{service.provider}</span>
               </div>
               <button className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1">
                  Metrics <span className="material-symbols-rounded text-xs">open_in_new</span>
               </button>
            </div>
          </div>
        ))}

        {/* Upgrade / Pro Tip Card */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-600/10 p-6 border border-indigo-500/20 shadow-xl relative overflow-hidden group">
           <div className="absolute -top-10 -right-10 size-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                 <span className="material-symbols-rounded text-indigo-400">rocket_launch</span>
                 <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Enterprise Feature</span>
              </div>
              <p className="text-white text-base font-bold leading-tight mb-2">Automated Multi-Region Failover</p>
              <p className="text-indigo-200/60 text-xs leading-relaxed mb-6">Deploy cloud functions with zero-downtime traffic migration across 14+ global regions.</p>
              <button className="mt-auto w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 uppercase tracking-widest">Upgrade Workspace</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Infrastructure;