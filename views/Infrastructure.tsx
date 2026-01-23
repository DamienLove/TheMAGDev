import React, { useState, useEffect } from 'react';

const Infrastructure: React.FC = () => {
  const [cpuUsage, setCpuUsage] = useState([40, 65, 45, 80, 55, 70, 45, 60, 85, 90, 75, 50, 60, 45, 30]);
  const [memoryUsage, setMemoryUsage] = useState(12.4); // GB
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Storage State
  const [cloudUsed, setCloudUsed] = useState(45); // %
  const [localSyncStatus, setLocalSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE'>('SYNCED');

  // Simulate live resource tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => {
        const next = [...prev.slice(1), Math.floor(Math.random() * 60) + 20];
        return next;
      });
      // Fluctuate memory slightly
      setMemoryUsage(prev => {
         const change = (Math.random() - 0.5) * 0.2;
         return Math.max(8, Math.min(32, prev + change));
      });
      // Simulate sync
      if (Math.random() > 0.9) {
          setLocalSyncStatus('SYNCING');
          setTimeout(() => setLocalSyncStatus('SYNCED'), 2000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
        setMemoryUsage(prev => prev * 0.7); // Drop memory usage significantly
        setCpuUsage(prev => prev.map(v => v * 0.6)); // Drop CPU usage
        setIsOptimizing(false);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Infrastructure & Storage</h1>
          <p className="text-zinc-400">Manage compute resources, cloud storage buckets, and local sync bridges.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-wait text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
                {isOptimizing ? (
                    <>
                        <span className="material-symbols-rounded animate-spin text-sm">refresh</span>
                        Optimizing...
                    </>
                ) : (
                    <>
                         <span className="material-symbols-rounded text-sm">memory</span>
                         Optimize Resources
                    </>
                )}
            </button>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20">
            + Add Resource
            </button>
        </div>
      </header>

      {/* Storage Management Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-400">cloud_sync</span>
            Storage Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cloud Storage Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-rounded text-[100px] text-indigo-500">cloud</span>
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2">Nexus Cloud Storage</h3>
                <div className="flex items-end gap-2 mb-4">
                    <span className="text-3xl font-bold text-white">45.2 GB</span>
                    <span className="text-sm text-zinc-500 mb-1">/ 100 GB</span>
                </div>
                {/* Custom Progress Bar */}
                <div className="w-full h-2 bg-zinc-800 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${cloudUsed}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-zinc-500">
                    <span>Artifacts: 20GB</span>
                    <span>Assets: 25GB</span>
                </div>
            </div>

            {/* Local Sync Bridge Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400">Local Filesystem Bridge</h3>
                        <p className="text-xs text-zinc-500 mt-1">MacBook-Pro-M1 • /Users/dev/nexus</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${
                        localSyncStatus === 'SYNCED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        localSyncStatus === 'SYNCING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                        {localSyncStatus === 'SYNCING' && <span className="material-symbols-rounded animate-spin text-[12px]">sync</span>}
                        {localSyncStatus === 'SYNCED' && <span className="material-symbols-rounded text-[12px]">check_circle</span>}
                        {localSyncStatus}
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-zinc-950 rounded border border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-zinc-500">folder</span>
                            <span className="text-sm text-zinc-300">src/assets</span>
                        </div>
                        <span className="text-xs text-zinc-500">Synced 1m ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-950 rounded border border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-zinc-500">database</span>
                            <span className="text-sm text-zinc-300">local.db</span>
                        </div>
                        <span className="text-xs text-zinc-500">Synced 5m ago</span>
                    </div>
                 </div>
                 <button className="w-full mt-4 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/50 rounded py-2 transition-colors">
                     Configure Bridge
                 </button>
            </div>

             {/* Usage Trends */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                 <div className="w-24 h-24 rounded-full border-4 border-zinc-800 border-t-indigo-500 flex items-center justify-center mb-4">
                     <div>
                         <div className="text-2xl font-bold text-white">85%</div>
                         <div className="text-[10px] text-zinc-500 uppercase">Efficiency</div>
                     </div>
                 </div>
                 <p className="text-sm text-zinc-400">Storage Optimization Score</p>
                 <button className="text-xs text-indigo-400 mt-2 hover:underline">View Recommendations</button>
             </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connected Databases */}
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Databases</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center">
                    <span className="material-symbols-rounded text-amber-500">database</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Firebase (Production)</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                    </p>
                  </div>
                </div>
                <button className="text-zinc-400 hover:text-white"><span className="material-symbols-rounded">settings</span></button>
              </div>
              <div className="p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-zinc-400 text-xs mb-1">Reads</div>
                  <div className="text-white font-mono">14.2k</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs mb-1">Writes</div>
                  <div className="text-white font-mono">2.1k</div>
                </div>
                <div>
                  <div className="text-zinc-400 text-xs mb-1">Storage</div>
                  <div className="text-white font-mono">4.8 GB</div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Environment Secrets</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-zinc-500">key</span>
                    <span className="font-mono text-sm text-indigo-300">STRIPE_SECRET_KEY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">••••••••••••••••</span>
                    <button className="text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-sm">visibility</span></button>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-dashed border-zinc-700 text-zinc-400 rounded-lg text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                + Add Secret
              </button>
            </div>
          </section>
        </div>

        {/* Resource Usage */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Compute Resources</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-6 flex justify-between">
                <span>Live Server Load</span>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300">Updated 1s ago</span>
            </h3>
            
            <div className="flex items-end justify-between h-40 gap-2 mb-2">
              {cpuUsage.map((h, i) => (
                <div key={i} className="w-full bg-indigo-500/20 rounded-t-sm relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-400" 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>00:00</span>
              <span>12:00</span>
              <span>24:00</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-sm mb-1">CPU Cores</div>
              <div className="text-2xl font-bold text-white mb-2">4 / 8</div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(cpuUsage[cpuUsage.length-1] / 100) * 100}%` }}></div>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-zinc-400 text-sm mb-1">Memory</div>
              <div className="text-2xl font-bold text-white mb-2">{memoryUsage.toFixed(1)} GB</div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(memoryUsage / 32) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Infrastructure;