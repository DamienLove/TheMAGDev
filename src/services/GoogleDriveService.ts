// Google Drive Storage Service for TheMAG.dev Desktop Workspace
// Enables users to store and sync their projects on Google Drive

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime?: string;
  createdTime?: string;
  parents?: string[];
  webViewLink?: string;
  iconLink?: string;
}

export interface DriveFolder extends DriveFile {
  mimeType: 'application/vnd.google-apps.folder';
}

export interface DriveSyncStatus {
  connected: boolean;
  lastSync?: number;
  syncInProgress: boolean;
  totalFiles?: number;
  syncedFiles?: number;
  error?: string;
}

export interface DriveUserInfo {
  email: string;
  displayName: string;
  photoUrl?: string;
  storageQuota?: {
    limit: number;
    usage: number;
    usageInDrive: number;
  };
}

// Google API configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');
const ROOT_FOLDER_NAME = 'TheMAG.dev';
const SUBFOLDER_NAMES = {
  projects: 'Projects',
  extensions: 'Extensions',
  sdks: 'SDKs',
  plugins: 'Plugins',
  settings: 'Settings',
} as const;
const DEFAULT_PROJECT_NAME = 'Default Project';
const WORKSPACE_FILE_NAME = 'workspace.json';
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
const FOLDER_CACHE_KEY = 'themag_drive_folders';
const PROJECT_CACHE_KEY = 'themag_drive_projects';
const STORAGE_KEY = 'themag_gdrive_auth';

type SyncStatusListener = (status: DriveSyncStatus) => void;

class GoogleDriveService {
  private gisLoaded = false;
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private accessToken: string | null = null;
  private rootFolderId: string | null = null;
  private folderIds: Partial<Record<keyof typeof SUBFOLDER_NAMES, string>> = {};
  private projectFolderIds: Record<string, string> = {};
  private syncStatus: DriveSyncStatus = {
    connected: false,
    syncInProgress: false,
  };
  private listeners: Set<SyncStatusListener> = new Set();
  private fileCache: Map<string, DriveFile[]> = new Map();

  constructor() {
    this.loadSavedAuth();
    this.initializeGoogleAPI();
  }

  private setError(message: string) {
    this.syncStatus.error = message;
    this.notifyListeners();
  }

