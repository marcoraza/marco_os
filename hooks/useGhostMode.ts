import { useState, useCallback } from 'react';

interface GhostModeState {
  isActive: boolean;
  taskTitle: string | undefined;
  enter: (taskTitle?: string) => void;
  exit: () => void;
  toggle: (taskTitle?: string) => void;
}

export function useGhostMode(): GhostModeState {
  const [isActive, setIsActive] = useState(false);
  const [taskTitle, setTaskTitle] = useState<string | undefined>(undefined);

  const enter = useCallback((title?: string) => {
    setTaskTitle(title);
    setIsActive(true);
    document.body.classList.add('ghost-mode-active');
  }, []);

  const exit = useCallback(() => {
    setIsActive(false);
    setTaskTitle(undefined);
    document.body.classList.remove('ghost-mode-active');
  }, []);

  const toggle = useCallback((title?: string) => {
    setIsActive(prev => {
      if (prev) {
        setTaskTitle(undefined);
        document.body.classList.remove('ghost-mode-active');
        return false;
      } else {
        setTaskTitle(title);
        document.body.classList.add('ghost-mode-active');
        return true;
      }
    });
  }, []);

  return { isActive, taskTitle, enter, exit, toggle };
}
