// ─── TYPES ─────────────────────────────────────────────────────────────────

export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';
export type AgentRole = 'coordinator' | 'sub-agent' | 'integration';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'pending';
export type KanbanStatus = 'backlog' | 'em-progresso' | 'revisao' | 'concluido';

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
  avatar?: string;
  responseTime?: number;
  successRate?: number;
  tasksCompleted?: number;
  icon: string;
}

export interface KanbanTask {
  id: string;
  agentId: string;
  title: string;
  status: KanbanStatus;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  messages: {
    id: string;
    content: string;
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'progress';
  }[];
}

export interface Execution {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: string;
  output?: string;
  error?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'ok' | 'warning' | 'failed' | 'paused';
  integration: string;
  agentId?: string;
}

export interface HeartbeatEvent {
  id: string;
  agentId: string;
  agentName: string;
  ts: string;
  latencyMs: number;
  status: 'ok' | 'late' | 'missed';
  note?: string;
}

export interface MemoryArtifact {
  id: string;
  agentId?: string;
  path: string;
  kind: 'daily' | 'long-term' | 'config' | 'log';
  updatedAt: string;
  size: string;
  summary: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: string[];
  enabled: boolean;
}

export interface TokenUsage {
  agentId: string;
  model: string;
  totalTokensIn: number;
  totalTokensOut: number;
  todayTokensIn: number;
  todayTokensOut: number;
  estimatedCostUSD: number;
  todayCostUSD: number;
  last7Days: { date: string; tokensIn: number; tokensOut: number }[];
}

// ─── STATUS MAPPINGS ───────────────────────────────────────────────────────

export const statusDot: Record<AgentStatus, { color: 'mint' | 'orange' | 'blue' | 'red'; label: string }> = {
  online: { color: 'mint', label: 'ONLINE' },
  busy: { color: 'orange', label: 'OCUPADO' },
  idle: { color: 'blue', label: 'INATIVO' },
  offline: { color: 'red', label: 'OFFLINE' },
};

export const executionBadge: Record<ExecutionStatus, { variant: 'mint' | 'orange' | 'red' | 'blue'; label: string; icon: string }> = {
  running: { variant: 'blue', label: 'EXECUTANDO', icon: 'autorenew' },
  completed: { variant: 'mint', label: 'CONCLUÍDO', icon: 'check_circle' },
  failed: { variant: 'red', label: 'FALHOU', icon: 'error' },
  pending: { variant: 'orange', label: 'PENDENTE', icon: 'pending' },
};

export const kanbanColumns: Record<KanbanStatus, { variant: 'blue' | 'orange' | 'purple' | 'mint'; label: string; icon: string }> = {
  backlog: { variant: 'blue', label: 'BACKLOG', icon: 'inbox' },
  'em-progresso': { variant: 'orange', label: 'EM PROGRESSO', icon: 'autorenew' },
  revisao: { variant: 'purple', label: 'REVISÃO', icon: 'rate_review' },
  concluido: { variant: 'mint', label: 'CONCLUÍDO', icon: 'check_circle' },
};

export const jobBadge: Record<CronJob['status'], { variant: 'mint' | 'orange' | 'red' | 'neutral'; label: string; icon: string }> = {
  ok: { variant: 'mint', label: 'OK', icon: 'check_circle' },
  warning: { variant: 'orange', label: 'ALERTA', icon: 'warning' },
  failed: { variant: 'red', label: 'FALHOU', icon: 'error' },
  paused: { variant: 'neutral', label: 'PAUSADO', icon: 'pause_circle' },
};

export const heartbeatBadge: Record<HeartbeatEvent['status'], { variant: 'mint' | 'orange' | 'red'; label: string; icon: string }> = {
  ok: { variant: 'mint', label: 'OK', icon: 'wifi_tethering' },
  late: { variant: 'orange', label: 'ATRASADO', icon: 'schedule' },
  missed: { variant: 'red', label: 'PERDIDO', icon: 'wifi_off' },
};

export const KANBAN_ORDER: KanbanStatus[] = ['backlog', 'em-progresso', 'revisao', 'concluido'];

