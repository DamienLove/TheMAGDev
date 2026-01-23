import React, { useState } from 'react';

// Types for Git
interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D'; // Modified, Added, Deleted
  staged: boolean;
}

interface Branch {
  name: string;
  isCurrent: boolean;
  lastCommit?: string;
}

type VCProvider = 'GIT' | 'LOCAL_HISTORY';

const CodeEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('App.tsx');
  const [sidebarMode, setSidebarMode] = useState<'EXPLORER' | 'GIT'>('GIT'); // Default to GIT to show changes
  
  // VC State
  const [vcProvider, setVcProvider] = useState<VCProvider>('GIT');

  // Git State
  const [repoInitialized, setRepoInitialized] = useState(true);
  const [changes, setChanges] = useState<GitChange[]>([
    { file: 'App.tsx', status: 'M', staged: false },
    { file: 'utils/helpers.ts', status: 'A', staged: false },
    { file: 'styles.css', status: 'M', staged: true },
    { file: 'components/Button.tsx', status: 'D', staged: false }
  ]);
  const [commitMessage, setCommitMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Branching State
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'main', isCurrent: true, lastCommit: 'Initial commit' },
    { name: 'feature/auth-flow', isCurrent: false, lastCommit: 'Add login screen' },
    { name: 'fix/css-grid', isCurrent: false, lastCommit: 'Fix alignment' },
  ]);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  
  const files = [
    { name: 'App.tsx', type: 'typescript', color: 'text-blue-400' },
    { name: 'styles.css', type: 'css', color: 'text-cyan-400' },
    { name: 'package.json', type: 'json', color: 'text-yellow-400' },
    { name: 'README.md', type: 'markdown', color: 'text-slate-400' },
  ];

  const codeSnippet = `import React from 'react';
import { ThemeProvider } from './theme';

export const App = () => {
  // Initialize core services
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Services.init().then(() => setReady(true));
  }, []);

  if (!ready) return <LoadingSpinner />;

  return (
    <ThemeProvider>
      <Layout>
        <Router />
      </Layout>
    </ThemeProvider>
  );
};`;

  // --- Git Actions ---

  const handleInitRepo = () => setRepoInitialized(true);

  const toggleStage = (file: string) => {
    setChanges(prev => prev.map(c => c.file === file ? { ...c, staged: !c.staged } : c));
  }

  const handleCommit = () => {
    if (!commitMessage) return;
    setChanges(prev => prev.filter(c => !c.staged));
    setCommitMessage('');
  };

  const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleCreateBranch = () => {
    if (!newBranchName) return;
    setBranches(prev => [
      ...prev.map(b => ({ ...b, isCurrent: false })),
      { name: newBranchName, isCurrent: true, lastCommit: 'Branched from ' + prev.find(b=>b.isCurrent)?.name }
    ]);
    setNewBranchName('');
    setShowBranchModal(false);
  };

  const handleSwitchBranch = (branchName: string) => {
    setBranches(prev => prev.map(b => ({ ...b, isCurrent: b.name === branchName })));
  };

  const handleMergeBranch = (branchName: string) => {
     alert(`Merging ${branchName} into ${branches.find(b => b.isCurrent)?.name}...`);
     // Mock merge logic
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'M': return 'text-amber-400';
          case 'A': return 'text-green-400';
          case 'D': return 'text-red-400';
          default: return 'text-zinc-400';
      }
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 h-full overflow-hidden">
      {/* Editor Top Bar (Tabs) */}
      <div className="h-9 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-2 shrink-0">
        <div className="flex h-full items-end gap-1">
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveTab(file.name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t border-t border-x border-transparent transition-colors flex items-center gap-2 ${
                activeTab === file.name 
                  ? 'bg-zinc-900 text-zinc-100 border-zinc-800 border-b-zinc-900' 
                  : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
              }`}
            >
              <span className={`material-symbols-rounded text-[14px] ${file.color}`}>description</span>
              {file.name}
              {activeTab === file.name && <span className="material-symbols-rounded text-[12px] ml-1.5 hover:text-red-400 rounded-sm">close</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-zinc-800 rounded text-green-400" title="Run Project">
            <span className="material-symbols-rounded text-[18px]">play_arrow</span>
          </button>
          <button className="p-1 hover:bg-zinc-800 rounded text-zinc-400" title="Split Editor">
            <span className="material-symbols-rounded text-[18px]">splitscreen</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (Mini Sidebar) */}
        <div className="w-12 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-3 gap-3 z-10 shrink-0">
             <button 
                onClick={() => setSidebarMode('EXPLORER')} 
                className={`p-2 rounded-lg transition-colors ${sidebarMode === 'EXPLORER' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Explorer"
             >
                 <span className="material-symbols-rounded">folder_open</span>
             </button>
             <button 
                onClick={() => setSidebarMode('GIT')} 
                className={`p-2 rounded-lg transition-colors relative ${sidebarMode === 'GIT' ? 'text-white bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Source Control"
             >
                 <span className="material-symbols-rounded">source_environment</span>
                 {repoInitialized && changes.length > 0 && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-zinc-950"></span>
                 )}
             </button>
        </div>

        {/* Sidebar Panel Content */}
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0">
          {sidebarMode === 'EXPLORER' ? (
              <>
                <div className="h-9 px-4 flex items-center text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                    Explorer
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="px-2">
                    <div className="flex items-center gap-1 py-1 text-zinc-300 text-sm font-medium">
                        <span className="material-symbols-rounded text-[16px]">expand_more</span>
                        <span className="text-blue-400 text-xs font-bold uppercase mr-1">NEXUS-WEB</span>
                    </div>
                    <div className="pl-2 flex flex-col">
                        <div className="flex items-center gap-2 py-1 px-2 text-indigo-400 bg-zinc-800/50 rounded text-sm cursor-pointer">
                        <span className="material-symbols-rounded text-[16px]">code</span>
                        App.tsx
                        </div>
                        <div className="flex items-center gap-2 py-1 px-2 text-zinc-400 hover:text-zinc-200 text-sm cursor-pointer">
                        <span className="material-symbols-rounded text-[16px]">css</span>
                        styles.css
                        </div>
                        <div className="flex items-center gap-2 py-1 px-2 text-zinc-400 hover:text-zinc-200 text-sm cursor-pointer">
                        <span className="material-symbols-rounded text-[16px]">folder</span>
                        components
                        </div>
                        <div className="flex items-center gap-2 py-1 px-2 text-zinc-400 hover:text-zinc-200 text-sm cursor-pointer">
                        <span className="material-symbols-rounded text-[16px]">folder</span>
                        utils
                        </div>
                    </div>
                    </div>
                </div>
              </>
          ) : (
              <>
                 {/* Source Control Header */}
                 <div className="p-3 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-zinc-500 uppercase">Source Control</span>
                        <div className="flex gap-1">
                             <button className="text-zinc-400 hover:text-white" title="View History"><span className="material-symbols-rounded text-[16px]">history</span></button>
                             <button className="text-zinc-400 hover:text-white" title="More Actions"><span className="material-symbols-rounded text-[16px]">more_horiz</span></button>
                        </div>
                    </div>
                    
                    {/* VC Provider Selector */}
                    <div className="relative">
                        <select 
                            value={vcProvider}
                            onChange={(e) => setVcProvider(e.target.value as VCProvider)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded text-xs text-zinc-300 py-1.5 px-2 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                        >
                            <option value="GIT">Git (GitHub)</option>
                            <option value="LOCAL_HISTORY">Local History</option>
                        </select>
                        <span className="absolute right-2 top-1.5 material-symbols-rounded text-[16px] text-zinc-500 pointer-events-none">expand_more</span>
                    </div>
                </div>
                
                {vcProvider === 'GIT' ? (
                    !repoInitialized ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                            <span className="material-symbols-rounded text-zinc-600 text-4xl mb-2">source_notes</span>
                            <p className="text-zinc-400 text-xs mb-4">No repository found.</p>
                            <button 
                                onClick={handleInitRepo}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded transition-colors"
                            >
                                Initialize Repository
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                             {/* Branch Control */}
                             <div className="px-3 py-2 bg-zinc-800/30 border-b border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div 
                                        className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer group"
                                        onClick={() => setShowBranchModal(!showBranchModal)}
                                    >
                                        <span className="material-symbols-rounded text-[14px]">call_split</span>
                                        <span className="font-medium">{branches.find(b => b.isCurrent)?.name}</span>
                                        <span className="material-symbols-rounded text-[14px] text-zinc-500 group-hover:text-zinc-300">expand_more</span>
                                    </div>
                                    <button 
                                        onClick={handleSync} 
                                        className={`text-zinc-400 hover:text-white ${isSyncing ? 'animate-spin' : ''}`} 
                                        title="Sync Changes"
                                    >
                                        <span className="material-symbols-rounded text-[16px]">sync</span>
                                    </button>
                                </div>
                                
                                {showBranchModal && (
                                    <div className="mt-2 bg-zinc-950 border border-zinc-700 rounded-lg shadow-xl overflow-hidden p-2 absolute left-14 w-60 z-50">
                                        <input 
                                            type="text" 
                                            placeholder="Create new branch..." 
                                            value={newBranchName}
                                            onChange={(e) => setNewBranchName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateBranch()}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white mb-2 focus:border-indigo-500 outline-none"
                                        />
                                        <div className="max-h-40 overflow-y-auto">
                                            {branches.map(b => (
                                                <div 
                                                    key={b.name} 
                                                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer ${b.isCurrent ? 'bg-indigo-600/20 text-indigo-300' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                                                    onClick={() => {
                                                        if (!b.isCurrent) handleSwitchBranch(b.name);
                                                        setShowBranchModal(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-rounded text-[14px]">call_split</span>
                                                        {b.name}
                                                    </div>
                                                    {!b.isCurrent && (
                                                        <span 
                                                            className="material-symbols-rounded text-[14px] hover:text-indigo-400" 
                                                            title="Merge into current"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMergeBranch(b.name);
                                                            }}
                                                        >
                                                            merge
                                                        </span>
                                                    )}
                                                    {b.isCurrent && <span className="material-symbols-rounded text-[14px]">check</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Commit Input */}
                             <div className="p-3 border-b border-zinc-800 shrink-0">
                                 <textarea 
                                    value={commitMessage}
                                    onChange={(e) => setCommitMessage(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none resize-none mb-2 placeholder-zinc-600"
                                    rows={2}
                                    placeholder="Commit message (Cmd+Enter)"
                                 />
                                 <button 
                                    onClick={handleCommit}
                                    disabled={!commitMessage || changes.filter(c => c.staged).length === 0}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 font-medium"
                                 >
                                     Commit
                                 </button>
                             </div>

                             {/* Changes List */}
                             <div className="flex-1 overflow-y-auto">
                                {/* Staged */}
                                {changes.some(c => c.staged) && (
                                    <div>
                                        <div className="px-3 py-1 bg-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1 sticky top-0 backdrop-blur-sm">
                                            <span className="material-symbols-rounded text-[12px]">expand_more</span>
                                            Staged
                                            <span className="ml-auto bg-zinc-700 text-zinc-300 px-1 rounded">{changes.filter(c => c.staged).length}</span>
                                        </div>
                                        {changes.filter(c => c.staged).map((change, i) => (
                                            <div key={i} className="flex items-center justify-between px-3 py-1 hover:bg-zinc-800 group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="material-symbols-rounded text-zinc-500 text-[14px]">description</span>
                                                    <span className="text-xs text-zinc-300 truncate decoration-zinc-500">{change.file}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-bold ${getStatusColor(change.status)}`}>{change.status}</span>
                                                    <button onClick={() => toggleStage(change.file)} className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100">
                                                        <span className="material-symbols-rounded text-[14px]">remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                 {/* Unstaged */}
                                 <div>
                                    <div className="px-3 py-1 bg-zinc-800/50 text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1 mt-1 sticky top-0 backdrop-blur-sm">
                                        <span className="material-symbols-rounded text-[12px]">expand_more</span>
                                        Changes
                                        <span className="ml-auto bg-zinc-700 text-zinc-300 px-1 rounded">{changes.filter(c => !c.staged).length}</span>
                                    </div>
                                    {changes.filter(c => !c.staged).map((change, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-1 hover:bg-zinc-800 group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <span className="material-symbols-rounded text-zinc-500 text-[14px]">description</span>
                                                <span className="text-xs text-zinc-300 truncate">{change.file}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${getStatusColor(change.status)}`}>{change.status}</span>
                                                <button onClick={() => toggleStage(change.file)} className="text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100">
                                                    <span className="material-symbols-rounded text-[14px]">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {changes.filter(c => !c.staged).length === 0 && (
                                        <div className="px-3 py-4 text-center">
                                            <span className="text-xs text-zinc-500 italic">No pending changes</span>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    )
                ) : (
                    // Alternative Provider View
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500">
                         <span className="material-symbols-rounded text-4xl mb-3 text-zinc-700">history</span>
                         <h3 className="text-sm font-medium text-zinc-300 mb-1">Local History</h3>
                         <p className="text-xs mb-4">Viewing local file modifications over time.</p>
                         <div className="w-full text-left space-y-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="p-2 bg-zinc-900 border border-zinc-800 rounded flex justify-between items-center hover:bg-zinc-800 cursor-pointer">
                                     <div>
                                         <div className="text-xs text-zinc-300">Auto-save {i*15}m ago</div>
                                         <div className="text-[10px] text-zinc-500">3 files changed</div>
                                     </div>
                                     <span className="material-symbols-rounded text-[14px]">restore</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
              </>
          )}
        </div>

        {/* Right Side: Editor + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
            {/* Editor Area */}
            <div className="flex-1 p-4 font-mono text-sm overflow-auto relative border-b border-zinc-800">
                <div className="flex">
                    <div className="w-8 flex flex-col text-zinc-600 text-right pr-4 select-none shrink-0 border-r border-zinc-800/50 mr-4">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <span key={i} className="leading-6 hover:text-zinc-400 cursor-pointer">{i + 1}</span>
                    ))}
                    </div>
                    <pre className="flex-1 leading-6 text-zinc-300 outline-none" contentEditable spellCheck="false">
                    {codeSnippet.split('\n').map((line, i) => (
                        <div key={i} dangerouslySetInnerHTML={{ 
                        __html: line
                            .replace(/import|export|from|return|if|const/g, '<span class="text-purple-400">$&</span>')
                            .replace(/React|useState|useEffect|ThemeProvider|Layout|Router/g, '<span class="text-yellow-300">$&</span>')
                            .replace(/'[^']*'/g, '<span class="text-green-400">$&</span>')
                            .replace(/\/\/.*/g, '<span class="text-zinc-500 italic">$&</span>')
                        }} />
                    ))}
                    </pre>
                </div>
                
                {/* AI Assistant Floating Button */}
                <div className="absolute bottom-6 right-6">
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-1 group">
                        <span className="material-symbols-rounded group-hover:animate-pulse">auto_awesome</span>
                        <span className="font-medium text-sm">Ask AI</span>
                    </button>
                </div>
            </div>

            {/* Terminal / Panel */}
            <div className="h-48 bg-zinc-900 flex flex-col shrink-0">
            <div className="flex items-center gap-4 px-4 py-1.5 border-b border-zinc-800 bg-zinc-900">
                <button className="text-[11px] font-bold text-white border-b-2 border-indigo-500 pb-1.5 pt-1 -mb-1.5">TERMINAL</button>
                <button className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 pb-1.5 pt-1 -mb-1.5">OUTPUT</button>
                <button className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 pb-1.5 pt-1 -mb-1.5">PROBLEMS</button>
                <button className="text-[11px] font-bold text-zinc-500 hover:text-zinc-300 pb-1.5 pt-1 -mb-1.5">DEBUG CONSOLE</button>
                
                <div className="ml-auto flex items-center gap-2">
                    <button className="text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-[16px]">add</span></button>
                    <button className="text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-[16px]">delete</span></button>
                    <button className="text-zinc-400 hover:text-white"><span className="material-symbols-rounded text-[16px]">keyboard_arrow_down</span></button>
                </div>
            </div>
            <div className="flex-1 p-3 font-mono text-xs text-zinc-300 overflow-y-auto bg-zinc-950">
                <div className="mb-1"><span className="text-green-400">➜</span> <span className="text-blue-400">nexus-web</span> git:(<span className="text-red-400">{branches.find(b => b.isCurrent)?.name}</span>) <span className="text-yellow-400">✗</span> npm start</div>
                <div className="mb-1 text-zinc-400">> react-scripts start</div>
                <div className="mb-1 text-green-400">Starting the development server...</div>
                <div className="mb-1">Compiled successfully!</div>
                <div className="mb-1">You can now view nexus-web in the browser.</div>
                <div className="mb-1 text-blue-300">  Local:            http://localhost:3000</div>
                {isSyncing && <div className="mb-1 text-zinc-500 italic">git pull origin {branches.find(b=>b.isCurrent)?.name}...</div>}
                <div className="mt-2"><span className="text-green-400">➜</span> <span className="text-blue-400">nexus-web</span> git:(<span className="text-red-400">{branches.find(b => b.isCurrent)?.name}</span>) <span className="text-yellow-400">✗</span> <span className="animate-pulse">_</span></div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;