  private loadSavedAuth() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.accessToken && data.expiresAt > Date.now()) {
          this.accessToken = data.accessToken;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  private saveAuth(token: string, expiresIn: number) {
    this.accessToken = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accessToken: token,
      expiresAt: Date.now() + expiresIn * 1000,
    }));
  }

  private loadFolderCache() {
    const saved = localStorage.getItem(FOLDER_CACHE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { rootFolderId?: string; folderIds?: Record<string, string> };
      this.rootFolderId = parsed.rootFolderId || null;
      if (parsed.folderIds) {
        this.folderIds = parsed.folderIds as Partial<Record<keyof typeof SUBFOLDER_NAMES, string>>;
      }
    } catch {
      localStorage.removeItem(FOLDER_CACHE_KEY);
    }

    const projects = localStorage.getItem(PROJECT_CACHE_KEY);
    if (projects) {
      try {
        this.projectFolderIds = JSON.parse(projects) as Record<string, string>;
      } catch {
        localStorage.removeItem(PROJECT_CACHE_KEY);
      }
    }
  }

  private saveFolderCache() {
    localStorage.setItem(FOLDER_CACHE_KEY, JSON.stringify({
      rootFolderId: this.rootFolderId,
      folderIds: this.folderIds,
    }));
    localStorage.setItem(PROJECT_CACHE_KEY, JSON.stringify(this.projectFolderIds));
  }

  private async initializeGoogleAPI(): Promise<void> {
    // Load Google Identity Services for OAuth
    await this.loadScript('https://accounts.google.com/gsi/client');

    // Initialize Google Identity Services
    if (GOOGLE_CLIENT_ID) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            this.saveAuth(response.access_token, response.expires_in);
            this.syncStatus.connected = true;
            this.syncStatus.error = undefined;
            this.notifyListeners();
            this.loadFolderCache();
            this.ensureRootStructure().catch((error) => {
              this.setError(error instanceof Error ? error.message : 'Failed to initialize Drive folders.');
            });
            return;
          }
          if (response.error) {
            const errorMessage = response.error_description || response.error;
            this.setError(`Google Drive auth failed: ${errorMessage}`);
          }
        },
      });
      this.gisLoaded = true;
    } else {
      this.setError('Google Client ID missing. Check VITE_GOOGLE_CLIENT_ID.');
    }

    // If we have a saved token, validate it
    if (this.accessToken) {
      await this.validateToken();
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private escapeQueryValue(value: string): string {
    return value.replace(/'/g, "\\'");
  }

  private async driveRequest<T>(
    path: string,
    options: RequestInit = {},
    query?: Record<string, string | number | boolean | undefined | null>
  ): Promise<T> {
    if (!this.accessToken) {
      throw new Error('Google Drive access token missing.');
    }

    const url = new URL(`https://www.googleapis.com/drive/v3/${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        url.searchParams.set(key, String(value));
      }
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.accessToken}`);

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.disconnect();
        this.setError('Google Drive session expired. Please reconnect.');
      }
      let errorMessage = `Drive request failed (${response.status})`;
      try {
        const errorBody = await response.json();
        const message = errorBody?.error?.message || errorBody?.message;
        if (message) errorMessage = message;
      } catch {
        // ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  }

  private async listFilesByQuery(
    query: string,
    fields: string,
    orderBy?: string
  ): Promise<DriveFile[]> {
    const response = await this.driveRequest<{ files?: DriveFile[] }>(
      'files',
      { method: 'GET' },
      {
        q: query,
        spaces: 'drive',
        fields: `files(${fields})`,
        orderBy,
        pageSize: 1000,
      }
    );
    return response.files || [];
  }

  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`
      );
      if (!response.ok) {
        this.disconnect();
        this.setError('Google Drive token invalid or expired.');
        return false;
      }
      const info = await response.json();
      const scope: string = info?.scope || '';
      if (!scope.includes('https://www.googleapis.com/auth/drive')) {
        this.disconnect();
        this.setError('Google Drive permission needs re-auth. Please reconnect.');
        return false;
      }

      this.syncStatus.connected = true;
      this.syncStatus.error = undefined;
      this.loadFolderCache();
      await this.ensureRootStructure();
      this.notifyListeners();
      return true;
    } catch {
      this.disconnect();
      this.setError('Google Drive token validation failed.');
      return false;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  // Public API

  onSyncStatusChange(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.syncStatus });
    return () => this.listeners.delete(listener);
  }

  getSyncStatus(): DriveSyncStatus {
    return { ...this.syncStatus };
  }

  isConnected(): boolean {
    return this.syncStatus.connected;
  }

  async connect(): Promise<boolean> {
    if (!this.gisLoaded || !this.tokenClient) {
      console.error('Google Identity Services not loaded');
      this.setError('Google Identity Services not loaded.');
      return false;
    }

    return new Promise((resolve) => {
      this.tokenClient!.callback = (response) => {
        if (response.access_token) {
          this.saveAuth(response.access_token, response.expires_in);
          this.syncStatus.connected = true;
          this.syncStatus.error = undefined;
          this.notifyListeners();
          this.loadFolderCache();
          this.ensureRootStructure()
            .then(() => resolve(true))
            .catch((error) => {
              this.setError(error instanceof Error ? error.message : 'Failed to initialize Drive folders.');
              resolve(false);
            });
          return;
        }
        if (response.error) {
          const errorMessage = response.error_description || response.error;
          this.setError(`Google Drive auth failed: ${errorMessage}`);
        } else {
          this.setError('Google Drive auth failed.');
        }
        resolve(false);
      };
      this.tokenClient!.requestAccessToken({ prompt: 'consent' });
    });
  }

  disconnect() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.rootFolderId = null;
    this.folderIds = {};
    this.projectFolderIds = {};
    this.syncStatus = { connected: false, syncInProgress: false };
    this.fileCache.clear();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FOLDER_CACHE_KEY);
    localStorage.removeItem(PROJECT_CACHE_KEY);
    this.notifyListeners();
  }

  async getUserInfo(): Promise<DriveUserInfo | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      const userInfo = await userResponse.json();
      let storageQuota: DriveUserInfo['storageQuota'];
      try {
        const aboutResponse = await this.driveRequest<{ storageQuota?: { limit?: string; usage?: string; usageInDrive?: string } }>(
          'about',
          { method: 'GET' },
          { fields: 'storageQuota' }
        );
        const quota = aboutResponse?.storageQuota;
        storageQuota = quota ? {
          limit: parseInt(quota.limit || '0'),
          usage: parseInt(quota.usage || '0'),
          usageInDrive: parseInt(quota.usageInDrive || '0'),
        } : undefined;
      } catch {
        storageQuota = undefined;
      }

      return {
        email: userInfo.email,
        displayName: userInfo.name,
        photoUrl: userInfo.picture,
        storageQuota,
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  private async ensureRootFolder(): Promise<string> {
    if (this.rootFolderId) return this.rootFolderId;

    try {
      const safeName = this.escapeQueryValue(ROOT_FOLDER_NAME);
      const files = await this.listFilesByQuery(
        `name='${safeName}' and mimeType='${FOLDER_MIME_TYPE}' and trashed=false and 'root' in parents`,
        'id,name'
      );

      if (files.length > 0 && files[0].id) {
        this.rootFolderId = files[0].id;
        return this.rootFolderId;
      }

      const created = await this.driveRequest<DriveFile>(
        'files',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ROOT_FOLDER_NAME,
            mimeType: FOLDER_MIME_TYPE,
            parents: ['root'],
          }),
        },
        { fields: 'id' }
      );

      this.rootFolderId = created.id;
      return this.rootFolderId;
    } catch (error) {
      console.error('Failed to ensure TheMAG.dev root folder:', error);
      throw error;
    }
  }

  private async ensureSubfolder(
    key: keyof typeof SUBFOLDER_NAMES,
    parentId: string
  ): Promise<string> {
    const cached = this.folderIds[key];
    if (cached) return cached;

    const name = SUBFOLDER_NAMES[key];
    const safeName = this.escapeQueryValue(name);
    const files = await this.listFilesByQuery(
      `name='${safeName}' and mimeType='${FOLDER_MIME_TYPE}' and trashed=false and '${parentId}' in parents`,
      'id,name'
    );

    if (files.length > 0 && files[0].id) {
      const id = files[0].id;
      this.folderIds[key] = id;
      return id;
    }

    const created = await this.driveRequest<DriveFile>(
      'files',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          mimeType: FOLDER_MIME_TYPE,
          parents: [parentId],
        }),
      },
      { fields: 'id' }
    );

    const id = created.id;
    this.folderIds[key] = id;
    return id;
  }

  async ensureRootStructure(): Promise<{
    rootId: string;
    projectsId: string;
    extensionsId: string;
    sdksId: string;
    pluginsId: string;
    settingsId: string;
  }> {
    const rootId = await this.ensureRootFolder();
    const [projectsId, extensionsId, sdksId, pluginsId, settingsId] = await Promise.all([
      this.ensureSubfolder('projects', rootId),
      this.ensureSubfolder('extensions', rootId),
      this.ensureSubfolder('sdks', rootId),
      this.ensureSubfolder('plugins', rootId),
      this.ensureSubfolder('settings', rootId),
    ]);

    this.saveFolderCache();

    return {
      rootId,
      projectsId,
      extensionsId,
      sdksId,
      pluginsId,
      settingsId,
    };
  }

  async getFolderIds() {
    if (this.rootFolderId && Object.keys(this.folderIds).length) {
      return {
        rootId: this.rootFolderId!,
        projectsId: this.folderIds.projects!,
        extensionsId: this.folderIds.extensions!,
        sdksId: this.folderIds.sdks!,
        pluginsId: this.folderIds.plugins!,
        settingsId: this.folderIds.settings!,
      };
    }
    return this.ensureRootStructure();
  }

  private async findFileByName(parentId: string, name: string): Promise<DriveFile | null> {
    const safeName = this.escapeQueryValue(name);
    const files = await this.listFilesByQuery(
      `name='${safeName}' and trashed=false and '${parentId}' in parents`,
      'id,name,mimeType,modifiedTime,createdTime,size,webViewLink',
      undefined
    );
    return files[0] || null;
  }

  getRootFolderLink(): string | null {
    if (!this.rootFolderId) return null;
    return `https://drive.google.com/drive/folders/${this.rootFolderId}`;
  }

  async readFileByName(parentId: string, name: string): Promise<string | null> {
    const file = await this.findFileByName(parentId, name);
    if (!file?.id) return null;
    return this.readFile(file.id);
  }

  async readFileByNameBinary(parentId: string, name: string): Promise<ArrayBuffer | null> {
    const file = await this.findFileByName(parentId, name);
    if (!file?.id) return null;
    return this.readFileArrayBuffer(file.id);
  }

  async upsertFileInFolder(
    parentId: string,
    name: string,
    content: string,
    mimeType = 'application/json'
  ): Promise<DriveFile | null> {
    const existing = await this.findFileByName(parentId, name);
    if (existing?.id) {
      const ok = await this.updateFile(existing.id, content, mimeType);
      return ok ? existing : null;
    }
    return this.createFile(name, content, parentId, mimeType);
  }

  async upsertBinaryInFolder(
    parentId: string,
    name: string,
    data: Blob | ArrayBuffer,
    mimeType = 'application/octet-stream'
  ): Promise<DriveFile | null> {
    const existing = await this.findFileByName(parentId, name);
    if (existing?.id) {
      const ok = await this.updateFileBinary(existing.id, data, mimeType);
      return ok ? existing : null;
    }
    return this.createFileBinary(name, data, parentId, mimeType);
  }

  async listDriveFolder(folderId?: string): Promise<DriveFile[]> {
    if (!this.syncStatus.connected) return [];

    const parentId = folderId || 'root';
    const cacheKey = `drive:${parentId}`;

    try {
      const files = await this.listFilesByQuery(
        `'${parentId}' in parents and trashed=false`,
        'id,name,mimeType,modifiedTime,createdTime,size,webViewLink,iconLink',
        'folder,name'
      );
      this.fileCache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error('Failed to list drive folder:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to list drive folder');
      return this.fileCache.get(cacheKey) || [];
    }
  }

  async ensureProjectFolder(name: string = DEFAULT_PROJECT_NAME): Promise<string> {
    const cached = this.projectFolderIds[name];
    if (cached) return cached;

    const { projectsId } = await this.getFolderIds();
    const existing = await this.findFileByName(projectsId, name);
    if (existing?.id) {
      this.projectFolderIds[name] = existing.id;
      this.saveFolderCache();
      return existing.id;
    }

    const created = await this.createFolder(name, projectsId);
    if (!created?.id) {
      throw new Error('Failed to create project folder.');
    }
    this.projectFolderIds[name] = created.id;
    this.saveFolderCache();
    return created.id;
  }

  async loadWorkspacePayload(projectName: string = DEFAULT_PROJECT_NAME): Promise<string | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const projectId = await this.ensureProjectFolder(projectName);
      return await this.readFileByName(projectId, WORKSPACE_FILE_NAME);
    } catch (error) {
      console.error('Failed to load workspace payload:', error);
      return null;
    }
  }

  async saveWorkspacePayload(payload: string, projectName: string = DEFAULT_PROJECT_NAME): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      this.syncStatus.syncInProgress = true;
      this.notifyListeners();
      const projectId = await this.ensureProjectFolder(projectName);
      const updated = await this.upsertFileInFolder(projectId, WORKSPACE_FILE_NAME, payload, 'application/json');
      this.syncStatus.syncInProgress = false;
      this.syncStatus.lastSync = updated ? Date.now() : this.syncStatus.lastSync;
      this.syncStatus.error = updated ? undefined : 'Failed to save workspace in Drive';
      this.notifyListeners();
      return Boolean(updated);
    } catch (error) {
      console.error('Failed to save workspace payload:', error);
      this.syncStatus.syncInProgress = false;
      this.syncStatus.error = error instanceof Error ? error.message : 'Drive sync failed';
      this.notifyListeners();
      return false;
    }
  }

  async listProjects(): Promise<DriveFile[]> {
    if (!this.syncStatus.connected) return [];

    try {
      const { projectsId } = await this.getFolderIds();

      return await this.listFilesByQuery(
        `'${projectsId}' in parents and mimeType='${FOLDER_MIME_TYPE}' and trashed=false`,
        'id,name,mimeType,modifiedTime,createdTime,iconLink',
        'modifiedTime desc'
      );
    } catch (error) {
      console.error('Failed to list projects:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to list projects');
      return [];
    }
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    if (!this.syncStatus.connected) return [];

    const parentId = folderId || (await this.getFolderIds()).projectsId;

    const cacheKey = parentId || 'root';

    try {
      const files = await this.listFilesByQuery(
        `'${parentId}' in parents and trashed=false`,
        'id,name,mimeType,size,modifiedTime,createdTime,iconLink,webViewLink',
        'folder,name'
      );
      this.fileCache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to list files');
      return this.fileCache.get(cacheKey) || [];
    }
  }

  async createProject(name: string): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const { projectsId } = await this.getFolderIds();

      return await this.driveRequest<DriveFile>(
        'files',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            mimeType: FOLDER_MIME_TYPE,
            parents: [projectsId],
          }),
        },
        { fields: 'id,name,mimeType,modifiedTime,createdTime' }
      );
    } catch (error) {
      console.error('Failed to create project:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to create project');
      return null;
    }
  }

  async createFolder(name: string, parentId: string): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      return await this.driveRequest<DriveFile>(
        'files',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
          }),
        },
        { fields: 'id,name,mimeType,modifiedTime' }
      );
    } catch (error) {
      console.error('Failed to create folder:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to create folder');
      return null;
    }
  }

  async createFile(name: string, content: string, parentId: string, mimeType = 'text/plain'): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const metadata = {
        name,
        mimeType,
        parents: [parentId],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: mimeType }));

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.accessToken}` },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create file');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create file:', error);
      return null;
    }
  }

  async createFileBinary(
    name: string,
    data: Blob | ArrayBuffer,
    parentId: string,
    mimeType = 'application/octet-stream'
  ): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const metadata = {
        name,
        mimeType,
        parents: [parentId],
      };

      const payload = data instanceof Blob ? data : new Blob([data], { type: mimeType });
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', payload);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.accessToken}` },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create binary file');
      }
      return response.json();
    } catch (error) {
      console.error('Failed to create binary file:', error);
      return null;
    }
  }

  async readFile(fileId: string): Promise<string | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) throw new Error('Failed to read file');
      return response.text();
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  async readFileArrayBuffer(fileId: string): Promise<ArrayBuffer | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );

      if (!response.ok) throw new Error('Failed to read file');
      return response.arrayBuffer();
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  async updateFile(fileId: string, content: string, mimeType = 'text/plain'): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': mimeType,
          },
          body: content,
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to update file:', error);
      return false;
    }
  }

  async updateFileBinary(
    fileId: string,
    data: Blob | ArrayBuffer,
    mimeType = 'application/octet-stream'
  ): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      const payload = data instanceof Blob ? data : new Blob([data], { type: mimeType });
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': mimeType,
          },
          body: payload,
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Failed to update binary file:', error);
      return false;
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await this.driveRequest(`files/${fileId}`, { method: 'DELETE' });
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to delete file');
      return false;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await this.driveRequest(
        `files/${fileId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to rename file:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to rename file');
      return false;
    }
  }

  async moveFile(fileId: string, newParentId: string, currentParentId: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await this.driveRequest(
        `files/${fileId}`,
        { method: 'PATCH' },
        {
          addParents: newParentId,
          removeParents: currentParentId,
          fields: 'id,parents',
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to move file:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to move file');
      return false;
    }
  }

  // Sync operations
  async syncProject(projectId: string, localFiles: Map<string, string>): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    this.syncStatus.syncInProgress = true;
    this.syncStatus.totalFiles = localFiles.size;
    this.syncStatus.syncedFiles = 0;
    this.notifyListeners();

    try {
      const remoteFiles = await this.listFiles(projectId);
      const remoteFileMap = new Map(remoteFiles.map(f => [f.name, f]));

      for (const [path, content] of localFiles) {
        const existingFile = remoteFileMap.get(path);

        if (existingFile) {
          await this.updateFile(existingFile.id, content);
        } else {
          await this.createFile(path, content, projectId);
        }

        this.syncStatus.syncedFiles = (this.syncStatus.syncedFiles || 0) + 1;
        this.notifyListeners();
      }

      this.syncStatus.lastSync = Date.now();
      this.syncStatus.syncInProgress = false;
      this.syncStatus.error = undefined;
      this.notifyListeners();
      return true;
    } catch (error) {
      this.syncStatus.syncInProgress = false;
      this.syncStatus.error = error instanceof Error ? error.message : 'Sync failed';
      this.notifyListeners();
      return false;
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Declare global types for Google APIs
declare global {
  interface Window {
    google: typeof google;
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
