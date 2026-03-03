import React from 'react';
import { FullscreenOverlay } from '../ui/FullscreenOverlay';
import { Icon } from '../ui';
import { cn } from '@/utils/cn';
import type { useFlowState } from '../../hooks/useFlowState';

type FlowStateHook = ReturnType<typeof useFlowState>;

interface GhostModeProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  flowState: FlowStateHook;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const SESSIONS_TOTAL = 4;

export function GhostMode({ isOpen, onClose, taskTitle, flowState }: GhostModeProps) {
  const { state, timeRemaining, sessionCount, start, pause, resume, stop } = flowState;

  const handlePlayPause = () => {
    if (state === 'idle') {
      start(25, taskTitle);
    } else if (state === 'focus') {
      pause();
    } else if (state === 'paused') {
      resume();
    } else if (state === 'break') {
      // do nothing during break countdown
    }
  };

  const handleStop = () => {
    stop();
  };

  const isRunning = state === 'focus' || state === 'break';
  const isPaused = state === 'paused';
  const isIdle = state === 'idle';

  const displayTime = isIdle
    ? formatTime(25 * 60)
    : formatTime(timeRemaining);

  const sessionDots = Array.from({ length: SESSIONS_TOTAL }, (_, i) => i < (sessionCount % SESSIONS_TOTAL));
  const sessionDisplay = sessionCount % SESSIONS_TOTAL === 0 && sessionCount > 0
    ? SESSIONS_TOTAL
    : sessionCount % SESSIONS_TOTAL;

  return (
    <FullscreenOverlay isOpen={isOpen} onClose={onClose} className="bg-bg-base flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8 px-8 w-full max-w-lg">
        {/* Task title */}
        {taskTitle && (
          <h1 className="text-[24px] font-black font-mono text-text-primary text-center leading-tight">
            {taskTitle}
          </h1>
        )}
        {!taskTitle && (
          <h1 className="text-[24px] font-black font-mono text-text-secondary text-center leading-tight uppercase tracking-widest">
            Ghost Mode
          </h1>
        )}

        {/* Timer */}
        <div className={cn(
          'text-[64px] font-mono font-black leading-none tabular-nums transition-colors',
          state === 'break' ? 'text-accent-blue' : 'text-text-primary',
        )}>
          {displayTime}
        </div>

        {/* State label */}
        <div className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">
          {state === 'focus' && 'Foco ativo'}
          {state === 'break' && 'Pausa'}
          {state === 'paused' && 'Pausado'}
          {state === 'idle' && 'Pronto para começar'}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play / Pause */}
          <button
            onClick={handlePlayPause}
            disabled={state === 'break'}
            className={cn(
              'flex items-center justify-center w-14 h-14 min-h-[44px] rounded-sm border transition-all',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              state === 'break'
                ? 'border-border-panel text-text-secondary/30 cursor-not-allowed'
                : 'border-brand-mint/30 bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20',
            )}
            aria-label={isRunning ? 'Pausar' : 'Iniciar'}
          >
            <Icon name={isRunning ? 'pause' : 'play_arrow'} size="md" />
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            disabled={isIdle}
            className={cn(
              'flex items-center justify-center w-11 h-11 min-h-[44px] rounded-sm border transition-all',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              isIdle
                ? 'border-border-panel text-text-secondary/30 cursor-not-allowed'
                : 'border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/40',
            )}
            aria-label="Parar"
          >
            <Icon name="stop" size="sm" />
          </button>
        </div>

        {/* Session counter */}
        {sessionCount > 0 && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary">
              Sessão {sessionDisplay}/{SESSIONS_TOTAL}
            </span>
            <div className="flex items-center gap-1.5">
              {sessionDots.map((filled, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-sm transition-all',
                    filled ? 'bg-brand-mint' : 'bg-border-panel',
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ESC hint */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <span className="text-[8px] text-text-secondary font-mono">ESC para sair</span>
      </div>
    </FullscreenOverlay>
  );
}
