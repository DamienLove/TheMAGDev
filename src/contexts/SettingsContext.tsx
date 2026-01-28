import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import googleDriveService from '../services/GoogleDriveService';

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
const DRIVE_SETTINGS_FILE = 'app-settings.json';
const DRIVE_SETTINGS_CONSENT_KEY = 'themag_drive_settings_consent';
const DRIVE_SAVE_DEBOUNCE_MS = 1200;

const getDriveConsentKey = (driveEmail?: string | null) => `${DRIVE_SETTINGS_CONSENT_KEY}_${driveEmail || 'default'}`;

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
  const [driveStatus, setDriveStatus] = useState(() => googleDriveService.getSyncStatus());
  const [driveUserEmail, setDriveUserEmail] = useState<string | null>(null);
  const [driveWriteEnabled, setDriveWriteEnabled] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    return googleDriveService.onSyncStatusChange(setDriveStatus);
  }, []);

  useEffect(() => {
    let active = true;
    if (!driveStatus.connected) {
      setDriveUserEmail(null);
      setDriveWriteEnabled(false);
      return;
    }
    googleDriveService.getUserInfo().then((info) => {
      if (active) {
        setDriveUserEmail(info?.email ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [driveStatus.connected]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromDrive = async () => {
      if (!driveStatus.connected) return;
      const consentKey = getDriveConsentKey(driveUserEmail);
      const consent = localStorage.getItem(consentKey);
      try {
        const { settingsId } = await googleDriveService.getFolderIds();
        const payload = await googleDriveService.readFileByName(settingsId, DRIVE_SETTINGS_FILE);
        if (payload) {
          try {
            const parsed = JSON.parse(payload);
            if (!cancelled) {
              setSettings({ ...DEFAULT_SETTINGS, ...parsed });
              setDriveWriteEnabled(true);
              localStorage.setItem(consentKey, 'enabled');
            }
            return;
          } catch {
            // fall back to local settings
          }
        }

        if (consent === 'declined') {
          if (!cancelled) {
            setDriveWriteEnabled(false);
          }
          return;
        }

        const hasLocalSettings = Boolean(localStorage.getItem(STORAGE_KEY));
        if (!consent && hasLocalSettings) {
          const shouldUpload = window.confirm(
            'Upload your local settings to Google Drive so they sync across devices?'
          );
          if (!shouldUpload) {
            localStorage.setItem(consentKey, 'declined');
            if (!cancelled) {
              setDriveWriteEnabled(false);
            }
            return;
          }
        }

        await googleDriveService.upsertFileInFolder(
          (await googleDriveService.getFolderIds()).settingsId,
          DRIVE_SETTINGS_FILE,
          JSON.stringify(settingsRef.current),
          'application/json'
        );
        localStorage.setItem(consentKey, 'enabled');
        if (!cancelled) {
          setDriveWriteEnabled(true);
        }
      } catch {
        if (!cancelled) {
          setDriveWriteEnabled(false);
        }
      }
    };

    hydrateFromDrive();
    return () => {
      cancelled = true;
    };
  }, [driveStatus.connected, driveUserEmail]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    if (driveStatus.connected && driveWriteEnabled) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const { settingsId } = await googleDriveService.getFolderIds();
          await googleDriveService.upsertFileInFolder(
            settingsId,
            DRIVE_SETTINGS_FILE,
            JSON.stringify(settingsRef.current),
            'application/json'
          );
        } catch {
          // Ignore drive sync errors here; status is tracked elsewhere.
        }
      }, DRIVE_SAVE_DEBOUNCE_MS);
    }
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
