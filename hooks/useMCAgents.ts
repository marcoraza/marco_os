/**
 * Hook that polls the MC service for the live agent roster.
 *
 * Used by AppSidebar to display dynamic agent list with live status.
 * Returns agents sorted by status (busy first, then idle, then offline).
 */
import { useCallback, useRef } from 'react';
import { mcApi } from '../lib/mcApi';
import { useMissionControlStore, type MCAgent } from '../store/missionControl';
import { useMCPoll } from './useMCPoll';

const POLL_INTERVAL_MS = 10_000;

const STATUS_ORDER: Record<string, number> = {
  busy: 0,
  idle: 1,
  error: 2,
  offline: 3,
};

export function useMCAgents() {
  const agents = useMissionControlStore((s) => s.agents);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);

  // Stable fetch function that reads store directly, no deps that change
  const fetchAgents = useCallback(async () => {
    const store = useMissionControlStore.getState();
    try {
      const response = await mcApi.get<{ data: MCAgent[] } | MCAgent[]>('/api/agents');
      const list = Array.isArray(response) ? response : (response as { data: MCAgent[] }).data || [];
      const visible = list.filter((a) => !a.hidden);
      visible.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
      store.setAgents(visible);
      if (store.connectionStatus !== 'connected') store.setConnectionStatus('connected');
    } catch {
      // Don't override 'disconnected' with 'error' if we have mock data
      if (store.connectionStatus === 'connected') store.setConnectionStatus('error');
    }
  }, []);

  // Only poll when MC service is connected (don't poll when using mock data)
  const enabled = connectionStatus === 'connected';
  const refresh = useMCPoll(fetchAgents, POLL_INTERVAL_MS, { backoff: true, enabled });

  return { agents, refresh, connectionStatus };
}
