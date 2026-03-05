import React, { useState, useRef } from 'react';
import type { Task } from '../../lib/appTypes';
import { Icon, Badge, Card, showToast } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';
import { KANBAN_COLUMNS } from './types';
import { prioPillColor, getPriorityPill } from './utils';

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

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    didDrag.current = true;
    onDragStart(e, task.id);
  };
  const handleDragEnd = () => {
    setTimeout(() => { didDrag.current = false; }, 150);
  };

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

  // ── Relative day label (same as AgentKanban "Comentários" slot) ──
  const dayLabel = (task: Task): string => {
    const d = task.deadline;
    if (!d || d === 'A definir') return '';
    if (d === 'Hoje') return 'Hoje';
    if (d === 'Amanhã') return 'Amanhã';
    if (d === 'Ontem') return 'Ontem';
    if (d.includes('atrás')) return d;
    // Try to format as weekday
    const prazo = (task as any).prazo || (task as any).due_date;
    if (prazo) {
      try {
        const date = new Date(prazo);
        const now = new Date();
        const diffDays = Math.round((date.getTime() - now.getTime()) / 86400000);
        if (diffDays >= 2 && diffDays <= 6) {
          return date.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase());
        }
      } catch { /* fallback */ }
    }
    return d;
  };

  // ── Deadline color for the day label ──
  const dayColor = (task: Task): string => {
    if (task.status === 'done') return 'text-brand-mint';
    const d = task.deadline;
    if (d === 'Hoje' || d === 'Ontem' || d?.includes('atrás')) return 'text-accent-red';
    if (d === 'Amanhã') return 'text-accent-orange';
    return 'text-text-secondary';
  };

  // ── Date string (font-mono, like AgentKanban) ──
  const dateStr = (task: Task): string => {
    const prazo = (task as any).prazo || (task as any).due_date;
    if (!prazo) return '';
    try {
      const d = new Date(prazo);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return ''; }
  };

  // ── Collapsed column ──
  const renderCollapsed = (col: KanbanColumn, colTasks: Task[]) => (
    <div
      key={col.id}
      className="w-12 shrink-0 bg-bg-base rounded-lg border border-border-panel hidden md:flex flex-col items-center py-3 gap-3 cursor-pointer hover:border-text-secondary/30 transition-all"
      onClick={() => onToggleCollapse(col.id)}
      onDragOver={dropOver}
      onDrop={(e) => dropHandler(e, col.id)}
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
          <div key={t.id} className={cn('h-[3px] rounded-full w-full', prioPillColor[t.priority] || 'bg-text-secondary/30')} title={t.title} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn('p-4', className)}>
      <div className="flex gap-3 items-stretch">
        {columns.map(col => {
          const colTasks = displayTasks.filter(t => t.status === col.id);

          if (collapsedCols.has(col.id)) return renderCollapsed(col, colTasks);

          return (
            <div
              key={col.id}
              className={cn(
                'flex-1 flex flex-col gap-2 min-w-0 transition-all duration-200',
                activeColumn !== col.id && 'hidden md:flex'
              )}
            >
              {/* Column header — same as AgentKanban */}
              <div className="flex items-center gap-2 px-1">
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

              {/* Column body — matches AgentKanban style exactly */}
              <div
                className="flex flex-col gap-2 min-h-[120px] bg-bg-base rounded-lg border border-border-panel p-2"
                onDragOver={dropOver}
                onDrop={(e) => dropHandler(e, col.id)}
              >
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                    <Icon name="inbox" size="md" />
                    <span className="text-[10px]">Sem tarefas</span>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const ds = deleteStates[task.id] ?? 'idle';
                    const day = dayLabel(task);
                    const date = dateStr(task);

                    return (
                      <Card
                        key={task.id}
                        className="p-3 space-y-2 cursor-grab active:cursor-grabbing relative group"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          if (didDrag.current) return;
                          if (ds === 'idle') onTaskClick(task.id);
                        }}
                      >
                        {/* Delete × — hover only */}
                        {ds === 'idle' && (
                          <button
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-sm hover:bg-surface transition-all z-20"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => onXClick(e, task.id)}
                          >
                            ✕
                          </button>
                        )}

                        {/* Confirm overlay */}
                        {ds === 'confirming' && (
                          <div
                            className="absolute inset-0 flex items-center justify-center gap-3 bg-bg-base/95 rounded-sm z-30"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] text-text-secondary font-mono">Excluir?</span>
                            <button
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 px-2 py-0.5 rounded-sm border border-red-500/30"
                              onClick={(e) => onConfirm(e, task.id)}
                            >
                              Sim
                            </button>
                            <button
                              className="text-[10px] font-bold text-text-secondary hover:text-text-primary px-2 py-0.5 rounded-sm border border-border-panel"
                              onClick={(e) => onCancel(e, task.id)}
                            >
                              Não
                            </button>
                          </div>
                        )}

                        {/* Row 1: Title + Priority pill */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] text-text-primary font-medium leading-tight">
                            {task.title}
                          </span>
                          {getPriorityPill(task.priority)}
                        </div>

                        {/* Row 2: Date + Day label (replaces "Comentários") */}
                        <div className="flex items-center justify-between">
                          <div className="text-[8px] font-mono text-text-secondary">
                            {date}
                          </div>
                          {day && (
                            <span className={cn('text-[9px] font-medium', dayColor(task))}>
                              {day}
                            </span>
                          )}
                        </div>

                        {/* Mobile status dropdown */}
                        <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
                          <select
                            className="w-full text-[10px] font-mono bg-surface border border-border-panel rounded-sm px-1.5 py-1 text-text-secondary"
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
                  })
                )}

                {/* Add button */}
                <button
                  onClick={onAddTask}
                  className="flex items-center justify-center gap-1 py-1.5 rounded-sm text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors"
                >
                  <Icon name="add" size="xs" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Adicionar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
