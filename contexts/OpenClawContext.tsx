import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getDefaultConfig } from '../lib/openclawTypes';
import {
  agents as mockAgents,
  executions as mockExecutions,
  heartbeats as mockHeartbeats,
  cronJobs as mockCronJobs,
  kanbanTasks as mockKanbanTasks,
  tokenUsages as mockTokenUsages,
  memoryArtifacts as mockMemoryArtifacts,
} from '../data/agentMockData';
import { useBridgeActions, useBridgePolling } from './openclaw/bridge';
import { useOpenClawGateway } from './openclaw/gateway';
import {
  defaultCrossDomain,
  type OpenClawContextType,
  type OpenClawProviderProps,
} from './openclaw/types';

export type { CrossDomainSummary } from './openclaw/types';

type ConnectionContextValue = Pick<OpenClawContextType, 'connectionState' | 'isLive' | 'connect' | 'disconnect'>;
type AgentsContextValue = Pick<OpenClawContextType, 'agents' | 'getAgentStatus'>;
type ExecutionsContextValue = Pick<OpenClawContextType, 'executions' | 'getExecutionsForAgent'>;
type HeartbeatsContextValue = Pick<OpenClawContextType, 'heartbeats' | 'getHeartbeatsForAgent'>;
type CronContextValue = Pick<OpenClawContextType, 'cronJobs' | 'getCronJobsForAgent' | 'updateCronJob' | 'createCronJob' | 'deleteCronJob'>;
type KanbanContextValue = Pick<OpenClawContextType, 'kanbanTasks' | 'getTasksForAgent' | 'updateTaskStatus'>;
type TokenUsageContextValue = Pick<OpenClawContextType, 'tokenUsages'>;
type MemoryContextValue = Pick<OpenClawContextType, 'memoryArtifacts' | 'fetchMemoryContent' | 'memorySearch' | 'memoryGet'>;
type ActionsContextValue = Pick<
  OpenClawContextType,
  | 'dispatch'
  | 'dispatchMission'
  | 'createCronJobApi'
  | 'updateCronJobApi'
  | 'deleteCronJobApi'
  | 'updateAgentConfig'
  | 'sendAgentMessage'
  | 'fetchStandup'
  | 'fetchActivities'
  | 'fetchTaskComments'
  | 'addTaskComment'
  | 'fetchGitHubIssues'
>;
type MetaContextValue = Pick<OpenClawContextType, 'crossDomainSummary' | 'http'>;

const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);
const AgentsContext = createContext<AgentsContextValue | undefined>(undefined);
const ExecutionsContext = createContext<ExecutionsContextValue | undefined>(undefined);
const HeartbeatsContext = createContext<HeartbeatsContextValue | undefined>(undefined);
const CronContext = createContext<CronContextValue | undefined>(undefined);
const KanbanContext = createContext<KanbanContextValue | undefined>(undefined);
const TokenUsageContext = createContext<TokenUsageContextValue | undefined>(undefined);
const MemoryContext = createContext<MemoryContextValue | undefined>(undefined);
const ActionsContext = createContext<ActionsContextValue | undefined>(undefined);
const MetaContext = createContext<MetaContextValue | undefined>(undefined);

function useRequiredContext<T>(context: React.Context<T | undefined>, name: string) {
  const value = useContext(context);
  if (!value) {
    throw new Error(`${name} must be used within an OpenClawProvider`);
  }
  return value;
}

