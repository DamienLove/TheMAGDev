import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Terminal, useWorkspace, FileNode as WorkspaceFileNode, FileExplorer } from '../src/components/workspace';
import googleDriveService, { DriveFile, DriveSyncStatus, DriveUserInfo } from '../src/services/GoogleDriveService';
import githubService, { GitHubUser, GitHubRepo, GitHubBranch } from '../src/services/GitHubService';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  children?: FileNode[];
  isExpanded?: boolean;
  content?: string;
  driveFile?: DriveFile;
}

interface PanelConfig {
  id: string;
  type: 'editor' | 'terminal' | 'ai' | 'git';
  title: string;
  isVisible: boolean;
}

const DesktopWorkspace: React.FC = () => {
  // Get workspace context for IDE-wide file management
  const workspace = useWorkspace();

  const [activeTab, setActiveTab] = useState('MainController.ts');
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal');
  const showLogActions = activeTerminalTab !== 'Terminal';
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState<DriveSyncStatus>({ connected: false, syncInProgress: false });
  const [userInfo, setUserInfo] = useState<DriveUserInfo | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveFolderFiles, setDriveFolderFiles] = useState<DriveFile[]>([]);
  const [drivePath, setDrivePath] = useState<DriveFile[]>([]);
  const [driveView, setDriveView] = useState<'projects' | 'drive'>('projects');
  const [driveLoading, setDriveLoading] = useState(false);
  const [lastDriveError, setLastDriveError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<DriveFile | null>(null);
  const [projectFiles, setProjectFiles] = useState<FileNode[]>([]);
  const [openFiles, setOpenFiles] = useState<Map<string, string>>(new Map());
  const [activeFileContent, setActiveFileContent] = useState('');
  const [showDrivePanel, setShowDrivePanel] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Successfully connected to build worker: node-linux-01',
  ]);

  // Terminal visibility state for re-opening
  const [showTerminal, setShowTerminal] = useState(true);
  const terminalKey = useRef(0);

  // Multi-panel layout state
  const [panels, setPanels] = useState<PanelConfig[]>([
    { id: 'editor', type: 'editor', title: 'Editor', isVisible: true },
    { id: 'ai', type: 'ai', title: 'AI Assistant', isVisible: true },
    { id: 'terminal', type: 'terminal', title: 'Terminal', isVisible: true },
    { id: 'git', type: 'git', title: 'Git', isVisible: false },
  ]);
  const [splitView, setSplitView] = useState(false);

  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(githubService.isConnected());
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [githubRepo, setGithubRepo] = useState<GitHubRepo | null>(githubService.getRepo());
  const [githubBranches, setGithubBranches] = useState<GitHubBranch[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [githubToken, setGithubToken] = useState('');
  const [repoInput, setRepoInput] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [gitChanges, setGitChanges] = useState<string[]>([]);

  // CLI LLM state
  const [llmPrompt, setLlmPrompt] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);

  // Popout windows for multi-screen support
  const popoutWindow = useRef<Window | null>(null);

  const openPopoutWindow = (panelType: 'editor' | 'terminal' | 'ai' | 'git') => {
    const features = 'width=800,height=600,menubar=no,toolbar=no,location=no,status=no';
    const url = `${window.location.origin}${window.location.pathname}?popout=${panelType}`;
    popoutWindow.current = window.open(url, `${panelType}_window`, features);
    addTerminalLine(`Opened ${panelType} in new window`, 'success');
  };

  // Default code snippet for demo
  const defaultCodeSnippet = `import { Controller, Platform } from '@devstudio/core';

// Initialize multi-platform handler
export class MainController {
  private targetPlatform: Platform;

  constructor() {
    this.targetPlatform = Platform.current();
  }
}`;

  // Initialize Google Drive connection
  useEffect(() => {
    const unsubscribe = googleDriveService.onSyncStatusChange((status) => {
      setSyncStatus(status);
      setDriveConnected(status.connected);
    });

    return () => unsubscribe();
  }, []);

  // Load user info when connected
  useEffect(() => {
    if (driveConnected) {
      loadUserInfo();
      loadProjects();
      if (driveView === 'drive') {
        loadDriveFolder();
      }
    } else {
      setUserInfo(null);
      setDriveFiles([]);
      setDriveFolderFiles([]);
      setDrivePath([]);
    }
  }, [driveConnected, driveView]);

  useEffect(() => {
    if (syncStatus.error && syncStatus.error !== lastDriveError) {
      addTerminalLine(syncStatus.error, 'error');
      setLastDriveError(syncStatus.error);
    }
  }, [syncStatus.error, lastDriveError]);

  const loadUserInfo = async () => {
    const info = await googleDriveService.getUserInfo();
    setUserInfo(info);
  };

  const loadProjects = async () => {
    addTerminalLine('Fetching projects from Google Drive...');
    const projects = await googleDriveService.listProjects();
    setDriveFiles(projects);
    addTerminalLine(`Found ${projects.length} project(s) on Google Drive`);
  };

  const loadDriveFolder = async (folderId?: string) => {
    setDriveLoading(true);
    const files = await googleDriveService.listDriveFolder(folderId);
    setDriveFolderFiles(files);
    setDriveLoading(false);
  };

  const openDriveFolder = async (folder: DriveFile) => {
    setDrivePath(prev => [...prev, folder]);
    await loadDriveFolder(folder.id);
  };

  const goToDriveRoot = async () => {
    setDrivePath([]);
    await loadDriveFolder();
  };

  const jumpToDriveFolder = async (index: number) => {
    const nextPath = drivePath.slice(0, index + 1);
    setDrivePath(nextPath);
    const folderId = nextPath[nextPath.length - 1]?.id;
    await loadDriveFolder(folderId);
  };

  const connectDrive = async () => {
    addTerminalLine('Connecting to Google Drive...');
    const success = await googleDriveService.connect();
    if (success) {
      addTerminalLine('Successfully connected to Google Drive!', 'success');
      if (driveView === 'drive') {
        loadDriveFolder();
      }
    } else {
      addTerminalLine('Failed to connect to Google Drive', 'error');
    }
  };

  const disconnectDrive = () => {
    googleDriveService.disconnect();
    setCurrentProject(null);
    setProjectFiles([]);
    setDriveFolderFiles([]);
    setDrivePath([]);
    addTerminalLine('Disconnected from Google Drive');
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreatingProject(true);
    addTerminalLine(`Creating project: ${newProjectName}...`);

    const project = await googleDriveService.createProject(newProjectName);
    if (project) {
      addTerminalLine(`Project "${newProjectName}" created successfully!`, 'success');
      setNewProjectName('');
      loadProjects();
    } else {
      const errorMessage = googleDriveService.getSyncStatus().error || 'Failed to create project';
      addTerminalLine(errorMessage, 'error');
    }
    setIsCreatingProject(false);
  };

  const openProject = async (project: DriveFile) => {
    setCurrentProject(project);
    addTerminalLine(`Opening project: ${project.name}...`);

    const files = await googleDriveService.listFiles(project.id);
    const fileNodes = files.map(f => ({
      id: f.id,
      name: f.name,
      type: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      mimeType: f.mimeType,
      driveFile: f,
    } as FileNode));

    setProjectFiles(fileNodes);
    addTerminalLine(`Loaded ${files.length} file(s) from project`, 'success');
  };

  const openDriveItem = async (item: DriveFile) => {
    if (item.mimeType === 'application/vnd.google-apps.folder') {
      await openDriveFolder(item);
      return;
    }

    await openFile({
      id: item.id,
      name: item.name,
      type: 'file',
      mimeType: item.mimeType,
      driveFile: item,
    });
  };

  // Helper to get language from filename
  const getLanguageFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      json: 'json', css: 'css', scss: 'scss', html: 'html', md: 'markdown',
      py: 'python', rs: 'rust', go: 'go', yaml: 'yaml', yml: 'yaml',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  // Recursively load Drive folder into workspace format
  const loadDriveFolderRecursive = async (
    folderId: string,
    basePath: string
  ): Promise<WorkspaceFileNode[]> => {
    const items = await googleDriveService.listFiles(folderId);
    const nodes: WorkspaceFileNode[] = [];

    for (const item of items) {
      const itemPath = `${basePath}/${item.name}`;
      const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

      if (isFolder) {
        // Recursively load subfolder
        const children = await loadDriveFolderRecursive(item.id, itemPath);
        nodes.push({
          name: item.name,
          path: itemPath,
          type: 'folder',
          children,
        });
      } else {
        // Load file content
        let content = '';
        try {
          const fileContent = await googleDriveService.readFile(item.id);
          content = fileContent || '';
        } catch (e) {
          console.warn(`Could not read file ${item.name}:`, e);
        }

        nodes.push({
          name: item.name,
          path: itemPath,
          type: 'file',
          content,
          language: getLanguageFromFilename(item.name),
        });
      }
    }

    return nodes;
  };

  // Open any Drive folder as an active project - loads into entire IDE
  const openFolderAsProject = async (folder: DriveFile) => {
    if (folder.mimeType !== 'application/vnd.google-apps.folder') {
      addTerminalLine('Cannot open file as project - select a folder', 'error');
      return;
    }

    setIsLoadingProject(true);
    setCurrentProject(folder);
    addTerminalLine(`Opening project: ${folder.name}...`);
    addTerminalLine('Loading files from Google Drive (this may take a moment)...');

    try {
      // Recursively load all files with content
      const workspaceFiles = await loadDriveFolderRecursive(folder.id, '');

      // Update the workspace context - this updates the entire IDE
      workspace.setActiveDriveFolderId(folder.id);
      workspace.replaceWorkspace(workspaceFiles);

      // Also update local state for display
      const files = await googleDriveService.listFiles(folder.id);
      const fileNodes = files.map(f => ({
        id: f.id,
        name: f.name,
        type: f.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
        mimeType: f.mimeType,
        driveFile: f,
      } as FileNode));
      setProjectFiles(fileNodes);

      // Count total files
      const countFiles = (nodes: WorkspaceFileNode[]): number => {
        return nodes.reduce((acc, n) => {
          if (n.type === 'file') return acc + 1;
          return acc + countFiles(n.children || []);
        }, 0);
      };
      const totalFiles = countFiles(workspaceFiles);

      setShowDrivePanel(false);
      addTerminalLine(`Project "${folder.name}" loaded with ${totalFiles} file(s)`, 'success');
      addTerminalLine('Files are now available in the Explorer panel');
    } catch (error: any) {
      addTerminalLine(`Failed to load project: ${error.message}`, 'error');
    } finally {
      setIsLoadingProject(false);
    }
  };

  // Toggle terminal visibility with proper re-mount
  const toggleTerminal = () => {
    if (showTerminal) {
      setShowTerminal(false);
    } else {
      // Increment key to force re-mount
      terminalKey.current += 1;
      setShowTerminal(true);
    }
  };

  // Panel management
  const togglePanel = (panelId: string) => {
    setPanels(prev => prev.map(p =>
      p.id === panelId ? { ...p, isVisible: !p.isVisible } : p
    ));
    // Special handling for terminal
    if (panelId === 'terminal') {
      const terminalPanel = panels.find(p => p.id === 'terminal');
      if (terminalPanel?.isVisible) {
        setShowTerminal(false);
      } else {
        terminalKey.current += 1;
        setShowTerminal(true);
      }
    }
  };

  // GitHub integration functions
  const connectGitHub = async () => {
    if (!githubToken.trim()) {
      addTerminalLine('Please enter a GitHub personal access token', 'error');
      return;
    }
    try {
      addTerminalLine('Connecting to GitHub...');
      const user = await githubService.connect(githubToken);
      setGithubUser(user);
      setGithubConnected(true);
      addTerminalLine(`Connected as ${user.login}`, 'success');
    } catch (error: any) {
      addTerminalLine(`GitHub connection failed: ${error.message}`, 'error');
    }
  };

  const disconnectGitHub = () => {
    githubService.disconnect();
    setGithubConnected(false);
    setGithubUser(null);
    setGithubRepo(null);
    setGithubBranches([]);
    addTerminalLine('Disconnected from GitHub');
  };

  const setRepository = async () => {
    if (!repoInput.includes('/')) {
      addTerminalLine('Enter repo in format: owner/name', 'error');
      return;
    }
    const [owner, name] = repoInput.split('/');
    try {
      addTerminalLine(`Setting repository: ${repoInput}...`);
      const repo = await githubService.setRepo(owner, name);
      setGithubRepo(repo);
      const branches = await githubService.listBranches(owner, name);
      setGithubBranches(branches);
      setCurrentBranch(repo.defaultBranch);
      addTerminalLine(`Repository set: ${repo.owner}/${repo.name}`, 'success');
    } catch (error: any) {
      addTerminalLine(`Failed to set repository: ${error.message}`, 'error');
    }
  };

  const commitChanges = async () => {
    if (!githubRepo || !commitMessage.trim()) {
      addTerminalLine('Repository and commit message required', 'error');
      return;
    }
    if (gitChanges.length === 0) {
      addTerminalLine('No changes to commit', 'error');
      return;
    }

    try {
      addTerminalLine(`Committing ${gitChanges.length} file(s)...`);
      for (const filePath of gitChanges) {
        const content = openFiles.get(filePath);
        if (content !== undefined) {
          await githubService.updateFile(
            githubRepo.owner,
            githubRepo.name,
            filePath,
            content,
            commitMessage,
            currentBranch
          );
        }
      }
      setGitChanges([]);
      setCommitMessage('');
      addTerminalLine('Changes committed successfully!', 'success');
    } catch (error: any) {
      addTerminalLine(`Commit failed: ${error.message}`, 'error');
    }
  };

  // Track file changes for git
  const markFileChanged = (fileName: string) => {
    setGitChanges(prev => prev.includes(fileName) ? prev : [...prev, fileName]);
  };

  // CLI LLM integration
  const runLLMCommand = async (action: string) => {
    if (!activeFileContent) {
      addTerminalLine('No file content to analyze', 'error');
      return;
    }

    setLlmLoading(true);
    const prompts: Record<string, string> = {
      explain: 'Explain this code concisely:',
      fix: 'Identify and fix bugs in this code:',
      optimize: 'Optimize this code for performance:',
      refactor: 'Refactor this code for better readability:',
    };

    const prompt = prompts[action] || action;
    setLlmPrompt(prompt);

    // Simulate LLM response (replace with actual API call)
    addTerminalLine(`Running AI ${action}...`);
    setTimeout(() => {
      const mockResponses: Record<string, string> = {
        explain: `This code defines a ${activeTab.includes('Controller') ? 'controller class' : 'module'} that handles platform-specific initialization. It uses a constructor pattern to set the target platform based on the current runtime environment.`,
        fix: 'No critical bugs found. Consider adding error handling for the Platform.current() call in case it fails.',
        optimize: 'The code is already well-optimized. Consider lazy-loading the platform detection if not immediately needed.',
        refactor: 'Consider using dependency injection for the Platform instance to improve testability.',
      };
      setLlmResponse(mockResponses[action] || 'Analysis complete.');
      setLlmLoading(false);
      addTerminalLine(`AI ${action} complete`, 'success');
    }, 1500);
  };

  const runCustomLLMPrompt = async () => {
    if (!llmPrompt.trim()) return;
    setLlmLoading(true);
    addTerminalLine('Processing custom prompt...');
    setTimeout(() => {
      setLlmResponse(`Based on your prompt "${llmPrompt.slice(0, 50)}...", here's my analysis:\n\nThe code structure follows standard patterns. Consider implementing additional error boundaries and type guards for improved reliability.`);
      setLlmLoading(false);
      addTerminalLine('Custom prompt complete', 'success');
    }, 2000);
  };

  const openFile = async (file: FileNode) => {
    if (file.type === 'folder') return;

    addTerminalLine(`Reading file: ${file.name}...`);
    const content = await googleDriveService.readFile(file.id);

    if (content !== null) {
      setOpenFiles(prev => new Map(prev).set(file.name, content));
      setActiveTab(file.name);
      setActiveFileContent(content);
      addTerminalLine(`File loaded: ${file.name}`, 'success');
    } else {
      addTerminalLine(`Failed to read file: ${file.name}`, 'error');
    }
  };

  const saveCurrentFile = async () => {
    if (!currentProject) return;

    const file = projectFiles.find(f => f.name === activeTab);
    if (!file) return;

    addTerminalLine(`Saving ${activeTab}...`);
    const success = await googleDriveService.updateFile(file.id, activeFileContent);

    if (success) {
      setOpenFiles(prev => new Map(prev).set(activeTab, activeFileContent));
      addTerminalLine(`Saved ${activeTab}`, 'success');
    } else {
      addTerminalLine(`Failed to save ${activeTab}`, 'error');
    }
  };

  const createNewFile = async (name: string) => {
    if (!currentProject) return;

    addTerminalLine(`Creating file: ${name}...`);
    const file = await googleDriveService.createFile(name, '', currentProject.id);

    if (file) {
      addTerminalLine(`Created ${name}`, 'success');
      openProject(currentProject);
    } else {
      addTerminalLine(`Failed to create ${name}`, 'error');
    }
  };

  const addTerminalLine = (text: string, type?: 'success' | 'error') => {
    const prefix = type === 'success' ? '[OK] ' : type === 'error' ? '[ERROR] ' : '';
    setTerminalOutput(prev => [...prev.slice(-50), prefix + text]);
  };

  const formatSyncTime = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  const getFileIcon = (name: string, mimeType?: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'code';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
    if (name.endsWith('.css') || name.endsWith('.scss')) return 'description';
    if (name.endsWith('.json')) return 'settings';
    if (name.endsWith('.md')) return 'article';
    return 'insert_drive_file';
  };

  const getFileIconColor = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'text-blue-400';
    if (name.endsWith('.js') || name.endsWith('.jsx')) return 'text-yellow-400';
    if (name.endsWith('.css') || name.endsWith('.scss')) return 'text-pink-400';
    if (name.endsWith('.json')) return 'text-orange-400';
    return 'text-gray-400';
  };

  const codeToDisplay = workspace.activeFile
    ? (workspace.getFileContent(workspace.activeFile) || defaultCodeSnippet)
    : (openFiles.get(activeTab) || defaultCodeSnippet);

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
            <button
              onClick={() => setShowDrivePanel(!showDrivePanel)}
              className={`text-[12px] font-medium transition-colors flex items-center gap-1 ${showDrivePanel ? 'text-indigo-400' : 'hover:text-white'}`}
            >
              <span className="material-symbols-rounded text-[14px]">cloud</span>
              Drive
            </button>
            <div className="relative group">
              <button className="text-[12px] font-medium transition-colors flex items-center gap-1 hover:text-white">
                <span className="material-symbols-rounded text-[14px]">open_in_new</span>
                Popout
              </button>
              <div className="absolute top-full left-0 mt-1 bg-[#1c1e2d] border border-[#282b39] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
                <button
                  onClick={() => openPopoutWindow('editor')}
                  className="w-full px-3 py-2 text-left text-[11px] text-[#9da1b9] hover:text-white hover:bg-[#282b39] flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-[14px]">code</span>
                  Editor Window
                </button>
                <button
                  onClick={() => openPopoutWindow('terminal')}
                  className="w-full px-3 py-2 text-left text-[11px] text-[#9da1b9] hover:text-white hover:bg-[#282b39] flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-[14px]">terminal</span>
                  Terminal Window
                </button>
                <button
                  onClick={() => openPopoutWindow('ai')}
                  className="w-full px-3 py-2 text-left text-[11px] text-[#9da1b9] hover:text-white hover:bg-[#282b39] flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-[14px]">smart_toy</span>
                  AI Assistant
                </button>
                <button
                  onClick={() => openPopoutWindow('git')}
                  className="w-full px-3 py-2 text-left text-[11px] text-[#9da1b9] hover:text-white hover:bg-[#282b39] flex items-center gap-2"
                >
                  <span className="material-symbols-rounded text-[14px]">merge</span>
                  Git Panel
                </button>
              </div>
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* Google Drive Status */}
          {driveConnected && userInfo && (
            <div className="flex items-center gap-2 bg-[#161825] border border-green-500/30 px-2 py-1 rounded-md">
              {userInfo.photoUrl && (
                <img src={userInfo.photoUrl} alt="" className="w-5 h-5 rounded-full" />
              )}
              <span className="text-[11px] text-green-400">{userInfo.email}</span>
            </div>
          )}
          <div className="flex items-center bg-[#161825] border border-[#282b39] rounded-md px-3 py-1 gap-2 w-64">
            <span className="material-symbols-rounded text-[16px] text-[#5f637a]">search</span>
            <input
              className="bg-transparent border-none focus:outline-none text-[12px] w-full p-0 placeholder-[#5f637a] text-white"
              placeholder="Global Search (Ctrl+P)"
            />
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/5 rounded-md text-[#9da1b9] transition-colors"><span className="material-symbols-rounded text-[18px]">account_circle</span></button>
            <button className="p-1.5 hover:bg-white/5 rounded-md text-[#9da1b9] transition-colors relative">
              <span className="material-symbols-rounded text-[18px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={saveCurrentFile}
              className="ml-2 px-3 py-1 bg-indigo-600 text-white text-[12px] font-bold rounded-md hover:bg-indigo-500 flex items-center gap-2 transition-colors"
            >
              <span>Save</span>
              <span className="material-symbols-rounded text-[14px]">save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Build Targets Bar */}
      <div className="flex-none bg-[#090a11] border-b border-[#282b39] px-4 py-1.5 flex items-center gap-4 overflow-x-auto">
        <div className="flex items-center gap-2 border-r border-[#282b39] pr-4">
          <span className="text-[10px] text-[#5f637a] uppercase font-bold tracking-widest">Storage</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Drive Connection */}
          {driveConnected ? (
            <div className="flex items-center gap-2.5 bg-[#161825] border border-green-500/30 px-2.5 py-1 rounded">
              <span className="material-symbols-rounded text-green-500 text-[18px]">cloud_done</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none text-white">Google Drive</span>
                <span className="text-[9px] text-green-400 font-medium">
                  {syncStatus.syncInProgress ? 'Syncing...' : 'Connected'}
                </span>
              </div>
              {userInfo?.storageQuota && (
                <div className="text-[9px] text-[#9da1b9] border-l border-[#282b39] pl-2 ml-1">
                  {googleDriveService.formatBytes(userInfo.storageQuota.usage)} / {googleDriveService.formatBytes(userInfo.storageQuota.limit)}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectDrive}
              className="flex items-center gap-2.5 bg-[#161825] border border-[#282b39] px-2.5 py-1 rounded hover:border-indigo-500 transition-colors"
            >
              <span className="material-symbols-rounded text-[#9da1b9] text-[18px]">cloud_off</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none text-white">Google Drive</span>
                <span className="text-[9px] text-indigo-400 font-medium">Click to Connect</span>
              </div>
            </button>
          )}

          {/* Current Project */}
          {currentProject && (
            <div className="flex items-center gap-2.5 bg-[#161825] border border-indigo-500/30 px-2.5 py-1 rounded">
              <span className="material-symbols-rounded text-indigo-400 text-[18px]">folder_open</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold leading-none text-white">{currentProject.name}</span>
                <span className="text-[9px] text-indigo-400 font-medium">{projectFiles.length} files</span>
              </div>
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right border-l border-[#282b39] pl-4">
            <div className="text-[9px] text-[#5f637a] leading-none mb-1 uppercase">Last Sync</div>
            <div className="text-[10px] text-white font-mono leading-none">{formatSyncTime(syncStatus.lastSync)}</div>
          </div>
          <button onClick={loadProjects} className="p-1 text-[#5f637a] hover:text-white">
            <span className="material-symbols-rounded text-[18px]">refresh</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <aside className="w-12 flex-none flex flex-col items-center py-4 bg-[#0d0e15] border-r border-[#282b39] gap-6">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setShowDrivePanel(false)}
              className={`p-2 rounded-md transition-colors ${!showDrivePanel ? 'text-white bg-indigo-500/10 text-indigo-500 border-r-2 border-indigo-500' : 'text-[#5f637a] hover:text-white'}`}
            >
              <span className="material-symbols-rounded text-[24px]">folder</span>
            </button>
            <button
              onClick={() => setShowDrivePanel(true)}
              className={`p-2 rounded-md transition-colors relative ${showDrivePanel ? 'text-white bg-indigo-500/10 text-indigo-500 border-r-2 border-indigo-500' : 'text-[#5f637a] hover:text-white'}`}
            >
              <span className="material-symbols-rounded text-[24px]">cloud</span>
              {driveConnected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-[#0d0e15]"></span>
              )}
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
            <button
              onClick={toggleTerminal}
              className={`p-2 transition-colors ${showTerminal ? 'text-emerald-400' : 'text-[#5f637a] hover:text-white'}`}
              title={showTerminal ? 'Hide Terminal' : 'Show Terminal'}
            >
              <span className="material-symbols-rounded text-[24px]">terminal</span>
            </button>
            <button
              onClick={() => togglePanel('git')}
              className={`p-2 transition-colors relative ${panels.find(p => p.id === 'git')?.isVisible ? 'text-orange-400' : 'text-[#5f637a] hover:text-white'}`}
              title="Toggle Git Panel"
            >
              <span className="material-symbols-rounded text-[24px]">merge</span>
              {githubConnected && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-[#0d0e15]"></span>
              )}
            </button>
            <button
              onClick={() => setSplitView(!splitView)}
              className={`p-2 transition-colors ${splitView ? 'text-indigo-400' : 'text-[#5f637a] hover:text-white'}`}
              title="Toggle Split View"
            >
              <span className="material-symbols-rounded text-[24px]">view_column_2</span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[24px]">extension</span>
            </button>
            <button className="p-2 text-[#5f637a] hover:text-white transition-colors">
              <span className="material-symbols-rounded text-[24px]">settings</span>
            </button>
          </div>
        </aside>

        {/* Explorer / Drive Panel */}
        <nav className="w-60 flex-none bg-[#111218] border-r border-[#282b39] flex flex-col">
          <div className="h-10 flex items-center justify-between px-4 border-b border-[#282b39]">
            <span className="text-[11px] font-bold text-[#9da1b9] uppercase tracking-wider">
              {showDrivePanel ? 'Google Drive' : 'Explorer'}
            </span>
            {currentProject && !showDrivePanel && (
              <button
                onClick={() => createNewFile(prompt('File name:') || '')}
                className="material-symbols-rounded text-[16px] text-[#5f637a] cursor-pointer hover:text-white"
              >
                note_add
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-[12px]">
            {showDrivePanel ? (
              // Google Drive Panel
              <div className="flex flex-col gap-2">
                {!driveConnected ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-rounded text-[48px] text-[#5f637a] mb-4 block">cloud_off</span>
                    <p className="text-[#5f637a] text-[11px] mb-4">Connect to Google Drive to store your projects</p>
                    <button
                      onClick={connectDrive}
                      className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded hover:bg-indigo-500 transition-colors"
                    >
                      Connect Google Drive
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-2 flex items-center gap-1 px-2 text-[10px] uppercase font-bold">
                      <button
                        onClick={() => setDriveView('projects')}
                        className={`px-2 py-1 rounded ${driveView === 'projects' ? 'bg-indigo-500/20 text-indigo-300' : 'text-[#5f637a] hover:text-white'}`}
                      >
                        Projects
                      </button>
                      <button
                        onClick={() => setDriveView('drive')}
                        className={`px-2 py-1 rounded ${driveView === 'drive' ? 'bg-indigo-500/20 text-indigo-300' : 'text-[#5f637a] hover:text-white'}`}
                      >
                        My Drive
                      </button>
                    </div>

                    {driveView === 'projects' ? (
                      <>
                        {/* Create Project */}
                        <div className="mb-2 p-2 bg-[#0d0e15] rounded border border-[#282b39]">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              placeholder="New project name..."
                              className="flex-1 bg-[#161825] border border-[#282b39] rounded px-2 py-1 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500"
                              onKeyDown={(e) => e.key === 'Enter' && createProject()}
                            />
                            <button
                              onClick={createProject}
                              disabled={isCreatingProject || !newProjectName.trim()}
                              className="px-2 py-1 bg-indigo-600 text-white text-[10px] rounded hover:bg-indigo-500 disabled:opacity-50"
                            >
                              <span className="material-symbols-rounded text-[14px]">add</span>
                            </button>
                          </div>
                        </div>

                        {/* Projects List */}
                        <div className="text-[10px] text-[#5f637a] uppercase font-bold mb-1 px-2">Projects (click to open)</div>
                        {driveFiles.length === 0 ? (
                          <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                            No projects yet. Create one above!
                          </div>
                        ) : (
                          driveFiles.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => openFolderAsProject(project)}
                              className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors ${currentProject?.id === project.id
                                  ? 'bg-indigo-500/20 text-white border-l-2 border-indigo-500'
                                  : 'text-[#9da1b9] hover:text-white hover:bg-[#161825]'
                                }`}
                            >
                              <span className="flex items-center gap-2 flex-1 truncate">
                                <span className="material-symbols-rounded text-[16px] text-yellow-400">folder</span>
                                <span className="truncate">{project.name}</span>
                              </span>
                              <span className="material-symbols-rounded text-[14px] text-indigo-400">folder_open</span>
                            </div>
                          ))
                        )}
                      </>
                    ) : (
                      <>
                        <div className="px-2 py-1 text-[10px] text-[#9da1b9] flex items-center flex-wrap gap-1">
                          <button
                            onClick={goToDriveRoot}
                            className="text-indigo-300 hover:text-white"
                          >
                            My Drive
                          </button>
                          {drivePath.map((folder, index) => (
                            <div key={folder.id} className="flex items-center gap-1">
                              <span className="text-[#3b3f52]">/</span>
                              <button
                                onClick={() => jumpToDriveFolder(index)}
                                className="hover:text-white text-[#9da1b9]"
                              >
                                {folder.name}
                              </button>
                            </div>
                          ))}
                        </div>
                        {/* Open Current Folder as Project Button */}
                        {drivePath.length > 0 && (
                          <div className="px-2 py-2">
                            <button
                              onClick={() => openFolderAsProject(drivePath[drivePath.length - 1])}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded hover:bg-indigo-500 transition-colors"
                            >
                              <span className="material-symbols-rounded text-[16px]">folder_open</span>
                              Open "{drivePath[drivePath.length - 1].name}" as Project
                            </button>
                          </div>
                        )}
                        {driveLoading ? (
                          <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                            Loading Drive...
                          </div>
                        ) : driveFolderFiles.length === 0 ? (
                          <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                            This folder is empty.
                          </div>
                        ) : (
                          driveFolderFiles.map((item) => {
                            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
                            return (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors text-[#9da1b9] hover:text-white hover:bg-[#161825]"
                              >
                                <span
                                  className="flex items-center gap-2 flex-1 truncate"
                                  onClick={() => openDriveItem(item)}
                                >
                                  <span className={`material-symbols-rounded text-[16px] ${isFolder ? 'text-yellow-400' : getFileIconColor(item.name)}`}>
                                    {getFileIcon(item.name, item.mimeType)}
                                  </span>
                                  <span className="truncate">{item.name}</span>
                                </span>
                                {isFolder && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openFolderAsProject(item); }}
                                    className="p-1 hover:bg-indigo-500/20 rounded text-indigo-400 hover:text-indigo-300"
                                    title="Open folder as active project"
                                  >
                                    <span className="material-symbols-rounded text-[14px]">folder_open</span>
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </>
                    )}

                    {/* Disconnect */}
                    <div className="mt-4 pt-4 border-t border-[#282b39]">
                      <button
                        onClick={disconnectDrive}
                        className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-[11px] text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <span className="material-symbols-rounded text-[14px]">logout</span>
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Explorer Panel - Shows workspace files
              <div className="flex flex-col gap-0.5">
                {isLoadingProject ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[11px] text-[#9da1b9]">Loading project files...</span>
                  </div>
                ) : currentProject ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1 text-white bg-white/5 rounded-sm cursor-pointer mb-1">
                      <span className="material-symbols-rounded text-[16px] text-yellow-400">folder_open</span>
                      <span className="font-bold">{currentProject.name}</span>
                    </div>
                    {/* Render workspace files from context */}
                    <FileExplorer hideHeader hideProjectName className="flex-1" />
                    {workspace.files.length === 0 && (
                      <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                        Empty project. Create a file to get started.
                      </div>
                    )}
                  </>
                ) : (
                  // Show workspace files even without Drive project
                  <>
                    {workspace.files.length > 0 ? (
                      <FileExplorer hideHeader hideProjectName className="flex-1" />
                    ) : (
                      <div className="text-[10px] text-[#5f637a] px-2 py-4 text-center">
                        Connect to Google Drive and open a project to edit files
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col bg-[#090a11] min-w-0">
          <div className="h-10 flex-none flex items-center bg-[#0d0e15] border-b border-[#282b39] overflow-x-auto">
            {/* Workspace open files tabs */}
            {workspace.openFiles.length > 0 ? (
              workspace.openFiles.map(filePath => {
                const fileName = filePath.split('/').pop() || filePath;
                const isActive = workspace.activeFile === filePath;
                return (
                  <div
                    key={filePath}
                    className={`h-full flex items-center px-4 border-r border-[#282b39] border-t-2 text-[12px] font-medium gap-2 min-w-fit cursor-pointer ${isActive ? 'bg-[#111218] border-t-indigo-500 text-white' : 'border-t-transparent text-[#9da1b9] hover:bg-[#161825]'}`}
                    onClick={() => {
                      workspace.setActiveFile(filePath);
                      setActiveTab(fileName);
                    }}
                  >
                    <span className={`material-symbols-rounded text-[14px] ${getFileIconColor(fileName)}`}>{getFileIcon(fileName)}</span>
                    {fileName}
                    {workspace.unsavedFiles.has(filePath) && <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>}
                    <span
                      className="material-symbols-rounded text-[14px] hover:bg-white/10 rounded p-0.5 ml-1"
                      onClick={(e) => { e.stopPropagation(); workspace.closeFile(filePath); }}
                    >
                      close
                    </span>
                  </div>
                );
              })
            ) : (
              <div
                className="h-full flex items-center px-4 border-r border-[#282b39] border-t-2 border-t-indigo-500 bg-[#111218] text-[12px] font-medium gap-2 min-w-fit cursor-pointer text-white"
              >
                <span className="material-symbols-rounded text-[14px] text-blue-400">code</span>
                Welcome
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 border-r border-[#282b39]">
              <div className="flex-1 overflow-auto p-4 font-mono text-[13px] relative bg-[#111218]">
                <div className="absolute left-0 top-4 bottom-0 w-10 flex flex-col items-end pr-2 text-[#4b5064] select-none">
                  {codeToDisplay.split('\n').map((_, i) => (
                    <div key={i} className={i === 5 ? 'text-indigo-500 font-bold' : ''}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={workspace.activeFile ? (workspace.getFileContent(workspace.activeFile) || '') : codeToDisplay}
                  onChange={(e) => {
                    if (workspace.activeFile) {
                      workspace.updateFileContent(workspace.activeFile, e.target.value);
                      markFileChanged(workspace.activeFile.split('/').pop() || '');
                    } else {
                      setActiveFileContent(e.target.value);
                    }
                  }}
                  className="pl-8 w-full h-full bg-transparent text-[#d4d4d4] leading-6 resize-none focus:outline-none font-mono"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Right Side: AI Assistant / Git Panel */}
            <div className={`${splitView ? 'w-1/2' : 'w-1/3'} flex-none bg-[#161825] flex flex-col border-l border-[#282b39] overflow-hidden`}>
              {/* Panel Tabs */}
              <div className="flex border-b border-[#282b39] bg-[#1c1e2d]">
                <button
                  onClick={() => togglePanel('ai')}
                  className={`flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 ${panels.find(p => p.id === 'ai')?.isVisible ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-[#5f637a] hover:text-white'}`}
                >
                  AI Assistant
                </button>
                <button
                  onClick={() => togglePanel('git')}
                  className={`flex-1 px-4 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 ${panels.find(p => p.id === 'git')?.isVisible ? 'border-orange-500 text-orange-400' : 'border-transparent text-[#5f637a] hover:text-white'}`}
                >
                  GitHub
                </button>
              </div>

              {panels.find(p => p.id === 'ai')?.isVisible && (
                <>
                  <div className="p-4 border-b border-[#282b39] bg-[#1c1e2d]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">CLI LLM Assistant</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded border ${llmLoading ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {llmLoading ? 'Processing...' : 'Ready'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9da1b9]">Use AI to analyze, fix, or optimize your code</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Quick Actions</span>
                      </div>
                      <div className="bg-[#161825] border border-[#282b39] p-3 rounded-lg shadow-sm grid grid-cols-2 gap-2">
                        <button
                          onClick={() => runLLMCommand('explain')}
                          disabled={llmLoading}
                          className="py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                        >
                          Explain
                        </button>
                        <button
                          onClick={() => runLLMCommand('fix')}
                          disabled={llmLoading}
                          className="py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[11px] font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          Find Bugs
                        </button>
                        <button
                          onClick={() => runLLMCommand('optimize')}
                          disabled={llmLoading}
                          className="py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[11px] font-bold hover:bg-green-500/20 transition-colors disabled:opacity-50"
                        >
                          Optimize
                        </button>
                        <button
                          onClick={() => runLLMCommand('refactor')}
                          disabled={llmLoading}
                          className="py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[11px] font-bold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
                        >
                          Refactor
                        </button>
                      </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Custom Prompt</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={llmPrompt}
                          onChange={(e) => setLlmPrompt(e.target.value)}
                          placeholder="Ask AI anything about this code..."
                          className="flex-1 bg-[#0d0e15] border border-[#282b39] rounded px-2 py-1.5 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500"
                          onKeyDown={(e) => e.key === 'Enter' && runCustomLLMPrompt()}
                        />
                        <button
                          onClick={runCustomLLMPrompt}
                          disabled={llmLoading || !llmPrompt.trim()}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] rounded hover:bg-indigo-500 disabled:opacity-50"
                        >
                          Run
                        </button>
                      </div>
                    </div>

                    {/* LLM Response */}
                    {llmResponse && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">AI Response</span>
                        <div className="bg-[#0d0e15] border border-[#282b39] p-3 rounded-lg">
                          <p className="text-[11px] text-[#d4d4d4] leading-relaxed whitespace-pre-wrap">{llmResponse}</p>
                        </div>
                      </div>
                    )}

                    {driveConnected && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Drive Sync</span>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                          <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                            Files sync to Google Drive automatically when saved.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {panels.find(p => p.id === 'git')?.isVisible && (
                <>
                  <div className="p-4 border-b border-[#282b39] bg-[#1c1e2d]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">GitHub Integration</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded border ${githubConnected ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {githubConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {githubUser && <p className="text-[11px] text-[#9da1b9]">Signed in as {githubUser.login}</p>}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!githubConnected ? (
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Connect GitHub</span>
                        <input
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          placeholder="Personal access token..."
                          className="w-full bg-[#0d0e15] border border-[#282b39] rounded px-2 py-1.5 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={connectGitHub}
                          className="w-full py-2 bg-[#238636] text-white text-[11px] font-bold rounded hover:bg-[#2ea043] transition-colors"
                        >
                          Connect to GitHub
                        </button>
                        <p className="text-[10px] text-[#5f637a]">
                          Create a token at github.com/settings/tokens with repo scope.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Repository Selection */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Repository</span>
                          {githubRepo ? (
                            <div className="bg-[#0d0e15] border border-green-500/30 p-3 rounded-lg">
                              <div className="flex items-center gap-2 text-white text-[11px] font-bold">
                                <span className="material-symbols-rounded text-[16px] text-green-400">folder</span>
                                {githubRepo.owner}/{githubRepo.name}
                              </div>
                              <div className="text-[10px] text-[#9da1b9] mt-1">Branch: {currentBranch}</div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={repoInput}
                                onChange={(e) => setRepoInput(e.target.value)}
                                placeholder="owner/repo-name"
                                className="flex-1 bg-[#0d0e15] border border-[#282b39] rounded px-2 py-1.5 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={setRepository}
                                className="px-3 py-1.5 bg-[#238636] text-white text-[10px] rounded hover:bg-[#2ea043]"
                              >
                                Set
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Branches */}
                        {githubBranches.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Branches</span>
                            <select
                              value={currentBranch}
                              onChange={(e) => setCurrentBranch(e.target.value)}
                              className="w-full bg-[#0d0e15] border border-[#282b39] rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500"
                            >
                              {githubBranches.map(b => (
                                <option key={b.name} value={b.name}>{b.name}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Changes */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Changes ({gitChanges.length})</span>
                          {gitChanges.length > 0 ? (
                            <div className="bg-[#0d0e15] border border-[#282b39] p-2 rounded-lg space-y-1">
                              {gitChanges.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] text-yellow-400">
                                  <span className="material-symbols-rounded text-[14px]">edit</span>
                                  {file}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-[#5f637a]">No uncommitted changes</p>
                          )}
                        </div>

                        {/* Commit */}
                        {githubRepo && gitChanges.length > 0 && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={commitMessage}
                              onChange={(e) => setCommitMessage(e.target.value)}
                              placeholder="Commit message..."
                              className="w-full bg-[#0d0e15] border border-[#282b39] rounded px-2 py-1.5 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={commitChanges}
                              disabled={!commitMessage.trim()}
                              className="w-full py-2 bg-[#238636] text-white text-[11px] font-bold rounded hover:bg-[#2ea043] disabled:opacity-50 transition-colors"
                            >
                              Commit & Push
                            </button>
                          </div>
                        )}

                        {/* Disconnect */}
                        <button
                          onClick={disconnectGitHub}
                          className="w-full py-2 text-red-400 text-[11px] hover:bg-red-500/10 rounded transition-colors"
                        >
                          Disconnect GitHub
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Terminal Panel */}
          {showTerminal && (
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
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2 pr-2">
                  {showLogActions && (
                    <button
                      onClick={() => setTerminalOutput([])}
                      className="p-1 hover:bg-white/10 rounded text-[#5f637a]"
                      title="Clear logs"
                    >
                      <span className="material-symbols-rounded text-[18px]">delete</span>
                    </button>
                  )}
                  <button
                    onClick={toggleTerminal}
                    className="p-1 hover:bg-white/10 rounded text-[#5f637a]"
                    title="Close terminal (click Terminal icon to reopen)"
                  >
                    <span className="material-symbols-rounded text-[18px]">close</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeTerminalTab === 'Terminal' ? (
                  <Terminal key={terminalKey.current} className="h-full" initialMode="mock" />
                ) : activeTerminalTab === 'Git Status' ? (
                  <div className="h-full overflow-y-auto p-4 font-mono text-[12px] text-[#d4d4d4]">
                    <div className="mb-2 text-green-400">On branch: {currentBranch}</div>
                    {gitChanges.length > 0 ? (
                      <>
                        <div className="text-yellow-400 mb-2">Changes not staged for commit:</div>
                        {gitChanges.map((file, i) => (
                          <div key={i} className="text-red-400 pl-4">modified: {file}</div>
                        ))}
                      </>
                    ) : (
                      <div className="text-[#5f637a]">No changes to commit</div>
                    )}
                    {githubRepo && (
                      <div className="mt-4 border-t border-[#282b39] pt-4">
                        <div className="text-[#9da1b9] text-[10px] uppercase mb-2">Quick Commit</div>
                        <input
                          type="text"
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          placeholder="Commit message..."
                          className="w-full bg-[#161825] border border-[#282b39] rounded px-2 py-1 text-[11px] text-white placeholder-[#5f637a] focus:outline-none focus:border-indigo-500 mb-2"
                        />
                        <button
                          onClick={commitChanges}
                          disabled={!commitMessage.trim() || gitChanges.length === 0}
                          className="px-3 py-1 bg-green-600 text-white text-[10px] rounded hover:bg-green-500 disabled:opacity-50"
                        >
                          Commit Changes
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto p-4 font-mono text-[12px] text-[#d4d4d4]">
                    {terminalOutput.map((line, i) => (
                      <div
                        key={i}
                        className={`mb-1 ${line.startsWith('[OK]') ? 'text-green-400' :
                            line.startsWith('[ERROR]') ? 'text-red-400' : ''
                          }`}
                      >
                        {line.startsWith('[OK]') || line.startsWith('[ERROR]')
                          ? line
                          : <><span className="text-blue-400">~</span> {line}</>
                        }
                      </div>
                    ))}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-blue-400">~</span>
                      <span className="w-2 h-4 bg-indigo-500/60 animate-pulse"></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="flex-none h-6 bg-indigo-600 text-white flex items-center px-3 justify-between text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px]">
              {driveConnected ? 'cloud_done' : 'cloud_off'}
            </span>
            <span className="font-bold">{driveConnected ? 'Drive Connected' : 'Local Only'}</span>
          </div>
          {currentProject && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-rounded text-[14px]">folder</span>
              <span>{currentProject.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="material-symbols-rounded text-[14px]">close</span>
            <span>0</span>
            <span className="material-symbols-rounded text-[14px]">warning</span>
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80">Spaces: 2</span>
          <span className="opacity-80">UTF-8</span>
          <span className="font-bold">TypeScript React</span>
          <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded">
            <span className={`w-1.5 h-1.5 rounded-full ${driveConnected ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></span>
            <span>{driveConnected ? 'Cloud Sync Active' : 'Local Mode'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DesktopWorkspace;
