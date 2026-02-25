import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import { useWorkspace, FileNode } from './WorkspaceContext';

interface FileExplorerProps {
  className?: string;
  onPopOut?: () => void;
  onOpenWindow?: () => void;
}

const getFileIcon = (name: string, type: 'file' | 'folder', isExpanded?: boolean): { icon: string; color: string } => {
  if (type === 'folder') {
    return { icon: isExpanded ? 'folder_open' : 'folder', color: 'text-amber-400' };
  }

  const ext = name.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, { icon: string; color: string }> = {
    tsx: { icon: 'code', color: 'text-blue-400' },
    ts: { icon: 'code', color: 'text-blue-400' },
    jsx: { icon: 'code', color: 'text-yellow-400' },
    js: { icon: 'code', color: 'text-yellow-400' },
    json: { icon: 'data_object', color: 'text-emerald-400' },
    css: { icon: 'palette', color: 'text-pink-400' },
    scss: { icon: 'palette', color: 'text-pink-400' },
    html: { icon: 'html', color: 'text-orange-400' },
    md: { icon: 'description', color: 'text-zinc-400' },
    svg: { icon: 'image', color: 'text-purple-400' },
    png: { icon: 'image', color: 'text-purple-400' },
    jpg: { icon: 'image', color: 'text-purple-400' },
    py: { icon: 'code', color: 'text-green-400' },
    rs: { icon: 'code', color: 'text-orange-400' },
    go: { icon: 'code', color: 'text-cyan-400' },
  };

  return iconMap[ext || ''] || { icon: 'description', color: 'text-zinc-500' };
};

const FileCreationInput: React.FC<{
  type: 'file' | 'folder';
  depth?: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}> = ({ type, depth = 0, onSubmit, onCancel }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    onSubmit(value);
  };

  return (
    <div
      className="flex items-center gap-1.5 py-1 px-2"
      style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
    >
      <span className={`material-symbols-rounded text-sm ${type === 'folder' ? 'text-amber-400' : 'text-zinc-500'}`}>
        {type === 'folder' ? 'folder' : 'description'}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder={type === 'folder' ? 'folder name' : 'file name'}
        className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-1 py-0.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  isActive: boolean;
  isExpanded: boolean;
  hasUnsaved: boolean;
  isRenaming: boolean;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void;
  onRenameSubmit: (name: string) => void;
  onRenameCancel: () => void;
}

const FileTreeItem = memo(({
  node,
  depth,
  isActive,
  isExpanded,
  hasUnsaved,
  isRenaming,
  onToggle,
  onOpen,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel
}: FileTreeItemProps) => {
  const { icon, color } = getFileIcon(node.name, node.type, isExpanded);
  const [localName, setLocalName] = useState(node.name);

  useEffect(() => {
    if (isRenaming) {
      setLocalName(node.name);
    }
  }, [isRenaming, node.name]);

  const handleSubmit = () => {
    onRenameSubmit(localName);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
          onToggle(node.path);
        } else {
          onOpen(node.path);
        }
      }}
      onContextMenu={(e) => onContextMenu(e, node.path, node.type)}
      className={`
        flex items-center gap-1.5 py-1 px-2 rounded text-xs cursor-pointer group
        ${isActive
          ? 'bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-l-2 border-transparent'
        }
      `}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      {node.type === 'folder' && (
        <span className="material-symbols-rounded text-xs text-zinc-600">
          {isExpanded ? 'expand_more' : 'chevron_right'}
        </span>
      )}
      <span className={`material-symbols-rounded text-sm ${color}`}>{icon}</span>

      {isRenaming ? (
        <input
          type="text"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-1 py-0.5 text-xs text-white focus:outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate">{node.name}</span>
      )}

      {hasUnsaved && !isRenaming && (
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
      )}
    </div>
  );
});

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  expandedFolders: Set<string>;
  activeFile: string | null;
  unsavedFiles: Set<string>;
  renaming: string | null;
  creating: { parentPath: string; type: 'file' | 'folder' } | null;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void;
  onRenameSubmit: (name: string) => void;
  onRenameCancel: () => void;
  onCommitCreate: (name: string) => void;
  onCancelCreate: () => void;
}

const FileTreeNode = memo(({
  node,
  depth,
  expandedFolders,
  activeFile,
  unsavedFiles,
  renaming,
  creating,
  onToggle,
  onOpen,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
  onCommitCreate,
  onCancelCreate
}: FileTreeNodeProps) => {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeFile === node.path;
  const hasUnsaved = unsavedFiles.has(node.path);
  const isRenaming = renaming === node.path;
  const isCreatingHere = creating?.parentPath === node.path;

  return (
    <div>
      <FileTreeItem
        node={node}
        depth={depth}
        isActive={isActive}
        isExpanded={isExpanded}
        hasUnsaved={hasUnsaved}
        isRenaming={isRenaming}
        onToggle={onToggle}
        onOpen={onOpen}
        onContextMenu={onContextMenu}
        onRenameSubmit={onRenameSubmit}
        onRenameCancel={onRenameCancel}
      />

      {node.type === 'folder' && isExpanded && (
        <>
          {isCreatingHere && creating && (
            <FileCreationInput
              type={creating.type}
              depth={depth + 1}
              onSubmit={onCommitCreate}
              onCancel={onCancelCreate}
            />
          )}
          {node.children && node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              activeFile={activeFile}
              unsavedFiles={unsavedFiles}
              renaming={renaming}
              creating={creating}
              onToggle={onToggle}
              onOpen={onOpen}
              onContextMenu={onContextMenu}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              onCommitCreate={onCommitCreate}
              onCancelCreate={onCancelCreate}
            />
          ))}
        </>
      )}
    </div>
  );
});

