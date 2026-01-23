import React, { useState } from 'react';

const DesktopWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('MainController.ts');
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal');

  const codeSnippet = `import { Controller, Platform } from '@devstudio/core';
 
// Initialize multi-platform handler
export class MainController {
  private targetPlatform: Platform;
 
  constructor() {
    this.targetPlatform = Platform.current();
  }
}`;

  return (
    <div className="flex flex-col h-full bg-[#090a11] text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between border-b border-[#282b39] bg-[#0d0e15] px-4 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 flex items-center justify-center bg-indigo-600 rounded text-white">
              <span className="material-symbols-rounded text-[18px]">developer_mode_tv</span>
            </div>
            <h1 className="text-sm font-bold tracking-tight">DevStudio <span className="text-indigo-500">Master</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-[#9da1b9]">
            <button className="hover:text-white text-[12px] font-medium transition-colors">Project</button>
            <button className="hover:text-white text-[12px] font-medium transition-colors">Build</button>
            <button className="hover:text-white text-[12px] font-medium transition-colors">Debug</button>
            <button className="hover:text-white text-[12px] font-medium transition-colors">Cloud</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#161825] border border-[#282b39] rounded-md px-3 py-1 gap-2 w-64">
            <span className="material-symbols-rounded text-[16px] text-[#5f637a]">search</span>
            <input 
              className="bg-transparent border-none focus:outline-none text-[12px] w-full p-0 placeholder-[#5f637a] text-white" 
              placeholder="Global Search (⌘P)" 
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/5 rounded-md text-[#9da1b9] transition-colors"><span className="material-symbols-rounded text-[18px]">account_circle</span></button>
            <button className="p-1.5 hover:bg-white/5 rounded-md text-[#9da1b9] transition-colors relative">
              <span className="material-symbols-rounded text-[18px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button className="ml-2 px-3 py-1 bg-indigo-600 text-white text-[12px] font-bold rounded-md hover:bg-indigo-500 flex items-center gap-2 transition-colors">
              <span>Deploy All</span>
              <span className="material-symbols-rounded text-[14px]">rocket_launch</span>
            </button>
          </div>
        </div>
      </header>

      {/* Build Targets Bar */}
      <div className="flex-none bg-[#090a11] border-b border-[#282b39] px-4 py-1.5 flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 border-r border-[#282b39] pr-4">
          <span className="text-[10px] text-[#5f637a] uppercase font-bold tracking-widest">Build Targets</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#161825] border border-green-500/30 px-2.5 py-1 rounded">
            <span className="material-symbols-rounded text-green-500 text-[18px]">android</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-none text-white">Android API 33</span>
              <span className="text-[9px] text-green-400 font-medium">Synced & Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-[#161825] border border-indigo-500/30 px-2.5 py-1 rounded relative overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 w-[65%] shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
            <span className="material-symbols-rounded text-white text-[18px]">phone_iphone</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-none text-white">iPhone 15 Pro</span>
              <span className="text-[9px] text-indigo-400 font-medium">Compiling (65%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-[#161825] border border-[#282b39] px-2.5 py-1 rounded">
            <span className="material-symbols-rounded text-[#9da1b9] text-[18px]">laptop_mac</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold leading-none text-white">Desktop (Mac/Win)</span>
              <span className="text-[9px] text-[#5f637a] font-medium">Pending Release</span>
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right border-l border-[#282b39] pl-4">
            <div className="text-[9px] text-[#5f637a] leading-none mb-1 uppercase">Cloud Sync</div>
            <div className="text-[10px] text-white font-mono leading-none">Active: 4m 12s</div>
          </div>
          <button className="p-1 text-[#5f637a] hover:text-white"><span className="material-symbols-rounded text-[18px]">refresh</span></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <aside className="w-12 flex-none flex flex-col items-center py-4 bg-[#0d0e15] border-r border-[#282b39] gap-6">
          <div className="flex flex-col items-center gap-4">
            <button className="p-2 text-white bg-indigo-500/10 rounded-md text-indigo-500 border-r-2 border-indigo-500">
              <span className="material-symbols-rounded text-[24px]">folder</span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors relative">
              <span className="material-symbols-rounded text-[24px]">account_tree</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full border border-[#0d0e15]"></span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[24px]">bug_report</span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors relative">
              <span className="material-symbols-rounded text-[24px]">rebase</span>
              <span className="absolute top-1 right-1 text-[8px] font-bold bg-indigo-500 text-white px-1 rounded-full">3</span>
            </button>
          </div>
          <div className="mt-auto flex flex-col items-center gap-4">
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[24px]">extension</span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[24px]">settings</span>
            </button>
          </div>
        </aside>

        {/* Explorer */}
        <nav className="w-60 flex-none bg-[#111218] border-r border-[#282b39] flex flex-col">
          <div className="h-10 flex items-center justify-between px-4 border-b border-[#282b39]">
            <span className="text-[11px] font-bold text-[#9da1b9] uppercase tracking-wider">Explorer</span>
            <span className="material-symbols-rounded text-[16px] text-[#5f637a] cursor-pointer hover:text-white">create_new_folder</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px]">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 px-2 py-1 text-white bg-white/5 rounded-sm cursor-pointer">
                <span className="material-symbols-rounded text-[16px] text-yellow-400">folder_open</span>
                <span>src</span>
              </div>
              <div className="pl-4 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 px-2 py-1 text-[#9da1b9] hover:text-white cursor-pointer hover:bg-[#161825] rounded-sm">
                  <span className="material-symbols-rounded text-[16px]">folder</span>
                  <span>api</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-[#9da1b9] hover:text-white cursor-pointer hover:bg-[#161825] rounded-sm">
                  <span className="material-symbols-rounded text-[16px]">folder</span>
                  <span>components</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-white bg-indigo-500/20 rounded-sm cursor-pointer border-l-2 border-indigo-500">
                  <span className="material-symbols-rounded text-[16px] text-blue-400">code</span>
                  <span>MainController.ts</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-[#9da1b9] hover:text-white cursor-pointer hover:bg-[#161825] rounded-sm">
                  <span className="material-symbols-rounded text-[16px] text-red-400">description</span>
                  <span>styles.css</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-[#9da1b9] hover:text-white cursor-pointer hover:bg-[#161825] rounded-sm mt-1">
                <span className="material-symbols-rounded text-[16px]">folder</span>
                <span>tests</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-[#9da1b9] hover:text-white cursor-pointer hover:bg-[#161825] rounded-sm">
                <span className="material-symbols-rounded text-[16px] text-orange-400">settings</span>
                <span>config.json</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col bg-[#090a11] min-w-0">
          <div className="h-10 flex-none flex items-center bg-[#0d0e15] border-b border-[#282b39] overflow-x-auto">
            <div className={`h-full flex items-center px-4 border-r border-[#282b39] border-t-2 text-[12px] font-medium gap-2 min-w-fit cursor-pointer ${activeTab === 'MainController.ts' ? 'bg-[#111218] border-t-indigo-500 text-white' : 'border-t-transparent text-[#9da1b9] hover:bg-[#161825]'}`} onClick={() => setActiveTab('MainController.ts')}>
              <span className="material-symbols-rounded text-[14px] text-blue-400">code</span>
              MainController.ts
              <span className="material-symbols-rounded text-[14px] hover:bg-white/10 rounded p-0.5 ml-1">close</span>
            </div>
            <div className={`h-full flex items-center px-4 border-r border-[#282b39] border-t-2 text-[12px] font-medium gap-2 min-w-fit cursor-pointer ${activeTab === 'styles.css' ? 'bg-[#111218] border-t-indigo-500 text-white' : 'border-t-transparent text-[#9da1b9] hover:bg-[#161825]'}`} onClick={() => setActiveTab('styles.css')}>
              <span className="material-symbols-rounded text-[14px] text-red-400">description</span>
              styles.css
            </div>
            <div className="h-full flex items-center px-4 bg-indigo-500/5 text-indigo-400 border-r border-[#282b39] text-[12px] font-medium gap-2 cursor-pointer min-w-fit">
              <span className="material-symbols-rounded text-[14px]">error_outline</span>
              Issue #402: Build Failure
              <span className="material-symbols-rounded text-[14px] hover:bg-indigo-500/10 rounded p-0.5 ml-1">close</span>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#282b39]">
              <div className="flex-1 overflow-auto p-4 font-mono text-[13px] relative bg-[#111218]">
                <div className="absolute left-0 top-4 bottom-0 w-10 flex flex-col items-end pr-2 text-[#4b5064] select-none">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className={i === 5 ? 'text-indigo-500 font-bold' : ''}>{i + 1}</div>
                  ))}
                </div>
                <pre className="pl-8 text-[#d4d4d4] leading-6" dangerouslySetInnerHTML={{ 
                  __html: codeSnippet
                    .replace(/import|from|export|class|private|constructor/g, '<span class="text-[#569cd6]">$&</span>')
                    .replace(/Controller|Platform|MainController/g, '<span class="text-[#4ec9b0]">$&</span>')
                    .replace(/'[^']*'/g, '<span class="text-[#ce9178]">$&</span>')
                    .replace(/\/\/.*/g, '<span class="text-white/40">$&</span>')
                    .replace(/this/g, '<span class="text-[#569cd6]">this</span>')
                }} />
              </div>
            </div>

            {/* Right Side: Issue Details */}
            <div className="w-1/3 flex-none bg-[#161825] flex flex-col border-l border-[#282b39] overflow-hidden">
              <div className="p-4 border-b border-[#282b39] bg-[#1c1e2d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Active Issue Details</span>
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] rounded border border-red-500/20">Critical</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">#402: Native module linking failed for Linux</h3>
                <div className="flex items-center gap-2 text-[10px] text-[#9da1b9]">
                  <span className="flex items-center gap-1"><span className="material-symbols-rounded text-[14px]">person</span> dev_john</span>
                  <span>•</span>
                  <span>opened 2h ago</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="bg-black/20 p-3 rounded-lg border border-[#282b39]">
                  <p className="text-[12px] text-[#9da1b9] leading-relaxed">
                    The Linux build target is failing due to a missing dependency <code className="bg-[#161825] px-1 rounded text-white">libgtk-3-dev</code> in the build container environment. This is blocking the CI/CD pipeline.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-[#5f637a] uppercase tracking-wider">Related Pull Requests</h4>
                  <div className="p-2 bg-[#161825] border border-[#282b39] rounded flex items-center gap-3 hover:border-indigo-500 cursor-pointer transition-colors">
                    <span className="material-symbols-rounded text-green-400 text-[18px]">merge</span>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-white font-medium leading-none">PR #405: Fix Linux Dockerfile</span>
                      <span className="text-[10px] text-[#5f637a] mt-1">Review required • 2 checks passed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Panel */}
          <div className="h-48 flex-none border-t border-[#282b39] flex flex-col bg-[#090a11]">
            <div className="h-9 flex-none flex items-center bg-[#1c1e2d] px-2 border-b border-[#282b39]">
              <div className="flex items-center h-full">
                {['Terminal', 'Git Status', 'Build Logs'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTerminalTab(tab)}
                    className={`h-full px-4 flex items-center gap-2 border-b-2 text-[11px] font-bold transition-colors ${activeTerminalTab === tab ? 'border-indigo-500 text-white bg-[#111218]' : 'border-transparent text-[#9da1b9] hover:text-white'}`}
                  >
                    <span className={`material-symbols-rounded text-[16px] ${tab === 'Terminal' ? 'text-white' : tab === 'Git Status' ? 'text-[#9da1b9]' : 'text-red-400'}`}>
                      {tab === 'Terminal' ? 'terminal' : tab === 'Git Status' ? 'history' : 'error'}
                    </span>
                    {tab}
                    {tab === 'Git Status' && <span className="bg-indigo-500/20 text-indigo-400 text-[9px] px-1.5 rounded-full">12</span>}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2 pr-2">
                <button className="p-1 hover:bg-white/10 rounded text-[#5f637a]"><span className="material-symbols-rounded text-[18px]">add</span></button>
                <button className="p-1 hover:bg-white/10 rounded text-[#5f637a]"><span className="material-symbols-rounded text-[18px]">keyboard_arrow_down</span></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] text-[#d4d4d4]">
              <div className="mb-1 text-green-400">Successfully connected to build worker: node-linux-01</div>
              <div className="mb-1"><span className="text-blue-400">➜</span> <span className="text-yellow-400">~/devstudio/master</span> <span className="text-white/40">(main)</span> npm run build:linux</div>
              <div className="mb-1">...</div>
              <div className="mb-1 text-red-400">error: libgtk-3-dev not found. Try installing via apt.</div>
              <div className="mb-1">Terminating build processes...</div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-blue-400">➜</span>
                <span className="w-2 h-4 bg-indigo-500/60 animate-pulse"></span>
              </div>
            </div>
          </div>
        </main>

        {/* AI Sidebar */}
        <aside className="w-72 flex-none bg-[#0d0e15] border-l border-[#282b39] flex flex-col">
          <div className="p-3 border-b border-[#282b39] flex items-center gap-2 bg-[#1c1e2d]">
            <div className="bg-indigo-600 p-1 rounded-sm">
              <span className="material-symbols-rounded text-[18px] text-white">smart_toy</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-white">AI Assistant</span>
              <span className="text-[9px] text-green-500 font-medium">Analyzing Context...</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Code Suggestion</span>
              </div>
              <div className="bg-[#161825] border border-[#282b39] p-3 rounded-lg shadow-sm">
                <p className="text-[11px] text-[#d4d4d4] mb-3 leading-relaxed">
                  You're using <code className="text-indigo-400">Platform.current()</code> on Line 8. Consider adding a fallback for unsupported targets.
                </p>
                <button className="w-full py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold hover:bg-indigo-500/20 transition-colors">
                  Apply Patch
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Issue Analysis</span>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-lg">
                <p className="text-[11px] text-[#d4d4d4] mb-2 leading-relaxed">
                  I see Issue #402 relates to the Linux build error in your terminal. I've prepared a command to fix the environment.
                </p>
                <div className="bg-black/40 p-2 rounded font-mono text-[10px] text-white border border-white/5 mb-3">
                  sudo apt install -y libgtk-3-dev
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-500">Run in Terminal</button>
                  <button className="px-2 py-1 bg-[#161825] text-[#9da1b9] text-[10px] rounded border border-[#282b39]">Copy</button>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-[#111218] border-t border-[#282b39]">
            <div className="relative">
              <textarea 
                className="w-full bg-[#1c1e2d] border border-[#282b39] rounded-lg p-2.5 pr-8 text-[12px] text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-[#5f637a] resize-none" 
                placeholder="Ask AI anything..." 
                rows={2}
              />
              <button className="absolute right-2 bottom-2 text-indigo-500 hover:text-white transition-colors">
                <span className="material-symbols-rounded text-[20px]">send</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-[#5f637a]">Press ⌘+Enter to send</span>
              <span className="material-symbols-rounded text-[14px] text-[#5f637a]">mic</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="flex-none h-6 bg-indigo-600 text-white flex items-center px-3 justify-between text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px]">source</span>
            <span className="font-bold">main</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px]">sync</span>
            <span>In Sync</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="material-symbols-rounded text-[14px]">close</span>
            <span>0</span>
            <span className="material-symbols-rounded text-[14px]">warning</span>
            <span>2</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80">Spaces: 4</span>
          <span className="opacity-80">UTF-8</span>
          <span className="font-bold">TypeScript React</span>
          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span>DevServer: 8080</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DesktopWorkspace;