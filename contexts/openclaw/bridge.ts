import { useCallback, useEffect } from 'react';
import type {
  Agent,
  CronJob as MockCronJob,
  Execution,
  HeartbeatEvent,
  KanbanTask as MockKanbanTask,
  MemoryArtifact,
  TokenUsage,
} from '../../data/agentMockData';
import { mapBridgeRuns, mapBridgeTasks, mapBridgeTokens } from './mappers';

function getBridgeBase() {
  return import.meta.env.VITE_FORM_API_URL || '';
}

function getBridgeToken() {
  return import.meta.env.VITE_FORM_API_TOKEN || '';
}

function createBridgeHeaders(withJson = false): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getBridgeToken()}`,
  };
  if (withJson) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function fetchBridge(path: string, init?: RequestInit) {
  const bridgeBase = getBridgeBase();
  if (!bridgeBase) return null;
  const response = await fetch(`${bridgeBase}${path}`, init);
  if (!response.ok) return null;
  return response.json();
}

interface BridgePollingParams {
  setLiveAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  setLiveExecutions: React.Dispatch<React.SetStateAction<Execution[]>>;
  setLiveCronJobs: React.Dispatch<React.SetStateAction<MockCronJob[]>>;
  setLiveHeartbeats: React.Dispatch<React.SetStateAction<HeartbeatEvent[]>>;
  setLiveTokenUsages: React.Dispatch<React.SetStateAction<TokenUsage[]>>;
  setLiveMemory: React.Dispatch<React.SetStateAction<MemoryArtifact[]>>;
  setLiveKanbanTasks: React.Dispatch<React.SetStateAction<MockKanbanTask[]>>;
}

export function useBridgePolling({
  setLiveAgents,
  setLiveExecutions,
  setLiveCronJobs,
  setLiveHeartbeats,
  setLiveTokenUsages,
  setLiveMemory,
  setLiveKanbanTasks,
}: BridgePollingParams) {
  useEffect(() => {
    let cancelled = false;
    if (!getBridgeBase()) return;

    const headers = createBridgeHeaders();

    const pollAgents = async () => {
      try {
        const data = await fetchBridge('/agents', { headers });
        if (!data?.ok || !data.agents?.length || cancelled) return;
        setLiveAgents(data.agents);
      } catch {
        return;
      }
    };

    const pollRuns = async () => {
      try {
        const data = await fetchBridge('/runs', { headers });
        if (!data?.ok || !data.runs || cancelled) return;
        setLiveExecutions(mapBridgeRuns(data.runs));
      } catch {
        return;
      }
    };

    const pollCrons = async () => {
      try {
        const data = await fetchBridge('/crons', { headers });
        if (!data?.ok || !data.crons?.length || cancelled) return;
        setLiveCronJobs(data.crons);
      } catch {
        return;
      }
    };

    const pollHeartbeats = async () => {
      try {
        const data = await fetchBridge('/heartbeats', { headers });
        if (!data?.ok || !data.heartbeats?.length || cancelled) return;
        setLiveHeartbeats(data.heartbeats);
      } catch {
        return;
      }
    };

    const pollTokens = async () => {
      try {
        const data = await fetchBridge('/tokens', { headers });
        if (!data?.ok || !data.tokens?.length || cancelled) return;
        setLiveTokenUsages(mapBridgeTokens(data.tokens));
      } catch {
        return;
      }
    };

    const pollMemory = async () => {
      try {
        const data = await fetchBridge('/memory', { headers });
        if (!data?.ok || !data.memory?.length || cancelled) return;
        setLiveMemory(data.memory);
      } catch {
        return;
      }
    };

    const pollTasks = async () => {
      try {
        const data = await fetchBridge('/tasks', { headers });
        if (!data?.ok || !data.tasks?.length || cancelled) return;
        setLiveKanbanTasks(mapBridgeTasks(data.tasks));
      } catch {
        return;
      }
    };

    const pollAll = () => {
      void pollAgents();
      void pollRuns();
      void pollCrons();
      void pollHeartbeats();
      void pollTokens();
      void pollMemory();
      void pollTasks();
    };

    pollAll();
    const interval = setInterval(pollAll, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setLiveAgents, setLiveExecutions, setLiveCronJobs, setLiveHeartbeats, setLiveTokenUsages, setLiveMemory, setLiveKanbanTasks]);
}

export function useBridgeActions(setLiveCronJobs: React.Dispatch<React.SetStateAction<MockCronJob[]>>, setLiveKanbanTasks: React.Dispatch<React.SetStateAction<MockKanbanTask[]>>) {
  const updateTaskStatus = useCallback(async (taskId: string, newStatus: string): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge(`/tasks/${taskId}`, {
        method: 'PATCH',
        headers: createBridgeHeaders(true),
        body: JSON.stringify({ status: newStatus }),
      });
      if (data?.ok) {
        setLiveKanbanTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus as any } : task)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setLiveKanbanTasks]);

  const dispatchMission = useCallback(async (agentId: string, message: string, priority?: 'high' | 'medium' | 'low'): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge('/dispatch', {
        method: 'POST',
        headers: createBridgeHeaders(true),
        body: JSON.stringify({ agentId, message, priority: priority || 'medium' }),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const createCronJobApi = useCallback(async (job: { name: string; schedule: string; agentId?: string; message?: string; enabled?: boolean }): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge('/crons', {
        method: 'POST',
        headers: createBridgeHeaders(true),
        body: JSON.stringify(job),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const updateCronJobApi = useCallback(async (jobId: string, updates: { name?: string; schedule?: string; enabled?: boolean; message?: string }): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge(`/crons/${jobId}`, {
        method: 'PATCH',
        headers: createBridgeHeaders(true),
        body: JSON.stringify(updates),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const deleteCronJobApi = useCallback(async (jobId: string): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge(`/crons/${jobId}`, {
        method: 'DELETE',
        headers: createBridgeHeaders(),
      });
      if (data?.ok) {
        setLiveCronJobs((prev) => prev.filter((job) => job.id !== jobId));
      }
      return data?.ok || false;
    } catch {
      return false;
    }
  }, [setLiveCronJobs]);

  const updateAgentConfig = useCallback(async (agentId: string, updates: { model?: string }): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge('/config', {
        method: 'PATCH',
        headers: createBridgeHeaders(true),
        body: JSON.stringify({ agentId, ...updates }),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const sendAgentMessage = useCallback(async (agentId: string, message: string): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge('/chat', {
        method: 'POST',
        headers: createBridgeHeaders(true),
        body: JSON.stringify({ agentId, message }),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const fetchStandup = useCallback(async (): Promise<any> => {
    if (!getBridgeBase()) return null;
    try {
      const data = await fetchBridge('/standup', { headers: createBridgeHeaders() });
      return data?.ok ? (data.data ?? data) : null;
    } catch {
      return null;
    }
  }, []);

  const fetchActivities = useCallback(async (limit = 30): Promise<any[]> => {
    if (!getBridgeBase()) return [];
    try {
      const data = await fetchBridge(`/activities?limit=${limit}`, { headers: createBridgeHeaders() });
      const list = data?.ok ? (data.activities ?? data.data ?? []) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, []);

  const fetchTaskComments = useCallback(async (taskId: string): Promise<any[]> => {
    if (!getBridgeBase()) return [];
    try {
      const data = await fetchBridge(`/tasks/${taskId}/comments`, { headers: createBridgeHeaders() });
      const list = data?.ok ? (data.comments ?? data.data ?? []) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, []);

  const addTaskComment = useCallback(async (taskId: string, text: string): Promise<boolean> => {
    if (!getBridgeBase()) return false;
    try {
      const data = await fetchBridge(`/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: createBridgeHeaders(true),
        body: JSON.stringify({ text }),
      });
      return data?.ok || false;
    } catch {
      return false;
    }
  }, []);

  const fetchGitHubIssues = useCallback(async (): Promise<any[]> => {
    if (!getBridgeBase()) return [];
    try {
      const data = await fetchBridge('/github/issues', { headers: createBridgeHeaders() });
      const list = data?.ok ? (data.issues ?? data.data ?? []) : [];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }, []);

  const fetchMemoryContent = useCallback(async (path: string): Promise<string> => {
    if (!getBridgeBase()) return '';
    try {
      const data = await fetchBridge(`/memory/content?path=${encodeURIComponent(path)}`, {
        headers: createBridgeHeaders(),
      });
      return data?.ok ? data.content : '';
    } catch {
      return '';
    }
  }, []);

  return {
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
    hasBridge: Boolean(getBridgeBase()),
  };
}