export function OpenClawProvider({ children, config: configOverride, autoConnect = true }: OpenClawProviderProps) {
  const config = useMemo(() => ({ ...getDefaultConfig(), ...configOverride }), [configOverride]);

  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [liveAgents, setLiveAgents] = useState<typeof mockAgents>([]);
  const [liveExecutions, setLiveExecutions] = useState<typeof mockExecutions>([]);
  const [liveHeartbeats, setLiveHeartbeats] = useState<typeof mockHeartbeats>([]);
  const [liveCronJobs, setLiveCronJobs] = useState<typeof mockCronJobs>([]);
  const [liveKanbanTasks, setLiveKanbanTasks] = useState<typeof mockKanbanTasks>([]);
  const [liveTokenUsages, setLiveTokenUsages] = useState<typeof mockTokenUsages>([]);
  const [liveMemory, setLiveMemory] = useState<typeof mockMemoryArtifacts>([]);

  const isLive = connectionState === 'connected';

  const { clientRef, httpRef } = useOpenClawGateway({
    config,
    autoConnect,
    isLive,
    setConnectionState,
    setLiveAgents,
    setLiveExecutions,
    setLiveHeartbeats,
    setLiveCronJobs,
    setLiveKanbanTasks,
  });

  useBridgePolling({
    setLiveAgents,
    setLiveExecutions,
    setLiveCronJobs,
    setLiveHeartbeats,
    setLiveTokenUsages,
    setLiveMemory,
    setLiveKanbanTasks,
  });

  const {
    dispatchMission,
    updateTaskStatus,
    createCronJobApi,
    updateCronJobApi,
    deleteCronJobApi,
    updateAgentConfig,
    sendAgentMessage,
    fetchStandup,
    fetchActivities,
    fetchTaskComments,
    addTaskComment,
    fetchGitHubIssues,
    fetchMemoryContent,
    hasBridge,
  } = useBridgeActions(setLiveCronJobs, setLiveKanbanTasks);

  const agents = liveAgents.length > 0 ? liveAgents : mockAgents;
  const executions = liveExecutions.length > 0 ? liveExecutions : mockExecutions;
  const heartbeats = liveHeartbeats.length > 0 ? liveHeartbeats : mockHeartbeats;
  const cronJobs = liveCronJobs.length > 0 ? liveCronJobs : mockCronJobs;
  const kanbanTasks = liveKanbanTasks.length > 0 ? liveKanbanTasks : mockKanbanTasks;
  const tokenUsages = liveTokenUsages.length > 0 ? liveTokenUsages : mockTokenUsages;
  const memoryArtifacts = liveMemory.length > 0 ? liveMemory : mockMemoryArtifacts;

  const updateCronJob = useCallback((job: (typeof mockCronJobs)[number]) => {
    setLiveCronJobs((prev) => {
      const updated = prev.length > 0 ? [...prev] : [...mockCronJobs];
      const index = updated.findIndex((item) => item.id === job.id);
      if (index >= 0) updated[index] = job;
      return updated;
    });
  }, []);

  const createCronJob = useCallback((job: Omit<(typeof mockCronJobs)[number], 'id'>) => {
    const newJob = { ...job, id: `cron-${Date.now()}` };
    setLiveCronJobs((prev) => {
      const base = prev.length > 0 ? prev : [...mockCronJobs];
      return [...base, newJob];
    });
  }, []);

  const deleteCronJob = useCallback((jobId: string) => {
    setLiveCronJobs((prev) => {
      const base = prev.length > 0 ? prev : [...mockCronJobs];
      return base.filter((job) => job.id !== jobId);
    });
  }, []);

  const getAgentStatus = useCallback((agentId: string) => agents.find((agent) => agent.id === agentId), [agents]);
  const getExecutionsForAgent = useCallback((agentId: string) => executions.filter((execution) => execution.agentId === agentId), [executions]);
  const getHeartbeatsForAgent = useCallback((agentId: string) => heartbeats.filter((heartbeat) => heartbeat.agentId === agentId), [heartbeats]);
  const getCronJobsForAgent = useCallback((agentId: string) => cronJobs.filter((job) => job.agentId === agentId), [cronJobs]);
  const getTasksForAgent = useCallback((agentId: string) => kanbanTasks.filter((task) => task.agentId === agentId), [kanbanTasks]);

  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, [clientRef]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, [clientRef]);

  const dispatch = useCallback(async (agentId: string, message: string, priority?: 'high' | 'medium' | 'low') => {
    if (hasBridge) {
      await dispatchMission(agentId, message, priority);
      return;
    }
    if (!clientRef.current?.isConnected()) {
      throw new Error('Não conectado ao OpenClaw');
    }
    const prefixedMessage = priority === 'high'
      ? `[URGENTE] ${message}`
      : priority === 'low'
        ? `[BAIXA PRIORIDADE] ${message}`
        : message;
    await clientRef.current.send(agentId, prefixedMessage);
  }, [clientRef, dispatchMission, hasBridge]);

  const memorySearch = useCallback(async (query: string) => {
    if (!httpRef.current) throw new Error('HTTP client not available');
    return httpRef.current.memorySearch(query);
  }, [httpRef]);

  const memoryGet = useCallback(async (path: string) => {
    if (!httpRef.current) throw new Error('HTTP client not available');
    return httpRef.current.memoryGet(path);
  }, [httpRef]);

  const connectionValue = useMemo<ConnectionContextValue>(() => ({
    connectionState,
    isLive,
    connect,
    disconnect,
  }), [connectionState, isLive, connect, disconnect]);

  const agentsValue = useMemo<AgentsContextValue>(() => ({
    agents,
    getAgentStatus,
  }), [agents, getAgentStatus]);

  const executionsValue = useMemo<ExecutionsContextValue>(() => ({
    executions,
    getExecutionsForAgent,
  }), [executions, getExecutionsForAgent]);

  const heartbeatsValue = useMemo<HeartbeatsContextValue>(() => ({
    heartbeats,
    getHeartbeatsForAgent,
  }), [heartbeats, getHeartbeatsForAgent]);

  const cronValue = useMemo<CronContextValue>(() => ({
    cronJobs,
    getCronJobsForAgent,
    updateCronJob,
    createCronJob,
    deleteCronJob,
  }), [cronJobs, getCronJobsForAgent, updateCronJob, createCronJob, deleteCronJob]);

  const kanbanValue = useMemo<KanbanContextValue>(() => ({
    kanbanTasks,
    getTasksForAgent,
    updateTaskStatus,
  }), [kanbanTasks, getTasksForAgent, updateTaskStatus]);

  const tokenUsageValue = useMemo<TokenUsageContextValue>(() => ({
    tokenUsages,
  }), [tokenUsages]);

  const memoryValue = useMemo<MemoryContextValue>(() => ({
    memoryArtifacts,
    fetchMemoryContent,
    memorySearch,
    memoryGet,
  }), [memoryArtifacts, fetchMemoryContent, memorySearch, memoryGet]);

  const actionsValue = useMemo<ActionsContextValue>(() => ({
    dispatch,
    dispatchMission,
    createCronJobApi,
    updateCronJobApi,
    deleteCronJobApi,
    updateAgentConfig,
    sendAgentMessage,
    fetchStandup,
    fetchActivities,
    fetchTaskComments,
    addTaskComment,
    fetchGitHubIssues,
  }), [
    dispatch,
    dispatchMission,
    createCronJobApi,
    updateCronJobApi,
    deleteCronJobApi,
    updateAgentConfig,
    sendAgentMessage,
    fetchStandup,
    fetchActivities,
    fetchTaskComments,
    addTaskComment,
    fetchGitHubIssues,
  ]);

  const metaValue = useMemo<MetaContextValue>(() => ({
    crossDomainSummary: defaultCrossDomain,
    http: httpRef.current,
  }), [httpRef]);

  return (
    <ConnectionContext.Provider value={connectionValue}>
      <AgentsContext.Provider value={agentsValue}>
        <ExecutionsContext.Provider value={executionsValue}>
          <HeartbeatsContext.Provider value={heartbeatsValue}>
            <CronContext.Provider value={cronValue}>
              <KanbanContext.Provider value={kanbanValue}>
                <TokenUsageContext.Provider value={tokenUsageValue}>
                  <MemoryContext.Provider value={memoryValue}>
                    <ActionsContext.Provider value={actionsValue}>
                      <MetaContext.Provider value={metaValue}>
                        {children}
                      </MetaContext.Provider>
                    </ActionsContext.Provider>
                  </MemoryContext.Provider>
                </TokenUsageContext.Provider>
              </KanbanContext.Provider>
            </CronContext.Provider>
          </HeartbeatsContext.Provider>
        </ExecutionsContext.Provider>
      </AgentsContext.Provider>
    </ConnectionContext.Provider>
  );
}

