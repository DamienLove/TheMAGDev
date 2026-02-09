import React, { useState, useEffect } from 'react';
import extensionService, { MarketplaceExtension } from '../src/services/ExtensionService';

interface ExtensionDisplay {
  id: string;
  name: string;
  author: string;
  description: string;
  downloads: string;
  rating: number;
  icon: string;
  category: string;
  installed: boolean;
  color: string;
  isImage?: boolean;
}

const Marketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'EXPLORE' | 'INSTALLED'>('EXPLORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<MarketplaceExtension[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateState = () => {
      setExtensions(extensionService.getMarketplaceExtensions());
      setInstalledIds(new Set(extensionService.getInstalledExtensions().map(e => e.manifest.id)));
    };

    updateState();
    return extensionService.onChange(updateState);
  }, []);

  const categories = [
    { name: 'Popular', icon: 'trending_up' },
    { name: 'Frameworks', icon: 'view_in_ar' },
    { name: 'AI & LLMs', icon: 'psychology' },
    { name: 'Cloud', icon: 'cloud' },
    { name: 'Data', icon: 'storage' },
    { name: 'Themes', icon: 'palette' },
    { name: 'Languages', icon: 'translate' },
    { name: 'Modules', icon: 'view_quilt' }
  ];

  const handleInstall = async (extId: string) => {
    setInstalling(extId);
    if (installedIds.has(extId)) {
      extensionService.uninstallExtension(extId);
    } else {
      await extensionService.installExtension(extId);
    }
    setInstalling(null);
  };

  const getDisplayExtensions = (): ExtensionDisplay[] => {
    let source = extensions;

    if (activeTab === 'INSTALLED') {
      source = extensions.filter(ext => installedIds.has(ext.manifest.id));
    }

    return source.map(ext => {
      const isInstalled = installedIds.has(ext.manifest.id);
      return {
        id: ext.manifest.id,
        name: ext.manifest.displayName,
        author: ext.manifest.author.name,
        description: ext.manifest.description,
        downloads: ext.downloads > 1000000 ? `${(ext.downloads / 1000000).toFixed(1)}M` : `${(ext.downloads / 1000).toFixed(1)}K`,
        rating: ext.rating,
        icon: ext.manifest.id.includes('theme') ? 'palette' :
              ext.manifest.categories.includes('ai') ? 'smart_toy' :
              ext.manifest.categories.includes('language') ? 'code' :
              ext.manifest.categories.includes('git') ? 'merge' :
              ext.manifest.categories.includes('testing') ? 'bug_report' :
              ext.manifest.categories.includes('formatter') ? 'format_align_left' :
              'extension',
        category: ext.manifest.categories[0] ? ext.manifest.categories[0].charAt(0).toUpperCase() + ext.manifest.categories[0].slice(1) : 'Other',
        installed: isInstalled,
        color: isInstalled ? 'bg-zinc-700' : 'bg-zinc-800', // Dynamic color logic could be improved
        isImage: false
      };
    });
  };

  const filteredExtensions = getDisplayExtensions().filter(ext => {
    const matchesSearch = searchQuery
      ? ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = activeCategory
      ? activeCategory === 'Popular' || ext.category.toLowerCase().includes(activeCategory.toLowerCase())
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 bg-zinc-950 overflow-y-auto p-8 font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 uppercase tracking-tight">TheMAG.dev Marketplace</h1>
          <p className="text-zinc-400 text-sm">Expand your development environment with verified extensions.</p>
        </div>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button 
            onClick={() => setActiveTab('EXPLORE')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'EXPLORE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Explore
          </button>
          <button 
            onClick={() => setActiveTab('INSTALLED')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'INSTALLED' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Installed ({installedIds.size})
          </button>
        </div>
      </header>

      {/* Search and Filter Area */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500">search</span>
          <input 
            type="text" 
            placeholder="Search extensions, themes, and language packs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {categories.map(cat => (
             <button
               key={cat.name}
               onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
               className={`flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 transition-all ${
                 activeCategory === cat.name
                   ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-400'
                   : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
               }`}
             >
                <span className="material-symbols-rounded text-[18px]">{cat.icon}</span>
                <span className="text-xs font-bold uppercase tracking-tight">{cat.name}</span>
             </button>
           ))}
        </div>
      </div>

      {/* Featured Section */}
      {activeTab === 'EXPLORE' && !searchQuery && (
        <div className="mb-10">
          <div className="relative rounded-2xl overflow-hidden h-56 group border border-zinc-800">
             <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-10"></div>
             <img 
              src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2070&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt="Cybersecurity abstraction"
             />
             <div className="absolute top-4 right-4 z-20 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Featured Pack</div>
             <div className="relative z-20 h-full flex flex-col justify-center px-10 max-w-lg">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Security Hardening Kit</h2>
                <p className="text-zinc-300 text-sm mb-6">Automated vulnerability scanning and secret detection for your multi-cloud deployments.</p>
                <button className="bg-white text-zinc-950 px-6 py-2.5 rounded-lg font-bold text-sm w-fit hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">Activate Now</button>
             </div>
          </div>
        </div>
      )}

      {/* Extension Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredExtensions.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
            <span className="material-symbols-rounded text-5xl text-zinc-700 mb-4">search_off</span>
            <h3 className="text-lg font-bold text-zinc-400 mb-2">No Extensions Found</h3>
            <p className="text-sm text-zinc-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredExtensions.map(ext => (
            <div key={ext.id} className="flex gap-5 p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group shadow-xl">
               <div className={`size-20 rounded-2xl ${ext.color} flex items-center justify-center shrink-0 text-white shadow-lg overflow-hidden`}>
                  {ext.isImage ? (
                    <img src={ext.icon} className="w-full h-full object-cover" alt={ext.name} />
                  ) : (
                    <span className="material-symbols-rounded text-4xl">{ext.icon}</span>
                  )}
               </div>
               <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                     <div>
                        <h4 className="text-white font-bold text-lg truncate tracking-tight">{ext.name}</h4>
                        <p className="text-zinc-500 text-xs font-medium uppercase tracking-tighter">by {ext.author} • {ext.category}</p>
                     </div>
                     <div className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        <span className="material-symbols-rounded text-amber-500 text-[14px] fill-[1]">star</span>
                        <span className="text-xs font-bold text-zinc-300">{ext.rating.toFixed(1)}</span>
                     </div>
                  </div>
                  <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">{ext.description}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-bold uppercase">
                           <span className="material-symbols-rounded text-sm">download</span>
                           <span>{ext.downloads}</span>
                        </div>
                        <div className="size-1 bg-zinc-800 rounded-full"></div>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase">Verified Artifact</span>
                     </div>
                     <button
                       onClick={() => handleInstall(ext.id)}
                       disabled={installing === ext.id}
                       className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 ${
                         ext.installed
                           ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                           : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/10'
                       }`}
                     >
                        {installing === ext.id ? (
                          <>
                            <span className="material-symbols-rounded text-sm animate-spin">refresh</span>
                            {ext.installed ? 'Removing...' : 'Installing...'}
                          </>
                        ) : (
                          ext.installed ? 'Uninstall' : 'Install Extension'
                        )}
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 text-center">
         <p className="text-zinc-600 text-xs font-bold uppercase tracking-[0.2em]">End of registry</p>
      </div>
    </div>
  );
};

export default Marketplace;
