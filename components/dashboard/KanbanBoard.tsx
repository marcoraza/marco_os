import React from 'react';
import type { Task } from '../../lib/appTypes';
import { Icon, Badge, Card } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';
import { prioPillColor, getDeadlineColor, getPriorityPill } from './utils';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  displayTasks: Task[];
  collapsedCols: Set<Task['status']>;
  activeColumn: Task['status'];
  onToggleCollapse: (id: Task['status']) => void;
  onTaskClick: (id: number) => void;
  onAddTask: () => void;
  onMoveTask: (taskId: number, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: number) => void;
}

// Column order for directional drag
const COLUMN_ORDER: Task['status'][] = ['assigned', 'started', 'in-progress', 'standby', 'done'];

export default function KanbanBoard({
  columns,
  displayTasks,
  collapsedCols,
  activeColumn,
  onToggleCollapse,
  onTaskClick,
  onAddTask,
  onMoveTask,
  onDeleteTask,
}: KanbanBoardProps) {
  // Track drag start position for directional movement
  const dragRef = React.useRef<{ taskId: number; startX: number; moved: boolean } | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    dragRef.current = { taskId, startX: e.clientX, moved: false };
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Drop on a column: use that column directly
  const handleDrop = (e: React.DragEvent, dropColStatus: Task['status']) => {
    e.preventDefault();
    const drag = dragRef.current;
    if (!drag) return;

    const task = displayTasks.find(t => t.id === drag.taskId);
    if (!task) { dragRef.current = null; return; }

    // Mark as handled so dragEnd doesn't double-fire
    drag.moved = true;
    dragRef.current = null;

    if (dropColStatus !== task.status) {
      onMoveTask(drag.taskId, dropColStatus);
    }
  };

  // dragEnd ALWAYS fires — fallback for directional drag (when not dropped on a column)
  const handleDragEnd = (e: React.DragEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.moved) return; // Already handled by handleDrop

    const task = displayTasks.find(t => t.id === drag.taskId);
    if (!task) return;

    const dx = e.clientX - drag.startX;
    const currentIdx = COLUMN_ORDER.indexOf(task.status);

    // Directional: drag right → next column, drag left → previous (threshold: 50px)
    if (Math.abs(dx) > 50) {
      const targetStatus = dx > 0
        ? COLUMN_ORDER[Math.min(currentIdx + 1, COLUMN_ORDER.length - 1)]
        : COLUMN_ORDER[Math.max(currentIdx - 1, 0)];
      if (targetStatus !== task.status) {
        onMoveTask(drag.taskId, targetStatus);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent, taskId: number) => {
    // Shift+click = delete task
    if (e.shiftKey && onDeleteTask) {
      e.stopPropagation();
      onDeleteTask(taskId);
      return;
    }
    onTaskClick(taskId);
  };

  return (
    <div className="p-4 flex gap-3">
      {columns.map((col) => {
        // Stable sort: within each column, sort by id to prevent jumping
        const colTasks = displayTasks
          .filter(t => t.status === col.id)
          .sort((a, b) => a.id - b.id);
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
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
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

            {/* Scrollable column — max 4 cards visible */}
            <div className="flex flex-col gap-2 bg-bg-base rounded-lg border border-border-panel p-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-panel scrollbar-track-transparent">
              {colTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                  <Icon name="inbox" size="md" />
                  <span className="text-[10px]">Sem tarefas</span>
                </div>
              ) : (
                colTasks.map(task => (
                  <Card
                    key={task.id}
                    className="h-[88px] p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing shrink-0"
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                    onDragEnd={(e) => handleDragEnd(e as unknown as React.DragEvent)}
                    onClick={(e) => handleCardClick(e as unknown as React.MouseEvent, task.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[12px] text-text-primary font-medium leading-snug line-clamp-2">
                        {task.title}
                      </span>
                      {getPriorityPill(task.priority)}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wide truncate">
                        {task.tag}
                      </span>
                      {task.deadline && (
                        <span className={cn('text-[10px] shrink-0 ml-2', getDeadlineColor(task.deadline))}>
                          {task.deadline}
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}

              <button
                onClick={onAddTask}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors shrink-0"
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
