/**
 * LocalStorage wrapper with type safety and error handling
 */

export class Storage {
  /**
   * Get item from localStorage with type safety
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in localStorage
   */
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in localStorage
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * Storage keys used throughout the app
 */
export const STORAGE_KEYS = {
  TASKS: 'marco-os:tasks',
  PROJECTS: 'marco-os:projects',
  ACTIVE_PROJECT: 'marco-os:active-project',
  THEME: 'marco-os:theme',
  USER_PREFERENCES: 'marco-os:user-preferences',
  AGENT_CONFIGS: 'marco-os:agent-configs',
  AGENT_MEMORY: 'marco-os:agent-memory',
  CRON_JOBS: 'marco-os:cron-jobs',
  EXECUTIONS: 'marco-os:executions',
} as const;
