import React, { Suspense, lazy, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/Icon';
import { useMissionControlStore, type MCAgent, type MCAgentDetailTab } from '../../store/missionControl';

const MCTaskBoardPanel = lazy(() => import('./mc/MCTaskBoardPanel'));
const MCActivityPanel = lazy(() => import('./mc/MCActivityPanel').then((m) => ({ default: m.MCActivityPanel })));
const MCChatPanel = lazy(() => import('./mc/MCChatPanel').then((m) => ({ default: m.MCChatPanel })));
const MCMemoryBrowserPanel = lazy(() => import('./mc/MCMemoryBrowserPanel').then((m) => ({ default: m.MCMemoryBrowserPanel })));
const MCCronPanel = lazy(() => import('./mc/MCCronPanel').then((m) => ({ default: m.MCCronPanel })));
const MCTokenDashboardPanel = lazy(() => import('./mc/MCTokenDashboardPanel'));

const DETAIL_TABS: { id: MCAgentDetailTab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'activity', label: 'Atividade', icon: 'timeline' },
  { id: 'chat', label: 'Chat', icon: 'chat' },
  { id: 'memory', label: 'Memory', icon: 'memory' },
  { id: 'config', label: 'Config', icon: 'settings' },
  { id: 'cron', label: 'Cron', icon: 'schedule' },
  { id: 'tools', label: 'Tools', icon: 'build' },
  { id: 'models', label: 'Models', icon: 'model_training' },
];

