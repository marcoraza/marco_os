/**
 * MCAutomationPanel — Sprint 2
 *
 * Automacao tab with 3 sub-tabs:
 *   Cron | Webhooks | Alertas
 */
import React from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCAutomacaoSubTab } from '../../../store/missionControl';
import { MCCronPanel } from './MCCronPanel';
import { MCWebhookPanel } from './MCWebhookPanel';
import { MCAlertRulesPanel } from './MCAlertRulesPanel';

// ── Sub-tab bar ───────────────────────────────────────────────────────────────

const AUTOMACAO_TABS: { id: MCAutomacaoSubTab; label: string; icon: string }[] = [
  { id: 'cron',     label: 'Cron',     icon: 'schedule' },
  { id: 'webhooks', label: 'Webhooks', icon: 'http' },
  { id: 'alertas',  label: 'Alertas',  icon: 'notifications' },
];

function AutomacaoSubTabBar() {
  const active = useMissionControlStore((s) => s.activeAutomacaoSubTab);
  const setActive = useMissionControlStore((s) => s.setActiveAutomacaoSubTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel px-3 bg-bg-base">
      {AUTOMACAO_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActive(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap',
            'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            active === tab.id
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

// ── Active sub-panel ──────────────────────────────────────────────────────────

function ActiveSubPanel() {
  const subTab = useMissionControlStore((s) => s.activeAutomacaoSubTab);

  switch (subTab) {
    case 'cron':     return <MCCronPanel />;
    case 'webhooks': return <MCWebhookPanel />;
    case 'alertas':  return <MCAlertRulesPanel />;
    default:         return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCAutomationPanel() {
  return (
    <div className="flex flex-col h-full">
      <AutomacaoSubTabBar />
      <div className="flex-1 overflow-y-auto">
        <ActiveSubPanel />
      </div>
    </div>
  );
}
