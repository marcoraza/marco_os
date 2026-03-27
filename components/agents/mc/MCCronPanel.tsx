/**
 * MCCronPanel
 *
 * Cron job management panel for the agent section.
 * Lists all cron jobs with status, schedule, and an enable/disable toggle.
 * Optionally filtered by agentId.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore, type MCCronJob } from '../../../store/missionControl';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Props ────────────────────────────────────────────────────────────────────

interface MCCronPanelProps {
  agentId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 15_000;
const SKELETON_COUNT = 3;

const STATUS_DOT: Record<string, string> = {
  success: 'bg-brand-mint',
  error: 'bg-accent-red',
  running: 'bg-accent-orange',
};

const STATUS_BADGE: Record<string, { text: string; border: string; bg: string; label: string }> = {
  success: {
    text: 'text-brand-mint',
    border: 'border-brand-mint/30',
    bg: 'bg-brand-mint/10',
    label: 'OK',
  },
  error: {
    text: 'text-accent-red',
    border: 'border-accent-red/30',
    bg: 'bg-accent-red/10',
    label: 'Erro',
  },
  running: {
    text: 'text-accent-orange',
    border: 'border-accent-orange/30',
    bg: 'bg-accent-orange/10',
    label: 'Rodando',
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = ts - Date.now();
  // Past timestamps
  if (diff < 0) {
    const ago = Math.abs(diff);
    if (ago < 60_000) return 'agora';
    if (ago < 3_600_000) return `${Math.floor(ago / 60_000)}m atras`;
    if (ago < 86_400_000) return `${Math.floor(ago / 3_600_000)}h atras`;
    return `${Math.floor(ago / 86_400_000)}d atras`;
  }
  // Future timestamps
  if (diff < 60_000) return 'em breve';
  if (diff < 3_600_000) return `em ${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `em ${Math.floor(diff / 3_600_000)}h`;
  return `em ${Math.floor(diff / 86_400_000)}d`;
}

function relativeTimePast(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="bg-border-panel animate-pulse rounded-sm h-14" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
        schedule
      </span>
      <p className="text-text-secondary text-xs text-center">Nenhum cron job configurado</p>
    </div>
  );
}

function CronToggle({
  enabled,
  onToggle,
  toggling,
}: {
  enabled: boolean;
  onToggle: () => void;
  toggling: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={toggling}
      aria-label={enabled ? 'Desativar cron' : 'Ativar cron'}
      className={cn(
        'w-8 h-4 rounded-full transition-colors relative flex-shrink-0',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        toggling && 'opacity-50 cursor-not-allowed',
        enabled ? 'bg-brand-mint/30' : 'bg-border-panel',
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full transition-transform',
          enabled ? 'translate-x-4 bg-brand-mint' : 'translate-x-0.5 bg-text-secondary',
        )}
      />
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function MCCronPanel({ agentId }: MCCronPanelProps) {
  const cronJobs = useMissionControlStore((s) => s.cronJobs);
  const setCronJobs = useMissionControlStore((s) => s.setCronJobs);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);

  const [loading, setLoading] = useState(true);
  const [togglingSet, setTogglingSet] = useState<Set<string>>(new Set());

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchCronJobs = useCallback(async () => {
    try {
      const res = await mcApi.get<{ data: MCCronJob[] } | MCCronJob[]>('/api/cron');
      const jobs = Array.isArray(res) ? res : (res as { data: MCCronJob[] }).data ?? [];
      setCronJobs(jobs);
    } catch {
      // Silently fail; polling will retry
    } finally {
      setLoading(false);
    }
  }, [setCronJobs]);

  useMCPoll(fetchCronJobs, POLL_INTERVAL_MS, { backoff: true });

  // ── Toggle ─────────────────────────────────────────────────────────────────

  const handleToggle = useCallback(
    async (job: MCCronJob) => {
      const key = job.id ?? job.name;
      if (togglingSet.has(key)) return;

      setTogglingSet((prev) => new Set(prev).add(key));

      // Optimistic update
      const next = !job.enabled;
      setCronJobs(
        cronJobs.map((j) =>
          (j.id ?? j.name) === key ? { ...j, enabled: next } : j,
        ),
      );

      try {
        await mcApi.patch('/api/cron', { name: job.name, enabled: next });
      } catch {
        // Revert on failure
        setCronJobs(
          cronJobs.map((j) =>
            (j.id ?? j.name) === key ? { ...j, enabled: job.enabled } : j,
          ),
        );
      } finally {
        setTogglingSet((prev) => {
          const copy = new Set(prev);
          copy.delete(key);
          return copy;
        });
      }
    },
    [cronJobs, setCronJobs, togglingSet],
  );

  // ── Filter by agent ────────────────────────────────────────────────────────

  const filteredJobs = useMemo(() => {
    if (!agentId) return cronJobs;
    return cronJobs.filter((j) => j.agentId === agentId);
  }, [cronJobs, agentId]);

  // ── Render ─────────────────────────────────────────────────────────────────

  // Loading
  if (loading && filteredJobs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Cron Jobs
        </span>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty
  if (filteredJobs.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Cron Jobs
        </span>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Cron Jobs
        </span>
        <span className="text-[8px] font-mono text-text-secondary">
          {filteredJobs.filter((j) => j.enabled).length}/{filteredJobs.length} ativos
        </span>
      </div>

      {/* Job list */}
      <div className="flex flex-col gap-2">
        {filteredJobs.map((job) => {
          const key = job.id ?? job.name;
          const dotColor = job.enabled
            ? STATUS_DOT[job.lastStatus ?? ''] ?? 'bg-brand-mint'
            : 'bg-text-secondary';
          const badge = job.lastStatus ? STATUS_BADGE[job.lastStatus] : null;

          return (
            <div
              key={key}
              className="bg-surface border border-border-panel rounded-sm p-3 flex items-center justify-between gap-3"
            >
              {/* Left: status dot + info */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    dotColor,
                    job.lastStatus === 'running' && 'animate-pulse',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-text-primary truncate">{job.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-text-secondary">{job.schedule}</span>
                    {job.model && (
                      <span className="text-[8px] font-mono text-text-secondary border border-border-panel px-1 py-px rounded-sm">
                        {job.model}
                      </span>
                    )}
                  </div>
                  {job.lastError && job.lastStatus === 'error' && (
                    <p className="text-[8px] text-accent-red mt-0.5 truncate max-w-[250px]">
                      {job.lastError}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: badges + timing + toggle */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Last status badge */}
                {badge && (
                  <span
                    className={cn(
                      'text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm',
                      badge.text,
                      badge.border,
                      badge.bg,
                    )}
                  >
                    {badge.label}
                  </span>
                )}

                {/* Timing info */}
                <div className="flex flex-col items-end gap-0.5">
                  {job.lastRun && (
                    <span className="text-[8px] font-mono text-text-secondary">
                      <Icon name="history" size="xs" className="text-text-secondary align-middle mr-0.5" />
                      {relativeTimePast(job.lastRun)}
                    </span>
                  )}
                  {job.nextRun && job.enabled && (
                    <span className="text-[8px] font-mono text-text-secondary">
                      <Icon name="schedule" size="xs" className="text-text-secondary align-middle mr-0.5" />
                      {relativeTime(job.nextRun)}
                    </span>
                  )}
                </div>

                {/* Toggle switch */}
                <CronToggle
                  enabled={job.enabled}
                  onToggle={() => handleToggle(job)}
                  toggling={togglingSet.has(key)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
