import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'section_setup_done_';

/**
 * Per-tab journey setup state.
 * Key format: section_setup_done_{viewId}_{tabId}
 * For sections without tabs, use useSectionSetup instead.
 */
export function useTabSetup(viewId: string, tabId: string) {
  const key = `${STORAGE_PREFIX}${viewId}_${tabId}`;

  const [isSetupDone, setIsSetupDone] = useState(
    () => localStorage.getItem(key) === '1'
  );

  const markDone = useCallback(() => {
    localStorage.setItem(key, '1');
    setIsSetupDone(true);
  }, [key]);

  const markSkipped = useCallback(() => {
    // Do NOT persist — journey reappears next visit
    setIsSetupDone(true);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(key);
    setIsSetupDone(false);
  }, [key]);

  return { isSetupDone, markDone, markSkipped, reset };
}
