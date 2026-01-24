import React, { useState } from 'react';

interface StoreItem {
  id: string;
  name: string;
  category: 'ui-element' | 'template' | 'icon-set' | 'plugin';
  author: string;
  price: 'free' | string;
  rating: number;
  downloads: string;
  image: string;
}

const STORE_ITEMS: StoreItem[] = [
  { id: '1', name: 'Glassmorphism Pack', category: 'ui-element', author: 'TheMAG Design Team', price: 'free', rating: 4.9, downloads: '12k', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80' },
  { id: '2', name: 'SaaS Dashboard Template', category: 'template', author: 'PremiumUI', price: '$24', rating: 4.8, downloads: '2.4k', image: 'https://images.unsplash.com/photo-1551288049-bbda4833effb?auto=format&fit=crop&w=300&q=80' },
  { id: '3', name: 'Cyberpunk Icon Set', category: 'icon-set', author: 'NeoArtist', price: 'free', rating: 4.7, downloads: '8.1k', image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=300&q=80' },
  { id: '4', name: 'Neumorphic Buttons', category: 'ui-element', author: 'SoftUI', price: 'free', rating: 4.5, downloads: '5.6k', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=300&q=80' },
  { id: '5', name: 'Ecommerce App Kit', category: 'template', author: 'ShopFlow', price: '$49', rating: 4.9, downloads: '1.2k', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=300&q=80' },
  { id: '6', name: 'Abstract Backgrounds', category: 'icon-set', author: 'VisArt', price: 'free', rating: 4.6, downloads: '15k', image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=300&q=80' },
];

const StudioStore: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const filteredItems = STORE_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
      {/* Toast Notification */}
      <div className={`absolute top-16 right-4 z-50 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-lg px-4 py-3 flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <span className="material-symbols-rounded text-lg">check_circle</span>
        </div>
        <div>
            <h4 className="text-xs font-bold text-white">Asset Added</h4>
            <p className="text-[10px] text-zinc-400">Item successfully added to your library.</p>
        </div>
      </div>

      {/* Store Header */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-indigo-500">storefront</span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Studio Store</span>
           </div>
           <div className="h-4 w-px bg-zinc-800"></div>
           <nav className="flex items-center gap-4">
              {['all', 'ui-element', 'template', 'icon-set', 'plugin'].map(cat => (
                 <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                 >
                    {cat.replace('-', ' ')}
                 </button>
              ))}
           </nav>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500 text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search elements..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-indigo-500 w-48 transition-all"
              />
           </div>
           <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20">
              Publish Element
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
         {/* Hero Section */}
         <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-zinc-900 border border-indigo-500/20 p-8 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-lg space-y-4">
               <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-bold rounded uppercase tracking-widest">Featured Pack</span>
               <h2 className="text-3xl font-bold text-white tracking-tight leading-none">Vision UI: <br/> The Ultimate Design System</h2>
               <p className="text-sm text-zinc-400">Over 500+ premium components, templates and icons optimized for TheMAG.dev runtime.</p>
               <button className="px-6 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors">Get it now - Free</button>
            </div>
            <div className="size-48 bg-indigo-500/20 blur-[80px] absolute -right-12 -top-12"></div>
            <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80" className="w-64 h-40 object-cover rounded-xl border border-white/10 shadow-2xl relative z-10 rotate-3 group-hover:rotate-0 transition-transform duration-500" />
         </div>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
               <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all group flex flex-col">
                  <div className="aspect-video relative overflow-hidden">
                     <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <button className="w-full py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20">Preview Element</button>
                     </div>
                     <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded uppercase tracking-widest border border-white/10">{item.category.replace('-', ' ')}</span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-3">
                     <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                           <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                           <p className="text-[10px] text-zinc-500 font-medium">by {item.author}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${item.price === 'free' ? 'text-emerald-400' : 'text-indigo-400'}`}>{item.price}</span>
                     </div>
                     <div className="mt-auto flex items-center justify-between pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-1">
                           <span className="material-symbols-rounded text-amber-500 text-xs">star</span>
                           <span className="text-[10px] font-bold text-zinc-300">{item.rating}</span>
                           <span className="text-[9px] text-zinc-600 font-bold uppercase ml-1">({item.downloads})</span>
                        </div>
                        <button 
                            onClick={() => handleDownload(item.id)}
                            disabled={downloadingId === item.id}
                            className="size-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                        >
                           {downloadingId === item.id ? (
                               <span className="material-symbols-rounded text-sm animate-spin">progress_activity</span>
                           ) : (
                               <span className="material-symbols-rounded text-lg">add_shopping_cart</span>
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default StudioStore;