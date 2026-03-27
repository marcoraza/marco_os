import React, { useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCAgent } from '../../../store/missionControl';

// ── Types ────────────────────────────────────────────────────────────────────

interface MCOverviewPanelProps {
  onAgentClick?: (agentId: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT_COLOR: Record<MCAgent['status'], string> = {
  idle: 'bg-brand-mint',
  busy: 'bg-accent-orange',
  error: 'bg-accent-red',
  offline: 'bg-text-secondary',
};

function relativeTime(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  value,
  label,
  colorClass,
}: {
  value: number;
  label: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col items-center gap-1 min-w-0">
      <span className={cn('text-lg font-black font-mono', colorClass ?? 'text-text-primary')}>
        {value}
      </span>
      <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary truncate">
        {label}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-border-panel animate-pulse rounded-sm h-16" />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-border-panel animate-pulse rounded-sm h-10" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
        hub
      </span>
      <p className="text-text-secondary text-xs text-center">Nenhum agente registrado</p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function MCOverviewPanel({ onAgentClick }: MCOverviewPanelProps) {
  const agents = useMissionControlStore((s) => s.agents);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);

  const visibleAgents = useMemo(
    () => agents.filter((a) => !a.hidden),
    [agents],
  );

  const metrics = useMemo(() => {
    const total = visibleAgents.length;
    const online = visibleAgents.filter((a) => a.status !== 'offline').length;
    let inProgress = 0;
    let blocked = 0;

    for (const agent of visibleAgents) {
      if (agent.taskStats) {
        inProgress += agent.taskStats.in_progress;
      }
    }

    // blocked is not directly in taskStats, derive from tasks store if needed
    // For now use 0 as baseline; the standup summary provides blocked count
    const standup = useMissionControlStore.getState().currentStandup;
    if (standup) {
      blocked = standup.summary.totalBlocked;
    }

    return { total, online, inProgress, blocked };
  }, [visibleAgents]);

  const handleRowClick = useCallback(
    (agent: MCAgent) => {
      onAgentClick?.(String(agent.id));
    },
    [onAgentClick],
  );

  // Loading state
  if (visibleAgents.length === 0 && connectionStatus === 'connecting') {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Visao geral
        </span>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (visibleAgents.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Visao geral
        </span>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
        Visao geral
      </span>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-2">
        <MetricCard value={metrics.total} label="agentes" />
        <MetricCard value={metrics.online} label="online" colorClass="text-brand-mint" />
        <MetricCard value={metrics.inProgress} label="em progresso" colorClass="text-accent-blue" />
        <MetricCard value={metrics.blocked} label="bloqueados" colorClass="text-accent-red" />
      </div>

      {/* Agent table */}
      <div className="bg-surface border border-border-panel rounded-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[20px_1fr_auto_100px_50px] gap-2 items-center px-3 py-2 border-b border-border-panel">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
            Nome
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
            Papel
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-right">
            Tarefas
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-right">
            Visto
          </span>
        </div>

        {/* Table rows */}
        {visibleAgents.map((agent) => {
          const stats = agent.taskStats;
          const assigned = stats?.assigned ?? 0;
          const inProg = stats?.in_progress ?? 0;
          const done = (stats?.done ?? 0) + (stats?.completed ?? 0);

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => handleRowClick(agent)}
              className={cn(
                'grid grid-cols-[20px_1fr_auto_100px_50px] gap-2 items-center px-3 py-2',
                'w-full text-left transition-all duration-300 ease-out',
                'hover:bg-surface-hover',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              )}
            >
              {/* Status dot */}
              <span className="flex items-center justify-center">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    STATUS_DOT_COLOR[agent.status] ?? 'bg-text-secondary',
                  )}
                />
              </span>

              {/* Name */}
              <span className="text-xs font-bold text-text-primary truncate">
                {agent.name}
              </span>

              {/* Role badge */}
              <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border border-border-panel rounded-sm text-text-secondary bg-surface truncate max-w-[120px]">
                {agent.role}
              </span>

              {/* Task stats */}
              <span className="text-right font-mono text-[9px] text-text-secondary flex items-center justify-end gap-1">
                <span className="text-text-primary">{assigned}</span>
                <span>/</span>
                <span className="text-accent-blue">{inProg}</span>
                <span>/</span>
                <span className="text-brand-mint">{done}</span>
              </span>

              {/* Last seen */}
              <span className="text-right font-mono text-[9px] text-text-secondary">
                {relativeTime(agent.last_seen)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Task stats legend */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[7px] text-text-secondary uppercase tracking-widest flex items-center gap-1">
          <Icon name="assignment" size="xs" className="text-text-secondary" />
          atrib
        </span>
        <span className="text-[7px] text-accent-blue uppercase tracking-widest flex items-center gap-1">
          <Icon name="pending" size="xs" />
          prog
        </span>
        <span className="text-[7px] text-brand-mint uppercase tracking-widest flex items-center gap-1">
          <Icon name="check_circle" size="xs" />
          feito
        </span>
      </div>
    </div>
  );
}
