import { useMemo } from 'react';
import { useAgents, useConnectionState, useExecutions } from '../contexts/OpenClawContext';
import { AGENT_DEFINITIONS } from '../lib/agents';

export interface AgentData {
  id: string;
  status: 'active' | 'queued' | 'completed' | 'failed';
  task: string;
  progress: string[];
  model: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

const AGENT_ID_ALIASES: Record<string, string[]> = {
  main: ['main', 'frank'],
  headcode: ['headcode', 'head-code'],
  planner: ['planner'],
  qa: ['qa'],
};

function normalize(value: string | undefined): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getCandidateIds(agentId: string): string[] {
  return AGENT_ID_ALIASES[agentId] || [agentId];
}

function toAgentStatus(status: string): AgentData['status'] {
  if (status === 'running' || status === 'pending') return 'active';
  if (status === 'completed') return 'completed';
  if (status === 'failed') return 'failed';
  return 'queued';
}

function toIsoOrNow(value?: string): string {
  const parsed = value ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

export function useAgentStream() {
  const agentsPresence = useAgents().agents;
  const runs = useExecutions();
  const { isLive } = useConnectionState();

  const agents = useMemo<AgentData[]>(() => {
    return AGENT_DEFINITIONS.map((definition) => {
      const candidateIds = getCandidateIds(definition.id);
      const candidateSet = new Set(candidateIds.map(normalize));

      const presence = agentsPresence.find((agent) => {
        const byId = candidateSet.has(normalize(agent.id));
        const byName = normalize(agent.name) === normalize(definition.name);
        return byId || byName;
      });

      const relatedRuns = runs
        .filter((run) => {
          const byId = candidateSet.has(normalize(run.agentId));
          const byName = normalize(run.agentName) === normalize(definition.name);
          return byId || byName;
        })
        .sort((a, b) => {
          const at = new Date(a.completedAt || a.startedAt).getTime();
          const bt = new Date(b.completedAt || b.startedAt).getTime();
          return bt - at;
        });

      const session = relatedRuns[0];

      if (!session) {
        const now = new Date().toISOString();
        return {
          id: definition.id,
          status: 'queued',
          task: 'Aguardando missão',
          progress: [],
          model: presence?.model || definition.model,
          tokens: 0,
          createdAt: now,
          updatedAt: now,
        };
      }

      // OpenClawContext não expõe mensagens role=assistant no run; usamos a trilha
      // textual mais próxima (output/error das execuções mais recentes).
      const progress = relatedRuns
        .map((run) => run.output || run.error || '')
        .filter((msg): msg is string => Boolean(msg))
        .slice(0, 5);

      const sessionWithTokens = session as typeof session & { tokensIn?: number; tokensOut?: number };
      const tokens = (sessionWithTokens.tokensIn || 0) + (sessionWithTokens.tokensOut || 0);

      return {
        id: definition.id,
        status: toAgentStatus(session.status),
        task: session.task,
        progress,
        model: presence?.model || definition.model,
        tokens,
        createdAt: toIsoOrNow(session.startedAt),
        updatedAt: toIsoOrNow(session.completedAt || session.startedAt),
      };
    });
  }, [agentsPresence, runs]);

  return { agents, isConnected: isLive };
}
