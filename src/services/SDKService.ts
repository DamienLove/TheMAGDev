
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

class SDKService {
  private sdks: SDK[] = [
    {
      id: 'android-34',
      name: 'Android 14.0 (UpsideDownCake)',
      version: '14.0',
      platform: 'Android',
      status: 'Installed',
      apiLevel: 34,
      size: '145 MB',
      source: 'Official',
      releaseDate: 'Oct 4, 2023'
    },
    {
      id: 'android-33',
      name: 'Android 13.0 (Tiramisu)',
      version: '13.0',
      platform: 'Android',
      status: 'Update Available',
      apiLevel: 33,
      size: '140 MB',
      source: 'Official',
      releaseDate: 'Aug 15, 2022'
    },
    {
      id: 'ios-17',
      name: 'iOS 17 SDK',
      version: '17.0',
      platform: 'iOS',
      status: 'Not Installed',
      size: '2.4 GB',
      source: 'Official',
      releaseDate: 'Sep 18, 2023'
    },
    {
      id: 'node-20',
      name: 'Node.js 20 (LTS)',
      version: '20.9.0',
      platform: 'Web',
      status: 'Installed',
      size: '45 MB',
      source: 'Official',
      releaseDate: 'Oct 24, 2023'
    },
    {
      id: 'flutter-3.16',
      name: 'Flutter SDK',
      version: '3.16.0',
      platform: 'Web',
      status: 'Update Available',
      size: '850 MB',
      source: 'Official',
      releaseDate: 'Nov 15, 2023'
    }
  ];

  private plugins: SDKPlugin[] = [
    {
      id: 'plugin-1',
      name: 'Rust Toolchain Support',
      author: 'Community',
      version: '1.2.0',
      description: 'Adds Rust language support and Cargo integration.',
      installed: false
    },
    {
      id: 'plugin-2',
      name: 'Python Anaconda Adapter',
      author: 'DataSci Inc.',
      version: '2.1.0',
      description: 'Integration with Anaconda environments for Python development.',
      installed: true
    }
  ];

  getSDKs(platform?: string): SDK[] {
    if (platform) {
      return this.sdks.filter(sdk => sdk.platform === platform);
    }
    return this.sdks;
  }

  getPlugins(): SDKPlugin[] {
    return this.plugins;
  }

  installSDK(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sdk = this.sdks.find(s => s.id === id);
        if (sdk) sdk.status = 'Installed';
        resolve();
      }, 2000);
    });
  }

  updateSDK(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sdk = this.sdks.find(s => s.id === id);
        if (sdk) sdk.status = 'Installed';
        resolve();
      }, 2000);
    });
  }

  addPlugin(plugin: SDKPlugin): void {
    this.plugins.push(plugin);
  }

  checkForUpdates(): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate finding updates
        const updates = this.sdks.filter(s => s.status === 'Installed' && Math.random() > 0.7);
        updates.forEach(s => s.status = 'Update Available');
        resolve(updates.length);
      }, 1500);
    });
  }
}

export const sdkService = new SDKService();
