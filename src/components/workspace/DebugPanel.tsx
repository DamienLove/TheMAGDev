import React, { useState } from 'react';

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  enabled: boolean;
  condition?: string;
  hitCount?: number;
}

export interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  children?: Variable[];
}

export interface DebugSession {
  id: string;
  name: string;
  status: 'stopped' | 'running' | 'paused' | 'terminated';
  currentFile?: string;
  currentLine?: number;
}

interface DebugPanelProps {
  className?: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'variables' | 'watch' | 'callstack' | 'breakpoints'>('variables');
  const [session, setSession] = useState<DebugSession | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [watchExpressions, setWatchExpressions] = useState<string[]>(['user.name', 'items.length']);
  const [newWatch, setNewWatch] = useState('');
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set(['user']));

  // Mock data for demonstration
  const [breakpoints] = useState<Breakpoint[]>([
    { id: 'bp1', file: '/src/components/App.tsx', line: 15, enabled: true },
    { id: 'bp2', file: '/src/hooks/useAuth.ts', line: 23, enabled: true, condition: 'user !== null' },
    { id: 'bp3', file: '/src/main.tsx', line: 8, enabled: false },
  ]);

  const [stackFrames] = useState<StackFrame[]>([
    { id: 'sf1', name: 'handleClick', file: '/src/components/App.tsx', line: 15, column: 5 },
    { id: 'sf2', name: 'onClick', file: '/src/components/Button.tsx', line: 28, column: 12 },
    { id: 'sf3', name: 'dispatchEvent', file: '[native code]', line: 0, column: 0 },
  ]);

  const [variables] = useState<Variable[]>([
    {
      name: 'user',
      value: 'Object',
      type: 'object',
      children: [
        { name: 'id', value: '"usr_123"', type: 'string' },
        { name: 'name', value: '"John Doe"', type: 'string' },
        { name: 'email', value: '"john@example.com"', type: 'string' },
        { name: 'isActive', value: 'true', type: 'boolean' },
      ],
    },
    { name: 'items', value: 'Array(3)', type: 'array' },
    { name: 'count', value: '42', type: 'number' },
    { name: 'isLoading', value: 'false', type: 'boolean' },
    { name: 'error', value: 'null', type: 'null' },
  ]);

  const handleStartDebug = () => {
    setIsDebugging(true);
    setSession({
      id: 'session-1',
      name: 'Debug: npm run dev',
      status: 'paused',
      currentFile: '/src/components/App.tsx',
      currentLine: 15,
    });
  };

  const handleStopDebug = () => {
    setIsDebugging(false);
    setSession(null);
  };

  const handleContinue = () => {
    if (session) {
      setSession({ ...session, status: 'running' });
      setTimeout(() => {
        setSession(prev => prev ? { ...prev, status: 'paused', currentLine: 23 } : null);
      }, 500);
    }
  };

  const handleStepOver = () => {
    if (session) {
      setSession({ ...session, currentLine: (session.currentLine || 0) + 1 });
    }
  };

  const handleStepInto = () => {
    if (session && stackFrames.length > 0) {
      setSession({ ...session, currentFile: stackFrames[1]?.file, currentLine: stackFrames[1]?.line });
    }
  };

  const handleStepOut = () => {
    if (session && stackFrames.length > 1) {
      setSession({ ...session, currentFile: stackFrames[0]?.file, currentLine: (stackFrames[0]?.line || 0) + 1 });
    }
  };

  const handleAddWatch = () => {
    if (newWatch.trim() && !watchExpressions.includes(newWatch.trim())) {
      setWatchExpressions([...watchExpressions, newWatch.trim()]);
      setNewWatch('');
    }
  };

  const handleRemoveWatch = (expr: string) => {
    setWatchExpressions(watchExpressions.filter(e => e !== expr));
  };

  const toggleExpanded = (name: string) => {
    setExpandedVars(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'string': return 'text-emerald-400';
      case 'number': return 'text-amber-400';
      case 'boolean': return 'text-purple-400';
      case 'object': return 'text-blue-400';
      case 'array': return 'text-blue-400';
      case 'null': return 'text-zinc-500';
      case 'undefined': return 'text-zinc-500';
      default: return 'text-zinc-300';
    }
  };

  const renderVariable = (variable: Variable, depth = 0) => {
    const hasChildren = variable.children && variable.children.length > 0;
    const isExpanded = expandedVars.has(variable.name);

    return (
      <div key={variable.name}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-zinc-800 rounded cursor-pointer`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => hasChildren && toggleExpanded(variable.name)}
        >
          {hasChildren ? (
            <span className="material-symbols-rounded text-xs text-zinc-500">
              {isExpanded ? 'expand_more' : 'chevron_right'}
            </span>
          ) : (
            <span className="w-4"></span>
          )}
          <span className="text-zinc-300 text-xs">{variable.name}</span>
          <span className="text-zinc-600 text-xs">:</span>
          <span className={`text-xs ${getTypeColor(variable.type)}`}>{variable.value}</span>
        </div>
        {hasChildren && isExpanded && variable.children?.map(child => renderVariable(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-zinc-950 ${className}`}>
      {/* Debug Controls */}
      <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
        {!isDebugging ? (
          <button
            onClick={handleStartDebug}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded text-[10px] font-bold transition-all uppercase tracking-tight"
          >
            <span className="material-symbols-rounded text-sm">play_arrow</span>
            Start Debug
          </button>
        ) : (
          <>
            <button
              onClick={handleContinue}
              disabled={session?.status === 'running'}
              className="p-1.5 text-emerald-400 hover:bg-zinc-800 rounded disabled:opacity-30"
              title="Continue (F5)"
            >
              <span className="material-symbols-rounded text-lg">play_arrow</span>
            </button>
            <button
              onClick={handleStepOver}
              disabled={session?.status === 'running'}
              className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded disabled:opacity-30"
              title="Step Over (F10)"
            >
              <span className="material-symbols-rounded text-lg">redo</span>
            </button>
            <button
              onClick={handleStepInto}
              disabled={session?.status === 'running'}
              className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded disabled:opacity-30"
              title="Step Into (F11)"
            >
              <span className="material-symbols-rounded text-lg">arrow_downward</span>
            </button>
            <button
              onClick={handleStepOut}
              disabled={session?.status === 'running'}
              className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded disabled:opacity-30"
              title="Step Out (Shift+F11)"
            >
              <span className="material-symbols-rounded text-lg">arrow_upward</span>
            </button>
            <button
              onClick={() => {}}
              disabled={session?.status === 'running'}
              className="p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 rounded disabled:opacity-30"
              title="Restart"
            >
              <span className="material-symbols-rounded text-lg">refresh</span>
            </button>
            <button
              onClick={handleStopDebug}
              className="p-1.5 text-red-400 hover:bg-zinc-800 rounded"
              title="Stop (Shift+F5)"
            >
              <span className="material-symbols-rounded text-lg">stop</span>
            </button>

            <div className="h-4 w-px bg-zinc-700 mx-2"></div>

            {session && (
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  session.status === 'running' ? 'bg-emerald-500 animate-pulse' :
                  session.status === 'paused' ? 'bg-amber-500' :
                  'bg-zinc-500'
                }`}></span>
                <span className="text-zinc-400">{session.status === 'paused' ? 'Paused' : 'Running'}</span>
                {session.currentFile && session.status === 'paused' && (
                  <span className="text-zinc-500">
                    at {session.currentFile.split('/').pop()}:{session.currentLine}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Debug Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Variables/Watch/Call Stack */}
        <div className="w-72 border-r border-zinc-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800 bg-zinc-900">
            {[
              { id: 'variables', label: 'Variables', icon: 'data_object' },
              { id: 'watch', label: 'Watch', icon: 'visibility' },
              { id: 'callstack', label: 'Call Stack', icon: 'layers' },
              { id: 'breakpoints', label: 'Breakpoints', icon: 'circle' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'variables' && (
              <div className="py-2">
                {!isDebugging ? (
                  <div className="px-4 py-8 text-center text-zinc-600 text-xs">
                    Start debugging to inspect variables
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-1 text-[9px] font-bold text-zinc-500 uppercase">Local</div>
                    {variables.map(v => renderVariable(v))}
                  </>
                )}
              </div>
            )}

            {activeTab === 'watch' && (
              <div className="py-2">
                <div className="px-3 mb-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWatch}
                      onChange={(e) => setNewWatch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWatch()}
                      placeholder="Add expression..."
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleAddWatch}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs"
                    >
                      <span className="material-symbols-rounded text-sm">add</span>
                    </button>
                  </div>
                </div>
                {watchExpressions.map(expr => (
                  <div key={expr} className="flex items-center justify-between px-3 py-1.5 hover:bg-zinc-800 group">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-300">{expr}</span>
                      <span className="text-zinc-600">=</span>
                      <span className="text-emerald-400">
                        {isDebugging ? '"value"' : '<not available>'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveWatch(expr)}
                      className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"
                    >
                      <span className="material-symbols-rounded text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'callstack' && (
              <div className="py-2">
                {!isDebugging ? (
                  <div className="px-4 py-8 text-center text-zinc-600 text-xs">
                    Start debugging to see call stack
                  </div>
                ) : (
                  stackFrames.map((frame, i) => (
                    <div
                      key={frame.id}
                      className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer ${
                        i === 0 ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-400 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm">
                        {i === 0 ? 'arrow_right' : 'radio_button_unchecked'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{frame.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">
                          {frame.file}:{frame.line}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'breakpoints' && (
              <div className="py-2">
                {breakpoints.length === 0 ? (
                  <div className="px-4 py-8 text-center text-zinc-600 text-xs">
                    No breakpoints set
                  </div>
                ) : (
                  breakpoints.map(bp => (
                    <div key={bp.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 group">
                      <button
                        className={`w-3 h-3 rounded-full border-2 ${
                          bp.enabled
                            ? 'bg-red-500 border-red-500'
                            : 'bg-transparent border-zinc-600'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-zinc-300 truncate">
                          {bp.file.split('/').pop()}:{bp.line}
                        </div>
                        {bp.condition && (
                          <div className="text-[10px] text-zinc-500 truncate">
                            Condition: {bp.condition}
                          </div>
                        )}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400">
                        <span className="material-symbols-rounded text-sm">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Debug Console */}
        <div className="flex-1 flex flex-col">
          <div className="h-8 bg-zinc-900 border-b border-zinc-800 flex items-center px-4">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Debug Console</span>
          </div>
          <div className="flex-1 p-3 font-mono text-xs overflow-y-auto">
            {isDebugging ? (
              <>
                <div className="text-zinc-500">Debug session started</div>
                <div className="text-amber-400">Breakpoint hit at App.tsx:15</div>
                <div className="text-zinc-400">
                  <span className="text-zinc-600">&gt;</span> console.log(user)
                </div>
                <div className="text-emerald-400 pl-4">{'{ id: "usr_123", name: "John Doe", ... }'}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-zinc-600">&gt;</span>
                  <input
                    type="text"
                    placeholder="Evaluate expression..."
                    className="flex-1 bg-transparent text-zinc-200 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div className="text-zinc-600 italic">Start debugging to use the console</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
