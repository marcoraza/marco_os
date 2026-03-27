/**
 * Visibility-aware polling hook with backoff.
 *
 * Stable implementation: uses refs for all mutable state to avoid
 * re-render cascades. The useEffect runs once on mount and cleans up
 * on unmount. Changes to `enabled` are tracked via ref.
 */
import { useEffect, useRef, useCallback } from 'react';

interface MCPollOptions {
  backoff?: boolean;
  maxBackoffMultiplier?: number;
  enabled?: boolean;
}

export function useMCPoll(
  callback: () => void | Promise<void>,
  intervalMs: number,
  options: MCPollOptions = {},
) {
  const {
    backoff = false,
    maxBackoffMultiplier = 3,
    enabled = true,
  } = options;

  const callbackRef = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const backoffRef = useRef(1);
  const visibleRef = useRef(true);
  const enabledRef = useRef(enabled);
  const mountedRef = useRef(false);

  // Keep refs current without triggering effects
  useEffect(() => { callbackRef.current = callback; }, [callback]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (!enabledRef.current || !visibleRef.current) return;
    const ms = backoff ? intervalMs * backoffRef.current : intervalMs;
    intervalRef.current = setInterval(() => {
      if (enabledRef.current && visibleRef.current) {
        const result = callbackRef.current();
        if (result instanceof Promise) {
          result.then(() => { backoffRef.current = 1; }).catch(() => {
            if (backoff) backoffRef.current = Math.min(backoffRef.current + 0.5, maxBackoffMultiplier);
          });
        }
      }
    }, ms);
  }, [intervalMs, backoff, maxBackoffMultiplier, clearTimer]);

  // Manual trigger
  const fire = useCallback(() => {
    if (!enabledRef.current || !visibleRef.current) return;
    callbackRef.current();
  }, []);

  // Single mount effect
  useEffect(() => {
    // Initial fetch
    if (enabledRef.current && !mountedRef.current) {
      mountedRef.current = true;
      callbackRef.current();
    }

    startTimer();

    const onVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current) {
        backoffRef.current = 1;
        if (enabledRef.current) callbackRef.current();
        startTimer();
      } else {
        clearTimer();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally stable

  return fire;
}
