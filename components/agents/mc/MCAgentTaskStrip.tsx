/**
 * MCAgentTaskStrip — horizontal mini task cards for agent profile.
 * Shows non-done tasks as compact cards in a scrollable row.
 * Each card shows priority border, due date, status badge, and hover state.
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCTask } from '../../../store/missionControl';

const PRIORITY_COLOR: Record<MCTask['priority'], string> = {
  critical: 'text-accent-red',
  urgent: 'text-accent-red',
  high: 'text-accent-orange',
  medium: 'text-accent-blue',
  low: 'text-text-secondary',
};

const PRIORITY_BORDER: Record<MCTask['priority'], string> = {
  critical: 'border-t-2 border-t-accent-red',
  urgent: 'border-t-2 border-t-accent-red',
  high: 'border-t-2 border-t-accent-orange',
  medium: 'border-t-2 border-t-accent-blue',
  low: 'border-t border-t-border-panel',
};

const STATUS_BADGE: Record<string, string> = {
  inbox: 'text-text-secondary border-border-panel',
  assigned: 'text-accent-blue border-accent-blue/30',
  in_progress: 'text-accent-orange border-accent-orange/30',
  review: 'text-accent-purple border-accent-purple/30',
  quality_review: 'text-accent-purple border-accent-purple/30',
  awaiting_owner: 'text-accent-orange border-accent-orange/30',
};

function formatDueDate(ts?: number): { label: string; className: string } | null {
  if (!ts) return null;
  const now = new Date();
  const due = new Date(ts);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tomorrowStart = todayStart + 86_400_000;

  if (ts < todayStart) {
    const daysOverdue = Math.ceil((todayStart - ts) / 86_400_000);
    return { label: `${daysOverdue}d atrasada`, className: 'text-accent-red' };
  }
  if (ts < tomorrowStart) {
    return { label: 'hoje', className: 'text-accent-orange' };
  }
  const daysLeft = Math.ceil((ts - todayStart) / 86_400_000);
  return { label: `${daysLeft}d`, className: 'text-text-secondary' };
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    inbox: 'inbox',
    assigned: 'atribuida',
    in_progress: 'em prog',
    review: 'review',
    quality_review: 'qa',
    awaiting_owner: 'aguardando',
  };
  return map[status] ?? status;
}

interface MCAgentTaskStripProps {
  agentName: string;
  onViewAll?: () => void;
}

export function MCAgentTaskStrip({ agentName, onViewAll }: MCAgentTaskStripProps) {
  const tasks = useMissionControlStore((s) => s.tasks);

  const openTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            t.assigned_to?.toLowerCase() === agentName.toLowerCase() &&
            t.status !== 'done',
        )
        .sort((a, b) => {
          const prio: Record<string, number> = { critical: 0, urgent: 1, high: 2, medium: 3, low: 4 };
          return (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3);
        }),
    [tasks, agentName],
  );

  if (openTasks.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <Icon name="check_circle" size="sm" className="text-text-secondary opacity-40" />
        <p className="text-[10px] text-text-secondary">Nenhuma task aberta para este agente.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center overflow-x-auto gap-2 pb-1 scrollbar-hide">
        {openTasks.map((task) => {
          const due = formatDueDate(task.due_date);
          return (
            <div
              key={task.id}
              className={cn(
                'bg-bg-base border border-border-panel rounded-sm p-2.5 min-w-[160px] max-w-[200px] shrink-0',
                'hover:bg-surface-hover transition-all cursor-default',
                PRIORITY_BORDER[task.priority],
              )}
            >
              <p className="text-[10px] font-bold text-text-primary truncate mb-1.5">{task.title}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-[8px] font-bold uppercase tracking-widest', PRIORITY_COLOR[task.priority])}>
                  {task.priority}
                </span>
                <span
                  className={cn(
                    'text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm',
                    STATUS_BADGE[task.status] ?? 'text-text-secondary border-border-panel',
                  )}
                >
                  {statusLabel(task.status)}
                </span>
                {due && (
                  <span className={cn('text-[8px] font-mono', due.className)}>
                    {due.label}
                  </span>
                )}
              </div>
              {task.ticket_ref && (
                <span className="text-[7px] font-mono text-text-secondary mt-1 block">{task.ticket_ref}</span>
              )}
            </div>
          );
        })}
      </div>
      {onViewAll && openTasks.length > 3 && (
        <button
          onClick={onViewAll}
          className="mt-2 text-[8px] text-brand-mint uppercase tracking-widest hover:underline focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Ver todas <Icon name="arrow_forward" size="xs" />
        </button>
      )}
    </div>
  );
}
