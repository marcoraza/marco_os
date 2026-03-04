import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo, type ReactNode } from 'react';
import { OpenClawClient } from '../lib/openclaw';
import { OpenClawHttp } from '../lib/openclawHttp';
import type {
  ConnectionState,
  OpenClawConfig,
  AgentPresence,
  AgentRun,
  HeartbeatTick,
  CronJob,
  KanbanBoard,
  KanbanTask,
  KanbanStatus,
} from '../lib/openclawTypes';
import { getDefaultConfig } from '../lib/openclawTypes';

// Re-export mock data for fallback
import {
  agents as mockAgents,
  executions as mockExecutions,
  heartbeats as mockHeartbeats,
  cronJobs as mockCronJobs,
  kanbanTasks as mockKanbanTasks,
  tokenUsages as mockTokenUsages,
  memoryArtifacts as mockMemoryArtifacts,
  type Agent,
  type Execution,
  type HeartbeatEvent,
  type CronJob as MockCronJob,
  type KanbanTask as MockKanbanTask,
  type TokenUsage,
  type MemoryArtifact,
} from '../data/agentMockData';

// ─── CROSS-DOMAIN SUMMARY TYPE ──────────────────────────────────────────────

export interface CrossDomainSummary {
  dashboard: { total: number; done: number; inProgress: number };
  finance: { balance: string; monthExpenses: string };
  health: { energy: number; focus: number; sleep: string };
  planner: { activeMissions: number };
  crm: { hotContacts: number; pendingReconnect: number };
}

const defaultCrossDomain: CrossDomainSummary = {
  dashboard: { total: 15, done: 3, inProgress: 4 },
  finance: { balance: 'R$ 12.450', monthExpenses: 'R$ 3.280' },
  health: { energy: 78, focus: 85, sleep: '7h 20m' },
  planner: { activeMissions: 3 },
  crm: { hotContacts: 5, pendingReconnect: 2 },
};

// ─── CONTEXT TYPE ──────────────────────────────────────────────────────────

interface OpenClawContextType {
  // Connection
  connectionState: ConnectionState;
  isLive: boolean;
  connect: () => void;
  disconnect: () => void;

  // Agents (real-time presence or mock fallback)
  agents: Agent[];
  getAgentStatus: (agentId: string) => Agent | undefined;

  // Executions (agent runs)
  executions: Execution[];
  getExecutionsForAgent: (agentId: string) => Execution[];

  // Heartbeats
  heartbeats: HeartbeatEvent[];
  getHeartbeatsForAgent: (agentId: string) => HeartbeatEvent[];

  // Cron Jobs
  cronJobs: MockCronJob[];
  getCronJobsForAgent: (agentId: string) => MockCronJob[];

  // Cron Job Actions
  updateCronJob: (job: MockCronJob) => void;
  createCronJob: (job: Omit<MockCronJob, 'id'>) => void;
  deleteCronJob: (jobId: string) => void;

  // Kanban
  kanbanTasks: MockKanbanTask[];
  getTasksForAgent: (agentId: string) => MockKanbanTask[];
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<boolean>;

  // Token Usage
  tokenUsages: TokenUsage[];

  // Memory Artifacts
  memoryArtifacts: MemoryArtifact[];
  fetchMemoryContent: (path: string) => Promise<string>;

  // Cross-Domain
  crossDomainSummary: CrossDomainSummary;

