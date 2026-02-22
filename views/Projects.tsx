import React, { useState } from 'react';
import { useWorkspace } from '../src/components/workspace';
import { PROJECT_TEMPLATES, ProjectTemplate } from '../src/data/showcase';

interface ProjectsProps {
  onOpenProject?: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onOpenProject }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const workspace = useWorkspace();

  const handleOpenProject = (template: ProjectTemplate) => {
    // Load the project files into the workspace
    workspace.replaceWorkspace(template.files);

    // Set active file to something reasonable (first file in src or root)
    const findFirstFile = (nodes: any[]): string | null => {
      for (const node of nodes) {
        if (node.type === 'file') return node.path;
        if (node.children) {
          const found = findFirstFile(node.children);
          if (found) return found;
        }
      }
      return null;
    };

    const firstFile = findFirstFile(template.files);
    if (firstFile) {
      workspace.setActiveFile(firstFile);
    }

    // Add a welcome message to terminal
    workspace.addTerminalLine(`\x1b[1;32mLoaded project: ${template.name}\x1b[0m`);
    workspace.addTerminalLine(`\x1b[90m${template.description}\x1b[0m`);

    // Navigate to workspace view
    if (onOpenProject) {
      onOpenProject();
    }
  };

  const trendingDevs = [
    { name: '@sarah_js', avatar: 'SJ', color: 'bg-indigo-500' },
    { name: '@mike_code', avatar: 'MC', color: 'bg-emerald-500' },
    { name: '@jin_dev', avatar: 'JD', color: 'bg-orange-500' },
    { name: '@elena_ui', avatar: 'EU', color: 'bg-purple-500' },
    { name: '@tom_h', avatar: 'TH', color: 'bg-zinc-600' }
  ];

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans">
      <header className="mb-10 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Community Showcase</h1>
            <p className="text-zinc-400 text-sm">Explore verified architectures and open-source modules.</p>
          </div>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
            Publish Artifact
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search repository registry..."
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all w-full shadow-lg"
              />
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Android', 'iOS', 'Desktop', 'Web', 'Infrastructure'].map(f => (
                <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeFilter === f ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                >
                  {f}
                </button>
              ))}
           </div>
        </div>
      </header>

      {/* Featured / Hero Section */}
      <section className="mb-12">
         <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Featured Environments</h2>
         <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 snap-x">
            {PROJECT_TEMPLATES.map(p => (
              <div key={p.id} onClick={() => handleOpenProject(p)} className="relative snap-start shrink-0 w-[450px] h-[240px] rounded-2xl overflow-hidden group cursor-pointer border border-zinc-800 shadow-2xl">
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${p.thumbnail})` }} />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                 <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-600 text-white uppercase tracking-wider">{p.status}</span>
                       <div className="flex gap-1">
                          {p.platforms.map(icon => (
                            <span key={icon} className="material-symbols-rounded text-white/60 text-sm">{icon}</span>
                          ))}
                       </div>
                    </div>
                    <h3 className="text-white text-xl font-bold tracking-tight mb-1">{p.name}</h3>
                    <p className="text-zinc-300 text-xs line-clamp-1">{p.description}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Main Explore Grid */}
         <div className="lg:col-span-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Explore Registry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {PROJECT_TEMPLATES.map(p => (
                 <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group shadow-xl">
                    <div className="h-40 bg-zinc-800 relative overflow-hidden">
                       <img src={p.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={p.name} />
                       <div className="absolute top-3 right-3 flex gap-1">
                          {p.platforms.map(icon => (
                            <div key={icon} className="size-6 rounded bg-zinc-950/80 backdrop-blur flex items-center justify-center text-white border border-zinc-800">
                               <span className="material-symbols-rounded text-[14px]">{icon}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-5">
                       <h3 className="font-bold text-white text-lg leading-tight mb-1">{p.name}</h3>
                       <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed h-8">{p.description}</p>
                       <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="size-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-indigo-400">{p.authorAvatar}</div>
                             <span className="text-xs text-zinc-500">{p.author}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500">
                             <span className="material-symbols-rounded text-sm fill-[1]">star</span>
                             <span className="text-xs font-bold text-zinc-300">{p.stars}</span>
                          </div>
                       </div>
                       <button
                         onClick={() => handleOpenProject(p)}
                         className="w-full mt-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-rounded text-lg">code</span> Load Workspace
                       </button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Trending Sidebar */}
         <aside className="space-y-10">
            <section>
               <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Trending Architects</h2>
               <div className="space-y-4">
                  {trendingDevs.map(dev => (
                    <div key={dev.name} className="flex items-center gap-3 group cursor-pointer">
                       <div className={`size-12 rounded-full p-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 transition-transform group-hover:scale-110`}>
                          <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white border-2 border-zinc-950">
                             {dev.avatar}
                          </div>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{dev.name}</span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Provider</span>
                       </div>
                    </div>
                  ))}
               </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
               <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Live Feed</h3>
                  <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
               </div>
               <div className="divide-y divide-zinc-800">
                  {[
                    { user: '@jessica', action: 'forked', target: 'React Starter' },
                    { user: '@david_k', action: 'starred', target: 'Static Portfolio' },
                    { user: '@alex_d', action: 'deployed', target: 'Node API' },
                  ].map((act, i) => (
                    <div key={i} className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer">
                       <p className="text-xs text-zinc-300">
                          <span className="font-bold text-white">{act.user}</span> {act.action} <span className="font-bold text-indigo-400">{act.target}</span>
                       </p>
                       <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Just now</p>
                    </div>
                  ))}
               </div>
            </section>
         </aside>
      </div>
    </div>
  );
};

export default Projects;
