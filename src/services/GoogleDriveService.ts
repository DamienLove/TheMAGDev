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
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const THEMAG_FOLDER_NAME = 'TheMAG.dev Projects';
const WORKSPACE_FILE_NAME = 'workspace.json';
const STORAGE_KEY = 'themag_gdrive_auth';

type SyncStatusListener = (status: DriveSyncStatus) => void;

class GoogleDriveService {
  private gapiLoaded = false;
  private gisLoaded = false;
  private tokenClient: google.accounts.oauth2.TokenClient | null = null;
  private accessToken: string | null = null;
  private themagFolderId: string | null = null;
  private workspaceFileId: string | null = null;
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

  private async initializeGoogleAPI(): Promise<void> {
    // Load the Google API client library
    await this.loadScript('https://apis.google.com/js/api.js');
    await this.loadScript('https://accounts.google.com/gsi/client');

    await new Promise<void>((resolve) => {
      gapi.load('client', async () => {
        await gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
        });
        this.gapiLoaded = true;
        resolve();
      });
    });

    // Initialize Google Identity Services
    if (GOOGLE_CLIENT_ID) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            this.saveAuth(response.access_token, response.expires_in);
            gapi.client.setToken({ access_token: response.access_token });
            this.syncStatus.connected = true;
            this.notifyListeners();
            this.ensureThemagFolder();
          }
        },
      });
      this.gisLoaded = true;
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

  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`
      );
      if (!response.ok) {
        this.disconnect();
        return false;
      }
      gapi.client.setToken({ access_token: this.accessToken });
      this.syncStatus.connected = true;
      await this.ensureThemagFolder();
      this.notifyListeners();
      return true;
    } catch {
      this.disconnect();
      this.notifyListeners();
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
      return false;
    }

    return new Promise((resolve) => {
      this.tokenClient!.callback = (response) => {
        if (response.access_token) {
          this.saveAuth(response.access_token, response.expires_in);
          gapi.client.setToken({ access_token: response.access_token });
          this.syncStatus.connected = true;
          this.notifyListeners();
          this.ensureThemagFolder().then(() => resolve(true));
        } else {
          resolve(false);
        }
      };
      this.tokenClient!.requestAccessToken({ prompt: 'consent' });
    });
  }

  disconnect() {
    if (this.accessToken) {
      google.accounts.oauth2.revoke(this.accessToken, () => {});
    }
    this.accessToken = null;
    this.themagFolderId = null;
    this.workspaceFileId = null;
    this.syncStatus = { connected: false, syncInProgress: false };
    this.fileCache.clear();
    localStorage.removeItem(STORAGE_KEY);
    this.notifyListeners();
  }

  async getUserInfo(): Promise<DriveUserInfo | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const [userResponse, aboutResponse] = await Promise.all([
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }),
        gapi.client.drive.about.get({ fields: 'storageQuota' }),
      ]);

      const userInfo = await userResponse.json();
      const storageQuota = aboutResponse.result.storageQuota;

      return {
        email: userInfo.email,
        displayName: userInfo.name,
        photoUrl: userInfo.picture,
        storageQuota: storageQuota ? {
          limit: parseInt(storageQuota.limit || '0'),
          usage: parseInt(storageQuota.usage || '0'),
          usageInDrive: parseInt(storageQuota.usageInDrive || '0'),
        } : undefined,
      };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  private async ensureThemagFolder(): Promise<string> {
    if (this.themagFolderId) return this.themagFolderId;

    try {
      // Search for existing folder
      const response = await gapi.client.drive.files.list({
        q: `name='${THEMAG_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (response.result.files && response.result.files.length > 0) {
        this.themagFolderId = response.result.files[0].id!;
        return this.themagFolderId;
      }

      // Create new folder
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: THEMAG_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      this.themagFolderId = createResponse.result.id!;
      return this.themagFolderId;
    } catch (error) {
      console.error('Failed to ensure TheMAG folder:', error);
      throw error;
    }
  }

  private async findWorkspaceFileId(): Promise<string | null> {
    if (this.workspaceFileId) return this.workspaceFileId;

    await this.ensureThemagFolder();

    const response = await gapi.client.drive.files.list({
      q: `'${this.themagFolderId}' in parents and name='${WORKSPACE_FILE_NAME}' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)',
      pageSize: 1,
    });

    const file = response.result.files?.[0];
    if (file?.id) {
      this.workspaceFileId = file.id;
      return file.id;
    }

    return null;
  }

  async listProjects(): Promise<DriveFile[]> {
    if (!this.syncStatus.connected) return [];

    try {
      await this.ensureThemagFolder();

      const response = await gapi.client.drive.files.list({
        q: `'${this.themagFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, modifiedTime, createdTime, iconLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Failed to list projects:', error);
      return [];
    }
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    if (!this.syncStatus.connected) return [];

    const parentId = folderId || this.themagFolderId;
    if (!parentId) {
      await this.ensureThemagFolder();
    }

    const cacheKey = parentId || 'root';

    try {
      const response = await gapi.client.drive.files.list({
        q: `'${parentId || this.themagFolderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name, mimeType, size, modifiedTime, createdTime, iconLink, webViewLink)',
        orderBy: 'folder,name',
      });

      const files = response.result.files || [];
      this.fileCache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      return this.fileCache.get(cacheKey) || [];
    }
  }

  async createProject(name: string): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      await this.ensureThemagFolder();

      const response = await gapi.client.drive.files.create({
        resource: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.themagFolderId!],
        },
        fields: 'id, name, mimeType, modifiedTime, createdTime',
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  }

  async createFolder(name: string, parentId: string): Promise<DriveFile | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const response = await gapi.client.drive.files.create({
        resource: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id, name, mimeType, modifiedTime',
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create folder:', error);
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

      return response.json();
    } catch (error) {
      console.error('Failed to create file:', error);
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

  async deleteFile(fileId: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await gapi.client.drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await gapi.client.drive.files.update({
        fileId,
        resource: { name: newName },
      });
      return true;
    } catch (error) {
      console.error('Failed to rename file:', error);
      return false;
    }
  }

  async moveFile(fileId: string, newParentId: string, currentParentId: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      await gapi.client.drive.files.update({
        fileId,
        addParents: newParentId,
        removeParents: currentParentId,
      });
      return true;
    } catch (error) {
      console.error('Failed to move file:', error);
      return false;
    }
  }

  async loadWorkspacePayload(): Promise<string | null> {
    if (!this.syncStatus.connected) return null;

    try {
      const fileId = await this.findWorkspaceFileId();
      if (!fileId) return null;
      return await this.readFile(fileId);
    } catch (error) {
      console.error('Failed to load workspace payload:', error);
      return null;
    }
  }

  async saveWorkspacePayload(payload: string): Promise<boolean> {
    if (!this.syncStatus.connected) return false;

    try {
      const existingId = await this.findWorkspaceFileId();
      if (existingId) {
        return await this.updateFile(existingId, payload, 'application/json');
      }

      await this.ensureThemagFolder();
      const created = await this.createFile(
        WORKSPACE_FILE_NAME,
        payload,
        this.themagFolderId!,
        'application/json'
      );

      if (created?.id) {
        this.workspaceFileId = created.id;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save workspace payload:', error);
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
    gapi: typeof gapi;
    google: typeof google;
  }
}

export const googleDriveService = new GoogleDriveService();
export default googleDriveService;
