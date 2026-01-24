// Extension/Plugin Service for TheMAG.dev

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

// Built-in/Featured Extensions
const FEATURED_EXTENSIONS: MarketplaceExtension[] = [
  {
    manifest: {
      id: 'themag.prettier',
      name: 'prettier',
      displayName: 'Prettier - Code Formatter',
      version: '2.0.0',
      description: 'Code formatter using prettier',
      author: { name: 'TheMAG.dev' },
      license: 'MIT',
      categories: ['formatter'],
      keywords: ['format', 'prettier', 'beautify'],
      main: 'dist/extension.js',
      activationEvents: ['onLanguage:javascript', 'onLanguage:typescript'],
      contributes: {
        commands: [
          { command: 'prettier.format', title: 'Format Document' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 45230,
    rating: 4.8,
    ratingCount: 1250,
    publishedDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 7 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.eslint',
      name: 'eslint',
      displayName: 'ESLint',
      version: '3.0.0',
      description: 'Integrates ESLint JavaScript into TheMAG.dev',
      author: { name: 'TheMAG.dev' },
      license: 'MIT',
      categories: ['linter'],
      keywords: ['eslint', 'lint', 'javascript'],
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
    downloads: 62150,
    rating: 4.9,
    ratingCount: 2100,
    publishedDate: Date.now() - 120 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 3 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.gitlens',
      name: 'gitlens',
      displayName: 'GitLens - Git Supercharged',
      version: '1.5.0',
      description: 'Supercharge Git within TheMAG.dev',
      author: { name: 'TheMAG.dev' },
      license: 'MIT',
      categories: ['git'],
      keywords: ['git', 'blame', 'history', 'diff'],
      main: 'dist/extension.js',
      activationEvents: ['*'],
      contributes: {
        commands: [
          { command: 'gitlens.blame', title: 'Toggle File Blame' },
          { command: 'gitlens.history', title: 'Show File History' },
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 38900,
    rating: 4.7,
    ratingCount: 980,
    publishedDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 14 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.python',
      name: 'python',
      displayName: 'Python',
      version: '2.0.0',
      description: 'Python language support with IntelliSense and debugging',
      author: { name: 'TheMAG.dev' },
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
        ],
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 51200,
    rating: 4.6,
    ratingCount: 1800,
    publishedDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 21 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.tailwind',
      name: 'tailwindcss-intellisense',
      displayName: 'Tailwind CSS IntelliSense',
      version: '1.0.0',
      description: 'Intelligent Tailwind CSS tooling',
      author: { name: 'TheMAG.dev' },
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
    downloads: 42100,
    rating: 4.9,
    ratingCount: 1450,
    publishedDate: Date.now() - 75 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 5 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.copilot-bridge',
      name: 'copilot-bridge',
      displayName: 'AI Copilot Bridge',
      version: '1.2.0',
      description: 'Connect external AI assistants to your editor',
      author: { name: 'Community' },
      license: 'MIT',
      categories: ['ai'],
      keywords: ['ai', 'copilot', 'assistant', 'code completion'],
      main: 'dist/extension.js',
      activationEvents: ['*'],
      contributes: {
        commands: [
          { command: 'copilot.suggest', title: 'Get AI Suggestion' },
          { command: 'copilot.explain', title: 'Explain Code' },
        ],
        configuration: {
          title: 'AI Copilot Bridge',
          properties: {
            'copilot.provider': {
              type: 'string',
              default: 'claude',
              description: 'AI provider to use',
            },
          },
        },
      },
      engines: { themag: '^1.0.0' },
    },
    status: 'approved',
    downloads: 28500,
    rating: 4.5,
    ratingCount: 720,
    publishedDate: Date.now() - 45 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 10 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.jest',
      name: 'jest',
      displayName: 'Jest Test Runner',
      version: '1.0.0',
      description: 'Run and debug Jest tests in TheMAG.dev',
      author: { name: 'Community' },
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
    downloads: 19800,
    rating: 4.4,
    ratingCount: 560,
    publishedDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 8 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
  {
    manifest: {
      id: 'themag.docker',
      name: 'docker',
      displayName: 'Docker',
      version: '1.0.0',
      description: 'Docker support for TheMAG.dev',
      author: { name: 'Community' },
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
    downloads: 15600,
    rating: 4.3,
    ratingCount: 410,
    publishedDate: Date.now() - 55 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now() - 18 * 24 * 60 * 60 * 1000,
    scanReport: { safe: true, issues: [], scannedAt: Date.now() },
  },
];

const INSTALLED_STORAGE_KEY = 'themag_installed_extensions';
const MARKETPLACE_STORAGE_KEY = 'themag_marketplace_extensions';

class ExtensionService {
  private installedExtensions: Map<string, Extension> = new Map();
  private marketplaceExtensions: Map<string, MarketplaceExtension> = new Map();

  constructor() {
    this.loadInstalledExtensions();
    this.loadMarketplaceExtensions();
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

  private saveInstalledExtensions() {
    const extensions = Array.from(this.installedExtensions.values());
    localStorage.setItem(INSTALLED_STORAGE_KEY, JSON.stringify(extensions));
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

  private saveMarketplaceExtensions() {
    // Only save community extensions, not built-in ones
    const communityExtensions = Array.from(this.marketplaceExtensions.values())
      .filter(ext => !FEATURED_EXTENSIONS.some(f => f.manifest.id === ext.manifest.id));
    localStorage.setItem(MARKETPLACE_STORAGE_KEY, JSON.stringify(communityExtensions));
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
    return true;
  }

  uninstallExtension(extensionId: string): boolean {
    if (this.installedExtensions.has(extensionId)) {
      this.installedExtensions.delete(extensionId);
      this.saveInstalledExtensions();
      return true;
    }
    return false;
  }

  enableExtension(extensionId: string): boolean {
    const ext = this.installedExtensions.get(extensionId);
    if (ext) {
      ext.enabled = true;
      this.saveInstalledExtensions();
      return true;
    }
    return false;
  }

  disableExtension(extensionId: string): boolean {
    const ext = this.installedExtensions.get(extensionId);
    if (ext) {
      ext.enabled = false;
      this.saveInstalledExtensions();
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
      return true;
    }
    return false;
  }
}

export const extensionService = new ExtensionService();
export default extensionService;
