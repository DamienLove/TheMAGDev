import React, { useState, useEffect } from 'react';
import extensionService, {
  MarketplaceExtension,
  Extension,
  ExtensionCategory,
  ExtensionManifest,
} from '../src/services/ExtensionService';

type ViewMode = 'discover' | 'installed' | 'publish' | 'docs';

const CATEGORIES: { id: ExtensionCategory; label: string; icon: string }[] = [
  { id: 'language', label: 'Languages', icon: 'code' },
  { id: 'theme', label: 'Themes', icon: 'palette' },
  { id: 'debugger', label: 'Debuggers', icon: 'bug_report' },
  { id: 'formatter', label: 'Formatters', icon: 'format_align_left' },
  { id: 'linter', label: 'Linters', icon: 'rule' },
  { id: 'ai', label: 'AI & Copilot', icon: 'smart_toy' },
  { id: 'git', label: 'Git', icon: 'source_environment' },
  { id: 'snippets', label: 'Snippets', icon: 'data_object' },
  { id: 'testing', label: 'Testing', icon: 'science' },
  { id: 'utility', label: 'Utilities', icon: 'handyman' },
];

const ExtensionMarketplace: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExtensionCategory | null>(null);
  const [extensions, setExtensions] = useState<MarketplaceExtension[]>([]);
  const [installedExtensions, setInstalledExtensions] = useState<Extension[]>([]);
  const [selectedExtension, setSelectedExtension] = useState<MarketplaceExtension | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [publishForm, setPublishForm] = useState({
    name: '',
    displayName: '',
    version: '1.0.0',
    description: '',
    authorName: '',
    license: 'MIT',
    category: 'utility' as ExtensionCategory,
    sourceCode: '',
  });

  useEffect(() => {
    loadExtensions();
    const unsubscribe = extensionService.onChange(() => loadExtensions());
    return () => unsubscribe();
  }, []);

  const loadExtensions = () => {
    setExtensions(extensionService.getMarketplaceExtensions());
    setInstalledExtensions(extensionService.getInstalledExtensions());
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setExtensions(extensionService.searchMarketplace(query));
      setSelectedCategory(null);
    } else {
      setExtensions(extensionService.getMarketplaceExtensions());
    }
  };

  const handleCategorySelect = (category: ExtensionCategory | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
    if (category) {
      setExtensions(extensionService.getMarketplaceExtensions(category));
    } else {
      setExtensions(extensionService.getMarketplaceExtensions());
    }
  };

  const handleInstall = async (extensionId: string) => {
    await extensionService.installExtension(extensionId);
    loadExtensions();
  };

  const handleUninstall = (extensionId: string) => {
    extensionService.uninstallExtension(extensionId);
    loadExtensions();
  };

  const handleToggleEnabled = (extensionId: string, enabled: boolean) => {
    if (enabled) {
      extensionService.enableExtension(extensionId);
    } else {
      extensionService.disableExtension(extensionId);
    }
    loadExtensions();
  };

  const handlePublish = async () => {
    if (!publishForm.name || !publishForm.displayName || !publishForm.description || !publishForm.sourceCode) {
      alert('Please fill in all required fields');
      return;
    }

    setPublishing(true);

    const manifest: ExtensionManifest = {
      id: `community.${publishForm.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: publishForm.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: publishForm.displayName,
      version: publishForm.version,
      description: publishForm.description,
      author: { name: publishForm.authorName || 'Anonymous' },
      license: publishForm.license,
      categories: [publishForm.category],
      keywords: publishForm.name.toLowerCase().split(/\s+/),
      main: 'dist/extension.js',
      activationEvents: ['*'],
      engines: { themag: '^1.0.0' },
    };

    const result = await extensionService.submitExtension({
      manifest,
      sourceCode: publishForm.sourceCode,
      publisherId: 'user-' + Date.now(),
    });

    setPublishing(false);

    if (result.success) {
      alert(result.message);
      setPublishForm({
        name: '',
        displayName: '',
        version: '1.0.0',
        description: '',
        authorName: '',
        license: 'MIT',
        category: 'utility',
        sourceCode: '',
      });
      loadExtensions();
    } else {
      alert('Error: ' + result.message);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`material-symbols-rounded text-sm ${i <= rating ? 'text-amber-400' : 'text-zinc-700'}`}
        >
          star
        </span>
      );
    }
    return stars;
  };

  const formatDownloads = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleDownload = async (extensionId: string) => {
    setDownloadingId(extensionId);
    const url = await extensionService.getPublicBundleUrl(extensionId);
    if (url) {
      window.open(url, '_blank', 'noopener');
    } else {
      alert('Connect Google Drive to download extension bundles.');
    }
    setDownloadingId(null);
  };

  const formatVersion = (version: string): string => {
    return /^\d/.test(version) ? `v${version}` : version;
  };

  const renderExtensionCard = (ext: MarketplaceExtension) => {
    const isInstalled = extensionService.isInstalled(ext.manifest.id);

    return (
      <div
        key={ext.manifest.id}
        className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
        onClick={() => setSelectedExtension(ext)}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-rounded text-indigo-400 text-2xl">extension</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-zinc-200 truncate">{ext.manifest.displayName}</h3>
              {isInstalled && (
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                  Installed
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">{ext.manifest.author.name}</p>
            <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{ext.manifest.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(ext.rating))}
                <span className="text-xs text-zinc-500 ml-1">({ext.ratingCount})</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-500">
                <span className="material-symbols-rounded text-sm">download</span>
                <span className="text-xs">{formatDownloads(ext.downloads)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex bg-zinc-950 h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-zinc-800">
          <span className="material-symbols-rounded text-indigo-500 mr-2">extension</span>
          <span className="text-sm font-bold text-zinc-200">Extensions</span>
        </div>

        {/* View Modes */}
        <div className="p-2 border-b border-zinc-800">
          {[
            { id: 'discover', label: 'Discover', icon: 'explore' },
            { id: 'installed', label: 'Installed', icon: 'check_circle' },
            { id: 'publish', label: 'Publish', icon: 'publish' },
            { id: 'docs', label: 'Developer Docs', icon: 'menu_book' },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                viewMode === mode.id
                  ? 'bg-indigo-500/10 text-indigo-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-rounded text-lg">{mode.icon}</span>
              <span className="text-sm">{mode.label}</span>
              {mode.id === 'installed' && (
                <span className="ml-auto bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded text-xs">
                  {installedExtensions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Categories (only in discover mode) */}
        {viewMode === 'discover' && (
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 py-1 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Categories
            </div>
            <button
              onClick={() => handleCategorySelect(null)}
              className={`w-full flex items-center gap-2 px-4 py-2 transition-colors ${
                !selectedCategory ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800/50'
              }`}
            >
              <span className="material-symbols-rounded text-lg">apps</span>
              <span className="text-sm">All Extensions</span>
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`w-full flex items-center gap-2 px-4 py-2 transition-colors ${
                  selectedCategory === cat.id ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-400 hover:bg-zinc-800/50'
                }`}
              >
                <span className="material-symbols-rounded text-lg">{cat.icon}</span>
                <span className="text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {viewMode === 'discover' && (
          <>
            {/* Search Bar */}
            <div className="p-4 border-b border-zinc-800">
              <div className="relative max-w-xl">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-zinc-500">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search extensions..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Extension Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {!searchQuery && !selectedCategory && (
                <>
                  {/* Featured Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-4">Featured</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extensionService.getFeaturedExtensions().map(renderExtensionCard)}
                    </div>
                  </div>

                  {/* Trending Section */}
                  <div>
                    <h2 className="text-lg font-bold text-white mb-4">Trending</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extensionService.getTrendingExtensions().slice(0, 6).map(renderExtensionCard)}
                    </div>
                  </div>
                </>
              )}

              {(searchQuery || selectedCategory) && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">
                    {searchQuery ? `Results for "${searchQuery}"` : CATEGORIES.find(c => c.id === selectedCategory)?.label}
                  </h2>
                  {extensions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                      <span className="material-symbols-rounded text-4xl mb-2 block">search_off</span>
                      No extensions found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {extensions.map(renderExtensionCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {viewMode === 'installed' && (
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-bold text-white mb-4">Installed Extensions</h2>
            {installedExtensions.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <span className="material-symbols-rounded text-4xl mb-2 block">extension_off</span>
                No extensions installed
                <button
                  onClick={() => setViewMode('discover')}
                  className="block mx-auto mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"
                >
                  Browse Extensions
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {installedExtensions.map(ext => (
                  <div key={ext.manifest.id} className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <span className="material-symbols-rounded text-indigo-400">extension</span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-zinc-200">{ext.manifest.displayName}</div>
                          <div className="text-xs text-zinc-500">{formatVersion(ext.manifest.version)} • {ext.manifest.author.name}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleEnabled(ext.manifest.id, !ext.enabled)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${ext.enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${ext.enabled ? 'left-6' : 'left-1'}`} />
                        </button>
                        <button
                          onClick={() => handleUninstall(ext.manifest.id)}
                          className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs font-medium"
                        >
                          Uninstall
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'publish' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-white mb-1">Publish Extension</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Submit your extension to the TheMAG.dev marketplace. Extensions are automatically scanned for safety.
              </p>

              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Extension Name *</label>
                    <input
                      type="text"
                      value={publishForm.name}
                      onChange={(e) => setPublishForm({ ...publishForm, name: e.target.value })}
                      placeholder="my-extension"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Display Name *</label>
                    <input
                      type="text"
                      value={publishForm.displayName}
                      onChange={(e) => setPublishForm({ ...publishForm, displayName: e.target.value })}
                      placeholder="My Extension"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Version</label>
                    <input
                      type="text"
                      value={publishForm.version}
                      onChange={(e) => setPublishForm({ ...publishForm, version: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
                    <select
                      value={publishForm.category}
                      onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value as ExtensionCategory })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">License</label>
                    <select
                      value={publishForm.license}
                      onChange={(e) => setPublishForm({ ...publishForm, license: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="MIT">MIT</option>
                      <option value="Apache-2.0">Apache 2.0</option>
                      <option value="GPL-3.0">GPL 3.0</option>
                      <option value="BSD-3-Clause">BSD 3-Clause</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Author Name</label>
                  <input
                    type="text"
                    value={publishForm.authorName}
                    onChange={(e) => setPublishForm({ ...publishForm, authorName: e.target.value })}
                    placeholder="Your name or organization"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description *</label>
                  <textarea
                    value={publishForm.description}
                    onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                    placeholder="Describe what your extension does..."
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Source Code *</label>
                  <textarea
                    value={publishForm.sourceCode}
                    onChange={(e) => setPublishForm({ ...publishForm, sourceCode: e.target.value })}
                    placeholder="// Paste your extension source code here..."
                    rows={10}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium text-sm flex items-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <span className="material-symbols-rounded animate-spin text-lg">progress_activity</span>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-rounded text-lg">publish</span>
                        Submit for Review
                      </>
                    )}
                  </button>
                  <span className="text-xs text-zinc-500">
                    Your extension will be scanned by AI for safety before publishing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'docs' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold text-white mb-1">Extension Development Guide</h2>
              <p className="text-sm text-zinc-500 mb-6">
                Learn how to create and publish extensions for TheMAG.dev
              </p>

              <div className="space-y-6">
                {/* Getting Started */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-rounded text-indigo-400">rocket_launch</span>
                    Getting Started
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    TheMAG.dev extensions are JavaScript modules that can add new features, languages, themes, and tools to the IDE.
                  </p>
                  <div className="bg-zinc-950 rounded p-4 font-mono text-sm">
                    <div className="text-zinc-500">// Basic extension structure</div>
                    <div className="text-blue-400">export function <span className="text-amber-400">activate</span>(<span className="text-zinc-300">context</span>) {'{'}</div>
                    <div className="text-zinc-400 pl-4">// Your extension code here</div>
                    <div className="text-zinc-400 pl-4">console.log('Extension activated!');</div>
                    <div className="text-blue-400">{'}'}</div>
                    <div className="mt-2 text-blue-400">export function <span className="text-amber-400">deactivate</span>() {'{'}</div>
                    <div className="text-zinc-400 pl-4">// Cleanup code</div>
                    <div className="text-blue-400">{'}'}</div>
                  </div>
                </div>

                {/* Extension Manifest */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-rounded text-indigo-400">description</span>
                    Extension Manifest
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Every extension needs a manifest that describes its metadata and capabilities.
                  </p>
                  <div className="bg-zinc-950 rounded p-4 font-mono text-sm overflow-x-auto">
                    <pre className="text-zinc-300">{`{
  "id": "your-publisher.extension-name",
  "name": "extension-name",
  "displayName": "My Extension",
  "version": "1.0.0",
  "description": "What your extension does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "categories": ["utility"],
  "keywords": ["helpful", "keywords"],
  "main": "dist/extension.js",
  "activationEvents": ["*"],
  "contributes": {
    "commands": [
      {
        "command": "myExtension.doSomething",
        "title": "Do Something"
      }
    ]
  },
  "engines": {
    "themag": "^1.0.0"
  }
}`}</pre>
                  </div>
                </div>

                {/* API Reference */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
                  <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-rounded text-indigo-400">api</span>
                    API Reference
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 mb-2">Commands</h4>
                      <p className="text-sm text-zinc-400">
                        Register commands that users can invoke via the command palette.
                      </p>
                      <div className="bg-zinc-950 rounded p-3 mt-2 font-mono text-xs">
                        <span className="text-zinc-300">themag.commands.registerCommand('myCommand', callback);</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 mb-2">Editor</h4>
                      <p className="text-sm text-zinc-400">
                        Access and manipulate the active editor.
                      </p>
                      <div className="bg-zinc-950 rounded p-3 mt-2 font-mono text-xs">
                        <span className="text-zinc-300">themag.editor.getActiveEditor();</span><br />
                        <span className="text-zinc-300">themag.editor.insertText(text);</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 mb-2">Workspace</h4>
                      <p className="text-sm text-zinc-400">
                        Work with files and folders in the workspace.
                      </p>
                      <div className="bg-zinc-950 rounded p-3 mt-2 font-mono text-xs">
                        <span className="text-zinc-300">themag.workspace.openFile(path);</span><br />
                        <span className="text-zinc-300">themag.workspace.getOpenFiles();</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200 mb-2">UI</h4>
                      <p className="text-sm text-zinc-400">
                        Show messages, inputs, and other UI elements.
                      </p>
                      <div className="bg-zinc-950 rounded p-3 mt-2 font-mono text-xs">
                        <span className="text-zinc-300">themag.ui.showMessage('Hello!');</span><br />
                        <span className="text-zinc-300">themag.ui.showInput('Enter value');</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Guidelines */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
                  <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
                    <span className="material-symbols-rounded text-amber-400">security</span>
                    Safety Guidelines
                  </h3>
                  <p className="text-sm text-amber-200/80 mb-4">
                    All extensions are scanned by AI before publishing. To ensure approval:
                  </p>
                  <ul className="space-y-2 text-sm text-amber-200/70">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-amber-400 text-sm mt-0.5">close</span>
                      Don't use <code className="bg-amber-500/20 px-1 rounded">eval()</code> or <code className="bg-amber-500/20 px-1 rounded">new Function()</code>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-amber-400 text-sm mt-0.5">close</span>
                      Don't access <code className="bg-amber-500/20 px-1 rounded">document.cookie</code> or other sensitive browser APIs
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-amber-400 text-sm mt-0.5">close</span>
                      Don't make unauthorized network requests
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-emerald-400 text-sm mt-0.5">check</span>
                      Do use the provided TheMAG.dev APIs for all operations
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-rounded text-emerald-400 text-sm mt-0.5">check</span>
                      Do document your extension's functionality clearly
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Extension Detail Modal */}
      {selectedExtension && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <span className="material-symbols-rounded text-indigo-400 text-3xl">extension</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{selectedExtension.manifest.displayName}</h2>
                  <p className="text-sm text-zinc-500">{selectedExtension.manifest.author.name} • {formatVersion(selectedExtension.manifest.version)}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      {renderStars(Math.round(selectedExtension.rating))}
                      <span className="text-sm text-zinc-500 ml-1">{selectedExtension.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-500">
                      <span className="material-symbols-rounded text-sm">download</span>
                      <span className="text-sm">{formatDownloads(selectedExtension.downloads)} downloads</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExtension(null)}
                  className="p-2 text-zinc-500 hover:text-zinc-300"
                >
                  <span className="material-symbols-rounded">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-zinc-300 mb-6">{selectedExtension.manifest.description}</p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedExtension.manifest.categories.map(cat => (
                      <span key={cat} className="px-2 py-1 bg-zinc-800 text-zinc-300 rounded text-xs">
                        {CATEGORIES.find(c => c.id === cat)?.label || cat}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedExtension.manifest.contributes?.commands && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Commands</h4>
                    <div className="space-y-1">
                      {selectedExtension.manifest.contributes.commands.map(cmd => (
                        <div key={cmd.command} className="text-sm text-zinc-400">
                          • {cmd.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">License:</span>
                    <span className="text-zinc-300 ml-2">{selectedExtension.manifest.license}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Last Updated:</span>
                    <span className="text-zinc-300 ml-2">
                      {new Date(selectedExtension.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedExtension(null)}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedExtension.manifest.id)}
                disabled={downloadingId === selectedExtension.manifest.id}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded font-medium flex items-center gap-2"
              >
                {downloadingId === selectedExtension.manifest.id ? (
                  <>
                    <span className="material-symbols-rounded animate-spin text-lg">progress_activity</span>
                    Preparing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-lg">download</span>
                    Download Bundle
                  </>
                )}
              </button>
              {extensionService.isInstalled(selectedExtension.manifest.id) ? (
                <button
                  onClick={() => {
                    handleUninstall(selectedExtension.manifest.id);
                    setSelectedExtension(null);
                  }}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded font-medium"
                >
                  Uninstall
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleInstall(selectedExtension.manifest.id);
                    setSelectedExtension(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                >
                  Install
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionMarketplace;
