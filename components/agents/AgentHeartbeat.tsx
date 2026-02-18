import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { heartbeatBadge } from '../../data/agentMockData';
import { useHeartbeats, useAgents } from '../../contexts/OpenClawContext';

interface AgentHeartbeatProps {
  agentId: string;
}

export default function AgentHeartbeat({ agentId }: AgentHeartbeatProps) {
  const { agents } = useAgents();
  const agent = agents.find(a => a.id === agentId);
  const heartbeats = useHeartbeats(agent?.role === 'coordinator' ? undefined : agentId);

  const stats = useMemo(() => {
    const counts = { ok: 0, late: 0, missed: 0 };
    let totalLatency = 0;
    for (const hb of heartbeats) {
      counts[hb.status]++;
      totalLatency += hb.latencyMs;
    }
    const avgLatency = heartbeats.length > 0 ? Math.round(totalLatency / heartbeats.length) : 0;
    return { ...counts, avgLatency };
  }, [heartbeats]);

  if (heartbeats.length === 0) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="wifi_tethering">HEARTBEAT</SectionLabel>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="wifi_tethering" size="lg" />
            <span className="text-[11px]">Nenhum heartbeat registrado</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel icon="wifi_tethering">HEARTBEAT</SectionLabel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Heartbeat List */}
        <div className="xl:col-span-2 space-y-2">
          {heartbeats.map((hb) => {
            const badge = heartbeatBadge[hb.status];
            return (
              <Card key={hb.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-primary font-medium">{hb.agentName}</span>
                    <Badge variant={badge.variant} size="sm">
                      <Icon name={badge.icon} size="xs" />
                      {badge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-text-secondary">
                    <div className="flex items-center gap-1">
                      <Icon name="schedule" size="xs" />
                      <span className="font-mono">{hb.ts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="speed" size="xs" />
                      <span className="font-mono">{hb.latencyMs}ms</span>
                    </div>
                  </div>
                </div>
                {hb.note && (
                  <div className="mt-2 text-[10px] text-text-secondary italic">{hb.note}</div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: Stats Sidebar */}
        <div className="space-y-3">
          <Card className="p-4 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">SLO Target</span>
            <div className="bg-bg-base rounded p-2 text-center">
              <span className="text-[10px] font-mono text-brand-mint">&lt; 60s</span>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Status Atual</span>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="mint" glow />
                  <span className="text-[10px] text-text-secondary">OK</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.ok}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="orange" glow />
                  <span className="text-[10px] text-text-secondary">Atrasado</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.late}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="red" glow />
                  <span className="text-[10px] text-text-secondary">Perdido</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.missed}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">LATÊNCIA MÉDIA</span>
            <div className="text-sm font-mono text-text-primary">{stats.avgLatency}ms</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
