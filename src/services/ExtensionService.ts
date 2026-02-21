// Extension/Plugin Service for TheMAG.dev
import googleDriveService from './GoogleDriveService';
import { zipSync, strToU8 } from 'fflate';

export type ExtensionCategory =
  | 'language'
  | 'theme'
  | 'debugger'
  | 'formatter'
  | 'linter'
  | 'ai'
  | 'git'
  | 'snippets'
  | 'testing'
  | 'utility'
  | 'other';

export type ExtensionStatus = 'pending' | 'scanning' | 'approved' | 'rejected';

export interface ExtensionManifest {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  repository?: string;
  license: string;
  categories: ExtensionCategory[];
  keywords: string[];
  icon?: string;
  main: string; // Entry point
  activationEvents: string[];
  contributes?: {
    commands?: Array<{
      command: string;
      title: string;
      icon?: string;
    }>;
    menus?: Record<string, Array<{ command: string; when?: string }>>;
    languages?: Array<{
      id: string;
      extensions: string[];
      aliases: string[];
    }>;
    themes?: Array<{
      id: string;
      label: string;
      uiTheme: 'vs-dark' | 'vs-light';
      path: string;
    }>;
    snippets?: Array<{
      language: string;
      path: string;
    }>;
    configuration?: {
      title: string;
      properties: Record<string, {
        type: string;
        default: any;
        description: string;
      }>;
    };
  };
  dependencies?: Record<string, string>;
  engines: {
    themag: string;
  };
}

export interface Extension {
  manifest: ExtensionManifest;
  installed: boolean;
  enabled: boolean;
  installDate?: number;
  updateAvailable?: boolean;
  settings?: Record<string, any>;
}

export interface MarketplaceExtension {
  manifest: ExtensionManifest;
  status: ExtensionStatus;
  downloads: number;
  rating: number;
  ratingCount: number;
  publishedDate: number;
  lastUpdated: number;
  scanReport?: {
    safe: boolean;
    issues: string[];
    scannedAt: number;
  };
}

export interface ExtensionUpload {
  manifest: ExtensionManifest;
  sourceCode: string;
  publisherId: string;
}

