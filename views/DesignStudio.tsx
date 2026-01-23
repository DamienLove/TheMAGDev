import React, { useState } from 'react';

type DeviceType = 'iPhone 14' | 'Pixel 7' | 'iPad';
type Tool = 'select' | 'pan' | 'zoom';

interface CanvasElement {
  id: string;
  name: string;
  type: 'input' | 'button' | 'container' | 'text' | 'icon';
}

const DesignStudio: React.FC = () => {
  const [device, setDevice] = useState<DeviceType>('iPhone 14');
  const [selectedElement, setSelectedElement] = useState('Email Input');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(8);
  const [previewMode, setPreviewMode] = useState(false);

  const canvasElements: CanvasElement[] = [
    { id: 'logo', name: 'App Logo', type: 'icon' },
    { id: 'title', name: 'Title Text', type: 'text' },
    { id: 'email', name: 'Email Input', type: 'input' },
    { id: 'password', name: 'Password Input', type: 'input' },
    { id: 'submit', name: 'Submit Button', type: 'button' },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportModal(true);
    }, 1500);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? Math.min(200, prev + 25) : Math.max(50, prev - 25));
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden font-sans">
      {/* Designer Toolbar */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-indigo-500">grid_view</span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Visual Studio</span>
           </div>
           <div className="h-4 w-px bg-zinc-800"></div>
           <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {(['iPhone 14', 'Pixel 7', 'iPad'] as DeviceType[]).map(d => (
                 <button 
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${device === d ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-400'}`}
                 >
                    <span className="material-symbols-rounded text-sm">
                      {d === 'iPhone 14' ? 'smartphone' : d === 'Pixel 7' ? 'android' : 'tablet'}
                    </span>
                    {d}
                 </button>
              ))}
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-400'}`}
          >
            <span className="material-symbols-rounded text-lg">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="material-symbols-rounded text-sm animate-spin">refresh</span>
                Exporting...
              </>
            ) : (
              'Export Schema'
            )}
          </button>
        </div>
      </header>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowExportModal(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-emerald-500 text-2xl">check_circle</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Export Complete</h2>
                <p className="text-xs text-zinc-400">Your design has been exported successfully</p>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400">Generated Files</span>
                <span className="text-xs text-emerald-400">3 files</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="material-symbols-rounded text-blue-400 text-sm">code</span>
                  LoginScreen.tsx
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="material-symbols-rounded text-purple-400 text-sm">css</span>
                  LoginScreen.module.css
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="material-symbols-rounded text-yellow-400 text-sm">data_object</span>
                  LoginScreen.types.ts
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                Close
              </button>
              <button onClick={() => setShowExportModal(false)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium">
                Open in Editor
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Component Library */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
           <div className="h-9 px-4 flex items-center border-b border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Artifact Library</span>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-4">
              <div>
                 <h4 className="px-2 mb-2 text-[9px] font-bold text-zinc-600 uppercase tracking-tight">Standard Inputs</h4>
                 <div className="space-y-1">
                    {['Text Field', 'Secure Input', 'Dropdown', 'Switch'].map(item => (
                       <div key={item} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-grab group transition-colors">
                          <div className="size-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                             <span className="material-symbols-rounded text-lg">
                                {item === 'Text Field' ? 'text_fields' : item === 'Secure Input' ? 'lock' : item === 'Dropdown' ? 'list' : 'toggle_on'}
                             </span>
                          </div>
                          <span className="text-xs text-zinc-300 font-medium">{item}</span>
                          <span className="ml-auto material-symbols-rounded text-zinc-700 text-sm group-hover:text-zinc-500">drag_indicator</span>
                       </div>
                    ))}
                 </div>
              </div>
              <div>
                 <h4 className="px-2 mb-2 text-[9px] font-bold text-zinc-600 uppercase tracking-tight">Containers</h4>
                 <div className="space-y-1">
                    {['Layout Card', 'Scroll Surface', 'Grid System'].map(item => (
                       <div key={item} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-grab group transition-colors">
                          <div className="size-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                             <span className="material-symbols-rounded text-lg">
                                {item === 'Layout Card' ? 'web_asset' : item === 'Scroll Surface' ? 'vertical_align_center' : 'grid_on'}
                             </span>
                          </div>
                          <span className="text-xs text-zinc-300 font-medium">{item}</span>
                          <span className="ml-auto material-symbols-rounded text-zinc-700 text-sm group-hover:text-zinc-500">drag_indicator</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </aside>

        {/* Center: Canvas Area */}
        <main className="flex-1 bg-zinc-950 relative overflow-auto flex items-center justify-center p-12 dot-pattern">
           <style>{`
             .dot-pattern {
               background-image: radial-gradient(#27272a 1px, transparent 1px);
               background-size: 24px 24px;
             }
           `}</style>
           
           {/* Canvas Controls */}
           <div className="absolute top-6 left-6 flex flex-col gap-2 bg-zinc-900/80 backdrop-blur p-1 rounded-lg border border-zinc-800 shadow-xl">
              <button
                onClick={() => setActiveTool('select')}
                className={`size-8 flex items-center justify-center rounded transition-all ${activeTool === 'select' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                title="Select Tool (V)"
              >
                 <span className="material-symbols-rounded text-lg">near_me</span>
              </button>
              <button
                onClick={() => setActiveTool('pan')}
                className={`size-8 flex items-center justify-center rounded transition-all ${activeTool === 'pan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                title="Pan Tool (H)"
              >
                 <span className="material-symbols-rounded text-lg">pan_tool</span>
              </button>
              <div className="h-px bg-zinc-700 my-1"></div>
              <button
                onClick={() => handleZoom('in')}
                className="size-8 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title="Zoom In"
              >
                 <span className="material-symbols-rounded text-lg">zoom_in</span>
              </button>
              <button
                onClick={() => handleZoom('out')}
                className="size-8 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title="Zoom Out"
              >
                 <span className="material-symbols-rounded text-lg">zoom_out</span>
              </button>
              <div className="text-[9px] text-center text-zinc-400 font-mono">{zoom}%</div>
           </div>

           {/* Device Frame */}
           <div className={`relative bg-black rounded-[40px] border-[8px] border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all overflow-hidden ${
              device === 'iPhone 14' ? 'w-[320px] h-[650px]' : 
              device === 'Pixel 7' ? 'w-[340px] h-[680px]' : 'w-[700px] h-[500px]'
           }`}>
              <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
                 {/* Status Bar */}
                 <div className="h-10 flex items-center justify-between px-8 shrink-0">
                    <span className={`text-[10px] font-bold ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>9:41</span>
                    <div className={`flex gap-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                       <span className="material-symbols-rounded text-[14px]">signal_cellular_alt</span>
                       <span className="material-symbols-rounded text-[14px]">wifi</span>
                       <span className="material-symbols-rounded text-[14px]">battery_full</span>
                    </div>
                 </div>

                 {/* Mock UI Content */}
                 <div className="flex-1 flex flex-col px-6 pt-12 gap-6">
                    <div className="size-16 rounded-2xl bg-indigo-600/20 flex items-center justify-center self-center mb-4">
                       <span className="material-symbols-rounded text-indigo-500 text-3xl">deployed_code</span>
                    </div>
                    <div className="text-center">
                       <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Nexus Gateway</h3>
                       <p className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Authentication Service v2.4</p>
                    </div>
                    
                    <div className="relative group cursor-pointer mt-4">
                       <div className="absolute -inset-1 border-2 border-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] pointer-events-none z-10 animate-pulse">
                          <div className="absolute -top-3 left-2 bg-indigo-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                             {selectedElement}
                          </div>
                          <div className="absolute -right-1.5 -bottom-1.5 size-3 bg-indigo-500 rounded-full border-2 border-zinc-950"></div>
                       </div>
                       <div className={`w-full rounded-lg px-4 py-3 text-xs font-medium border ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
                       }`}>
                          developer@enterprise.cloud
                       </div>
                    </div>

                    <div className={`w-full rounded-lg px-4 py-3 text-xs border ${
                       isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-600' : 'bg-white border-zinc-200 text-zinc-300'
                    }`}>
                       ••••••••••••
                    </div>

                    <button className="w-full bg-indigo-600 py-3 rounded-lg text-white text-xs font-bold shadow-lg shadow-indigo-500/20 mt-2">
                       Establish Session
                    </button>
                 </div>
              </div>
           </div>
        </main>

        {/* Right Side: Inspector Panel */}
        <aside className="w-72 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0">
           <div className="h-9 px-4 flex items-center border-b border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Property Inspector</span>
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-indigo-400">
                    <span className="material-symbols-rounded text-lg">token</span>
                    <span className="text-xs font-bold uppercase tracking-tight">Identity: {selectedElement}</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Width</label>
                       <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 font-mono">
                          <span className="flex-1 text-zinc-400">100%</span>
                          <span className="material-symbols-rounded text-[14px]">lock</span>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Height</label>
                       <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-zinc-300 font-mono">
                          <span className="flex-1 text-zinc-400">48px</span>
                          <span className="material-symbols-rounded text-[14px]">edit</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Appearance & Styling</label>
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">Background</span>
                          <div className="flex items-center gap-2">
                             <div className="size-3 rounded-full bg-zinc-800 border border-zinc-700"></div>
                             <span className="text-[10px] font-mono text-zinc-300">#18181B</span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[10px]">
                             <span className="text-zinc-400">Corner Radius</span>
                             <span className="text-zinc-200">{cornerRadius}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="24"
                            value={cornerRadius}
                            onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                            className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2 pt-4 border-t border-zinc-800">
                    <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Interaction Logic</label>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-800/50 group cursor-pointer hover:border-indigo-500/50 transition-colors">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-rounded text-sm text-zinc-500">bolt</span>
                             <span className="text-[10px] text-zinc-300 font-medium tracking-tight">OnValueChanged</span>
                          </div>
                          <span className="material-symbols-rounded text-[14px] text-zinc-600">navigate_next</span>
                       </div>
                       <div className="flex items-center justify-between p-2 bg-zinc-800/50 rounded border border-zinc-800/50 group cursor-pointer hover:border-indigo-500/50 transition-colors">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-rounded text-sm text-zinc-500">security</span>
                             <span className="text-[10px] text-zinc-300 font-medium tracking-tight">ValidateInput</span>
                          </div>
                          <span className="material-symbols-rounded text-[14px] text-zinc-600">navigate_next</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex gap-2">
              <button className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-zinc-200 uppercase tracking-widest transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-rounded text-sm">account_tree</span>
                Inspect Tree
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex-1 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${previewMode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
              >
                <span className="material-symbols-rounded text-sm">{previewMode ? 'stop' : 'play_arrow'}</span>
                {previewMode ? 'Stop' : 'Preview'}
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default DesignStudio;