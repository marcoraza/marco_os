import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'section_setup_done_';

export function useSectionSetup(viewId: string) {
  const key = `${STORAGE_PREFIX}${viewId}`;

  // Synchronous read from localStorage (avoids flash)
  const [isSetupDone, setIsSetupDone] = useState(
    () => localStorage.getItem(key) === '1'
  );

  const markDone = useCallback(() => {
    localStorage.setItem(key, '1');
    setIsSetupDone(true);
  }, [key]);

  const markSkipped = useCallback(() => {
    // Do NOT set localStorage — journey will reappear next visit
    setIsSetupDone(true); // Hide for current session only
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(key);
    setIsSetupDone(false);
  }, [key]);

  return { isSetupDone, markDone, markSkipped, reset };
}
