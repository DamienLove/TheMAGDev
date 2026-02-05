import React, { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useWorkspace } from './WorkspaceContext';

interface MonacoEditorProps {
  className?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ className }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { activeFile, getFileByPath, getFileContent, updateFileContent, saveFile, unsavedFiles } = useWorkspace();

  // Ref to track the latest activeFile for the command handler
  const activeFileRef = useRef(activeFile);
  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  // Ref to track the latest saveFile for the command handler
  const saveFileRef = useRef(saveFile);
  useEffect(() => {
    saveFileRef.current = saveFile;
  }, [saveFile]);

  // Refs for debouncing
  const pendingUpdateRef = useRef<{ path: string; content: string } | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const file = activeFile ? getFileByPath(activeFile) : null;
  const content = activeFile ? getFileContent(activeFile) : '';

  const flushUpdate = useCallback(() => {
    if (pendingUpdateRef.current) {
      const { path, content } = pendingUpdateRef.current;
      updateFileContent(path, content);
      pendingUpdateRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, [updateFileContent]);

  // Flush pending updates when activeFile changes or component unmounts
  useEffect(() => {
    return () => {
      flushUpdate();
    };
  }, [activeFile, flushUpdate]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define TheMAG dark theme
    monaco.editor.defineTheme('themag-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818cf8' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: 'f472b6' },
        { token: 'type', foreground: 'fbbf24' },
        { token: 'function', foreground: '60a5fa' },
        { token: 'variable', foreground: 'f4f4f5' },
        { token: 'operator', foreground: 'a78bfa' },
      ],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#e4e4e7',
        'editor.lineHighlightBackground': '#18181b',
        'editor.selectionBackground': '#3f3f4640',
        'editorCursor.foreground': '#818cf8',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#a1a1aa',
        'editor.inactiveSelectionBackground': '#27272a40',
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
        'editorWhitespace.foreground': '#27272a',
        'editorWidget.background': '#18181b',
        'editorWidget.border': '#27272a',
        'input.background': '#09090b',
        'input.border': '#27272a',
        'focusBorder': '#6366f1',
        'list.activeSelectionBackground': '#6366f120',
        'list.hoverBackground': '#27272a40',
      },
    });

    monaco.editor.setTheme('themag-dark');

    // Configure editor settings
    editor.updateOptions({
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontSize: 13,
      lineHeight: 22,
      letterSpacing: 0.3,
      fontLigatures: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      minimap: { enabled: true, scale: 1 },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      padding: { top: 16, bottom: 16 },
      stickyScroll: { enabled: true },
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Flush any pending updates first.
      // This synchronously calls updateFileContent, which schedules a React state update for 'files'.
      flushUpdate();

      const currentActiveFile = activeFileRef.current;
      const currentSaveFile = saveFileRef.current;

      if (currentActiveFile) {
        // We call saveFile immediately.
        // Note: saveFile only updates 'unsavedFiles' state and does NOT persist to storage directly.
        // The actual persistence is handled by a useEffect in WorkspaceContext that reacts to 'files' changes.
        // React batches the 'files' update (from flushUpdate) and 'unsavedFiles' update (from saveFile),
        // so the resulting state is consistent (files updated, unsaved flag cleared), triggering the persistence effect.
        currentSaveFile(currentActiveFile);
      }
    });
  };

  const handleChange: OnChange = useCallback((value) => {
    if (activeFile && value !== undefined) {
      pendingUpdateRef.current = { path: activeFile, content: value };

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        flushUpdate();
      }, 1000);
    }
  }, [activeFile, flushUpdate]);

  // Focus editor when file changes
  useEffect(() => {
    if (editorRef.current && activeFile) {
      editorRef.current.focus();
    }
  }, [activeFile]);

  if (!activeFile || !file) {
    return (
      <div className={`flex items-center justify-center h-full bg-zinc-950 ${className}`}>
        <div className="text-center">
          <span className="material-symbols-rounded text-6xl text-zinc-800 mb-4 block">code</span>
          <p className="text-zinc-600 text-sm">Select a file to start editing</p>
          <p className="text-zinc-700 text-xs mt-2">Use the explorer on the left to browse files</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full ${className}`}>
      {unsavedFiles.has(activeFile) && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-500">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Unsaved
        </div>
      )}
      <Editor
        height="100%"
        language={file.language || 'plaintext'}
        value={content || ''}
        onChange={handleChange}
        onMount={handleEditorMount}
        loading={
          <div className="flex items-center justify-center h-full bg-zinc-950">
            <div className="flex items-center gap-2 text-zinc-500">
              <span className="material-symbols-rounded animate-spin">progress_activity</span>
              Loading editor...
            </div>
          </div>
        }
        options={{
          readOnly: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default MonacoEditor;
