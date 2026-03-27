/**
 * MCAgentsShell
 *
 * Main shell for the Agentes section when viewing Mission Control overview.
 * All store access uses granular selectors to prevent render cascades.
 */
import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useMissionControlStore, type MCAgentTab } from '../../store/missionControl';
import { mcApi } from '../../lib/mcApi';
import { Icon } from '../ui/Icon';

const MCOverviewPanelReal = lazy(() => import('./mc/MCOverviewPanel').then(m => ({ default: m.MCOverviewPanel })));
const MCTaskBoardPanel = lazy(() => import('./mc/MCTaskBoardPanel'));
const MCActivityPanel = lazy(() => import('./mc/MCActivityPanel').then(m => ({ default: m.MCActivityPanel })));
const MCLogViewerPanel = lazy(() => import('./mc/MCLogViewerPanel').then(m => ({ default: m.MCLogViewerPanel })));
const MCTokenDashboardPanel = lazy(() => import('./mc/MCTokenDashboardPanel'));
const MCMemoryBrowserPanel = lazy(() => import('./mc/MCMemoryBrowserPanel').then(m => ({ default: m.MCMemoryBrowserPanel })));
const MCSystemMonitorPanel = lazy(() => import('./mc/MCSystemMonitorPanel').then(m => ({ default: m.MCSystemMonitorPanel })));
const MCCronPanel = lazy(() => import('./mc/MCCronPanel').then(m => ({ default: m.MCCronPanel })));
const MCWebhookPanel = lazy(() => import('./mc/MCWebhookPanel').then(m => ({ default: m.MCWebhookPanel })));
const MCChatPanel = lazy(() => import('./mc/MCChatPanel').then(m => ({ default: m.MCChatPanel })));
const MCStandupPanel = lazy(() => import('./mc/MCStandupPanel').then(m => ({ default: m.MCStandupPanel })));
const MCSkillsPanel = lazy(() => import('./mc/MCSkillsPanel').then(m => ({ default: m.MCSkillsPanel })));

const TABS: { id: MCAgentTab; label: string; icon: string }[] = [
  { id: 'overview',  label: 'Overview',  icon: 'dashboard' },
  { id: 'standup',   label: 'Standup',   icon: 'summarize' },
  { id: 'tasks',     label: 'Tasks',     icon: 'task_alt' },
  { id: 'activity',  label: 'Atividade', icon: 'timeline' },
  { id: 'chat',      label: 'Chat',      icon: 'chat' },
  { id: 'logs',      label: 'Logs',      icon: 'terminal' },
  { id: 'tokens',    label: 'Tokens',    icon: 'toll' },
  { id: 'cron',      label: 'Cron',      icon: 'schedule' },
  { id: 'memory',    label: 'Memory',    icon: 'memory' },
  { id: 'webhooks',  label: 'Webhooks',  icon: 'webhook' },
  { id: 'skills',    label: 'Skills',    icon: 'psychology' },
  { id: 'config',    label: 'Config',    icon: 'settings' },
];

function MCConnectionBadge() {
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const agentCount = useMissionControlStore((s) => s.agents.length);
  const hasMockData = connectionStatus !== 'connected' && agentCount > 0;

  const color =
    connectionStatus === 'connected' ? 'text-brand-mint' :
    connectionStatus === 'connecting' ? 'text-accent-orange' :
    hasMockData ? 'text-accent-purple' :
    connectionStatus === 'error' ? 'text-accent-red' :
    'text-text-secondary';

  const label =
    connectionStatus === 'connected' ? 'MC Online' :
    connectionStatus === 'connecting' ? 'Conectando...' :
    hasMockData ? 'Mock Data' :
    connectionStatus === 'error' ? 'MC Erro' :
    'MC Offline';

  return (
    <span className={cn('text-[8px] font-bold uppercase tracking-widest font-mono', color)}>
      {label}
    </span>
  );
}

function TabBar() {
  const activeTab = useMissionControlStore((s) => s.activeTab);
  const setActiveTab = useMissionControlStore((s) => s.setActiveTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
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

function ActivePanel({ onAgentClick }: { onAgentClick?: (agentId: string) => void }) {
  const activeTab = useMissionControlStore((s) => s.activeTab);
  const agentCount = useMissionControlStore((s) => s.agents.length);

  if (agentCount === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">cloud_off</span>
        <p className="text-text-secondary text-xs text-center">MC Service indisponivel</p>
        <p className="text-text-secondary text-[9px] text-center max-w-[280px]">
          Inicie o MC Service com <span className="font-mono text-text-primary">npm run mc:v2:dev</span>
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="space-y-2 p-2">
        <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
        <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
      </div>
    }>
      {activeTab === 'overview' && <MCOverviewPanelReal onAgentClick={onAgentClick} />}
      {activeTab === 'standup' && <MCStandupPanel />}
      {activeTab === 'tasks' && <MCTaskBoardPanel />}
      {activeTab === 'activity' && <MCActivityPanel />}
      {activeTab === 'chat' && <MCChatPanel />}
      {activeTab === 'logs' && <MCLogViewerPanel />}
      {activeTab === 'tokens' && <MCTokenDashboardPanel />}
      {activeTab === 'cron' && <MCCronPanel />}
      {activeTab === 'memory' && <MCMemoryBrowserPanel />}
      {activeTab === 'webhooks' && <MCWebhookPanel />}
      {activeTab === 'skills' && <MCSkillsPanel />}
      {activeTab === 'config' && <MCSystemMonitorPanel />}
    </Suspense>
  );
}

interface MCAgentsShellProps {
  onAgentClick?: (agentId: string) => void;
}

export default function MCAgentsShell({ onAgentClick }: MCAgentsShellProps) {
  // One-time health check, no provider needed
  const checked = useRef(false);
  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    mcApi.healthy().then((ok) => {
      useMissionControlStore.getState().setConnectionStatus(ok ? 'connected' : 'disconnected');
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-1 py-2">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Mission Control
        </div>
        <MCConnectionBadge />
      </div>
      <TabBar />
      <div className="flex-1 overflow-y-auto p-3">
        <ActivePanel onAgentClick={onAgentClick} />
      </div>
    </div>
  );
}
