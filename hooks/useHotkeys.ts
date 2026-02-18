import { useEffect, useRef } from 'react';

type HotkeyHandler = (e: KeyboardEvent) => void;

interface HotkeyDef {
  key: string;
  mod?: boolean;        // Cmd/Ctrl required
  shift?: boolean;
  handler: HotkeyHandler;
  description: string;
}

export const SHORTCUTS: { key: string; mod?: boolean; shift?: boolean; label: string; description: string }[] = [
  { key: 'k', mod: true, label: '⌘K', description: 'Command Palette' },
  { key: 'n', label: 'N', description: 'Nova Tarefa' },
  { key: '?', shift: true, label: '?', description: 'Atalhos' },
  { key: 'd', label: 'G → D', description: 'Ir para Dashboard' },
  { key: 'f', label: 'G → F', description: 'Ir para Finanças' },
  { key: 'h', label: 'G → H', description: 'Ir para Saúde' },
  { key: 'p', label: 'G → P', description: 'Ir para Planejador' },
  { key: 's', label: 'G → S', description: 'Ir para Configurações' },
  { key: 'Escape', label: 'Esc', description: 'Fechar modal/painel' },
];

export function useHotkeys(hotkeys: HotkeyDef[]) {
  const hotkeyRef = useRef(hotkeys);
  hotkeyRef.current = hotkeys;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;

      for (const hk of hotkeyRef.current) {
        if (hk.mod && !(e.metaKey || e.ctrlKey)) continue;
        if (hk.shift && !e.shiftKey) continue;
        if (!hk.mod && (e.metaKey || e.ctrlKey)) continue;
        if (e.key.toLowerCase() !== hk.key.toLowerCase()) continue;
        // Allow mod shortcuts in inputs, block plain key shortcuts
        if (isInput && !hk.mod) continue;

        e.preventDefault();
        hk.handler(e);
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

export function useGoKeys(navigate: (view: string) => void) {
  const gBufferRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable;
      if (isInput || e.metaKey || e.ctrlKey) return;

      const key = e.key.toLowerCase();

      if (key === 'g' && !gBufferRef.current) {
        gBufferRef.current = true;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => { gBufferRef.current = false; }, 500);
        return;
      }

      if (gBufferRef.current) {
        gBufferRef.current = false;
        clearTimeout(timerRef.current);
        const map: Record<string, string> = {
          d: 'dashboard', f: 'finance', h: 'health',
          p: 'planner', s: 'settings', l: 'learning',
          c: 'crm', n: 'notes',
        };
        if (map[key]) {
          e.preventDefault();
          navigate(map[key]);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