  // Actions
  dispatch: (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => Promise<void>;
  dispatchMission: (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => Promise<boolean>;
  memorySearch: (query: string) => Promise<{ results: Array<{ path: string; snippet: string; score: number }> }>;
  memoryGet: (path: string) => Promise<{ content: string; path: string }>;

  // Cron API functions
  createCronJobApi: (job: { name: string; schedule: string; agentId?: string; message?: string; enabled?: boolean }) => Promise<boolean>;
  updateCronJobApi: (jobId: string, updates: { name?: string; schedule?: string; enabled?: boolean; message?: string }) => Promise<boolean>;
  deleteCronJobApi: (jobId: string) => Promise<boolean>;

  // Config API
  updateAgentConfig: (agentId: string, updates: { model?: string }) => Promise<boolean>;

  // HTTP client for direct tool invocations
  http: OpenClawHttp | null;
}

const OpenClawContext = createContext<OpenClawContextType | undefined>(undefined);

// ─── PROVIDER ──────────────────────────────────────────────────────────────

interface OpenClawProviderProps {
  children: ReactNode;
  config?: Partial<OpenClawConfig>;
  autoConnect?: boolean;
}

export function OpenClawProvider({ children, config: configOverride, autoConnect = true }: OpenClawProviderProps) {
  const config = useMemo(() => ({ ...getDefaultConfig(), ...configOverride }), [configOverride]);

  const clientRef = useRef<OpenClawClient | null>(null);
  const httpRef = useRef<OpenClawHttp | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const isLive = connectionState === 'connected';

  // Live data state (populated when connected)
  const [liveAgents, setLiveAgents] = useState<Agent[]>([]);
  const [liveExecutions, setLiveExecutions] = useState<Execution[]>([]);
  const [liveHeartbeats, setLiveHeartbeats] = useState<HeartbeatEvent[]>([]);
  const [liveCronJobs, setLiveCronJobs] = useState<MockCronJob[]>([]);
  const [liveKanbanTasks, setLiveKanbanTasks] = useState<MockKanbanTask[]>([]);
  const [liveTokenUsages, setLiveTokenUsages] = useState<TokenUsage[]>([]);
  const [liveMemory, setLiveMemory] = useState<MemoryArtifact[]>([]);

  // Use live data when available, mock data as final fallback
  const agents = liveAgents.length > 0 ? liveAgents : mockAgents;
  const executions = liveExecutions.length > 0 ? liveExecutions : mockExecutions;
  const heartbeats = liveHeartbeats.length > 0 ? liveHeartbeats : mockHeartbeats;
  const tokenUsages = liveTokenUsages.length > 0 ? liveTokenUsages : mockTokenUsages;
  // Cron jobs: live gateway > static JSON polling > mock fallback
  const cronJobs = liveCronJobs.length > 0 ? liveCronJobs : mockCronJobs;
  // Kanban: live gateway > static JSON polling > mock fallback
  const kanbanTasks = liveKanbanTasks.length > 0 ? liveKanbanTasks : mockKanbanTasks;

  // ─── INITIALIZE CLIENTS ─────────────────────────────────────────────────

  useEffect(() => {
    const client = new OpenClawClient(config);
    const http = new OpenClawHttp(config);

    clientRef.current = client;
    httpRef.current = http;

    // Track connection state
    const unsubState = client.onStateChange(setConnectionState);

    // Subscribe to gateway events
    const unsubPresence = client.on('presence', (payload) => {
      const presenceData = payload as Record<string, AgentPresence>;
      const agentList: Agent[] = Object.values(presenceData).map(p => ({
        id: p.agentId,
        name: p.name,
        role: (p.role || 'sub-agent') as Agent['role'],
        model: p.model,
        status: p.status,
        lastHeartbeat: p.lastHeartbeat || '',
        uptime: '',
        tags: [],
        icon: 'smart_toy',
        responseTime: p.latencyMs,
      }));
      if (agentList.length > 0) setLiveAgents(agentList);
    });

    const unsubTick = client.on('tick', (payload) => {
      const tick = payload as HeartbeatTick;
      setLiveHeartbeats(prev => {
        const filtered = prev.filter(h => h.agentId !== tick.agentId);
        return [{
          id: `hb-${tick.agentId}-${Date.now()}`,
          agentId: tick.agentId,
          agentName: tick.agentName,
          ts: tick.ts,
          latencyMs: tick.latencyMs,
          status: tick.status,
          note: tick.note,
        }, ...filtered].slice(0, 50);
      });
    });

    const unsubAgent = client.on('agent', (payload) => {
      const run = payload as AgentRun;
      setLiveExecutions(prev => {
        const existing = prev.findIndex(e => e.id === run.runId);
        const exec: Execution = {
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
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = exec;
          return next;
        }
        return [exec, ...prev].slice(0, 50);
      });
    });

    if (autoConnect) {
      client.connect();
    }

    return () => {
      unsubState();
      unsubPresence();
      unsubTick();
      unsubAgent();
      client.disconnect();
    };
  }, [config, autoConnect]);

  // ─── FETCH CRON JOBS ON CONNECT ──────────────────────────────────────────

  useEffect(() => {
    if (!isLive || !clientRef.current) return;

    clientRef.current.cronList()
      .then((result) => {
        const jobs = result as CronJob[];
        if (Array.isArray(jobs)) {
          setLiveCronJobs(jobs.map(j => ({
            id: j.id,
            name: j.name,
            schedule: j.schedule,
            lastRun: j.lastRun?.ts || '',
            nextRun: j.nextRun || '',
            status: j.lastRun?.status === 'ok' ? 'ok' as const
              : j.lastRun?.status === 'failed' ? 'failed' as const
              : j.enabled ? 'ok' as const : 'paused' as const,
            integration: 'OpenClaw',
            agentId: j.agentId,
          })));
        }
      })
      .catch(() => {
        // Fallback to mock data (already default)
      });
  }, [isLive]);

  // ─── CRON JOBS POLLING (same pattern as kanban) ────────────────────────────

  const cronVersionRef = useRef<string>('');

  const parseCronJson = useCallback((raw: string) => {
    try {
      const data = JSON.parse(raw) as { jobs: MockCronJob[] };
      if (!data.jobs?.length) return;
      setLiveCronJobs(data.jobs);
    } catch {
      // Invalid JSON — keep current state
    }
  }, []);

  useEffect(() => {
    if (isLive) return; // gateway handles it

    let cancelled = false;

    const poll = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${base}data/frank-crons.json`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const text = await res.text();
        if (text !== cronVersionRef.current) {
          cronVersionRef.current = text;
          parseCronJson(text);
        }
      } catch {
        // File not available — keep mock data
      }
    };

    poll();
    const interval = setInterval(poll, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, parseCronJson]);

  // ─── BRIDGE API POLLING (real data from Flask) ─────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

    if (!API_URL) return; // No API configured

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${API_TOKEN}`,
    };

    const pollAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/agents`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.agents?.length > 0) {
          setLiveAgents(data.agents);
        }
      } catch { /* keep current state */ }
    };

    const pollRuns = async () => {
      try {
        const res = await fetch(`${API_URL}/runs`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.runs) {
          setLiveExecutions(data.runs.map((r: any) => ({
            id: r.id,
            agentId: r.agentId,
            agentName: r.agentName,
            task: r.task,
            status: r.status,
            startedAt: r.startedAt,
            completedAt: r.completedAt,
            duration: r.duration,
            output: r.output,
            error: r.error,
          })));
        }
      } catch { /* keep current state */ }
    };

    const pollCrons = async () => {
      try {
        const res = await fetch(`${API_URL}/crons`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.crons?.length > 0) {
          setLiveCronJobs(data.crons);
        }
      } catch { /* keep current state */ }
    };

    const pollHeartbeats = async () => {
      try {
        const res = await fetch(`${API_URL}/heartbeats`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.heartbeats?.length > 0) {
          setLiveHeartbeats(data.heartbeats);
        }
      } catch { /* keep current */ }
    };

    const pollTokens = async () => {
      try {
        const res = await fetch(`${API_URL}/tokens`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.tokens?.length > 0) {
          setLiveTokenUsages(data.tokens.map((t: any) => ({
            agentId: t.agentId,
            model: t.model || 'unknown',
            totalTokensIn: t.totalIn || 0,
            totalTokensOut: t.totalOut || 0,
            todayTokensIn: t.todayIn || 0,
            todayTokensOut: t.todayOut || 0,
            estimatedCostUSD: t.estimatedCostUSD || 0,
            todayCostUSD: t.todayCostUSD || 0,
            last7Days: t.last7Days || [],
          })));
        }
      } catch { /* keep current */ }
    };

    const pollMemory = async () => {
      try {
        const res = await fetch(`${API_URL}/memory`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.memory?.length > 0) {
          setLiveMemory(data.memory);
        }
      } catch { /* keep current */ }
    };

    const pollTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/tasks`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.ok && data.tasks?.length > 0) {
          setLiveKanbanTasks(data.tasks.map((t: any) => ({
            id: t.id,
            agentId: t.agentId,
            title: t.title,
            status: t.status,
            priority: t.priority,
            createdAt: t.createdAt,
            deadline: t.deadline,
            tipo: t.tipo,
            responsavel: t.responsavel,
            contexto: t.contexto,
            tags: t.tags || [],
            notionUrl: t.notionUrl,
            messages: t.messages || [],
          })));
        }
      } catch { /* keep current */ }
    };

