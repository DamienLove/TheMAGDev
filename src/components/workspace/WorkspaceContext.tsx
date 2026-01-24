import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

interface WorkspaceState {
  files: FileNode[];
  openFiles: string[];
  activeFile: string | null;
  unsavedFiles: Set<string>;
  terminalHistory: string[];
  currentDirectory: string;
}

interface WorkspaceContextType extends WorkspaceState {
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  saveFile: (path: string) => void;
  createFile: (parentPath: string, name: string, type: 'file' | 'folder') => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newName: string) => void;
  getFileContent: (path: string) => string | undefined;
  getFileByPath: (path: string) => FileNode | undefined;
  addTerminalLine: (line: string) => void;
  clearTerminal: () => void;
  setCurrentDirectory: (dir: string) => void;
}

const STORAGE_KEY = 'themag_workspace';

const defaultFiles: FileNode[] = [
  {
    name: 'src',
    path: '/src',
    type: 'folder',
    children: [
      {
        name: 'components',
        path: '/src/components',
        type: 'folder',
        children: [
          {
            name: 'App.tsx',
            path: '/src/components/App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';
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
};

export default App;`
          },
          {
            name: 'Button.tsx',
            path: '/src/components/Button.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
    danger: 'bg-red-600 hover:bg-red-500 text-white'
  };

  return (
    <button
      className={\`\${baseStyles} \${variants[variant]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};`
          }
        ]
      },
      {
        name: 'hooks',
        path: '/src/hooks',
        type: 'folder',
        children: [
          {
            name: 'useAuth.ts',
            path: '/src/hooks/useAuth.ts',
            type: 'file',
            language: 'typescript',
            content: `import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      // Validate token and fetch user
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      // API call to validate token
      setUser({ id: '1', email: 'user@example.com', name: 'User' });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Implementation
  };

  const logout = () => {
    sessionStorage.removeItem('auth_token');
    setUser(null);
  };

  return { user, loading, login, logout };
};`
          }
        ]
      },
      {
        name: 'main.tsx',
        path: '/src/main.tsx',
        type: 'file',
        language: 'typescript',
        content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TheMAGProvider } from './context/TheMAGContext';
import App from './App';
import './index.css';

// Initialize the root node with performance monitoring
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <StrictMode>
    <TheMAGProvider config={{ telemetry: true }}>
      <App />
    </TheMAGProvider>
  </StrictMode>
);`
      },
      {
        name: 'index.css',
        path: '/src/index.css',
        type: 'file',
        language: 'css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #6366f1;
  --color-secondary: #8b5cf6;
  --color-background: #09090b;
  --color-surface: #18181b;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--color-background);
  color: #fafafa;
}

* {
  box-sizing: border-box;
}`
      }
    ]
  },
  {
    name: 'public',
    path: '/public',
    type: 'folder',
    children: [
      {
        name: 'index.html',
        path: '/public/index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TheMAG.dev</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
      }
    ]
  },
  {
    name: 'package.json',
    path: '/package.json',
    type: 'file',
    language: 'json',
    content: `{
  "name": "themag-framework",
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
}`
  },
  {
    name: 'README.md',
    path: '/README.md',
    type: 'file',
    language: 'markdown',
    content: `# TheMAG Framework

A modern full-stack development framework.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Built-in authentication
- API integration helpers
`
  },
  {
    name: 'tsconfig.json',
    path: '/tsconfig.json',
    type: 'file',
    language: 'json',
    content: `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`
  }
];

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    json: 'json',
    css: 'css',
    scss: 'scss',
    html: 'html',
    md: 'markdown',
    py: 'python',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return languageMap[ext || ''] || 'plaintext';
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileNode[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultFiles;
      }
    }
    return defaultFiles;
  });

  const [openFiles, setOpenFiles] = useState<string[]>(['/src/main.tsx']);
  const [activeFile, setActiveFileState] = useState<string | null>('/src/main.tsx');
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    '$ Welcome to TheMAG.dev Terminal',
    '$ Type "help" for available commands',
    ''
  ]);
  const [currentDirectory, setCurrentDirectory] = useState('/');

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }, [files]);

  const findFileByPath = useCallback((nodes: FileNode[], path: string): FileNode | undefined => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFileByPath(node.children, path);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  const getFileByPath = useCallback((path: string): FileNode | undefined => {
    return findFileByPath(files, path);
  }, [files, findFileByPath]);

  const getFileContent = useCallback((path: string): string | undefined => {
    const file = getFileByPath(path);
    return file?.content;
  }, [getFileByPath]);

  const openFile = useCallback((path: string) => {
    const file = getFileByPath(path);
    if (file && file.type === 'file') {
      setOpenFiles(prev => prev.includes(path) ? prev : [...prev, path]);
      setActiveFileState(path);
    }
  }, [getFileByPath]);

  const closeFile = useCallback((path: string) => {
    setOpenFiles(prev => {
      const newFiles = prev.filter(p => p !== path);
      if (activeFile === path && newFiles.length > 0) {
        setActiveFileState(newFiles[newFiles.length - 1]);
      } else if (newFiles.length === 0) {
        setActiveFileState(null);
      }
      return newFiles;
    });
    setUnsavedFiles(prev => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
  }, [activeFile]);

  const setActiveFile = useCallback((path: string) => {
    if (openFiles.includes(path)) {
      setActiveFileState(path);
    }
  }, [openFiles]);

  const updateFileContent = useCallback((path: string, content: string) => {
    setFiles(prev => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === path) {
            return { ...node, content };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prev);
    });
    setUnsavedFiles(prev => new Set(prev).add(path));
  }, []);

  const saveFile = useCallback((path: string) => {
    setUnsavedFiles(prev => {
      const next = new Set(prev);
      next.delete(path);
      return next;
    });
    // Already saved via the updateFileContent + localStorage effect
  }, []);

  const createFile = useCallback((parentPath: string, name: string, type: 'file' | 'folder') => {
    const newPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
    const newNode: FileNode = {
      name,
      path: newPath,
      type,
      language: type === 'file' ? getLanguageFromFilename(name) : undefined,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
    };

    setFiles(prev => {
      if (parentPath === '/') {
        return [...prev, newNode];
      }

      const addToParent = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === parentPath && node.type === 'folder') {
            return { ...node, children: [...(node.children || []), newNode] };
          }
          if (node.children) {
            return { ...node, children: addToParent(node.children) };
          }
          return node;
        });
      };
      return addToParent(prev);
    });

    if (type === 'file') {
      openFile(newPath);
    }
  }, [openFile]);

  const deleteFile = useCallback((path: string) => {
    setFiles(prev => {
      const removeNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.filter(node => {
          if (node.path === path) return false;
          if (node.children) {
            node.children = removeNode(node.children);
          }
          return true;
        });
      };
      return removeNode(prev);
    });
    closeFile(path);
  }, [closeFile]);

  const renameFile = useCallback((oldPath: string, newName: string) => {
    setFiles(prev => {
      const renameNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === oldPath) {
            const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'));
            const newPath = parentPath ? `${parentPath}/${newName}` : `/${newName}`;
            return {
              ...node,
              name: newName,
              path: newPath,
              language: node.type === 'file' ? getLanguageFromFilename(newName) : undefined,
            };
          }
          if (node.children) {
            return { ...node, children: renameNode(node.children) };
          }
          return node;
        });
      };
      return renameNode(prev);
    });
  }, []);

  const addTerminalLine = useCallback((line: string) => {
    setTerminalHistory(prev => [...prev, line]);
  }, []);

  const clearTerminal = useCallback(() => {
    setTerminalHistory(['$ Terminal cleared', '']);
  }, []);

  const value: WorkspaceContextType = {
    files,
    openFiles,
    activeFile,
    unsavedFiles,
    terminalHistory,
    currentDirectory,
    openFile,
    closeFile,
    setActiveFile,
    updateFileContent,
    saveFile,
    createFile,
    deleteFile,
    renameFile,
    getFileContent,
    getFileByPath,
    addTerminalLine,
    clearTerminal,
    setCurrentDirectory,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
