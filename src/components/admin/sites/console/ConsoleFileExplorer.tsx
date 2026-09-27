import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Lock,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  Copy,
  Download,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Upload,
  MoreVertical,
  Check,
  X,
  FileArchive,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { ProjectFile } from '../../../../types';

interface ConsoleFileExplorerProps {
  siteId: string;
  files: ProjectFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onNewFile: (path: string, content?: string) => void;
  onNewFolder: (folderPath: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onMoveFile: (oldPath: string, newPath: string) => void;
  onCopyFile: (oldPath: string, newPath: string) => void;
  onDeleteFile: (path: string) => void;
  onUploadFiles?: (uploaded: { path: string; content: string }[]) => void;
}

// Tree node definition for directory hierarchy
interface FileTreeNode {
  name: string;
  fullPath: string;
  isFolder: boolean;
  children: FileTreeNode[];
  file?: ProjectFile;
  isProtected?: boolean;
}

export const isProtectedFile = (path: string): boolean => {
  const normalized = path.toLowerCase();
  return (
    normalized.startsWith('.env') ||
    normalized.includes('/.env') ||
    normalized.includes('credentials') ||
    normalized.includes('id_rsa') ||
    normalized.includes('private_key') ||
    normalized.includes('secrets.json')
  );
};

export const ConsoleFileExplorer: React.FC<ConsoleFileExplorerProps> = ({
  siteId,
  files,
  activeFilePath,
  onSelectFile,
  onNewFile,
  onNewFolder,
  onRenameFile,
  onMoveFile,
  onCopyFile,
  onDeleteFile,
  onUploadFiles,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '': true,
    src: true,
    'src/components': true,
    'src/app': true,
    'src/pages': true,
    public: true,
    tests: true,
  });

  // Modal / Inline form states
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [targetParentFolder, setTargetParentFolder] = useState('');
  const [newInputName, setNewInputName] = useState('');

  // Context menu / modal actions
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [movingPath, setMovingPath] = useState<string | null>(null);
  const [moveDestValue, setMoveDestValue] = useState('');
  const [activeMenuPath, setActiveMenuPath] = useState<string | null>(null);

  // Build tree structure
  const fileTree = useMemo(() => {
    const root: FileTreeNode = {
      name: 'root',
      fullPath: '',
      isFolder: true,
      children: [],
    };

    // Ensure all folders and files are populated
    files.forEach((file) => {
      const parts = file.path.split('/').filter(Boolean);
      let currentNode = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLeaf = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');

        let child = currentNode.children.find((c) => c.name === part);
        if (!child) {
          child = {
            name: part,
            fullPath: currentPath,
            isFolder: !isLeaf,
            children: [],
            file: isLeaf ? file : undefined,
            isProtected: isProtectedFile(currentPath),
          };
          currentNode.children.push(child);
        }
        currentNode = child;
      }
    });

    // Sort folders first, then alphabetically
    const sortNodes = (node: FileTreeNode) => {
      node.children.sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortNodes);
    };