export function useOpenClaw() {
  const connection = useRequiredContext(ConnectionContext, 'useOpenClaw');
  const agents = useRequiredContext(AgentsContext, 'useOpenClaw');
  const executions = useRequiredContext(ExecutionsContext, 'useOpenClaw');
  const heartbeats = useRequiredContext(HeartbeatsContext, 'useOpenClaw');
  const cron = useRequiredContext(CronContext, 'useOpenClaw');
  const kanban = useRequiredContext(KanbanContext, 'useOpenClaw');
  const tokenUsages = useRequiredContext(TokenUsageContext, 'useOpenClaw');
  const memory = useRequiredContext(MemoryContext, 'useOpenClaw');
  const actions = useRequiredContext(ActionsContext, 'useOpenClaw');
  const meta = useRequiredContext(MetaContext, 'useOpenClaw');

  return useMemo<OpenClawContextType>(() => ({
    ...connection,
    ...agents,
    ...executions,
    ...heartbeats,
    ...cron,
    ...kanban,
    ...tokenUsages,
    ...memory,
    ...actions,
    ...meta,
  }), [connection, agents, executions, heartbeats, cron, kanban, tokenUsages, memory, actions, meta]);
}

export function useConnectionState() {
  return useRequiredContext(ConnectionContext, 'useConnectionState');
}

