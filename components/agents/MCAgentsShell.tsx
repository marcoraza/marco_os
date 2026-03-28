/**
 * MCAgentsShell — V2 portage
 *
 * Mission Control Overview with:
 * - MCMetricBar (sticky top)
 * - AlertBanner (conditional, expandable)
 * - 7 tabs: Painel | Tarefas | Observar | Chat | Automacao | Relatorios | Sistema
 * - MCAgentProfile overlay (click agent → right drawer)
 * - MCTaskDetailDrawer overlay (click task → right drawer)
 *
 * All store access uses granular selectors to prevent render cascades.
 */
import React, { Suspense, lazy, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useMissionControlStore, type MCAgentTab, type MCTask } from '../../store/missionControl';
import { mcApi } from '../../lib/mcApi';
import { Icon } from '../ui/Icon';
import { MCMetricBar } from './mc/MCMetricBar';
import { MCTaskDetailDrawer } from './mc/MCTaskDetailDrawer';

// Lazy-loaded panels (code-split per tab)
const MCDashboardPanel = lazy(() => import('./mc/MCOverviewPanel').then((m) => ({ default: m.MCOverviewPanel })));
const MCAgentKanban = lazy(() => import('./mc/MCTaskBoardPanel'));
const MCReportsPanel = lazy(() => import('./mc/MCReportsPanel'));
const MCChatPanel = lazy(() => import('./mc/MCChatPanel').then((m) => ({ default: m.MCChatPanel })));
const MCObservePanel = lazy(() => import('./mc/MCObservePanel').then((m) => ({ default: m.MCObservePanel })));
const MCAutomationPanel = lazy(() => import('./mc/MCAutomationPanel').then((m) => ({ default: m.MCAutomationPanel })));
const MCSystemPanel = lazy(() => import('./mc/MCSystemPanel').then((m) => ({ default: m.MCSystemPanel })));
const MCChatTabPanel = lazy(() => import('./mc/MCChatTabPanel').then((m) => ({ default: m.MCChatTabPanel })));
const MCAgentProfile = lazy(() => import('./mc/MCAgentProfile').then((m) => ({ default: m.MCAgentProfile })));

const TABS: { id: MCAgentTab; label: string; icon: string }[] = [
  { id: 'painel',     label: 'Painel',      icon: 'dashboard' },
  { id: 'tarefas',    label: 'Tarefas',     icon: 'task_alt' },
  { id: 'observar',   label: 'Observar',    icon: 'monitoring' },
  { id: 'chat',       label: 'Chat',        icon: 'forum' },
  { id: 'automacao',  label: 'Automacao',   icon: 'autoplay' },
  { id: 'relatorios', label: 'Relatorios',  icon: 'analytics' },
  { id: 'sistema',    label: 'Sistema',     icon: 'settings_suggest' },
];