// Built-in/Featured Extensions (real-world tooling)
const FEATURED_EXTENSIONS: MarketplaceExtension[] = [
  {
    manifest: {
      id: 'prettier',
      name: 'prettier',
      displayName: 'Prettier - Code Formatter',
      version: 'stable',
      description: 'Opinionated code formatter for JavaScript, TypeScript, JSON, CSS, and more.',
      author: { name: 'Prettier' },
      license: 'MIT',
      categories: ['formatter'],
      keywords: ['prettier', 'format', 'style'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:javascript', 'onLanguage:typescript', 'onLanguage:json', 'onLanguage:css'],
      contributes: {
        commands: [
          { command: 'prettier.format', title: 'Format Document' },
          { command: 'prettier.formatSelection', title: 'Format Selection' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 1450000,
    rating: 4.9,
    ratingCount: 32000,
    publishedDate: Date.now() - 540 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 14 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'eslint',
      name: 'eslint',
      displayName: 'ESLint',
      version: 'stable',
      description: 'Lint JavaScript and TypeScript using ESLint rules and configurations.',
      author: { name: 'ESLint' },
      license: 'MIT',
      categories: ['linter'],
      keywords: ['eslint', 'lint', 'javascript', 'typescript'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:javascript', 'onLanguage:typescript'],
      contributes: {
        commands: [
          { command: 'eslint.lint', title: 'Lint File' },
          { command: 'eslint.fix', title: 'Fix All Auto-Fixable Problems' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 1320000,
    rating: 4.8,
    ratingCount: 27500,
    publishedDate: Date.now() - 720 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 10 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'github-copilot',
      name: 'github-copilot',
      displayName: 'GitHub Copilot',
      version: 'stable',
      description: 'AI pair programmer that suggests code and refactors in real time.',
      author: { name: 'GitHub' },
      license: 'Proprietary',
      categories: ['ai'],
      keywords: ['ai', 'copilot', 'completion', 'assistant'],
      main: 'dist/extension.js',
      activationEvents: ['*'],
      contributes: {
        commands: [
          { command: 'copilot.suggest', title: 'Get AI Suggestions' },
          { command: 'copilot.chat', title: 'Open Copilot Chat' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 980000,
    rating: 4.6,
    ratingCount: 18400,
    publishedDate: Date.now() - 420 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 6 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'github-prs',
      name: 'github-pull-requests',
      displayName: 'GitHub Pull Requests and Issues',
      version: 'stable',
      description: 'Review and manage GitHub pull requests and issues without leaving the editor.',
      author: { name: 'GitHub' },
      license: 'MIT',
      categories: ['git'],
      keywords: ['github', 'pull request', 'issues', 'code review'],
      main: 'dist/extension.js',
      activationEvents: ['onStartupFinished'],
      contributes: {
        commands: [
          { command: 'github.pullRequests', title: 'View Pull Requests' },
          { command: 'github.issues', title: 'View Issues' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 640000,
    rating: 4.7,
    ratingCount: 9200,
    publishedDate: Date.now() - 600 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 12 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'python',
      name: 'python',
      displayName: 'Python',
      version: 'stable',
      description: 'Python language support with IntelliSense, linting, and debugging.',
      author: { name: 'Microsoft' },
      license: 'MIT',
      categories: ['language', 'debugger'],
      keywords: ['python', 'intellisense', 'debug'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:python'],
      contributes: {
        languages: [
          { id: 'python', extensions: ['.py', '.pyw'], aliases: ['Python', 'py'] },
        ],
        commands: [
          { command: 'python.runFile', title: 'Run Python File' },
          { command: 'python.debugFile', title: 'Debug Python File' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 1850000,
    rating: 4.7,
    ratingCount: 41000,
    publishedDate: Date.now() - 900 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 9 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'rust-analyzer',
      name: 'rust-analyzer',
      displayName: 'Rust Analyzer',
      version: 'stable',
      description: 'Rust language server with diagnostics, navigation, and refactoring tools.',
      author: { name: 'Rust Analyzer' },
      license: 'MIT',
      categories: ['language'],
      keywords: ['rust', 'language server', 'lsp'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:rust'],
      contributes: {
        languages: [
          { id: 'rust', extensions: ['.rs'], aliases: ['Rust', 'rs'] },
        ],
        commands: [
          { command: 'rust-analyzer.run', title: 'Run Rust Project' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 720000,
    rating: 4.8,
    ratingCount: 12600,
    publishedDate: Date.now() - 520 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 15 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'tailwindcss-intellisense',
      name: 'tailwindcss-intellisense',
      displayName: 'Tailwind CSS IntelliSense',
      version: 'stable',
      description: 'Intelligent Tailwind CSS tooling with autocomplete and class previews.',
      author: { name: 'Tailwind Labs' },
      license: 'MIT',
      categories: ['language', 'utility'],
      keywords: ['tailwind', 'css', 'intellisense'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:html', 'onLanguage:javascript', 'onLanguage:typescript'],
      contributes: {
        commands: [
          { command: 'tailwind.showPreview', title: 'Show Tailwind Preview' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 610000,
    rating: 4.8,
    ratingCount: 10800,
    publishedDate: Date.now() - 480 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 11 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'docker',
      name: 'docker',
      displayName: 'Docker',
      version: 'stable',
      description: 'Build, run, and debug containers with Docker and Compose.',
      author: { name: 'Docker' },
      license: 'MIT',
      categories: ['utility'],
      keywords: ['docker', 'container', 'devops'],
      main: 'dist/extension.js',
      activationEvents: ['workspaceContains:**/Dockerfile', 'workspaceContains:**/docker-compose.yml'],
      contributes: {
        languages: [
          { id: 'dockerfile', extensions: ['Dockerfile'], aliases: ['Dockerfile'] },
        ],
        commands: [
          { command: 'docker.build', title: 'Build Image' },
          { command: 'docker.run', title: 'Run Container' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 570000,
    rating: 4.6,
    ratingCount: 9800,
    publishedDate: Date.now() - 650 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 16 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'jest',
      name: 'jest',
      displayName: 'Jest',
      version: 'stable',
      description: 'Run and debug Jest tests with inline status and coverage.',
      author: { name: 'Jest Community' },
      license: 'MIT',
      categories: ['testing'],
      keywords: ['jest', 'test', 'testing', 'unit test'],
      main: 'dist/extension.js',
      activationEvents: ['workspaceContains:**/jest.config.*'],
      contributes: {
        commands: [
          { command: 'jest.runAll', title: 'Run All Tests' },
          { command: 'jest.runFile', title: 'Run Tests in Current File' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 420000,
    rating: 4.5,
    ratingCount: 7600,
    publishedDate: Date.now() - 430 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 13 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'dracula-theme',
      name: 'dracula-theme',
      displayName: 'Dracula Official',
      version: 'stable',
      description: 'Dark theme with consistent colors across editors and terminals.',
      author: { name: 'Dracula Theme' },
      license: 'MIT',
      categories: ['theme'],
      keywords: ['theme', 'dracula', 'dark'],
      main: 'dist/extension.js',
      activationEvents: ['*'],
      contributes: {
        themes: [
          { id: 'dracula', label: 'Dracula', uiTheme: 'vs-dark', path: 'themes/dracula.json' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 980000,
    rating: 4.9,
    ratingCount: 28000,
    publishedDate: Date.now() - 980 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 20 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'react-snippets',
      name: 'es7-react-js-snippets',
      displayName: 'ES7+ React/Redux/React-Native Snippets',
      version: 'stable',
      description: 'Extensions for React, Redux and Graphql in JS/TS with ES7+ syntax.',
      author: { name: 'dsznajder' },
      license: 'MIT',
      categories: ['snippets', 'language'],
      keywords: ['react', 'snippets', 'redux', 'javascript'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:javascript', 'onLanguage:typescript', 'onLanguage:javascriptreact', 'onLanguage:typescriptreact'],
      contributes: {
        snippets: [
          { language: 'javascript', path: './snippets/snippets.json' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 2450000,
    rating: 4.8,
    ratingCount: 56000,
    publishedDate: Date.now() - 800 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 5 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'vscode-icons',
      name: 'vscode-icons',
      displayName: 'VSCode Icons',
      version: 'stable',
      description: 'Icons for Visual Studio Code.',
      author: { name: 'VSCode Icons Team' },
      license: 'MIT',
      categories: ['theme'],
      keywords: ['icons', 'theme', 'ui'],
      main: 'dist/extension.js',
      activationEvents: ['*'],
      contributes: {
        configuration: {
          title: 'VSCode Icons',
          properties: {
            'vsicons.dontShowNewVersionMessage': {
              type: 'boolean',
              default: false,
              description: 'Don\'t show the new version message.'
            }
          }
        }
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 3200000,
    rating: 4.9,
    ratingCount: 62000,
    publishedDate: Date.now() - 1200 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 30 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'xml-tools',
      name: 'xml-tools',
      displayName: 'XML Tools',
      version: 'stable',
      description: 'XML Formatting, XQuery, and XPath tools for VS Code.',
      author: { name: 'Josh Peterson' },
      license: 'MIT',
      categories: ['utility', 'formatter'],
      keywords: ['xml', 'formatting', 'xpath', 'xquery'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:xml'],
      contributes: {
        commands: [
          { command: 'xmlTools.formatXml', title: 'Format XML' },
          { command: 'xmlTools.evaluateXPath', title: 'Evaluate XPath' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 850000,
    rating: 4.5,
    ratingCount: 8400,
    publishedDate: Date.now() - 750 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 45 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'vetur',
      name: 'vetur',
      displayName: 'Vetur',
      version: 'stable',
      description: 'Vue tooling for VS Code.',
      author: { name: 'Pine Wu' },
      license: 'MIT',
      categories: ['language'],
      keywords: ['vue', 'vuejs', 'vetur'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:vue'],
      contributes: {
        languages: [
          { id: 'vue', extensions: ['.vue'], aliases: ['Vue', 'vue'] },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 1650000,
    rating: 4.7,
    ratingCount: 31000,
    publishedDate: Date.now() - 1100 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 60 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
];

const FEATURED_EXTENSION_IDS = new Set(FEATURED_EXTENSIONS.map(e => e.manifest.id));

const INSTALLED_STORAGE_KEY = 'themag_installed_extensions';
const MARKETPLACE_STORAGE_KEY = 'themag_marketplace_extensions';
const DRIVE_INSTALLED_FILE = 'extensions-installed.json';
const DRIVE_MARKETPLACE_FILE = 'extensions-marketplace.json';
const DRIVE_CONSENT_KEY = 'themag_drive_extensions_consent';
const DRIVE_SAVE_DEBOUNCE_MS = 1200;

const getDriveConsentKey = (driveEmail?: string | null) => `${DRIVE_CONSENT_KEY}_${driveEmail || 'default'}`;

class ExtensionService {
  private installedExtensions: Map<string, Extension> = new Map();
  private marketplaceExtensions: Map<string, MarketplaceExtension> = new Map();
  private listeners: Set<() => void> = new Set();
  private driveSyncEnabled = false;
  private driveSyncTimeout: ReturnType<typeof setTimeout> | null = null;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;
  private pendingDriveSync = false;
  private driveUserEmail: string | null = null;

  constructor() {
    this.loadInstalledExtensions();
    this.loadMarketplaceExtensions();
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

  private loadInstalledExtensions() {
    const saved = localStorage.getItem(INSTALLED_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Extension[];
        parsed.forEach(ext => this.installedExtensions.set(ext.manifest.id, ext));
      } catch {
        // Start fresh
      }
    }
  }

  private persistInstalledExtensions() {
    const extensions = Array.from(this.installedExtensions.values());
    localStorage.setItem(INSTALLED_STORAGE_KEY, JSON.stringify(extensions));
    if (this.pendingDriveSync) {
      this.queueDriveSync();
      this.pendingDriveSync = false;
    }
    this.saveTimeout = null;
  }

  private saveInstalledExtensions(skipDrive = false) {
    if (!skipDrive) {
      this.pendingDriveSync = true;
    }

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistInstalledExtensions();
    }, 1000);
  }

  private loadMarketplaceExtensions() {
    // Load featured extensions as base
    FEATURED_EXTENSIONS.forEach(ext => this.marketplaceExtensions.set(ext.manifest.id, ext));

    // Load any community-submitted extensions
    const saved = localStorage.getItem(MARKETPLACE_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MarketplaceExtension[];
        parsed.forEach(ext => this.marketplaceExtensions.set(ext.manifest.id, ext));
      } catch {
        // Use defaults only
      }
    }
  }

  private saveMarketplaceExtensions(skipDrive = false) {
    // Only save community extensions, not built-in ones
    const communityExtensions = Array.from(this.marketplaceExtensions.values())
      .filter(ext => !FEATURED_EXTENSION_IDS.has(ext.manifest.id));
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(communityExtensions));
    if (!skipDrive) {
      this.queueDriveSync();
    }
  }

  private getCommunityExtensions(): MarketplaceExtension[] {
    return Array.from(this.marketplaceExtensions.values())
      .filter(ext => !FEATURED_EXTENSION_IDS.has(ext.manifest.id));
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
    const installed = Array.from(this.installedExtensions.values());
    const community = this.getCommunityExtensions();
    await googleDriveService.upsertFileInFolder(
      settingsId,
      DRIVE_INSTALLED_FILE,
      JSON.stringify(installed),
      'application/json'
    );
    await googleDriveService.upsertFileInFolder(
      settingsId,
      DRIVE_MARKETPLACE_FILE,
      JSON.stringify(community),
      'application/json'
    );
  }

  private async hydrateFromDrive() {
    if (!googleDriveService.isConnected()) {
      return;
    }
    const consentKey = getDriveConsentKey(this.driveUserEmail);
    const consent = localStorage.getItem(consentKey);
    const { settingsId } = await googleDriveService.getFolderIds();

    const [installedPayload, marketplacePayload] = await Promise.all([
      googleDriveService.readFileByName(settingsId, DRIVE_INSTALLED_FILE),
      googleDriveService.readFileByName(settingsId, DRIVE_MARKETPLACE_FILE),
    ]);

    let hasDriveData = false;

    if (installedPayload) {
      try {
        const parsed = JSON.parse(installedPayload) as Extension[];
        this.installedExtensions.clear();
        parsed.forEach(ext => this.installedExtensions.set(ext.manifest.id, ext));
        this.saveInstalledExtensions(true);
        hasDriveData = true;
      } catch {
        // Ignore malformed drive payloads.
      }
    }

    if (marketplacePayload) {
      try {
        const parsed = JSON.parse(marketplacePayload) as MarketplaceExtension[];
        this.marketplaceExtensions.clear();
        FEATURED_EXTENSIONS.forEach(ext => this.marketplaceExtensions.set(ext.manifest.id, ext));
        parsed.forEach(ext => this.marketplaceExtensions.set(ext.manifest.id, ext));
        this.saveMarketplaceExtensions(true);
        hasDriveData = true;
      } catch {
        // Ignore malformed drive payloads.
      }
    }

    if (hasDriveData) {
      this.driveSyncEnabled = true;
      localStorage.setItem(consentKey, 'enabled');
      this.notify();
      return;
    }

    if (consent === 'declined') {
      this.driveSyncEnabled = false;
      return;
    }

    const hasLocalData = this.installedExtensions.size > 0 || this.getCommunityExtensions().length > 0;
    if (!consent && hasLocalData) {
      const shouldUpload = window.confirm(
        'Upload your installed extensions and marketplace submissions to Google Drive?'
      );
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

  private async storeExtensionBundle(manifest: ExtensionManifest, sourceCode: string) {
    if (!this.driveSyncEnabled || !googleDriveService.isConnected()) {
      return;
    }
    try {
      const { extensionsId } = await googleDriveService.getFolderIds();
      const bundle = zipSync({
        'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
        'source.ts': strToU8(sourceCode),
      });
      const blob = new Blob([bundle], { type: 'application/zip' });
      await googleDriveService.upsertBinaryInFolder(
        extensionsId,
        `${manifest.id}.zip`,
        blob,
        'application/zip'
      );
    } catch {
      // Ignore bundle upload errors for now.
    }
  }

  // Marketplace Methods
  getMarketplaceExtensions(category?: ExtensionCategory): MarketplaceExtension[] {
    const extensions = Array.from(this.marketplaceExtensions.values())
      .filter(ext => ext.status === 'approved');

    if (category) {
      return extensions.filter(ext => ext.manifest.categories.includes(category));
    }
    return extensions;
  }

  searchMarketplace(query: string): MarketplaceExtension[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.marketplaceExtensions.values())
      .filter(ext => ext.status === 'approved')
      .filter(ext =>
        ext.manifest.name.toLowerCase().includes(lowerQuery) ||
        ext.manifest.displayName.toLowerCase().includes(lowerQuery) ||
        ext.manifest.description.toLowerCase().includes(lowerQuery) ||
        ext.manifest.keywords.some(k => k.toLowerCase().includes(lowerQuery))
      );
  }

  getFeaturedExtensions(): MarketplaceExtension[] {
    return FEATURED_EXTENSIONS.slice(0, 6);
  }

  getTrendingExtensions(): MarketplaceExtension[] {
    return Array.from(this.marketplaceExtensions.values())
      .filter(ext => ext.status === 'approved')
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 8);
  }

  async getPublicBundleUrl(extensionId: string): Promise<string | null> {
    if (!googleDriveService.isConnected()) {
      return null;
    }

    const installed = this.installedExtensions.get(extensionId);
    const marketplace = this.marketplaceExtensions.get(extensionId);
    const manifest = installed?.manifest || marketplace?.manifest;
    if (!manifest) return null;

    try {
      const { extensionsId } = await googleDriveService.getFolderIds();
      const bundle = zipSync({
        'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
      });
      const blob = new Blob([bundle], { type: 'application/zip' });
      const file = await googleDriveService.upsertBinaryInFolder(
        extensionsId,
        `${manifest.id}.zip`,
        blob,
        'application/zip'
      );
      if (!file?.id) return null;
      return googleDriveService.getPublicDownloadUrl(file.id);
    } catch {
      return null;
    }
  }

  // Installation Methods
  getInstalledExtensions(): Extension[] {
    return Array.from(this.installedExtensions.values());
  }

  isInstalled(extensionId: string): boolean {
    return this.installedExtensions.has(extensionId);
  }

  async installExtension(extensionId: string): Promise<boolean> {
    const marketplaceExt = this.marketplaceExtensions.get(extensionId);
    if (!marketplaceExt || marketplaceExt.status !== 'approved') {
      return false;
    }

    const extension: Extension = {
      manifest: marketplaceExt.manifest,
      installed: true,
      enabled: true,
      installDate: Date.now(),
    };

    this.installedExtensions.set(extensionId, extension);

    // Update download count
    marketplaceExt.downloads += 1;

    this.saveInstalledExtensions();
    this.saveMarketplaceExtensions();
    this.notify();
    return true;
  }

  uninstallExtension(extensionId: string): boolean {
    if (this.installedExtensions.has(extensionId)) {
      this.installedExtensions.delete(extensionId);
      this.saveInstalledExtensions();
      this.notify();
      return true;
    }
    return false;
  }

  enableExtension(extensionId: string): boolean {
    const ext = this.installedExtensions.get(extensionId);
    if (ext) {
      ext.enabled = true;
      this.saveInstalledExtensions();
      this.notify();
      return true;
    }
    return false;
  }

  disableExtension(extensionId: string): boolean {
    const ext = this.installedExtensions.get(extensionId);
    if (ext) {
      ext.enabled = false;
      this.saveInstalledExtensions();
      this.notify();
      return true;
    }
    return false;
  }

  // Publishing/Upload Methods
  async submitExtension(upload: ExtensionUpload): Promise<{ success: boolean; message: string }> {
    // Validate manifest
    if (!this.validateManifest(upload.manifest)) {
      return { success: false, message: 'Invalid extension manifest' };
    }

    // Check if extension already exists
    if (this.marketplaceExtensions.has(upload.manifest.id)) {
      return { success: false, message: 'Extension with this ID already exists' };
    }

    // Create marketplace entry with pending status
    const marketplaceExt: MarketplaceExtension = {
      manifest: upload.manifest,
      status: 'scanning',
      downloads: 0,
      rating: 0,
      ratingCount: 0,
      publishedDate: Date.now(),
      lastUpdated: Date.now(),
    };

    this.marketplaceExtensions.set(upload.manifest.id, marketplaceExt);

    // Simulate LLM safety scan (in real app, this would be async server-side)
    setTimeout(() => {
      this.performSafetyScan(upload.manifest.id, upload.sourceCode);
    }, 2000);

    this.saveMarketplaceExtensions();
    await this.storeExtensionBundle(upload.manifest, upload.sourceCode);
    this.notify();
    return { success: true, message: 'Extension submitted for review. Safety scan in progress...' };
  }

  private validateManifest(manifest: ExtensionManifest): boolean {
    return !!(
      manifest.id &&
      manifest.name &&
      manifest.displayName &&
      manifest.version &&
      manifest.description &&
      manifest.author?.name &&
      manifest.license &&
      manifest.categories?.length > 0 &&
      manifest.main &&
      manifest.engines?.themag
    );
  }

  private async performSafetyScan(extensionId: string, sourceCode: string): Promise<void> {
    const ext = this.marketplaceExtensions.get(extensionId);
    if (!ext) return;

    // Simulated safety checks (in production, use actual LLM analysis)
    const issues: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /eval\s*\(/g, issue: 'Uses eval() which can execute arbitrary code' },
      { pattern: /new\s+Function\s*\(/g, issue: 'Uses Function constructor which can execute arbitrary code' },
      { pattern: /document\.cookie/g, issue: 'Accesses cookies' },
      { pattern: /localStorage\.getItem\(['"](?!themag)/g, issue: 'Accesses non-extension localStorage keys' },
      { pattern: /fetch\s*\([^)]*(?!api\.themag)/g, issue: 'Makes external network requests' },
      { pattern: /child_process/g, issue: 'Attempts to spawn child processes' },
      { pattern: /require\s*\(['"]fs['"]\)/g, issue: 'Attempts to access file system directly' },
    ];

    for (const { pattern, issue } of dangerousPatterns) {
      // Yield to main thread to avoid blocking UI
      await new Promise(resolve => setTimeout(resolve, 0));

      if (pattern.test(sourceCode)) {
        issues.push(issue);
      }
    }

    ext.scanReport = {
      safe: issues.length === 0,
      issues,
      scannedAt: Date.now(),
    };

    ext.status = issues.length === 0 ? 'approved' : 'rejected';
    this.saveMarketplaceExtensions();
    this.notify();
  }

  getExtensionById(id: string): MarketplaceExtension | undefined {
    return this.marketplaceExtensions.get(id);
  }

  rateExtension(extensionId: string, rating: number): boolean {
    const ext = this.marketplaceExtensions.get(extensionId);
    if (ext && rating >= 1 && rating <= 5) {
      const totalRating = ext.rating * ext.ratingCount + rating;
      ext.ratingCount += 1;
      ext.rating = totalRating / ext.ratingCount;
      this.saveMarketplaceExtensions();
      this.notify();
      return true;
    }
    return false;
  }
}

export const extensionService = new ExtensionService();
export default extensionService;
