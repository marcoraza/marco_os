import React, { useState } from 'react';
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
}

/** Per-card delete confirmation state */
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
}: KanbanBoardProps) {
  const [deleteStates, setDeleteStates] = useState<Record<number, DeleteState>>({});

  const setDeleteState = (id: number, state: DeleteState) => {
    setDeleteStates(prev => ({ ...prev, [id]: state }));
  };

  const handleDeleteClick = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    setDeleteState(taskId, 'confirming');
  };

  const handleDeleteConfirm = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    if (onDeleteTask) {
      onDeleteTask(taskId);
      showToast('Tarefa arquivada');
    }
    setDeleteState(taskId, 'idle');
  };

  const handleDeleteCancel = (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation();
    setDeleteState(taskId, 'idle');
  };

  const handleStatusDropdown = (e: React.ChangeEvent<HTMLSelectElement>, taskId: number) => {
    const newStatus = e.target.value as Task['status'];
    if (onStatusChange) onStatusChange(taskId, newStatus);
  };

  return (
    <div className="flex-grow p-4 flex gap-3 h-full overflow-hidden">
      {columns.map((col) => {
        const colTasks = displayTasks.filter(t => t.status === col.id);
        const isCollapsed = collapsedCols.has(col.id);

        if (isCollapsed) {
          return (
            <div
              key={col.id}
              className="w-12 shrink-0 bg-bg-base rounded-lg border border-border-panel hidden md:flex flex-col items-center py-3 gap-3 cursor-pointer hover:border-text-secondary/30 transition-all"
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
                {colTasks.slice(0, 6).map((task) => (
                  <div
                    key={task.id}
                    className={cn('h-[3px] rounded-full w-full', prioPillColor[task.priority] || 'bg-text-secondary/30')}
                    title={task.title}
                  />
                ))}
                {colTasks.length > 6 && (
                  <span className="text-[7px] text-text-secondary text-center">+{colTasks.length - 6}</span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={col.id}
            className={cn(
              'flex-1 flex flex-col gap-2 min-w-0 transition-all duration-200',
              activeColumn !== col.id && 'hidden md:flex'
            )}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, col.id)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <button
                onClick={() => onToggleCollapse(col.id)}
                className="p-0.5 rounded hover:bg-surface transition-colors text-text-secondary hover:text-text-primary hidden md:block"
              >
                <Icon name="expand_more" size="xs" />
              </button>
              <Icon name={col.icon} size="xs" className="text-text-secondary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                {col.title}
              </span>
              <Badge variant={col.variant} size="xs">{colTasks.length}</Badge>
            </div>

            {/* Task list — max 2 visible, scroll for more */}
            <div className="flex flex-col bg-bg-base rounded-lg border border-border-panel p-2 gap-2 overflow-hidden">
              <div
                className="flex flex-col gap-2 overflow-y-auto"
                style={{
                  maxHeight: '320px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--color-border-panel) transparent',
                }}
              >
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary py-6">
                    <Icon name="inbox" size="md" />
                    <span className="text-[10px]">Sem tarefas</span>
                  </div>
                ) : (
                  colTasks.map(task => {
                    const delState = deleteStates[task.id] ?? 'idle';
                    return (
                      <Card
                        key={task.id}
                        className="p-2 space-y-0.5 cursor-grab active:cursor-grabbing relative group rounded-sm"
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        onClick={() => delState === 'idle' && onTaskClick(task.id)}
                      >
                        {/* Delete button — hover-only, top-right */}
                        {delState === 'idle' && (
                          <button
                            className="absolute top-1.5 right-1.5 text-text-secondary/0 group-hover:text-text-secondary/60 hover:!text-red-400 text-[11px] leading-none font-bold transition-colors w-4 h-4 flex items-center justify-center rounded-sm hover:bg-surface"
                            onClick={(e) => handleDeleteClick(e, task.id)}
                            title="Excluir"
                          >
                            ×
                          </button>
                        )}

                        {/* Inline delete confirm */}
                        {delState === 'confirming' && (
                          <div
                            className="absolute inset-0 flex items-center justify-center gap-2 bg-bg-base/95 rounded-sm z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] text-text-secondary font-mono">Excluir?</span>
                            <button
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded-sm border border-red-500/30 hover:border-red-400/50 transition-colors"
                              onClick={(e) => handleDeleteConfirm(e, task.id)}
                            >
                              Sim
                            </button>
                            <button
                              className="text-[10px] font-bold text-text-secondary hover:text-text-primary px-1.5 py-0.5 rounded-sm border border-border-panel transition-colors"
                              onClick={(e) => handleDeleteCancel(e, task.id)}
                            >
                              Não
                            </button>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-2 pr-4">
                          <span className="text-[12px] text-text-primary font-medium leading-snug">
                            {task.title}
                          </span>
                          {getPriorityPill(task.priority)}
                        </div>

                        <div className="space-y-0.5">
                          {task.tag && task.tag !== '[]' && task.tag !== '' && (
                            <p className="text-[11px] text-text-secondary leading-relaxed">{task.tag}</p>
                          )}
                          {task.deadline && task.deadline !== 'A definir' && (
                            <p className={cn('text-[11px] leading-relaxed', getDeadlineColor(task.deadline))}>
                              {task.deadline === 'Hoje' ? 'Prazo: Hoje — urgente'
                                : task.deadline === 'Amanhã' ? 'Prazo: Amanhã'
                                : task.deadline === 'Ontem' ? 'Concluído ontem'
                                : task.deadline.includes('atrás') ? `Finalizado ${task.deadline}`
                                : `Prazo: ${task.deadline}`}
                            </p>
                          )}
                        </div>

                        <p className="text-[11px] font-mono text-text-secondary/60 pt-0.5">
                          {getTaskTimestamp(task)}
                        </p>

                        {/* Mobile status dropdown */}
                        <div className="md:hidden mt-1" onClick={(e) => e.stopPropagation()}>
                          <select
                            className="w-full text-[10px] font-mono bg-surface border border-border-panel rounded-sm px-1.5 py-1 text-text-secondary focus:outline-none focus:border-text-secondary/50"
                            value={task.status}
                            onChange={(e) => handleStatusDropdown(e, task.id)}
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
              </div>

              {/* Add button — outside scroll area, always visible */}
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
  );
}
