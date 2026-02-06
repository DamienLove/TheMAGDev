import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { useWorkspace } from './WorkspaceContext';
import webContainerService from '../../services/WebContainerService';
import localAgentService, { AgentStatus } from '../../services/LocalAgentService';

interface TerminalProps {
  className?: string;
  initialMode?: TerminalMode;
}

type TerminalMode = 'webcontainer' | 'local' | 'mock';

const Terminal: React.FC<TerminalProps> = ({ className, initialMode }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { files, currentDirectory, setCurrentDirectory, addTerminalLine, getFileByPath } = useWorkspace();
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const currentLineRef = useRef('');
  const executeCommandRef = useRef<(command: string) => void>();
  const printPromptRef = useRef<() => void>();
  const defaultMode: TerminalMode = typeof window !== 'undefined' && window.crossOriginIsolated ? 'webcontainer' : 'mock';
  const [terminalMode, setTerminalMode] = useState<TerminalMode>(initialMode ?? defaultMode);
  const [webStatus, setWebStatus] = useState<'idle' | 'booting' | 'ready' | 'error'>('idle');
  const [localStatus, setLocalStatus] = useState<AgentStatus>('disconnected');
  const [webCwd, setWebCwd] = useState('/');
  const [localCwd, setLocalCwd] = useState('~');
  const [agentUrl, setAgentUrl] = useState('ws://localhost:4477');
  const [bootError, setBootError] = useState('');

  const writeToTerminal = useCallback((data: string) => {
    const term = xtermRef.current;
    if (!term) return;
    term.write(data);
  }, []);

  useEffect(() => {
    webContainerService.setOutputCallback(writeToTerminal);
    localAgentService.setOutputCallback(writeToTerminal);
    localAgentService.setStatusCallback(setLocalStatus);
    localAgentService.setCwdCallback(setLocalCwd);
  }, [writeToTerminal]);

  useEffect(() => {
    if (terminalMode !== 'webcontainer') {
      return;
    }
    setWebStatus('booting');
    setBootError('');
    webContainerService.boot()
      .then(() => {
        setWebStatus('ready');
        setWebCwd('/');
      })
      .catch((error: any) => {
        setWebStatus('error');
        setBootError(error?.message || 'Failed to boot WebContainer');
        writeToTerminal(`\r\n\x1b[31mWebContainer error: ${error?.message || 'Failed to boot'}\x1b[0m\r\n`);
      });
  }, [terminalMode, writeToTerminal]);

  const handleLocalConnect = async () => {
    try {
      await localAgentService.connect(agentUrl);
    } catch (error: any) {
      setLocalStatus('error');
      writeToTerminal(`\r\n\x1b[31mLocal agent error: ${error?.message || 'Connection failed'}\x1b[0m\r\n`);
    }
  };

  const handleLocalDisconnect = () => {
    localAgentService.disconnect();
  };

  // Simulated file system commands
  const executeMockCommand = useCallback((command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const parts = command.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    const writeLine = (text: string) => {
      term.writeln(text);
    };

    const findNode = (path: string): typeof files[0] | null => {
      const normalizedPath = path.startsWith('/') ? path : `${currentDirectory}/${path}`.replace(/\/+/g, '/');
      return getFileByPath(normalizedPath) ?? null;
    };

    const getCurrentDirContents = () => {
      if (currentDirectory === '/') return files;
      const node = findNode(currentDirectory);
      return node?.children || [];
    };

    switch (cmd) {
      case 'help':
        writeLine('\r\n\x1b[1;36mAvailable Commands:\x1b[0m');
        writeLine('  \x1b[33mls\x1b[0m [path]      - List directory contents');
        writeLine('  \x1b[33mcd\x1b[0m <path>      - Change directory');
        writeLine('  \x1b[33mpwd\x1b[0m            - Print working directory');
        writeLine('  \x1b[33mcat\x1b[0m <file>     - Display file contents');
        writeLine('  \x1b[33mecho\x1b[0m <text>    - Print text');
        writeLine('  \x1b[33mclear\x1b[0m          - Clear terminal');
        writeLine('  \x1b[33mnpm\x1b[0m <cmd>      - Simulate npm commands');
        writeLine('  \x1b[33mgit\x1b[0m <cmd>      - Simulate git commands');
        writeLine('  \x1b[33mnode\x1b[0m <file>    - Simulate Node.js execution');
        writeLine('  \x1b[33mhelp\x1b[0m           - Show this help');
        break;

      case 'ls':
        const targetPath = args[0] || currentDirectory;
        const contents = args[0] ? findNode(targetPath)?.children || [] : getCurrentDirContents();
        if (contents.length === 0) {
          writeLine('\r\n\x1b[90m(empty directory)\x1b[0m');
        } else {
          writeLine('');
          contents.forEach(item => {
            if (item.type === 'folder') {
              term.write(`\x1b[1;34m${item.name}/\x1b[0m  `);
            } else {
              const ext = item.name.split('.').pop();
              const color = ext === 'tsx' || ext === 'ts' ? '33' : ext === 'json' ? '32' : '37';
              term.write(`\x1b[${color}m${item.name}\x1b[0m  `);
            }
          });
          writeLine('');
        }
        break;

      case 'cd':
        if (!args[0] || args[0] === '~' || args[0] === '/') {
          setCurrentDirectory('/');
        } else if (args[0] === '..') {
          const parent = currentDirectory.split('/').slice(0, -1).join('/') || '/';
          setCurrentDirectory(parent);
        } else {
          const newPath = args[0].startsWith('/') ? args[0] : `${currentDirectory}/${args[0]}`.replace(/\/+/g, '/');
          const node = findNode(newPath);
          if (node && node.type === 'folder') {
            setCurrentDirectory(newPath);
          } else {
            writeLine(`\r\n\x1b[31mcd: ${args[0]}: No such directory\x1b[0m`);
          }
        }
        break;

      case 'pwd':
        writeLine(`\r\n${currentDirectory}`);
        break;

      case 'cat':
        if (!args[0]) {
          writeLine('\r\n\x1b[31mcat: missing operand\x1b[0m');
        } else {
          const file = findNode(args[0]);
          if (file && file.type === 'file' && file.content) {
            writeLine('');
            file.content.split('\n').forEach(line => writeLine(line));
          } else {
            writeLine(`\r\n\x1b[31mcat: ${args[0]}: No such file\x1b[0m`);
          }
        }
        break;

      case 'echo':
        writeLine(`\r\n${args.join(' ')}`);
        break;

      case 'clear':
        term.clear();
        break;

      case 'npm':
        const npmCmd = args[0];
        if (npmCmd === 'run' && args[1] === 'dev') {
          writeLine('\r\n\x1b[1;37m> themag-framework@2.1.0 dev\x1b[0m');
          writeLine('\x1b[1;37m> vite\x1b[0m');
          writeLine('');
          setTimeout(() => {
            writeLine('\x1b[1;32m  VITE v5.0.0\x1b[0m  ready in \x1b[1;33m127ms\x1b[0m');
            writeLine('');
            writeLine('  \x1b[36m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://localhost:5173/\x1b[0m');
            writeLine('  \x1b[90m➜\x1b[0m  \x1b[90mNetwork: use --host to expose\x1b[0m');
            writeLine('');
            printPromptRef.current?.();
          }, 500);
          return;
        } else if (npmCmd === 'install' || npmCmd === 'i') {
          writeLine('\r\n\x1b[90madded 247 packages in 3.2s\x1b[0m');
          writeLine('\x1b[90m43 packages are looking for funding\x1b[0m');
          writeLine('  run `npm fund` for details');
        } else if (npmCmd === 'test') {
          writeLine('\r\n\x1b[1;32m✓\x1b[0m 24 tests passed');
          writeLine('\x1b[1;33m○\x1b[0m 2 tests skipped');
          writeLine('\x1b[90mRan all test suites in 1.42s\x1b[0m');
        } else {
          writeLine(`\r\n\x1b[90mnpm ${args.join(' ')}\x1b[0m`);
        }
        break;

      case 'git':
        const gitCmd = args[0];
        if (gitCmd === 'status') {
          writeLine('\r\nOn branch \x1b[32mmain\x1b[0m');
          writeLine('Your branch is up to date with \x1b[31morigin/main\x1b[0m.');
          writeLine('');
          writeLine('Changes not staged for commit:');
          writeLine('  \x1b[31mmodified:   src/components/App.tsx\x1b[0m');
          writeLine('  \x1b[31mmodified:   src/hooks/useAuth.ts\x1b[0m');
        } else if (gitCmd === 'branch') {
          writeLine('\r\n* \x1b[32mmain\x1b[0m');
          writeLine('  feature/auth-provider');
          writeLine('  hotfix/v1.0.2-patch');
        } else if (gitCmd === 'log') {
          writeLine('\r\n\x1b[33mcommit abc123def456\x1b[0m (HEAD -> main)');
          writeLine('Author: Developer <dev@themag.dev>');
          writeLine('Date:   Today');
          writeLine('');
          writeLine('    feat: add authentication hooks');
        } else {
          writeLine(`\r\n\x1b[90mgit ${args.join(' ')}\x1b[0m`);
        }
        break;

      case 'node':
        if (args[0]) {
          writeLine(`\r\n\x1b[90mExecuting ${args[0]}...\x1b[0m`);
          writeLine('\x1b[32mScript completed successfully\x1b[0m');
        } else {
          writeLine('\r\nWelcome to Node.js v20.0.0.');
          writeLine('Type ".help" for more information.');
        }
        break;

      case '':
        break;

      default:
        writeLine(`\r\n\x1b[31mCommand not found: ${cmd}\x1b[0m`);
        writeLine('\x1b[90mType "help" for available commands\x1b[0m');
    }

    addTerminalLine(`$ ${command}`);
  }, [files, currentDirectory, setCurrentDirectory, addTerminalLine]);

  const executeCommand = useCallback(async (command: string) => {
    const term = xtermRef.current;
    if (!term) return;

    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }



    if (terminalMode === 'mock') {
      if (trimmed === 'clear') {
        term.clear();
        return;
      }
      if (trimmed === 'help') {
        term.writeln('\r\n\x1b[1;36mTheMAG.dev Terminal Modes:\x1b[0m');
        term.writeln('  \x1b[33mwebcontainer\x1b[0m  - Browser-based Node.js runtime');
        term.writeln('  \x1b[33mlocal\x1b[0m         - Local agent on your machine');
        term.writeln('  \x1b[33mmock\x1b[0m          - Simulated commands');
        term.writeln('\r\nUse the mode switcher above the terminal.');
        return;
      }
      executeMockCommand(command);
      return;
    }

    if (terminalMode === 'webcontainer') {
      if (!webContainerService.isReady()) {
        term.writeln('\r\n\x1b[33mWebContainer is not ready yet.\x1b[0m');
        return;
      }

      if (trimmed === 'pwd') {
        term.writeln(`\r\n${webCwd}`);
        return;
      }

      if (trimmed === 'cd' || trimmed.startsWith('cd ')) {
        const target = trimmed === 'cd' ? '/' : trimmed.slice(3).trim();
        const nextPath = target.startsWith('/')
          ? target
          : `${webCwd.replace(/\/$/, '')}/${target}`.replace(/\/+/g, '/');
        setWebCwd(nextPath || '/');
        return;
      }

      try {
        const cwd = webCwd === '/' ? '.' : webCwd.replace(/^\//, '');
        await webContainerService.runCommand(trimmed, { cwd });
      } catch (error: any) {
        term.writeln(`\r\n\x1b[31m${error?.message || 'Command failed'}\x1b[0m`);
      }
      addTerminalLine(`$ ${command}`);
      return;
    }

    if (terminalMode === 'local') {
      if (localStatus !== 'connected') {
        term.writeln('\r\n\x1b[1;36mLocal Terminal Setup:\x1b[0m');
        term.writeln('  1. Download the agent (button above)');
        term.writeln('  2. Extract and run \x1b[33mstart.bat\x1b[0m');
        term.writeln('  3. Click \x1b[32mConnect\x1b[0m above');
        term.writeln('');
        return;
      }
      try {
        localAgentService.runCommand(command);
      } catch (error: any) {
        term.writeln(`\r\n\x1b[31m${error?.message || 'Local command failed'}\x1b[0m`);
      }
      addTerminalLine(`$ ${command}`);
    }
  }, [terminalMode, executeMockCommand, addTerminalLine, webCwd, localStatus]);

  useEffect(() => {
    executeCommandRef.current = executeCommand;
  }, [executeCommand]);

  const printPrompt = useCallback(() => {
    const term = xtermRef.current;
    if (!term) return;

    const activeCwd = terminalMode === 'mock' ? currentDirectory : terminalMode === 'local' ? localCwd : webCwd;
    const normalized = activeCwd.replace(/\\/g, '/');
    const dirName = normalized === '/' || normalized === '~' ? '~' : normalized.split('/').filter(Boolean).pop() || '~';
    const modeLabel = terminalMode === 'local' ? 'local' : terminalMode === 'webcontainer' ? 'web' : 'mock';
    term.write(`\r\n\x1b[1;35m➜\x1b[0m \x1b[1;36m${dirName}\x1b[0m \x1b[90m(${modeLabel})\x1b[0m `);
  }, [currentDirectory, localCwd, terminalMode, webCwd]);

  useEffect(() => {
    printPromptRef.current = printPrompt;
  }, [printPrompt]);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new XTerm({
      theme: {
        background: '#09090b',
        foreground: '#e4e4e7',
        cursor: '#818cf8',
        cursorAccent: '#09090b',
        selectionBackground: '#6366f140',
        black: '#27272a',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#fafafa',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowTransparency: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;36m╔══════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m   \x1b[1;37mTheMAG.dev Terminal\x1b[0m                    \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m║\x1b[0m   \x1b[90mType "help" for available commands\x1b[0m     \x1b[1;36m║\x1b[0m');
    term.writeln('\x1b[1;36m╚══════════════════════════════════════════╝\x1b[0m');

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Initial prompt
    printPromptRef.current?.();

    // Handle input
    term.onData((data) => {
      switch (data) {
        case '\r': // Enter
          executeCommandRef.current?.(currentLineRef.current);
          setCommandHistory(prev => {
            if (currentLineRef.current.trim()) {
              return [...prev, currentLineRef.current];
            }
            return prev;
          });
          setHistoryIndex(-1);
          currentLineRef.current = '';
          printPromptRef.current?.();
          break;
        case '\x7f': // Backspace
          if (currentLineRef.current.length > 0) {
            currentLineRef.current = currentLineRef.current.slice(0, -1);
            term.write('\b \b');
          }
          break;
        case '\x1b[A': // Up arrow
          if (commandHistory.length > 0) {
            const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
            setHistoryIndex(newIndex);
            const cmd = commandHistory[commandHistory.length - 1 - newIndex];
            if (cmd) {
              // Clear current line
              term.write('\r\x1b[K');
              printPromptRef.current?.();
              term.write(cmd);
              currentLineRef.current = cmd;
            }
          }
          break;
        case '\x1b[B': // Down arrow
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            const cmd = commandHistory[commandHistory.length - 1 - newIndex];
            if (cmd) {
              term.write('\r\x1b[K');
              printPromptRef.current?.();
              term.write(cmd);
              currentLineRef.current = cmd;
            }
          } else if (historyIndex === 0) {
            setHistoryIndex(-1);
            term.write('\r\x1b[K');
            printPromptRef.current?.();
            currentLineRef.current = '';
          }
          break;
        case '\x03': // Ctrl+C
          term.write('^C');
          currentLineRef.current = '';
          if (terminalMode === 'webcontainer') {
            webContainerService.killCurrentProcess();
          }
          if (terminalMode === 'local') {
            localAgentService.kill();
          }
          printPromptRef.current?.();
          break;
        case '\x0c': // Ctrl+L
          term.clear();
          printPromptRef.current?.();
          break;
        default:
          if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7e)) {
            currentLineRef.current += data;
            term.write(data);
          }
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermRef.current = null;
    };
  }, []);

  // Update prompt when directory changes
  useEffect(() => {
    if (xtermRef.current) {
      // Only re-fit, don't re-print prompt on directory change
      fitAddonRef.current?.fit();
    }
  }, [currentDirectory]);

  useEffect(() => {
    if (xtermRef.current) {
      currentLineRef.current = '';
      xtermRef.current.write('\r\n');
      printPromptRef.current?.();
    }
  }, [terminalMode]);

  const handleModeSwitch = (mode: TerminalMode) => {
    if (mode === 'webcontainer' && typeof window !== 'undefined' && !window.crossOriginIsolated) {
      const term = xtermRef.current;
      term?.writeln('\r\n\x1b[33mWebContainer requires cross-origin isolation (COOP/COEP). Use Local or Mock mode.\x1b[0m');
      return;
    }
    setTerminalMode(mode);
    if (mode === 'local' && localStatus !== 'connected') {
      setTimeout(() => {
        const term = xtermRef.current;
        if (term) {
          term.writeln('\r\n\x1b[1;36mLocal Terminal Setup:\x1b[0m');
          term.writeln('  1. Download the agent (button above)');
          term.writeln('  2. Extract and run \x1b[33mstart.bat\x1b[0m');
          term.writeln('  3. Click \x1b[32mConnect\x1b[0m above');
          term.writeln('');
          printPromptRef.current?.();
        }
      }, 100);
    }
  };

  return (
    <div className={`h-full bg-[#09090b] flex flex-col ${className}`}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-[11px] bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 uppercase tracking-widest">Mode</span>
          {(['webcontainer', 'local', 'mock'] as TerminalMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider transition-colors ${terminalMode === mode
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
            >
              {mode === 'webcontainer' ? 'Web' : mode === 'local' ? 'Local' : 'Mock'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {terminalMode === 'webcontainer' && (
            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
              <span className={`size-2 rounded-full ${webStatus === 'ready' ? 'bg-emerald-500' : webStatus === 'booting' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{webStatus === 'ready' ? 'WebContainer Ready' : webStatus === 'booting' ? 'Booting WebContainer' : 'WebContainer Error'}</span>
              {bootError && <span className="text-red-400">{bootError}</span>}
            </div>
          )}
          {terminalMode === 'local' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                className="w-44 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[10px] text-zinc-300 focus:outline-none focus:border-indigo-500"
              />
              {localStatus === 'connected' ? (
                <button
                  onClick={handleLocalDisconnect}
                  className="px-2 py-1 rounded border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={handleLocalConnect}
                  className="px-2 py-1 rounded border border-indigo-500/40 text-indigo-300 text-[10px] font-bold uppercase"
                >
                  Connect
                </button>
              )}
              <span className="text-[10px] text-zinc-500 uppercase">{localStatus}</span>
              <a
                href="/themag-agent.zip"
                download
                className="ml-2 px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center gap-1 transition-colors"
                title="Download Local Agent"
              >
                <span className="material-symbols-outlined text-[12px]">download</span>
                <span>Agent</span>
              </a>
            </div>
          )}
        </div>
      </div>
      <div ref={terminalRef} className="flex-1 min-h-0 w-full p-2" />
    </div>
  );
};

export default Terminal;