// ─── MOCK DATA ─────────────────────────────────────────────────────────────

export const agents: Agent[] = [
  {
    id: 'frank', name: 'Frank', role: 'coordinator', model: 'Claude Opus', owner: '@marco',
    status: 'online', lastHeartbeat: '22:51:58Z', uptime: '14d 03h', icon: 'smart_toy',
    currentMission: 'Redesign do Agent Center', tags: ['orquestrador', 'gateway'],
    responseTime: 84, successRate: 98.5, tasksCompleted: 1247,
  },
  {
    id: 'head-code', name: 'Head Code', role: 'sub-agent', model: 'Claude Sonnet', owner: 'Frank',
    status: 'busy', lastHeartbeat: '22:51:47Z', uptime: '2h 18m', icon: 'code',
    currentMission: 'Implementação de componentes React', tags: ['typescript', 'ui', 'vite'],
    responseTime: 132, successRate: 94.2, tasksCompleted: 89,
  },
  {
    id: 'planner', name: 'Planner', role: 'sub-agent', model: 'Claude Sonnet', owner: 'Frank',
    status: 'online', lastHeartbeat: '22:51:43Z', uptime: '3h 18m', icon: 'psychology',
    currentMission: 'Alinhamento de spec e UX', tags: ['análise', 'tickets'],
    responseTime: 210, successRate: 91.8, tasksCompleted: 156,
  },
  {
    id: 'qa', name: 'QA', role: 'sub-agent', model: 'Claude Sonnet', owner: 'Frank',
    status: 'idle', lastHeartbeat: '22:51:21Z', uptime: '52m', icon: 'bug_report',
    tags: ['testes', 'build', 'lint'], responseTime: 178, successRate: 97.3, tasksCompleted: 42,
  },
];

export const kanbanTasks: KanbanTask[] = [
  {
    id: 'task-1', agentId: 'frank', title: 'Coordenação do PR do Agent Center', status: 'em-progresso', priority: 'high', createdAt: '22:30Z',
    messages: [
      { id: 'm1', content: 'CodeGen iniciado para implementação de UI', timestamp: '22:31Z', type: 'info' },
      { id: 'm2', content: 'Planner iniciado para revisão de spec', timestamp: '22:32Z', type: 'info' },
      { id: 'm3', content: 'Componentes rascunhados, revisando consistência', timestamp: '22:45Z', type: 'progress' },
    ],
  },
  {
    id: 'task-2', agentId: 'frank', title: 'Triagem da caixa de entrada', status: 'concluido', priority: 'low', createdAt: '22:10Z',
    messages: [
      { id: 'm10', content: 'Escaneados 12 novos emails', timestamp: '22:11Z', type: 'info' },
      { id: 'm11', content: 'Criadas 2 tarefas de finanças', timestamp: '22:12Z', type: 'success' },
    ],
  },
  {
    id: 'task-3', agentId: 'frank', title: 'Definir roadmap Q1 2026', status: 'backlog', priority: 'medium', createdAt: '21:00Z',
    messages: [
      { id: 'm20', content: 'Aguardando revisão de prioridades', timestamp: '21:01Z', type: 'info' },
    ],
  },
  {
    id: 'task-4', agentId: 'head-code', title: 'Implementar 8 views do Agent Center', status: 'em-progresso', priority: 'high', createdAt: '22:31Z',
    messages: [
      { id: 'm4', content: 'Lendo AgentCenter.tsx existente...', timestamp: '22:32Z', type: 'info' },
      { id: 'm5', content: 'Estrutura do Kanban planejada', timestamp: '22:35Z', type: 'success' },
      { id: 'm6', content: 'Escrevendo componente TypeScript completo...', timestamp: '22:48Z', type: 'progress' },
    ],
  },
  {
    id: 'task-5', agentId: 'head-code', title: 'Refatorar sistema de temas', status: 'backlog', priority: 'medium', createdAt: '20:00Z',
    messages: [
      { id: 'm21', content: 'Pendente após conclusão do Agent Center', timestamp: '20:01Z', type: 'info' },
    ],
  },
  {
    id: 'task-6', agentId: 'head-code', title: 'Migrar tokens CSS para variáveis', status: 'revisao', priority: 'low', createdAt: '19:00Z',
    messages: [
      { id: 'm22', content: 'Tokens mapeados, aguardando aprovação', timestamp: '19:30Z', type: 'progress' },
    ],
  },
  {
    id: 'task-7', agentId: 'planner', title: 'Revisão de consistência UX', status: 'em-progresso', priority: 'medium', createdAt: '22:32Z',
    messages: [
      { id: 'm7', content: 'Analisando referência do OpenClaw', timestamp: '22:33Z', type: 'info' },
      { id: 'm8', content: 'Tokens do design system verificados', timestamp: '22:40Z', type: 'success' },
    ],
  },
  {
    id: 'task-8', agentId: 'planner', title: 'Documentar fluxos de navegação', status: 'backlog', priority: 'low', createdAt: '21:30Z',
    messages: [
      { id: 'm23', content: 'Esperando definição final do sidebar', timestamp: '21:31Z', type: 'info' },
    ],
  },
  {
    id: 'task-9', agentId: 'qa', title: 'Validação de type safety', status: 'backlog', priority: 'medium', createdAt: '22:33Z',
    messages: [
      { id: 'm9', content: 'Aguardando conclusão do CodeGen...', timestamp: '22:33Z', type: 'info' },
    ],
  },
  {
    id: 'task-10', agentId: 'qa', title: 'Testes de regressão visual', status: 'backlog', priority: 'high', createdAt: '22:35Z',
    messages: [
      { id: 'm24', content: 'Snapshots precisam ser atualizados', timestamp: '22:36Z', type: 'info' },
    ],
  },
];

