import React from 'react';
import type { Task } from '../../lib/appTypes';
import { Icon, Badge, Card } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';
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
}

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
}: KanbanBoardProps) {
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

            <div className="flex flex-col gap-2 flex-grow bg-bg-base rounded-lg border border-border-panel p-2 overflow-y-auto scrollbar-thin">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                  <Icon name="inbox" size="md" />
                  <span className="text-[10px]">Sem tarefas</span>
                </div>
              ) : (
                colTasks.map(task => (
                  <Card
                    key={task.id}
                    className="p-4 space-y-2 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => onDragStart(e, task.id)}
                    onClick={() => onTaskClick(task.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] text-text-primary font-medium leading-snug">
                        {task.title}
                      </span>
                      {getPriorityPill(task.priority)}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[11px] text-text-secondary leading-relaxed">{task.tag}</p>
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
                  </Card>
                ))
              )}

              <button
                onClick={onAddTask}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors"
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
