/**
 * MCObservePanel — Sprint 1
 *
 * Observar tab with 4 sub-tabs:
 *   Atividade | Sessoes | Tokens | Logs
 *
 * Composes existing panels; Sessoes uses an inline all-sessions view
 * since MCAgentSessions is per-agent only.
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { StatusDot } from '../../ui/StatusDot';
import { SectionLabel } from '../../ui/SectionLabel';
import { useMissionControlStore, type MCObserveSubTab, type MCSession } from '../../../store/missionControl';
import { MCActivityPanel } from './MCActivityPanel';
import { MCLogViewerPanel } from './MCLogViewerPanel';
import MCTokenDashboardPanel from './MCTokenDashboardPanel';

// ── Sub-tab bar ───────────────────────────────────────────────────────────────

const OBSERVE_TABS: { id: MCObserveSubTab; label: string; icon: string }[] = [
  { id: 'atividade', label: 'Atividade', icon: 'history' },
  { id: 'sessoes',   label: 'Sessoes',   icon: 'terminal' },
  { id: 'tokens',    label: 'Tokens',    icon: 'generating_tokens' },
  { id: 'logs',      label: 'Logs',      icon: 'article' },
];

function ObserveSubTabBar() {
  const active = useMissionControlStore((s) => s.activeObserveSubTab);
  const setActive = useMissionControlStore((s) => s.setActiveObserveSubTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel px-3 bg-bg-base">
      {OBSERVE_TABS.map((tab) => (
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

// ── Sessions overview (all sessions) ─────────────────────────────────────────

function formatCost(n?: number): string {
  if (!n) return '--';
  return n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`;
}

function SessionCard({ session }: { session: MCSession }) {
  const isActive = session.active;

  return (
    <div
      className={cn(
        'bg-surface border border-border-panel rounded-sm p-3 transition-colors',
        isActive && 'border-l-2 border-l-brand-mint',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <StatusDot color={isActive ? 'mint' : 'blue'} glow={isActive} size="sm" />
          <span className="text-[10px] font-bold text-text-primary font-mono truncate">
            {session.label ?? session.key ?? session.id.slice(0, 12)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[8px] font-mono text-text-secondary">{session.age}</span>
          {isActive && (
            <span className="text-[7px] font-black uppercase tracking-widest text-brand-mint bg-brand-mint/10 border border-brand-mint/20 px-1.5 py-0.5 rounded-sm">
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        {session.agent && (
          <span className="text-[8px] text-text-secondary flex items-center gap-1">
            <Icon name="smart_toy" size="xs" />
            {session.agent}
          </span>
        )}
        {session.model && (
          <span className="text-[8px] text-text-secondary font-mono">{session.model}</span>
        )}
        {session.tokens && (
          <span className="text-[8px] text-text-secondary font-mono flex items-center gap-1">
            <Icon name="generating_tokens" size="xs" />
            {session.tokens}
          </span>
        )}
        {session.cost != null && (
          <span className="text-[8px] font-mono text-accent-orange">{formatCost(session.cost)}</span>
        )}
        {session.messageCount != null && (
          <span className="text-[8px] text-text-secondary font-mono">{session.messageCount} msg</span>
        )}
      </div>

      {/* Flags */}
      {session.flags && session.flags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {session.flags.map((flag) => (
            <span
              key={flag}
              className="text-[7px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-1.5 py-0.5 rounded-sm text-text-secondary"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionsOverview() {
  const sessions = useMissionControlStore((s) => s.sessions);

  const { active, inactive, totalCost } = useMemo(() => {
    const a = sessions.filter((s) => s.active);
    const i = sessions.filter((s) => !s.active);
    const cost = sessions.reduce((sum, s) => sum + (s.cost ?? 0), 0);
    return { active: a, inactive: i, totalCost: cost };
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">terminal</span>
        <p className="text-text-secondary text-xs text-center">Nenhuma sessao encontrada</p>
        <p className="text-text-secondary text-[9px] text-center max-w-[200px]">
          Sessoes aparecem quando o MC Service esta ativo
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {/* Summary strip */}
      <div className="flex items-center gap-4 py-2 px-3 bg-bg-base border border-border-panel rounded-sm">
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Total</span>
          <span className="text-base font-black font-mono text-text-primary">{sessions.length}</span>
        </div>
        <div className="w-px h-8 bg-border-panel" />
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Ativas</span>
          <span className="text-base font-black font-mono text-brand-mint">{active.length}</span>
        </div>
        <div className="w-px h-8 bg-border-panel" />
        <div className="flex flex-col">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Custo total</span>
          <span className="text-base font-black font-mono text-accent-orange">{formatCost(totalCost)}</span>
        </div>
      </div>

      {/* Active sessions */}
      {active.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>Sessoes ativas — {active.length}</SectionLabel>
          {active.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}

      {/* Inactive sessions */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <SectionLabel>Historico — {inactive.length}</SectionLabel>
          {inactive.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Active sub-panel ──────────────────────────────────────────────────────────

function ActiveSubPanel() {
  const subTab = useMissionControlStore((s) => s.activeObserveSubTab);

  switch (subTab) {
    case 'atividade': return <MCActivityPanel />;
    case 'sessoes':   return <SessionsOverview />;
    case 'tokens':    return <MCTokenDashboardPanel />;
    case 'logs':      return <MCLogViewerPanel />;
    default:          return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCObservePanel() {
  return (
    <div className="flex flex-col h-full">
      <ObserveSubTabBar />
      <div className="flex-1 overflow-y-auto">
        <ActiveSubPanel />
      </div>
    </div>
  );
}
