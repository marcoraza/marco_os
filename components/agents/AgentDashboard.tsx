import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import type { Agent } from '../../types/agents';

interface DashboardExecution {
  id: string;
  agentName: string;
  task: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
}

interface DashboardDispatch {
  agentId: string;
  mission: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface AgentDashboardProps {
  agents: Agent[];
  executions: DashboardExecution[];
  recentDispatches: DashboardDispatch[];
}

const statusPalette = {
  online: { badge: 'mint' as const, bar: 'bg-brand-mint', panel: 'border-brand-mint/20 bg-brand-mint/[0.06]', icon: 'wifi_tethering' },
  busy: { badge: 'orange' as const, bar: 'bg-accent-orange', panel: 'border-accent-orange/20 bg-accent-orange/[0.06]', icon: 'autorenew' },
  idle: { badge: 'blue' as const, bar: 'bg-accent-blue', panel: 'border-accent-blue/20 bg-accent-blue/[0.06]', icon: 'schedule' },
  offline: { badge: 'red' as const, bar: 'bg-accent-red', panel: 'border-accent-red/20 bg-accent-red/[0.06]', icon: 'wifi_off' },
};

function parseUptimeDays(uptime?: string) {
  if (!uptime) return 0;
  const daysMatch = uptime.match(/(\d+)\s*d/i);
  if (daysMatch) return Number(daysMatch[1]);
  const hoursMatch = uptime.match(/(\d+)\s*h/i);
  if (hoursMatch) return Number(hoursMatch[1]) / 24;
  return 0;
}

export default function AgentDashboard({ agents, executions, recentDispatches }: AgentDashboardProps) {
  const stats = useMemo(() => {
    const total = agents.length;
    const online = agents.filter((agent) => agent.status === 'online').length;
    const busy = agents.filter((agent) => agent.status === 'busy').length;
    const idle = agents.filter((agent) => agent.status === 'idle').length;
    const offline = agents.filter((agent) => agent.status === 'offline').length;
    const averageUptimeDays =
      agents.reduce((sum, agent) => sum + parseUptimeDays(agent.uptime), 0) / Math.max(total, 1);

    return { total, online, busy, idle, offline, averageUptimeDays };
  }, [agents]);

  const distribution = useMemo(() => {
    const series = [
      { label: 'Online', value: stats.online, key: 'online' as const },
      { label: 'Busy', value: stats.busy, key: 'busy' as const },
      { label: 'Idle', value: stats.idle, key: 'idle' as const },
      { label: 'Offline', value: stats.offline, key: 'offline' as const },
    ];
    const maxValue = Math.max(1, ...series.map((item) => item.value));
    return series.map((item) => ({
      ...item,
      width: `${(item.value / maxValue) * 100}%`,
      percentage: `${Math.round((item.value / Math.max(stats.total, 1)) * 100)}%`,
      ...statusPalette[item.key],
    }));
  }, [stats]);

  const performance = useMemo(() => {
    const executionMap = new Map<string, { running: number; completed: number; failed: number }>();

    for (const execution of executions) {
      const current = executionMap.get(execution.agentName) ?? { running: 0, completed: 0, failed: 0 };
      if (execution.status === 'running') current.running += 1;
      if (execution.status === 'completed') current.completed += 1;
      if (execution.status === 'failed') current.failed += 1;
      executionMap.set(execution.agentName, current);
    }

    return [...agents]
      .map((agent) => ({
        agent,
        executionSummary: executionMap.get(agent.name) ?? { running: 0, completed: 0, failed: 0 },
      }))
      .sort((left, right) => {
        const weight = { busy: 0, online: 1, idle: 2, offline: 3 };
        return weight[left.agent.status] - weight[right.agent.status];
      });
  }, [agents, executions]);

  const activity = useMemo(() => {
    const dispatchItems = recentDispatches.map((dispatch) => {
      const agent = agents.find((item) => item.id === dispatch.agentId);
      return {
        id: `dispatch-${dispatch.agentId}-${dispatch.createdAt}-${dispatch.mission}`,
        time: dispatch.createdAt,
        title: dispatch.mission,
        subtitle: `Dispatch para ${agent?.name ?? dispatch.agentId}`,
        icon: dispatch.priority === 'high' ? 'rocket_launch' : dispatch.priority === 'medium' ? 'send' : 'playlist_add',
        tone: dispatch.priority === 'high' ? 'text-accent-red' : dispatch.priority === 'medium' ? 'text-brand-mint' : 'text-accent-blue',
      };
    });

    const executionItems = executions.map((execution) => ({
      id: `execution-${execution.id}`,
      time: execution.completedAt ?? execution.startedAt,
      title: execution.task,
      subtitle: `${execution.agentName} · ${execution.status}`,
      icon:
        execution.status === 'completed'
          ? 'check_circle'
          : execution.status === 'failed'
            ? 'error'
            : execution.status === 'running'
              ? 'autorenew'
              : 'pending',
      tone:
        execution.status === 'completed'
          ? 'text-brand-mint'
          : execution.status === 'failed'
            ? 'text-accent-red'
            : execution.status === 'running'
              ? 'text-accent-orange'
              : 'text-text-secondary',
    }));

    return [...dispatchItems, ...executionItems].slice(0, 6);
  }, [agents, executions, recentDispatches]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="p-4 border border-brand-mint/20 bg-brand-mint/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Agentes Online</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{stats.online}</p>
            </div>
            <div className="size-10 rounded-md border border-brand-mint/20 bg-brand-mint/10 flex items-center justify-center text-brand-mint">
              <Icon name="wifi_tethering" size="md" />
            </div>
          </div>
          <p className="mt-2 text-[9px] text-text-secondary">{Math.round((stats.online / Math.max(stats.total, 1)) * 100)}% do roster</p>
        </Card>

        <Card className="p-4 border border-accent-orange/20 bg-accent-orange/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Busy</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{stats.busy}</p>
            </div>
            <div className="size-10 rounded-md border border-accent-orange/20 bg-accent-orange/10 flex items-center justify-center text-accent-orange">
              <Icon name="autorenew" size="md" />
            </div>
          </div>
          <p className="mt-2 text-[9px] text-text-secondary">Execuções ou missões em andamento</p>
        </Card>

        <Card className="p-4 border border-accent-blue/20 bg-accent-blue/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Disponíveis</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{stats.idle}</p>
            </div>
            <div className="size-10 rounded-md border border-accent-blue/20 bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <Icon name="schedule" size="md" />
            </div>
          </div>
          <p className="mt-2 text-[9px] text-text-secondary">Prontos para receber novas missões</p>
        </Card>

        <Card className="p-4 border border-accent-purple/20 bg-accent-purple/[0.05]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Uptime Médio</p>
              <p className="mt-1 text-2xl font-black text-text-primary">{stats.averageUptimeDays.toFixed(1)}d</p>
            </div>
            <div className="size-10 rounded-md border border-accent-purple/20 bg-accent-purple/10 flex items-center justify-center text-accent-purple">
              <Icon name="trending_up" size="md" />
            </div>
          </div>
          <p className="mt-2 text-[9px] text-text-secondary">Média estimada do roster atual</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.95fr] gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <SectionLabel icon="dashboard">STATUS DOS AGENTES</SectionLabel>
            <Badge variant="neutral" size="xs">{stats.total} agentes</Badge>
          </div>
          <div className="space-y-3">
            {distribution.map((item) => (
              <div key={item.label} className="grid grid-cols-[76px_1fr_42px] items-center gap-3">
                <div className="flex items-center gap-2">
                  <Icon name={item.icon} size="xs" className="text-text-secondary" />
                  <span className="text-[10px] font-bold text-text-secondary">{item.label}</span>
                </div>
                <div className="h-7 rounded-sm border border-border-panel bg-bg-base/70 overflow-hidden">
                  <div className={`${item.bar} h-full rounded-sm`} style={{ width: item.width }} />
                </div>
                <span className="text-[10px] font-black text-text-primary text-right">{item.percentage}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <SectionLabel icon="bolt">ATIVIDADE RECENTE</SectionLabel>
            <Badge variant="neutral" size="xs">Fluxo atual</Badge>
          </div>
          {activity.length === 0 ? (
            <div className="rounded-sm border border-border-panel bg-bg-base px-4 py-6 text-center text-[10px] text-text-secondary">
              Nenhuma atividade recente disponível.
            </div>
          ) : (
            <div className="space-y-2">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 rounded-sm border border-border-panel bg-bg-base px-3 py-2">
                  <div className={`mt-0.5 ${item.tone}`}>
                    <Icon name={item.icon} size="sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-text-primary truncate">{item.title}</p>
                    <p className="mt-0.5 text-[8px] font-mono text-text-secondary">{item.subtitle}</p>
                  </div>
                  <span className="text-[8px] font-mono text-text-secondary shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionLabel icon="monitoring">PERFORMANCE POR AGENTE</SectionLabel>
          <Badge variant="neutral" size="xs">Status, uptime e execuções</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {performance.map(({ agent, executionSummary }) => {
            const palette = statusPalette[agent.status];
            return (
              <div key={agent.id} className={`rounded-md border px-3 py-3 ${palette.panel}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-black text-text-primary truncate">{agent.name}</p>
                      <Badge variant={palette.badge} size="xs">{agent.status.toUpperCase()}</Badge>
                    </div>
                    <p className="mt-1 text-[9px] text-text-secondary truncate">
                      {agent.role} {agent.model ? `· ${agent.model}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-mono font-black text-text-primary">{agent.uptime || '—'}</p>
                    <p className="text-[7px] uppercase tracking-widest text-text-secondary">uptime</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-sm border border-border-panel/60 bg-bg-base/80 px-2 py-1.5">
                    <p className="text-[7px] uppercase tracking-widest text-text-secondary">Running</p>
                    <p className="mt-1 text-[10px] font-black text-accent-orange">{executionSummary.running}</p>
                  </div>
                  <div className="rounded-sm border border-border-panel/60 bg-bg-base/80 px-2 py-1.5">
                    <p className="text-[7px] uppercase tracking-widest text-text-secondary">Done</p>
                    <p className="mt-1 text-[10px] font-black text-brand-mint">{executionSummary.completed}</p>
                  </div>
                  <div className="rounded-sm border border-border-panel/60 bg-bg-base/80 px-2 py-1.5">
                    <p className="text-[7px] uppercase tracking-widest text-text-secondary">Fail</p>
                    <p className="mt-1 text-[10px] font-black text-accent-red">{executionSummary.failed}</p>
                  </div>
                </div>
                <p className="mt-3 text-[9px] text-text-secondary truncate">
                  {agent.currentMission || 'Sem missão ativa no momento.'}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
