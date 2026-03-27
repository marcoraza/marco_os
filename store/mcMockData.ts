/**
 * Mock data for MC panels when the MC service is unavailable.
 * Allows visual development and testing without running the MC backend.
 */
import type { MCAgent, MCTask, MCActivity, MCSession, MCLogEntry, MCCronJob, MCTokenUsage, MCStandupReport } from './missionControl';

export const MOCK_AGENTS: MCAgent[] = [
  {
    id: 1,
    name: 'Frank',
    role: 'coordinator',
    status: 'idle',
    last_seen: Date.now() - 120_000,
    last_activity: 'Coordenou deploy do marco-os',
    created_at: Date.now() - 86400_000 * 30,
    updated_at: Date.now() - 120_000,
    taskStats: { total: 24, assigned: 3, in_progress: 2, quality_review: 1, done: 18, completed: 18 },
  },
  {
    id: 2,
    name: 'Claude Code',
    role: 'developer',
    status: 'busy',
    last_seen: Date.now() - 5_000,
    last_activity: 'Implementando MC panels no V1',
    created_at: Date.now() - 86400_000 * 14,
    updated_at: Date.now() - 5_000,
    taskStats: { total: 45, assigned: 5, in_progress: 3, quality_review: 0, done: 37, completed: 37 },
  },
  {
    id: 3,
    name: 'Codex CLI',
    role: 'developer',
    status: 'offline',
    last_seen: Date.now() - 3600_000 * 2,
    last_activity: 'Sprint 1 bridge contract freeze',
    created_at: Date.now() - 86400_000 * 7,
    updated_at: Date.now() - 3600_000 * 2,
    taskStats: { total: 12, assigned: 0, in_progress: 0, quality_review: 0, done: 12, completed: 12 },
  },
  {
    id: 4,
    name: 'Researcher',
    role: 'analyst',
    status: 'idle',
    last_seen: Date.now() - 900_000,
    last_activity: 'Pesquisou mission-control upstream',
    created_at: Date.now() - 86400_000 * 20,
    updated_at: Date.now() - 900_000,
    taskStats: { total: 8, assigned: 1, in_progress: 0, quality_review: 0, done: 7, completed: 7 },
  },
];

