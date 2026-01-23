import React from 'react';

const DesignStudio: React.FC = () => {
  return (
    <div className="flex-1 flex bg-slate-950 h-full overflow-hidden">
      {/* Toolbar */}
      <div className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><span className="material-symbols-rounded">near_me</span></button>
        <button className="p-2 text-indigo-400 bg-slate-800 rounded"><span className="material-symbols-rounded">rectangle</span></button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><span className="material-symbols-rounded">title</span></button>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><span className="material-symbols-rounded">palette</span></button>
        <div className="h-px w-8 bg-slate-700 my-2"></div>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded"><span className="material-symbols-rounded">hand_gesture</span></button>
      </div>

      {/* Layers Panel */}
      <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 text-xs font-bold text-slate-400">LAYERS</div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center gap-2 p-1.5 bg-indigo-500/10 text-indigo-300 rounded text-sm mb-1">
            <span className="material-symbols-rounded text-[16px]">smartphone</span>
            iPhone 14 Pro
          </div>
          <div className="pl-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-white text-sm cursor-pointer">
              <span className="material-symbols-rounded text-[16px]">menu</span>
              Navbar
            </div>
            <div className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-white text-sm cursor-pointer">
              <span className="material-symbols-rounded text-[16px]">image</span>
              Hero Image
            </div>
            <div className="flex items-center gap-2 p-1.5 text-slate-400 hover:text-white text-sm cursor-pointer">
              <span className="material-symbols-rounded text-[16px]">smart_button</span>
              CTA Button
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Mock Interface on Canvas */}
        <div className="w-[375px] h-[700px] bg-white rounded-[40px] border-8 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 w-full h-8 bg-black/5 z-20 flex justify-center">
            <div className="w-24 h-6 bg-black rounded-b-xl"></div>
          </div>
          
          <div className="flex-1 bg-slate-50 p-6 flex flex-col justify-center items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-xl"></div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">Welcome to Nexus</h1>
            <p className="text-slate-500 text-center text-sm">Design, code, and deploy in one seamless environment.</p>
            <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg mt-4">Get Started</button>
          </div>
          
          <div className="h-16 border-t border-slate-200 flex justify-around items-center px-4">
            <div className="w-6 h-6 rounded-full bg-slate-300"></div>
            <div className="w-6 h-6 rounded-full bg-indigo-500"></div>
            <div className="w-6 h-6 rounded-full bg-slate-300"></div>
          </div>
        </div>

        {/* Selection Box */}
        <div className="absolute border-2 border-indigo-500 w-[385px] h-[710px] rounded-[44px] pointer-events-none">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded">375 x 812</div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">DESIGN</span>
          <span className="text-xs font-bold text-indigo-400 cursor-pointer">PROTOTYPE</span>
        </div>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Section: Layout */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-3">Layout</h4>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded">
                <span className="text-slate-500 text-xs">X</span>
                <span className="text-white text-sm">420</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded">
                <span className="text-slate-500 text-xs">Y</span>
                <span className="text-white text-sm">128</span>
              </div>
            </div>
          </div>

          {/* Section: Fill */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 mb-3">Fill</h4>
            <div className="flex items-center justify-between bg-slate-800 p-2 rounded">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white border border-slate-600"></div>
                <span className="text-white text-sm">#FFFFFF</span>
              </div>
              <span className="text-slate-400 text-xs">100%</span>
            </div>
          </div>

          {/* Section: Export */}
          <div className="pt-4 border-t border-slate-800">
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
              <span className="material-symbols-rounded text-sm">code</span>
              Export to React
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;