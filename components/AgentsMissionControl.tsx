import { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';
import {
  agents,
  executions,
  statusDot,
  executionBadge,
} from '../data/agentMockData';
import { useDispatch, useConnectionState } from '../contexts/OpenClawContext';

interface AgentsMissionControlProps {
  onAgentClick: (agentId: string) => void;
}

export default function AgentsMissionControl({ onAgentClick }: AgentsMissionControlProps) {
  const [missionText, setMissionText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || '');
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { dispatch: sendDispatch, isLive: canDispatch } = useDispatch();
  const { isLive } = useConnectionState();

  const handleDispatch = async () => {
    if (!missionText.trim()) return;
    setIsDispatching(true);
    setDispatchStatus('idle');
    try {
      await sendDispatch(selectedAgent, missionText, selectedPriority);
      setDispatchStatus('success');
      setMissionText('');
      setTimeout(() => setDispatchStatus('idle'), 3000);
    } catch {
      setDispatchStatus('error');
      setTimeout(() => setDispatchStatus('idle'), 3000);
    } finally {
      setIsDispatching(false);
    }
  };

  const sortedExecutions = useMemo(() => {
    const running = executions.filter(e => e.status === 'running');
    const completed = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');
    const pending = executions.filter(e => e.status === 'pending');
    return [...running, ...pending, ...failed, ...completed];
  }, []);

  const coordinator = agents.find(a => a.role === 'coordinator');
  const subAgents = agents.filter(a => a.role === 'sub-agent');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint shrink-0">
            <Icon name="hub" size="lg" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Agentes</p>
            <h1 className="text-sm md:text-base font-black text-text-primary">Mission Control</h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left - Mission Pipeline */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="rocket_launch">PIPELINE DE MISSÕES</SectionLabel>
                <Badge variant="neutral" size="xs">
                  {executions.length} total
                </Badge>
              </div>

              {sortedExecutions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
                  <Icon name="hourglass_empty" className="text-3xl opacity-30" />
                  <p className="text-[10px] font-bold">Nenhuma missão ativa</p>
                  <p className="text-[9px]">Dispatch uma missão pelo painel lateral</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedExecutions.map((exec) => {
                    const badge = executionBadge[exec.status];
                    const isRunning = exec.status === 'running';

                    return (
                      <div
                        key={exec.id}
                        className={cn(
                          'p-3 rounded-md border transition-colors',
                          isRunning
                            ? 'bg-accent-blue/5 border-accent-blue/20'
                            : 'bg-bg-base border-border-panel'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isRunning && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue" />
                                </span>
                              )}
                              <p className="text-xs font-bold text-text-primary truncate">{exec.task}</p>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              <Badge variant="neutral" size="xs">
                                <Icon name="smart_toy" className="text-[9px]" /> {exec.agentName}
                              </Badge>
                              <Badge variant={badge.variant} size="xs">
                                <Icon name={badge.icon} className="text-[9px]" /> {badge.label}
                              </Badge>
                              {exec.duration && (
                                <span className="text-[8px] font-mono text-text-secondary">{exec.duration}</span>
                              )}
                              <span className="text-[8px] font-mono text-text-secondary">{exec.startedAt}</span>
                            </div>
                          </div>
                        </div>

                        {/* Output/Error preview */}
                        {(exec.output || exec.error) && (
                          <div className={cn(
                            'mt-2 p-2 rounded text-[9px] font-mono leading-relaxed',
                            exec.error
                              ? 'bg-accent-red/5 text-accent-red border border-accent-red/10'
                              : 'bg-surface text-text-secondary border border-border-panel'
                          )}>
                            {exec.error || exec.output}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right - Dispatch + Hierarchy */}
          <div className="space-y-4">
            {/* Dispatch Form */}
            <Card className="p-4">
              <SectionLabel icon="send" className="mb-4">DISPATCH RÁPIDO</SectionLabel>
              <div className="space-y-3">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">MISSÃO</label>
                  <textarea
                    value={missionText}
                    onChange={(e) => setMissionText(e.target.value)}
                    placeholder="Descreva a missão..."
                    className="w-full bg-bg-base border border-border-panel rounded-md p-2.5 text-[11px] text-text-primary font-mono placeholder:text-text-secondary/30 resize-none focus:outline-none focus:border-brand-mint/30 transition-colors"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Agente</label>
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full bg-bg-base border border-border-panel rounded-md px-2 py-1.5 text-[10px] text-text-primary font-bold focus:outline-none focus:border-brand-mint/30 transition-colors"
                    >
                      {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Prioridade</label>
                    <select
                      value={selectedPriority}
                      onChange={(e) => setSelectedPriority(e.target.value as 'high' | 'medium' | 'low')}
                      className="w-full bg-bg-base border border-border-panel rounded-md px-2 py-1.5 text-[10px] text-text-primary font-bold focus:outline-none focus:border-brand-mint/30 transition-colors"
                    >
                      <option value="high">P0 - Urgente</option>
                      <option value="medium">P1 - Normal</option>
                      <option value="low">P2 - Baixa</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleDispatch}
                  className={cn(
                    'w-full py-2.5 rounded-md font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-2',
                    isDispatching
                      ? 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue cursor-wait'
                      : dispatchStatus === 'success'
                      ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint'
                      : dispatchStatus === 'error'
                      ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                      : missionText.trim()
                      ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20'
                      : 'bg-surface border border-border-panel text-text-secondary/40 cursor-not-allowed'
                  )}
                  disabled={!missionText.trim() || isDispatching}
                >
                  <Icon name={isDispatching ? 'autorenew' : dispatchStatus === 'success' ? 'check_circle' : dispatchStatus === 'error' ? 'error' : 'send'} size="sm" />
                  {isDispatching ? 'Enviando...' : dispatchStatus === 'success' ? 'Enviado!' : dispatchStatus === 'error' ? 'Erro' : 'Dispatch'}
                </button>

                <p className={cn('text-[8px] text-center', isLive ? 'text-brand-mint/50' : 'text-text-secondary/50')}>
                  {isLive ? 'OpenClaw conectado' : 'Offline — conecte ao OpenClaw para dispatch real'}
                </p>
              </div>
            </Card>

            {/* Agent Hierarchy */}
            <Card className="p-4">
              <SectionLabel icon="account_tree" className="mb-4">HIERARQUIA</SectionLabel>
              <div className="space-y-1">
                {/* Coordinator */}
                {coordinator && (
                  <div
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => onAgentClick(coordinator.id)}
                  >
                    <div className="size-7 rounded border bg-accent-purple/10 border-accent-purple/20 text-accent-purple flex items-center justify-center shrink-0">
                      <Icon name={coordinator.icon || 'smart_toy'} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-text-primary">{coordinator.name}</p>
                      <p className="text-[8px] text-accent-purple font-bold uppercase">Coordenador</p>
                    </div>
                    <StatusDot color={statusDot[coordinator.status].color} glow={coordinator.status !== 'offline'} />
                  </div>
                )}

                {/* Connector lines + sub-agents */}
                {subAgents.map((agent, i) => (
                  <div key={agent.id} className="flex items-stretch">
                    {/* Connector */}
                    <div className="w-7 flex flex-col items-center shrink-0">
                      <div className={cn(
                        'w-px bg-border-panel',
                        i === 0 ? 'h-2' : 'h-2'
                      )} />
                      <div className="flex items-center">
                        <div className="w-3 h-px bg-border-panel" />
                      </div>
                      {i < subAgents.length - 1 && <div className="w-px bg-border-panel flex-1" />}
                    </div>

                    {/* Agent node */}
                    <div
                      className="flex-1 flex items-center gap-2 p-2 rounded-md hover:bg-surface transition-colors cursor-pointer"
                      onClick={() => onAgentClick(agent.id)}
                    >
                      <div className="size-6 rounded border bg-brand-mint/10 border-brand-mint/20 text-brand-mint flex items-center justify-center shrink-0">
                        <Icon name={agent.icon || 'psychology'} size="xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-text-primary">{agent.name}</p>
                      </div>
                      <StatusDot color={statusDot[agent.status].color} glow={agent.status !== 'offline'} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
