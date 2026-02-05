import googleDriveService from './GoogleDriveService';
import { zipSync, strToU8 } from 'fflate';
export interface SDK {
  id: string;
  name: string;
  version: string;
  platform: 'Android' | 'iOS' | 'Windows' | 'Mac' | 'Linux' | 'Web';
  status: 'Installed' | 'Not Installed' | 'Update Available';
  apiLevel?: number;
  size?: string;
  source: 'Official' | 'Community' | 'Third-Party';
  description?: string;
  releaseDate?: string;
}

export interface SDKPlugin {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  installed: boolean;
}

const SDK_STORAGE_KEY = 'themag_sdk_state';
const SDK_PLUGIN_STORAGE_KEY = 'themag_sdk_plugins';
const DRIVE_SDK_FILE = 'sdk-state.json';
const DRIVE_PLUGIN_FILE = 'sdk-plugins.json';
const DRIVE_CONSENT_KEY = 'themag_drive_sdk_consent';
const DRIVE_SAVE_DEBOUNCE_MS = 1200;

const getDriveConsentKey = (driveEmail?: string | null) => `${DRIVE_CONSENT_KEY}_${driveEmail || 'default'}`;

class SDKService {
  private listeners: Set<() => void> = new Set();
  private driveSyncEnabled = false;
  private driveSyncTimeout: ReturnType<typeof setTimeout> | null = null;
  private driveUserEmail: string | null = null;

  private sdks: SDK[] = [
    {
      id: 'android-platform-tools',
      name: 'Android SDK Platform Tools',
      version: 'Stable',
      platform: 'Android',
      status: 'Installed',
      size: 'Varies',
      source: 'Official',
      description: 'ADB, fastboot, and core device tooling.'
    },
    {
      id: 'android-build-tools',
      name: 'Android SDK Build Tools',
      version: 'Stable',
      platform: 'Android',
      status: 'Update Available',
      size: 'Varies',
      source: 'Official',
      description: 'Compiler, packaging, and build utilities for Android.'
    },
    {
      id: 'android-ndk',
      name: 'Android NDK',
      version: 'Stable',
      platform: 'Android',
      status: 'Not Installed',
      size: 'Varies',
      source: 'Official',
      description: 'Native toolchain for C/C++ Android development.'
    },
    {
      id: 'ios-sdk',
      name: 'iOS SDK (Xcode)',
      version: 'Stable',
      platform: 'iOS',
      status: 'Not Installed',
      size: 'Varies',
      source: 'Official',
      description: 'Build and run iOS apps with Xcode toolchains.'
    },
    {
      id: 'xcode-cli-tools',
      name: 'Xcode Command Line Tools',
      version: 'Stable',
      platform: 'Mac',
      status: 'Installed',
      size: 'Varies',
      source: 'Official',
      description: 'clang, git, and developer tools for macOS builds.'
    },
    {
      id: 'macos-sdk',
      name: 'macOS SDK (Xcode)',
      version: 'Stable',
      platform: 'Mac',
      status: 'Not Installed',
      size: 'Varies',
      source: 'Official',
      description: 'macOS frameworks and headers for desktop apps.'
    },
    {
      id: 'windows-sdk',
      name: 'Windows SDK',
      version: 'Stable',
      platform: 'Windows',
      status: 'Installed',
      size: 'Varies',
      source: 'Official',
      description: 'Windows headers, libraries, and build tools.'
    },
    {
      id: 'msvc-build-tools',
      name: 'MSVC Build Tools',
      version: 'Stable',
      platform: 'Windows',
      status: 'Not Installed',
      size: 'Varies',
      source: 'Official',
      description: 'C/C++ compiler toolchain for Windows builds.'
    },
    {
      id: 'gcc-toolchain',
      name: 'GNU Compiler Collection (GCC)',
      version: 'Stable',
      platform: 'Linux',
      status: 'Installed',
      size: 'Varies',
      source: 'Community',
      description: 'C/C++ toolchain for Linux development.'
    },
    {
      id: 'clang-llvm',
      name: 'Clang/LLVM Toolchain',
      version: 'Stable',
      platform: 'Linux',
      status: 'Update Available',
      size: 'Varies',
      source: 'Community',
      description: 'Modern compiler and tooling for Linux builds.'
    },
    {
      id: 'cmake',
      name: 'CMake',
      version: 'Stable',
      platform: 'Linux',
      status: 'Installed',
      size: 'Varies',
      source: 'Community',
      description: 'Cross-platform build configuration generator.'
    },
    {
      id: 'nodejs-lts',
      name: 'Node.js (LTS)',
      version: 'LTS',
      platform: 'Web',
      status: 'Installed',
      size: 'Varies',
      source: 'Official',
      description: 'JavaScript runtime for web tooling and servers.'
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      version: 'Stable',
      platform: 'Web',
      status: 'Installed',
      size: 'Varies',
      source: 'Official',
      description: 'Typed JavaScript language service and compiler.'
    },
    {
      id: 'flutter-sdk',
      name: 'Flutter SDK',
      version: 'Stable',
      platform: 'Web',
      status: 'Update Available',
      size: 'Varies',
      source: 'Official',
      description: 'Cross-platform UI toolkit and CLI tooling.'
    },
    {
      id: 'pnpm',
      name: 'pnpm',
      version: 'Stable',
      platform: 'Web',
      status: 'Not Installed',
      size: 'Varies',
      source: 'Community',
      description: 'Fast, disk-efficient package manager for Node.js.'
    }
  ];

