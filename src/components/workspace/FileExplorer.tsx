import React, { useState, useCallback, memo, useEffect } from 'react';
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
  newItemName: string;
  setNewItemName: (name: string) => void;
  onToggle: (path: string) => void;
  onOpen: (path: string) => void;
  onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void;
  onRenameSubmit: (name: string) => void;
  onRenameCancel: () => void;
  submitCreate: () => void;
  setCreating: (val: { parentPath: string; type: 'file' | 'folder' } | null) => void;
}

const FileTreeNode = memo(({
  node,
  depth,
  expandedFolders,
  activeFile,
  unsavedFiles,
  renaming,
  creating,
  newItemName,
  setNewItemName,
  onToggle,
  onOpen,
  onContextMenu,
  onRenameSubmit,
  onRenameCancel,
  submitCreate,
  setCreating
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
          {isCreatingHere && (
            <div
              className="flex items-center gap-1.5 py-1 px-2"
              style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              <span className={`material-symbols-rounded text-sm ${creating.type === 'folder' ? 'text-amber-400' : 'text-zinc-500'}`}>
                {creating.type === 'folder' ? 'folder' : 'description'}
              </span>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onBlur={submitCreate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitCreate();
                  if (e.key === 'Escape') { setCreating(null); setNewItemName(''); }
                }}
                placeholder={creating.type === 'folder' ? 'folder name' : 'file name'}
                className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-1 py-0.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
                autoFocus
              />
            </div>
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
              newItemName={newItemName}
              setNewItemName={setNewItemName}
              onToggle={onToggle}
              onOpen={onOpen}
              onContextMenu={onContextMenu}
              onRenameSubmit={onRenameSubmit}
              onRenameCancel={onRenameCancel}
              submitCreate={submitCreate}
              setCreating={setCreating}
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

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src', '/src/components', '/src/hooks']));
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; type: 'file' | 'folder' } | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  // Removed global newName state to prevent re-renders of the whole tree when typing
  const [creating, setCreating] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null);
  const [newItemName, setNewItemName] = useState('');

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
      renameFile(renaming, name.trim());
    }
    setRenaming(null);
  }, [renaming, renameFile]);

  const onRenameCancel = useCallback(() => {
    setRenaming(null);
  }, []);

  const handleDelete = useCallback((path: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteFile(path);
    }
    closeContextMenu();
  }, [deleteFile, closeContextMenu]);

  const handleCreate = useCallback((parentPath: string, type: 'file' | 'folder') => {
    setCreating({ parentPath, type });
    setNewItemName('');
    if (!expandedFolders.has(parentPath)) {
      setExpandedFolders(prev => new Set(prev).add(parentPath));
    }
    closeContextMenu();
  }, [expandedFolders, closeContextMenu]);

  const submitCreate = useCallback(() => {
    if (creating && newItemName.trim()) {
      createFile(creating.parentPath, newItemName.trim(), creating.type);
    }
    setCreating(null);
    setNewItemName('');
  }, [creating, newItemName, createFile]);


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
        {creating?.parentPath === '/' && (
          <div className="flex items-center gap-1.5 py-1 px-2 ml-2">
            <span className={`material-symbols-rounded text-sm ${creating.type === 'folder' ? 'text-amber-400' : 'text-zinc-500'}`}>
              {creating.type === 'folder' ? 'folder' : 'description'}
            </span>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onBlur={submitCreate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCreate();
                if (e.key === 'Escape') { setCreating(null); setNewItemName(''); }
              }}
              placeholder={creating.type === 'folder' ? 'folder name' : 'file name'}
              className="flex-1 bg-zinc-900 border border-indigo-500 rounded px-1 py-0.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
              autoFocus
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
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            onToggle={toggleFolder}
            onOpen={openFile}
            onContextMenu={handleContextMenu}
            onRenameSubmit={submitRename}
            onRenameCancel={onRenameCancel}
            submitCreate={submitCreate}
            setCreating={setCreating}
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