    const pollAll = () => {
      pollAgents();
      pollRuns();
      pollCrons();
      pollHeartbeats();
      pollTokens();
      pollMemory();
      pollTasks();
    };

    // Initial fetch immediately
    pollAll();
    // Then every 30 seconds
    const interval = setInterval(pollAll, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []); // Empty deps — run once on mount

  // ─── CRON JOB ACTIONS ─────────────────────────────────────────────────────

  const updateCronJob = useCallback((job: MockCronJob) => {
    setLiveCronJobs(prev => {
      const updated = prev.length > 0 ? [...prev] : [...mockCronJobs];
      const idx = updated.findIndex(j => j.id === job.id);
      if (idx >= 0) updated[idx] = job;
      return updated;
    });
  }, []);

  const createCronJob = useCallback((job: Omit<MockCronJob, 'id'>) => {
    const newJob: MockCronJob = { ...job, id: `cron-${Date.now()}` };
    setLiveCronJobs(prev => {
      const base = prev.length > 0 ? prev : [...mockCronJobs];
      return [...base, newJob];
    });
  }, []);

  const deleteCronJob = useCallback((jobId: string) => {
    setLiveCronJobs(prev => {
      const base = prev.length > 0 ? prev : [...mockCronJobs];
      return base.filter(j => j.id !== jobId);
    });
  }, []);

