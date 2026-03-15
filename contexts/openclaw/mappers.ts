import type {
  AgentPresence,
  AgentRun,
  CronJob,
  HeartbeatTick,
  KanbanBoard,
} from '../../lib/openclawTypes';
import type {
  Agent,
  CronJob as MockCronJob,
  Execution,
  HeartbeatEvent,
  KanbanTask as MockKanbanTask,
  TokenUsage,
} from '../../data/agentMockData';

export function mapPresenceToAgents(payload: Record<string, AgentPresence>): Agent[] {
  return Object.values(payload).map((presence) => ({
    id: presence.agentId,
    name: presence.name,
    role: (presence.role || 'sub-agent') as Agent['role'],
    model: presence.model,
    status: presence.status,
    lastHeartbeat: presence.lastHeartbeat || '',
    uptime: '',
    tags: [],
    icon: 'smart_toy',
    responseTime: presence.latencyMs,
  }));
}

export function mapRunToExecution(run: AgentRun): Execution {
  return {
    id: run.runId,
    agentId: run.agentId,
    agentName: run.agentName,
    task: run.task,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    duration: run.duration,
    output: run.output,
    error: run.error,
  };
}

export function mapTickToHeartbeatEvent(tick: HeartbeatTick): HeartbeatEvent {
  return {
    id: `hb-${tick.agentId}-${Date.now()}`,
    agentId: tick.agentId,
    agentName: tick.agentName,
    ts: tick.ts,
    latencyMs: tick.latencyMs,
    status: tick.status,
    note: tick.note,
  };
}

export function mapGatewayCronJobs(jobs: CronJob[]): MockCronJob[] {
  return jobs.map((job) => ({
    id: job.id,
    name: job.name,
    schedule: job.schedule,
    lastRun: job.lastRun?.ts || '',
    nextRun: job.nextRun || '',
    status:
      job.lastRun?.status === 'ok'
        ? 'ok'
        : job.lastRun?.status === 'failed'
          ? 'failed'
          : job.enabled
            ? 'ok'
            : 'paused',
    integration: 'OpenClaw',
    agentId: job.agentId,
  }));
}

export function mapBridgeRuns(runs: any[]): Execution[] {
  return runs.map((run) => ({
    id: run.id,
    agentId: run.agentId,
    agentName: run.agentName,
    task: run.task,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    duration: run.duration,
    output: run.output,
    error: run.error,
  }));
}

export function mapBridgeTokens(tokens: any[]): TokenUsage[] {
  return tokens.map((token) => ({
    agentId: token.agentId,
    model: token.model || 'unknown',
    totalTokensIn: token.totalIn || 0,
    totalTokensOut: token.totalOut || 0,
    todayTokensIn: token.todayIn || 0,
    todayTokensOut: token.todayOut || 0,
    estimatedCostUSD: token.estimatedCostUSD || 0,
    todayCostUSD: token.todayCostUSD || 0,
    last7Days: token.last7Days || [],
  }));
}

export function mapBridgeTasks(tasks: any[]): MockKanbanTask[] {
  return tasks.map((task) => ({
    id: task.id,
    agentId: task.agentId,
    title: task.title,
    status: task.status,
    priority: task.priority,
    createdAt: task.createdAt,
    deadline: task.deadline,
    tipo: task.tipo,
    responsavel: task.responsavel,
    contexto: task.contexto,
    tags: task.tags || [],
    notionUrl: task.notionUrl,
    messages: task.messages || [],
  }));
}

export function parseCronJson(raw: string): MockCronJob[] | null {
  try {
    const data = JSON.parse(raw) as { jobs: MockCronJob[] };
    if (!data.jobs?.length) return null;
    return data.jobs;
  } catch {
    return null;
  }
}

export function parseBoardJson(raw: string): MockKanbanTask[] | null {
  try {
    const board = JSON.parse(raw) as KanbanBoard;
    if (!board.tasks?.length) return null;
    return board.tasks.map((task) => ({
      id: task.id,
      agentId: task.agent,
      title: task.title,
      status: task.status,
      priority: task.priority,
      createdAt: task.created,
      messages: task.messages,
    }));
  } catch {
    return null;
  }
}
