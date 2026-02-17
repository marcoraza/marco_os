import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSessionsSafe, type OpenClawSession } from '../utils/openclaw';
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
    progress: ['Aguardando conclusão do Agent 1...'],
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
      'Pipeline v3 structure implementada',
      'Callback handler criado (16 botões)',
      'Testing completo — merged to main'
    ],
    model: 'anthropic/claude-sonnet-4-5',
    tokens: 18732,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
];

// ── Adapter OpenClaw → AgentData ──────────────────────────────────────────────

function extractText(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const textItem = content.find((c: any) => c.type === 'text' && c.text);
    return textItem?.text || '';
  }
  return '';
}

function mapSession(session: OpenClawSession): AgentData {
  const minutesSince = (Date.now() - session.updatedAt) / 60000;

  // Inferir status
  let status: AgentStatus = 'active';
  if (session.label?.toLowerCase().includes('cron')) {
    status = 'completed'; // crons são sempre completed
  } else if (minutesSince > 60) {
    status = 'completed';
  } else if (minutesSince < 30) {
    status = 'active';
  }

  // Task name a partir do label ou displayName
  const task =
    session.label ||
    session.displayName
      ?.replace(/^telegram:g-agent-main-/, '')
      ?.replace(/^subagent-[a-f0-9-]+/, 'Subagent')
      ?.replace(/-/g, ' ')
    || 'Sessão ativa';

  // Extrair progresso das últimas mensagens do assistant
  const progress: string[] = [];
  if (session.messages?.length) {
    session.messages
      .filter(m => m.role === 'assistant')
      .slice(-3)
      .forEach(msg => {
        const text = extractText(msg.content);
        if (text && text !== 'NO_REPLY' && text !== 'HEARTBEAT_OK') {
          progress.push(text.slice(0, 250).trim());
        }
      });
  }

  if (progress.length === 0) progress.push('Em execução...');

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

// ── Filtros de sessões relevantes ─────────────────────────────────────────────

function isRelevant(session: OpenClawSession): boolean {
  const key = session.key;
  // Excluir sessão principal (Frank) e crons silenciosos
  if (key === 'agent:main:main') return false;
  if (session.messages?.[0]?.role === 'assistant') {
    const text = extractText(session.messages[0].content);
    if (text === 'NO_REPLY' || text === 'HEARTBEAT_OK') return false;
  }
  return true;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAgentStream(autoRefreshMs = 5000) {
  const [agents, setAgents] = useState<AgentData[]>(MOCK_AGENTS);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useRef(true);
  const usingMock = useRef(true);

  const fetchAgents = useCallback(async () => {
    if (!isMounted.current) return;
    setIsRefreshing(true);

    const sessions = await fetchSessionsSafe(30);

    if (!isMounted.current) return;

    if (sessions !== null) {
      const relevant = sessions.filter(isRelevant);
      setAgents(relevant.length > 0 ? relevant.map(mapSession) : MOCK_AGENTS);
      setIsConnected(true);
      usingMock.current = false;
    } else {
      // Gateway offline — mantém mock
      if (!usingMock.current) {
        setAgents(MOCK_AGENTS);
        usingMock.current = true;
      }
      setIsConnected(false);
    }

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchAgents();
    const interval = setInterval(fetchAgents, autoRefreshMs);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [fetchAgents, autoRefreshMs]);

  return { agents, isConnected, isRefreshing, refetch: fetchAgents };
}
