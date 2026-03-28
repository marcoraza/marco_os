/**
 * MissionControlProvider
 *
 * Wraps the agent section. Tests MC service health on mount.
 * Mock data is pre-seeded in the store initial state, so panels
 * render immediately without any useEffect state updates.
 */
import React, { useEffect, useRef, type ReactNode } from 'react';
import { mcApi } from '../lib/mcApi';
import { useMissionControlStore } from '../store/missionControl';

interface Props {
  children: ReactNode;
}

export function MissionControlProvider({ children }: Props) {
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    mcApi.healthy().then((ok) => {
      useMissionControlStore.getState().setConnectionStatus(ok ? 'connected' : 'disconnected');
    });
  }, []);

  return <>{children}</>;
}