  private plugins: SDKPlugin[] = [
    {
      id: 'plugin-android-gradle',
      name: 'Android Gradle Plugin',
      author: 'Google',
      version: 'Stable',
      description: 'Build system for Android projects with Gradle.',
      installed: true
    },
    {
      id: 'plugin-cocoapods',
      name: 'CocoaPods',
      author: 'CocoaPods',
      version: 'Stable',
      description: 'Dependency manager for iOS and macOS projects.',
      installed: false
    },
    {
      id: 'plugin-fastlane',
      name: 'fastlane',
      author: 'fastlane',
      version: 'Stable',
      description: 'Automate signing, builds, and releases for mobile apps.',
      installed: true
    },
    {
      id: 'plugin-cmake-tools',
      name: 'CMake Tools',
      author: 'Kitware',
      version: 'Stable',
      description: 'Configure and build C/C++ projects with CMake.',
      installed: true
    },
    {
      id: 'plugin-ninja',
      name: 'Ninja',
      author: 'Ninja',
      version: 'Stable',
      description: 'Fast build system for C/C++ and large codebases.',
      installed: false
    },
    {
      id: 'plugin-firebase-cli',
      name: 'Firebase CLI',
      author: 'Google',
      version: 'Stable',
      description: 'Deploy and manage Firebase projects from the CLI.',
      installed: true
    }
  ];

  constructor() {
    this.loadFromStorage();
    googleDriveService.onSyncStatusChange((status) => {
      if (status.connected) {
        googleDriveService.getUserInfo().then((info) => {
          this.driveUserEmail = info?.email ?? null;
          this.hydrateFromDrive().catch(() => {});
        });
        return;
      }
      this.driveSyncEnabled = false;
    });
  }

  onChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private loadFromStorage() {
    try {
      const savedSdks = localStorage.getItem(SDK_STORAGE_KEY);
      if (savedSdks) {
        const parsed = JSON.parse(savedSdks) as SDK[];
        const byId = new Map(parsed.map(item => [item.id, item]));
        const merged = this.sdks.map(defaultSdk => byId.get(defaultSdk.id) ?? defaultSdk);
        const mergedIds = new Set(merged.map(sdk => sdk.id));
        const extras = parsed.filter(item => !mergedIds.has(item.id));
        this.sdks = [...merged, ...extras];
      }
    } catch {
      // Ignore invalid cache.
    }

    try {
      const savedPlugins = localStorage.getItem(SDK_PLUGIN_STORAGE_KEY);
      if (savedPlugins) {
        const parsed = JSON.parse(savedPlugins) as SDKPlugin[];
        const byId = new Map(parsed.map(item => [item.id, item]));
        const merged = this.plugins.map(defaultPlugin => byId.get(defaultPlugin.id) ?? defaultPlugin);
        const mergedIds = new Set(merged.map(plugin => plugin.id));
        const extras = parsed.filter(item => !mergedIds.has(item.id));
        this.plugins = [...merged, ...extras];
      }
    } catch {
      // Ignore invalid cache.
    }
  }

  private saveState(skipDrive = false) {
    localStorage.setItem(SDK_STORAGE_KEY, JSON.stringify(this.sdks));
    localStorage.setItem(SDK_PLUGIN_STORAGE_KEY, JSON.stringify(this.plugins));
    if (!skipDrive) {
      this.queueDriveSync();
    }
  }

  private queueDriveSync() {
    if (!this.driveSyncEnabled || !googleDriveService.isConnected()) {
      return;
    }
    if (this.driveSyncTimeout) {
      clearTimeout(this.driveSyncTimeout);
    }
    this.driveSyncTimeout = setTimeout(() => {
      this.syncToDrive().catch(() => {});
    }, DRIVE_SAVE_DEBOUNCE_MS);
  }

  private async syncToDrive() {
    if (!this.driveSyncEnabled || !googleDriveService.isConnected()) {
      return;
    }
    const { settingsId } = await googleDriveService.getFolderIds();
    await Promise.all([
      googleDriveService.upsertFileInFolder(
        settingsId,
        DRIVE_SDK_FILE,
        JSON.stringify(this.sdks),
        'application/json'
      ),
      googleDriveService.upsertFileInFolder(
        settingsId,
        DRIVE_PLUGIN_FILE,
        JSON.stringify(this.plugins),
        'application/json'
      )
    ]);
  }

  private async hydrateFromDrive() {
    if (!googleDriveService.isConnected()) {
      return;
    }
    const consentKey = getDriveConsentKey(this.driveUserEmail);
    const consent = localStorage.getItem(consentKey);
    const { settingsId } = await googleDriveService.getFolderIds();

    const [sdkPayload, pluginPayload] = await Promise.all([
      googleDriveService.readFileByName(settingsId, DRIVE_SDK_FILE),
      googleDriveService.readFileByName(settingsId, DRIVE_PLUGIN_FILE),
    ]);

    let hasDriveData = false;

    if (sdkPayload) {
      try {
        const parsed = JSON.parse(sdkPayload) as SDK[];
        this.sdks = parsed;
        hasDriveData = true;
      } catch {
        // Ignore invalid drive payload.
      }
    }

    if (pluginPayload) {
      try {
        const parsed = JSON.parse(pluginPayload) as SDKPlugin[];
        this.plugins = parsed;
        hasDriveData = true;
      } catch {
        // Ignore invalid drive payload.
      }
    }

    if (hasDriveData) {
      this.driveSyncEnabled = true;
      localStorage.setItem(consentKey, 'enabled');
      this.saveState(true);
      this.notify();
      return;
    }

    if (consent === 'declined') {
      this.driveSyncEnabled = false;
      return;
    }

    const hasLocalData = Boolean(localStorage.getItem(SDK_STORAGE_KEY) || localStorage.getItem(SDK_PLUGIN_STORAGE_KEY));
    if (!consent && hasLocalData) {
      const shouldUpload = window.confirm('Upload your SDK and plugin settings to Google Drive?');
      if (!shouldUpload) {
        localStorage.setItem(consentKey, 'declined');
        this.driveSyncEnabled = false;
        return;
      }
    }

    this.driveSyncEnabled = true;
    localStorage.setItem(consentKey, 'enabled');
    if (hasLocalData || consent === 'enabled') {
      await this.syncToDrive();
    }
  }

