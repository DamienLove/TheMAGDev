import React, { useState, useEffect, useCallback } from 'react';
import { Terminal } from '../src/components/workspace';
import googleDriveService, { DriveFile, DriveSyncStatus, DriveUserInfo } from '../src/services/GoogleDriveService';

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

const DesktopWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('MainController.ts');
  const [activeTerminalTab, setActiveTerminalTab] = useState('Terminal');
  const showLogActions = activeTerminalTab !== 'Terminal';
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

  const codeToDisplay = openFiles.get(activeTab) || defaultCodeSnippet;

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
                        <div className="text-[10px] text-[#5f637a] uppercase font-bold mb-1 px-2">Projects</div>
                        {driveFiles.length === 0 ? (
                          <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                            No projects yet. Create one above!
                          </div>
                        ) : (
                          driveFiles.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => openProject(project)}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors ${
                                currentProject?.id === project.id
                                  ? 'bg-indigo-500/20 text-white border-l-2 border-indigo-500'
                                  : 'text-[#9da1b9] hover:text-white hover:bg-[#161825]'
                              }`}
                            >
                              <span className="material-symbols-rounded text-[16px] text-yellow-400">folder</span>
                              <span className="truncate">{project.name}</span>
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
                                onClick={() => openDriveItem(item)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors text-[#9da1b9] hover:text-white hover:bg-[#161825]"
                              >
                                <span className={`material-symbols-rounded text-[16px] ${isFolder ? 'text-yellow-400' : getFileIconColor(item.name)}`}>
                                  {getFileIcon(item.name, item.mimeType)}
                                </span>
                                <span className="truncate">{item.name}</span>
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
              // Local/Project Files
              <div className="flex flex-col gap-0.5">
                {currentProject ? (
                  <>
                    <div className="flex items-center gap-2 px-2 py-1 text-white bg-white/5 rounded-sm cursor-pointer mb-1">
                      <span className="material-symbols-rounded text-[16px] text-yellow-400">folder_open</span>
                      <span className="font-bold">{currentProject.name}</span>
                    </div>
                    {projectFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => openFile(file)}
                        className={`flex items-center gap-2 px-2 py-1 pl-4 rounded-sm cursor-pointer transition-colors ${
                          activeTab === file.name
                            ? 'text-white bg-indigo-500/20 border-l-2 border-indigo-500'
                            : 'text-[#9da1b9] hover:text-white hover:bg-[#161825]'
                        }`}
                      >
                        <span className={`material-symbols-rounded text-[16px] ${getFileIconColor(file.name)}`}>
                          {getFileIcon(file.name, file.mimeType)}
                        </span>
                        <span className="truncate">{file.name}</span>
                      </div>
                    ))}
                    {projectFiles.length === 0 && (
                      <div className="text-[11px] text-[#5f637a] px-2 py-4 text-center">
                        Empty project. Create a file to get started.
                      </div>
                    )}
                  </>
                ) : (
                  // Demo files when no project selected
                  <>
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
                    <div className="text-[10px] text-[#5f637a] px-2 py-4 text-center border-t border-[#282b39] mt-4">
                      Connect to Google Drive and open a project to edit files
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col bg-[#090a11] min-w-0">
          <div className="h-10 flex-none flex items-center bg-[#0d0e15] border-b border-[#282b39] overflow-x-auto">
            <div
              className={`h-full flex items-center px-4 border-r border-[#282b39] border-t-2 text-[12px] font-medium gap-2 min-w-fit cursor-pointer ${activeTab === 'MainController.ts' ? 'bg-[#111218] border-t-indigo-500 text-white' : 'border-t-transparent text-[#9da1b9] hover:bg-[#161825]'}`}
              onClick={() => setActiveTab('MainController.ts')}
            >
              <span className="material-symbols-rounded text-[14px] text-blue-400">code</span>
              MainController.ts
              <span className="material-symbols-rounded text-[14px] hover:bg-white/10 rounded p-0.5 ml-1">close</span>
            </div>
            {Array.from(openFiles.keys()).filter(name => name !== 'MainController.ts').map(name => (
              <div
                key={name}
                className={`h-full flex items-center px-4 border-r border-[#282b39] border-t-2 text-[12px] font-medium gap-2 min-w-fit cursor-pointer ${activeTab === name ? 'bg-[#111218] border-t-indigo-500 text-white' : 'border-t-transparent text-[#9da1b9] hover:bg-[#161825]'}`}
                onClick={() => {
                  setActiveTab(name);
                  setActiveFileContent(openFiles.get(name) || '');
                }}
              >
                <span className={`material-symbols-rounded text-[14px] ${getFileIconColor(name)}`}>{getFileIcon(name)}</span>
                {name}
                <span className="material-symbols-rounded text-[14px] hover:bg-white/10 rounded p-0.5 ml-1">close</span>
              </div>
            ))}
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
                  value={activeFileContent || codeToDisplay}
                  onChange={(e) => setActiveFileContent(e.target.value)}
                  className="pl-8 w-full h-full bg-transparent text-[#d4d4d4] leading-6 resize-none focus:outline-none font-mono"
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Right Side: AI Assistant */}
            <div className="w-1/3 flex-none bg-[#161825] flex flex-col border-l border-[#282b39] overflow-hidden">
              <div className="p-4 border-b border-[#282b39] bg-[#1c1e2d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">AI Assistant</span>
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded border border-green-500/20">Active</span>
                </div>
                <p className="text-[11px] text-[#9da1b9]">Ready to help with your code</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Quick Actions</span>
                  </div>
                  <div className="bg-[#161825] border border-[#282b39] p-3 rounded-lg shadow-sm space-y-2">
                    <button className="w-full py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold hover:bg-indigo-500/20 transition-colors">
                      Explain Code
                    </button>
                    <button className="w-full py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold hover:bg-indigo-500/20 transition-colors">
                      Find Bugs
                    </button>
                    <button className="w-full py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold hover:bg-indigo-500/20 transition-colors">
                      Optimize
                    </button>
                  </div>
                </div>
                {driveConnected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#5f637a] uppercase tracking-widest">Drive Sync</span>
                    </div>
                    <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                      <p className="text-[11px] text-[#d4d4d4] leading-relaxed">
                        Your files are being stored on Google Drive. Changes are saved automatically when you click Save.
                      </p>
                    </div>
                  </div>
                )}
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
                  </button>
                ))}
              </div>
              {showLogActions && (
                <div className="ml-auto flex items-center gap-2 pr-2">
                  <button
                    onClick={() => setTerminalOutput([])}
                    className="p-1 hover:bg-white/10 rounded text-[#5f637a]"
                    title="Clear logs"
                  >
                    <span className="material-symbols-rounded text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeTerminalTab === 'Terminal' ? (
                <Terminal className="h-full" initialMode="local" />
              ) : (
                <div className="h-full overflow-y-auto p-4 font-mono text-[12px] text-[#d4d4d4]">
                  {terminalOutput.map((line, i) => (
                    <div
                      key={i}
                      className={`mb-1 ${
                        line.startsWith('[OK]') ? 'text-green-400' :
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
