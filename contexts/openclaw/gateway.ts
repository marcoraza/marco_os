import { useCallback, useEffect, useRef } from 'react';
import { OpenClawClient } from '../../lib/openclaw';
import { OpenClawHttp } from '../../lib/openclawHttp';
import type {
  AgentPresence,
  AgentRun,
  ConnectionState,
  CronJob,
  HeartbeatTick,
  OpenClawConfig,
} from '../../lib/openclawTypes';
import type {
  Agent,
  CronJob as MockCronJob,
  Execution,
  HeartbeatEvent,
  KanbanTask as MockKanbanTask,
} from '../../data/agentMockData';
import { mapGatewayCronJobs, mapPresenceToAgents, mapRunToExecution, mapTickToHeartbeatEvent, parseBoardJson, parseCronJson } from './mappers';

interface GatewaySyncParams {
  config: OpenClawConfig;
  autoConnect: boolean;
  isLive: boolean;
  setConnectionState: React.Dispatch<React.SetStateAction<ConnectionState>>;
  setLiveAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setLiveExecutions: React.Dispatch<React.SetStateAction<Execution[]>>;
  setLiveHeartbeats: React.Dispatch<React.SetStateAction<HeartbeatEvent[]>>;
  setLiveCronJobs: React.Dispatch<React.SetStateAction<MockCronJob[]>>;
  setLiveKanbanTasks: React.Dispatch<React.SetStateAction<MockKanbanTask[]>>;
}

export function useOpenClawGateway({
  config,
  autoConnect,
  isLive,
  setConnectionState,
  setLiveAgents,
  setLiveExecutions,
  setLiveHeartbeats,
  setLiveCronJobs,
  setLiveKanbanTasks,
}: GatewaySyncParams) {
  const clientRef = useRef<OpenClawClient | null>(null);
  const httpRef = useRef<OpenClawHttp | null>(null);
  const cronVersionRef = useRef('');
  const kanbanVersionRef = useRef('');

  useEffect(() => {
    const client = new OpenClawClient(config);
    const http = new OpenClawHttp(config);

    clientRef.current = client;
    httpRef.current = http;

    const unsubState = client.onStateChange(setConnectionState);
    const unsubPresence = client.on('presence', (payload) => {
      const agents = mapPresenceToAgents(payload as Record<string, AgentPresence>);
      if (agents.length > 0) {
        setLiveAgents(agents);
      }
    });

    const unsubTick = client.on('tick', (payload) => {
      const tick = mapTickToHeartbeatEvent(payload as HeartbeatTick);
      setLiveHeartbeats((prev) => {
        const filtered = prev.filter((heartbeat) => heartbeat.agentId !== tick.agentId);
        return [tick, ...filtered].slice(0, 50);
      });
    });

    const unsubAgent = client.on('agent', (payload) => {
      const execution = mapRunToExecution(payload as AgentRun);
      setLiveExecutions((prev) => {
        const existing = prev.findIndex((item) => item.id === execution.id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = execution;
          return next;
        }
        return [execution, ...prev].slice(0, 50);
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
  }, [autoConnect, config, setConnectionState, setLiveAgents, setLiveExecutions, setLiveHeartbeats]);

  useEffect(() => {
    if (!isLive || !clientRef.current) return;

    clientRef.current.cronList()
      .then((result) => {
        const jobs = result as CronJob[];
        if (Array.isArray(jobs)) {
          setLiveCronJobs(mapGatewayCronJobs(jobs));
        }
      })
      .catch(() => {
        return;
      });
  }, [isLive, setLiveCronJobs]);

  useEffect(() => {
    if (isLive) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/frank-crons.json`, { cache: 'no-store' });
        if (!response.ok || cancelled) return;
        const text = await response.text();
        if (text !== cronVersionRef.current) {
          cronVersionRef.current = text;
          const jobs = parseCronJson(text);
          if (jobs) {
            setLiveCronJobs(jobs);
          }
        }
      } catch {
        return;
      }
    };

    void poll();
    const interval = setInterval(poll, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, setLiveCronJobs]);

  const parseBoard = useCallback((raw: string) => {
    const tasks = parseBoardJson(raw);
    if (tasks) {
      setLiveKanbanTasks(tasks);
    }
  }, [setLiveKanbanTasks]);

  useEffect(() => {
    if (!isLive || !httpRef.current) return;
    httpRef.current.kanbanGet()
      .then(({ content }) => parseBoard(content))
      .catch(() => {});
  }, [isLive, parseBoard]);

  useEffect(() => {
    if (isLive) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/frank-tasks.json`, { cache: 'no-store' });
        if (!response.ok || cancelled) return;
        const text = await response.text();
        if (text !== kanbanVersionRef.current) {
          kanbanVersionRef.current = text;
          parseBoard(text);
        }
      } catch {
        return;
      }
    };

    void poll();
    const interval = setInterval(poll, 5_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLive, parseBoard]);

  return { clientRef, httpRef };
}
