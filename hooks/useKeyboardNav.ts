// Mission Control V2 — Keyboard Navigation Hook

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardNavOptions {
  onSelectAll?: () => void;
  onKillSelected?: () => void;
  onDeselectAll?: () => void;
  onFocusSearch?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onToggleExpand?: () => void;
  onToggleSelect?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav(options: KeyboardNavOptions) {
  const {
    onSelectAll,
    onKillSelected,
    onDeselectAll,
    onFocusSearch,
    onNavigateUp,
    onNavigateDown,
    onNavigateLeft,
    onNavigateRight,
    onToggleExpand,
    onToggleSelect,
    enabled = true
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if user is typing in input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      // Allow Escape to blur
      if (event.key === 'Escape') {
        target.blur();
        return;
      }
      return;
    }

    const isMeta = event.metaKey || event.ctrlKey;

    // Cmd/Ctrl + A → Select all
    if (isMeta && event.key === 'a') {
      event.preventDefault();
      onSelectAll?.();
      return;
    }

    // Cmd/Ctrl + K → Kill selected
    if (isMeta && event.key === 'k') {
      event.preventDefault();
      onKillSelected?.();
      return;
    }

    // / → Focus search
    if (event.key === '/') {
      event.preventDefault();
      onFocusSearch?.();
      return;
    }

    // Escape → Deselect all
    if (event.key === 'Escape') {
      event.preventDefault();
      onDeselectAll?.();
      return;
    }

    // Arrow keys → Navigate
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onNavigateUp?.();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onNavigateDown?.();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onNavigateLeft?.();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNavigateRight?.();
      return;
    }

    // Enter → Toggle expand/collapse
    if (event.key === 'Enter') {
      event.preventDefault();
      onToggleExpand?.();
      return;
    }

    // Space → Toggle select
    if (event.key === ' ') {
      event.preventDefault();
      onToggleSelect?.();
      return;
    }
  }, [
    enabled,
    onSelectAll,
    onKillSelected,
    onDeselectAll,
    onFocusSearch,
    onNavigateUp,
    onNavigateDown,
    onNavigateLeft,
    onNavigateRight,
    onToggleExpand,
    onToggleSelect
  ]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
