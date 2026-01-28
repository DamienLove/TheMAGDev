import googleDriveService, { type DriveFile } from './GoogleDriveService';

export type StudioAssetType = 'image' | 'video' | 'icon' | 'font';

export interface StudioAsset {
  id: string;
  name: string;
  type: StudioAssetType;
  url: string;
  tags: string[];
  size: string;
  downloadUrl?: string;
  source?: 'drive' | 'local';
  driveFileId?: string;
}

const DEFAULT_ASSETS: StudioAsset[] = [
  {
    id: '1',
    name: 'App Logo',
    type: 'image',
    url: '/branding/STLOGO.png',
    tags: ['branding', 'logo'],
    size: '124KB',
    source: 'local',
  },
  {
    id: '2',
    name: 'Splash Screen',
    type: 'image',
    url: '/branding/STLOGO.png',
    tags: ['branding', 'splash'],
    size: '1.2MB',
    source: 'local',
  },
  {
    id: '3',
    name: 'Hero Video',
    type: 'video',
    url: '#',
    tags: ['marketing', 'video'],
    size: '14MB',
    source: 'local',
  },
];

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const guessTypeFromMime = (mimeType?: string, name?: string): StudioAssetType => {
  if (mimeType?.startsWith('image/')) return 'image';
  if (mimeType?.startsWith('video/')) return 'video';
  if (mimeType?.includes('font')) return 'font';
  const lower = (name || '').toLowerCase();
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.svg')) {
    return 'image';
  }
  if (lower.endsWith('.mp4') || lower.endsWith('.webm')) return 'video';
  if (lower.endsWith('.ttf') || lower.endsWith('.otf') || lower.endsWith('.woff') || lower.endsWith('.woff2')) {
    return 'font';
  }
  return 'icon';
};

const getExtensionFromUrl = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    const match = url.pathname.match(/\.[a-z0-9]+$/i);
    return match ? match[0] : '';
  } catch {
    return '';
  }
};

const getExtensionFromMime = (mimeType?: string) => {
  if (!mimeType) return '';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/gif') return '.gif';
  if (mimeType === 'image/svg+xml') return '.svg';
  if (mimeType === 'video/mp4') return '.mp4';
  if (mimeType === 'video/webm') return '.webm';
  if (mimeType === 'font/ttf') return '.ttf';
  if (mimeType === 'font/otf') return '.otf';
  if (mimeType === 'font/woff') return '.woff';
  if (mimeType === 'font/woff2') return '.woff2';
  return '';
};

class AssetLibraryService {
  private listeners = new Set<(assets: StudioAsset[]) => void>();
  private assets: StudioAsset[] = [...DEFAULT_ASSETS];
  private hydrateInProgress = false;
  private previewCache = new Map<string, string>();

  constructor() {
    googleDriveService.onSyncStatusChange((status) => {
      if (status.connected) {
        this.hydrateFromDrive().catch(() => {});
      } else {
        this.assets = [...DEFAULT_ASSETS];
        this.notify();
      }
    });
  }

  onChange(listener: (assets: StudioAsset[]) => void): () => void {
    this.listeners.add(listener);
    listener([...this.assets]);
    return () => this.listeners.delete(listener);
  }

  getAssets(): StudioAsset[] {
    return [...this.assets];
  }

  async addAsset(asset: StudioAsset): Promise<void> {
    const updated = [asset, ...this.assets];
    this.assets = updated;
    this.notify();

    if (!googleDriveService.isConnected()) return;
    const { assetsId } = await googleDriveService.getFolderIds();
    await this.uploadAssetToDrive(asset, assetsId);
    await this.hydrateFromDrive();
  }

  private notify() {
    const snapshot = [...this.assets];
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private async hydrateFromDrive(): Promise<void> {
    if (this.hydrateInProgress || !googleDriveService.isConnected()) return;
    this.hydrateInProgress = true;

    try {
      const { assetsId } = await googleDriveService.getFolderIds();
      let files = await googleDriveService.listDriveFolder(assetsId);

      if (files.length === 0) {
        await this.seedDefaults(assetsId);
        files = await googleDriveService.listDriveFolder(assetsId);
      }

      const mapped = await Promise.all(
        files
          .filter((file) => file.mimeType !== FOLDER_MIME_TYPE)
          .map((file) => this.buildAssetFromFile(file))
      );

      this.assets = mapped.length > 0 ? mapped : [...DEFAULT_ASSETS];
      this.notify();
    } finally {
      this.hydrateInProgress = false;
    }
  }

  private async seedDefaults(assetsId: string): Promise<void> {
    for (const asset of DEFAULT_ASSETS) {
      if (!asset.url || asset.url === '#') continue;
      await this.uploadAssetToDrive(asset, assetsId);
    }
  }

  private async uploadAssetToDrive(asset: StudioAsset, assetsId: string): Promise<void> {
    try {
      if (!asset.url || asset.url === '#') return;
      const response = await fetch(asset.url);
      if (!response.ok) return;
      const blob = await response.blob();
      const extFromUrl = getExtensionFromUrl(asset.url);
      const extFromMime = getExtensionFromMime(blob.type);
      const extension = extFromUrl || extFromMime;
      const fileName = `${toSlug(asset.name) || 'asset'}${extension || ''}`;
      await googleDriveService.upsertBinaryInFolder(assetsId, fileName, blob, blob.type || 'application/octet-stream');
    } catch {
      // Ignore upload errors for now.
    }
  }

  private async buildAssetFromFile(file: DriveFile): Promise<StudioAsset> {
    const id = file.id;
    const cached = this.previewCache.get(id);
    let previewUrl = cached || '';

    if (!previewUrl) {
      const buffer = await googleDriveService.readFileArrayBuffer(id);
      if (buffer) {
        const blob = new Blob([buffer], { type: file.mimeType || 'application/octet-stream' });
        previewUrl = URL.createObjectURL(blob);
        this.previewCache.set(id, previewUrl);
      }
    }

    const sizeValue = typeof file.size === 'string' ? parseInt(file.size, 10) : file.size || 0;
    const size = googleDriveService.formatBytes(sizeValue);
    const downloadUrl = await googleDriveService.getPublicDownloadUrl(id);

    return {
      id,
      name: file.name,
      type: guessTypeFromMime(file.mimeType, file.name),
      url: previewUrl || downloadUrl || '#',
      tags: ['drive'],
      size,
      downloadUrl: downloadUrl || undefined,
      source: 'drive',
      driveFileId: id,
    };
  }
}

export const assetLibraryService = new AssetLibraryService();
export default assetLibraryService;
