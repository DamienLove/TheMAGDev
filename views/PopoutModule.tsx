import React from 'react';
import { WorkspaceProvider, Terminal, FileExplorer, DebugPanel, AIAssistant } from '../src/components/workspace';

type ModuleId = 'explorer' | 'terminal' | 'debug' | 'output' | 'assistant';

interface PopoutModuleProps {
  moduleId: string | null;
}

const PopoutModule: React.FC<PopoutModuleProps> = ({ moduleId }) => {
  const resolved = (moduleId as ModuleId) || 'terminal';
  const titleMap: Record<ModuleId, string> = {
    explorer: 'Explorer',
    terminal: 'Terminal',
    debug: 'Debug',
    output: 'Output',
    assistant: 'AI Assistant',
  };

  const renderModule = () => {
    switch (resolved) {
      case 'explorer':
        return <FileExplorer className="h-full" />;
      case 'debug':
        return <DebugPanel />;
      case 'output':
        return (
          <div className="h-full p-3 font-mono text-xs text-zinc-500 overflow-y-auto">
            <div>[Build] Starting development server...</div>
            <div>[Build] Server running at http://localhost:5173</div>
            <div className="text-emerald-400">[Build] Ready in 127ms</div>
          </div>
        );
      case 'assistant':
        return <AIAssistant className="h-full" />;
      case 'terminal':
      default:
        return <Terminal className="h-full" />;
    }
  };

  return (
    <WorkspaceProvider>
      <div className="h-screen w-screen bg-zinc-950 flex flex-col">
        <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-indigo-500 text-sm">deployed_code</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TheMAG.dev</span>
          </div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{titleMap[resolved]}</span>
        </div>
        <div className="flex-1 min-h-0">{renderModule()}</div>
      </div>
    </WorkspaceProvider>
  );
};

export default PopoutModule;
