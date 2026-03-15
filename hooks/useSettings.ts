import { useState, useCallback } from 'react';
import { Storage } from '../lib/storage';

const SETTINGS_KEY = 'marco-os-settings';

export interface AppSettings {
  profile: {
    displayName: string;
    email: string;
  };
  appearance: {
    reducedMotion: boolean;
    accentColor: 'mint' | 'blue' | 'red' | 'orange' | 'purple';
  };
  notifications: {
    push: boolean;
    emailDigest: boolean;
    whatsapp: boolean;
  };
}

const defaultSettings: AppSettings = {
  profile: {
    displayName: 'Marco Anderson',
    email: 'marco@marco-os.com',
  },
  appearance: {
    reducedMotion: false,
    accentColor: 'mint',
  },
  notifications: {
    push: true,
    emailDigest: false,
    whatsapp: true,
  },
};

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    Storage.get<AppSettings>(SETTINGS_KEY, defaultSettings)
  );

  const update = useCallback(<K extends keyof AppSettings>(
    section: K,
    patch: Partial<AppSettings[K]>
  ) => {
    setSettingsState(prev => {
      const next = {
        ...prev,
        [section]: { ...prev[section], ...patch },
      };
      Storage.set(SETTINGS_KEY, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    Storage.remove(SETTINGS_KEY);
    localStorage.removeItem('marco-os-theme');
    setSettingsState(defaultSettings);
  }, []);

  const exportAll = useCallback(() => {
    const dump: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('marco-os')) {
        try { dump[key] = JSON.parse(localStorage.getItem(key)!); }
        catch { dump[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marco-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importBackup = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        const restored = Storage.get<AppSettings>(SETTINGS_KEY, defaultSettings);
        setSettingsState(restored);
      } catch (err) {
        console.error('Failed to import backup:', err);
      }
    };
    reader.readAsText(file);
  }, []);

  return { settings, update, resetAll, exportAll, importBackup };
}
