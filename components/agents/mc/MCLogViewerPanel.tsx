import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { FilterPills } from '../../ui/FilterPills';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore, type MCLogEntry } from '../../../store/missionControl';
import { useMCPoll } from '../../../hooks/useMCPoll';

// -- Props --------------------------------------------------------------------

interface MCLogViewerPanelProps {
  agentId?: string;
}

// -- Constants ----------------------------------------------------------------

const POLL_INTERVAL_MS = 10_000;
const SKELETON_COUNT = 10;

type LogLevel = MCLogEntry['level'];

const LEVEL_PILLS = [
  { id: 'all', label: 'All' },
  { id: 'info', label: 'Info' },
  { id: 'warn', label: 'Warn' },
  { id: 'error', label: 'Error' },
  { id: 'debug', label: 'Debug' },
];

const LEVEL_CLASSES: Record<LogLevel, string> = {
  info: 'text-accent-blue border-accent-blue/30',
  warn: 'text-accent-orange border-accent-orange/30',
  error: 'text-accent-red border-accent-red/30',
  debug: 'text-text-secondary border-border-panel',
};

// -- Helpers ------------------------------------------------------------------

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function extractUniqueSources(logs: MCLogEntry[]): string[] {
  const set = new Set<string>();
  for (const log of logs) {
    if (log.source) set.add(log.source);
  }
  return Array.from(set).sort();
}

// -- Component ----------------------------------------------------------------

export function MCLogViewerPanel({ agentId }: MCLogViewerPanelProps) {
  const [levelFilter, setLevelFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Scroll lock: track whether user has scrolled up manually
  const containerRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const prevLogCountRef = useRef(0);

  const logs = useMissionControlStore((s) => s.logs);
  const setLogs = useMissionControlStore((s) => s.setLogs);

  // -- Fetch ------------------------------------------------------------------

  const fetchLogs = useCallback(async () => {
    try {
      const res = await mcApi.get<{ data: MCLogEntry[] } | MCLogEntry[]>(
        '/api/logs?limit=200',
      );
      const items = Array.isArray(res) ? res : res.data;
      setLogs(items);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setLogs]);

  useMCPoll(fetchLogs, POLL_INTERVAL_MS);

  // -- Scroll tracking --------------------------------------------------------

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // "near bottom" = within 40px of the scroll end
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    userScrolledRef.current = !atBottom;
  }, []);

  // Auto-scroll to bottom on new logs (unless user scrolled up)
  useEffect(() => {
    if (logs.length > prevLogCountRef.current && !userScrolledRef.current) {
      const el = containerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
    prevLogCountRef.current = logs.length;
  }, [logs.length]);

  // -- Derived ----------------------------------------------------------------

  const sources = useMemo(() => extractUniqueSources(logs), [logs]);

  const sourcePills = useMemo(
    () => [{ id: 'all', label: 'Todas' }, ...sources.map((s) => ({ id: s, label: s }))],
    [sources],
  );

  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();

    return logs.filter((log) => {
      // Level filter
      if (levelFilter !== 'all' && log.level !== levelFilter) return false;

      // Source filter (agentId prop takes precedence over dropdown)
      if (agentId) {
        if (log.source.toLowerCase() !== agentId.toLowerCase()) return false;
      } else if (sourceFilter !== 'all') {
        if (log.source !== sourceFilter) return false;
      }

      // Text search
      if (searchLower && !log.message.toLowerCase().includes(searchLower)) return false;

      return true;
    });
  }, [logs, levelFilter, sourceFilter, agentId, search]);

  // -- Stats ------------------------------------------------------------------

  const stats = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    for (const log of filtered) {
      if (log.level === 'error') errorCount++;
      if (log.level === 'warn') warnCount++;
    }
    return { total: filtered.length, errorCount, warnCount };
  }, [filtered]);

  // -- Loading state ----------------------------------------------------------

  if (loading && logs.length === 0) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Logs
        </div>
        <div className="bg-bg-base border border-border-panel rounded-sm p-2 space-y-1">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="h-4 bg-border-panel animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  // -- Render -----------------------------------------------------------------

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      {/* Header */}
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
        Logs
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <FilterPills
          pills={LEVEL_PILLS}
          activeId={levelFilter}
          onSelect={setLevelFilter}
        />

        {/* Source filter (only when not scoped to a single agent) */}
        {!agentId && sources.length > 1 && (
          <FilterPills
            pills={sourcePills}
            activeId={sourceFilter}
            onSelect={setSourceFilter}
          />
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'bg-bg-base border border-border-panel rounded-sm px-2 py-1',
            'text-[10px] font-mono text-text-primary placeholder:text-text-secondary/50',
            'focus:border-brand-mint/30 focus:outline-none w-48',
            'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
          )}
          placeholder="Buscar logs..."
        />
      </div>

      {/* Error state */}
      {error && logs.length === 0 && (
        <p className="text-text-secondary text-xs text-center py-6">
          Falha ao carregar logs
        </p>
      )}

      {/* Log container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="bg-bg-base border border-border-panel rounded-sm p-2 font-mono text-[9px] overflow-y-auto max-h-[calc(100vh-240px)] space-y-0.5"
      >
        {!error && filtered.length === 0 && (
          <p className="text-text-secondary text-xs text-center py-6">
            Nenhum log registrado
          </p>
        )}

        {filtered.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-2 py-0.5 hover:bg-surface/50 px-1 rounded-sm"
          >
            <span className="text-[8px] font-mono text-text-secondary whitespace-nowrap">
              {formatTime(log.timestamp)}
            </span>
            <span
              className={cn(
                'text-[7px] font-bold uppercase tracking-widest px-1.5 py-0 border rounded-sm whitespace-nowrap',
                LEVEL_CLASSES[log.level],
              )}
            >
              {log.level}
            </span>
            <span className="text-[8px] text-accent-purple font-bold whitespace-nowrap">
              {log.source}
            </span>
            <span className="text-[9px] text-text-primary break-all">
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mt-2">
        <span className="text-[8px] font-mono text-text-secondary">
          {stats.total} logs
        </span>
        <span className="text-[8px] font-mono text-accent-red">
          {stats.errorCount} errors
        </span>
        <span className="text-[8px] font-mono text-accent-orange">
          {stats.warnCount} warnings
        </span>
      </div>
    </div>
  );
}