    sortNodes(root);
    return root;
  }, [files]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const collapseAll = () => {
    setExpandedFolders({ '': true });
  };

  const expandAll = () => {
    const all: Record<string, boolean> = { '': true };
    const scan = (node: FileTreeNode) => {
      if (node.isFolder && node.fullPath) {
        all[node.fullPath] = true;
      }
      node.children.forEach(scan);
    };
    scan(fileTree);
    setExpandedFolders(all);
  };

  const handleStartCreate = (type: 'file' | 'folder', parentFolder: string = '') => {
    setCreatingType(type);
    setTargetParentFolder(parentFolder);
    setNewInputName('');
    if (parentFolder) {
      setExpandedFolders((prev) => ({ ...prev, [parentFolder]: true }));
    }
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInputName.trim()) return;

    const cleanName = newInputName.trim().replace(/^\//, '');
    const fullPath = targetParentFolder ? `${targetParentFolder}/${cleanName}` : cleanName;

    if (creatingType === 'file') {
      const ext = fullPath.split('.').pop() || '';
      let initialBoilerplate = '// ' + cleanName + '\n';
      if (ext === 'tsx' || ext === 'ts') {
        const compName = cleanName.split('.')[0];
        initialBoilerplate = `import React from 'react';\n\nexport const ${compName}: React.FC = () => {\n  return (\n    <div className="p-4 bg-zinc-950 text-white rounded-xl">\n      <h2 className="text-lg font-bold">${compName}</h2>\n    </div>\n  );\n};\n`;
      } else if (ext === 'json') {
        initialBoilerplate = '{\n  \n}\n';
      } else if (ext === 'css') {
        initialBoilerplate = '/* Stylesheet */\n';
      }
      onNewFile(fullPath, initialBoilerplate);
    } else {
      onNewFolder(fullPath);
    }

    setCreatingType(null);
    setNewInputName('');
  };

  const handleStartRename = (path: string) => {
    setRenamingPath(path);
    setRenameValue(path);
    setActiveMenuPath(null);
  };

  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renamingPath && renameValue.trim() && renameValue !== renamingPath) {
      onRenameFile(renamingPath, renameValue.trim());
    }
    setRenamingPath(null);
  };

  const handleStartMove = (path: string) => {
    setMovingPath(path);
    setMoveDestValue(path);
    setActiveMenuPath(null);
  };

  const handleConfirmMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (movingPath && moveDestValue.trim() && moveDestValue !== movingPath) {
      onMoveFile(movingPath, moveDestValue.trim());
    }
    setMovingPath(null);
  };

  const handleDownloadSingle = (file: ProjectFile) => {
    const blob = new Blob([file.content], { type: file.mime_type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenuPath(null);
  };

  // Helper file icon renderer
  const renderFileIcon = (fileName: string, isProtected?: boolean) => {
    if (isProtected) return <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'tsx' || ext === 'ts' || ext === 'jsx' || ext === 'js') {
      return <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    }
    if (ext === 'html') return <FileCode className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    if (ext === 'json') return <FileJson className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (ext === 'css') return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    if (ext === 'md' || ext === 'txt') return <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
    return <FileCode className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: FileTreeNode, depth = 0) => {
    // If search filtering is active
    if (filterQuery) {
      if (node.isFolder) {
        // Render folder only if it has matching descendants
        const hasMatchingChild = (n: FileTreeNode): boolean => {
          if (!n.isFolder) return n.fullPath.toLowerCase().includes(filterQuery.toLowerCase());
          return n.children.some(hasMatchingChild);
        };
        if (!hasMatchingChild(node)) return null;
      } else {
        if (!node.fullPath.toLowerCase().includes(filterQuery.toLowerCase())) return null;
      }
    }

    if (node.isFolder) {
      const isExpanded = expandedFolders[node.fullPath] ?? false;
      return (
        <div key={node.fullPath || '__root'} className="select-none">
          {node.fullPath && (
            <div
              onClick={() => toggleFolder(node.fullPath)}
              className="group flex items-center justify-between px-2 py-1 rounded hover:bg-zinc-900/80 cursor-pointer text-xs font-mono transition text-zinc-300 hover:text-white"
              style={{ paddingLeft: `${Math.max(6, depth * 14)}px` }}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                )}
                <span className="font-semibold text-zinc-300 group-hover:text-white truncate">
                  {node.name}
                </span>
              </div>

              {/* Folder Quick Actions */}
              <div
                className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleStartCreate('file', node.fullPath)}
                  className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="New File in Folder"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleStartCreate('folder', node.fullPath)}
                  className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  title="New Subfolder"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Children */}
          {(node.fullPath === '' || isExpanded) && (
            <div className="space-y-0.5">
              {node.children.map((child) => renderTreeNode(child, node.fullPath ? depth + 1 : 0))}
            </div>
          )}
        </div>
      );
    }

    // Leaf File Node
    const isSelected = activeFilePath === node.fullPath;
    const isProtected = node.isProtected;

    return (
      <div
        key={node.fullPath}
        onClick={() => onSelectFile(node.fullPath)}
        className={`group relative flex items-center justify-between px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
          isSelected
            ? 'bg-rose-950/70 border border-rose-800/50 text-white font-bold shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
        }`}
        style={{ paddingLeft: `${Math.max(16, depth * 14 + 8)}px` }}
      >
        <div className="flex items-center gap-2 truncate">
          {renderFileIcon(node.name, isProtected)}
          <span className={`truncate ${isProtected ? 'text-amber-300 font-semibold' : ''}`}>
            {node.name}
          </span>
          {isProtected && (
            <span className="text-[9px] px-1 py-0.2 bg-amber-950/80 text-amber-400 rounded border border-amber-800 font-mono">
              SECRET
            </span>
          )}
        </div>

        {/* Action Trigger */}
        <div
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setActiveMenuPath(activeMenuPath === node.fullPath ? null : node.fullPath)}
            className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="File Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Context Dropdown Menu */}
        {activeMenuPath === node.fullPath && (
          <div
            className="absolute right-2 top-6 z-50 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-1.5 w-44 font-sans text-xs space-y-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onSelectFile(node.fullPath);
                setActiveMenuPath(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            >
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              Open File
            </button>
            <button
              onClick={() => handleStartRename(node.fullPath)}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              Rename
            </button>
            <button
              onClick={() => handleStartMove(node.fullPath)}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              Move File
            </button>
            <button
              onClick={() => {
                const ext = node.name.split('.').pop() || '';
                const base = node.name.replace(`.${ext}`, '');
                const dest = node.fullPath.replace(node.name, `${base}_copy.${ext}`);
                onCopyFile(node.fullPath, dest);
                setActiveMenuPath(null);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
            >
              <Copy className="w-3.5 h-3.5 text-purple-400" />
              Duplicate / Copy
            </button>
            {node.file && (
              <button
                onClick={() => handleDownloadSingle(node.file!)}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-200 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                Download
              </button>
            )}
            <div className="border-t border-white/5 my-1" />
            <button
              onClick={() => {
                setActiveMenuPath(null);
                onDeleteFile(node.fullPath);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-950 text-rose-400 flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete File
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col justify-between bg-zinc-950/95 border-r border-white/10 text-zinc-200 p-3 select-none">
      {/* Top Header & Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
            <Layers className="w-4 h-4 text-rose-500" />
            <span>Project Source Tree</span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <button
              onClick={() => handleStartCreate('file', '')}
              className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
              title="New Root File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStartCreate('folder', '')}
              className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
              title="New Root Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={expandAll}
              className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
              title="Expand All"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={collapseAll}
              className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
              title="Collapse All"
            >
              <Folder className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tree Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Filter files (/src, .tsx)..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-rose-500 placeholder-zinc-500"
          />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery('')}
              className="absolute right-2 top-2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Item Modal/Inline Input */}
        {creatingType && (
          <form
            onSubmit={handleConfirmCreate}
            className="p-2.5 bg-zinc-900 border border-rose-500/60 rounded-xl space-y-2 text-xs"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>
                New {creatingType === 'file' ? 'File' : 'Folder'}{' '}
                {targetParentFolder ? `in /${targetParentFolder}` : 'in /'}
              </span>
              <button
                type="button"
                onClick={() => setCreatingType(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <input
              type="text"
              placeholder={creatingType === 'file' ? 'Header.tsx or api/music.ts' : 'components or lib'}
              value={newInputName}
              onChange={(e) => setNewInputName(e.target.value)}
              autoFocus
              className="w-full bg-black border border-white/20 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setCreatingType(null)}
                className="px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-0.5 text-[10px] bg-rose-600 hover:bg-rose-500 text-white font-bold rounded"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {/* Rename Modal Form */}
        {renamingPath && (
          <form
            onSubmit={handleConfirmRename}
            className="p-2.5 bg-zinc-900 border border-amber-500/60 rounded-xl space-y-2 text-xs"
          >
            <div className="text-[11px] font-mono text-amber-400 font-bold">
              Rename File Path:
            </div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="w-full bg-black border border-white/20 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setRenamingPath(null)}
                className="px-2 py-0.5 text-[10px] text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-0.5 text-[10px] bg-amber-600 hover:bg-amber-500 text-white font-bold rounded"
              >
                Rename
              </button>
            </div>
          </form>
        )}

        {/* Move Modal Form */}
        {movingPath && (
          <form
            onSubmit={handleConfirmMove}
            className="p-2.5 bg-zinc-900 border border-emerald-500/60 rounded-xl space-y-2 text-xs"
          >
            <div className="text-[11px] font-mono text-emerald-400 font-bold">
              Move to New Path:
            </div>
            <input
              type="text"
              value={moveDestValue}
              onChange={(e) => setMoveDestValue(e.target.value)}
              autoFocus
              className="w-full bg-black border border-white/20 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setMovingPath(null)}
                className="px-2 py-0.5 text-[10px] text-zinc-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-0.5 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded"
              >
                Move
              </button>
            </div>
          </form>
        )}

        {/* Tree Container */}
        <div className="overflow-y-auto max-h-[calc(100vh-340px)] min-h-[380px] pr-1 space-y-0.5 custom-scrollbar">
          {renderTreeNode(fileTree, 0)}
        </div>
      </div>

      {/* Footer Tree Summary & Protected Notice */}
      <div className="pt-3 border-t border-white/10 space-y-1.5 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center justify-between">
          <span>{files.length} Authorized Files</span>
          <span className="text-zinc-500">Node/Vite</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>Protected secret shield active</span>
        </div>
      </div>
    </div>
  );
};
