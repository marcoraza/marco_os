import React, { useState, useMemo } from 'react';
import { Badge, Icon, SectionLabel, StatusDot } from './ui';
import { TabNav } from './ui/TabNav';
import type { Tab } from './ui/TabNav';
import { cn } from '../utils/cn';
import { getAgentById, getTokenUsageForAgent, statusDot, formatTokens } from '../data/agentMockData';
import AgentKanban from './agents/AgentKanban';
import AgentExecutions from './agents/AgentExecutions';
import AgentCronJobs from './agents/AgentCronJobs';
import AgentHeartbeat from './agents/AgentHeartbeat';
import AgentMemory from './agents/AgentMemory';
import AgentConfig from './agents/AgentConfig';
import TokenUsageCard from './agents/TokenUsageCard';

interface AgentDetailViewProps {
  agentId: string;
  onBack: () => void;
}

const agentTabs: Tab[] = [
  { id: 'kanban', label: 'Kanban', icon: 'view_kanban' },
  { id: 'execucoes', label: 'Execuções', icon: 'terminal' },
  { id: 'cron-jobs', label: 'Cron Jobs', icon: 'schedule' },
  { id: 'heartbeat', label: 'Heartbeat', icon: 'monitor_heart' },
  { id: 'memoria', label: 'Memória', icon: 'memory' },
  { id: 'config', label: 'Config', icon: 'settings' },
];

export default function AgentDetailView({ agentId, onBack }: AgentDetailViewProps) {
  const [activeTab, setActiveTab] = useState('kanban');

  const agent = useMemo(() => getAgentById(agentId), [agentId]);
  const tokenUsage = useMemo(() => getTokenUsageForAgent(agentId), [agentId]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <Icon name="error_outline" className="text-4xl text-text-secondary/30" />
        <p className="text-sm font-bold text-text-secondary">Agente não encontrado</p>
        <button onClick={onBack} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-brand-mint hover:text-text-primary transition-colors">
          Voltar
        </button>
      </div>
    );
  }

  const status = statusDot[agent.status];
  const isOnline = agent.status === 'online' || agent.status === 'busy';
  const roleColor = agent.role === 'coordinator' ? 'purple' : agent.role === 'integration' ? 'blue' : 'mint';
  const roleBg = agent.role === 'coordinator' ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
    : agent.role === 'integration' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
    : 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint';
  const roleLabel = agent.role === 'coordinator' ? 'COORDENADOR' : agent.role === 'integration' ? 'INTEGRAÇÃO' : 'SUB-AGENTE';

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200" key={agentId}>
      {/* Header */}
      <div className="p-6 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* Back button */}
            <button
              onClick={onBack}
              className="mt-1 p-1.5 -ml-1 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all shrink-0"
            >
              <Icon name="arrow_back" size="md" />
            </button>

            {/* Agent icon */}
            <div className={cn('size-12 rounded-md border flex items-center justify-center shrink-0', roleBg)}>
              <Icon name={agent.icon || 'smart_toy'} className="text-xl" />
            </div>

            {/* Agent info */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-text-primary">{agent.name}</h1>
                <StatusDot color={status.color} glow={isOnline} size="md" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{status.label}</span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant={roleColor as 'purple' | 'blue' | 'mint'} size="sm">{roleLabel}</Badge>
                {agent.model && (
                  <Badge variant="neutral" size="sm">
                    <Icon name="bolt" className="text-[10px]" /> {agent.model}
                  </Badge>
                )}
                <Badge variant="neutral" size="sm">
                  <Icon name="timer" className="text-[10px]" /> {agent.uptime}
                </Badge>
                {tokenUsage && tokenUsage.todayTokensIn > 0 && (
                  <Badge variant="neutral" size="sm">
                    <Icon name="token" className="text-[10px]" /> {formatTokens(tokenUsage.todayTokensIn + tokenUsage.todayTokensOut)} hoje
                  </Badge>
                )}
                {agent.successRate != null && (
                  <Badge variant="mint" size="sm">
                    <Icon name="check_circle" className="text-[10px]" /> {agent.successRate}%
                  </Badge>
                )}
              </div>

              {agent.currentMission && (
                <p className="mt-2 text-[10px] text-text-secondary font-bold truncate">
                  <Icon name="flag" size="xs" className="inline mr-1 text-brand-mint" />
                  {agent.currentMission}
                </p>
              )}
            </div>
          </div>

          {/* Right: Token usage compact */}
          <div className="hidden lg:block shrink-0">
            <TokenUsageCard agentId={agentId} compact />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={agentTabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor="mint" />

      {/* Body - lazy rendering */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-6">
        {activeTab === 'kanban' && <AgentKanban agentId={agentId} />}
        {activeTab === 'execucoes' && <AgentExecutions agentId={agentId} />}
        {activeTab === 'cron-jobs' && <AgentCronJobs agentId={agentId} />}
        {activeTab === 'heartbeat' && <AgentHeartbeat agentId={agentId} />}
        {activeTab === 'memoria' && <AgentMemory agentId={agentId} />}
        {activeTab === 'config' && <AgentConfig agentId={agentId} />}
      </div>
    </div>
  );
}