export const executions: Execution[] = [
  { id: 'exec-1', agentId: 'head-code', agentName: 'Head Code', task: 'Implementar views do Agent Center', status: 'running', startedAt: '22:31:42Z', output: 'Escrevendo componente TypeScript com 8 tabs...' },
  { id: 'exec-2', agentId: 'planner', agentName: 'Planner', task: 'Revisão de consistência UX', status: 'running', startedAt: '22:32:15Z', output: 'Analisando padrões de design...' },
  { id: 'exec-3', agentId: 'frank', agentName: 'Frank', task: 'Triagem da caixa de entrada', status: 'completed', startedAt: '22:10:00Z', completedAt: '22:13:24Z', duration: '3m 24s', output: 'Processados 12 emails, criadas 2 tarefas' },
  { id: 'exec-4', agentId: 'qa', agentName: 'QA', task: 'Validação de type safety do sidebar', status: 'completed', startedAt: '22:20:00Z', completedAt: '22:22:10Z', duration: '2m 10s', output: 'Todos os tipos validados, zero erros' },
];

export const cronJobs: CronJob[] = [
  { id: 'cron-1', name: 'Triagem de inbox → fila de ações', schedule: '*/20m', lastRun: '22:40Z (OK)', nextRun: '23:00Z', status: 'ok', integration: 'OpenClaw', agentId: 'frank' },
  { id: 'cron-2', name: 'Healthcheck do gateway', schedule: '*/5m', lastRun: '22:50Z (OK)', nextRun: '22:55Z', status: 'ok', integration: 'OpenClaw', agentId: 'frank' },
  { id: 'cron-3', name: 'Destilação semanal de memória', schedule: 'Seg 09:00', lastRun: '2026-02-10 (PAUSADO)', nextRun: '2026-02-17', status: 'paused', integration: 'OpenClaw', agentId: 'frank' },
  { id: 'cron-4', name: 'Build check contínuo', schedule: '*/15m', lastRun: '22:45Z (OK)', nextRun: '23:00Z', status: 'ok', integration: 'OpenClaw', agentId: 'head-code' },
  { id: 'cron-5', name: 'Lint e validação de tipos', schedule: '*/30m', lastRun: '22:30Z (ALERTA)', nextRun: '23:00Z', status: 'warning', integration: 'OpenClaw', agentId: 'qa' },
];

