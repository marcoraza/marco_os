export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';

export type AgentRole = 'coordinator' | 'sub-agent' | 'integration';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  model?: string;
  owner?: string;
  status: AgentStatus;
  lastHeartbeat: string;
  uptime: string;
  currentMission?: string;
  tags: string[];

  domain?: string;     // ex: OPERAÇÕES
  handle?: string;     // ex: @emilizaremba
  avatarIcon?: string; // material-symbols
}
