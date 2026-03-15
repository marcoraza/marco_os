import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';
import {
  agents,
  executions,
  kanbanTasks,
  tokenUsages,
  statusDot,
  KANBAN_ORDER,
  kanbanColumns,
  formatTokens,
} from '../data/agentMockData';

interface AgentsOverviewProps {
  onAgentClick: (agentId: string) => void;
}

export default function AgentsOverview({ onAgentClick }: AgentsOverviewProps) {
  const onlineCount = useMemo(() => agents.filter((a) => a.status !== 'offline').length, []);
  const busyCount = useMemo(() => agents.filter((a) => a.status === 'busy').length, []);

  // System-level aggregates
  const totalTokensToday = useMemo(
    () => tokenUsages.reduce((sum, t) => sum + t.todayTokensIn + t.todayTokensOut, 0),
    []
  );
  const totalCostToday = useMemo(
    () => tokenUsages.reduce((sum, t) => sum + t.todayCostUSD, 0),
    []
  );
  const tasksByStatus = useMemo(() => {
    const counts: Record<string, number> = { backlog: 0, 'em-progresso': 0, revisao: 0, concluido: 0 };
    for (const t of kanbanTasks) counts[t.status]++;
    return counts;
  }, []);
  const topModel = useMemo(() => {
    const freq: Record<string, number> = {};
    for (const a of agents) if (a.model) freq[a.model] = (freq[a.model] || 0) + 1;
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  }, []);

  // Activity feed (mock recent actions)
  const activityFeed = useMemo(() => {
    const items: { id: string; icon: string; iconColor: string; text: string; time: string }[] = [];
    for (const exec of executions) {
      if (exec.status === 'running') {
        items.push({ id: exec.id, icon: 'play_circle', iconColor: 'text-accent-blue', text: `${exec.agentName} executando "${exec.task}"`, time: exec.startedAt });
      } else if (exec.status === 'completed') {
        items.push({ id: exec.id, icon: 'check_circle', iconColor: 'text-brand-mint', text: `${exec.agentName} completou "${exec.task}"`, time: exec.completedAt || exec.startedAt });
      } else if (exec.status === 'failed') {
        items.push({ id: exec.id, icon: 'error', iconColor: 'text-accent-red', text: `${exec.agentName} falhou em "${exec.task}"`, time: exec.completedAt || exec.startedAt });
      }
    }
    return items.slice(0, 5);
  }, []);

  // Per-agent task distribution
  const getAgentTaskCounts = (agentId: string) => {
    const counts: Record<string, number> = { backlog: 0, 'em-progresso': 0, revisao: 0, concluido: 0 };
    for (const t of kanbanTasks) if (t.agentId === agentId) counts[t.status]++;
    return counts;
  };

  const getAgentTokensToday = (agentId: string) => {
    const u = tokenUsages.find(t => t.agentId === agentId);
    return u ? u.todayTokensIn + u.todayTokensOut : 0;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint shrink-0">
            <Icon name="dashboard" size="lg" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Agentes</p>
            <h1 className="text-sm md:text-base font-black text-text-primary">Visão Geral</h1>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="mint" size="sm">
            <Icon name="podcasts" className="text-[12px]" /> {onlineCount}/{agents.length} ONLINE
          </Badge>
          {busyCount > 0 && (
            <Badge variant="orange" size="sm">
              <Icon name="autorenew" className="text-[12px]" /> {busyCount} BUSY
            </Badge>
          )}
          <Badge variant="neutral" size="sm">
            <Icon name="token" className="text-[12px]" /> {formatTokens(totalTokensToday)} tokens hoje
          </Badge>
          <Badge variant="neutral" size="sm">
            <Icon name="payments" className="text-[12px]" /> ${totalCostToday.toFixed(2)} custo
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Agent Cards 2x2 */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const taskCounts = getAgentTaskCounts(agent.id);
              const totalTasks = Object.values(taskCounts).reduce((a, b) => a + b, 0);
              const tokensToday = getAgentTokensToday(agent.id);
              const status = statusDot[agent.status];
              const isOnline = agent.status === 'online' || agent.status === 'busy';

              return (
                <Card
                  key={agent.id}
                  className="p-4 hover:border-brand-mint/30 transition-colors cursor-pointer"
                  onClick={() => onAgentClick(agent.id)}
                >
                  {/* Top: icon + name + status */}
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-10 rounded-md border flex items-center justify-center shrink-0',
                        agent.role === 'coordinator' && 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
                        agent.role === 'sub-agent' && 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                      )}
                    >
                      <Icon name={agent.icon || 'smart_toy'} size="lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-text-primary truncate">{agent.name}</p>
                        <StatusDot color={status.color} glow={isOnline} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{status.label}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary font-bold mt-0.5 truncate">
                        {agent.currentMission || 'Sem missão ativa'}
                      </p>
                    </div>
                  </div>

                  {/* Task progress bar */}
                  {totalTasks > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Tasks</span>
                        <span className="text-[8px] font-mono text-text-secondary">{totalTasks}</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-bg-base">
                        {KANBAN_ORDER.map((s) => {
                          const pct = totalTasks > 0 ? (taskCounts[s] / totalTasks) * 100 : 0;
                          if (pct === 0) return null;
                          const colors: Record<string, string> = {
                            backlog: 'bg-accent-blue/50',
                            'em-progresso': 'bg-accent-orange/60',
                            revisao: 'bg-accent-purple/60',
                            concluido: 'bg-brand-mint/60',
                          };
                          return <div key={s} className={cn(colors[s])} style={{ width: `${pct}%` }} />;
                        })}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {KANBAN_ORDER.map((s) => {
                          if (taskCounts[s] === 0) return null;
                          return (
                            <span key={s} className="text-[7px] text-text-secondary">
                              {kanbanColumns[s].label} {taskCounts[s]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tokens + model inline */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {agent.model && (
                      <Badge variant="neutral" size="xs">
                        <Icon name="bolt" className="text-[9px]" /> {agent.model}
                      </Badge>
                    )}
                    {tokensToday > 0 && (
                      <Badge variant="neutral" size="xs">
                        <Icon name="token" className="text-[9px]" /> {formatTokens(tokensToday)}
                      </Badge>
                    )}
                    {agent.successRate != null && (
                      <Badge variant="mint" size="xs">
                        {agent.successRate}%
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Right - System Pulse + Activity Feed */}
          <div className="space-y-4">
            {/* System Pulse */}
            <Card className="p-4">
              <SectionLabel icon="monitor_heart" className="mb-4">SYSTEM PULSE</SectionLabel>
              <div className="space-y-3">
                <div className="p-3 rounded-md bg-bg-base border border-border-panel">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Tokens Hoje</p>
                  <p className="text-xl font-black text-text-primary mt-1 font-mono">{formatTokens(totalTokensToday)}</p>
                  <p className="text-[9px] text-text-secondary font-bold mt-1">${totalCostToday.toFixed(2)} estimado</p>
                </div>

                <div className="p-3 rounded-md bg-bg-base border border-border-panel space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Tasks por Status</p>
                  {KANBAN_ORDER.map((s) => (
                    <div key={s} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-sm',
                          s === 'backlog' && 'bg-accent-blue/50',
                          s === 'em-progresso' && 'bg-accent-orange/60',
                          s === 'revisao' && 'bg-accent-purple/60',
                          s === 'concluido' && 'bg-brand-mint/60',
                        )} />
                        <span className="text-[9px] text-text-secondary font-bold">{kanbanColumns[s].label}</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-text-primary">{tasksByStatus[s]}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-md bg-bg-base border border-border-panel flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Modelo principal</span>
                  <Badge variant="blue" size="sm">{topModel}</Badge>
                </div>
              </div>
            </Card>

            {/* Activity Feed */}
            <Card className="p-4">
              <SectionLabel icon="bolt" className="mb-4">ATIVIDADE RECENTE</SectionLabel>
              {activityFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-text-secondary">
                  <Icon name="hourglass_empty" size="lg" />
                  <span className="text-[10px]">Sem atividade recente</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {activityFeed.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 p-2 rounded-md bg-bg-base border border-border-panel">
                      <Icon name={item.icon} size="sm" className={cn('shrink-0 mt-0.5', item.iconColor)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-text-primary font-bold leading-tight">{item.text}</p>
                        <p className="text-[8px] font-mono text-text-secondary mt-0.5">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
