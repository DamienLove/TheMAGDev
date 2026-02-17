import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '../src/components/workspace/WorkspaceContext';
import webContainerService from '../src/services/WebContainerService';

interface BuildTask {
  name: string;
  command: string;
}

interface Dependency {
  name: string;
  version: string;
}

const BuildSystem: React.FC = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>(['Ready to build...']);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [npmScripts, setNpmScripts] = useState<BuildTask[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [devDependencies, setDevDependencies] = useState<Dependency[]>([]);
  const [projectName, setProjectName] = useState('My Project');

  const workspace = useWorkspace();

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [buildLogs]);

  // Parse package.json
  useEffect(() => {
    const parsePackageJson = () => {
      try {
        const content = workspace.getFileContent('/package.json');
        if (!content) return;

        const pkg = JSON.parse(content);
        setProjectName(pkg.name || 'My Project');

        if (pkg.scripts) {
          const scripts = Object.entries(pkg.scripts).map(([name, command]) => ({
            name,
            command: command as string
          }));
          setNpmScripts(scripts);
        }

        if (pkg.dependencies) {
            const deps = Object.entries(pkg.dependencies).map(([name, version]) => ({
                name,
                version: version as string
            }));
            setDependencies(deps);
        } else {
            setDependencies([]);
        }

        if (pkg.devDependencies) {
            const deps = Object.entries(pkg.devDependencies).map(([name, version]) => ({
                name,
                version: version as string
            }));
            setDevDependencies(deps);
        } else {
            setDevDependencies([]);
        }
      } catch (e) {
        console.error('Failed to parse package.json', e);
      }
    };

    parsePackageJson();
  }, [workspace.files, workspace.getFileContent]);

  const runBuild = async (task: BuildTask) => {
    if (buildStatus === 'building') return;

    setBuildStatus('building');
    setBuildProgress(0);
    setBuildLogs([`> Executing task: ${task.name} (${task.command})...`]);

    try {
        if (!webContainerService.isReady()) {
             setBuildLogs(prev => [...prev, 'Booting WebContainer...']);
             await webContainerService.boot();
             setBuildLogs(prev => [...prev, 'WebContainer ready.']);
        }

        // Split command for simple cases
        const parts = task.command.split(' ');
        const cmd = 'npm';
        const args = ['run', task.name]; // Use npm run to execute the script

        setBuildLogs(prev => [...prev, `$ ${cmd} ${args.join(' ')}`]);

        await webContainerService.runCommand(`npm run ${task.name}`, {
            onOutput: (data) => {
                 setBuildLogs(prev => [...prev, data.trim()]);
            }
        });

        setBuildStatus('success');
        setBuildProgress(100);
        setBuildLogs(prev => [...prev, 'Command completed successfully.']);

    } catch (e: any) {
        setBuildStatus('error');
        setBuildLogs(prev => [...prev, `Error: ${e.message}`]);
        // Fallback simulation for non-WebContainer environments (e.g. if blocked)
        if (e.message.includes('not supported') || e.message.includes('Failed to fetch')) {
             setBuildLogs(prev => [...prev, 'WebContainers not available, falling back to simulation...', '...', 'Build finished (Simulated).']);
             setBuildStatus('success');
        }
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col font-sans">
      {/* Build Toolbar */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-500">
            <span className="material-symbols-rounded text-[20px]">dataset</span>
          </div>
          <h1 className="text-white text-sm font-bold uppercase tracking-widest">Build System Explorer</h1>
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
                      disabled
                      className="appearance-none w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-xs font-bold text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all cursor-not-allowed opacity-80"
                    >
                       <option>{projectName}</option>
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-600 pointer-events-none">arrow_drop_down</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-2">
              <div className="px-2 py-2 flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">NPM Scripts</span>
              </div>
              
              {npmScripts.length > 0 ? (
                  <div className="space-y-0.5">
                      {npmScripts.map(task => (
                        <div
                            key={task.name}
                            className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-zinc-800 group/item transition-all cursor-pointer`}
                            onClick={() => runBuild(task)}
                        >
                           <div className="flex flex-col">
                               <span className="text-xs text-white font-bold">{task.name}</span>
                               <span className="text-[10px] text-zinc-500 truncate w-40">{task.command}</span>
                           </div>
                           <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button className="text-emerald-500 hover:text-emerald-400 p-1"><span className="material-symbols-rounded text-sm">play_arrow</span></button>
                           </div>
                        </div>
                      ))}
                  </div>
              ) : (
                  <div className="px-4 py-8 text-center text-zinc-500 text-xs">
                      No scripts found in package.json
                  </div>
              )}
           </div>
        </aside>

        {/* Main Panel: Dependencies & Resolution */}
        <main className="flex-1 overflow-y-auto p-8 bg-zinc-950">
           <div className="max-w-4xl mx-auto space-y-10">
              <section>
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
                       <span className="material-symbols-rounded text-indigo-500">inventory_2</span>
                       Dependencies
                    </h2>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                        Total: {dependencies.length + devDependencies.length}
                    </span>
                 </div>

                 <div className="grid grid-cols-1 gap-4">
                      {dependencies.length > 0 && (
                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                             <div className="px-5 py-3 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Production</span>
                             </div>
                             <div className="divide-y divide-zinc-800/50">
                                {dependencies.map((dep, i) => (
                                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors">
                                     <div className="size-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                                        <span className="material-symbols-rounded text-xl">package_2</span>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                           <span className="text-sm font-bold text-zinc-200 truncate">{dep.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">v{dep.version}</span>
                                        </div>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                      )}

                      {devDependencies.length > 0 && (
                          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                             <div className="px-5 py-3 bg-zinc-950/50 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">Dev Dependencies</span>
                             </div>
                             <div className="divide-y divide-zinc-800/50">
                                {devDependencies.map((dep, i) => (
                                  <div key={i} className="p-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors">
                                     <div className="size-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                                        <span className="material-symbols-rounded text-xl">code</span>
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                           <span className="text-sm font-bold text-zinc-200 truncate">{dep.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                           <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">v{dep.version}</span>
                                        </div>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                      )}
                 </div>
              </section>

              {/* Build Logs / Console Preview */}
              <section>
                 <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Live Build Pipeline</h2>
                 </div>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed shadow-inner overflow-hidden relative group min-h-[160px]">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-sm">content_copy</span></button>
                    </div>

                    <div className="space-y-1 h-32 overflow-y-auto pr-2">
                        {buildLogs.map((log, i) => (
                             <p key={i} className={`${log.includes('SUCCESS') ? 'text-emerald-500 font-bold' : log.includes('Error') ? 'text-red-500' : 'text-zinc-300'}`}>{log}</p>
                        ))}
                        <div ref={logsEndRef} />
                    </div>

                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-4 overflow-hidden">
                       <div
                         className={`h-full transition-all duration-300 ${buildStatus === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                         style={{ width: `${buildProgress}%` }}
                       ></div>
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
               {buildStatus === 'success' && <span className="material-symbols-rounded text-sm text-emerald-500">check_circle</span>}
               {buildStatus === 'building' && <span className="material-symbols-rounded text-sm text-indigo-500 animate-spin">sync</span>}
               {buildStatus === 'idle' && <span className="material-symbols-rounded text-sm text-zinc-600">stop_circle</span>}
               {buildStatus === 'success' ? 'Build Success' : buildStatus === 'building' ? 'Building...' : 'Ready'}
            </div>
         </div>
         <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-600 uppercase">
            <span>WebContainer</span>
         </div>
      </footer>
    </div>
  );
};

export default BuildSystem;