  private async storeSDKBundle(sdk: SDK) {
    if (!this.driveSyncEnabled || !googleDriveService.isConnected()) {
      return;
    }
    try {
      const { sdksId } = await googleDriveService.getFolderIds();
      const bundle = zipSync({
        'sdk.json': strToU8(JSON.stringify(sdk, null, 2)),
      });
      const blob = new Blob([bundle], { type: 'application/zip' });
      await googleDriveService.upsertBinaryInFolder(
        sdksId,
        `${sdk.id}.zip`,
        blob,
        'application/zip'
      );
    } catch {
      // Ignore bundle upload errors.
    }
  }

  private async storePluginBundle(plugin: SDKPlugin) {
    if (!this.driveSyncEnabled || !googleDriveService.isConnected()) {
      return;
    }
    try {
      const { pluginsId } = await googleDriveService.getFolderIds();
      const bundle = zipSync({
        'plugin.json': strToU8(JSON.stringify(plugin, null, 2)),
      });
      const blob = new Blob([bundle], { type: 'application/zip' });
      await googleDriveService.upsertBinaryInFolder(
        pluginsId,
        `${plugin.id}.zip`,
        blob,
        'application/zip'
      );
    } catch {
      // Ignore bundle upload errors.
    }
  }

  getSDKs(platform?: string): SDK[] {
    if (platform) {
      return this.sdks.filter(sdk => sdk.platform === platform);
    }
    return this.sdks;
  }

  getPlugins(): SDKPlugin[] {
    return this.plugins;
  }

  async getPublicPluginBundleUrl(pluginId: string): Promise<string | null> {
    if (!googleDriveService.isConnected()) {
      return null;
    }

    const plugin = this.plugins.find(p => p.id === pluginId);
    if (!plugin) return null;

    try {
      const { pluginsId } = await googleDriveService.getFolderIds();
      const bundle = zipSync({
        'plugin.json': strToU8(JSON.stringify(plugin, null, 2)),
      });
      const blob = new Blob([bundle], { type: 'application/zip' });
      const file = await googleDriveService.upsertBinaryInFolder(
        pluginsId,
        `${plugin.id}.zip`,
        blob,
        'application/zip'
      );
      if (!file?.id) return null;
      return googleDriveService.getPublicDownloadUrl(file.id);
    } catch {
      return null;
    }
  }

  installSDK(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sdk = this.sdks.find(s => s.id === id);
        if (sdk) {
          sdk.status = 'Installed';
          this.saveState();
          this.storeSDKBundle(sdk).catch(() => {});
          this.notify();
        }
        resolve();
      }, 2000);
    });
  }

  updateSDK(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sdk = this.sdks.find(s => s.id === id);
        if (sdk) {
          sdk.status = 'Installed';
          this.saveState();
          this.storeSDKBundle(sdk).catch(() => {});
          this.notify();
        }
        resolve();
      }, 2000);
    });
  }

  uninstallSDK(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sdk = this.sdks.find(s => s.id === id);
        if (sdk) {
          sdk.status = 'Not Installed';
          this.saveState();
          this.notify();
        }
        resolve();
      }, 1000);
    });
  }

  uninstallPlugin(id: string): void {
    this.plugins = this.plugins.filter(p => p.id !== id);
    this.saveState();
    this.notify();
  }

  addPlugin(plugin: SDKPlugin): void {
    this.plugins.push(plugin);
    this.saveState();
    this.storePluginBundle(plugin).catch(() => {});
    this.notify();
  }

  checkForUpdates(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate finding updates
        const updates = this.sdks.filter(s => s.status === 'Installed' && Math.random() > 0.7);
        updates.forEach(s => s.status = 'Update Available');
        this.saveState();
        this.notify();
        resolve(updates.length);
      }, 1500);
    });
  }
}

export const sdkService = new SDKService();