  // ─── KANBAN ACTIONS ──────────────────────────────────────────────────────

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: string): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.ok) {
        // Optimistic update
        setLiveKanbanTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));
        return true;
      }
      return false;
    } catch { return false; }
  }, []);

  // ─── KANBAN SYNC (hybrid: gateway → static JSON polling → mock) ──────────

  const parseBoardJson = useCallback((raw: string) => {
    try {
      const board = JSON.parse(raw) as KanbanBoard;
      if (!board.tasks?.length) return;
      setLiveKanbanTasks(board.tasks.map(t => ({
        id: t.id,
        agentId: t.agent,
        title: t.title,
        status: t.status,
        priority: t.priority,
        createdAt: t.created,
        messages: t.messages,
      })));
    } catch {
      // Invalid JSON — keep current state
    }
  }, []);

  // When gateway is live, fetch via /tools/invoke
  useEffect(() => {
    if (!isLive || !httpRef.current) return;
    httpRef.current.kanbanGet()
      .then(({ content }) => parseBoardJson(content))
      .catch(() => { /* fallback to polling or mock */ });
  }, [isLive, parseBoardJson]);

  // When gateway is offline, poll static frank-tasks.json every 5s
  const kanbanVersionRef = useRef<string>('');

  useEffect(() => {
    if (isLive) return; // gateway handles it

    let cancelled = false;

    const poll = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${base}data/frank-tasks.json`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const text = await res.text();
        if (text !== kanbanVersionRef.current) {
          kanbanVersionRef.current = text;
          parseBoardJson(text);
        }
      } catch {
        // File not available — keep mock data
      }
    };

    poll();
    const interval = setInterval(poll, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, parseBoardJson]);

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  const getAgentStatus = useCallback(
    (agentId: string) => agents.find(a => a.id === agentId),
    [agents]
  );

  const getExecutionsForAgent = useCallback(
    (agentId: string) => executions.filter(e => e.agentId === agentId),
    [executions]
  );

  const getHeartbeatsForAgent = useCallback(
    (agentId: string) => heartbeats.filter(h => h.agentId === agentId),
    [heartbeats]
  );

  const getCronJobsForAgent = useCallback(
    (agentId: string) => cronJobs.filter(j => j.agentId === agentId),
    [cronJobs]
  );

  const getTasksForAgent = useCallback(
    (agentId: string) => kanbanTasks.filter(t => t.agentId === agentId),
    [kanbanTasks]
  );

  // ─── ACTIONS ─────────────────────────────────────────────────────────────

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const dispatchMission = useCallback(async (agentId: string, message: string, priority?: 'high' | 'medium' | 'low'): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/dispatch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, message, priority: priority || 'medium' }),
      });
      const data = await res.json();
      return data.ok || false;
    } catch { return false; }
  }, []);

  const dispatch = useCallback(async (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    // Try API first when available
    if (API_URL) {
      await dispatchMission(agentId, message, priority);
      return;
    }
    // Fall back to gateway
    if (!clientRef.current?.isConnected()) {
      throw new Error('Não conectado ao OpenClaw');
    }
    const prefixedMessage = priority === 'high'
      ? `[URGENTE] ${message}`
      : priority === 'low'
      ? `[BAIXA PRIORIDADE] ${message}`
      : message;
    await clientRef.current.send(agentId, prefixedMessage);
  }, [dispatchMission]);

  const createCronJobApi = useCallback(async (job: { name: string; schedule: string; agentId?: string; message?: string; enabled?: boolean }): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/crons`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
      const data = await res.json();
      return data.ok || false;
    } catch { return false; }
  }, []);

  const updateCronJobApi = useCallback(async (jobId: string, updates: { name?: string; schedule?: string; enabled?: boolean; message?: string }): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/crons/${jobId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.ok || false;
    } catch { return false; }
  }, []);

  const deleteCronJobApi = useCallback(async (jobId: string): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/crons/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${API_TOKEN}` },
      });
      const data = await res.json();
      if (data.ok) {
        setLiveCronJobs(prev => prev.filter(j => j.id !== jobId));
      }
      return data.ok || false;
    } catch { return false; }
  }, []);

  const updateAgentConfig = useCallback(async (agentId: string, updates: { model?: string }): Promise<boolean> => {
    const API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!API_URL) return false;
    try {
      const res = await fetch(`${API_URL}/config`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${API_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, ...updates }),
      });
      const data = await res.json();
      return data.ok || false;
    } catch { return false; }
  }, []);

  const memorySearch = useCallback(async (query: string) => {
    if (!httpRef.current) throw new Error('HTTP client not available');
    return httpRef.current.memorySearch(query);
  }, []);

  const memoryGet = useCallback(async (path: string) => {
    if (!httpRef.current) throw new Error('HTTP client not available');
    return httpRef.current.memoryGet(path);
  }, []);

  // ─── FETCH MEMORY CONTENT ────────────────────────────────────────────────

  const fetchMemoryContent = useCallback(async (path: string): Promise<string> => {
    const _API_URL = import.meta.env.VITE_FORM_API_URL || '';
    const _API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';
    if (!_API_URL) return '';
    try {
      const res = await fetch(`${_API_URL}/memory/content?path=${encodeURIComponent(path)}`, {
        headers: { 'Authorization': `Bearer ${_API_TOKEN}` },
      });
      const data = await res.json();
      return data.ok ? data.content : '';
    } catch {
      return '';
    }
  }, []);

  // ─── CONTEXT VALUE ───────────────────────────────────────────────────────

  const value: OpenClawContextType = {
    connectionState,
    isLive,
    connect,
    disconnect,
    agents,
    getAgentStatus,
    executions,
    getExecutionsForAgent,
    heartbeats,
    getHeartbeatsForAgent,
    cronJobs,
    getCronJobsForAgent,
    updateCronJob,
    createCronJob,
    deleteCronJob,
    kanbanTasks,
    getTasksForAgent,
    updateTaskStatus,
    tokenUsages,
    memoryArtifacts: liveMemory.length > 0 ? liveMemory : mockMemoryArtifacts,
    fetchMemoryContent,
    crossDomainSummary: defaultCrossDomain,
    dispatch,
    dispatchMission,
    memorySearch,
    memoryGet,
    createCronJobApi,
    updateCronJobApi,
    deleteCronJobApi,
    updateAgentConfig,
    http: httpRef.current,
  };

  return (
    <OpenClawContext.Provider value={value}>
      {children}
    </OpenClawContext.Provider>
  );
}

// ─── HOOKS ─────────────────────────────────────────────────────────────────

export function useOpenClaw() {
  const context = useContext(OpenClawContext);
  if (!context) {
    throw new Error('useOpenClaw must be used within an OpenClawProvider');
  }
  return context;
}

/** Connection state + isLive flag */
export function useConnectionState() {
  const { connectionState, isLive, connect, disconnect } = useOpenClaw();
  return { connectionState, isLive, connect, disconnect };
}

/** All agents with real-time status */
export function useAgents() {
  const { agents, getAgentStatus } = useOpenClaw();
  return { agents, getAgentStatus };
}

/** Executions for a specific agent */
export function useExecutions(agentId?: string) {
  const { executions, getExecutionsForAgent } = useOpenClaw();
  if (agentId) return getExecutionsForAgent(agentId);
  return executions;
}

/** Heartbeats for a specific agent */
export function useHeartbeats(agentId?: string) {
  const { heartbeats, getHeartbeatsForAgent } = useOpenClaw();
  if (agentId) return getHeartbeatsForAgent(agentId);
  return heartbeats;
}

/** Cron jobs for a specific agent */
export function useCronJobs(agentId?: string) {
  const { cronJobs, getCronJobsForAgent } = useOpenClaw();
  if (agentId) return getCronJobsForAgent(agentId);
  return cronJobs;
}

/** Cron job mutation actions */
export function useCronJobActions() {
  const { updateCronJob, createCronJob, deleteCronJob } = useOpenClaw();
  return { updateCronJob, createCronJob, deleteCronJob };
}

/** Kanban tasks for a specific agent */
export function useKanban(agentId?: string) {
  const { kanbanTasks, getTasksForAgent } = useOpenClaw();
  if (agentId) return getTasksForAgent(agentId);
  return kanbanTasks;
}

/** Dispatch a mission to an agent */
export function useDispatch() {
  const { dispatch, isLive } = useOpenClaw();
  return { dispatch, isLive };
}

/** Token usage data */
export function useTokenUsages() {
  const { tokenUsages } = useOpenClaw();
  return tokenUsages;
}

/** Cross-domain summary */
export function useCrossDomain() {
  const { crossDomainSummary } = useOpenClaw();
  return crossDomainSummary;
}
