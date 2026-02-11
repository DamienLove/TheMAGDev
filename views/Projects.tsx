import React, { useState } from 'react';
import { View } from '../types';
import { TEMPLATES, ProjectTemplate } from '../src/data/templates';
import { useWorkspace } from '../src/components/workspace';

interface ProjectsProps {
  onNavigate: (view: View) => void;
}

const Projects: React.FC<ProjectsProps> = ({ onNavigate }) => {
  const workspace = useWorkspace();
  const [activeFilter, setActiveFilter] = useState('All');

  const handleOpenTemplate = (template: ProjectTemplate) => {
    if (confirm(`Start new project with ${template.name}? This will overwrite current workspace.`)) {
      workspace.replaceWorkspace(template.files);
      onNavigate(View.Desktop);
    }
  };

  const getIconForTemplate = (icon: string) => {
    if (icon === 'react') return 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg';
    if (icon === 'nodejs') return 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg';
    return '';
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
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Project Templates</h1>
            <p className="text-zinc-400 text-sm">Start with verified environments and functional base codes.</p>
          </div>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">
            New Empty Project
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search templates..."
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all w-full shadow-lg"
              />
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['All', 'Frontend', 'Backend', 'Fullstack', 'Mobile'].map(f => (
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Main Explore Grid */}
         <div className="lg:col-span-3">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Official Starters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {TEMPLATES.map(t => (
                 <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group shadow-xl flex flex-col">
                    <div className="h-40 bg-zinc-800 relative overflow-hidden flex items-center justify-center p-8 bg-gradient-to-br from-zinc-800 to-zinc-900">
                       <img src={getIconForTemplate(t.icon)} className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" alt={t.name} />
                       <div className="absolute top-3 right-3 flex gap-1">
                          {t.tags.slice(0, 3).map(tag => (
                            <div key={tag} className="px-2 py-1 rounded bg-zinc-950/80 backdrop-blur flex items-center justify-center text-white border border-zinc-800 text-[10px] uppercase font-bold text-zinc-400">
                               {tag}
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                       <h3 className="font-bold text-white text-lg leading-tight mb-1">{t.name}</h3>
                       <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-4">{t.description}</p>

                       <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="size-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">TM</div>
                             <span className="text-xs text-zinc-500">TheMAG Team</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-500">
                             <span className="material-symbols-rounded text-sm">verified</span>
                             <span className="text-xs font-bold text-zinc-300">Verified</span>
                          </div>
                       </div>
                       <button
                          onClick={() => handleOpenTemplate(t)}
                          className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                       >
                          <span className="material-symbols-rounded text-lg">rocket_launch</span> Initialize Project
                       </button>
                    </div>
                 </div>
               ))}

               {/* Placeholder for more */}
               <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center hover:bg-zinc-900/80 transition-colors cursor-pointer">
                  <span className="material-symbols-rounded text-4xl text-zinc-600 mb-2">add_circle</span>
                  <h3 className="font-bold text-zinc-400 text-sm">Create Blank Project</h3>
                  <p className="text-zinc-600 text-xs mt-1">Start from scratch without a template</p>
               </div>
            </div>
         </div>

         {/* Trending Sidebar */}
         <aside className="space-y-10">
            <section>
               <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">Top Contributors</h2>
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
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Verified</span>
                       </div>
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
