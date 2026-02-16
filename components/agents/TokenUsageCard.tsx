import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { getTokenUsageForAgent, formatTokens } from '../../data/agentMockData';

interface TokenUsageCardProps {
  agentId: string;
  compact?: boolean;
}

export default function TokenUsageCard({ agentId, compact }: TokenUsageCardProps) {
  const usage = useMemo(() => getTokenUsageForAgent(agentId), [agentId]);

  if (!usage) {
    if (compact) {
      return (
        <div className="flex items-center gap-2 text-text-secondary">
          <Icon name="token" size="sm" />
          <span className="text-[10px]">Sem dados</span>
        </div>
      );
    }
    return (
      <Card className="p-4">
        <SectionLabel icon="monitoring">TOKENS</SectionLabel>
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-text-secondary">
          <Icon name="token" size="lg" />
          <span className="text-[10px]">Sem dados de uso</span>
        </div>
      </Card>
    );
  }

  const isIntegration = usage.totalTokensIn === 0;

  if (compact) {
    if (isIntegration) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="purple" size="sm">API</Badge>
        </div>
      );
    }
    return (
      <div className="bg-surface border border-border-panel rounded-md px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="blue" size="sm">{usage.model}</Badge>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Hoje</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-text-secondary">IN</span>
            <span className="text-xs font-mono text-brand-mint">{formatTokens(usage.todayTokensIn)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-text-secondary">OUT</span>
            <span className="text-xs font-mono text-accent-blue">{formatTokens(usage.todayTokensOut)}</span>
          </div>
          <span className="text-[10px] font-mono text-text-secondary">${usage.todayCostUSD.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  if (isIntegration) {
    return (
      <Card className="p-4">
        <SectionLabel icon="monitoring">TOKENS</SectionLabel>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="purple" size="md">API Integration</Badge>
          <span className="text-[10px] text-text-secondary">Sem consumo de LLM</span>
        </div>
      </Card>
    );
  }

  const maxTokens = useMemo(() => {
    if (!usage.last7Days.length) return 1;
    return Math.max(...usage.last7Days.map(d => Math.max(d.tokensIn, d.tokensOut)));
  }, [usage.last7Days]);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon="monitoring">TOKENS</SectionLabel>
        <Badge variant="blue" size="sm">{usage.model}</Badge>
      </div>

      {/* Today */}
      <div className="space-y-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Hoje</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-base rounded p-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Tokens In</div>
            <div className="text-sm font-mono text-brand-mint">{formatTokens(usage.todayTokensIn)}</div>
          </div>
          <div className="bg-bg-base rounded p-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Tokens Out</div>
            <div className="text-sm font-mono text-accent-blue">{formatTokens(usage.todayTokensOut)}</div>
          </div>
        </div>
        <div className="bg-bg-base rounded p-2 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Custo hoje</span>
          <span className="text-xs font-mono text-text-primary">${usage.todayCostUSD.toFixed(2)}</span>
        </div>
      </div>

      {/* Lifetime */}
      <div className="space-y-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Lifetime</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-base rounded p-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Total In</div>
            <div className="text-sm font-mono text-text-primary">{formatTokens(usage.totalTokensIn)}</div>
          </div>
          <div className="bg-bg-base rounded p-2">
            <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Total Out</div>
            <div className="text-sm font-mono text-text-primary">{formatTokens(usage.totalTokensOut)}</div>
          </div>
        </div>
        <div className="bg-bg-base rounded p-2 flex items-center justify-between">
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Custo total</span>
          <span className="text-xs font-mono text-text-primary">${usage.estimatedCostUSD.toFixed(2)}</span>
        </div>
      </div>

      {/* 7-Day Bar Chart */}
      {usage.last7Days.length > 0 && (
        <div className="space-y-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Últimos 7 dias</span>
          <div className="flex items-end gap-1.5 h-[32px]">
            {usage.last7Days.map((day) => {
              const inH = Math.max(2, (day.tokensIn / maxTokens) * 32);
              const outH = Math.max(2, (day.tokensOut / maxTokens) * 32);
              return (
                <div key={day.date} className="flex-1 flex items-end gap-px" title={`${day.date}: In ${formatTokens(day.tokensIn)} / Out ${formatTokens(day.tokensOut)}`}>
                  <div
                    className="flex-1 rounded-sm bg-brand-mint/40"
                    style={{ height: `${inH}px` }}
                  />
                  <div
                    className="flex-1 rounded-sm bg-accent-blue/40"
                    style={{ height: `${outH}px` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-brand-mint/40" />
              <span className="text-[8px] text-text-secondary">In</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm bg-accent-blue/40" />
              <span className="text-[8px] text-text-secondary">Out</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