function relativeTime(ts?: number): string {
  if (!ts) return '--';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function formatDate(ts?: number): string {
  if (!ts) return '--';
  return new Date(ts).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function statusColor(status: MCAgent['status']): string {
  if (status === 'idle') return 'bg-brand-mint';
  if (status === 'busy') return 'bg-accent-orange';
  if (status === 'error') return 'bg-accent-red';
  return 'bg-text-secondary';
}

function statusLabel(status: MCAgent['status']): string {
  if (status === 'idle') return 'Idle';
  if (status === 'busy') return 'Busy';
  if (status === 'error') return 'Erro';
  return 'Offline';
}

function DetailFallback() {
  return (
    <div className="space-y-2">
      <div className="bg-border-panel animate-pulse rounded-sm h-16 w-full" />
      <div className="bg-border-panel animate-pulse rounded-sm h-24 w-full" />
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'mint' | 'orange' | 'red';
}) {
  const toneClass =
    tone === 'mint'
      ? 'text-brand-mint'
      : tone === 'orange'
        ? 'text-accent-orange'
        : tone === 'red'
          ? 'text-accent-red'
          : 'text-text-primary';

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">
        {label}
      </div>
      <div className={cn('text-sm font-black font-mono', toneClass)}>{value}</div>
    </div>
  );
}

function AgentHeader({ agent }: { agent: MCAgent }) {
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 mb-3">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-sm bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center shrink-0">
          <Icon name="smart_toy" size="md" className="text-accent-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-text-primary truncate">{agent.name}</h2>
            <span className={cn('w-2 h-2 rounded-full shrink-0', statusColor(agent.status))} />
            <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary bg-surface border border-border-panel px-2 py-0.5 rounded-sm">
              {agent.role}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-[9px] font-mono text-text-secondary">
              Status: {statusLabel(agent.status)}
            </span>
            <span className="text-[9px] font-mono text-text-secondary">
              Visto: {relativeTime(agent.last_seen)}
            </span>
            {agent.session_key && (
              <span className="text-[9px] font-mono text-text-secondary truncate">
                Sessao: {agent.session_key}
              </span>
            )}
          </div>
          {agent.last_activity && (
            <p className="mt-2 text-[10px] text-text-secondary">
              {agent.last_activity}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: MCAgentDetailTab;
  onTabChange: (tab: MCAgentDetailTab) => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border-panel overflow-x-auto scrollbar-hide mb-3">
      {DETAIL_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap',
            'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            activeTab === tab.id
              ? 'text-brand-mint border-brand-mint'
              : 'text-text-secondary border-transparent hover:text-text-primary',
          )}
        >
          <Icon name={tab.icon} size="xs" />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function AgentOverviewPanel({
  agent,
  agentFilter,
}: {
  agent: MCAgent;
  agentFilter: string;
}) {
  const tasks = useMissionControlStore((s) => s.tasks);
  const activities = useMissionControlStore((s) => s.activities);

  const scopedTasks = useMemo(
    () => tasks.filter((task) => task.assigned_to?.toLowerCase() === agentFilter.toLowerCase()),
    [agentFilter, tasks],
  );

  const recentActivity = useMemo(
    () =>
      activities
        .filter(
          (activity) =>
            activity.actor.toLowerCase() === agentFilter.toLowerCase() ||
            activity.entity?.name?.toLowerCase() === agentFilter.toLowerCase(),
        )
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 5),
    [activities, agentFilter],
  );

  const doneTasks = scopedTasks.filter((task) => task.status === 'done').length;
  const inProgressTasks = scopedTasks.filter((task) => task.status === 'in_progress').length;
  const reviewTasks = scopedTasks.filter((task) => task.status === 'review' || task.status === 'quality_review').length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        <MetricCard
          label="Status"
          value={statusLabel(agent.status)}
          tone={agent.status === 'idle' ? 'mint' : agent.status === 'busy' ? 'orange' : agent.status === 'error' ? 'red' : 'default'}
        />
        <MetricCard label="Tasks abertas" value={String(scopedTasks.length - doneTasks)} />
        <MetricCard label="Em progresso" value={String(inProgressTasks)} tone="orange" />
        <MetricCard label="Em revisao" value={String(reviewTasks)} tone="mint" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
            Resumo do agente
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Criado em" value={formatDate(agent.created_at)} />
            <MetricCard label="Atualizado em" value={formatDate(agent.updated_at)} />
            <MetricCard label="Ultimo heartbeat" value={formatDate(agent.last_seen)} />
            <MetricCard label="Tasks concluidas" value={String(doneTasks)} tone="mint" />
          </div>
        </div>

        <div className="bg-surface border border-border-panel rounded-sm p-3">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
            Atividade recente
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-[10px] text-text-secondary">Nenhum evento recente para este agente.</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border border-border-panel rounded-sm p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-text-primary">{activity.description}</span>
                    <span className="text-[8px] font-mono text-text-secondary whitespace-nowrap">
                      {relativeTime(activity.created_at)}
                    </span>
                  </div>
                  {activity.entity?.title && (
                    <p className="mt-1 text-[9px] text-text-secondary truncate">{activity.entity.title}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentConfigPanel({ agent }: { agent: MCAgent }) {
  const configEntries = Object.entries(agent.config ?? {});

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        <MetricCard label="ID" value={String(agent.id)} />
        <MetricCard label="Role" value={agent.role || '--'} />
        <MetricCard label="Sessao" value={agent.session_key || '--'} />
        <MetricCard label="Ultimo visto" value={relativeTime(agent.last_seen)} />
      </div>

      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Configuracao do agente
        </div>
        {configEntries.length === 0 ? (
          <p className="text-[10px] text-text-secondary">
            O Mission Control ainda nao expôs um payload de configuracao para este agente.
          </p>
        ) : (
          <div className="space-y-2">
            {configEntries.map(([key, value]) => (
              <div key={key} className="border border-border-panel rounded-sm px-3 py-2">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{key}</div>
                <div className="mt-1 text-[10px] font-mono text-text-primary break-all">
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentToolsPanel({ agent }: { agent: MCAgent }) {
  const tools = useMemo(() => {
    const value = agent.config?.tools;
    if (Array.isArray(value)) {
      return value.map((tool) => String(tool));
    }
    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>);
    }
    return [];
  }, [agent.config]);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
        Ferramentas expostas
      </div>
      {tools.length === 0 ? (
        <p className="text-[10px] text-text-secondary">
          Nenhuma lista de ferramentas veio do backend do Mission Control para este agente.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="px-2.5 py-1 rounded-sm border border-border-panel bg-bg-base text-[9px] font-mono text-text-primary"
            >
              {tool}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentModelsPanel({
  agent,
  agentFilter,
}: {
  agent: MCAgent;
  agentFilter: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
        <MetricCard label="Agente" value={agent.name} />
        <MetricCard label="Status" value={statusLabel(agent.status)} />
        <MetricCard label="Sessao" value={agent.session_key || '--'} />
        <MetricCard label="Ultima atividade" value={agent.last_activity || '--'} />
      </div>
      <Suspense fallback={<DetailFallback />}>
        <MCTokenDashboardPanel agentId={agentFilter} />
      </Suspense>
    </div>
  );
}

interface MCAgentDetailProps {
  agentId: string;
  onBack: () => void;
}

export default function MCAgentDetail({ agentId, onBack }: MCAgentDetailProps) {
  const agent = useMissionControlStore((s) => s.agents.find((item) => String(item.id) === agentId) ?? null);
  const activeDetailTab = useMissionControlStore((s) => s.activeDetailTab);
  const setActiveDetailTab = useMissionControlStore((s) => s.setActiveDetailTab);

  if (!agent) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">hub</span>
        <p className="text-text-primary text-sm font-bold">Agente nao encontrado no Mission Control</p>
        <p className="text-text-secondary text-[10px] text-center max-w-[320px]">
          A selecao do agente ficou fora de sincronia com os dados atuais. Volte para o overview e abra o agente de novo.
        </p>
        <button
          onClick={onBack}
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-panel rounded-sm text-text-primary hover:text-brand-mint hover:border-brand-mint/20 transition-colors"
        >
          Voltar para agentes
        </button>
      </div>
    );
  }

  const agentFilter = agent.name;

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand-mint transition-colors mb-2 self-start focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm px-1 py-0.5"
      >
        <Icon name="arrow_back" size="xs" />
        Agentes
      </button>

      <AgentHeader agent={agent} />
      <DetailTabBar activeTab={activeDetailTab} onTabChange={setActiveDetailTab} />

      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<DetailFallback />}>
          {activeDetailTab === 'overview' && <AgentOverviewPanel agent={agent} agentFilter={agentFilter} />}
          {activeDetailTab === 'tasks' && <MCTaskBoardPanel agentId={agentFilter} />}
          {activeDetailTab === 'activity' && <MCActivityPanel agentId={agentFilter} />}
          {activeDetailTab === 'chat' && <MCChatPanel agentId={agentFilter} />}
          {activeDetailTab === 'memory' && <MCMemoryBrowserPanel agentId={agentFilter} />}
          {activeDetailTab === 'config' && <AgentConfigPanel agent={agent} />}
          {activeDetailTab === 'cron' && <MCCronPanel agentId={agentFilter} />}
          {activeDetailTab === 'tools' && <AgentToolsPanel agent={agent} />}
          {activeDetailTab === 'models' && <AgentModelsPanel agent={agent} agentFilter={agentFilter} />}
        </Suspense>
      </div>
    </div>
  );
}
