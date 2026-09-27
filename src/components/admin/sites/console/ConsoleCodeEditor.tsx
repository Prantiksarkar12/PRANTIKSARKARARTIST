import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileCode,
  Save,
  Search,
  Replace,
  ArrowRight,
  RotateCcw,
  Sparkles,
  GitCompare,
  Lock,
  ChevronRight,
  Copy,
  Check,
  X,
  Code2,
  Terminal,
  Columns,
  Maximize2,
  Minimize2,
  History,
  Shield,
  Layers,
} from 'lucide-react';
import { ProjectFile, ProjectSearchMatch } from '../../../../types';
import { isProtectedFile } from './ConsoleFileExplorer';
import { db } from '../../../../services/db';

interface ConsoleCodeEditorProps {
  siteId: string;
  files: ProjectFile[];
  activeFilePath: string;
  openTabs: string[];
  onSelectFile: (path: string) => void;
  onCloseTab: (path: string) => void;
  onSaveFile: (path: string, content: string) => void;
  onOpenGlobalSearch: () => void;
  onOpenVersionHistory: () => void;
  onOpenEnvVars: () => void;
}

export const ConsoleCodeEditor: React.FC<ConsoleCodeEditorProps> = ({
  siteId,
  files,
  activeFilePath,
  openTabs,
  onSelectFile,
  onCloseTab,
  onSaveFile,
  onOpenGlobalSearch,
  onOpenVersionHistory,
  onOpenEnvVars,
}) => {
  const activeFile = files.find((f) => f.path === activeFilePath);
  const [code, setCode] = useState(activeFile?.content || '');
  const [dirtyFiles, setDirtyFiles] = useState<Record<string, boolean>>({});
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(0);

  // Editor features
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [showGoToLineModal, setShowGoToLineModal] = useState(false);
  const [goToLineInput, setGoToLineInput] = useState('');
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync buffer when switching active file
  useEffect(() => {
    if (activeFile) {
      setCode(activeFile.content);
      setHistoryStack([activeFile.content]);
      setHistoryPointer(0);
      setIsDiffMode(false);
    }
  }, [activeFilePath]);

  const isCurrentFileProtected = isProtectedFile(activeFilePath);
  const isDirty = Boolean(dirtyFiles[activeFilePath]);

  const handleCodeChange = (newVal: string) => {
    setCode(newVal);
    setDirtyFiles((prev) => ({ ...prev, [activeFilePath]: true }));
    
    // Add to undo history
    if (historyStack[historyPointer] !== newVal) {
      const newStack = historyStack.slice(0, historyPointer + 1);
      newStack.push(newVal);
      setHistoryStack(newStack);
      setHistoryPointer(newStack.length - 1);
    }
  };

  const handleSave = () => {
    if (!activeFilePath || isCurrentFileProtected) return;
    onSaveFile(activeFilePath, code);
    setDirtyFiles((prev) => {
      const next = { ...prev };
      delete next[activeFilePath];
      return next;
    });
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      const prevCode = historyStack[prevPointer];
      setHistoryPointer(prevPointer);
      setCode(prevCode);
      setDirtyFiles((prev) => ({ ...prev, [activeFilePath]: true }));
    }
  };

  const handleRedo = () => {
    if (historyPointer < historyStack.length - 1) {
      const nextPointer = historyPointer + 1;
      const nextCode = historyStack[nextPointer];
      setHistoryPointer(nextPointer);
      setCode(nextCode);
      setDirtyFiles((prev) => ({ ...prev, [activeFilePath]: true }));
    }
  };

  const handleFormatCode = () => {
    try {
      const ext = activeFilePath.split('.').pop() || '';
      if (ext === 'json') {
        const formatted = JSON.stringify(JSON.parse(code), null, 2);
        handleCodeChange(formatted);
      } else {
        // Standard clean whitespace indentation pass
        const formatted = code
          .split('\n')
          .map((line) => line.replace(/\s+$/, ''))
          .join('\n');
        handleCodeChange(formatted);
      }
    } catch (err) {
      console.warn('Format formatting error:', err);
    }
  };

  // Find & Replace actions
  const handleReplaceOne = () => {
    if (!findQuery) return;
    try {
      const flags = matchCase ? '' : 'i';
      const regex = useRegex ? new RegExp(findQuery, flags) : new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const updated = code.replace(regex, replaceQuery);
      handleCodeChange(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery) return;
    try {
      const flags = matchCase ? 'g' : 'gi';
      const regex = useRegex ? new RegExp(findQuery, flags) : new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const updated = code.replace(regex, replaceQuery);
      handleCodeChange(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoToLineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lineNum = parseInt(goToLineInput, 10);
    if (!isNaN(lineNum) && lineNum > 0 && textareaRef.current) {
      const lines = code.split('\n');
      let charCount = 0;
      for (let i = 0; i < Math.min(lineNum - 1, lines.length); i++) {
        charCount += lines[i].length + 1;
      }
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(charCount, charCount);
      setCursorPos({ line: Math.min(lineNum, lines.length), col: 1 });
    }
    setShowGoToLineModal(false);
    setGoToLineInput('');
  };

  const updateCursorCoordinates = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const selStart = target.selectionStart || 0;
    const textUpToCursor = target.value.substring(0, selStart);
    const lines = textUpToCursor.split('\n');
    const curLine = lines.length;
    const curCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: curLine, col: curCol });
  };

  // Calculate breadcrumbs path segments
  const breadcrumbs = useMemo(() => {
    if (!activeFilePath) return [];
    return activeFilePath.split('/').filter(Boolean);
  }, [activeFilePath]);

  // Unified diff generator for Diff mode
  const diffComparison = useMemo(() => {
    if (!isDiffMode || !activeFile) return [];
    const originalLines = activeFile.content.split('\n');
    const currentLines = code.split('\n');
    const max = Math.max(originalLines.length, currentLines.length);
    const rows = [];

    for (let i = 0; i < max; i++) {
      const orig = originalLines[i];
      const curr = currentLines[i];
      let status: 'same' | 'added' | 'removed' | 'modified' = 'same';
      if (orig === undefined) status = 'added';
      else if (curr === undefined) status = 'removed';
      else if (orig !== curr) status = 'modified';

      rows.push({
        line: i + 1,
        orig: orig ?? '',
        curr: curr ?? '',
        status,
      });
    }
    return rows;
  }, [isDiffMode, code, activeFile]);

  const totalLines = code.split('\n').length;
  const totalCharacters = code.length;

  return (
    <div className="h-full flex flex-col justify-between bg-[#08080d] text-zinc-200 select-none">
      {/* 1. Multi-File Tabs Bar */}
      <div className="bg-zinc-950 border-b border-white/10 flex items-center justify-between px-2 overflow-x-auto select-none">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {openTabs.map((tabPath) => {
            const isTabActive = tabPath === activeFilePath;
            const tabName = tabPath.split('/').pop() || tabPath;
            const tabIsDirty = dirtyFiles[tabPath];
            const tabIsProtected = isProtectedFile(tabPath);

            return (
              <div
                key={tabPath}
                onClick={() => onSelectFile(tabPath)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-mono border-t border-x cursor-pointer transition ${
                  isTabActive
                    ? 'bg-[#08080d] border-white/15 text-white font-bold'
                    : 'bg-zinc-900/60 border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {tabIsProtected ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                )}
                <span className="truncate max-w-[140px]">{tabName}</span>

                {tabIsDirty ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tabPath);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Editor Quick Buttons */}
        <div className="flex items-center gap-1 py-1 shrink-0">
          <button
            onClick={onOpenGlobalSearch}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono border border-white/5 flex items-center gap-1.5 transition"
            title="Search Everywhere (Cmd+P / Cmd+Shift+F)"
          >
            <Search className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="text-[10px] bg-black/50 px-1 py-0.2 rounded text-zinc-400">⌘P</kbd>
          </button>

          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`p-1.5 rounded text-xs font-mono border transition ${
              showFindReplace
                ? 'bg-rose-950 border-rose-600 text-rose-300'
                : 'bg-zinc-900 hover:bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Find & Replace in File (Cmd+F)"
          >
            <Replace className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsDiffMode(!isDiffMode)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition flex items-center gap-1 ${
              isDiffMode
                ? 'bg-purple-950 border-purple-600 text-purple-200 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
            }`}
            title="Compare with Git / Version Snapshot"
          >
            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{isDiffMode ? 'Exit Diff' : 'Diff'}</span>
          </button>

          <button
            onClick={handleFormatCode}
            className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition"
            title="Format Code (Prettier)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={handleSave}
            disabled={!isDirty || isCurrentFileProtected}
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 shadow-lg shadow-rose-950 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      {/* 2. Breadcrumbs & File Path Bar */}
      <div className="bg-zinc-950/60 border-b border-white/5 px-4 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1 text-zinc-400 overflow-x-auto">
          <span className="text-zinc-500">project:</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb + idx}>
              <span className={idx === breadcrumbs.length - 1 ? 'text-white font-bold' : 'text-zinc-400'}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <button
            onClick={() => setShowGoToLineModal(true)}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            Ln {cursorPos.line}, Col {cursorPos.col}
          </button>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span className="text-sky-400 uppercase">
            {activeFilePath.split('.').pop() || 'TXT'}
          </span>
        </div>
      </div>

      {/* 3. In-Editor Find & Replace Drawer */}
      {showFindReplace && (
        <div className="bg-zinc-900 border-b border-rose-500/40 p-3 space-y-2 font-mono text-xs animate-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Find in file..."
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                autoFocus
                className="w-full bg-black border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1 flex-1 min-w-[200px]">
              <Replace className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="w-full bg-black border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMatchCase(!matchCase)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                  matchCase
                    ? 'bg-rose-950 border-rose-500 text-white'
                    : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                Aa Match Case
              </button>
              <button
                type="button"
                onClick={() => setUseRegex(!useRegex)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition ${
                  useRegex
                    ? 'bg-rose-950 border-rose-500 text-white'
                    : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                .* Regex
              </button>
              <button
                type="button"
                onClick={handleReplaceOne}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-semibold text-xs transition"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleReplaceAll}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs transition"
              >
                Replace All
              </button>
              <button
                type="button"
                onClick={() => setShowFindReplace(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Go-To-Line Modal */}
      {showGoToLineModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleGoToLineSubmit}
            className="bg-zinc-950 border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Go to Line Number
              </span>
              <button
                type="button"
                onClick={() => setShowGoToLineModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Enter line (1 - {totalLines}):
              </label>
              <input
                type="number"
                min="1"
                max={totalLines}
                value={goToLineInput}
                onChange={(e) => setGoToLineInput(e.target.value)}
                autoFocus
                placeholder="42"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGoToLineModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Jump
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Main Editor Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* PROTECTED SECRET FILE GUARD */}
        {isCurrentFileProtected ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-950/90 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-400 mx-auto shadow-xl">
              <Shield className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Protected configuration
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Value cannot be displayed.
                <br />
                Edit through secure configuration management.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onOpenEnvVars}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Lock className="w-3.5 h-3.5" />
                Open Environment Variables
              </button>
            </div>
          </div>
        ) : isDiffMode ? (
          /* DIFF VIEW */
          <div className="h-full overflow-auto font-mono text-xs p-4 bg-black/90 select-text">
            <div className="text-[11px] font-mono text-purple-400 font-bold mb-3 flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span>Side-by-Side Unified Diff View</span>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 text-[10px]">
                  <th className="w-12 text-right pr-3 py-1">Line</th>
                  <th className="w-1/2 text-left px-3 py-1">Original Version</th>
                  <th className="w-1/2 text-left px-3 py-1">Working Buffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {diffComparison.map((row) => (
                  <tr
                    key={row.line}
                    className={`${
                      row.status === 'added'
                        ? 'bg-emerald-950/30 text-emerald-300'
                        : row.status === 'removed'
                        ? 'bg-rose-950/30 text-rose-300'
                        : row.status === 'modified'
                        ? 'bg-amber-950/30 text-amber-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    <td className="w-12 text-right pr-3 py-0.5 text-zinc-600 select-none text-[11px]">
                      {row.line}
                    </td>
                    <td className="w-1/2 px-3 py-0.5 whitespace-pre-wrap break-all border-r border-white/5">
                      {row.orig}
                    </td>
                    <td className="w-1/2 px-3 py-0.5 whitespace-pre-wrap break-all">
                      {row.curr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* MONACO / CODE WRITING CANVAS */
          <div className="h-full flex overflow-hidden">
            {/* Line Numbers Gutter */}
            <div className="w-12 bg-zinc-950/80 border-r border-white/5 py-4 text-right pr-3 font-mono text-xs text-zinc-600 select-none overflow-hidden shrink-0">
              {Array.from({ length: totalLines }).map((_, i) => (
                <div key={i} className="leading-6 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Textarea Input */}
            <div className="flex-1 relative h-full">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyUp={updateCursorCoordinates}
                onClick={updateCursorCoordinates}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                    e.preventDefault();
                    handleSave();
                  } else if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                    e.preventDefault();
                    setShowFindReplace(true);
                  } else if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
                    e.preventDefault();
                    setShowGoToLineModal(true);
                  } else if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                    if (e.shiftKey) {
                      e.preventDefault();
                      handleRedo();
                    } else {
                      e.preventDefault();
                      handleUndo();
                    }
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const val = e.currentTarget.value;
                    const updated = val.substring(0, start) + '  ' + val.substring(end);
                    handleCodeChange(updated);
                    setTimeout(() => {
                      if (textareaRef.current) {
                        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                      }
                    }, 0);
                  }
                }}
                placeholder="// Start coding in authorized source file..."
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="w-full h-full p-4 bg-transparent text-zinc-200 font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto select-text selection:bg-rose-900/60"
              />
            </div>
          </div>
        )}
      </div>

      {/* 6. Editor Status & Bottom Footer */}
      <div className="bg-zinc-950 border-t border-white/10 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span>{totalLines} lines</span>
          <span>•</span>
          <span>{totalCharacters} characters</span>
          <span>•</span>
          <span>{(totalCharacters / 1024).toFixed(1)} KB</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <span>•</span>
          <span className="text-zinc-400">Cmd+S Save • Cmd+F Find • Cmd+G Line</span>
        </div>
      </div>
    </div>
  );
};
