// ─── OPENCLAW PROTOCOL TYPES ───────────────────────────────────────────────

/** WebSocket frame types */
export interface WsRequest {
  type: 'req';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface WsResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { type: string; message: string };
}

export interface WsEvent {
  type: 'event';
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: number;
}

export type WsFrame = WsRequest | WsResponse | WsEvent;

/** Connect handshake */
export interface ConnectParams {
  protocol: number;
  client: { name: string; version: string };
  role: 'control';
  auth?: { token: string };
}

export interface ConnectResult {
  protocol: number;
  policy?: Record<string, unknown>;
}

// ─── GATEWAY DATA TYPES ───────────────────────────────────────────────────

export type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';
export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'pending';
export type KanbanStatus = 'backlog' | 'em-progresso' | 'revisao' | 'concluido';

/** Agent presence from system-presence event */
export interface AgentPresence {
  agentId: string;
  name: string;
  role: string;
  status: AgentStatus;
  model?: string;
  lastHeartbeat?: string;
  latencyMs?: number;
}

/** Execution run from agent events */
export interface AgentRun {
  runId: string;
  agentId: string;
  agentName: string;
  task: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  duration?: string;
  output?: string;
  error?: string;
  tokensIn?: number;
  tokensOut?: number;
}

/** Heartbeat tick event */
export interface HeartbeatTick {
  agentId: string;
  agentName: string;
  ts: string;
  latencyMs: number;
  status: 'ok' | 'late' | 'missed';
  note?: string;
}

/** Cron job from cron.list */
export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  kind: 'at' | 'every' | 'cron';
  agentId?: string;
  enabled: boolean;
  lastRun?: { ts: string; status: string };
  nextRun?: string;
}

/** Cron run history entry */
export interface CronRun {
  jobId: string;
  ts: string;
  status: 'ok' | 'failed' | 'timeout';
  duration?: string;
  output?: string;
}

/** Memory artifact from memory_search */
export interface MemorySearchResult {
  path: string;
  snippet: string;
  score: number;
  lineRange?: [number, number];
}

/** Memory file content from memory_get */
export interface MemoryFile {
  path: string;
  content: string;
  size: number;
}

// ─── KANBAN TYPES (workspace JSON convention) ──────────────────────────────

export interface KanbanTask {
  id: string;
  title: string;
  agent: string;
  status: KanbanStatus;
  priority: 'high' | 'medium' | 'low';
  created: string;
  updated?: string;
  messages: {
    id: string;
    content: string;
    timestamp: string;
    type: 'info' | 'success' | 'error' | 'progress';
  }[];
}

export interface KanbanBoard {
  version: number;
  updatedAt: string;
  tasks: KanbanTask[];
}

// ─── SESSION TYPES ─────────────────────────────────────────────────────────

export interface Session {
  key: string;
  agentId: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
}

// ─── CONNECTION STATE ──────────────────────────────────────────────────────

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface OpenClawConfig {
  host: string;
  port: number;
  token?: string;
  secure?: boolean;
}

export function getDefaultConfig(): OpenClawConfig {
  return {
    host: import.meta.env.VITE_OPENCLAW_HOST || '127.0.0.1',
    port: Number(import.meta.env.VITE_OPENCLAW_PORT) || 18789,
    token: import.meta.env.VITE_OPENCLAW_TOKEN || undefined,
    secure: import.meta.env.VITE_OPENCLAW_SECURE === 'true',
  };
}
