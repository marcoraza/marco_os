import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore, type MCStandupReport, type MCTask } from '../../../store/missionControl';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Props ────────────────────────────────────────────────────────────────────

interface MCStandupPanelProps {
  agentId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000;
const SKELETON_COUNT = 3;

const STATUS_COLOR: Record<string, string> = {
  busy: 'bg-brand-mint',
  idle: 'bg-accent-blue',
  offline: 'bg-text-secondary',
  error: 'bg-accent-red',
};

// ── Sub-components ───────────────────────────────────────────────────────────

function MetricPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface border border-border-panel rounded-sm px-3 py-1.5 flex items-center gap-2">
      <span className={cn('text-sm font-black font-mono', color)}>{value}</span>
      <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">{label}</span>
    </div>
  );
}

function TaskChip({ task }: { task: MCTask }) {
  return (
    <span className="text-[9px] text-text-primary bg-bg-base border border-border-panel px-2 py-0.5 rounded-sm truncate max-w-[200px]">
      {task.title}
    </span>
  );
}

function AgentReportCard({ report }: { report: MCStandupReport['agentReports'][number] }) {
  const { agent, completedToday, inProgress, assigned, review, blocked, activity } = report;
  const statusColor = STATUS_COLOR[agent.status] || 'bg-text-secondary';
  const barTotal = completedToday.length + inProgress.length + blocked.length;

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 mb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', statusColor)} />
          <span className="text-xs font-bold text-text-primary">{agent.name}</span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary bg-surface border border-border-panel px-2 py-0.5 rounded-sm">
            {agent.role}
          </span>
        </div>
        <span className="text-[8px] font-mono text-text-secondary">
          {activity.actionCount} acoes / {activity.commentsCount} comentarios
        </span>
      </div>

      {/* Horizontal metric bar */}
      {barTotal > 0 && (
        <div className="flex gap-1 h-2 rounded-sm overflow-hidden mb-2">
          {completedToday.length > 0 && (
            <div className="bg-brand-mint" style={{ flex: completedToday.length }} />
          )}
          {inProgress.length > 0 && (
            <div className="bg-accent-blue" style={{ flex: inProgress.length }} />
          )}
          {blocked.length > 0 && (
            <div className="bg-accent-red" style={{ flex: blocked.length }} />
          )}
        </div>
      )}

      {/* Completed */}
      {completedToday.length > 0 && (
        <div className="mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-brand-mint">
            Concluidos ({completedToday.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {completedToday.map((t) => (
              <TaskChip key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-accent-blue">
            Em Progresso ({inProgress.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {inProgress.map((t) => (
              <TaskChip key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* Assigned */}
      {assigned.length > 0 && (
        <div className="mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-primary">
            Atribuidos ({assigned.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {assigned.map((t) => (
              <TaskChip key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* Review */}
      {review.length > 0 && (
        <div className="mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-accent-purple">
            Em Revisao ({review.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {review.map((t) => (
              <TaskChip key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {/* Blocked */}
      {blocked.length > 0 && (
        <div className="mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-accent-red">
            Bloqueados ({blocked.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {blocked.map((t) => (
              <TaskChip key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatStandupDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

function formatGeneratedAt(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function MCStandupPanel({ agentId }: MCStandupPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentStandup = useMissionControlStore((s) => s.currentStandup);
  const setCurrentStandup = useMissionControlStore((s) => s.setCurrentStandup);

  const fetchStandup = useCallback(async () => {
    try {
      const res = await mcApi.get<{ data: MCStandupReport } | MCStandupReport>(
        '/api/standup',
      );
      const report = (res as { data: MCStandupReport }).data || (res as MCStandupReport);
      setCurrentStandup(report);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setCurrentStandup]);

  useMCPoll(fetchStandup, POLL_INTERVAL_MS);

  const agentReports = useMemo(() => {
    if (!currentStandup) return [];
    if (agentId) {
      return currentStandup.agentReports.filter(
        (r) => r.agent.name.toLowerCase() === agentId.toLowerCase(),
      );
    }
    return currentStandup.agentReports;
  }, [currentStandup, agentId]);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading && !currentStandup) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Standup
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-28 bg-border-panel animate-pulse rounded-sm" />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="h-24 bg-border-panel animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error / empty state ────────────────────────────────────────────────────

  if (error && !currentStandup) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Standup
        </div>
        <p className="text-text-secondary text-xs text-center py-6">
          Falha ao carregar standup
        </p>
      </div>
    );
  }

  if (!currentStandup) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Standup
        </div>
        <p className="text-text-secondary text-xs text-center py-6">
          Nenhum standup disponivel. Gere um standup no MC Service.
        </p>
      </div>
    );
  }

  const { summary } = currentStandup;

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
            Standup
          </div>
          <div className="flex items-center gap-2 text-[8px] font-mono text-text-secondary">
            <Icon name="calendar_today" size="xs" />
            <span>{formatStandupDate(currentStandup.date)}</span>
            <span className="text-border-panel">|</span>
            <span>Gerado {formatGeneratedAt(currentStandup.generatedAt)}</span>
          </div>
        </div>

        {/* Summary metric pills */}
        <div className="flex flex-wrap gap-2">
          <MetricPill label="Concluidos" value={summary.totalCompleted} color="text-brand-mint" />
          <MetricPill label="Em Progresso" value={summary.totalInProgress} color="text-accent-blue" />
          <MetricPill label="Atribuidos" value={summary.totalAssigned} color="text-text-primary" />
          <MetricPill label="Em Revisao" value={summary.totalReview} color="text-accent-purple" />
          <MetricPill label="Bloqueados" value={summary.totalBlocked} color="text-accent-red" />
          <MetricPill label="Atrasados" value={summary.overdue} color="text-accent-orange" />
        </div>
      </div>

      {/* Agent reports */}
      {agentReports.length > 0 && (
        <div>
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
            Relatorios por agente ({agentReports.length})
          </div>
          {agentReports.map((report, i) => (
            <AgentReportCard key={report.agent.name + i} report={report} />
          ))}
        </div>
      )}

      {agentReports.length === 0 && (
        <p className="text-text-secondary text-xs text-center py-4">
          Nenhum agente com atividade registrada
        </p>
      )}

      {/* Team blockers */}
      {currentStandup.teamBlockers.length > 0 && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-sm px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="block" size="sm" className="text-accent-red" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-accent-red">
              Bloqueios do time ({currentStandup.teamBlockers.length})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {currentStandup.teamBlockers.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[9px] text-text-primary truncate">{t.title}</span>
                {t.assigned_to && (
                  <span className="text-[8px] font-mono text-text-secondary shrink-0">
                    {t.assigned_to}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue tasks */}
      {currentStandup.overdueTasks.length > 0 && (
        <div className="bg-accent-orange/10 border border-accent-orange/30 rounded-sm px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="schedule" size="sm" className="text-accent-orange" />
            <span className="text-[8px] font-bold uppercase tracking-widest text-accent-orange">
              Atrasados ({currentStandup.overdueTasks.length})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {currentStandup.overdueTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <span className="text-[9px] text-text-primary truncate">{t.title}</span>
                {t.assigned_to && (
                  <span className="text-[8px] font-mono text-text-secondary shrink-0">
                    {t.assigned_to}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