function TabBar() {
  const activeTab = useMissionControlStore((s) => s.activeTab);
  const setActiveTab = useMissionControlStore((s) => s.setActiveTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel px-3">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 whitespace-nowrap',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatOverdue(dueDate: number): string {
  const diff = Date.now() - dueDate;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m atrasado`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atrasado`;
  return `${Math.floor(diff / 86_400_000)}d atrasado`;
}

function formatDueDate(ts: number): string {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

// ── Alert Banner (expandable) ───────────────────────────────────────────────

function AlertBanner() {
  const tasks = useMissionControlStore((s) => s.tasks);
  const [expanded, setExpanded] = useState(false);

  const { blockers, overdue, count } = useMemo(() => {
    const b = tasks.filter(
      (t) => t.status === 'review' || t.status === 'quality_review',
    );
    const o = tasks.filter(
      (t) => t.due_date && t.due_date < Date.now() && t.status !== 'done',
    );
    return { blockers: b, overdue: o, count: b.length + o.length };
  }, [tasks]);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleItemClick = useCallback((taskId: number) => {
    console.log('alert-banner-task-click', taskId);
  }, []);

  if (count === 0) return null;

  return (
    <div className="mx-3 mt-2">
      {/* Collapsed header (always visible) */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full bg-accent-orange/10 border border-accent-orange/30 rounded-sm px-3 py-2 flex items-center justify-between transition-all',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
          expanded && 'rounded-b-none border-b-0',
        )}
      >
        <span className="flex items-center gap-2 text-accent-orange text-xs">
          <Icon name="warning" size="sm" />
          {count} {count === 1 ? 'item requer atencao' : 'itens requerem atencao'}
        </span>
        <Icon
          name={expanded ? 'expand_less' : 'chevron_right'}
          size="sm"
          className="text-accent-orange"
        />
      </button>

      {/* Expanded detail list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="bg-accent-orange/5 border border-accent-orange/30 border-t-0 rounded-b-sm px-3 py-2 flex flex-col gap-1.5">
              {/* Blocker tasks */}
              {blockers.length > 0 && (
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-accent-orange mb-1">
                    Bloqueios ({blockers.length})
                  </div>
                  {blockers.map((task) => (
                    <AlertItem
                      key={task.id}
                      task={task}
                      variant="blocker"
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}

              {/* Overdue tasks */}
              {overdue.length > 0 && (
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-accent-red mb-1">
                    Atrasados ({overdue.length})
                  </div>
                  {overdue.map((task) => (
                    <AlertItem
                      key={task.id}
                      task={task}
                      variant="overdue"
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertItem({
  task,
  variant,
  onClick,
}: {
  task: MCTask;
  variant: 'blocker' | 'overdue';
  onClick: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onClick(task.id)}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1 rounded-sm text-left transition-all',
        'hover:bg-surface-hover',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
      )}
    >
      <Icon
        name={variant === 'blocker' ? 'block' : 'schedule'}
        size="xs"
        className={variant === 'blocker' ? 'text-accent-orange' : 'text-accent-red'}
      />
      <span className="flex-1 min-w-0">
        <span className="text-[9px] text-text-primary truncate block">{task.title}</span>
        <span className="text-[8px] text-text-secondary font-mono flex items-center gap-2">
          {variant === 'blocker' ? (
            <>
              {task.assigned_to && <span>{task.assigned_to}</span>}
              {task.ticket_ref && (
                <span className="text-accent-blue">{task.ticket_ref}</span>
              )}
            </>
          ) : (
            <>
              {task.due_date && <span>{formatDueDate(task.due_date)}</span>}
              {task.due_date && (
                <span className="text-accent-red">{formatOverdue(task.due_date)}</span>
              )}
            </>
          )}
        </span>
      </span>
      <Icon name="chevron_right" size="xs" className="text-text-secondary shrink-0" />
    </button>
  );
}

// ── Tab Stubs (replaced in Sprints 1-3) ────────────────────────────────────




// ── Active Panel ────────────────────────────────────────────────────────────

function ActivePanel({ onAgentClick }: { onAgentClick?: (agentId: string) => void }) {
  const activeTab = useMissionControlStore((s) => s.activeTab);
  const agentCount = useMissionControlStore((s) => s.agents.length);

  const panelContent = useMemo(() => {
    switch (activeTab) {
      case 'painel':     return <MCDashboardPanel onAgentClick={onAgentClick} />;
      case 'tarefas':    return <MCAgentKanban />;
      case 'observar':   return <MCObservePanel />;
      case 'chat':       return <MCChatTabPanel />;
      case 'automacao':  return <MCAutomationPanel />;
      case 'relatorios': return <MCReportsPanel />;
      case 'sistema':    return <MCSystemPanel />;
      default:           return null;
    }
  }, [activeTab, onAgentClick]);

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
    <Suspense
      fallback={
        <div className="space-y-2 p-2">
          <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
          <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {panelContent}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

// ── Keyboard Navigation ─────────────────────────────────────────────────────

function useMCKeyboardNav(onAgentClick?: (agentId: string) => void) {
  const agents = useMissionControlStore((s) => s.agents);
  const focusedAgentId = useMissionControlStore((s) => s.focusedAgentId);
  const setFocusedAgentId = useMissionControlStore((s) => s.setFocusedAgentId);
  const setActiveTab = useMissionControlStore((s) => s.setActiveTab);
  const showConfigView = useMissionControlStore((s) => s.showConfigView);
  const setShowConfigView = useMissionControlStore((s) => s.setShowConfigView);
  const profileAgentId = useMissionControlStore((s) => s.profileAgentId);
  const setProfileAgentId = useMissionControlStore((s) => s.setProfileAgentId);
  const taskDetailId = useMissionControlStore((s) => s.taskDetailId);
  const setTaskDetailId = useMissionControlStore((s) => s.setTaskDetailId);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;
      if (isInput || e.metaKey || e.ctrlKey) return;

      const visibleAgents = agents.filter((a) => !a.hidden);
      const currentIndex = visibleAgents.findIndex((a) => a.id === focusedAgentId);

      switch (e.key) {
        case 'j': {
          e.preventDefault();
          const nextIndex = currentIndex < visibleAgents.length - 1 ? currentIndex + 1 : 0;
          setFocusedAgentId(visibleAgents[nextIndex]?.id ?? null);
          break;
        }
        case 'k': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleAgents.length - 1;
          setFocusedAgentId(visibleAgents[prevIndex]?.id ?? null);
          break;
        }
        case 'Enter': {
          if (focusedAgentId !== null && onAgentClick) {
            e.preventDefault();
            onAgentClick(String(focusedAgentId));
          }
          break;
        }
        case 'Escape': {
          // Close overlays in priority order: task detail → agent profile → config view
          if (taskDetailId != null) {
            e.preventDefault();
            setTaskDetailId(null);
          } else if (profileAgentId != null) {
            e.preventDefault();
            setProfileAgentId(null);
          } else if (showConfigView) {
            e.preventDefault();
            setShowConfigView(false);
          }
          break;
        }
        case 'Backspace': {
          if (showConfigView) {
            e.preventDefault();
            setShowConfigView(false);
          }
          break;
        }
        case '1': { e.preventDefault(); setActiveTab('painel'); break; }
        case '2': { e.preventDefault(); setActiveTab('tarefas'); break; }
        case '3': { e.preventDefault(); setActiveTab('observar'); break; }
        case '4': { e.preventDefault(); setActiveTab('chat'); break; }
        case '5': { e.preventDefault(); setActiveTab('automacao'); break; }
        case '6': { e.preventDefault(); setActiveTab('relatorios'); break; }
        case '7': { e.preventDefault(); setActiveTab('sistema'); break; }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [agents, focusedAgentId, onAgentClick, setFocusedAgentId, setActiveTab, showConfigView, setShowConfigView, profileAgentId, setProfileAgentId, taskDetailId, setTaskDetailId]);
}

// ── Shell ────────────────────────────────────────────────────────────────────

interface MCAgentsShellProps {
  onAgentClick?: (agentId: string) => void;
}

export default function MCAgentsShell({ onAgentClick }: MCAgentsShellProps) {
  // Agent clicks open the profile overlay instead of routing to agent-detail
  const setProfileAgentId = useMissionControlStore((s) => s.setProfileAgentId);
  const handleAgentClick = useCallback((agentId: string) => {
    setProfileAgentId(agentId);
    // Also call external handler if provided (e.g. AppContentRouter analytics)
    onAgentClick?.(agentId);
  }, [setProfileAgentId, onAgentClick]);

  // Keyboard navigation (j/k/Enter/Backspace/1-7)
  useMCKeyboardNav(handleAgentClick);

  // One-time health check
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
      {/* Sticky metric bar */}
      <MCMetricBar />

      {/* Main content area: left (tabs + content) + right sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Left: tabs + panel content */}
        <div className="flex-1 flex flex-col min-w-0">
          <TabBar />
          <AlertBanner />
          <div className="flex-1 overflow-y-auto p-3">
            <ActivePanel onAgentClick={handleAgentClick} />
          </div>
        </div>

      </div>

      {/* MCAgentProfile overlay */}
      <AgentProfileOverlay />

      {/* MCTaskDetailDrawer overlay */}
      <MCTaskDetailDrawer />
    </div>
  );
}

// ── Agent profile overlay ────────────────────────────────────────────────────

function AgentProfileOverlay() {
  const profileAgentId = useMissionControlStore((s) => s.profileAgentId);
  const setProfileAgentId = useMissionControlStore((s) => s.setProfileAgentId);
  const close = useCallback(() => setProfileAgentId(null), [setProfileAgentId]);

  return (
    <AnimatePresence>
      {profileAgentId && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-[480px] z-50 bg-bg-base border-l border-border-panel flex flex-col overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
          >
            <Suspense fallback={
              <div className="p-4 space-y-2">
                <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
                <div className="bg-border-panel animate-pulse rounded-sm h-12 w-full" />
              </div>
            }>
              <MCAgentProfile agentId={profileAgentId} onBack={close} />
            </Suspense>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
