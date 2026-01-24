import React, { useState, useCallback, useEffect, useRef } from 'react';
import { WorkspaceProvider, useWorkspace, MonacoEditor, Terminal, FileExplorer, DebugPanel, AIAssistant } from '../src/components/workspace';

// Types for Source Control
interface GitChange {
  file: string;
  status: 'M' | 'A' | 'D' | 'U';
  staged: boolean;
}

// Inner component that uses workspace context
type ModuleId = 'explorer' | 'terminal' | 'debug' | 'output' | 'assistant';

interface FloatingPanelState {
  floating: boolean;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const CodeEditorContent: React.FC = () => {
  const { openFiles, activeFile, closeFile, setActiveFile, unsavedFiles, saveFile } = useWorkspace();

  const [sidebarMode, setSidebarMode] = useState<'EXPLORER' | 'GIT' | 'SEARCH' | 'EXTENSIONS'>('EXPLORER');
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);
  const [bottomPanelMode, setBottomPanelMode] = useState<'terminal' | 'debug' | 'output'>('terminal');
  const [bottomPanelHeight, setBottomPanelHeight] = useState(240);
  const [searchQuery, setSearchQuery] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [activeModuleTab, setActiveModuleTab] = useState<ModuleId>('terminal');
  const [floatingPanels, setFloatingPanels] = useState<Record<ModuleId, FloatingPanelState>>({
    explorer: { floating: false, visible: true, x: 80, y: 120, width: 320, height: 420, zIndex: 10 },
    terminal: { floating: false, visible: true, x: 140, y: 180, width: 720, height: 320, zIndex: 11 },
    debug: { floating: false, visible: true, x: 180, y: 220, width: 720, height: 360, zIndex: 12 },
    output: { floating: false, visible: true, x: 200, y: 260, width: 620, height: 260, zIndex: 13 },
    assistant: { floating: false, visible: true, x: 900, y: 140, width: 360, height: 520, zIndex: 14 },
  });
  const resizeState = useRef<{ startY: number; startHeight: number } | null>(null);
  const dragState = useRef<{ id: ModuleId; startX: number; startY: number; startLeft: number; startTop: number } | null>(null);

  // Git State (mock for now)
  const [changes, setChanges] = useState<GitChange[]>([
    { file: 'src/components/App.tsx', status: 'M', staged: false },
    { file: 'src/hooks/useAuth.ts', status: 'A', staged: false },
    { file: 'tailwind.config.js', status: 'M', staged: true },
    { file: 'public/manifest.json', status: 'U', staged: false }
  ]);
  const [currentBranch] = useState('main');

  const moduleTabs: { id: ModuleId; label: string }[] = [
    { id: 'explorer', label: 'Explorer' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'debug', label: 'Debug' },
    { id: 'output', label: 'Output' },
    { id: 'assistant', label: 'AI' },
  ];

  const bringToFront = (id: ModuleId) => {
    setFloatingPanels(prev => {
      const maxZ = Math.max(...Object.values(prev).map(p => p.zIndex));
      return {
        ...prev,
        [id]: { ...prev[id], zIndex: maxZ + 1 },
      };
    });
  };

  const toggleFloating = (id: ModuleId) => {
    setFloatingPanels(prev => {
      const next = { ...prev };
      const panel = next[id];
      const willFloat = !panel.floating;
      next[id] = { ...panel, floating: willFloat, visible: true };

      if (id === 'assistant') {
        setShowAiPanel(!willFloat);
      }

      if (id === 'explorer' && sidebarMode === 'EXPLORER') {
        setSidebarMode('SEARCH');
      }

      if (id === 'terminal' || id === 'debug' || id === 'output') {
        const docked = (['terminal', 'debug', 'output'] as ModuleId[]).filter(key => {
          if (key === id) return !willFloat;
          return !next[key].floating;
        });
        if (docked.length === 0) {
          setShowBottomPanel(false);
        } else if (willFloat && bottomPanelMode === id) {
          setBottomPanelMode(docked[0] as 'terminal' | 'debug' | 'output');
          setShowBottomPanel(true);
        } else if (!willFloat) {
          setBottomPanelMode(id);
          setShowBottomPanel(true);
        }
      }

      return next;
    });
  };

  const hideFloating = (id: ModuleId) => {
    setFloatingPanels(prev => ({ ...prev, [id]: { ...prev[id], visible: false } }));
  };

