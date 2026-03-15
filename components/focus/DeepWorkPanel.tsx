import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui';
import { cn } from '@/utils/cn';
import type { Task } from '../../lib/appTypes';
import type { useFlowState } from '../../hooks/useFlowState';

type FlowStateHook = ReturnType<typeof useFlowState>;

interface DeepWorkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  flowState: FlowStateHook;
  tasks?: Task[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PRIORITY_ORDER: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 };
const SESSIONS_TOTAL = 4;

export function DeepWorkPanel({ isOpen, onClose, flowState, tasks = [] }: DeepWorkPanelProps) {
  const { state, timeRemaining, sessionCount, totalFocusMinutes, currentTask, start, pause, resume, stop, skipBreak } = flowState;

  const topTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 5);

  const isIdle = state === 'idle';
  const isRunning = state === 'focus' || state === 'break';

  const displayTime = isIdle ? formatTime(25 * 60) : formatTime(timeRemaining);

  const sessionDisplay = sessionCount % SESSIONS_TOTAL === 0 && sessionCount > 0
    ? SESSIONS_TOTAL
    : sessionCount % SESSIONS_TOTAL;

  const handlePlayPause = () => {
    if (isIdle) {
      start(25);
    } else if (state === 'focus') {
      pause();
    } else if (state === 'paused') {
      resume();
    }
  };

  const handleTaskSelect = (task: Task) => {
    if (isIdle) {
      start(25, task.title);
    } else {
      start(25, task.title);
    }
  };

  const priorityColor = (p: Task['priority']) => {
    if (p === 'high') return 'text-accent-red border-accent-red/30';
    if (p === 'medium') return 'text-accent-orange border-accent-orange/30';
    return 'text-text-secondary border-border-panel';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed right-0 top-0 h-full w-full sm:w-[320px] z-40 bg-surface border-l border-border-panel flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-panel shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Deep Work
            </span>
            <button
              onClick={onClose}
              className={cn(
                'flex items-center justify-center w-8 h-8 min-h-[44px] rounded-sm border border-border-panel',
                'text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-all',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              )}
              aria-label="Fechar"
            >
              <Icon name="close" size="xs" />
            </button>
          </div>

          {/* Timer display */}
          <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-4 shrink-0">
            <div className={cn(
              'text-[40px] font-mono font-black leading-none tabular-nums',
              state === 'break' ? 'text-accent-blue' : 'text-text-primary',
            )}>
              {displayTime}
            </div>

            {/* State label */}
            <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
              {state === 'focus' && currentTask ? currentTask : (
                state === 'focus' ? 'Foco ativo' :
                state === 'break' ? 'Pausa' :
                state === 'paused' ? 'Pausado' :
                'Pronto para começar'
              )}
            </span>
          </div>

          {/* Timer controls */}
          <div className="flex items-center justify-center gap-2 px-4 pb-4 shrink-0">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={state === 'break'}
              className={cn(
                'flex items-center justify-center min-h-[44px] w-10 h-10 rounded-sm border transition-all',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                state === 'break'
                  ? 'border-border-panel text-text-secondary/30 cursor-not-allowed'
                  : 'border-brand-mint/30 bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20',
              )}
              aria-label={isRunning ? 'Pausar' : 'Iniciar'}
            >
              <Icon name={isRunning ? 'pause' : 'play_arrow'} size="sm" />
            </button>

            {/* Stop */}
            <button
              onClick={stop}
              disabled={isIdle}
              className={cn(
                'flex items-center justify-center min-h-[44px] w-10 h-10 rounded-sm border transition-all',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                isIdle
                  ? 'border-border-panel text-text-secondary/30 cursor-not-allowed'
                  : 'border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/40',
              )}
              aria-label="Parar"
            >
              <Icon name="stop" size="sm" />
            </button>

            {/* Skip break */}
            <button
              onClick={skipBreak}
              disabled={state !== 'break'}
              className={cn(
                'flex items-center justify-center min-h-[44px] w-10 h-10 rounded-sm border transition-all',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                state !== 'break'
                  ? 'border-border-panel text-text-secondary/30 cursor-not-allowed'
                  : 'border-accent-blue/30 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20',
              )}
              aria-label="Pular pausa"
            >
              <Icon name="skip_next" size="sm" />
            </button>
          </div>

          {/* Session info */}
          <div className="px-4 pb-4 text-center shrink-0">
            <span className="text-[8px] font-mono text-text-secondary">
              Sessão {sessionDisplay}/{SESSIONS_TOTAL} · {totalFocusMinutes}min focado
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border-panel mx-4 shrink-0" />

          {/* Task list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
            <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">
              Tarefas prioritárias
            </span>
            {topTasks.length === 0 && (
              <p className="text-text-secondary text-xs text-center py-4">Sem tarefas pendentes</p>
            )}
            {topTasks.map(task => (
              <button
                key={task.id}
                onClick={() => handleTaskSelect(task)}
                className={cn(
                  'flex items-center gap-2 w-full text-left px-2 py-2 rounded-sm border border-border-panel min-h-[44px]',
                  'bg-bg-base hover:bg-surface-hover transition-all',
                  'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                  currentTask === task.title && 'border-brand-mint/30 bg-brand-mint/5',
                )}
              >
                <Icon
                  name={currentTask === task.title ? 'check_circle' : 'radio_button_unchecked'}
                  size="xs"
                  className={currentTask === task.title ? 'text-brand-mint shrink-0' : 'text-text-secondary shrink-0'}
                />
                <span className="text-xs text-text-primary flex-1 truncate">{task.title}</span>
                <span className={cn(
                  'text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm shrink-0',
                  priorityColor(task.priority),
                )}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-3 border-t border-border-panel shrink-0 text-center">
            <span className="text-[8px] font-mono text-text-secondary">⌘⇧D para fechar</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
