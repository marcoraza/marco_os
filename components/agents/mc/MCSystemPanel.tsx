/**
 * MCSystemPanel — Sprint 3
 *
 * Sistema tab with 4 sub-tabs:
 *   Monitor | Skills | Memoria | Config
 */
import React from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCSistemaSubTab } from '../../../store/missionControl';
import { MCSystemMonitorPanel } from './MCSystemMonitorPanel';
import { MCSkillsPanel } from './MCSkillsPanel';
import { MCMemoryBrowserPanel } from './MCMemoryBrowserPanel';
import { MCSettingsPanel } from './MCSettingsPanel';

// ── Sub-tab bar ───────────────────────────────────────────────────────────────

const SISTEMA_TABS: { id: MCSistemaSubTab; label: string; icon: string }[] = [
  { id: 'monitor',  label: 'Monitor',  icon: 'monitor_heart' },
  { id: 'skills',   label: 'Skills',   icon: 'psychology' },
  { id: 'memoria',  label: 'Memoria',  icon: 'database' },
  { id: 'config',   label: 'Config',   icon: 'tune' },
];

function SistemaSubTabBar() {
  const active = useMissionControlStore((s) => s.activeSistemaSubTab);
  const setActive = useMissionControlStore((s) => s.setActiveSistemaSubTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel px-3 bg-bg-base">
      {SISTEMA_TABS.map((tab) => (
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
  const subTab = useMissionControlStore((s) => s.activeSistemaSubTab);

  switch (subTab) {
    case 'monitor': return <MCSystemMonitorPanel />;
    case 'skills':  return <MCSkillsPanel />;
    case 'memoria': return <MCMemoryBrowserPanel />;
    case 'config':  return <MCSettingsPanel />;
    default:        return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCSystemPanel() {
  return (
    <div className="flex flex-col h-full">
      <SistemaSubTabBar />
      <div className="flex-1 overflow-y-auto">
        <ActiveSubPanel />
      </div>
    </div>
  );
}
