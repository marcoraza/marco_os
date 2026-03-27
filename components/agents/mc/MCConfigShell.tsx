/**
 * MCConfigShell — Configuration view with 4 tabs.
 * Tabs: Sistema | Cron | Webhooks | Skills
 * Reuses existing MC panel components.
 */
import React, { Suspense, lazy } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCConfigTab } from '../../../store/missionControl';

const MCSystemMonitorPanel = lazy(() =>
  import('./MCSystemMonitorPanel').then((m) => ({ default: m.MCSystemMonitorPanel })),
);
const MCCronPanel = lazy(() =>
  import('./MCCronPanel').then((m) => ({ default: m.MCCronPanel })),
);
const MCWebhookPanel = lazy(() =>
  import('./MCWebhookPanel').then((m) => ({ default: m.MCWebhookPanel })),
);
const MCSkillsPanel = lazy(() =>
  import('./MCSkillsPanel').then((m) => ({ default: m.MCSkillsPanel })),
);

const CONFIG_TABS: { id: MCConfigTab; label: string; icon: string }[] = [
  { id: 'system',   label: 'Sistema',   icon: 'monitor_heart' },
  { id: 'cron',     label: 'Cron',      icon: 'schedule' },
  { id: 'webhooks', label: 'Webhooks',  icon: 'webhook' },
  { id: 'skills',   label: 'Skills',    icon: 'psychology' },
];

interface MCConfigShellProps {
  onBack: () => void;
}

export function MCConfigShell({ onBack }: MCConfigShellProps) {
  const activeConfigTab = useMissionControlStore((s) => s.activeConfigTab);
  const setActiveConfigTab = useMissionControlStore((s) => s.setActiveConfigTab);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-panel">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand-mint transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm px-1 py-0.5"
        >
          <Icon name="arrow_back" size="xs" />
          Mission Control
        </button>
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
          Configuracao
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border-panel px-3">
        {CONFIG_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveConfigTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              activeConfigTab === tab.id
                ? 'text-brand-mint border-brand-mint'
                : 'text-text-secondary border-transparent hover:text-text-primary',
            )}
          >
            <Icon name={tab.icon} size="xs" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        <Suspense
          fallback={
            <div className="space-y-2">
              <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
              <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
            </div>
          }
        >
          {activeConfigTab === 'system' && <MCSystemMonitorPanel />}
          {activeConfigTab === 'cron' && <MCCronPanel />}
          {activeConfigTab === 'webhooks' && <MCWebhookPanel />}
          {activeConfigTab === 'skills' && <MCSkillsPanel />}
        </Suspense>
      </div>
    </div>
  );
}
