import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Rocket,
  Activity,
  History,
  ChevronUp,
  ChevronDown,
  X,
  Play,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Search,
  Filter,
  Trash2,
  Clock,
  Shield,
  Layers,
  Database,
  Globe,
  Radio,
} from 'lucide-react';
import {
  ProjectBuild,
  ProjectErrorLog,
  ProjectRuntimeLog,
  ProjectCommandResult,
  ConsoleServiceType,
} from '../../../../types';
import { db } from '../../../../services/db';

interface ConsoleBottomDrawerProps {
  siteId: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  initialTab?: 'terminal' | 'errors' | 'builds' | 'logs' | 'audit';
  onTriggerBuild: () => Promise<void>;
  isBuilding: boolean;
  builds: ProjectBuild[];
}

export const ConsoleBottomDrawer: React.FC<ConsoleBottomDrawerProps> = ({
  siteId,
  isOpen,
  onToggleOpen,
  initialTab = 'terminal',
  onTriggerBuild,
  isBuilding,
  builds,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'errors' | 'builds' | 'logs' | 'audit'>(
    initialTab
  );

  // Terminal state
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<ProjectCommandResult[]>([]);
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Error Center state
  const [errors, setErrors] = useState<ProjectErrorLog[]>([]);
  const [errorServiceFilter, setErrorServiceFilter] = useState<string>('all');
  const [errorSeverityFilter, setErrorSeverityFilter] = useState<string>('all');
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null);
  const [copiedStackTrace, setCopiedStackTrace] = useState(false);

  // Runtime Logs state
  const [runtimeLogs, setRuntimeLogs] = useState<ProjectRuntimeLog[]>([]);
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [logServiceFilter, setLogServiceFilter] = useState<string>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isTailLocked, setIsTailLocked] = useState(true);
  const [isStreamPaused, setIsStreamPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Audit state
  const auditLogs = db.getAuditLogs().filter((a) => a.entity_id === siteId || a.entity_type === 'SITE');

  // Load errors & runtime logs
  const refreshData = () => {
    if (!siteId) return;
    setErrors(db.getSiteErrors(siteId));
    setRuntimeLogs(db.getSiteRuntimeLogs(siteId));
  };

  useEffect(() => {
    refreshData();
    // Initial welcome banner in terminal if empty
    if (commandHistory.length === 0) {
      setCommandHistory([
        {
          command: 'site:initialize',
          exit_code: 0,
          timestamp: new Date().toISOString(),
          duration_ms: 12,
          output_lines: [
            { text: '✓ Admin Site Console Terminal initialized.', stream: 'success' },
            { text: '  Type any preset below or run custom shell commands.', stream: 'info' },
          ],
        },
      ]);
    }
  }, [siteId]);

  // Auto-scroll terminal
  useEffect(() => {
    if (activeTab === 'terminal') {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commandHistory, activeTab]);

  // Auto-scroll logs if tail locked
  useEffect(() => {
    if (activeTab === 'logs' && isTailLocked && !isStreamPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [runtimeLogs, isTailLocked, isStreamPaused, activeTab]);

  const handleRunCommand = async (cmdToRun: string) => {
    if (!cmdToRun.trim() || isRunningCommand) return;
    setIsRunningCommand(true);

    try {
      const result = await db.executeSiteCommand(siteId, cmdToRun.trim());
      setCommandHistory((prev) => [...prev, result]);
      setCommandInput('');
      refreshData();
    } catch (err: any) {
      setCommandHistory((prev) => [
        ...prev,
        {
          command: cmdToRun,
          exit_code: 1,
          timestamp: new Date().toISOString(),
          duration_ms: 50,
          output_lines: [
            { text: `$ ${cmdToRun}`, stream: 'info' },
            { text: `Error: ${err?.message || 'Command execution failed'}`, stream: 'error' },
          ],
        },
      ]);
    } finally {
      setIsRunningCommand(false);
    }
  };

  const handleResolveError = (errorId: string) => {
    db.resolveSiteError(siteId, errorId);
    setErrors(db.getSiteErrors(siteId));
  };

  const handleClearErrors = () => {
    if (confirm('Clear all logged errors for this project?')) {
      db.clearSiteErrors(siteId);
      setErrors([]);
    }
  };

  const handleExportLogs = () => {
    const text = runtimeLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.service}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${siteId}-runtime-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered errors
  const filteredErrors = errors.filter((err) => {
    if (errorServiceFilter !== 'all' && err.service !== errorServiceFilter) return false;
    if (errorSeverityFilter !== 'all' && err.severity !== errorSeverityFilter) return false;
    return true;
  });

  const unresolvedErrorCount = errors.filter((e) => !e.resolved).length;

  // Filtered runtime logs
  const filteredLogs = runtimeLogs.filter((log) => {
    if (logLevelFilter !== 'all' && log.level !== logLevelFilter) return false;
    if (logServiceFilter !== 'all' && log.service !== logServiceFilter) return false;
    if (logSearchQuery && !log.message.toLowerCase().includes(logSearchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (!isOpen) {
    return (
      <div className="bg-zinc-950 border-t border-white/10 px-4 py-2 flex items-center justify-between text-xs font-mono select-none">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleOpen}
            className="flex items-center gap-1.5 font-bold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <ChevronUp className="w-4 h-4 text-rose-500" />
            <span>Terminal & Logs Console</span>
          </button>

          <div className="flex items-center gap-3 text-zinc-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              CLI Ready
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {unresolvedErrorCount} Unresolved Errors
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {runtimeLogs.length} Stream Logs
            </span>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border-t border-white/10 flex flex-col h-72 select-none">
      {/* Top Drawer Tabs & Controls Bar */}
      <div className="bg-[#08080d] border-b border-white/10 px-3 py-1.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1">
          {[
            { id: 'terminal', label: 'Terminal / CLI', icon: Terminal },
            {
              id: 'errors',
              label: `Error Center (${unresolvedErrorCount})`,
              icon: AlertTriangle,
              badge: unresolvedErrorCount > 0 ? unresolvedErrorCount : undefined,
            },
            { id: 'builds', label: `Build Logs (${builds.length})`, icon: Rocket },
            { id: 'logs', label: `Runtime Stream (${filteredLogs.length})`, icon: Activity },
            { id: 'audit', label: 'Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-rose-950/70 border border-rose-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <button
            onClick={refreshData}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
            title="Refresh logs & error records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleOpen}
            className="p-1 rounded hover:bg-zinc-800 hover:text-white transition"
            title="Minimize Drawer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-hidden p-3 bg-black/95 font-mono text-xs select-text">
        {/* TAB 1: TERMINAL & COMMAND RUNNER */}
        {activeTab === 'terminal' && (
          <div className="h-full flex flex-col justify-between">
            {/* Command Presets Bar */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 overflow-x-auto text-[11px]">
              <span className="text-zinc-500 font-bold shrink-0">Quick CLI:</span>
              {[
                'npm run build',
                'npm run test',
                'npm run lint',
                'npm run typecheck',
                'db:migrate',
                'cache:clear',
                'sitemap:generate',
                'ai:optimize',
                'health:check',
              ].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleRunCommand(cmd)}
                  disabled={isRunningCommand}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Output Scroll Area */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 custom-scrollbar">
              {commandHistory.map((hist, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="text-zinc-500 text-[10px] flex items-center gap-2">
                    <span>{new Date(hist.timestamp).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className={hist.exit_code === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      exit code: {hist.exit_code} ({hist.duration_ms}ms)
                    </span>
                  </div>
                  {hist.output_lines.map((line, lIdx) => (
                    <div
                      key={lIdx}
                      className={`leading-5 ${
                        line.stream === 'info'
                          ? 'text-sky-400'
                          : line.stream === 'success'
                          ? 'text-emerald-400 font-bold'
                          : line.stream === 'error'
                          ? 'text-rose-400 font-bold'
                          : line.stream === 'stderr'
                          ? 'text-amber-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      {line.text}
                    </div>
                  ))}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Command Prompt Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunCommand(commandInput);
              }}
              className="pt-2 border-t border-white/5 flex items-center gap-2"
            >
              <span className="text-rose-500 font-bold">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Type command (e.g. npm run build, db:migrate, health:check)..."
                disabled={isRunningCommand}
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-zinc-600"
              />
              <button
                type="submit"
                disabled={isRunningCommand || !commandInput.trim()}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded text-[11px] font-bold uppercase transition"
              >
                {isRunningCommand ? 'Running...' : 'Execute'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: ERROR CENTER */}
        {activeTab === 'errors' && (
          <div className="h-full flex flex-col justify-between">
            {/* Filters Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px]">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={errorServiceFilter}
                  onChange={(e) => setErrorServiceFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-zinc-300 text-[11px] focus:outline-none"
                >
                  <option value="all">All Services</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="api">API</option>
                  <option value="database">Database</option>
                  <option value="build">Build</option>
                  <option value="deployment">Deployment</option>
                  <option value="websocket">WebSocket</option>
                  <option value="security">Security</option>
                </select>

                <select
                  value={errorSeverityFilter}
                  onChange={(e) => setErrorSeverityFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-zinc-300 text-[11px] focus:outline-none"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <button
                onClick={handleClearErrors}
                className="text-zinc-500 hover:text-rose-400 text-[11px] flex items-center gap-1 transition"
              >
                <Trash2 className="w-3 h-3" />
                Clear Errors
              </button>
            </div>

            {/* Errors List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 custom-scrollbar">
              {filteredErrors.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No active exceptions or unhandled errors detected.</span>
                </div>
              ) : (
                filteredErrors.map((err) => (
                  <div
                    key={err.id}
                    onClick={() => setSelectedErrorId(selectedErrorId === err.id ? null : err.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      err.resolved
                        ? 'bg-zinc-950/40 border-white/5 opacity-60'
                        : err.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-800/60'
                        : err.severity === 'error'
                        ? 'bg-rose-950/20 border-rose-900/40'
                        : 'bg-amber-950/20 border-amber-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            err.severity === 'critical'
                              ? 'bg-rose-900 text-rose-200'
                              : err.severity === 'error'
                              ? 'bg-rose-950 text-rose-300'
                              : 'bg-amber-950 text-amber-300'
                          }`}
                        >
                          {err.severity}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold">
                          [{err.service}]
                        </span>
                        <span className="text-white font-bold text-xs truncate max-w-md">
                          {err.message}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </span>
                        {!err.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveError(err.id);
                            }}
                            className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-emerald-400 rounded text-[10px] border border-emerald-900/50"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {selectedErrorId === err.id && (
                      <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5 text-[11px] text-zinc-400">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <span className="text-zinc-600">Error ID:</span> {err.id}
                          </div>
                          <div>
                            <span className="text-zinc-600">Endpoint:</span> {err.endpoint || 'N/A'}
                          </div>
                          <div>
                            <span className="text-zinc-600">File/Line:</span> {err.file ? `${err.file}:${err.line}` : 'N/A'}
                          </div>
                          <div>
                            <span className="text-zinc-600">Request ID:</span> {err.request_id || 'N/A'}
                          </div>
                        </div>

                        {err.stack_trace && (
                          <div className="p-2 bg-black rounded-lg border border-white/5 text-[10px] font-mono text-zinc-300 overflow-x-auto">
                            <div className="flex justify-between items-center text-zinc-500 mb-1">
                              <span>REDACTED STACK TRACE:</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(err.stack_trace!);
                                  setCopiedStackTrace(true);
                                  setTimeout(() => setCopiedStackTrace(false), 2000);
                                }}
                                className="hover:text-white"
                              >
                                {copiedStackTrace ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <pre className="whitespace-pre-wrap">{err.stack_trace}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: REAL BUILD LOGS */}
        {activeTab === 'builds' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-bold">Build Pipeline:</span>
                <span className="text-emerald-400">1. Install</span>
                <span>→</span>
                <span className="text-emerald-400">2. Lint</span>
                <span>→</span>
                <span className="text-emerald-400">3. Typecheck</span>
                <span>→</span>
                <span className="text-emerald-400">4. Tests</span>
                <span>→</span>
                <span className="text-emerald-400">5. Bundle</span>
                <span>→</span>
                <span className="text-emerald-400">6. Artifact</span>
              </div>

              <button
                onClick={onTriggerBuild}
                disabled={isBuilding}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded text-[11px] font-bold uppercase transition"
              >
                {isBuilding ? 'Compiling...' : 'Run Build'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-3 custom-scrollbar">
              {builds.length === 0 ? (
                <div className="text-zinc-500 text-center py-6">No build records found. Click "Run Build" to trigger compilation.</div>
              ) : (
                builds.slice(0, 3).map((build) => (
                  <div key={build.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{build.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold uppercase">
                          {build.status}
                        </span>
                        <span className="text-zinc-500">{build.commit_message}</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">
                        {new Date(build.start_time).toLocaleTimeString()} ({build.duration_seconds}s)
                      </span>
                    </div>

                    <div className="p-2 bg-black rounded-lg border border-white/5 space-y-0.5 text-[10px] text-zinc-400 font-mono max-h-24 overflow-y-auto">
                      {build.logs.map((l, i) => (
                        <div key={i}>{l}</div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RUNTIME STREAMING LOGS */}
        {activeTab === 'logs' && (
          <div className="h-full flex flex-col justify-between">
            {/* Logs Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5 text-[11px]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter logs (regex or text)..."
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-2.5 py-0.5 text-zinc-300 text-[11px] focus:outline-none focus:border-rose-500 w-44"
                />

                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-zinc-300 text-[11px] focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="INFO">INFO</option>
                  <option value="DEBUG">DEBUG</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>

                <select
                  value={logServiceFilter}
                  onChange={(e) => setLogServiceFilter(e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded px-2 py-0.5 text-zinc-300 text-[11px] focus:outline-none"
                >
                  <option value="all">All Services</option>
                  <option value="app">App</option>
                  <option value="api">API</option>
                  <option value="worker">Worker</option>
                  <option value="database">Database</option>
                  <option value="websocket">WebSocket</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTailLocked(!isTailLocked)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    isTailLocked
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : 'bg-zinc-900 border-white/5 text-zinc-400'
                  }`}
                >
                  Auto-Scroll
                </button>
                <button
                  onClick={() => setIsStreamPaused(!isStreamPaused)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                    isStreamPaused
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-zinc-900 border-white/5 text-zinc-400'
                  }`}
                >
                  {isStreamPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={handleExportLogs}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Export Logs (TXT)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => db.clearSiteRuntimeLogs(siteId)}
                  className="p-1 text-zinc-500 hover:text-rose-400"
                  title="Clear Logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Logs Stream View */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar">
              {filteredLogs.map((log) => (
                <div key={log.id} className="leading-5 flex items-start gap-2">
                  <span className="text-zinc-600 text-[10px] shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-bold uppercase shrink-0 ${
                      log.level === 'ERROR' || log.level === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300'
                        : log.level === 'WARNING'
                        ? 'bg-amber-950 text-amber-300'
                        : log.level === 'DEBUG'
                        ? 'bg-purple-950 text-purple-300'
                        : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span className="text-sky-400 font-bold shrink-0">[{log.service}]</span>
                  <span className="text-zinc-300 break-all">{log.message}</span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="h-full overflow-y-auto py-2 space-y-2 custom-scrollbar">
            {auditLogs.length === 0 ? (
              <div className="text-zinc-500 text-center py-6">No site audit events recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-2 bg-zinc-950 border border-white/5 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">{log.action}</span>
                      <span className="text-zinc-500">by {log.user_email}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">{log.details}</div>
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
