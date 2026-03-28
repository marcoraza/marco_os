/**
 * MCTaskDetailDrawer — Sprint 5
 *
 * Right overlay (w-[380px], z-50) for task details.
 * Opens via taskDetailId in the MC store.
 * Supports inline status update.
 */
import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { SectionLabel } from '../../ui/SectionLabel';
import { useMissionControlStore, type MCTask } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<MCTask['priority'], { cls: string; label: string }> = {
  low:      { cls: 'text-text-secondary border-border-panel',            label: 'Baixa' },
  medium:   { cls: 'text-accent-blue border-accent-blue/30',             label: 'Media' },
  high:     { cls: 'text-accent-orange border-accent-orange/30',         label: 'Alta' },
  critical: { cls: 'text-accent-red border-accent-red/30',               label: 'Critica' },
  urgent:   { cls: 'text-accent-red border-accent-red/30 animate-pulse', label: 'Urgente' },
};

const STATUS_OPTIONS: { value: MCTask['status']; label: string }[] = [
  { value: 'inbox',          label: 'Inbox' },
  { value: 'assigned',       label: 'Atribuida' },
  { value: 'in_progress',    label: 'Em progresso' },
  { value: 'review',         label: 'Revisao' },
  { value: 'quality_review', label: 'QA' },
  { value: 'done',           label: 'Concluida' },
  { value: 'awaiting_owner', label: 'Aguardando owner' },
];

function formatDate(ts?: number): string {
  if (!ts) return '--';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m atras`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atras`;
  return `${Math.floor(diff / 86_400_000)}d atras`;
}

// ── Detail content ────────────────────────────────────────────────────────────

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border-panel/50 last:border-b-0">
      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary shrink-0 mt-0.5">
        {label}
      </span>
      <div className="text-right">{children}</div>
    </div>
  );
}

function TaskDetail({ task }: { task: MCTask }) {
  const updateTask = useMissionControlStore((s) => s.updateTask);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = useCallback(
    async (newStatus: MCTask['status']) => {
      setUpdatingStatus(true);
      // Optimistic update
      updateTask(task.id, { status: newStatus });
      try {
        await mcApi.patch(`/api/tasks/${task.id}`, { status: newStatus });
      } catch {
        // Revert on error
        updateTask(task.id, { status: task.status });
      } finally {
        setUpdatingStatus(false);
      }
    },
    [task.id, task.status, updateTask],
  );

  const prio = PRIORITY_STYLE[task.priority];
  const isOverdue = task.due_date && task.due_date < Date.now() && task.status !== 'done';

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      {/* Title */}
      <div>
        <p className="text-sm font-bold text-text-primary leading-snug">{task.title}</p>
        {task.ticket_ref && (
          <span className="text-[8px] font-mono text-accent-blue mt-1 inline-block">{task.ticket_ref}</span>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-bg-base border border-border-panel rounded-sm p-3">
          <SectionLabel>Descricao</SectionLabel>
          <p className="text-[10px] text-text-primary leading-relaxed mt-1 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {/* Status selector */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <SectionLabel>Status</SectionLabel>
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as MCTask['status'])}
          disabled={updatingStatus}
          className={cn(
            'mt-2 w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5',
            'text-[10px] text-text-primary focus:outline-none focus:border-brand-mint/50 transition-colors font-sans',
            updatingStatus && 'opacity-50 cursor-not-allowed',
          )}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Meta */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <SectionLabel>Detalhes</SectionLabel>
        <div className="mt-2">
          <MetaRow label="Prioridade">
            <span className={cn('text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm', prio.cls)}>
              {prio.label}
            </span>
          </MetaRow>
          {task.assigned_to && (
            <MetaRow label="Agente">
              <span className="text-[10px] font-mono text-text-primary">{task.assigned_to}</span>
            </MetaRow>
          )}
          {task.project_name && (
            <MetaRow label="Projeto">
              <span className="text-[10px] text-text-primary">{task.project_name}</span>
            </MetaRow>
          )}
          <MetaRow label="Criado">
            <span className="text-[9px] font-mono text-text-secondary">{formatRelative(task.created_at)}</span>
          </MetaRow>
          {task.due_date && (
            <MetaRow label="Prazo">
              <span className={cn('text-[9px] font-mono', isOverdue ? 'text-accent-red' : 'text-text-secondary')}>
                {formatDate(task.due_date)}
                {isOverdue && <span className="ml-1">(atrasado)</span>}
              </span>
            </MetaRow>
          )}
          {task.estimated_hours != null && (
            <MetaRow label="Estimativa">
              <span className="text-[9px] font-mono text-text-secondary">{task.estimated_hours}h</span>
            </MetaRow>
          )}
          {task.actual_hours != null && (
            <MetaRow label="Real">
              <span className="text-[9px] font-mono text-text-secondary">{task.actual_hours}h</span>
            </MetaRow>
          )}
        </div>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <SectionLabel>Tags</SectionLabel>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-bold uppercase tracking-widest bg-bg-base border border-border-panel px-2 py-0.5 rounded-sm text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Outcome (if done) */}
      {task.outcome && (
        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <SectionLabel>Resultado</SectionLabel>
          <div className="mt-2 flex items-center gap-2">
            <Icon
              name={task.outcome === 'success' ? 'check_circle' : task.outcome === 'failed' ? 'cancel' : 'pending'}
              size="sm"
              className={
                task.outcome === 'success' ? 'text-brand-mint' :
                task.outcome === 'failed' ? 'text-accent-red' : 'text-accent-orange'
              }
            />
            <span className="text-[10px] text-text-primary capitalize">{task.outcome}</span>
          </div>
          {task.error_message && (
            <p className="text-[9px] font-mono text-accent-red mt-2 bg-accent-red/5 border border-accent-red/20 rounded-sm p-2">
              {task.error_message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCTaskDetailDrawer() {
  const taskDetailId = useMissionControlStore((s) => s.taskDetailId);
  const setTaskDetailId = useMissionControlStore((s) => s.setTaskDetailId);
  const tasks = useMissionControlStore((s) => s.tasks);

  const task = taskDetailId != null ? tasks.find((t) => t.id === taskDetailId) ?? null : null;
  const isOpen = task !== null;

  const close = useCallback(() => setTaskDetailId(null), [setTaskDetailId]);

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-[380px] z-50 bg-bg-base border-l border-border-panel flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-panel shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                Detalhe da task
              </span>
              <button
                onClick={close}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors rounded-sm focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>

            <TaskDetail task={task} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