export const heartbeats: HeartbeatEvent[] = [
  { id: 'hb-1', agentId: 'frank', agentName: 'Frank', ts: '22:51:58Z', latencyMs: 84, status: 'ok' },
  { id: 'hb-2', agentId: 'head-code', agentName: 'Head Code', ts: '22:51:47Z', latencyMs: 132, status: 'ok' },
  { id: 'hb-3', agentId: 'planner', agentName: 'Planner', ts: '22:51:43Z', latencyMs: 210, status: 'late', note: 'carga alta de ferramentas' },
  { id: 'hb-4', agentId: 'qa', agentName: 'QA', ts: '22:51:21Z', latencyMs: 178, status: 'ok' },
];

export const memoryArtifacts: MemoryArtifact[] = [
  { id: 'mem-1', path: 'MEMORY.md', kind: 'long-term', updatedAt: '2026-02-11 09:12Z', size: '18.2 KB', summary: 'Memórias de longo prazo: workflows, preferências, padrões recorrentes' },
  { id: 'mem-2', path: 'memory/2026-02-12.md', kind: 'daily', updatedAt: '2026-02-12 22:10Z', size: '6.4 KB', summary: 'Planejamento PR4, alinhamento de UI, checks de build', agentId: 'frank' },
  { id: 'mem-3', path: 'AGENTS.md', kind: 'config', updatedAt: '2026-02-10 18:40Z', size: '5.1 KB', summary: 'Regras do workspace, orientação de heartbeat, segurança' },
  { id: 'mem-4', agentId: 'head-code', path: 'memory/headcode-context.json', kind: 'log', updatedAt: '2026-02-12 22:48Z', size: '2.3 KB', summary: 'Leituras recentes de arquivos, padrões aprendidos' },
  { id: 'mem-5', agentId: 'qa', path: 'memory/qa-results.json', kind: 'log', updatedAt: '2026-02-12 22:42Z', size: '0.9 KB', summary: 'Resultados de testes, cobertura, métricas de qualidade' },
];

export const agentConfigs: AgentConfig[] = [
  { id: 'frank', name: 'Frank', role: 'coordinator', model: 'Claude Opus', systemPrompt: 'Você é o Frank, o agente coordenador do Marco OS. Seu papel é orquestrar sub-agentes e gerenciar o controle de missões.', temperature: 0.7, maxTokens: 4096, tools: ['spawn-agent', 'dispatch', 'memory', 'web-search'], enabled: true },
  { id: 'head-code', name: 'Head Code', role: 'sub-agent', model: 'Claude Sonnet', systemPrompt: 'Você é o Head Code, um especialista em TypeScript, React e implementação de UI. Escreva código limpo e pronto para produção.', temperature: 0.3, maxTokens: 8192, tools: ['file-read', 'file-write', 'bash'], enabled: true },
  { id: 'planner', name: 'Planner', role: 'sub-agent', model: 'Claude Sonnet', systemPrompt: 'Você é o Planner, focado em análise de spec, consistência UX e planejamento de roadmap.', temperature: 0.5, maxTokens: 4096, tools: ['file-read', 'web-search'], enabled: true },
  { id: 'qa', name: 'QA', role: 'sub-agent', model: 'Claude Sonnet', systemPrompt: 'Você é o QA, focado em testes, validação de tipos e qualidade de código.', temperature: 0.2, maxTokens: 4096, tools: ['file-read', 'bash', 'test-runner'], enabled: true },
];

