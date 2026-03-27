/**
 * MCAgentProfile — scrollable agent profile with collapsible sections.
 * Replaces the old tab-based MCAgentDetail.
 *
 * Sections:
 *  - Header + metric strip (always visible)
 *  - Tasks abertas (expanded)
 *  - Sessoes ativas (expanded)
 *  - Atividade recente (expanded)
 *  - Memoria (collapsed)
 *  - Ferramentas & Skills (collapsed)
 *  - Token Usage (collapsed)
 *  - Configuracao (collapsed)
 *
 * All store access via granular selectors.
 */
import React, { useState, useMemo, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { StatusDot } from '../../ui/StatusDot';
import { useMissionControlStore, type MCAgent } from '../../../store/missionControl';
import { MCAgentTaskStrip } from './MCAgentTaskStrip';
import { MCAgentSessions } from './MCAgentSessions';

const MCActivityPanel = lazy(() => import('./MCActivityPanel').then((m) => ({ default: m.MCActivityPanel })));
const MCMemoryBrowserPanel = lazy(() => import('./MCMemoryBrowserPanel').then((m) => ({ default: m.MCMemoryBrowserPanel })));
const MCTokenDashboardPanel = lazy(() => import('./MCTokenDashboardPanel'));

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT_COLOR: Record<MCAgent['status'], 'mint' | 'orange' | 'red' | 'blue'> = {
  idle: 'mint',
  busy: 'orange',
  error: 'red',
  offline: 'blue',
};

function relativeTime(ts?: number): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

// ── Collapsible Section ─────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-panel rounded-sm">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2.5 text-left transition-all',
          'hover:bg-surface-hover',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        )}
      >
        <span className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.15 }}
            className="inline-flex"
          >
            <Icon name="expand_more" size="sm" className="text-text-secondary" />
          </motion.span>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
            {title}
          </span>
          {count && (
            <span className="text-[8px] font-mono text-text-secondary">({count})</span>
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Agent Header ────────────────────────────────────────────────────────────

function ProfileHeader({
  agent,
  onBack,
}: {
  agent: MCAgent;
  onBack: () => void;
}) {
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);

  const stats = useMemo(() => {
    const agentTasks = tasks.filter(
      (t) => t.assigned_to?.toLowerCase() === agent.name.toLowerCase(),
    );
    const inProgress = agentTasks.filter((t) => t.status === 'in_progress').length;
    const done = agentTasks.filter((t) => t.status === 'done').length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const cost7d = tokenUsage
      .filter((t) => t.date >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.cost, 0);

    return { inProgress, done, cost7d: `$${cost7d.toFixed(2)}` };
  }, [agent.name, tasks, tokenUsage]);

  return (
    <div className="border-b border-border-panel px-4 py-3">
      {/* Top row: back + actions */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-brand-mint transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm px-1 py-0.5"
        >
          <Icon name="arrow_back" size="xs" />
          Agentes
        </button>

        <div className="flex items-center gap-2">
          <button
            className="bg-surface border border-border-panel text-text-primary rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-surface-hover transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="chat" size="xs" />
              Chat
            </span>
          </button>
          <button
            className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            <span className="flex items-center gap-1.5">
              <Icon name="send" size="xs" />
              Enviar Missao
            </span>
          </button>
        </div>
      </div>

      {/* Agent info */}
      <div className="flex items-center gap-3 mb-2">
        <StatusDot
          color={STATUS_DOT_COLOR[agent.status]}
          pulse={agent.status === 'busy'}
          glow={agent.status === 'busy'}
          size="md"
        />
        <h2 className="text-sm font-bold text-text-primary">{agent.name}</h2>
        <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary bg-surface border border-border-panel px-2 py-0.5 rounded-sm">
          {agent.role}
        </span>
        <span className="text-[9px] font-mono text-text-secondary">
          {agent.status} · {relativeTime(agent.last_seen)}
        </span>
      </div>

      {/* Metric strip */}
      <div className="flex items-center gap-4 text-[9px] font-mono text-text-secondary">
        <span>
          Tasks: <span className="text-accent-blue">{stats.inProgress}</span> em prog / <span className="text-brand-mint">{stats.done}</span> done
        </span>
        <span>Custo 7d: <span className="text-text-primary">{stats.cost7d}</span></span>
      </div>
    </div>
  );
}

// ── Agent Tools List ────────────────────────────────────────────────────────

function AgentToolsList({ agent }: { agent: MCAgent }) {
  const tools = useMemo(() => {
    const value = agent.config?.tools;
    if (Array.isArray(value)) return value.map(String);
    if (value && typeof value === 'object') return Object.keys(value as Record<string, unknown>);
    return [];
  }, [agent.config]);

  if (tools.length === 0) {
    return <p className="text-[10px] text-text-secondary">Nenhuma ferramenta configurada.</p>;
  }

  return (
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
  );
}

// ── Agent Config ────────────────────────────────────────────────────────────

function AgentConfigSection({ agent }: { agent: MCAgent }) {
  const entries = Object.entries(agent.config ?? {}).filter(([key]) => key !== 'tools');

  if (entries.length === 0) {
    return <p className="text-[10px] text-text-secondary">Nenhuma configuracao exposta.</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="border border-border-panel rounded-sm px-3 py-2">
          <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{key}</div>
          <div className="mt-1 text-[10px] font-mono text-text-primary break-all">
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

interface MCAgentProfileProps {
  agentId: string;
  onBack: () => void;
}

export function MCAgentProfile({ agentId, onBack }: MCAgentProfileProps) {
  const agent = useMissionControlStore(
    (s) => s.agents.find((a) => String(a.id) === agentId) ?? null,
  );
  const tasks = useMissionControlStore((s) => s.tasks);
  const sessions = useMissionControlStore((s) => s.sessions);
  const memoryFiles = useMissionControlStore((s) => s.memoryFiles);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);

  const openTaskCount = useMemo(
    () =>
      agent
        ? tasks.filter(
            (t) =>
              t.assigned_to?.toLowerCase() === agent.name.toLowerCase() &&
              t.status !== 'done',
          ).length
        : 0,
    [agent, tasks],
  );

  const sessionCount = useMemo(
    () =>
      agent
        ? sessions.filter(
            (s) => s.agent?.toLowerCase() === agent.name.toLowerCase() && s.active,
          ).length
        : 0,
    [agent, sessions],
  );

  const memoryInfo = useMemo(() => {
    const count = memoryFiles.length;
    const totalSize = memoryFiles.reduce((sum, f) => sum + (f.size ?? 0), 0);
    const sizeLabel = totalSize > 1_000_000
      ? `${(totalSize / 1_000_000).toFixed(1)}MB`
      : totalSize > 1_000
        ? `${(totalSize / 1_000).toFixed(0)}KB`
        : `${totalSize}B`;
    return { count, sizeLabel };
  }, [memoryFiles]);

  const toolCount = useMemo(() => {
    if (!agent?.config?.tools) return 0;
    const tools = agent.config.tools;
    if (Array.isArray(tools)) return tools.length;
    if (typeof tools === 'object') return Object.keys(tools as Record<string, unknown>).length;
    return 0;
  }, [agent?.config]);

  const tokenSummary = useMemo(() => {
    if (!agent) return '';
    const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const recent = tokenUsage.filter((t) => t.date >= sevenDaysAgo);
    const cost = recent.reduce((sum, t) => sum + t.cost, 0);

    // Find top model
    const modelTotals = new Map<string, number>();
    for (const t of recent) {
      modelTotals.set(t.model, (modelTotals.get(t.model) ?? 0) + t.totalTokens);
    }
    let topModel = '';
    let topTokens = 0;
    const totalTokens = recent.reduce((sum, t) => sum + t.totalTokens, 0);
    for (const [model, tokens] of modelTotals) {
      if (tokens > topTokens) {
        topModel = model;
        topTokens = tokens;
      }
    }
    const topPct = totalTokens > 0 ? Math.round((topTokens / totalTokens) * 100) : 0;

    if (recent.length === 0) return 'sem uso';

    const shortModel = topModel.length > 12 ? topModel.slice(0, 12) : topModel;
    return `7d: $${cost.toFixed(2)} · top: ${shortModel} ${topPct}%`;
  }, [agent, tokenUsage]);

  if (!agent) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">hub</span>
        <p className="text-text-primary text-sm font-bold">Agente nao encontrado</p>
        <button
          onClick={onBack}
          className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest border border-border-panel rounded-sm text-text-primary hover:text-brand-mint hover:border-brand-mint/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Voltar para agentes
        </button>
      </div>
    );
  }

  const agentFilter = agent.name;

  return (
    <div className="flex flex-col h-full">
      <ProfileHeader agent={agent} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Tasks Abertas */}
        <CollapsibleSection
          title="Tasks abertas"
          count={openTaskCount > 0 ? `${openTaskCount} abertas` : '0'}
          defaultOpen
        >
          <MCAgentTaskStrip agentName={agentFilter} />
        </CollapsibleSection>

        {/* Sessoes Ativas */}
        <CollapsibleSection
          title="Sessoes ativas"
          count={sessionCount > 0 ? `${sessionCount} ativas` : '0'}
          defaultOpen
        >
          <MCAgentSessions agentName={agentFilter} />
        </CollapsibleSection>

        {/* Atividade Recente */}
        <CollapsibleSection title="Atividade recente" count="5" defaultOpen>
          <Suspense fallback={<div className="bg-border-panel animate-pulse rounded-sm h-16" />}>
            <MCActivityPanel agentId={agentFilter} />
          </Suspense>
        </CollapsibleSection>

        {/* Memoria */}
        <CollapsibleSection
          title="Memoria"
          count={memoryInfo.count > 0 ? `${memoryInfo.count} arquivos · ${memoryInfo.sizeLabel}` : undefined}
        >
          <Suspense fallback={<div className="bg-border-panel animate-pulse rounded-sm h-16" />}>
            <MCMemoryBrowserPanel agentId={agentFilter} />
          </Suspense>
        </CollapsibleSection>

        {/* Ferramentas & Skills */}
        <CollapsibleSection
          title="Ferramentas & Skills"
          count={toolCount > 0 ? `${toolCount} tools` : undefined}
        >
          <AgentToolsList agent={agent} />
        </CollapsibleSection>

        {/* Token Usage */}
        <CollapsibleSection
          title="Token Usage"
          count={tokenSummary || undefined}
        >
          <Suspense fallback={<div className="bg-border-panel animate-pulse rounded-sm h-16" />}>
            <MCTokenDashboardPanel agentId={agentFilter} />
          </Suspense>
        </CollapsibleSection>

        {/* Configuracao */}
        <CollapsibleSection title="Configuracao">
          <AgentConfigSection agent={agent} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
