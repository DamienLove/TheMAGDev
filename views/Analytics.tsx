import React, { useState } from 'react';

const Analytics: React.FC = () => {
  const [activeTab] = useState('Overview');

  const metrics = [
    { label: 'Active Sessions', value: '1.2k', change: '+12%', trend: 'up', color: 'text-indigo-500', icon: 'group' },
    { label: 'Conversion Rate', value: '4.8%', change: '+2.1%', trend: 'up', color: 'text-emerald-500', icon: 'shopping_cart' },
    { label: 'Crash-Free Rate', value: '99.9%', change: '0%', trend: 'neutral', color: 'text-blue-500', icon: 'bug_report' },
    { label: 'Avg. Latency', value: '42ms', change: '-12ms', trend: 'up', color: 'text-amber-500', icon: 'speed' }, // up is good here
  ];

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">Growth & Performance Hub</h1>
          <p className="text-zinc-400 text-sm">Real-time user engagement and platform health telemetry.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all">Export JSON</button>
           <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">Configure Webhooks</button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl group hover:border-zinc-700 transition-all">
             <div className="flex justify-between items-start mb-4">
                <div className={`size-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center ${m.color}`}>
                   <span className="material-symbols-rounded">{m.icon}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                   {m.change}
                </span>
             </div>
             <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{m.label}</h3>
             <p className="text-2xl font-bold text-white tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Main Chart Area */}
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h3 className="text-white font-bold text-lg">Retention Cohorts</h3>
                     <p className="text-zinc-500 text-xs mt-1">User lifecycle analysis over last 90 days.</p>
                  </div>
                  <div className="flex gap-2">
                     {['D7', 'D30', 'D90'].map(d => (
                       <button key={d} className={`px-3 py-1 rounded text-[10px] font-bold ${d === 'D30' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{d}</button>
                     ))}
                  </div>
               </div>
               <div className="h-64 w-full bg-zinc-950/50 rounded-xl border border-zinc-800/50 relative overflow-hidden flex items-center justify-center">
                  {/* Decorative Chart Mockup */}
                  <svg className="w-full h-full p-4" viewBox="0 0 400 150" preserveAspectRatio="none">
                     <path d="M0,120 Q50,100 100,110 T200,40 T300,60 T400,20" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
                     <path d="M0,130 Q50,110 100,120 T200,60 T300,80 T400,40" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">Live Telemetry Stream</span>
                  </div>
               </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
               <h3 className="text-white font-bold text-lg mb-6">Accessibility & UX Audit</h3>
               <div className="space-y-4">
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center">
                           <span className="text-xs font-bold text-emerald-500">82%</span>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white uppercase tracking-tight">Compliance Score</p>
                           <p className="text-xs text-zinc-500">WCAG 2.1 AA Standards</p>
                        </div>
                     </div>
                     <button className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-bold uppercase transition-all">Full Report</button>
                  </div>
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-start gap-4">
                     <span className="material-symbols-rounded text-amber-500 mt-0.5">warning</span>
                     <div>
                        <p className="text-sm font-bold text-amber-500 uppercase tracking-tight">Critical Contrast Errors</p>
                        <p className="text-xs text-amber-500/60 mt-1 leading-relaxed">Three primary action buttons in the 'Editor' view have insufficient color contrast for low-vision users.</p>
                     </div>
                  </div>
               </div>
            </section>
         </div>

         {/* Sidebar: Store Context */}
         <aside className="space-y-8">
            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Market Distribution</h3>
               <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:text-indigo-400">
                           <span className="material-symbols-rounded">phone_iphone</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-white font-bold text-sm truncate">Apple App Store</p>
                           <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-tighter mt-0.5">Sync Success • v2.4.0</p>
                        </div>
                        <span className="material-symbols-rounded text-zinc-600 group-hover:text-white transition-colors">navigate_next</span>
                     </div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:text-amber-500">
                           <span className="material-symbols-rounded">android</span>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="text-white font-bold text-sm truncate">Google Play Store</p>
                           <p className="text-amber-500 text-[10px] font-bold uppercase tracking-tighter mt-0.5 underline">Action Required: Metadata</p>
                        </div>
                        <span className="material-symbols-rounded text-zinc-600 group-hover:text-white transition-colors">navigate_next</span>
                     </div>
                  </div>
               </div>
            </section>

            <section className="bg-indigo-600 p-6 rounded-2xl shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
               <div className="absolute -top-4 -right-4 size-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
               <h4 className="text-white font-bold mb-2">Predictive Scaling</h4>
               <p className="text-indigo-100 text-[11px] leading-relaxed mb-4">Nexus AI predicts a 24% surge in traffic over the weekend. Enable automated load balancing?</p>
               <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold shadow-xl active:scale-95 transition-all">Enable Auto-Scale</button>
            </section>
         </aside>
      </div>
    </div>
  );
};

export default Analytics;