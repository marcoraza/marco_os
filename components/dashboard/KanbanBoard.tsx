import React, { useState, useRef } from 'react';
import type { Task } from '../../lib/appTypes';
import { Icon, Badge, Card, showToast } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';
import { KANBAN_COLUMNS } from './types';
import { prioPillColor, getDeadlineColor, getTaskTimestamp, getPriorityPill } from './utils';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  displayTasks: Task[];
  collapsedCols: Set<Task['status']>;
  activeColumn: Task['status'];
  onToggleCollapse: (id: Task['status']) => void;
  onTaskClick: (id: number) => void;
  onAddTask: () => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, newStatus: Task['status']) => void;
  onDeleteTask?: (id: number) => void;
  onStatusChange?: (id: number, status: Task['status']) => void;
  className?: string;
}

type DeleteState = 'idle' | 'confirming';

export default function KanbanBoard({
  columns,
  displayTasks,
  collapsedCols,
  activeColumn,
  onToggleCollapse,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragOver,
  onDrop,
  onDeleteTask,
  onStatusChange,
  className,
}: KanbanBoardProps) {
  const [deleteStates, setDeleteStates] = useState<Record<number, DeleteState>>({});
  const didDrag = useRef(false);

  const setDelState = (id: number, s: DeleteState) =>
    setDeleteStates(prev => ({ ...prev, [id]: s }));

  // ── drag helpers ──
  const onCardDragStart = (e: React.DragEvent, task: Task) => {
    didDrag.current = true;
    onDragStart(e, task.id);
  };
  const onCardDragEnd = () => {
    setTimeout(() => { didDrag.current = false; }, 150);
  };

  // ── delete helpers ──
  const onXClick = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDelState(id, 'confirming');
  };
  const onConfirm = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteTask?.(id);
    showToast('Tarefa arquivada');
    setDelState(id, 'idle');
  };
  const onCancel = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDelState(id, 'idle');
  };

  // ── drop zone handlers (for both column and inner scroll) ──
  const dropOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver(e);
  };
  const dropHandler = (e: React.DragEvent, colId: Task['status']) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, colId);
  };

  // ── deadline label ──
  const deadlineLabel = (task: Task): string | null => {
    const d = task.deadline;
    if (!d || d === 'A definir') return null;
    if (task.status === 'done') return null;
    if (d === 'Hoje') return 'Prazo: Hoje — urgente';
    if (d === 'Amanhã') return 'Prazo: Amanhã';
    if (d === 'Ontem') return 'Prazo: Ontem — atrasada';
    if (d.includes('atrás')) return `Prazo: ${d} — atrasada`;
    return `Prazo: ${d}`;
  };

  const deadlineColor = (task: Task): string => {
    const d = task.deadline;
    if (d === 'Hoje' || d === 'Ontem' || d?.includes('atrás')) return 'text-accent-red';
    return getDeadlineColor(d);
  };

  // ── render task card ──
  const renderCard = (task: Task) => {
    const ds = deleteStates[task.id] ?? 'idle';
    const dl = deadlineLabel(task);
    const ts = getTaskTimestamp(task);

    return (
      <Card
        key={task.id}
        className="p-2 space-y-0.5 cursor-grab active:cursor-grabbing relative group rounded-sm"
        draggable
        onDragStart={(e) => onCardDragStart(e, task)}
        onDragEnd={onCardDragEnd}
        onClick={() => {
          if (didDrag.current) return;
          if (ds === 'idle') onTaskClick(task.id);
        }}
      >
        {/* × delete button — hover only */}
        {ds === 'idle' && (
          <button
            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 text-[11px] leading-none font-bold w-4 h-4 flex items-center justify-center rounded-sm hover:bg-surface transition-all z-20"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => onXClick(e, task.id)}
            title="Excluir"
          >
            ✕
          </button>
        )}

        {/* Confirm overlay */}
        {ds === 'confirming' && (
          <div
            className="absolute inset-0 flex items-center justify-center gap-2 bg-bg-base/95 rounded-sm z-30"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-text-secondary font-mono">Excluir?</span>
            <button
              className="text-[10px] font-bold text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded-sm border border-red-500/30 hover:border-red-400/50 transition-colors"
              onClick={(e) => onConfirm(e, task.id)}
            >
              Sim
            </button>
            <button
              className="text-[10px] font-bold text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded-sm border border-border-panel transition-colors"
              onClick={(e) => onCancel(e, task.id)}
            >
              Não
            </button>
          </div>
        )}

        {/* Title + priority */}
        <div className="flex items-start justify-between gap-2 pr-4">
          <span className="text-[12px] text-text-primary font-medium leading-snug">
            {task.title}
          </span>
          {getPriorityPill(task.priority)}
        </div>

        {/* Tag + deadline */}
        <div className="space-y-0.5">
          {task.tag && task.tag !== '[]' && task.tag !== '' && (
            <p className="text-[11px] text-text-secondary leading-relaxed">{task.tag}</p>
          )}
          {dl && (
            <p className={cn('text-[11px] leading-relaxed', deadlineColor(task))}>{dl}</p>
          )}
        </div>

        {/* Timestamp */}
        {ts && (
          <p className="text-[11px] font-mono text-text-secondary/60 pt-0.5">{ts}</p>
        )}

        {/* Mobile status dropdown */}
        <div className="md:hidden mt-1" onClick={(e) => e.stopPropagation()}>
          <select
            className="w-full text-[10px] font-mono bg-surface border border-border-panel rounded-sm px-1.5 py-1 text-text-secondary focus:outline-none focus:border-text-secondary/50"
            value={task.status}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as Task['status'])}
          >
            {KANBAN_COLUMNS.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </Card>
    );
  };

  // ── collapsed column ──
  const renderCollapsed = (col: KanbanColumn, colTasks: Task[]) => (
    <div
      key={col.id}
      className="w-12 shrink-0 bg-bg-base rounded-sm border border-border-panel hidden md:flex flex-col items-center py-3 gap-3 cursor-pointer hover:border-text-secondary/30 transition-all"
      onClick={() => onToggleCollapse(col.id)}
    >
      <Icon name="chevron_right" size="xs" className="text-text-secondary" />
      <Badge variant={col.variant} size="xs">{colTasks.length}</Badge>
      <span
        className="text-[8px] font-black uppercase tracking-widest text-text-secondary"
        style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
      >
        {col.title}
      </span>
      <div className="flex flex-col gap-1 mt-auto px-1.5 w-full">
        {colTasks.slice(0, 6).map(t => (
          <div
            key={t.id}
            className={cn('h-[3px] rounded-full w-full', prioPillColor[t.priority] || 'bg-text-secondary/30')}
            title={t.title}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn('p-4 flex gap-3 overflow-hidden', className)}>
      {columns.map(col => {
        const colTasks = displayTasks.filter(t => t.status === col.id);

        if (collapsedCols.has(col.id)) return renderCollapsed(col, colTasks);

        return (
          <div
            key={col.id}
            className={cn(
              'flex-1 flex flex-col gap-1.5 min-w-0',
              activeColumn !== col.id && 'hidden md:flex'
            )}
            onDragOver={dropOver}
            onDrop={(e) => dropHandler(e, col.id)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1 shrink-0">
              <button
                onClick={() => onToggleCollapse(col.id)}
                className="p-0.5 rounded-sm hover:bg-surface text-text-secondary hover:text-text-primary hidden md:block"
              >
                <Icon name="expand_more" size="xs" />
              </button>
              <Icon name={col.icon} size="xs" className="text-text-secondary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                {col.title}
              </span>
              <Badge variant={col.variant} size="xs">{colTasks.length}</Badge>
            </div>

            {/* Task list — fixed height for ~4 cards, scroll for more */}
            <div
              className="flex flex-col bg-bg-base rounded-sm border border-border-panel p-2 min-h-0"
              onDragOver={dropOver}
              onDrop={(e) => dropHandler(e, col.id)}
            >
              <div
                className="flex flex-col gap-1.5 overflow-y-auto"
                style={{
                  maxHeight: '290px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--color-border-panel) transparent',
                }}
                onDragOver={dropOver}
                onDrop={(e) => dropHandler(e, col.id)}
              >
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary py-4">
                    <Icon name="inbox" size="sm" />
                    <span className="text-[10px]">Sem tarefas</span>
                  </div>
                ) : (
                  colTasks.map(task => renderCard(task))
                )}
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={onAddTask}
              className="flex items-center justify-center gap-1 py-1 rounded-sm text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors shrink-0"
            >
              <Icon name="add" size="xs" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Adicionar</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
