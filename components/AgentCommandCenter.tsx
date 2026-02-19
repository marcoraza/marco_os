import { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';
import {
  statusDot,
  KANBAN_ORDER,
  executionBadge,
  formatTokens,
  type KanbanStatus,
} from '../data/agentMockData';
import type { View } from '../lib/appTypes';
import {
  useAgents,
  useKanban,
  useExecutions,
  useDispatch,
  useConnectionState,
  useTokenUsages,
} from '../contexts/OpenClawContext';

interface AgentCommandCenterProps {
  onAgentClick: (agentId: string) => void;
  onNavigate: (view: View) => void;
}

export default function AgentCommandCenter({ onAgentClick, onNavigate }: AgentCommandCenterProps) {
  const { agents } = useAgents();
  const allTasks = useKanban();
  const allExecutions = useExecutions();
  const tokenUsages = useTokenUsages();
  const { dispatch: sendDispatch } = useDispatch();
  const { isLive } = useConnectionState();

  // Dispatch form
  const [missionText, setMissionText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || '');
  const [isDispatching, setIsDispatching] = useState(false);
  const [missionPriority, setMissionPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleDispatch = async () => {
    if (!missionText.trim()) return;
    setIsDispatching(true);
    try {
      await sendDispatch(selectedAgent, missionText);
      setMissionText('');
    } catch {
      // handled silently
    } finally {
      setIsDispatching(false);
    }
  };

  // Aggregates
  const onlineCount = useMemo(() => agents.filter(a => a.status !== 'offline').length, [agents]);
  const totalTokensToday = useMemo(
    () => tokenUsages.reduce((sum, t) => sum + t.todayTokensIn + t.todayTokensOut, 0),
    [tokenUsages]
  );
  const totalCostToday = useMemo(
    () => tokenUsages.reduce((sum, t) => sum + t.todayCostUSD, 0),
    [tokenUsages]
  );

  // Per-agent task counts
  const agentWorkload = useMemo(() => {
    const workload: Record<string, Record<KanbanStatus, number>> = {};
    for (const agent of agents) {
      workload[agent.id] = { backlog: 0, 'em-progresso': 0, revisao: 0, concluido: 0 };
    }
    for (const t of allTasks) {
      if (workload[t.agentId]) workload[t.agentId][t.status]++;
    }
    return workload;
  }, [agents, allTasks]);

  const getAgentTokensToday = (agentId: string) => {
    const u = tokenUsages.find(t => t.agentId === agentId);
    return u ? u.todayTokensIn + u.todayTokensOut : 0;
  };

  // Execution pipeline
  const executionPipeline = useMemo(() => {
    return allExecutions.slice(0, 12).map(exec => {
      const badge = executionBadge[exec.status];
      return { ...exec, badge };
    });
  }, [allExecutions]);

  // Mission queue (active tasks grouped)
  const activeMissions = useMemo(() => {
    return allTasks
      .filter(t => t.status === 'em-progresso' || t.status === 'revisao')
      .slice(0, 8);
  }, [allTasks]);

  const backlogCount = useMemo(() => allTasks.filter(t => t.status === 'backlog').length, [allTasks]);
  const inProgressCount = useMemo(() => allTasks.filter(t => t.status === 'em-progresso').length, [allTasks]);
  const reviewCount = useMemo(() => allTasks.filter(t => t.status === 'revisao').length, [allTasks]);
  const doneCount = useMemo(() => allTasks.filter(t => t.status === 'concluido').length, [allTasks]);

  const priorityColors = {
    high: { bg: 'bg-accent-red/10', border: 'border-accent-red/30', text: 'text-accent-red', label: 'Alta' },
    medium: { bg: 'bg-accent-orange/10', border: 'border-accent-orange/30', text: 'text-accent-orange', label: 'Média' },
    low: { bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', text: 'text-accent-blue', label: 'Baixa' },
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ─── HEADER ─── */}
      <div className="p-5 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint shrink-0">
              <Icon name="hub" size="md" />
            </div>
            <div>
              <h1 className="text-sm font-black text-text-primary">Mission Control</h1>
              <p className="text-[8px] font-bold text-text-secondary uppercase tracking-widest mt-0.5">
                GERENCIAMENTO DE AGENTES & MISSÕES
              </p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <span className={cn('w-2 h-2 rounded-full', isLive ? 'bg-brand-mint animate-pulse' : 'bg-text-secondary/30')} />
              <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Pipeline stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
              <span className="text-[8px] font-bold text-text-secondary uppercase">Backlog</span>
              <span className="text-[9px] font-black text-accent-blue font-mono">{backlogCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
              <span className="text-[8px] font-bold text-text-secondary uppercase">Em Prog.</span>
              <span className="text-[9px] font-black text-accent-orange font-mono">{inProgressCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
              <span className="text-[8px] font-bold text-text-secondary uppercase">REVISÃO</span>
              <span className="text-[9px] font-black text-accent-purple font-mono">{reviewCount}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
              <span className="text-[8px] font-bold text-text-secondary uppercase">Feito</span>
              <span className="text-[9px] font-black text-brand-mint font-mono">{doneCount}</span>
            </div>
          </div>
        </div>

        {/* ─── DISPATCH BAR ─── */}
        <div className="mt-4 p-3 bg-surface/30 border border-border-panel rounded-md space-y-3">
          <div className="flex items-center gap-2">
            <Icon name="send" size="xs" className="text-brand-mint" />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">NOVA MISSÃO</span>
          </div>
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={missionText}
              onChange={(e) => setMissionText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDispatch()}
              placeholder="Descreva a missão para o agente..."
              className="flex-1 bg-bg-base border border-border-panel rounded-sm px-3 py-2 text-[10px] text-text-primary font-mono placeholder:text-text-secondary/30 focus:outline-none focus:border-brand-mint/30 transition-colors"
            />
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-bg-base border border-border-panel rounded-sm px-2 py-2 text-[9px] text-text-primary font-bold focus:outline-none cursor-pointer"
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <div className="flex bg-bg-base border border-border-panel rounded-sm overflow-hidden">
              {(['high', 'medium', 'low'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setMissionPriority(p)}
                  className={cn(
                    'px-2 py-2 text-[8px] font-black uppercase transition-colors',
                    missionPriority === p
                      ? `${priorityColors[p].bg} ${priorityColors[p].text} ${priorityColors[p].border}`
                      : 'text-text-secondary/40 hover:text-text-secondary'
                  )}
                >
                  {priorityColors[p].label}
                </button>
              ))}
            </div>
            <button
              onClick={handleDispatch}
              disabled={!missionText.trim() || isDispatching}
              className={cn(
                'px-4 py-2 rounded-sm font-bold uppercase tracking-wider text-[9px] transition-all flex items-center gap-1.5 shrink-0',
                missionText.trim() && !isDispatching
                  ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20'
                  : 'bg-surface/50 border border-border-panel text-text-secondary/40 cursor-not-allowed'
              )}
            >
              <Icon name={isDispatching ? 'autorenew' : 'rocket_launch'} size="xs" />
              {isDispatching ? 'Enviando...' : 'Dispatch'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── BODY ─── */}
      <div className="flex-grow overflow-y-auto p-5 space-y-5">

        {/* ─── AGENT GRID + WORKLOAD ─── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <SectionLabel icon="smart_toy">AGENTES — CARGA DE TRABALHO</SectionLabel>
            <div className="flex items-center gap-2 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
              <StatusDot color="mint" glow />
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{onlineCount}/{agents.length} Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {agents.map((agent) => {
              const status = statusDot[agent.status];
              const isOnline = agent.status === 'online' || agent.status === 'busy';
              const tokensToday = getAgentTokensToday(agent.id);
              const work = agentWorkload[agent.id] || { backlog: 0, 'em-progresso': 0, revisao: 0, concluido: 0 };
              const totalTasks = Object.values(work).reduce((a, b) => a + b, 0);

              return (
                <Card
                  key={agent.id}
                  className="p-3 hover:border-brand-mint/30 transition-colors cursor-pointer group"
                  onClick={() => onAgentClick(agent.id)}
                >
                  {/* Agent Identity */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={cn(
                      'size-8 rounded-md border flex items-center justify-center shrink-0',
                      agent.role === 'coordinator'
                        ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
                        : 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                    )}>
                      <Icon name={agent.icon || 'smart_toy'} size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-black text-text-primary truncate group-hover:text-brand-mint transition-colors">{agent.name}</p>
                        <StatusDot color={status.color} glow={isOnline} />
                      </div>
                      <p className="text-[8px] text-text-secondary font-mono truncate">{agent.model || '—'}</p>
                    </div>
                  </div>

                  {/* Current Mission */}
                  <div className="mb-3 px-2 py-1.5 bg-bg-base rounded-sm border border-border-panel/50">
                    <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-0.5">MISSÃO ATUAL</p>
                    <p className="text-[9px] text-text-primary font-medium truncate">{agent.currentMission || 'Idle — Aguardando'}</p>
                  </div>

                  {/* Workload Bar */}
                  {totalTasks > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Tarefas</span>
                        <span className="text-[8px] font-mono text-text-secondary">{totalTasks}</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden bg-bg-base">
                        {KANBAN_ORDER.map((s) => {
                          const pct = (work[s] / totalTasks) * 100;
                          if (pct === 0) return null;
                          const colors: Record<string, string> = {
                            backlog: 'bg-accent-blue/60',
                            'em-progresso': 'bg-accent-orange/60',
                            revisao: 'bg-accent-purple/60',
                            concluido: 'bg-brand-mint/60',
                          };
                          return <div key={s} className={cn(colors[s])} style={{ width: `${pct}%` }} />;
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {work['em-progresso'] > 0 && (
                          <span className="text-[7px] font-bold text-accent-orange">{work['em-progresso']} ativa{work['em-progresso'] > 1 ? 's' : ''}</span>
                        )}
                        {work.revisao > 0 && (
                          <span className="text-[7px] font-bold text-accent-purple">{work.revisao} revisão</span>
                        )}
                        {work.backlog > 0 && (
                          <span className="text-[7px] font-bold text-accent-blue">{work.backlog} backlog</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Token usage */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-panel/30">
                    <span className="text-[7px] font-bold text-text-secondary uppercase">Tokens hoje</span>
                    <span className="text-[8px] font-mono text-text-secondary">{tokensToday > 0 ? formatTokens(tokensToday) : '—'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ─── ACTIVE MISSIONS + EXECUTION PIPELINE ─── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Active Missions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel icon="flag">MISSÕES ATIVAS</SectionLabel>
              <Badge variant="orange" size="xs">{activeMissions.length}</Badge>
            </div>

            <div className="space-y-2">
              {activeMissions.length === 0 ? (
                <Card className="p-6">
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
                    <Icon name="check_circle" size="lg" />
                    <span className="text-[10px]">Nenhuma missão ativa</span>
                  </div>
                </Card>
              ) : (
                activeMissions.map((mission) => {
                  const agentName = agents.find(a => a.id === mission.agentId)?.name;
                  const isReview = mission.status === 'revisao';
                  return (
                    <Card key={mission.id} className={cn('p-3 group', isReview && 'border-accent-purple/20')}>
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'size-7 rounded-sm flex items-center justify-center shrink-0 mt-0.5',
                          isReview ? 'bg-accent-purple/10 text-accent-purple' : 'bg-accent-orange/10 text-accent-orange'
                        )}>
                          <Icon name={isReview ? 'rate_review' : 'play_circle'} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-text-primary leading-tight">{mission.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {agentName && (
                              <Badge variant="neutral" size="xs">
                                <Icon name="smart_toy" className="text-[7px]" /> {agentName}
                              </Badge>
                            )}
                            <Badge variant={isReview ? 'purple' : 'orange'} size="xs">
                              {isReview ? 'Revisão' : 'Em Progresso'}
                            </Badge>
                          </div>
                          {mission.messages.length > 0 && (
                            <p className="text-[8px] text-text-secondary mt-1.5 truncate">
                              {mission.messages[mission.messages.length - 1].content}
                            </p>
                          )}
                        </div>
                        <span className="text-[7px] font-mono text-text-secondary shrink-0">{mission.createdAt}</span>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Execution Pipeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionLabel icon="bolt">PIPELINE DE EXECUÇÃO</SectionLabel>
              <Badge variant="blue" size="xs">{allExecutions.length}</Badge>
            </div>

            <div className="space-y-1.5">
              {executionPipeline.length === 0 ? (
                <Card className="p-6">
                  <div className="flex flex-col items-center justify-center gap-2 text-text-secondary">
                    <Icon name="terminal" size="lg" />
                    <span className="text-[10px]">Nenhuma execução registrada</span>
                  </div>
                </Card>
              ) : (
                executionPipeline.map((exec) => {
                  const isRunning = exec.status === 'running';
                  return (
                    <Card key={exec.id} className={cn('p-2.5', isRunning && 'border-accent-blue/20 bg-accent-blue/[0.02]')}>
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <Icon
                            name={
                              exec.status === 'running' ? 'play_circle'
                              : exec.status === 'completed' ? 'check_circle'
                              : exec.status === 'failed' ? 'error'
                              : 'pending'
                            }
                            size="xs"
                            className={cn(
                              exec.status === 'running' ? 'text-accent-blue'
                              : exec.status === 'completed' ? 'text-brand-mint'
                              : exec.status === 'failed' ? 'text-accent-red'
                              : 'text-accent-orange'
                            )}
                          />
                          {isRunning && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent-blue animate-ping" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-text-primary leading-tight truncate">{exec.task}</p>
                          <p className="text-[8px] text-text-secondary font-mono mt-0.5">{exec.agentName}</p>
                        </div>
                        {exec.duration && (
                          <span className="text-[8px] font-mono text-text-secondary shrink-0">{exec.duration}</span>
                        )}
                        <Badge variant={exec.badge.variant} size="xs">{exec.badge.label}</Badge>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─── TOKEN OVERVIEW ─── */}
        <div>
          <SectionLabel icon="token" className="mb-3">CONSUMO DE RECURSOS</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Tokens Hoje</p>
              <p className="text-lg font-black text-text-primary font-mono">{formatTokens(totalTokensToday)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Custo Hoje</p>
              <p className="text-lg font-black text-text-primary font-mono">${totalCostToday.toFixed(2)}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Agentes Online</p>
              <p className="text-lg font-black text-brand-mint font-mono">{onlineCount}<span className="text-text-secondary text-xs">/{agents.length}</span></p>
            </Card>
            <Card className="p-3">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">TOTAL MISSÕES</p>
              <p className="text-lg font-black text-text-primary font-mono">{allTasks.length}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
