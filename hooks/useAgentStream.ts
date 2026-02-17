import { useState, useEffect, useCallback, useRef } from 'react';
import { listSessions, connectWebSocket, type OpenClawSession } from '../utils/openclaw';
import type { AgentData, AgentStatus } from '../types/mission-control.types';

// ── Mock Data (fallback quando Gateway offline) ────────────────────────────────

const MOCK_AGENTS: AgentData[] = [
  {
    id: 'mock-1',
    status: 'active',
    task: 'Pesquisar APIs Instagram no RapidAPI',
    progress: [
      'Iniciado web_search no RapidAPI marketplace',
      'Encontrado 3 APIs candidatas: Official API, Instagram Scraper, Social Media Data',
      'Testando endpoints com requests de exemplo...'
    ],
    model: 'anthropic/claude-sonnet-4-5',
    tokens: 12453,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 'mock-2',
    status: 'queued',
    task: 'Construir adapter TikTok pro pipeline v3',
    progress: [
      'Aguardando conclusão do Agent 1 para replicar estrutura de API discovery',
    ],
    model: 'google/gemini-flash-1.5',
    tokens: 3201,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'mock-3',
    status: 'completed',
    task: 'Criar adapter X/Twitter pro pipeline',
    progress: [
      'Pipeline v3 structure implementada com opinião crítica + nota sistema',
      'Callback handler criado para menu de 16 botões',
      'Testing completo com URLs reais do Twitter/X',
      'Merged to main após revisão'
    ],
    model: 'anthropic/claude-sonnet-4-5',
    tokens: 18732,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

// ── Adapter OpenClaw → AgentData ──────────────────────────────────────────────

function mapSession(session: OpenClawSession): AgentData {
  const lastUpdate = session.updatedAt;
  const minutesSince = (Date.now() - lastUpdate) / 60000;

  let status: AgentStatus = 'active';
  if (minutesSince > 60) status = 'completed';
  else if (session.kind === 'other' && minutesSince < 30) status = 'active';

  // Extrair task do displayName
  const task = session.displayName
    ?.replace(/^telegram:g-/, '')
    ?.replace(/-/g, ' ')
    ?.replace(/agent main subagent /i, 'Agent: ')
    || 'Sessão ativa';

  // Extrair progresso das últimas mensagens
  const progress: string[] = [];
  if (session.messages?.length) {
    session.messages.slice(-3).forEach(msg => {
      if (msg.role === 'assistant') {
        const text = Array.isArray(msg.content)
          ? msg.content.find((c: any) => c.type === 'text')?.text || ''
          : String(msg.content);
        if (text.trim()) {
          progress.push(text.slice(0, 200).trim());
        }
      }
    });
  }

  if (progress.length === 0) progress.push('Sessão em execução...');

  return {
    id: session.key,
    status,
    task,
    progress,
    model: session.model || 'unknown',
    tokens: session.totalTokens ?? 0,
    createdAt: new Date(session.updatedAt).toISOString(),
    updatedAt: new Date(session.updatedAt).toISOString(),
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentStream(autoRefreshMs = 5000) {
  const [agents, setAgents] = useState<AgentData[]>(MOCK_AGENTS);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);

  const fetchAgents = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const sessions = await listSessions(50);

      // Filtrar só sessões relevantes (não sistema)
      const relevant = sessions.filter(s =>
        s.kind !== 'system' &&
        !s.displayName?.includes('heartbeat') &&
        !s.displayName?.includes('cron')
      );

      if (relevant.length > 0 && isMounted.current) {
        setAgents(relevant.map(mapSession));
        setIsConnected(true);
      }
    } catch {
      // Gateway offline — mantém mock data silencioso
    } finally {
      if (isMounted.current) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    // Fetch inicial
    fetchAgents();

    // Auto-refresh polling (fallback se WebSocket não conectar)
    const interval = setInterval(fetchAgents, autoRefreshMs);

    // WebSocket pra updates em tempo real
    const cleanup = connectWebSocket(
      (sessions) => {
        if (!isMounted.current) return;
        const relevant = sessions.filter(s =>
          s.kind !== 'system' &&
          !s.displayName?.includes('heartbeat') &&
          !s.displayName?.includes('cron')
        );
        if (relevant.length > 0) setAgents(relevant.map(mapSession));
      },
      (connected) => {
        if (isMounted.current) setIsConnected(connected);
      }
    );

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      cleanup();
    };
  }, [fetchAgents, autoRefreshMs]);

  return {
    agents,
    isConnected,
    isRefreshing,
    refetch: fetchAgents,
  };
}
