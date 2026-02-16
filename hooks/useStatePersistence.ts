// Mission Control V2 — State Persistence Hook

import { useState, useEffect, useCallback } from 'react';

export interface PersistedState<T> {
  value: T;
  setValue: (newValue: T | ((prev: T) => T)) => void;
  reset: () => void;
}

export function useStatePersistence<T>(
  key: string,
  defaultValue: T
): PersistedState<T> {
  // Initialize from localStorage or default
  const [value, setValueInternal] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.warn(`Failed to load persisted state for key "${key}":`, error);
    }
    return defaultValue;
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to persist state for key "${key}":`, error);
    }
  }, [key, value]);

  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValueInternal(prev => {
      const nextValue = typeof newValue === 'function'
        ? (newValue as (prev: T) => T)(prev)
        : newValue;
      return nextValue;
    });
  }, []);

  const reset = useCallback(() => {
    setValueInternal(defaultValue);
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove persisted state for key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return { value, setValue, reset };
}

// Specialized hook for collapsed cards
export function useCollapsedCards() {
  return useStatePersistence<Set<string>>('mission-control-collapsed-cards', new Set());
}

// Specialized hook for card order
export function useCardOrder() {
  return useStatePersistence<string[]>('mission-control-card-order', []);
}

// Specialized hook for selected agents
export function useSelectedAgents() {
  return useStatePersistence<Set<string>>('mission-control-selected-agents', new Set());
}

// Specialized hook for filter state
export function useFilterState() {
  return useStatePersistence<{
    status: string[];
    models: string[];
    owners: string[];
    searchQuery: string;
  }>('mission-control-filter-state', {
    status: [],
    models: [],
    owners: [],
    searchQuery: ''
  });
}
