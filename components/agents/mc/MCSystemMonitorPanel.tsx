/**
 * MCSystemMonitorPanel
 *
 * Compact health overview of the MC service and connected systems.
 * Shows uptime, db size, agent/session counts, service status dots.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore } from '../../../store/missionControl';
import { useMCPoll } from '../../../hooks/useMCPoll';

interface SystemStatus {
  uptime?: number;
  version?: string;
  dbSize?: number;
  agentCount?: number;
  sessionCount?: number;
  taskCount?: number;
  gateway?: { connected: boolean; url?: string };
  bridge?: { configured: boolean; healthy?: boolean; url?: string };
  memory?: { totalFiles?: number; totalSize?: number };
}

function formatUptime(seconds?: number): string {
  if (!seconds) return '--';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '--';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function MetricCard({ icon, label, value, subtitle, color }: {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={icon} size="xs" className={color || 'text-text-secondary'} />
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{label}</span>
      </div>
      <div className={cn('text-sm font-black font-mono', color || 'text-text-primary')}>{value}</div>
      {subtitle && <div className="text-[8px] font-mono text-text-secondary mt-0.5">{subtitle}</div>}
    </div>
  );
}

function ServiceRow({ name, icon, connected, url }: {
  name: string;
  icon: string;
  connected: boolean;
  url?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-brand-mint' : 'bg-text-secondary')} />
        <Icon name={icon} size="xs" className="text-text-secondary" />
        <span className="text-[10px] font-bold text-text-primary">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        {url && <span className="text-[8px] font-mono text-text-secondary truncate max-w-[150px]">{url}</span>}
        <span className={cn(
          'text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm',
          connected ? 'text-brand-mint border-brand-mint/30' : 'text-text-secondary border-border-panel',
        )}>
          {connected ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

export function MCSystemMonitorPanel() {
  const agents = useMissionControlStore((s) => s.agents);
  const sessions = useMissionControlStore((s) => s.sessions);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const [status, setStatus] = useState<SystemStatus>({});
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, monitorRes] = await Promise.allSettled([
        mcApi.get<Record<string, unknown>>('/api/status'),
        mcApi.get<Record<string, unknown>>('/api/system-monitor'),
      ]);

      const s: SystemStatus = {};

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        const d = statusRes.value as Record<string, unknown>;
        s.version = d.version as string | undefined;
        s.uptime = d.uptime as number | undefined;
      }

      if (monitorRes.status === 'fulfilled' && monitorRes.value) {
        const d = monitorRes.value as Record<string, unknown>;
        s.dbSize = d.dbSize as number | undefined;
        s.agentCount = d.agentCount as number | undefined;
        s.sessionCount = d.sessionCount as number | undefined;
        s.taskCount = d.taskCount as number | undefined;
        if (d.gateway) s.gateway = d.gateway as SystemStatus['gateway'];
        if (d.bridge) s.bridge = d.bridge as SystemStatus['bridge'];
        if (d.memory) s.memory = d.memory as SystemStatus['memory'];
      }

      setStatus(s);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useMCPoll(fetchStatus, 30_000);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-border-panel animate-pulse rounded-sm h-16" />
          ))}
        </div>
        <div className="bg-border-panel animate-pulse rounded-sm h-32" />
      </div>
    );
  }

  const mcConnected = connectionStatus === 'connected';

  return (
    <div className="space-y-3">
      {/* Metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          icon="timer"
          label="Uptime"
          value={formatUptime(status.uptime)}
          subtitle={status.version ? `v${status.version}` : undefined}
          color="text-brand-mint"
        />
        <MetricCard
          icon="storage"
          label="Database"
          value={formatBytes(status.dbSize)}
        />
        <MetricCard
          icon="smart_toy"
          label="Agentes"
          value={String(status.agentCount ?? agents.length)}
          subtitle={`${agents.filter(a => a.status === 'idle' || a.status === 'busy').length} ativos`}
        />
        <MetricCard
          icon="terminal"
          label="Sessoes"
          value={String(status.sessionCount ?? sessions.length)}
        />
      </div>

      {/* Services */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
          Servicos
        </div>
        <div className="divide-y divide-border-panel/50">
          <ServiceRow name="MC Service" icon="dns" connected={mcConnected} url={mcApi.baseUrl()} />
          <ServiceRow
            name="Gateway OpenClaw"
            icon="hub"
            connected={status.gateway?.connected ?? false}
            url={status.gateway?.url}
          />
          <ServiceRow
            name="Bridge Marco OS"
            icon="sync_alt"
            connected={status.bridge?.healthy ?? false}
            url={status.bridge?.url}
          />
        </div>
      </div>

      {/* Tasks + Memory summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Tasks</div>
          <div className="text-sm font-black font-mono text-text-primary">{status.taskCount ?? '--'}</div>
          <div className="text-[8px] font-mono text-text-secondary">registradas</div>
        </div>
        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Memory</div>
          <div className="text-sm font-black font-mono text-text-primary">{status.memory?.totalFiles ?? '--'}</div>
          <div className="text-[8px] font-mono text-text-secondary">
            arquivos {status.memory?.totalSize ? `(${formatBytes(status.memory.totalSize)})` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