export const tokenUsages: TokenUsage[] = [
  { agentId: 'frank', model: 'Claude Opus', totalTokensIn: 2_340_000, totalTokensOut: 1_870_000, todayTokensIn: 45_200, todayTokensOut: 38_100, estimatedCostUSD: 14.82, todayCostUSD: 0.42, last7Days: [
    { date: '06/02', tokensIn: 38_000, tokensOut: 31_000 }, { date: '07/02', tokensIn: 42_000, tokensOut: 35_000 },
    { date: '08/02', tokensIn: 29_000, tokensOut: 24_000 }, { date: '09/02', tokensIn: 51_000, tokensOut: 43_000 },
    { date: '10/02', tokensIn: 47_000, tokensOut: 39_000 }, { date: '11/02', tokensIn: 36_000, tokensOut: 30_000 },
    { date: '12/02', tokensIn: 45_200, tokensOut: 38_100 },
  ]},
  { agentId: 'head-code', model: 'Claude Sonnet', totalTokensIn: 890_000, totalTokensOut: 1_420_000, todayTokensIn: 32_100, todayTokensOut: 58_400, estimatedCostUSD: 6.93, todayCostUSD: 0.28, last7Days: [
    { date: '06/02', tokensIn: 28_000, tokensOut: 52_000 }, { date: '07/02', tokensIn: 35_000, tokensOut: 61_000 },
    { date: '08/02', tokensIn: 19_000, tokensOut: 34_000 }, { date: '09/02', tokensIn: 41_000, tokensOut: 72_000 },
    { date: '10/02', tokensIn: 38_000, tokensOut: 65_000 }, { date: '11/02', tokensIn: 22_000, tokensOut: 41_000 },
    { date: '12/02', tokensIn: 32_100, tokensOut: 58_400 },
  ]},
  { agentId: 'planner', model: 'Claude Sonnet', totalTokensIn: 620_000, totalTokensOut: 480_000, todayTokensIn: 18_300, todayTokensOut: 14_700, estimatedCostUSD: 3.31, todayCostUSD: 0.10, last7Days: [
    { date: '06/02', tokensIn: 15_000, tokensOut: 12_000 }, { date: '07/02', tokensIn: 21_000, tokensOut: 17_000 },
    { date: '08/02', tokensIn: 12_000, tokensOut: 9_000 }, { date: '09/02', tokensIn: 24_000, tokensOut: 19_000 },
    { date: '10/02', tokensIn: 19_000, tokensOut: 15_000 }, { date: '11/02', tokensIn: 17_000, tokensOut: 13_000 },
    { date: '12/02', tokensIn: 18_300, tokensOut: 14_700 },
  ]},
  { agentId: 'qa', model: 'Claude Sonnet', totalTokensIn: 210_000, totalTokensOut: 180_000, todayTokensIn: 4_200, todayTokensOut: 3_100, estimatedCostUSD: 1.17, todayCostUSD: 0.02, last7Days: [
    { date: '06/02', tokensIn: 5_000, tokensOut: 4_000 }, { date: '07/02', tokensIn: 7_000, tokensOut: 5_000 },
    { date: '08/02', tokensIn: 3_000, tokensOut: 2_000 }, { date: '09/02', tokensIn: 8_000, tokensOut: 6_000 },
    { date: '10/02', tokensIn: 6_000, tokensOut: 5_000 }, { date: '11/02', tokensIn: 4_000, tokensOut: 3_000 },
    { date: '12/02', tokensIn: 4_200, tokensOut: 3_100 },
  ]},
];

// ─── HELPERS ───────────────────────────────────────────────────────────────

export function getAgentById(id: string): Agent | undefined {
  return agents.find(a => a.id === id);
}

export function getTasksForAgent(agentId: string): KanbanTask[] {
  return kanbanTasks.filter(t => t.agentId === agentId);
}

export function getExecutionsForAgent(agentId: string): Execution[] {
  return executions.filter(e => e.agentId === agentId);
}

export function getCronJobsForAgent(agentId: string): CronJob[] {
  return cronJobs.filter(j => j.agentId === agentId);
}

export function getHeartbeatsForAgent(agentId: string): HeartbeatEvent[] {
  return heartbeats.filter(h => h.agentId === agentId);
}

export function getMemoryForAgent(agentId: string): MemoryArtifact[] {
  return memoryArtifacts.filter(m => m.agentId === agentId || !m.agentId);
}

export function getConfigForAgent(agentId: string): AgentConfig | undefined {
  return agentConfigs.find(c => c.id === agentId);
}

export function getTokenUsageForAgent(agentId: string): TokenUsage | undefined {
  return tokenUsages.find(t => t.agentId === agentId);
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