export const MOCK_TASKS: MCTask[] = [
  { id: 1, title: 'Reimaginar MCOverviewPanel com design system', status: 'done', priority: 'high', assigned_to: 'Claude Code', created_by: 'Frank', created_at: Date.now() - 7200_000, updated_at: Date.now() - 3600_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-101' },
  { id: 2, title: 'Portar task board como kanban', status: 'done', priority: 'high', assigned_to: 'Claude Code', created_by: 'Frank', created_at: Date.now() - 7200_000, updated_at: Date.now() - 1800_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-102' },
  { id: 3, title: 'Bridge contract freeze', status: 'done', priority: 'critical', assigned_to: 'Codex CLI', created_by: 'Frank', created_at: Date.now() - 86400_000, updated_at: Date.now() - 43200_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-001' },
  { id: 4, title: 'Design pass completo nos paineis', status: 'in_progress', priority: 'high', assigned_to: 'Claude Code', created_by: 'Frank', created_at: Date.now() - 3600_000, updated_at: Date.now() - 600_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-201' },
  { id: 5, title: 'Pesquisar Obsidian como data source', status: 'assigned', priority: 'medium', assigned_to: 'Researcher', created_by: 'Frank', created_at: Date.now() - 1800_000, updated_at: Date.now() - 1800_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-301' },
  { id: 6, title: 'Configurar env de producao no VPS', status: 'inbox', priority: 'medium', assigned_to: undefined, created_by: 'Frank', created_at: Date.now() - 900_000, updated_at: Date.now() - 900_000, project_name: 'Infraestrutura' },
  { id: 7, title: 'Smoke test mobile responsivo', status: 'review', priority: 'medium', assigned_to: 'Claude Code', created_by: 'Frank', created_at: Date.now() - 5400_000, updated_at: Date.now() - 1200_000, project_name: 'Marco OS V2', ticket_ref: 'MOS-202' },
  { id: 8, title: 'Documentar MC API contract', status: 'assigned', priority: 'low', assigned_to: 'Claude Code', created_by: 'Frank', created_at: Date.now() - 3600_000, updated_at: Date.now() - 3600_000, project_name: 'Marco OS V2' },
];

export const MOCK_ACTIVITIES: MCActivity[] = [
  { id: 1, type: 'task.completed', entity_type: 'task', entity_id: 2, actor: 'Claude Code', description: 'concluiu task', created_at: Date.now() - 1800_000, entity: { type: 'task', id: 2, title: 'Portar task board como kanban', status: 'done' } },
  { id: 2, type: 'task.status_changed', entity_type: 'task', entity_id: 4, actor: 'Claude Code', description: 'moveu para em progresso', created_at: Date.now() - 2400_000, entity: { type: 'task', id: 4, title: 'Design pass completo nos paineis', status: 'in_progress' } },
  { id: 3, type: 'agent.registered', entity_type: 'agent', entity_id: 2, actor: 'system', description: 'registrou agente Claude Code', created_at: Date.now() - 86400_000, entity: { type: 'agent', name: 'Claude Code' } },
  { id: 4, type: 'task.created', entity_type: 'task', entity_id: 5, actor: 'Frank', description: 'criou task', created_at: Date.now() - 3600_000, entity: { type: 'task', id: 5, title: 'Pesquisar Obsidian como data source' } },
  { id: 5, type: 'comment.added', entity_type: 'task', entity_id: 3, actor: 'Frank', description: 'comentou', created_at: Date.now() - 5400_000, entity: { type: 'task', id: 3, title: 'Bridge contract freeze' } },
  { id: 6, type: 'task.completed', entity_type: 'task', entity_id: 1, actor: 'Claude Code', description: 'concluiu task', created_at: Date.now() - 7200_000, entity: { type: 'task', id: 1, title: 'Reimaginar MCOverviewPanel com design system', status: 'done' } },
  { id: 7, type: 'session.started', entity_type: 'session', entity_id: 0, actor: 'Claude Code', description: 'iniciou sessao', created_at: Date.now() - 10800_000 },
  { id: 8, type: 'agent.status_changed', entity_type: 'agent', entity_id: 3, actor: 'system', description: 'Codex CLI ficou offline', created_at: Date.now() - 7200_000, entity: { type: 'agent', name: 'Codex CLI' } },
];

export const MOCK_LOGS: MCLogEntry[] = [
  { id: 'l1', timestamp: Date.now() - 60_000, level: 'info', source: 'gateway', message: 'Agent Claude Code connected via WebSocket' },
  { id: 'l2', timestamp: Date.now() - 120_000, level: 'info', source: 'tasks', message: 'Task MOS-102 status changed: in_progress -> done' },
  { id: 'l3', timestamp: Date.now() - 180_000, level: 'warn', source: 'bridge', message: 'Bridge latency above threshold: 2340ms' },
  { id: 'l4', timestamp: Date.now() - 300_000, level: 'error', source: 'bridge', message: 'Bridge connection timeout after 15000ms, retrying...' },
  { id: 'l5', timestamp: Date.now() - 360_000, level: 'info', source: 'bridge', message: 'Bridge reconnected to api.clawdia.com.br' },
  { id: 'l6', timestamp: Date.now() - 600_000, level: 'debug', source: 'cron', message: 'Cron check: 0 jobs due for execution' },
  { id: 'l7', timestamp: Date.now() - 900_000, level: 'info', source: 'gateway', message: 'Agent Researcher heartbeat received' },
  { id: 'l8', timestamp: Date.now() - 1200_000, level: 'info', source: 'auth', message: 'Operator session refreshed' },
  { id: 'l9', timestamp: Date.now() - 1500_000, level: 'warn', source: 'memory', message: 'Memory index rebuild triggered: 3 stale entries' },
  { id: 'l10', timestamp: Date.now() - 1800_000, level: 'info', source: 'tasks', message: 'Task MOS-201 assigned to Claude Code' },
];

export const MOCK_CRON_JOBS: MCCronJob[] = [
  { id: 'c1', name: 'standup-daily', schedule: '0 9 * * 1-5', command: 'Generate daily standup report', enabled: true, lastRun: Date.now() - 3600_000 * 8, nextRun: Date.now() + 3600_000 * 16, lastStatus: 'success' },
  { id: 'c2', name: 'bridge-health', schedule: '*/5 * * * *', command: 'Check bridge connectivity', enabled: true, lastRun: Date.now() - 180_000, nextRun: Date.now() + 120_000, lastStatus: 'success' },
  { id: 'c3', name: 'memory-index', schedule: '0 */6 * * *', command: 'Rebuild memory search index', enabled: true, lastRun: Date.now() - 3600_000 * 3, nextRun: Date.now() + 3600_000 * 3, lastStatus: 'success' },
  { id: 'c4', name: 'backup-db', schedule: '0 2 * * *', command: 'Backup SQLite database', enabled: false, lastRun: Date.now() - 86400_000 * 3, lastStatus: 'error', lastError: 'Backup path not configured' },
];

export const MOCK_TOKEN_USAGE: MCTokenUsage[] = (() => {
  const models = ['claude-opus-4-6', 'claude-sonnet-4-6', 'gpt-5.3-codex'];
  const entries: MCTokenUsage[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400_000).toISOString().slice(0, 10);
    for (const model of models) {
      const base = model.includes('opus') ? 8000 : model.includes('sonnet') ? 15000 : 12000;
      const input = Math.floor(base * (0.5 + Math.random()));
      const output = Math.floor(input * 0.3);
      const costPer1k = model.includes('opus') ? 0.015 : model.includes('sonnet') ? 0.003 : 0.006;
      entries.push({
        model,
        sessionId: `session-${d}-${model.slice(0, 5)}`,
        date,
        inputTokens: input,
        outputTokens: output,
        totalTokens: input + output,
        cost: ((input + output) / 1000) * costPer1k,
      });
    }
  }
  return entries;
})();
