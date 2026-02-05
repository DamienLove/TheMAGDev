import React, { useState, useEffect } from 'react';
import { useSettings } from '../src/contexts/SettingsContext';
import aiProvider, { AIProviderConfig, MCPServer, PROVIDER_MODELS, AIProviderType } from '../src/services/AIProvider';
import googleDriveService, { type DriveSyncStatus, type DriveUserInfo } from '../src/services/GoogleDriveService';

type SettingsTab = 'general' | 'editor' | 'terminal' | 'debug' | 'ai' | 'explorer' | 'mcp' | 'integrations';

const Settings: React.FC = () => {
  const {
    settings,
    updateEditorSettings,
    updateTerminalSettings,
    updateDebugSettings,
    updateAISettings,
    updateExplorerSettings,
    updateGeneralSettings,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [providers, setProviders] = useState<AIProviderConfig[]>([]);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [newMCPServer, setNewMCPServer] = useState<Partial<MCPServer>>({});
  const [showMCPForm, setShowMCPForm] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveSyncStatus>(() => googleDriveService.getSyncStatus());
  const [driveUser, setDriveUser] = useState<DriveUserInfo | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveFolderLink, setDriveFolderLink] = useState<string | null>(null);
  const hasDriveConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    setProviders(aiProvider.getProviders());
  }, []);

  useEffect(() => {
    return googleDriveService.onSyncStatusChange(setDriveStatus);
  }, []);

  useEffect(() => {
    let active = true;
    if (!driveStatus.connected) {
      setDriveUser(null);
      setDriveFolderLink(null);
      return;
    }
    googleDriveService.getUserInfo().then((info) => {
      if (active) {
        setDriveUser(info);
      }
    });
    return () => {
      active = false;
    };
  }, [driveStatus.connected]);

  useEffect(() => {
    if (!driveStatus.connected) {
      return;
    }
    const existingLink = googleDriveService.getRootFolderLink();
    if (existingLink) {
      setDriveFolderLink(existingLink);
      return;
    }
    googleDriveService.getFolderIds().then(() => {
      setDriveFolderLink(googleDriveService.getRootFolderLink());
    });
  }, [driveStatus.connected]);

  const handleProviderUpdate = (id: string, updates: Partial<AIProviderConfig>) => {
    aiProvider.updateProvider(id, updates);
    setProviders(aiProvider.getProviders());
  };

  const handleAddMCPServer = (providerId: string) => {
    if (newMCPServer.name && newMCPServer.command) {
      const server: MCPServer = {
        id: `mcp-${Date.now()}`,
        name: newMCPServer.name,
        command: newMCPServer.command,
        args: newMCPServer.args?.toString().split(' ') || [],
        env: {},
        enabled: true,
      };
      aiProvider.addMCPServer(providerId, server);
      setProviders(aiProvider.getProviders());
      setNewMCPServer({});
      setShowMCPForm(null);
    }
  };

  const handleRemoveMCPServer = (providerId: string, serverId: string) => {
    aiProvider.removeMCPServer(providerId, serverId);
    setProviders(aiProvider.getProviders());
  };

  const handleSetActiveProvider = (id: string) => {
    aiProvider.setActiveProvider(id);
    updateAISettings({ activeProviderId: id });
  };

  const handleDriveToggle = async () => {
    if (!hasDriveConfig) {
      return;
    }
    if (driveStatus.connected) {
      googleDriveService.disconnect();
      setDriveUser(null);
      return;
    }
    setDriveLoading(true);
    const connected = await googleDriveService.connect();
    if (connected) {
      const info = await googleDriveService.getUserInfo();
      setDriveUser(info);
    }
    setDriveLoading(false);
  };

  const handleExport = () => {
    const data = exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'themag-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importSettings(importText)) {
      setShowImport(false);
      setImportText('');
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general', label: 'General', icon: 'tune' },
    { id: 'integrations', label: 'Integrations', icon: 'cloud' },
    { id: 'editor', label: 'Editor', icon: 'code' },
    { id: 'terminal', label: 'Terminal', icon: 'terminal' },
    { id: 'debug', label: 'Debug', icon: 'bug_report' },
    { id: 'ai', label: 'AI Providers', icon: 'smart_toy' },
    { id: 'mcp', label: 'MCP Servers', icon: 'hub' },
    { id: 'explorer', label: 'Explorer', icon: 'folder' },
  ];

  const renderToggle = (value: boolean, onChange: (val: boolean) => void) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-zinc-700'}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'left-6' : 'left-1'}`}
      />
    </button>
  );

  const renderSelect = (
    value: string,
    options: { value: string; label: string }[],
    onChange: (val: string) => void
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const renderNumberInput = (value: number, onChange: (val: number) => void, min?: number, max?: number) => (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      className="w-24 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
    />
  );

  const renderSettingRow = (label: string, description: string, control: React.ReactNode) => (
    <div className="flex items-center justify-between py-3 border-b border-zinc-800/50">
      <div>
        <div className="text-sm text-zinc-200">{label}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
      </div>
      {control}
    </div>
  );

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '—';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const driveDescription = driveStatus.connected
    ? `Workspace, extensions, SDKs, plugins, assets, and modules synced to My Drive/TheMAG.dev${driveUser?.email ? ` (${driveUser.email})` : ''}.`
    : hasDriveConfig
      ? 'Connect Google Drive to sync and browse your entire My Drive/TheMAG.dev workspace (requires full Drive access).'
      : 'Set VITE_GOOGLE_CLIENT_ID to enable Drive sync.';

  const driveButtonLabel = driveLoading
    ? 'Connecting...'
    : driveStatus.connected
      ? 'Disconnect'
      : 'Connect';

  return (
    <div className="flex-1 flex bg-zinc-950 h-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="h-14 px-4 flex items-center border-b border-zinc-800">
          <span className="material-symbols-rounded text-indigo-500 mr-2">settings</span>
          <span className="text-sm font-bold text-zinc-200">Settings</span>
        </div>
        <nav className="flex-1 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-400 border-r-2 border-indigo-500'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-rounded text-lg">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors"
          >
            <span className="material-symbols-rounded text-sm">download</span>
            Export Settings
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-medium transition-colors"
          >
            <span className="material-symbols-rounded text-sm">upload</span>
            Import Settings
          </button>
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs font-medium transition-colors"
          >
            <span className="material-symbols-rounded text-sm">restart_alt</span>
            Reset to Defaults
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">General Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure application-wide preferences</p>

              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Theme',
                  'Choose your preferred color theme',
                  renderSelect(settings.general.theme, [
                    { value: 'dark', label: 'Dark' },
                    { value: 'light', label: 'Light' },
                    { value: 'system', label: 'System' },
                  ], (val) => updateGeneralSettings({ theme: val as any }))
                )}
                {renderSettingRow(
                  'Accent Color',
                  'Primary accent color for UI elements',
                  <input
                    type="color"
                    value={settings.general.accentColor}
                    onChange={(e) => updateGeneralSettings({ accentColor: e.target.value })}
                    className="w-10 h-8 rounded border border-zinc-700 cursor-pointer"
                  />
                )}
                {renderSettingRow(
                  'Auto Update',
                  'Automatically check for and install updates',
                  renderToggle(settings.general.autoUpdate, (val) => updateGeneralSettings({ autoUpdate: val }))
                )}
                {renderSettingRow(
                  'Confirm on Exit',
                  'Show confirmation dialog when closing with unsaved changes',
                  renderToggle(settings.general.confirmOnExit, (val) => updateGeneralSettings({ confirmOnExit: val }))
                )}
                {renderSettingRow(
                  'Telemetry',
                  'Help improve TheMAG.dev by sending anonymous usage data',
                  renderToggle(settings.general.telemetry, (val) => updateGeneralSettings({ telemetry: val }))
                )}
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Integrations</h2>
              <p className="text-sm text-zinc-500 mb-6">Connect cloud services and external storage</p>

              <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-rounded">cloud_done</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-200">Google Drive</div>
                      <div className="text-xs text-zinc-500">{driveDescription}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {driveStatus.connected && driveFolderLink && (
                      <button
                        onClick={() => window.open(driveFolderLink, '_blank', 'noopener')}
                        className="px-3 py-1.5 rounded text-xs font-medium border border-zinc-700 text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        Open Folder
                      </button>
                    )}
                    <button
                      onClick={handleDriveToggle}
                      disabled={!hasDriveConfig || driveLoading}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                        driveStatus.connected
                          ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
                          : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                      } ${(!hasDriveConfig || driveLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {driveButtonLabel}
                    </button>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 text-xs text-zinc-500">
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-600">Account</div>
                    <div className="mt-2 text-zinc-200">{driveUser?.displayName || 'Not connected'}</div>
                    <div className="text-zinc-500">{driveUser?.email || '—'}</div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-600">Storage</div>
                    <div className="mt-2 text-zinc-200">
                      {formatBytes(driveUser?.storageQuota?.usageInDrive)} used
                    </div>
                    <div className="text-zinc-500">
                      {formatBytes(driveUser?.storageQuota?.limit)} total
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-600">Workspace Sync</div>
                    <div className="mt-2 text-zinc-200">
                      {driveStatus.connected ? 'Enabled' : 'Disabled'}
                    </div>
                    <div className="text-zinc-500">
                      {driveStatus.lastSync ? new Date(driveStatus.lastSync).toLocaleString() : 'Not synced yet'}
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                    <div className="uppercase tracking-widest text-[10px] text-zinc-600">Status</div>
                    <div className="mt-2 text-zinc-200">
                      {driveStatus.syncInProgress ? 'Syncing...' : (driveStatus.error ? 'Error' : 'Idle')}
                    </div>
                    <div className="text-zinc-500">{driveStatus.error || 'All clear'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editor Settings */}
          {activeTab === 'editor' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Editor Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">Customize the code editor experience</p>

              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Font Size',
                  'Editor font size in pixels',
                  renderNumberInput(settings.editor.fontSize, (val) => updateEditorSettings({ fontSize: val }), 8, 32)
                )}
                {renderSettingRow(
                  'Font Family',
                  'Editor font family',
                  <input
                    type="text"
                    value={settings.editor.fontFamily}
                    onChange={(e) => updateEditorSettings({ fontFamily: e.target.value })}
                    className="w-64 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                )}
                {renderSettingRow(
                  'Tab Size',
                  'Number of spaces per tab',
                  renderNumberInput(settings.editor.tabSize, (val) => updateEditorSettings({ tabSize: val }), 1, 8)
                )}
                {renderSettingRow(
                  'Word Wrap',
                  'How lines should wrap',
                  renderSelect(settings.editor.wordWrap, [
                    { value: 'on', label: 'On' },
                    { value: 'off', label: 'Off' },
                    { value: 'wordWrapColumn', label: 'At Column' },
                  ], (val) => updateEditorSettings({ wordWrap: val as any }))
                )}
                {renderSettingRow(
                  'Line Numbers',
                  'Show line numbers in the editor',
                  renderSelect(settings.editor.lineNumbers, [
                    { value: 'on', label: 'On' },
                    { value: 'off', label: 'Off' },
                    { value: 'relative', label: 'Relative' },
                  ], (val) => updateEditorSettings({ lineNumbers: val as any }))
                )}
                {renderSettingRow(
                  'Minimap',
                  'Show minimap overview',
                  renderToggle(settings.editor.minimap, (val) => updateEditorSettings({ minimap: val }))
                )}
                {renderSettingRow(
                  'Bracket Colorization',
                  'Colorize matching brackets',
                  renderToggle(settings.editor.bracketPairColorization, (val) => updateEditorSettings({ bracketPairColorization: val }))
                )}
                {renderSettingRow(
                  'Auto Save',
                  'Automatically save files',
                  renderToggle(settings.editor.autoSave, (val) => updateEditorSettings({ autoSave: val }))
                )}
                {renderSettingRow(
                  'Format on Save',
                  'Format code when saving',
                  renderToggle(settings.editor.formatOnSave, (val) => updateEditorSettings({ formatOnSave: val }))
                )}
              </div>
            </div>
          )}

          {/* Terminal Settings */}
          {activeTab === 'terminal' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Terminal Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure the integrated terminal</p>

              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Font Size',
                  'Terminal font size in pixels',
                  renderNumberInput(settings.terminal.fontSize, (val) => updateTerminalSettings({ fontSize: val }), 8, 24)
                )}
                {renderSettingRow(
                  'Font Family',
                  'Terminal font family',
                  <input
                    type="text"
                    value={settings.terminal.fontFamily}
                    onChange={(e) => updateTerminalSettings({ fontFamily: e.target.value })}
                    className="w-64 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                  />
                )}
                {renderSettingRow(
                  'Cursor Style',
                  'Terminal cursor style',
                  renderSelect(settings.terminal.cursorStyle, [
                    { value: 'block', label: 'Block' },
                    { value: 'bar', label: 'Bar' },
                    { value: 'underline', label: 'Underline' },
                  ], (val) => updateTerminalSettings({ cursorStyle: val as any }))
                )}
                {renderSettingRow(
                  'Cursor Blink',
                  'Enable cursor blinking',
                  renderToggle(settings.terminal.cursorBlink, (val) => updateTerminalSettings({ cursorBlink: val }))
                )}
                {renderSettingRow(
                  'Scrollback',
                  'Number of lines to keep in scrollback',
                  renderNumberInput(settings.terminal.scrollback, (val) => updateTerminalSettings({ scrollback: val }), 100, 10000)
                )}
                {renderSettingRow(
                  'Default Shell',
                  'Shell to use in terminal',
                  renderSelect(settings.terminal.shell, [
                    { value: 'bash', label: 'Bash' },
                    { value: 'zsh', label: 'Zsh' },
                    { value: 'powershell', label: 'PowerShell' },
                    { value: 'cmd', label: 'Command Prompt' },
                  ], (val) => updateTerminalSettings({ shell: val }))
                )}
              </div>
            </div>
          )}

          {/* Debug Settings */}
          {activeTab === 'debug' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Debug Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure debugging behavior</p>

              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Auto Expand Locals',
                  'Automatically expand local variables in debugger',
                  renderToggle(settings.debug.autoExpandLocals, (val) => updateDebugSettings({ autoExpandLocals: val }))
                )}
                {renderSettingRow(
                  'Show Inline Values',
                  'Show variable values inline during debugging',
                  renderToggle(settings.debug.showInlineValues, (val) => updateDebugSettings({ showInlineValues: val }))
                )}
                {renderSettingRow(
                  'Breakpoints Everywhere',
                  'Allow breakpoints in any file',
                  renderToggle(settings.debug.allowBreakpointsEverywhere, (val) => updateDebugSettings({ allowBreakpointsEverywhere: val }))
                )}
                {renderSettingRow(
                  'Open Debug on Break',
                  'Automatically open debug panel when breakpoint is hit',
                  renderToggle(settings.debug.openDebugOnBreak, (val) => updateDebugSettings({ openDebugOnBreak: val }))
                )}
              </div>
            </div>
          )}

          {/* AI Provider Settings */}
          {activeTab === 'ai' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">AI Providers</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure AI assistants and API keys</p>

              <div className="space-y-4">
                {providers.map(provider => (
                  <div key={provider.id} className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          provider.type === 'claude' ? 'bg-orange-500/20 text-orange-400' :
                          provider.type === 'openai' ? 'bg-emerald-500/20 text-emerald-400' :
                          provider.type === 'gemini' ? 'bg-blue-500/20 text-blue-400' :
                          provider.type === 'perplexity' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-zinc-700 text-zinc-400'
                        }`}>
                          <span className="material-symbols-rounded">smart_toy</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-200">{provider.name}</div>
                          <div className="text-xs text-zinc-500">{provider.model}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {provider.apiKey && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Configured
                          </span>
                        )}
                        <button
                          onClick={() => handleSetActiveProvider(provider.id)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            settings.ai.activeProviderId === provider.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {settings.ai.activeProviderId === provider.id ? 'Active' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => setEditingProvider(editingProvider === provider.id ? null : provider.id)}
                          className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded"
                        >
                          <span className="material-symbols-rounded text-lg">
                            {editingProvider === provider.id ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {editingProvider === provider.id && (
                      <div className="px-4 pb-4 pt-2 border-t border-zinc-800 space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">API Key</label>
                          <input
                            type="password"
                            value={provider.apiKey || ''}
                            onChange={(e) => handleProviderUpdate(provider.id, { apiKey: e.target.value })}
                            placeholder={`Enter your ${provider.name} API key`}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-zinc-400 mb-1.5">Model</label>
                          <select
                            value={provider.model}
                            onChange={(e) => handleProviderUpdate(provider.id, { model: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                          >
                            {PROVIDER_MODELS[provider.type]?.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>

                        {provider.type === 'ollama' && (
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">API Endpoint</label>
                            <input
                              type="text"
                              value={provider.apiEndpoint || 'http://localhost:11434'}
                              onChange={(e) => handleProviderUpdate(provider.id, { apiEndpoint: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Max Tokens</label>
                            <input
                              type="number"
                              value={provider.maxTokens || 4096}
                              onChange={(e) => handleProviderUpdate(provider.id, { maxTokens: Number(e.target.value) })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Temperature</label>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              value={provider.temperature || 0.7}
                              onChange={(e) => handleProviderUpdate(provider.id, { temperature: Number(e.target.value) })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Behavior Settings */}
              <h3 className="text-sm font-bold text-zinc-300 mt-8 mb-4">AI Behavior</h3>
              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Stream Responses',
                  'Show AI responses as they are generated',
                  renderToggle(settings.ai.streamResponses, (val) => updateAISettings({ streamResponses: val }))
                )}
                {renderSettingRow(
                  'Show Token Usage',
                  'Display token count for each request',
                  renderToggle(settings.ai.showTokenUsage, (val) => updateAISettings({ showTokenUsage: val }))
                )}
                {renderSettingRow(
                  'Auto Context',
                  'Automatically include relevant files in AI context',
                  renderToggle(settings.ai.autoContext, (val) => updateAISettings({ autoContext: val }))
                )}
                {renderSettingRow(
                  'Max Context Files',
                  'Maximum number of files to include in context',
                  renderNumberInput(settings.ai.contextMaxFiles, (val) => updateAISettings({ contextMaxFiles: val }), 1, 20)
                )}
              </div>
            </div>
          )}

          {/* MCP Server Settings */}
          {activeTab === 'mcp' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">MCP Servers</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure Model Context Protocol servers for enhanced AI capabilities</p>

              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-rounded text-indigo-400">info</span>
                  <div>
                    <div className="text-sm font-medium text-indigo-300">About MCP Servers</div>
                    <div className="text-xs text-indigo-400/80 mt-1">
                      MCP (Model Context Protocol) servers extend AI capabilities by providing access to external tools,
                      databases, and APIs. Each provider can have its own set of MCP servers configured.
                    </div>
                  </div>
                </div>
              </div>

              {providers.map(provider => (
                <div key={provider.id} className="bg-zinc-900 rounded-lg border border-zinc-800 mb-4 overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-zinc-500">smart_toy</span>
                      <span className="text-sm font-medium text-zinc-200">{provider.name}</span>
                      <span className="text-xs text-zinc-500">({provider.mcpServers.length} servers)</span>
                    </div>
                    <button
                      onClick={() => setShowMCPForm(showMCPForm === provider.id ? null : provider.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
                    >
                      <span className="material-symbols-rounded text-sm">add</span>
                      Add Server
                    </button>
                  </div>

                  {showMCPForm === provider.id && (
                    <div className="p-4 bg-zinc-950 border-b border-zinc-800">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Server Name</label>
                          <input
                            type="text"
                            value={newMCPServer.name || ''}
                            onChange={(e) => setNewMCPServer({ ...newMCPServer, name: e.target.value })}
                            placeholder="e.g., filesystem"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Command</label>
                          <input
                            type="text"
                            value={newMCPServer.command || ''}
                            onChange={(e) => setNewMCPServer({ ...newMCPServer, command: e.target.value })}
                            placeholder="e.g., npx"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="block text-xs text-zinc-500 mb-1">Arguments (space-separated)</label>
                        <input
                          type="text"
                          value={newMCPServer.args || ''}
                          onChange={(e) => setNewMCPServer({ ...newMCPServer, args: e.target.value.split(' ') })}
                          placeholder="e.g., @anthropic/mcp-server-filesystem /path/to/dir"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setShowMCPForm(null); setNewMCPServer({}); }}
                          className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddMCPServer(provider.id)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm"
                        >
                          Add Server
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-2">
                    {provider.mcpServers.length === 0 ? (
                      <div className="text-center py-6 text-zinc-600 text-sm">
                        No MCP servers configured
                      </div>
                    ) : (
                      provider.mcpServers.map(server => (
                        <div key={server.id} className="flex items-center justify-between p-2 rounded hover:bg-zinc-800">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${server.enabled ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                            <div>
                              <div className="text-sm text-zinc-200">{server.name}</div>
                              <div className="text-xs text-zinc-500 font-mono">{server.command} {server.args.join(' ')}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderToggle(server.enabled, (val) => {
                              const idx = provider.mcpServers.findIndex(s => s.id === server.id);
                              if (idx >= 0) {
                                provider.mcpServers[idx].enabled = val;
                                handleProviderUpdate(provider.id, { mcpServers: [...provider.mcpServers] });
                              }
                            })}
                            <button
                              onClick={() => handleRemoveMCPServer(provider.id, server.id)}
                              className="p-1 text-zinc-500 hover:text-red-400"
                            >
                              <span className="material-symbols-rounded text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Explorer Settings */}
          {activeTab === 'explorer' && (
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Explorer Settings</h2>
              <p className="text-sm text-zinc-500 mb-6">Configure file explorer behavior</p>

              <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                {renderSettingRow(
                  'Sort Order',
                  'How to sort files in the explorer',
                  renderSelect(settings.explorer.sortOrder, [
                    { value: 'name', label: 'Name' },
                    { value: 'type', label: 'Type' },
                    { value: 'modified', label: 'Modified Date' },
                  ], (val) => updateExplorerSettings({ sortOrder: val as any }))
                )}
                {renderSettingRow(
                  'Show Hidden Files',
                  'Display files starting with a dot',
                  renderToggle(settings.explorer.showHiddenFiles, (val) => updateExplorerSettings({ showHiddenFiles: val }))
                )}
                {renderSettingRow(
                  'Compact Folders',
                  'Collapse single-child folders into one',
                  renderToggle(settings.explorer.compactFolders, (val) => updateExplorerSettings({ compactFolders: val }))
                )}
                {renderSettingRow(
                  'Auto Reveal',
                  'Automatically reveal active file in explorer',
                  renderToggle(settings.explorer.autoReveal, (val) => updateExplorerSettings({ autoReveal: val }))
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-700 w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Import Settings</h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste your settings JSON here..."
              className="w-full h-48 bg-zinc-950 border border-zinc-700 rounded p-3 text-sm text-zinc-200 font-mono focus:border-indigo-500 focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowImport(false); setImportText(''); }}
                className="px-4 py-2 text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
