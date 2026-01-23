import React, { useState } from 'react';

// Types for Source Control
interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D' | 'U'; // Modified, Added, Deleted, Untracked
  staged: boolean;
}

interface Branch {
  name: string;
  isCurrent: boolean;
  upstream?: string;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  color: string;
  content?: string;
  children?: FileItem[];
}

const CodeEditor: React.FC = () => {
  const [openTabs, setOpenTabs] = useState<string[]>(['main.tsx']);
  const [activeTab, setActiveTab] = useState('main.tsx');
  const [sidebarMode, setSidebarMode] = useState<'EXPLORER' | 'GIT' | 'SEARCH' | 'EXTENSIONS'>('EXPLORER');
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']));

  // Git State
  const [changes, setChanges] = useState<GitChange[]>([
    { file: 'src/components/App.tsx', status: 'M', staged: false },
    { file: 'src/hooks/useAuth.ts', status: 'A', staged: false },
    { file: 'tailwind.config.js', status: 'M', staged: true },
    { file: 'public/manifest.json', status: 'U', staged: false }
  ]);

  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches] = useState<Branch[]>([
    { name: 'main', isCurrent: true, upstream: 'origin/main' },
    { name: 'feature/auth-provider', isCurrent: false },
    { name: 'hotfix/v1.0.2-patch', isCurrent: false },
  ]);

  const fileContents: Record<string, string> = {
    'main.tsx': `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NexusProvider } from './context/NexusContext';
import App from './App';
import './index.css';

// Initialize the root node with performance monitoring
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <NexusProvider config={{ telemetry: true }}>
      <App />
    </NexusProvider>
  </StrictMode>
);`,
    'App.tsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Navbar } from './components/Navbar';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};`,
    'theme.ts': `export const theme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#09090b',
    surface: '#18181b',
    border: '#27272a',
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
    },
  },
  fonts: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};`,
    'package.json': `{
  "name": "nexus-framework",
  "version": "2.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.0.0"
  }
}`,
  };

  const fileTree: FileItem[] = [
    {
      name: 'src', path: 'src', type: 'folder', color: 'text-zinc-400',
      children: [
        {
          name: 'components', path: 'src/components', type: 'folder', color: 'text-zinc-400',
          children: [
            { name: 'App.tsx', path: 'App.tsx', type: 'file', color: 'text-blue-400' },
          ]
        },
        { name: 'main.tsx', path: 'main.tsx', type: 'file', color: 'text-blue-400' },
        { name: 'theme.ts', path: 'theme.ts', type: 'file', color: 'text-yellow-400' },
      ]
    },
    { name: 'public', path: 'public', type: 'folder', color: 'text-zinc-400', children: [] },
    { name: 'package.json', path: 'package.json', type: 'file', color: 'text-green-400' },
  ];

  const openFile = (path: string) => {
    if (!openTabs.includes(path)) {
      setOpenTabs(prev => [...prev, path]);
    }
    setActiveTab(path);
  };

  const closeTab = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTabs = openTabs.filter(t => t !== path);
    setOpenTabs(newTabs);
    if (activeTab === path && newTabs.length > 0) {
      setActiveTab(newTabs[newTabs.length - 1]);
    }
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleStage = (file: string) => {
    setChanges(prev => prev.map(c => c.file === file ? { ...c, staged: !c.staged } : c));
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || changes.filter(c => c.staged).length === 0) return;
    setChanges(prev => prev.filter(c => !c.staged));
    setCommitMessage('');
  };

  const renderFileTree = (items: FileItem[], depth = 0): React.ReactNode => {
    return items.map(item => (
      <div key={item.path}>
        <div
          onClick={() => item.type === 'folder' ? toggleFolder(item.path) : openFile(item.path)}
          className={`flex items-center gap-2 py-1 px-2 rounded text-xs cursor-pointer ${
            activeTab === item.path
              ? 'bg-indigo-500/10 text-indigo-400 border-l border-indigo-500'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <span className="material-symbols-rounded text-sm">
            {item.type === 'folder'
              ? expandedFolders.has(item.path) ? 'folder_open' : 'folder'
              : 'description'}
          </span>
          <span className={item.color}>{item.name}</span>
        </div>
        {item.type === 'folder' && item.children && expandedFolders.has(item.path) && (
          renderFileTree(item.children, depth + 1)
        )}
      </div>
    ));
  };

  const codeSnippet = fileContents[activeTab] || '// File not found';

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 h-full overflow-hidden font-sans">
      {/* IDE Toolbar / Header Area */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-indigo-500 text-lg">deployed_code</span>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Nexus Workspace</span>
           </div>
           <div className="h-4 w-px bg-zinc-800"></div>
           <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950 rounded border border-zinc-800">
              <span className="material-symbols-rounded text-sm text-zinc-500">terminal</span>
              <span className="text-[10px] font-mono text-zinc-300">bash --cluster=dev-01</span>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded text-[10px] font-bold transition-all uppercase tracking-tight">
            <span className="material-symbols-rounded text-sm">play_arrow</span> Run
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/30 rounded text-[10px] font-bold transition-all uppercase tracking-tight">
            <span className="material-symbols-rounded text-sm">bug_report</span> Debug
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (Left Rail) */}
        <aside className="w-12 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 shrink-0 z-40">
           <button 
            onClick={() => setSidebarMode('EXPLORER')}
            className={`p-2 transition-colors relative ${sidebarMode === 'EXPLORER' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
           >
              <span className="material-symbols-rounded">folder_open</span>
              {sidebarMode === 'EXPLORER' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-indigo-500 rounded-r-full"></div>}
           </button>
           <button 
            onClick={() => setSidebarMode('SEARCH')}
            className={`p-2 transition-colors relative ${sidebarMode === 'SEARCH' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
           >
              <span className="material-symbols-rounded">search</span>
              {sidebarMode === 'SEARCH' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-indigo-500 rounded-r-full"></div>}
           </button>
           <button 
            onClick={() => setSidebarMode('GIT')}
            className={`p-2 transition-colors relative ${sidebarMode === 'GIT' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
           >
              <span className="material-symbols-rounded text-2xl">source_environment</span>
              <span className="absolute top-1 right-1 size-2 bg-indigo-500 rounded-full border border-zinc-950"></span>
              {sidebarMode === 'GIT' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-indigo-500 rounded-r-full"></div>}
           </button>
           <button 
            onClick={() => setSidebarMode('EXTENSIONS')}
            className={`p-2 transition-colors relative ${sidebarMode === 'EXTENSIONS' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
           >
              <span className="material-symbols-rounded">extension</span>
              {sidebarMode === 'EXTENSIONS' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-indigo-500 rounded-r-full"></div>}
           </button>
           <div className="mt-auto flex flex-col items-center gap-4">
              <button className="text-zinc-600 hover:text-zinc-400"><span className="material-symbols-rounded">account_circle</span></button>
              <button className="text-zinc-600 hover:text-zinc-400 mb-2"><span className="material-symbols-rounded">settings</span></button>
           </div>
        </aside>

        {/* Primary Sidebar Panel */}
        <section className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
           <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-800/50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{sidebarMode}</span>
              <button className="text-zinc-600 hover:text-zinc-400"><span className="material-symbols-rounded text-sm">more_horiz</span></button>
           </div>
           
           <div className="flex-1 overflow-y-auto py-2">
              {sidebarMode === 'EXPLORER' && (
                 <div className="px-2 space-y-0.5">
                    <div className="flex items-center gap-1.5 py-1 px-2 text-zinc-200 hover:bg-zinc-800 rounded cursor-pointer group">
                       <span className="material-symbols-rounded text-sm">expand_more</span>
                       <span className="text-xs font-bold uppercase tracking-tight text-indigo-400">nexus-framework</span>
                    </div>
                    <div className="pl-2">
                       {renderFileTree(fileTree, 1)}
                    </div>
                 </div>
              )}

              {sidebarMode === 'SEARCH' && (
                 <div className="px-3">
                    <div className="relative mb-4">
                       <span className="absolute left-2 top-2 material-symbols-rounded text-zinc-500 text-sm">search</span>
                       <input
                         type="text"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Search in files..."
                         className="w-full bg-zinc-950 border border-zinc-800 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                       />
                    </div>
                    {searchQuery && (
                       <div className="space-y-2">
                          <div className="text-[10px] text-zinc-500 uppercase">Results for "{searchQuery}"</div>
                          {Object.entries(fileContents)
                            .filter(([_, content]) => content.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(([file]) => (
                              <div
                                key={file}
                                onClick={() => openFile(file)}
                                className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded text-xs cursor-pointer hover:border-zinc-700"
                              >
                                <span className="material-symbols-rounded text-sm text-blue-400">description</span>
                                <span className="text-zinc-300">{file}</span>
                              </div>
                            ))
                          }
                       </div>
                    )}
                 </div>
              )}

              {sidebarMode === 'EXTENSIONS' && (
                 <div className="px-3 space-y-3">
                    <div className="text-[10px] text-zinc-500 uppercase mb-2">Installed</div>
                    {['ESLint', 'Prettier', 'GitLens', 'Tailwind CSS IntelliSense'].map(ext => (
                       <div key={ext} className="flex items-center justify-between p-2 bg-zinc-950 border border-zinc-800 rounded">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-rounded text-sm text-indigo-400">extension</span>
                             <span className="text-xs text-zinc-300">{ext}</span>
                          </div>
                          <span className="text-[9px] text-emerald-400 font-bold">Active</span>
                       </div>
                    ))}
                 </div>
              )}

              {sidebarMode === 'GIT' && (
                 <div className="flex flex-col h-full">
                    <div className="px-3 mb-4">
                       <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                          <span>Branch Context</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Synced
                          </span>
                       </div>
                       <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800 cursor-pointer hover:border-zinc-700">
                          <div className="flex items-center gap-2">
                             <span className="material-symbols-rounded text-sm text-zinc-500">call_split</span>
                             <span className="text-xs font-mono text-zinc-200">{currentBranch}</span>
                          </div>
                          <span className="material-symbols-rounded text-sm text-zinc-600">expand_more</span>
                       </div>
                    </div>

                    <div className="px-3 mb-4">
                       <textarea
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-300 focus:border-indigo-500 outline-none resize-none placeholder-zinc-600"
                        rows={2}
                        placeholder="Commit message..."
                       />
                       <button
                         onClick={handleCommit}
                         disabled={!commitMessage.trim() || changes.filter(c => c.staged).length === 0}
                         className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-bold py-1.5 rounded transition-all uppercase tracking-wider"
                       >
                         Commit ({changes.filter(c => c.staged).length} staged)
                       </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                       {changes.filter(c => c.staged).length > 0 && (
                         <>
                           <div className="px-3 py-1 bg-zinc-800/30 text-[9px] font-bold text-zinc-500 uppercase flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                 <span className="material-symbols-rounded text-sm">expand_more</span> Staged Changes
                              </div>
                              <span className="bg-emerald-500/20 text-emerald-400 px-1.5 rounded">{changes.filter(c => c.staged).length}</span>
                           </div>
                           {changes.filter(c => c.staged).map((c, i) => (
                              <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800 cursor-pointer group">
                                 <div className="flex items-center gap-2 truncate">
                                    <span className="material-symbols-rounded text-sm text-zinc-500">description</span>
                                    <span className="text-[11px] text-zinc-300 truncate">{c.file}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase ${c.status === 'A' ? 'text-emerald-500' : c.status === 'D' ? 'text-red-500' : 'text-amber-500'}`}>{c.status}</span>
                                    <button onClick={() => toggleStage(c.file)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400">
                                       <span className="material-symbols-rounded text-sm">remove</span>
                                    </button>
                                 </div>
                              </div>
                           ))}
                         </>
                       )}

                       <div className="px-3 py-1 bg-zinc-800/30 text-[9px] font-bold text-zinc-500 uppercase flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                             <span className="material-symbols-rounded text-sm">expand_more</span> Changes
                          </div>
                          <span className="bg-zinc-700 text-zinc-300 px-1.5 rounded">{changes.filter(c => !c.staged).length}</span>
                       </div>
                       {changes.filter(c => !c.staged).map((c, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800 cursor-pointer group">
                             <div className="flex items-center gap-2 truncate">
                                <span className="material-symbols-rounded text-sm text-zinc-500">description</span>
                                <span className="text-[11px] text-zinc-300 truncate">{c.file}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase ${c.status === 'A' ? 'text-emerald-500' : c.status === 'D' ? 'text-red-500' : c.status === 'U' ? 'text-blue-500' : 'text-amber-500'}`}>{c.status}</span>
                                <button onClick={() => toggleStage(c.file)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-emerald-400">
                                   <span className="material-symbols-rounded text-sm">add</span>
                                </button>
                             </div>
                          </div>
                       ))}
                       {changes.filter(c => !c.staged).length === 0 && (
                          <div className="px-3 py-4 text-center text-[10px] text-zinc-600 italic">No pending changes</div>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </section>

        {/* Main Editor Surface */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 relative">
           {/* Editor Tabs */}
           <div className="flex h-9 bg-zinc-900 border-b border-zinc-800 overflow-x-auto no-scrollbar">
              {openTabs.map(tabName => (
                 <div
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`flex items-center px-4 gap-2 border-r border-zinc-800 cursor-pointer transition-all shrink-0 group ${activeTab === tabName ? 'bg-zinc-950 border-t-2 border-t-indigo-500 text-white' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'}`}
                 >
                    <span className={`material-symbols-rounded text-sm ${tabName.endsWith('.tsx') ? 'text-blue-400' : tabName.endsWith('.ts') ? 'text-yellow-400' : 'text-green-400'}`}>description</span>
                    <span className="text-[11px] font-mono tracking-tight">{tabName}</span>
                    {openTabs.length > 1 && (
                      <button
                        onClick={(e) => closeTab(tabName, e)}
                        className="ml-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <span className="material-symbols-rounded text-xs">close</span>
                      </button>
                    )}
                 </div>
              ))}
              {openTabs.length === 0 && (
                <div className="flex items-center px-4 text-zinc-600 text-xs italic">No files open</div>
              )}
           </div>

           {/* Code Content */}
           <div className="flex-1 flex overflow-hidden">
              <div className="w-10 bg-zinc-950 border-r border-zinc-800/50 flex flex-col text-[11px] font-mono text-zinc-700 text-right pr-3 py-4 select-none shrink-0">
                 {Array.from({length: 30}).map((_, i) => (
                    <div key={i} className="leading-6 hover:text-zinc-500 cursor-pointer">{i+1}</div>
                 ))}
              </div>
              <div className="flex-1 p-4 font-mono text-sm overflow-auto text-zinc-300 leading-6 relative">
                 <pre>
                    {codeSnippet.split('\n').map((line, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ 
                        __html: line
                            .replace(/import|from|const|export|default|return/g, '<span class="text-indigo-400">$&</span>')
                            .replace(/createRoot|render|StrictMode|NexusProvider/g, '<span class="text-amber-400">$&</span>')
                            .replace(/'[^']*'/g, '<span class="text-emerald-400">$&</span>')
                            .replace(/\/\/.*/g, '<span class="text-zinc-600 italic">$&</span>')
                        }} />
                    ))}
                 </pre>

                 {/* Terminal Toggle Overlay */}
                 <div className="absolute bottom-4 left-4 right-4 h-48 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                    <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-6">
                       <button className="text-[10px] font-bold text-white border-b-2 border-indigo-500 h-full">TERMINAL</button>
                       <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">Debug Console</button>
                       <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">Output</button>
                       <div className="ml-auto flex items-center gap-3">
                          <button className="text-zinc-500 hover:text-white"><span className="material-symbols-rounded text-sm">add</span></button>
                          <button className="text-zinc-500 hover:text-white"><span className="material-symbols-rounded text-sm">close</span></button>
                       </div>
                    </div>
                    <div className="flex-1 p-3 font-mono text-xs text-emerald-500/80 overflow-y-auto">
                       <div className="mb-1"><span className="text-zinc-500">➜</span> <span className="text-indigo-400">nexus-workspace</span> git:(<span className="text-amber-500">main</span>) <span className="text-zinc-100">npm run dev</span></div>
                       <div className="text-zinc-400 font-bold mt-2">VITE v5.0.0  ready in 124ms</div>
                       <div className="mt-1">➜  Local:   <span className="underline cursor-pointer">http://localhost:5173/</span></div>
                       <div className="mt-1">➜  Network: use --host to expose</div>
                       <div className="mt-2 text-zinc-500 italic">Watching for changes in src/main.tsx...</div>
                       <div className="mt-2 text-zinc-300 animate-pulse">_</div>
                    </div>
                 </div>
              </div>
           </div>
        </main>

        {/* AI Assistant Sidebar Panel */}
        {showAiPanel && (
           <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col shrink-0 z-30 overflow-hidden">
              <div className="h-9 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-indigo-500 text-lg">smart_toy</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">AI Agent: Nexus-1</span>
                 </div>
                 <button onClick={() => setShowAiPanel(false)} className="text-zinc-600 hover:text-zinc-400"><span className="material-symbols-rounded text-sm">close</span></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                 <div className="flex gap-3">
                    <div className="size-8 rounded bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                       <span className="material-symbols-rounded text-indigo-400 text-sm">smart_toy</span>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg rounded-tl-none">
                       <p className="text-xs text-zinc-300 leading-relaxed">
                          Infrastructure analysis complete. Cluster <span className="text-indigo-400 font-mono">dev-01</span> is healthy. Ready to assist with refactoring or performance optimization.
                       </p>
                    </div>
                 </div>

                 <div className="flex gap-3 flex-row-reverse">
                    <div className="size-8 rounded bg-zinc-800 flex items-center justify-center shrink-0">
                       <span className="material-symbols-rounded text-zinc-500 text-sm">person</span>
                    </div>
                    <div className="bg-indigo-600 p-3 rounded-lg rounded-tr-none">
                       <p className="text-xs text-white leading-relaxed">
                          Explain the telemetry configuration in <code>NexusProvider</code>.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-4 border-t border-zinc-800 bg-zinc-950">
                 <div className="relative">
                    <textarea 
                       className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2.5 pl-3 pr-10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all resize-none h-20"
                       placeholder="Ask Nexus AI..."
                    />
                    <button className="absolute right-2 bottom-3 text-indigo-500 hover:text-indigo-400">
                       <span className="material-symbols-rounded">send</span>
                    </button>
                 </div>
                 <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] font-bold text-zinc-600 uppercase">Context: 24 files indexed</span>
                    <button className="text-[9px] font-bold text-indigo-500 hover:underline uppercase tracking-tight">Clear Thread</button>
                 </div>
              </div>
           </aside>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;