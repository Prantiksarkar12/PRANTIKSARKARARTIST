import React, { useMemo, useState } from 'react';
import {
  Info,
  FileCode,
  Calendar,
  HardDrive,
  Code2,
  Copy,
  Check,
  Download,
  Edit2,
  ArrowRight,
  Trash2,
  Layers,
  Sparkles,
  ExternalLink,
  Shield,
  History,
  FileText,
} from 'lucide-react';
import { ProjectFile } from '../../../../types';
import { isProtectedFile } from './ConsoleFileExplorer';

interface ConsoleInspectorProps {
  siteId: string;
  file: ProjectFile | null;
  onRename: (path: string) => void;
  onMove: (path: string) => void;
  onCopy: (path: string) => void;
  onDelete: (path: string) => void;
  onOpenVersions: () => void;
}

export const ConsoleInspector: React.FC<ConsoleInspectorProps> = ({
  siteId,
  file,
  onRename,
  onMove,
  onCopy,
  onDelete,
  onOpenVersions,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);

  // AST Analysis & Symbol Extraction
  const astAnalysis = useMemo(() => {
    if (!file) return { imports: [], exports: [], components: [] };
    const content = file.content;
    const lines = content.split('\n');

    const imports: string[] = [];
    const exports: string[] = [];
    const components: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      // Imports
      if (trimmed.startsWith('import ') && trimmed.includes(' from ')) {
        const match = trimmed.match(/from\s+['"]([^'"]+)['"]/);
        if (match) imports.push(match[1]);
      }
      // React Components
      if (
        (trimmed.startsWith('export const ') || trimmed.startsWith('const ')) &&
        (trimmed.includes(': React.FC') || trimmed.includes('=>') || trimmed.includes('function')) &&
        /^[A-Z]/.test(trimmed.replace(/^(export\s+)?(const|function)\s+/, ''))
      ) {
        const compMatch = trimmed.match(/(const|function)\s+([A-Za-z0-9_]+)/);
        if (compMatch) components.push(compMatch[2]);
      }
      // Named Exports
      if (trimmed.startsWith('export const ') || trimmed.startsWith('export function ') || trimmed.startsWith('export type ') || trimmed.startsWith('export interface ')) {
        const nameMatch = trimmed.match(/export\s+(const|function|type|interface|class)\s+([A-Za-z0-9_]+)/);
        if (nameMatch) exports.push(`${nameMatch[1]} ${nameMatch[2]}`);
      }
    });

    return {
      imports: Array.from(new Set(imports)),
      exports: Array.from(new Set(exports)),
      components: Array.from(new Set(components)),
    };
  }, [file]);

  if (!file) {
    return (
      <div className="h-full bg-zinc-950/95 border-l border-white/10 p-4 flex flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs space-y-2 select-none">
        <Info className="w-6 h-6 text-zinc-600" />
        <p>No file selected</p>
        <span className="text-[10px] text-zinc-600">Select a file from Explorer to inspect properties & AST outline</span>
      </div>
    );
  }

  const isProtected = isProtectedFile(file.path);
  const lineCount = file.content.split('\n').length;
  const sizeKb = (file.size_bytes / 1024).toFixed(2);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([file.content], { type: file.mime_type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-zinc-950/95 border-l border-white/10 p-4 overflow-y-auto space-y-5 text-xs text-zinc-300 font-sans custom-scrollbar select-none">
      {/* File Header */}
      <div className="space-y-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-rose-500" />
          <span className="font-bold text-sm text-white font-mono truncate">{file.name}</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-500 break-all flex items-center justify-between">
          <span>/{file.path}</span>
          <button
            onClick={handleCopyPath}
            className="p-1 hover:text-white transition"
            title="Copy Path"
          >
            {copiedPath ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {isProtected && (
          <div className="p-2 bg-amber-950/60 border border-amber-800/80 rounded-lg text-amber-300 text-[10px] font-mono flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Protected secret file</span>
          </div>
        )}
      </div>

      {/* File Metrics Grid */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
          Properties
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-zinc-900/80 border border-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500">File Size</div>
            <div className="font-bold text-white mt-0.5">{sizeKb} KB</div>
          </div>
          <div className="p-2.5 bg-zinc-900/80 border border-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500">Line Count</div>
            <div className="font-bold text-white mt-0.5">{lineCount} lines</div>
          </div>
          <div className="p-2.5 bg-zinc-900/80 border border-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500">MIME Type</div>
            <div className="font-bold text-sky-400 mt-0.5 truncate">{file.mime_type || 'text/plain'}</div>
          </div>
          <div className="p-2.5 bg-zinc-900/80 border border-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500">Extension</div>
            <div className="font-bold text-amber-400 mt-0.5 uppercase">.{file.extension}</div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 pt-1">
          Updated: {new Date(file.updated_at).toLocaleString()}
        </div>
      </div>

      {/* AST & Symbol Outline */}
      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5 text-sky-400" />
          <span>AST Code Outline</span>
        </div>

        {/* Detected React Components */}
        {astAnalysis.components.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500">React Components ({astAnalysis.components.length})</div>
            <div className="flex flex-wrap gap-1">
              {astAnalysis.components.map((comp) => (
                <span
                  key={comp}
                  className="px-2 py-0.5 bg-sky-950/80 border border-sky-800 text-sky-300 font-mono text-[11px] rounded"
                >
                  &lt;{comp} /&gt;
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detected Named Exports */}
        {astAnalysis.exports.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500">Exports ({astAnalysis.exports.length})</div>
            <div className="space-y-1 font-mono text-[10px] text-zinc-300 bg-zinc-900/60 p-2 rounded-lg border border-white/5 max-h-28 overflow-y-auto">
              {astAnalysis.exports.map((exp, idx) => (
                <div key={idx} className="truncate">
                  {exp}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Imported Modules */}
        {astAnalysis.imports.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-500">Imports & Dependencies ({astAnalysis.imports.length})</div>
            <div className="space-y-1 font-mono text-[10px] text-zinc-400 bg-zinc-900/60 p-2 rounded-lg border border-white/5 max-h-24 overflow-y-auto">
              {astAnalysis.imports.map((imp, idx) => (
                <div key={idx} className="truncate text-rose-400/90">
                  import from '{imp}'
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="text-[11px] font-mono uppercase font-bold text-zinc-400 tracking-wider">
          Actions
        </div>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
          <button
            onClick={() => onRename(file.path)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Edit2 className="w-3 h-3 text-amber-400" />
            Rename
          </button>
          <button
            onClick={() => onCopy(file.path)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Copy className="w-3 h-3 text-purple-400" />
            Duplicate
          </button>
          <button
            onClick={() => onMove(file.path)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-200 flex items-center gap-1.5 transition"
          >
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            Move
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-200 flex items-center gap-1.5 transition"
          >
            <Download className="w-3 h-3 text-blue-400" />
            Download
          </button>
        </div>

        <button
          onClick={onOpenVersions}
          className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 text-xs font-mono flex items-center justify-center gap-1.5 transition"
        >
          <History className="w-3.5 h-3.5 text-zinc-400" />
          Version Checkpoints
        </button>

        <button
          onClick={() => onDelete(file.path)}
          className="w-full py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-mono flex items-center justify-center gap-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete File
        </button>
      </div>
    </div>
  );
};
