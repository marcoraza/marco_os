import { useEffect } from 'react';
import type { Agent } from '../types/agents';
import { mergeLiveAgent } from '../data/domainFactories';

interface LiveAgent {
  id: string;
  name: string;
  role: string;
  model?: string;
  status: string;
  lastHeartbeat?: string;
  uptime?: string;
  tags?: string[];
  currentMission?: string;
}

export function mergeAgentRoster(previous: Agent[], liveAgents: LiveAgent[]): Agent[] {
  if (liveAgents.length === 0) return previous;
  const hasRealAgent = liveAgents.some((agent) => ['main', 'coder', 'researcher'].includes(agent.id));
  if (!hasRealAgent) return previous;

  const merged = [...previous];
  for (const liveAgent of liveAgents) {
    const index = merged.findIndex((agent) => agent.id === liveAgent.id);
    const updated: Agent = {
      id: liveAgent.id,
      name: liveAgent.name,
      role: liveAgent.role as Agent['role'],
      model: liveAgent.model,
      status: liveAgent.status as Agent['status'],
      lastHeartbeat: liveAgent.lastHeartbeat || '',
      uptime: liveAgent.uptime || '',
      tags: liveAgent.tags || [],
      currentMission: liveAgent.currentMission,
    };

    if (index >= 0) {
      merged[index] = mergeLiveAgent(merged[index], updated);
    } else {
      merged.push(updated);
    }
  }
  return merged;
}

export function useAgentRosterSync(
  liveAgents: LiveAgent[],
  setAgentRoster: React.Dispatch<React.SetStateAction<Agent[]>>,
) {
  useEffect(() => {
    setAgentRoster((previous) => mergeAgentRoster(previous, liveAgents));
  }, [liveAgents, setAgentRoster]);
}
