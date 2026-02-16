import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { getExecutionsForAgent, executionBadge } from '../../data/agentMockData';
import type { ExecutionStatus } from '../../data/agentMockData';

interface AgentExecutionsProps {
  agentId: string;
}

export default function AgentExecutions({ agentId }: AgentExecutionsProps) {
  const executions = useMemo(() => getExecutionsForAgent(agentId), [agentId]);

  const stats = useMemo(() => {
    const counts = { running: 0, completed: 0, failed: 0, pending: 0 };
    for (const ex of executions) {
      counts[ex.status]++;
    }
    return counts;
  }, [executions]);

  if (executions.length === 0) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="terminal">EXECUÇÕES</SectionLabel>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="terminal" size="lg" />
            <span className="text-[11px]">Nenhuma execução registrada</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel icon="terminal">EXECUÇÕES</SectionLabel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Execution Log */}
        <div className="xl:col-span-2 space-y-2">
          {executions.map((exec) => {
            const badge = executionBadge[exec.status];
            return (
              <Card key={exec.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-primary font-medium">{exec.task}</span>
                  <Badge variant={badge.variant} size="sm">
                    <Icon name={badge.icon} size="xs" />
                    {badge.label}
                  </Badge>
                </div>

                {exec.output && (
                  <div className="bg-surface rounded border border-border-panel p-2">
                    <span className="text-[10px] font-mono text-text-secondary">{exec.output}</span>
                  </div>
                )}

                {exec.error && (
                  <div className="bg-accent-red/5 rounded border border-accent-red/20 p-2">
                    <span className="text-[10px] font-mono text-accent-red">{exec.error}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-[9px] text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Icon name="schedule" size="xs" />
                    <span className="font-mono">{exec.startedAt}</span>
                  </div>
                  {exec.completedAt && (
                    <div className="flex items-center gap-1">
                      <Icon name="check" size="xs" />
                      <span className="font-mono">{exec.completedAt}</span>
                    </div>
                  )}
                  {exec.duration && (
                    <div className="flex items-center gap-1">
                      <Icon name="timer" size="xs" />
                      <span className="font-mono">{exec.duration}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right: Stats Sidebar */}
        <div className="space-y-3">
          <Card className="p-4 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Resumo</span>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="blue" glow />
                  <span className="text-[10px] text-text-secondary">Executando</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.running}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="mint" glow />
                  <span className="text-[10px] text-text-secondary">Concluído</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="red" glow />
                  <span className="text-[10px] text-text-secondary">Falhou</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.failed}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Filtros</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(executionBadge) as ExecutionStatus[]).map((status) => {
                const b = executionBadge[status];
                return (
                  <button
                    key={status}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-border-panel bg-bg-base text-text-secondary hover:text-brand-mint hover:border-brand-mint/30 transition-colors"
                  >
                    <Icon name={b.icon} size="xs" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
