/**
 * MCLogTerminal — floating slide-up log overlay.
 *
 * - Activated by Cmd+L, MetricBar button, or Quick Action
 * - Slides up from bottom, 40% viewport height
 * - z-40 (below modals z-50, above content)
 * - Persists across navigation (doesn't close on view switch)
 * - Renders logs directly with level filters, search, and auto-scroll
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCLogEntry } from '../../../store/missionControl';

// ── Constants ────────────────────────────────────────────────────────────────

type LogLevel = MCLogEntry['level'];
type TerminalHeight = 'sm' | 'md' | 'lg';

const HEIGHT_MAP: Record<TerminalHeight, string> = { sm: 'h-[25vh]', md: 'h-[40vh]', lg: 'h-[60vh]' };
const HEIGHT_LABEL: Record<TerminalHeight, string> = { sm: 'S', md: 'M', lg: 'L' };
const HEIGHT_CYCLE: Record<TerminalHeight, TerminalHeight> = { sm: 'md', md: 'lg', lg: 'sm' };

const LEVEL_OPTIONS: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'info', label: 'Info' },
  { id: 'warn', label: 'Warn' },
  { id: 'error', label: 'Error' },
];

const LEVEL_BADGE: Record<LogLevel, string> = {
  info: 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint',
  warn: 'bg-accent-orange/10 border-accent-orange/30 text-accent-orange',
  error: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
  debug: 'bg-surface border-border-panel text-text-secondary',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MCLogTerminal() {
  const showLogTerminal = useMissionControlStore((s) => s.showLogTerminal);
  const setShowLogTerminal = useMissionControlStore((s) => s.setShowLogTerminal);
  const logs = useMissionControlStore((s) => s.logs);

  const [terminalHeight, setTerminalHeight] = useState<TerminalHeight>('md');
  const [levelFilter, setLevelFilter] = useState('all');
  const [search, setSearch] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const prevLogCountRef = useRef(logs.length);

  const handleClose = useCallback(() => {
    setShowLogTerminal(false);
  }, [setShowLogTerminal]);

  // Close on Escape
  useEffect(() => {
    if (!showLogTerminal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showLogTerminal, handleClose]);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledRef.current = !atBottom;
  }, []);

  // Auto-scroll on new entries
  useEffect(() => {
    if (logs.length > prevLogCountRef.current && !userScrolledRef.current) {
      const el = containerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevLogCountRef.current = logs.length;
  }, [logs.length]);

  // Filtered logs
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    return logs.filter((log) => {
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;
      if (searchLower && !log.message.toLowerCase().includes(searchLower)) return false;
      return true;
    });
  }, [logs, levelFilter, search]);

  // Stats
  const stats = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    for (const log of filtered) {
      if (log.level === 'error') errorCount++;
      if (log.level === 'warn') warnCount++;
    }
    return { total: filtered.length, errorCount, warnCount };
  }, [filtered]);

  if (!showLogTerminal) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-bg-base border-t border-border-panel',
        'transition-transform duration-300 ease-out',
        HEIGHT_MAP[terminalHeight], 'flex flex-col',
      )}
      style={{ transform: showLogTerminal ? 'translateY(0)' : 'translateY(100%)' }}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-panel bg-header-bg shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="terminal" size="sm" className="text-brand-mint" />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
              Logs
            </span>
          </div>

          {/* Height cycle button */}
          <button
            onClick={() => setTerminalHeight((h) => HEIGHT_CYCLE[h])}
            className={cn(
              'flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border transition-all',
              'bg-surface border-border-panel text-text-secondary hover:text-text-primary',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            )}
            title="Alternar tamanho do terminal"
          >
            <Icon name="unfold_more" size="xs" />
            <span>{HEIGHT_LABEL[terminalHeight]}</span>
          </button>

          {/* Level filter buttons */}
          <div className="flex items-center gap-1">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setLevelFilter(opt.id)}
                className={cn(
                  'text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border transition-all',
                  'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                  levelFilter === opt.id
                    ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                    : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className={cn(
              'bg-bg-base border border-border-panel rounded-sm text-[9px] px-2 py-1 w-40',
              'font-mono text-text-primary placeholder:text-text-secondary/50',
              'focus:border-brand-mint/30 focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            )}
          />

          {/* Stats inline */}
          <div className="flex items-center gap-3 ml-2">
            <span className="text-[8px] font-mono text-text-secondary">{stats.total}</span>
            {stats.errorCount > 0 && (
              <span className="text-[8px] font-mono text-accent-red">{stats.errorCount} err</span>
            )}
            {stats.warnCount > 0 && (
              <span className="text-[8px] font-mono text-accent-orange">{stats.warnCount} warn</span>
            )}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          title="Fechar (Esc)"
        >
          <Icon name="close" size="sm" />
        </button>
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 font-mono text-[9px] space-y-0.5"
      >
        {filtered.length === 0 && (
          <p className="text-text-secondary text-xs text-center py-6">
            Nenhum log registrado
          </p>
        )}

        {filtered.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 py-0.5 hover:bg-surface-hover/50 px-1 rounded-sm"
          >
            <span className="text-[8px] font-mono text-text-secondary whitespace-nowrap shrink-0">
              {formatTime(log.timestamp)}
            </span>
            <span
              className={cn(
                'text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm whitespace-nowrap shrink-0',
                LEVEL_BADGE[log.level],
              )}
            >
              {log.level}
            </span>
            <span className="text-[8px] font-mono text-accent-purple font-bold whitespace-nowrap shrink-0">
              {log.source}
            </span>
            <span className="text-[9px] text-text-primary break-all">
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
