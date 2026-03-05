// hooks/useQuickActions.ts
// Centralized hook for dashboard quick actions with real endpoints.
import { useState, useCallback } from 'react';
import { showToast } from '../components/ui';
import { useSupabaseData } from '../contexts/SupabaseDataContext';

const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

type ActionId = 'briefingDiario' | 'syncMemoria' | 'novaTarefa' | 'novaCaptura' | string;

interface UseQuickActionsOptions {
  onNavigate?: (view: string) => void;
  onOpenNovaTarefa?: () => void;
  onOpenCaptura?: () => void;
}

export interface UseQuickActionsReturn {
  execute: (actionId: ActionId) => Promise<void>;
  isExecuting: Record<string, boolean>;
  lastResult: string | null;
}

export function useQuickActions(options: UseQuickActionsOptions = {}): UseQuickActionsReturn {
  const { onNavigate, onOpenNovaTarefa, onOpenCaptura } = options;
  const [isExecuting, setIsExecuting] = useState<Record<string, boolean>>({});
  const [lastResult, setLastResult] = useState<string | null>(null);
  const supabaseCtx = useSupabaseData();

  const setLoading = (id: string, val: boolean) =>
    setIsExecuting(prev => ({ ...prev, [id]: val }));

  const execute = useCallback(async (actionId: ActionId) => {
    if (isExecuting[actionId]) return;
    setLoading(actionId, true);

    try {
      switch (actionId) {
        case 'briefingDiario': {
          const url = BRIDGE_URL ? `${BRIDGE_URL}/api/standup` : '/api/standup';
          try {
            const res = await fetch(url, {
              headers: API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {},
            });
            if (res.ok) {
              const json = await res.json().catch(() => null);
              const msg = json?.summary ?? json?.message ?? 'Briefing carregado com sucesso';
              setLastResult(msg);
              showToast(msg.slice(0, 120));
            } else {
              showToast('Briefing: servidor indisponivel no momento');
            }
          } catch {
            showToast('Briefing: sem conexao com o servidor');
          }
          break;
        }

        case 'syncMemoria': {
          showToast('Sincronizando dados...');
          await supabaseCtx.refetch();
          showToast('Dados sincronizados');
          break;
        }

        case 'novaTarefa': {
          if (onNavigate) onNavigate('planner');
          if (onOpenNovaTarefa) onOpenNovaTarefa();
          break;
        }

        case 'novaCaptura': {
          if (onOpenCaptura) onOpenCaptura();
          break;
        }

        default:
          showToast(`Acao "${actionId}" nao implementada`);
          break;
      }
    } finally {
      setLoading(actionId, false);
    }
  }, [isExecuting, supabaseCtx, onNavigate, onOpenNovaTarefa, onOpenCaptura]);

  return { execute, isExecuting, lastResult };
}
