import React, { useState, useMemo, lazy, Suspense } from 'react';
import { Badge, Icon, SectionLabel, StatusDot, Skeleton, EmptyState } from './ui';
import { TabNav } from './ui/TabNav';
import type { Tab } from './ui/TabNav';
import { cn } from '../utils/cn';
import { getTokenUsageForAgent, statusDot, formatTokens } from '../data/agentMockData';
import { useAgents } from '../contexts/OpenClawContext';
import AgentKanban from './agents/AgentKanban';
import AgentExecutions from './agents/AgentExecutions';
import AgentCronJobs from './agents/AgentCronJobs';
import AgentHeartbeat from './agents/AgentHeartbeat';
import AgentMemory from './agents/AgentMemory';
import AgentConfig from './agents/AgentConfig';
import TokenUsageCard from './agents/TokenUsageCard';
import AgentDataActions from './agents/AgentDataActions';

const AgentStandup = lazy(() => import('./agents/AgentStandup'));
const ActivityFeed = lazy(() => import('./agents/ActivityFeed'));
const AgentChat = lazy(() => import('./agents/AgentChat'));
const GitHubIssues = lazy(() => import('./agents/GitHubIssues'));
const QualityReviewGates = lazy(() => import('./agents/QualityReviewGates'));
const AuditLog = lazy(() => import('./agents/AuditLog'));
const GlobalSearch = lazy(() => import('./agents/GlobalSearch'));
const PipelineOrchestration = lazy(() => import('./agents/PipelineOrchestration'));
const WebhookManager = lazy(() => import('./agents/WebhookManager'));

function TabFallback() {
  return (
    <div className="space-y-3">
      <Skeleton variant="card" />
      <Skeleton variant="card" />
    </div>
  );
}

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
  { id: 'dados', label: 'Dados', icon: 'database' },
  { id: 'standup', label: 'Standup', icon: 'summarize' },
  { id: 'atividade', label: 'Atividade', icon: 'timeline' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'github', label: 'GitHub', icon: 'code' },
  { id: 'revisao', label: 'Revisão', icon: 'verified' },
  { id: 'auditoria', label: 'Auditoria', icon: 'history' },
  { id: 'busca', label: 'Busca', icon: 'search' },
  { id: 'pipelines', label: 'Pipelines', icon: 'route' },
  { id: 'webhooks', label: 'Webhooks', icon: 'webhook' },
];

export default function AgentDetailView({ agentId, onBack }: AgentDetailViewProps) {
  const [activeTab, setActiveTab] = useState('kanban');

  const { agents, getAgentStatus } = useAgents();
  const agent = useMemo(() => getAgentStatus(agentId), [agentId, getAgentStatus]);
  const tokenUsage = useMemo(() => getTokenUsageForAgent(agentId), [agentId]);

  if (!agent) {
    return (
      <EmptyState
        icon="error_outline"
        title="Agente nao encontrado"
        description="Volte para Mission Control e selecione um agente disponivel."
        action={{ label: 'Voltar', onClick: onBack }}
        className="h-full"
      />
    );
  }

  const status = statusDot[agent.status];
  const isOnline = agent.status === 'online' || agent.status === 'busy';
  const roleColor = agent.role === 'coordinator' ? 'purple' : agent.role === 'integration' ? 'blue' : 'mint';
  const roleBg = agent.role === 'coordinator' ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple'
    : agent.role === 'integration' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
    : 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint';
  const roleLabel = agent.role === 'coordinator' ? 'COORDENADOR' : agent.role === 'integration' ? 'INTEGRAÇÃO' : 'SUB-AGENTE';
  const statusMessage = agent.currentMission
    ? agent.currentMission
    : isOnline
      ? 'Sem missao ativa no momento.'
      : 'Agente offline. Conexao aguardando retomada.';
  const suggestedTab = agent.role === 'integration'
    ? 'dados'
    : agent.status === 'busy'
      ? 'kanban'
      : 'execucoes';

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
        <div className="mt-4 rounded-md border border-border-panel bg-surface/40 px-3 py-2">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-text-secondary">
            <Icon name={isOnline ? 'assistant_navigation' : 'wifi_off'} size="xs" />
            <span>Resumo Operacional</span>
          </div>
          <p className="mt-1 text-[11px] text-text-primary">
            {statusMessage}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { id: suggestedTab, label: 'Foco sugerido', icon: 'bolt' },
              { id: 'cron-jobs', label: 'Cron Jobs', icon: 'schedule' },
              { id: 'dados', label: 'Dados', icon: 'database' },
            ].map((action) => (
              <button
                key={`${action.id}-${action.label}`}
                onClick={() => setActiveTab(action.id)}
                className="flex items-center gap-1.5 rounded-sm border border-border-panel px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand-mint hover:border-brand-mint/20 transition-colors"
              >
                <Icon name={action.icon} size="xs" />
                {action.label}
              </button>
            ))}
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
        {activeTab === 'dados' && <AgentDataActions agentId={agentId} agentName={agent.name} />}
        {activeTab === 'standup' && (
          <Suspense fallback={<TabFallback />}>
            <AgentStandup />
          </Suspense>
        )}
        {activeTab === 'atividade' && (
          <Suspense fallback={<TabFallback />}>
            <ActivityFeed />
          </Suspense>
        )}
        {activeTab === 'chat' && (
          <Suspense fallback={<TabFallback />}>
            <AgentChat agentId={agentId} />
          </Suspense>
        )}
        {activeTab === 'github' && (
          <Suspense fallback={<TabFallback />}>
            <GitHubIssues />
          </Suspense>
        )}
        {activeTab === 'revisao' && (
          <Suspense fallback={<TabFallback />}>
            <QualityReviewGates />
          </Suspense>
        )}
        {activeTab === 'auditoria' && (
          <Suspense fallback={<TabFallback />}>
            <AuditLog />
          </Suspense>
        )}
        {activeTab === 'busca' && (
          <Suspense fallback={<TabFallback />}>
            <GlobalSearch />
          </Suspense>
        )}
        {activeTab === 'pipelines' && (
          <Suspense fallback={<TabFallback />}>
            <PipelineOrchestration />
          </Suspense>
        )}
        {activeTab === 'webhooks' && (
          <Suspense fallback={<TabFallback />}>
            <WebhookManager />
          </Suspense>
        )}
      </div>
    </div>
  );
}
