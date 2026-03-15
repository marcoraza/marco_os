import { useState, useEffect, useRef, useCallback } from 'react';

type FlowStateType = 'idle' | 'focus' | 'break' | 'paused';

interface FlowState {
  state: FlowStateType;
  timeRemaining: number;
  sessionCount: number;
  currentTask: string | undefined;
  totalFocusMinutes: number;
  start: (minutes?: number, task?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipBreak: () => void;
}

const DEFAULT_FOCUS_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;
const SESSIONS_BEFORE_LONG_BREAK = 4;

export function useFlowState(): FlowState {
  const [state, setState] = useState<FlowStateType>('idle');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [currentTask, setCurrentTask] = useState<string | undefined>(undefined);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  // Track focus duration for totalFocusMinutes
  const focusStartRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Store pending break duration for auto-start
  const pendingBreakRef = useRef<number>(SHORT_BREAK_MINUTES * 60);

  const clearCountdown = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startBreak = useCallback((breakSeconds: number) => {
    clearCountdown();
    pendingBreakRef.current = breakSeconds;
    setState('break');
    setTimeRemaining(breakSeconds);
  }, []);

  const startFocusSession = useCallback((seconds: number, task?: string) => {
    clearCountdown();
    setState('focus');
    setTimeRemaining(seconds);
    if (task !== undefined) setCurrentTask(task);
    focusStartRef.current = Date.now();
  }, []);

  // Countdown effect
  useEffect(() => {
    if (state !== 'focus' && state !== 'break') {
      clearCountdown();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          if (state === 'focus') {
            // Accumulate focus time
            if (focusStartRef.current !== null) {
              const elapsed = Math.floor((Date.now() - focusStartRef.current) / 60000);
              setTotalFocusMinutes(t => t + elapsed);
              focusStartRef.current = null;
            }

            setSessionCount(prev => {
              const newCount = prev + 1;
              const isLong = newCount % SESSIONS_BEFORE_LONG_BREAK === 0;
              const breakSecs = (isLong ? LONG_BREAK_MINUTES : SHORT_BREAK_MINUTES) * 60;
              startBreak(breakSecs);
              return newCount;
            });
          } else if (state === 'break') {
            // Break over → auto-start next focus
            startFocusSession(DEFAULT_FOCUS_MINUTES * 60);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const start = useCallback((minutes: number = DEFAULT_FOCUS_MINUTES, task?: string) => {
    startFocusSession(minutes * 60, task);
  }, [startFocusSession]);

  const pause = useCallback(() => {
    if (state !== 'focus') return;
    clearCountdown();
    if (focusStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - focusStartRef.current) / 60000);
      setTotalFocusMinutes(t => t + elapsed);
      focusStartRef.current = null;
    }
    setState('paused');
  }, [state]);

  const resume = useCallback(() => {
    if (state !== 'paused') return;
    focusStartRef.current = Date.now();
    setState('focus');
  }, [state]);

  const stop = useCallback(() => {
    clearCountdown();
    if (state === 'focus' && focusStartRef.current !== null) {
      const elapsed = Math.floor((Date.now() - focusStartRef.current) / 60000);
      setTotalFocusMinutes(t => t + elapsed);
      focusStartRef.current = null;
    }
    setState('idle');
    setTimeRemaining(0);
    setCurrentTask(undefined);
  }, [state]);

  const skipBreak = useCallback(() => {
    if (state !== 'break') return;
    clearCountdown();
    startFocusSession(DEFAULT_FOCUS_MINUTES * 60);
  }, [state, startFocusSession]);

  return {
    state,
    timeRemaining,
    sessionCount,
    currentTask,
    totalFocusMinutes,
    start,
    pause,
    resume,
    stop,
    skipBreak,
  };
}
