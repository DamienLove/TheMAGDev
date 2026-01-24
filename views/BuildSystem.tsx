import React, { useState } from 'react';

interface BuildTask {
  name: string;
  type: 'android' | 'build' | 'verification';
  isKey?: boolean;
}

interface Dependency {
  group: string;
  version: string;
  updateAvailable?: string;
  hasConflict?: boolean;
}

const BuildSystem: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState('TheMAGCore:app');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const tasks: Record<string, BuildTask[]> = {
    'android': [
      { name: 'androidDependencies', type: 'android' },
      { name: 'signingReport', type: 'android' }
    ],
    'build': [
      { name: 'assemble', type: 'build' },
      { name: 'assembleDebug', type: 'build', isKey: true },
      { name: 'bundleRelease', type: 'build' },
      { name: 'clean', type: 'build' }
    ],
    'verification': [
      { name: 'lint', type: 'verification' },
      { name: 'test', type: 'verification' }
    ]
  };

  const dependencies: Record<string, Dependency[]> = {
    'implementation': [
      { group: 'androidx.core:core-ktx', version: '1.7.0' },
      { group: 'com.google.android.material', version: '1.5.0', updateAvailable: '1.6.0', hasConflict: true },
      { group: 'com.squareup.retrofit2:retrofit', version: '2.9.0' }
    ],
    'testImplementation': [
      { group: 'junit:junit', version: '4.13.2' }
    ]
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col font-sans">
      {/* Build Toolbar */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-500">
            <span className="material-symbols-rounded text-[20px]">dataset</span>
          </div>
          <h1 className="text-white text-sm font-bold uppercase tracking-widest">Build System Explorer (Gradle)</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-500 hover:text-white transition-colors" title="Sync Project Artifacts">
            <span className="material-symbols-rounded">sync</span>
          </button>
          <button className="p-2 text-zinc-500 hover:text-white transition-colors" title="Build Settings">
            <span className="material-symbols-rounded">settings</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Project Context */}
        <aside className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
           <div className="p-4 border-b border-zinc-800/50 space-y-4">
              <div>
                 <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 ml-1">Active Project</label>
                 <div className="relative">
                    <select 
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="appearance-none w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                    >
                       <option>TheMAGCore</option>
                       <option>TheMAGCore:app</option>
                       <option>TheMAGCore:infrastructure</option>
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-600 pointer-events-none">arrow_drop_down</span>
                 </div>
              </div>
              <div className="relative">
                 <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-600 text-sm">search</span>
                 <input 
                  type="text" 
                  placeholder="Filter build tasks..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-2">
              <div className="px-2 py-2 flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Build Invocations</span>
              </div>
              
              {Object.entries(tasks).map(([group, taskList]) => (
                <details key={group} className="group/folder mb-1" open={group === 'build'}>
                   <summary className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-zinc-800 cursor-pointer select-none text-xs font-bold text-zinc-400 uppercase tracking-tight transition-colors">
                      <span className="material-symbols-rounded text-sm text-zinc-600 group-open/folder:rotate-90 transition-transform">chevron_right</span>
                      <span className={`material-symbols-rounded text-sm ${group === 'android' ? 'text-emerald-500' : group === 'build' ? 'text-amber-500' : 'text-purple-500'}`}>
                        {group === 'android' ? 'android' : group === 'build' ? 'build' : 'fact_check'}
                      </span>
                      {group}
                   </summary>
                   <div className="pl-4 ml-3 border-l border-zinc-800 mt-1 space-y-0.5">
                      {taskList.map(task => (
                        <div key={task.name} className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-800 group/item transition-all ${task.isKey ? 'bg-indigo-500/5 border-l border-indigo-500' : ''}`}>
                           <span className={`text-xs ${task.isKey ? 'text-white font-bold' : 'text-zinc-500'}`}>{task.name}</span>
                           <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button className="text-emerald-500 hover:text-emerald-400 p-1"><span className="material-symbols-rounded text-sm">play_arrow</span></button>
                              {task.isKey && <button className="text-red-400 hover:text-red-300 p-1"><span className="material-symbols-rounded text-sm">bug_report</span></button>}
                           </div>
                        </div>
                      ))}
                   </div>
                </details>
              ))}
           </div>
        </aside>

        {/* Main Panel: Dependencies & Resolution */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-950">
           <div className="max-w-4xl mx-auto space-y-10">
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                       <span className="material-symbols-rounded text-indigo-500">inventory_2</span>
                       Dependency Resolution
                    </h2>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">Lockfile: enabled</span>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                    {Object.entries(dependencies).map(([scope, deps]) => (
                      <div key={scope} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                         <div className="px-5 py-3 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{scope}</span>
                            <span className="text-[10px] font-bold text-zinc-600">{deps.length} Artifacts</span>
                         </div>
                         <div className="divide-y divide-zinc-800/50">
                            {deps.map((dep, i) => (
                              <div key={i} className={`p-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors ${dep.hasConflict ? 'bg-amber-500/5' : ''}`}>
                                 <div className={`size-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 ${dep.hasConflict ? 'text-amber-500' : 'text-zinc-500'}`}>
                                    <span className="material-symbols-rounded text-xl">package_2</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="text-sm font-bold text-zinc-200 truncate">{dep.group}</span>
                                       {dep.hasConflict && <span className="material-symbols-rounded text-amber-500 text-sm">warning</span>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">v{dep.version}</span>
                                       {dep.updateAvailable && (
                                         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">
                                            Update Available: {dep.updateAvailable}
                                         </div>
                                       )}
                                    </div>
                                 </div>
                                 <button className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-tighter">Exclude</button>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </section>

              {/* Build Logs / Console Preview */}
              <section>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Live Build Pipeline</h2>
                    <button className="text-[10px] font-bold text-indigo-400 hover:underline uppercase">View Full Console</button>
                 </div>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-inner overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-sm">content_copy</span></button>
                    </div>
                    <p className="text-zinc-500">Establishing Gradle daemon...</p>
                    <p className="text-zinc-300">Daemon will be stopped at the end of the build after 3 hours of idle time.</p>
                    <p className="text-zinc-100 mt-1">&gt; Task :app:assembleDebug <span className="text-emerald-500">UP-TO-DATE</span></p>
                    <p className="text-zinc-100">&gt; Task :app:bundleRelease <span className="text-indigo-400 font-bold">EXECUTING [45%]</span></p>
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: '45%' }}></div>
                    </div>
                 </div>
              </section>
           </div>
        </main>
      </div>

      {/* Footer / Build Status */}
      <footer className="h-10 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setIsOfflineMode(!isOfflineMode)}>
               <div className={`w-7 h-4 rounded-full relative transition-colors ${isOfflineMode ? 'bg-zinc-700' : 'bg-indigo-600'}`}>
                  <div className={`absolute top-0.5 size-3 rounded-full bg-white transition-all ${isOfflineMode ? 'left-0.5' : 'left-3.5'}`}></div>
               </div>
               <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">Offline Mode</span>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
               <span className="material-symbols-rounded text-sm text-emerald-500">check_circle</span>
               Build Success in 12.4s
            </div>
         </div>
         <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase">
            <span>Daemon: 8.4.1</span>
            <span>JVM: 17.0.8</span>
         </div>
      </footer>
    </div>
  );
};

export default BuildSystem;
