import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: 'on' | 'off' | 'wordWrapColumn';
  lineNumbers: 'on' | 'off' | 'relative';
  minimap: boolean;
  bracketPairColorization: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
  formatOnSave: boolean;
  theme: 'themag-dark' | 'vs-dark' | 'vs-light';
}

export interface TerminalSettings {
  fontSize: number;
  fontFamily: string;
  cursorStyle: 'block' | 'bar' | 'underline';
  cursorBlink: boolean;
  scrollback: number;
  shell: string;
  defaultCwd: string;
}

export interface DebugSettings {
  autoExpandLocals: boolean;
  showInlineValues: boolean;
  allowBreakpointsEverywhere: boolean;
  openDebugOnBreak: boolean;
}

export interface AISettings {
  activeProviderId: string | null;
  streamResponses: boolean;
  showTokenUsage: boolean;
  autoContext: boolean;
  contextMaxFiles: number;
  systemPromptPrefix: string;
}

export interface ExplorerSettings {
  sortOrder: 'name' | 'type' | 'modified';
  showHiddenFiles: boolean;
  compactFolders: boolean;
  autoReveal: boolean;
}

export interface GeneralSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  language: string;
  telemetry: boolean;
  autoUpdate: boolean;
  confirmOnExit: boolean;
}

export interface AppSettings {
  editor: EditorSettings;
  terminal: TerminalSettings;
  debug: DebugSettings;
  ai: AISettings;
  explorer: ExplorerSettings;
  general: GeneralSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  editor: {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    minimap: true,
    bracketPairColorization: true,
    autoSave: false,
    autoSaveDelay: 1000,
    formatOnSave: false,
    theme: 'themag-dark',
  },
  terminal: {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    cursorStyle: 'bar',
    cursorBlink: true,
    scrollback: 1000,
    shell: 'bash',
    defaultCwd: '~',
  },
  debug: {
    autoExpandLocals: true,
    showInlineValues: true,
    allowBreakpointsEverywhere: false,
    openDebugOnBreak: true,
  },
  ai: {
    activeProviderId: null,
    streamResponses: true,
    showTokenUsage: true,
    autoContext: true,
    contextMaxFiles: 5,
    systemPromptPrefix: '',
  },
  explorer: {
    sortOrder: 'type',
    showHiddenFiles: false,
    compactFolders: true,
    autoReveal: true,
  },
  general: {
    theme: 'dark',
    accentColor: '#6366f1',
    language: 'en',
    telemetry: false,
    autoUpdate: true,
    confirmOnExit: true,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  updateTerminalSettings: (settings: Partial<TerminalSettings>) => void;
  updateDebugSettings: (settings: Partial<DebugSettings>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  updateExplorerSettings: (settings: Partial<ExplorerSettings>) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => boolean;
}

const STORAGE_KEY = 'themag_settings';

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateEditorSettings = useCallback((newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({
      ...prev,
      editor: { ...prev.editor, ...newSettings },
    }));
  }, []);

  const updateTerminalSettings = useCallback((newSettings: Partial<TerminalSettings>) => {
    setSettings(prev => ({
      ...prev,
      terminal: { ...prev.terminal, ...newSettings },
    }));
  }, []);

  const updateDebugSettings = useCallback((newSettings: Partial<DebugSettings>) => {
    setSettings(prev => ({
      ...prev,
      debug: { ...prev.debug, ...newSettings },
    }));
  }, []);

  const updateAISettings = useCallback((newSettings: Partial<AISettings>) => {
    setSettings(prev => ({
      ...prev,
      ai: { ...prev.ai, ...newSettings },
    }));
  }, []);

  const updateExplorerSettings = useCallback((newSettings: Partial<ExplorerSettings>) => {
    setSettings(prev => ({
      ...prev,
      explorer: { ...prev.explorer, ...newSettings },
    }));
  }, []);

  const updateGeneralSettings = useCallback((newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, ...newSettings },
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