const FileExplorer: React.FC<FileExplorerProps> = ({ className, onPopOut, onOpenWindow }) => {
  const {
    files,
    activeFile,
    openFile,
    createFile,
    deleteFile,
    renameFile,
    unsavedFiles
  } = useWorkspace();

  // Bolt Optimization: Stabilize callbacks to prevent unnecessary re-renders of the file tree
  // caused by WorkspaceContext updates (e.g. typing in editor).
  const openFileRef = useRef(openFile);
  const createFileRef = useRef(createFile);
  const deleteFileRef = useRef(deleteFile);
  const renameFileRef = useRef(renameFile);

  // Update refs when context functions change (which is frequent)
  // This allows us to pass stable callbacks to children.
  useEffect(() => {
    openFileRef.current = openFile;
    createFileRef.current = createFile;
    deleteFileRef.current = deleteFile;
    renameFileRef.current = renameFile;
  }, [openFile, createFile, deleteFile, renameFile]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/src/components', '/src/hooks']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: 'file' | 'folder' } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [creating, setCreating] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleOpen = useCallback((path: string) => {
    openFileRef.current(path);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent, path: string, type: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, path, type });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleRename = useCallback((path: string) => {
    setRenaming(path);
    closeContextMenu();
  }, [closeContextMenu]);

  const submitRename = useCallback((name: string) => {
    if (renaming && name.trim()) {
      renameFileRef.current(renaming, name.trim());
    }
    setRenaming(null);
  }, [renaming]);

  const onRenameCancel = useCallback(() => {
    setRenaming(null);
  }, []);

  const handleDelete = useCallback((path: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteFileRef.current(path);
    }
    closeContextMenu();
  }, [closeContextMenu]);

  const handleCreate = useCallback((parentPath: string, type: 'file' | 'folder') => {
    setCreating({ parentPath, type });
    // Bolt Optimization: Functional update avoids dependency on expandedFolders
    setExpandedFolders(prev => {
      if (prev.has(parentPath)) return prev;
      return new Set(prev).add(parentPath);
    });
    closeContextMenu();
  }, [closeContextMenu]);

  const submitCreate = useCallback((name: string) => {
    if (creating && name.trim()) {
      createFileRef.current(creating.parentPath, name.trim(), creating.type);
    }
    setCreating(null);
  }, [creating]);

  const cancelCreate = useCallback(() => {
    setCreating(null);
  }, []);


  return (
    <div className={`flex flex-col h-full ${className}`} onClick={closeContextMenu}>
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-zinc-800/50 shrink-0">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Explorer</span>
        <div className="flex items-center gap-1">
          {onPopOut && (
            <button
              onClick={onPopOut}
              className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded"
              title="Pop out"
            >
              <span className="material-symbols-rounded text-sm">open_in_new</span>
            </button>
          )}
          {onOpenWindow && (
            <button
              onClick={onOpenWindow}
              className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded"
              title="Open in new window"
            >
              <span className="material-symbols-rounded text-sm">launch</span>
            </button>
          )}
          <button
            onClick={() => handleCreate('/', 'file')}
            className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded"
            title="New File"
          >
            <span className="material-symbols-rounded text-sm">note_add</span>
          </button>
          <button
            onClick={() => handleCreate('/', 'folder')}
            className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded"
            title="New Folder"
          >
            <span className="material-symbols-rounded text-sm">create_new_folder</span>
          </button>
          <button
            className="p-1 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded"
            title="Refresh"
          >
            <span className="material-symbols-rounded text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Project Name */}
      <div className="px-3 py-2 border-b border-zinc-800/30">
        <div className="flex items-center gap-1.5 text-zinc-200">
          <span className="material-symbols-rounded text-sm text-indigo-400">deployed_code</span>
          <span className="text-xs font-bold uppercase tracking-tight">themag-framework</span>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {creating?.parentPath === '/' && creating && (
          <div className="ml-2">
            <FileCreationInput
              type={creating.type}
              onSubmit={submitCreate}
              onCancel={cancelCreate}
            />
          </div>
        )}
        {files.map(node => (
          <FileTreeNode
            key={node.path}
            node={node}
            depth={0}
            expandedFolders={expandedFolders}
            activeFile={activeFile}
            unsavedFiles={unsavedFiles}
            renaming={renaming}
            creating={creating}
            onToggle={toggleFolder}
            onOpen={handleOpen}
            onContextMenu={handleContextMenu}
            onRenameSubmit={submitRename}
            onRenameCancel={onRenameCancel}
            onCommitCreate={submitCreate}
            onCancelCreate={cancelCreate}
          />
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'folder' && (
            <>
              <button
                onClick={() => handleCreate(contextMenu.path, 'file')}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 text-left"
              >
                <span className="material-symbols-rounded text-sm">note_add</span>
                New File
              </button>
              <button
                onClick={() => handleCreate(contextMenu.path, 'folder')}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 text-left"
              >
                <span className="material-symbols-rounded text-sm">create_new_folder</span>
                New Folder
              </button>
              <div className="h-px bg-zinc-800 my-1"></div>
            </>
          )}
          <button
            onClick={() => handleRename(contextMenu.path)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 text-left"
          >
            <span className="material-symbols-rounded text-sm">edit</span>
            Rename
          </button>
          <button
            onClick={() => handleDelete(contextMenu.path)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-zinc-800 text-left"
          >
            <span className="material-symbols-rounded text-sm">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
