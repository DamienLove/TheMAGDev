import React, { useState, useRef, useEffect } from 'react';
import aiProvider from '../../src/services/AIProvider';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'icon' | 'font';
  url: string;
  tags: string[];
  size: string;
}

const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'App Logo', type: 'image', url: '/branding/STLOGO.png', tags: ['branding', 'logo'], size: '124KB' },
  { id: '2', name: 'Splash Screen', type: 'image', url: '/branding/STLOGO.png', tags: ['branding', 'splash'], size: '1.2MB' },
  { id: '3', name: 'Hero Video', type: 'video', url: '#', tags: ['marketing', 'video'], size: '14MB' },
];

const AssetsManager: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [activeTab, setActiveTab] = useState<'explorer' | 'ai_gen' | 'editor'>('explorer');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Editor State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editorImage, setEditorImage] = useState<HTMLImageElement | null>(null);
  const [filter, setFilter] = useState('none');
  const [rotation, setRotation] = useState(0);

  // AI Generation State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModel, setAiModel] = useState('gemini');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize Editor when tab changes or asset selected
  useEffect(() => {
    if (activeTab === 'editor' && selectedAsset?.type === 'image') {
      const img = new Image();
      img.src = selectedAsset.url;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setEditorImage(img);
        setRotation(0);
        setFilter('none');
      };
    }
  }, [activeTab, selectedAsset]);

  // Draw to canvas whenever editor state changes
  useEffect(() => {
    if (activeTab === 'editor' && canvasRef.current && editorImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset canvas dimensions to match rotated image bounds
      const rads = (rotation * Math.PI) / 180;
      const newWidth = Math.abs(editorImage.width * Math.cos(rads)) + Math.abs(editorImage.height * Math.sin(rads));
      const newHeight = Math.abs(editorImage.width * Math.sin(rads)) + Math.abs(editorImage.height * Math.cos(rads));
      
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Clear and transformations
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rads);
      
      // Apply filters
      ctx.filter = filter;
      
      // Draw image centered
      ctx.drawImage(editorImage, -editorImage.width / 2, -editorImage.height / 2);
      ctx.restore();
    }
  }, [editorImage, rotation, filter, activeTab]);

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newAsset: Asset = {
        id: Date.now().toString(),
        name: `AI Generated ${assets.length + 1}`,
        type: 'image',
        url: '/branding/STLOGO.png',
        tags: ['ai-generated'],
        size: '256KB'
      };
      setAssets([newAsset, ...assets]);
      setIsGenerating(false);
      setAiPrompt('');
      setActiveTab('explorer');
    }, 3000);
  };

  const handleDownloadEdited = () => {
     if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = `edited-${selectedAsset?.name || 'image'}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
     }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
      {/* Assets Toolbar */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {[
                { id: 'explorer', label: 'File Explorer', icon: 'folder' },
                { id: 'ai_gen', label: 'AI Generator', icon: 'auto_awesome' },
                { id: 'editor', label: 'Graphic Editor', icon: 'brush' },
              ].map(tab => (
                 <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                 >
                    <span className="material-symbols-rounded text-sm">{tab.icon}</span>
                    {tab.label.toUpperCase()}
                 </button>
              ))}
           </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
             <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500 text-sm">search</span>
             <input 
               type="text" 
               placeholder="Search assets..."
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-[10px] text-zinc-300 focus:outline-none focus:border-indigo-500 w-48 transition-all"
             />
          </div>
          <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2">
            <span className="material-symbols-rounded text-sm">upload</span>
            Upload
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'explorer' && (
          <>
            {/* Visual Asset Grid */}
            <main className="flex-1 overflow-y-auto p-6">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {filteredAssets.map(asset => (
                     <div 
                       key={asset.id} 
                       onClick={() => setSelectedAsset(asset)}
                       className={`group relative flex flex-col gap-2 p-2 rounded-xl border transition-all cursor-pointer ${selectedAsset?.id === asset.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                     >
                        <div className="aspect-square rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border border-zinc-800/50">
                           {asset.type === 'image' ? (
                             <img src={asset.url} alt={asset.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform" />
                           ) : (
                             <span className="material-symbols-rounded text-4xl text-zinc-700">{asset.type === 'video' ? 'movie' : 'font_download'}</span>
                           )}
                           <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="size-6 rounded-full bg-zinc-900/80 backdrop-blur border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white">
                                 <span className="material-symbols-rounded text-xs">more_vert</span>
                              </button>
                           </div>
                        </div>
                        <div className="px-1">
                           <p className="text-[11px] font-bold text-zinc-200 truncate">{asset.name}</p>
                           <div className="flex items-center justify-between mt-1">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase">{asset.type} • {asset.size}</span>
                              <div className="flex gap-1">
                                 {asset.tags.slice(0, 1).map(tag => (
                                    <span key={tag} className="text-[8px] bg-zinc-800 text-zinc-400 px-1 rounded font-mono">{tag}</span>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </main>

            {/* Asset Inspector */}
            <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0">
               <div className="h-9 px-4 flex items-center border-b border-zinc-800/50">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Asset Details</span>
               </div>
               {selectedAsset ? (
                 <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="aspect-video bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                       <img src={selectedAsset.url} className="max-w-full max-h-full object-contain" />
                       <button className="absolute bottom-2 right-2 size-8 bg-zinc-900/80 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white">
                          <span className="material-symbols-rounded text-lg">fullscreen</span>
                       </button>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Name</label>
                          <input 
                            type="text" 
                            value={selectedAsset.name} 
                            readOnly
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-200 focus:outline-none"
                          />
                       </div>

                       <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Project Path</label>
                          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5">
                             <span className="material-symbols-rounded text-sm text-zinc-600">folder</span>
                             <input 
                               type="text" 
                               value={selectedAsset.type === 'image' ? `/public/branding/${selectedAsset.name.toLowerCase().replace(/\s+/g, '_')}.png` : `/assets/${selectedAsset.type}s/`}
                               readOnly
                               className="flex-1 bg-transparent text-[9px] text-zinc-400 font-mono focus:outline-none"
                             />
                          </div>
                       </div>
                       
                       <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Tags</label>
                          <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950 border border-zinc-800 rounded">
                             {selectedAsset.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 bg-zinc-900 text-[10px] text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                                   {tag}
                                   <button className="hover:text-red-400"><span className="material-symbols-rounded text-[12px]">close</span></button>
                                </span>
                             ))}
                             <button className="text-[10px] text-indigo-400 font-bold hover:underline">+ Add Tag</button>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <button className="flex flex-col items-center justify-center gap-1.5 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-indigo-500/50 transition-all text-zinc-400 hover:text-indigo-400 group">
                             <span className="material-symbols-rounded text-xl">download</span>
                             <span className="text-[9px] font-bold uppercase">Download</span>
                          </button>
                          <button 
                            onClick={() => setActiveTab('editor')}
                            className="flex flex-col items-center justify-center gap-1.5 p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-indigo-500/50 transition-all text-zinc-400 hover:text-indigo-400 group"
                          >
                             <span className="material-symbols-rounded text-xl">brush</span>
                             <span className="text-[9px] font-bold uppercase">Edit</span>
                          </button>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 p-8 text-center">
                    <span className="material-symbols-rounded text-4xl mb-4">info</span>
                    <p className="text-xs font-medium">Select an asset to view its metadata and processing options</p>
                 </div>
               )}
            </aside>
          </>
        )}

        {activeTab === 'ai_gen' && (
          <div className="flex-1 flex bg-zinc-950 p-8 overflow-y-auto">
             <div className="max-w-2xl mx-auto w-full space-y-8">
                <div className="space-y-2">
                   <h2 className="text-2xl font-bold text-white tracking-tight">AI Asset Generation</h2>
                   <p className="text-xs text-zinc-500">Create production-ready graphics, icons, and videos using state-of-the-art models.</p>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-2xl">
                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Select Engine</label>
                            <div className="grid grid-cols-3 gap-2">
                               {[
                                 { id: 'gemini', name: 'Gemini', desc: 'Nano Banana' },
                                 { id: 'openai', name: 'DALL-E 3', desc: 'GPT-4o' },
                                 { id: 'sora', name: 'Sora', desc: 'Video Generation' },
                               ].map(engine => (
                                  <button
                                    key={engine.id}
                                    onClick={() => setAiModel(engine.id)}
                                    className={`p-3 rounded-xl border transition-all text-left ${aiModel === engine.id ? 'bg-indigo-600/10 border-indigo-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                                  >
                                     <div className={`text-[11px] font-bold ${aiModel === engine.id ? 'text-indigo-400' : 'text-zinc-200'}`}>{engine.name}</div>
                                     <div className="text-[9px] text-zinc-500 mt-1 font-mono uppercase tracking-tighter">{engine.desc}</div>
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Generation Prompt</label>
                            <button className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors" onClick={() => setAiPrompt('')}>Clear</button>
                         </div>
                         <textarea 
                           value={aiPrompt}
                           onChange={e => setAiPrompt(e.target.value)}
                           placeholder="Describe the asset you want to create..."
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 h-32 resize-none transition-all placeholder:text-zinc-700"
                         />
                         <div className="flex flex-wrap gap-2">
                            {['Cyberpunk City', 'Minimalist Icon', 'Gradient Logo', 'Abstract Background', '3D Character'].map(suggestion => (
                               <button 
                                 key={suggestion}
                                 onClick={() => setAiPrompt(prev => prev ? `${prev} ${suggestion}` : suggestion)}
                                 className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[9px] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                               >
                                  + {suggestion}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Style Preset</label>
                            <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-zinc-300 focus:outline-none">
                               <option>Realistic/Photographic</option>
                               <option>Flat Illustration</option>
                               <option>3D Render (Clay)</option>
                               <option>Pixel Art</option>
                               <option>Abstract/Artistic</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aspect Ratio</label>
                            <div className="flex gap-2">
                               {['1:1', '16:9', '9:16', '4:3'].map(ratio => (
                                  <button key={ratio} className="flex-1 bg-zinc-950 border border-zinc-800 rounded py-2 text-[9px] font-bold text-zinc-500 hover:text-zinc-200 transition-colors">
                                     {ratio}
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={handleAiGenerate}
                     disabled={isGenerating || !aiPrompt}
                     className={`w-full py-4 rounded-xl text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isGenerating ? 'bg-zinc-800' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20'}`}
                   >
                      {isGenerating ? (
                        <>
                           <span className="material-symbols-rounded animate-spin">progress_activity</span>
                           Dreaming...
                        </>
                      ) : (
                        <>
                           <span className="material-symbols-rounded">magic_button</span>
                           Generate Assets
                        </>
                      )}
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'editor' && (
           <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden">
              <div className="size-full flex flex-col">
                 <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center px-4 justify-between">
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Graphic Editor v1.0</span>
                       <div className="flex gap-1">
                          <button 
                            onClick={() => { setRotation(prev => prev - 90); }}
                            className="size-6 flex items-center justify-center text-zinc-500 hover:text-white"
                          >
                              <span className="material-symbols-rounded text-sm">rotate_left</span>
                          </button>
                          <button 
                             onClick={() => { setRotation(prev => prev + 90); }}
                             className="size-6 flex items-center justify-center text-zinc-500 hover:text-white"
                          >
                             <span className="material-symbols-rounded text-sm">rotate_right</span>
                          </button>
                       </div>
                    </div>
                    <button 
                       onClick={handleDownloadEdited}
                       className="px-3 py-1 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase tracking-widest"
                    >
                       Save Image
                    </button>
                 </div>
                 <div className="flex-1 flex relative overflow-hidden">
                    <main className="flex-1 bg-zinc-800 relative flex items-center justify-center p-8 overflow-auto dot-pattern">
                       {selectedAsset?.type === 'image' ? (
                          <div className="shadow-2xl relative border border-zinc-700 bg-zinc-900">
                             <canvas ref={canvasRef} />
                          </div>
                       ) : (
                          <div className="text-zinc-500 text-xs">Please select an image asset to edit</div>
                       )}
                    </main>
                    <aside className="w-64 bg-zinc-950 border-l border-zinc-800 p-4 shrink-0">
                       <div className="space-y-4">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Filters</label>
                          <div className="space-y-2">
                             {[
                                { id: 'none', label: 'Normal' },
                                { id: 'grayscale(100%)', label: 'Grayscale' },
                                { id: 'sepia(100%)', label: 'Sepia' },
                                { id: 'invert(100%)', label: 'Invert' },
                                { id: 'blur(5px)', label: 'Blur' },
                                { id: 'contrast(200%)', label: 'High Contrast' },
                             ].map(f => (
                                <div 
                                  key={f.id} 
                                  onClick={() => setFilter(f.id)}
                                  className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${filter === f.id ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                                >
                                   <span className={`text-[10px] ${filter === f.id ? 'text-indigo-300' : 'text-zinc-400'}`}>{f.label}</span>
                                   {filter === f.id && <span className="material-symbols-rounded text-[14px] text-indigo-400">check</span>}
                                </div>
                             ))}
                          </div>
                       </div>
                    </aside>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AssetsManager;