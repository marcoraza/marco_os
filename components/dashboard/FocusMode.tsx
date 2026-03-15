import React from 'react';
import type { Task } from '../../lib/appTypes';
import { Icon, Badge, Card } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';
import { getPriorityPill } from './utils';

interface FocusModeProps {
  focusTask: Task;
  columns: KanbanColumn[];
  totalXP: number;
  contextTasksRemaining: number;
  onClose: () => void;
  onTaskStatusChange: (taskId: number, status: Task['status']) => void;
  onTaskClick: (id: number) => void;
}

export default function FocusMode({
  focusTask,
  columns,
  totalXP,
  contextTasksRemaining,
  onClose,
  onTaskStatusChange,
  onTaskClick,
}: FocusModeProps) {
  return (
    <div className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-brand-mint/10 border border-brand-mint/30 flex items-center justify-center">
              <Icon name="center_focus_strong" size="md" className="text-brand-mint" />
            </div>
            <div>
              <h2 className="text-sm font-black text-brand-mint uppercase tracking-widest">Focus Mode</h2>
              <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">UMA TAREFA. SEM DISTRAÇÕES.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors text-[9px] font-bold uppercase tracking-widest"
          >
            <Icon name="close" size="xs" />
            Sair
          </button>
        </div>

        <Card className="p-6 border-brand-mint/20 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-black text-text-primary leading-snug">{focusTask.title}</h3>
            {getPriorityPill(focusTask.priority)}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="neutral" size="sm">{focusTask.tag}</Badge>
            <span className={cn(
              'text-[10px] font-bold',
              focusTask.deadline === 'Hoje' ? 'text-accent-red' : 'text-text-secondary'
            )}>
              {focusTask.deadline}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            {columns.map((col, i) => {
              const currentIdx = columns.findIndex(c => c.id === focusTask.status);
              const isActive = i <= currentIdx;
              const isCurrent = col.id === focusTask.status;
              return (
                <React.Fragment key={col.id}>
                  <button
                    onClick={() => onTaskStatusChange(focusTask.id, col.id)}
                    className={cn(
                      'size-8 rounded-sm border flex items-center justify-center transition-all shrink-0',
                      isCurrent
                        ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint scale-110'
                        : isActive
                          ? 'bg-surface border-border-panel text-text-primary hover:border-brand-mint/20'
                          : 'bg-bg-base border-border-panel/50 text-text-secondary/30 hover:text-text-secondary hover:border-border-panel'
                    )}
                    title={col.title}
                  >
                    <Icon name={col.icon} size="xs" />
                  </button>
                  {i < columns.length - 1 && (
                    <div className={cn('flex-1 h-[2px] rounded-full', i < currentIdx ? 'bg-brand-mint/40' : 'bg-border-panel')} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            {focusTask.status !== 'done' ? (
              <button
                onClick={() => onTaskStatusChange(focusTask.id, 'done')}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-mint text-black rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                <Icon name="check_circle" size="xs" />
                Concluir Tarefa
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[10px] font-black uppercase tracking-widest">
                <Icon name="check_circle" size="xs" />
                CONCLUÍDA!
              </div>
            )}
            <button
              onClick={() => onTaskClick(focusTask.id)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 border border-border-panel text-text-secondary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:text-text-primary hover:border-text-secondary/30 transition-colors"
            >
              <Icon name="open_in_new" size="xs" />
              Detalhes
            </button>
          </div>
        </Card>

        <div className="flex items-center justify-center gap-6 text-text-secondary/60">
          <div className="flex items-center gap-1.5">
            <Icon name="local_fire_department" size="xs" className="text-brand-flame" />
            <span className="text-[9px] font-black">12 dias streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="stars" size="xs" className="text-accent-purple" />
            <span className="text-[9px] font-black">{totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="layers" size="xs" />
            <span className="text-[9px] font-black">{contextTasksRemaining} restantes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