export function useAgents() {
  return useRequiredContext(AgentsContext, 'useAgents');
}

export function useExecutions(agentId?: string) {
  const { executions, getExecutionsForAgent } = useRequiredContext(ExecutionsContext, 'useExecutions');
  if (agentId) return getExecutionsForAgent(agentId);
  return executions;
}

export function useHeartbeats(agentId?: string) {
  const { heartbeats, getHeartbeatsForAgent } = useRequiredContext(HeartbeatsContext, 'useHeartbeats');
  if (agentId) return getHeartbeatsForAgent(agentId);
  return heartbeats;
}

export function useCronJobs(agentId?: string) {
  const { cronJobs, getCronJobsForAgent } = useRequiredContext(CronContext, 'useCronJobs');
  if (agentId) return getCronJobsForAgent(agentId);
  return cronJobs;
}

export function useCronJobActions() {
  const { updateCronJob, createCronJob, deleteCronJob } = useRequiredContext(CronContext, 'useCronJobActions');
  return { updateCronJob, createCronJob, deleteCronJob };
}

export function useKanban(agentId?: string) {
  const { kanbanTasks, getTasksForAgent } = useRequiredContext(KanbanContext, 'useKanban');
  if (agentId) return getTasksForAgent(agentId);
  return kanbanTasks;
}

export function useKanbanActions() {
  const { updateTaskStatus } = useRequiredContext(KanbanContext, 'useKanbanActions');
  return { updateTaskStatus };
}

export function useDispatch() {
  const { dispatch } = useRequiredContext(ActionsContext, 'useDispatch');
  const { isLive } = useRequiredContext(ConnectionContext, 'useDispatch');
  return { dispatch, isLive };
}

export function useOpenClawActions() {
  return useRequiredContext(ActionsContext, 'useOpenClawActions');
}

export function useOpenClawMeta() {
  return useRequiredContext(MetaContext, 'useOpenClawMeta');
}

export function useTokenUsages() {
  const { tokenUsages } = useRequiredContext(TokenUsageContext, 'useTokenUsages');
  return tokenUsages;
}

export function useCrossDomain() {
  const { crossDomainSummary } = useRequiredContext(MetaContext, 'useCrossDomain');
  return crossDomainSummary;
}

export function useMemory() {
  return useRequiredContext(MemoryContext, 'useMemory');
}