  const handleModuleTabClick = (id: ModuleId) => {
    setActiveModuleTab(id);
    const panel = floatingPanels[id];
    if (panel.floating) {
      setFloatingPanels(prev => ({ ...prev, [id]: { ...prev[id], visible: true } }));
      bringToFront(id);
      return;
    }

    if (id === 'assistant') {
      setShowAiPanel(true);
      return;
    }

    if (id === 'explorer') {
      setSidebarMode('EXPLORER');
      return;
    }

    setShowBottomPanel(true);
    setBottomPanelMode(id);
  };

  const handleResizeStart = (event: React.MouseEvent) => {
    resizeState.current = {
      startY: event.clientY,
      startHeight: bottomPanelHeight,
    };
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!resizeState.current) return;
      const delta = resizeState.current.startY - event.clientY;
      const maxHeight = Math.round(window.innerHeight * 0.7);
      const nextHeight = Math.max(180, Math.min(maxHeight, resizeState.current.startHeight + delta));
      setBottomPanelHeight(nextHeight);
    };

    const handleUp = () => {
      resizeState.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const handleDragStart = (id: ModuleId, event: React.MouseEvent) => {
    event.preventDefault();
    const panel = floatingPanels[id];
    dragState.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: panel.x,
      startTop: panel.y,
    };
    bringToFront(id);
  };

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragState.current) return;
      const { id, startX, startY, startLeft, startTop } = dragState.current;
      const nextX = Math.max(20, startLeft + (event.clientX - startX));
      const nextY = Math.max(20, startTop + (event.clientY - startY));
      setFloatingPanels(prev => ({ ...prev, [id]: { ...prev[id], x: nextX, y: nextY } }));
    };

    const handleUp = () => {
      dragState.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [floatingPanels]);

  const toggleStage = (file: string) => {
    setChanges(prev => prev.map(c => c.file === file ? { ...c, staged: !c.staged } : c));
  };

  const handleCommit = () => {
    if (!commitMessage.trim() || changes.filter(c => c.staged).length === 0) return;
    setChanges(prev => prev.filter(c => !c.staged));
    setCommitMessage('');
  };

  const handleCloseTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    closeFile(path);
  }, [closeFile]);

  const getFileIcon = (filename: string): { icon: string; color: string } => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, { icon: string; color: string }> = {
      tsx: { icon: 'code', color: 'text-blue-400' },
      ts: { icon: 'code', color: 'text-blue-400' },
      jsx: { icon: 'code', color: 'text-yellow-400' },
      js: { icon: 'code', color: 'text-yellow-400' },
      json: { icon: 'data_object', color: 'text-emerald-400' },
      css: { icon: 'palette', color: 'text-pink-400' },
      html: { icon: 'html', color: 'text-orange-400' },
      md: { icon: 'description', color: 'text-zinc-400' },
    };
    return iconMap[ext || ''] || { icon: 'description', color: 'text-zinc-500' };
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 h-full overflow-hidden font-sans relative">
      {/* IDE Toolbar */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500 text-lg">deployed_code</span>
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">TheMAG.dev Workspace</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950 rounded border border-zinc-800">
            <span className="material-symbols-rounded text-sm text-zinc-500">terminal</span>
            <span className="text-[10px] font-mono text-zinc-300">bash --cluster=dev-01</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => activeFile && saveFile(activeFile)}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded text-[10px] font-bold transition-all uppercase tracking-tight"
          >
            <span className="material-symbols-rounded text-sm">save</span> Save
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded text-[10px] font-bold transition-all uppercase tracking-tight">
            <span className="material-symbols-rounded text-sm">play_arrow</span> Run
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/30 rounded text-[10px] font-bold transition-all uppercase tracking-tight">
            <span className="material-symbols-rounded text-sm">bug_report</span> Debug
          </button>
        </div>
      </div>

      {/* Workspace Module Tabs */}
      <div className="h-8 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 px-3 shrink-0">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">Modules</span>
        {moduleTabs.map(tab => {
          const panel = floatingPanels[tab.id];
          const isActive = activeModuleTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleModuleTabClick(tab.id)}
              className={`px-3 h-6 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                isActive ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tab.label}
              {panel.floating && <span className="ml-1 text-[9px] text-amber-300">•</span>}
            </button>
          );
        })}
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {/* Activity Bar */}
        <aside className="w-12 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4 gap-4 shrink-0 z-40">
          <button
            onClick={() => { setSidebarMode('EXPLORER'); setActiveModuleTab('explorer'); }}
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
            {changes.length > 0 && <span className="absolute top-1 right-1 size-2 bg-indigo-500 rounded-full border border-zinc-950"></span>}
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
            <button
              onClick={() => {
                setShowBottomPanel(prev => !prev);
                setBottomPanelMode('terminal');
                setActiveModuleTab('terminal');
              }}
              className={`p-2 transition-colors ${showBottomPanel ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
              title="Toggle Bottom Panel"
            >
              <span className="material-symbols-rounded">terminal</span>
            </button>
            <button className="text-zinc-600 hover:text-zinc-400"><span className="material-symbols-rounded">account_circle</span></button>
            <button className="text-zinc-600 hover:text-zinc-400 mb-2"><span className="material-symbols-rounded">settings</span></button>
          </div>
        </aside>

        {/* Primary Sidebar */}
        <section className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-hidden">
          {sidebarMode === 'EXPLORER' && !floatingPanels.explorer.floating && (
            <FileExplorer onPopOut={() => toggleFloating('explorer')} />
          )}
          {sidebarMode === 'EXPLORER' && floatingPanels.explorer.floating && (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-600">
              Explorer popped out
            </div>
          )}

          {sidebarMode === 'SEARCH' && (
            <div className="flex flex-col h-full">
              <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Search</span>
              </div>
              <div className="p-3">
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
                  <div className="text-xs text-zinc-500">
                    Search functionality coming soon...
                  </div>
                )}
              </div>
            </div>
          )}

          {sidebarMode === 'EXTENSIONS' && (
            <div className="flex flex-col h-full">
              <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Extensions</span>
              </div>
              <div className="p-3 space-y-3 overflow-y-auto">
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
            </div>
          )}

          {sidebarMode === 'GIT' && (
            <div className="flex flex-col h-full">
              <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-800/50">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Source Control</span>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-3 mb-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                    <span>Branch</span>
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

                <div className="px-3 mb-3">
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

                {/* Staged Changes */}
                {changes.filter(c => c.staged).length > 0 && (
                  <>
                    <div className="px-3 py-1 bg-zinc-800/30 text-[9px] font-bold text-zinc-500 uppercase flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-rounded text-sm">expand_more</span> Staged
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

                {/* Unstaged Changes */}
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
              </div>
            </div>
          )}
        </section>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-zinc-950 relative">
          {/* Editor Tabs */}
          <div className="flex h-9 bg-zinc-900 border-b border-zinc-800 overflow-x-auto no-scrollbar shrink-0">
            {openFiles.map(filePath => {
              const fileName = filePath.split('/').pop() || filePath;
              const { icon, color } = getFileIcon(fileName);
              const isActive = activeFile === filePath;
              const hasUnsaved = unsavedFiles.has(filePath);

              return (
                <div
                  key={filePath}
                  onClick={() => setActiveFile(filePath)}
                  className={`flex items-center px-4 gap-2 border-r border-zinc-800 cursor-pointer transition-all shrink-0 group ${
                    isActive
                      ? 'bg-zinc-950 border-t-2 border-t-indigo-500 text-white'
                      : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                  }`}
                >
                  <span className={`material-symbols-rounded text-sm ${color}`}>{icon}</span>
                  <span className="text-[11px] font-mono tracking-tight">{fileName}</span>
                  {hasUnsaved && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                  {openFiles.length > 1 && (
                    <button
                      onClick={(e) => handleCloseTab(filePath, e)}
                      className="ml-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-rounded text-xs">close</span>
                    </button>
                  )}
                </div>
              );
            })}
            {openFiles.length === 0 && (
              <div className="flex items-center px-4 text-zinc-600 text-xs italic">No files open</div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1">
              <MonacoEditor />
            </div>

            {/* Bottom Panel (Terminal/Debug/Output) */}
            {showBottomPanel && (
              <div
                className="border-t border-zinc-800 flex flex-col bg-zinc-950"
                style={{ height: `${bottomPanelHeight}px` }}
              >
                <div
                  onMouseDown={handleResizeStart}
                  className="h-1 bg-zinc-800/60 hover:bg-indigo-500/70 cursor-row-resize"
                />
                {/* Bottom Panel Header */}
                <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-1 shrink-0">
                  <button
                    onClick={() => { setBottomPanelMode('terminal'); setActiveModuleTab('terminal'); }}
                    className={`px-3 text-[10px] font-bold uppercase tracking-widest h-full flex items-center transition-colors ${
                      bottomPanelMode === 'terminal'
                        ? 'text-white border-b-2 border-indigo-500'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Terminal
                  </button>
                  <button
                    onClick={() => { setBottomPanelMode('debug'); setActiveModuleTab('debug'); }}
                    className={`px-3 text-[10px] font-bold uppercase tracking-widest h-full flex items-center transition-colors ${
                      bottomPanelMode === 'debug'
                        ? 'text-white border-b-2 border-indigo-500'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Debug
                  </button>
                  <button
                    onClick={() => { setBottomPanelMode('output'); setActiveModuleTab('output'); }}
                    className={`px-3 text-[10px] font-bold uppercase tracking-widest h-full flex items-center transition-colors ${
                      bottomPanelMode === 'output'
                        ? 'text-white border-b-2 border-indigo-500'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Output
                  </button>
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => toggleFloating(bottomPanelMode)}
                      className="text-zinc-500 hover:text-white"
                      title={floatingPanels[bottomPanelMode].floating ? 'Dock panel' : 'Pop out panel'}
                    >
                      <span className="material-symbols-rounded text-sm">
                        {floatingPanels[bottomPanelMode].floating ? 'call_to_action' : 'open_in_new'}
                      </span>
                    </button>
                    <button className="text-zinc-500 hover:text-white"><span className="material-symbols-rounded text-sm">add</span></button>
                    <button
                      onClick={() => setBottomPanelHeight(h => h === 200 ? 350 : 200)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <span className="material-symbols-rounded text-sm">{bottomPanelHeight === 200 ? 'expand_less' : 'expand_more'}</span>
                    </button>
                    <button
                      onClick={() => setShowBottomPanel(false)}
                      className="text-zinc-500 hover:text-white"
                    >
                      <span className="material-symbols-rounded text-sm">close</span>
                    </button>
                  </div>
                </div>
                {/* Panel Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {floatingPanels[bottomPanelMode].floating ? (
                    <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                      {bottomPanelMode} is popped out
                    </div>
                  ) : (
                    <>
                      {bottomPanelMode === 'terminal' && <Terminal />}
                      {bottomPanelMode === 'debug' && <DebugPanel />}
                      {bottomPanelMode === 'output' && (
                        <div className="h-full p-3 font-mono text-xs text-zinc-500 overflow-y-auto">
                          <div>[Build] Starting development server...</div>
                          <div>[Build] Server running at http://localhost:5173</div>
                          <div className="text-emerald-400">[Build] Ready in 127ms</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* AI Assistant Panel */}
        {showAiPanel && !floatingPanels.assistant.floating && (
          <AIAssistant
            className="w-80 h-full"
            onClose={() => setShowAiPanel(false)}
            onPopOut={() => toggleFloating('assistant')}
          />
        )}
        {floatingPanels.assistant.floating && !showAiPanel && (
          <div className="hidden" />
        )}
      </div>

      {/* Floating Panels */}
      {moduleTabs.map(tab => {
        const panel = floatingPanels[tab.id];
        if (!panel.floating || !panel.visible) return null;
        const content =
          tab.id === 'terminal' ? <Terminal /> :
          tab.id === 'debug' ? <DebugPanel /> :
          tab.id === 'output' ? (
            <div className="h-full p-3 font-mono text-xs text-zinc-500 overflow-y-auto">
              <div>[Build] Starting development server...</div>
              <div>[Build] Server running at http://localhost:5173</div>
              <div className="text-emerald-400">[Build] Ready in 127ms</div>
            </div>
          ) :
          tab.id === 'assistant' ? (
            <AIAssistant className="h-full" onClose={() => hideFloating('assistant')} onPopOut={() => toggleFloating('assistant')} />
          ) :
          tab.id === 'explorer' ? (
            <FileExplorer className="h-full" onPopOut={() => toggleFloating('explorer')} />
          ) : null;

        return (
          <div
            key={tab.id}
            style={{
              left: panel.x,
              top: panel.y,
              width: panel.width,
              height: panel.height,
              zIndex: panel.zIndex,
            }}
            className="absolute bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden resize"
            onMouseDown={() => bringToFront(tab.id)}
          >
            <div
              onMouseDown={(event) => handleDragStart(tab.id, event)}
              className="h-8 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-3 cursor-move"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{tab.label}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFloating(tab.id)}
                  className="text-zinc-500 hover:text-zinc-200"
                  title="Dock panel"
                >
                  <span className="material-symbols-rounded text-sm">call_to_action</span>
                </button>
                <button
                  onClick={() => hideFloating(tab.id)}
                  className="text-zinc-500 hover:text-zinc-200"
                  title="Hide panel"
                >
                  <span className="material-symbols-rounded text-sm">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Main component wrapped with provider
const CodeEditor: React.FC = () => {
  return (
    <WorkspaceProvider>
      <CodeEditorContent />
    </WorkspaceProvider>
  );
};

export default CodeEditor;
