export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  icon: string;
  model: string;
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  { id: 'main', name: 'Frank', role: 'Orquestrador', icon: '🧠', model: 'anthropic/claude-sonnet-4-6' },
  { id: 'headcode', name: 'Head Code', role: 'Coding Agent', icon: '💻', model: 'gpt-5.3-codex' },
  { id: 'planner', name: 'Planner', role: 'Planejamento', icon: '📋', model: 'anthropic/claude-sonnet-4-5' },
  { id: 'qa', name: 'QA', role: 'Quality Assurance', icon: '🔍', model: 'anthropic/claude-sonnet-4-5' },
];
