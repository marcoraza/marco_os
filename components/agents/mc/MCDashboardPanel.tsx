/**
 * MCDashboardPanel -- "Painel" tab.
 *
 * Full-surface dashboard that consolidates agents, tasks, cost, system
 * health, and active sessions into a dense, scannable grid.
 * All data comes from useMissionControlStore via granular selectors.
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { Ring } from '../../ui/Ring';
import { MiniDonutChart, MiniLineAreaChart } from '../../ui/LightweightCharts';
import { MCAgentAvatar } from './MCAgentAvatar';
import {
  useMissionControlStore,
  type MCAgent,
  type MCTask,
  type MCSession,
  type MCTokenUsage,
} from '../../../store/missionControl';

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

const STATUS_LABEL: Record<MCAgent['status'], string> = {
  idle: 'idle',
  busy: 'ativo',
  error: 'erro',
  offline: 'off',
};

const STATUS_TEXT_CLASS: Record<MCAgent['status'], string> = {
  idle: 'text-brand-mint',
  busy: 'text-accent-orange',
  error: 'text-accent-red',
  offline: 'text-text-secondary',
};

const TASK_STATUS_COLOR: Record<string, string> = {
  in_progress: 'text-accent-blue',
  review: 'text-accent-purple',
  quality_review: 'text-accent-purple',
  assigned: 'text-accent-orange',
  inbox: 'text-text-secondary',
  done: 'text-brand-mint',
  awaiting_owner: 'text-accent-orange',
};

const TASK_STATUS_LABEL: Record<string, string> = {
  in_progress: 'Em progresso',
  review: 'Review',
  quality_review: 'QA Review',
  assigned: 'Atribuidas',
  inbox: 'Inbox',
  done: 'Concluidas',
  awaiting_owner: 'Aguardando',
};

/** Aggregate daily cost from token usage entries for the last 7 days. */
function buildDailyCosts(tokenUsage: MCTokenUsage[]): Array<{ day: string; cost: number }> {
  const map = new Map<string, number>();

  // Generate the last 7 day labels so chart always has 7 points
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86_400_000);
    const key = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
    const isoDate = date.toISOString().slice(0, 10);
    // Use isoDate as lookup, key as display
    map.set(isoDate, 0);
  }

  for (const entry of tokenUsage) {
    const prev = map.get(entry.date) ?? 0;
    map.set(entry.date, prev + entry.cost);
  }

  // Convert to ordered array with display labels
  const result: Array<{ day: string; cost: number }> = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86_400_000);
    const isoDate = date.toISOString().slice(0, 10);
    const label = date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3);
    result.push({ day: label, cost: map.get(isoDate) ?? 0 });
  }

  return result;
}

/** Aggregate cost per agent from token usage + sessions. */
function buildAgentCosts(
  sessions: MCSession[],
  tokenUsage: MCTokenUsage[],
  agents: MCAgent[],
): Array<{ name: string; value: number }> {
  const costMap = new Map<string, number>();

  // Initialize with known agents
  for (const agent of agents) {
    if (!agent.hidden) costMap.set(agent.name, 0);
  }

  // Sum from sessions (most direct)
  for (const session of sessions) {
    if (session.agent && session.cost != null) {
      const prev = costMap.get(session.agent) ?? 0;
      costMap.set(session.agent, prev + session.cost);
    }
  }

  // If session costs are all zero, estimate from token usage by matching sessionId patterns
  const totalFromSessions = Array.from(costMap.values()).reduce((a, b) => a + b, 0);
  if (totalFromSessions < 0.001 && tokenUsage.length > 0) {
    // Distribute token costs evenly across agents as fallback
    const totalTokenCost = tokenUsage.reduce((sum, t) => sum + t.cost, 0);
    const agentNames = Array.from(costMap.keys());
    const perAgent = agentNames.length > 0 ? totalTokenCost / agentNames.length : 0;
    for (const name of agentNames) {
      costMap.set(name, perAgent);
    }
  }

  return Array.from(costMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const DONUT_COLORS = [
  'var(--color-brand-mint)',
  'var(--color-accent-blue)',
  'var(--color-accent-purple)',
  'var(--color-accent-orange)',
  'var(--color-accent-red)',
];

// ── Card wrapper ─────────────────────────────────────────────────────────────

function DashCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-surface border border-border-panel rounded-sm p-3', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
      {children}
    </div>
  );
}

// ── Top Row: Agents ──────────────────────────────────────────────────────────

function AgentsCard({ agents, onAgentClick }: { agents: MCAgent[]; onAgentClick?: (id: string) => void }) {
  return (
    <DashCard className="flex flex-col">
      <CardHeader>Agentes ({agents.length})</CardHeader>
      <div className="flex flex-col gap-1.5 flex-1">
        {agents.map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => onAgentClick?.(String(agent.id))}
            className={cn(
              'flex items-center gap-2 w-full text-left py-1 px-1 rounded-sm',
              'hover:bg-surface-hover transition-all duration-300 ease-out',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
            )}
          >
            <MCAgentAvatar name={agent.name} status={agent.status} size="sm" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[10px] font-bold text-text-primary truncate">
                {agent.name}
              </span>
              <span className="text-[7px] font-mono text-text-secondary truncate">
                {agent.role}
              </span>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className={cn('text-[8px] font-bold uppercase', STATUS_TEXT_CLASS[agent.status])}>
                {STATUS_LABEL[agent.status]}
              </span>
              <span className="text-[7px] font-mono text-text-secondary">
                {relativeTime(agent.last_seen)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </DashCard>
  );
}

// ── Top Row: Tasks ───────────────────────────────────────────────────────────

function TasksCard({ tasks }: { tasks: MCTask[] }) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      in_progress: 0,
      review: 0,
      quality_review: 0,
      assigned: 0,
      inbox: 0,
      done: 0,
      awaiting_owner: 0,
    };
    for (const t of tasks) {
      c[t.status] = (c[t.status] ?? 0) + 1;
    }
    return c;
  }, [tasks]);

  const total = tasks.length;
  const doneCount = counts.done ?? 0;
  const completePct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Active statuses to display (skip done for the list, shown in ring)
  const displayStatuses = ['in_progress', 'review', 'quality_review', 'assigned', 'inbox', 'awaiting_owner'];

  return (
    <DashCard className="flex flex-col">
      <CardHeader>Tasks ativas</CardHeader>
      <div className="flex gap-3 flex-1">
        {/* Status list */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {displayStatuses.map((status) => {
            const count = counts[status] ?? 0;
            if (count === 0) return null;
            return (
              <div key={status} className="flex items-center justify-between">
                <span className="text-[9px] text-text-secondary truncate">
                  {TASK_STATUS_LABEL[status] ?? status}
                </span>
                <span className={cn('text-[10px] font-bold font-mono', TASK_STATUS_COLOR[status])}>
                  {count}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-border-panel/50">
            <span className="text-[9px] text-text-secondary">Total</span>
            <span className="text-[10px] font-bold font-mono text-text-primary">{total}</span>
          </div>
        </div>

        {/* Completion ring */}
        <div className="flex items-center justify-center shrink-0">
          <Ring value={completePct} size={56} strokeWidth={4} color="mint" label="feito" />
        </div>
      </div>
    </DashCard>
  );
}

// ── Top Row: Cost 7 days ─────────────────────────────────────────────────────

function Cost7DaysCard({ tokenUsage }: { tokenUsage: MCTokenUsage[] }) {
  const dailyCosts = useMemo(() => buildDailyCosts(tokenUsage), [tokenUsage]);
  const totalCost = useMemo(
    () => dailyCosts.reduce((sum, d) => sum + d.cost, 0),
    [dailyCosts],
  );

  return (
    <DashCard className="flex flex-col">
      <CardHeader>Custo 7 dias</CardHeader>
      <div className="flex-1 min-h-0" style={{ minHeight: '80px' }}>
        <MiniLineAreaChart
          data={dailyCosts}
          xKey="day"
          series={[{ key: 'cost', label: 'Custo', color: 'var(--color-brand-mint)', fillOpacity: 0.15 }]}
          compact
          showGrid={false}
        />
      </div>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-sm font-black font-mono text-text-primary">
          ${totalCost.toFixed(2)}
        </span>
        <span className="text-[8px] text-text-secondary uppercase tracking-widest">total</span>
      </div>
    </DashCard>
  );
}

// ── Middle Row: Cost per agent ───────────────────────────────────────────────

function CostPerAgentCard({
  sessions,
  tokenUsage,
  agents,
}: {
  sessions: MCSession[];
  tokenUsage: MCTokenUsage[];
  agents: MCAgent[];
}) {
  const agentCosts = useMemo(
    () => buildAgentCosts(sessions, tokenUsage, agents),
    [sessions, tokenUsage, agents],
  );
  const totalCost = useMemo(
    () => agentCosts.reduce((sum, a) => sum + a.value, 0),
    [agentCosts],
  );

  return (
    <DashCard className="flex flex-col">
      <CardHeader>Custo por agente</CardHeader>
      <div className="flex items-center gap-3 flex-1">
        {/* Donut */}
        <div className="w-24 h-24 shrink-0">
          <MiniDonutChart
            data={agentCosts}
            colors={DONUT_COLORS}
            centerLabel={`$${totalCost.toFixed(2)}`}
            centerSubLabel="total"
          />
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {agentCosts.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
              />
              <span className="text-[9px] text-text-primary truncate flex-1">{item.name}</span>
              <span className="text-[9px] font-mono text-text-secondary shrink-0">
                ${item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashCard>
  );
}

// ── Middle Row: System ───────────────────────────────────────────────────────

function SystemCard({ agents, memoryFileCount }: { agents: MCAgent[]; memoryFileCount: number }) {
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const mcOnline = connectionStatus === 'connected';

  const services: Array<{ name: string; icon: string; online: boolean }> = [
    { name: 'MC Service', icon: 'dns', online: mcOnline },
    { name: 'Gateway', icon: 'hub', online: false },
    { name: 'Bridge', icon: 'sync_alt', online: false },
  ];

  return (
    <DashCard className="flex flex-col">
      <CardHeader>Sistema</CardHeader>
      <div className="flex flex-col gap-1.5 flex-1">
        {services.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn('w-1.5 h-1.5 rounded-full', svc.online ? 'bg-brand-mint' : 'bg-text-secondary')} />
              <Icon name={svc.icon} size="xs" className="text-text-secondary" />
              <span className="text-[9px] font-bold text-text-primary">{svc.name}</span>
            </div>
            <span className={cn(
              'text-[7px] font-bold uppercase tracking-widest',
              svc.online ? 'text-brand-mint' : 'text-text-secondary',
            )}>
              {svc.online ? 'Online' : 'Offline'}
            </span>
          </div>
        ))}

        {/* Compact stats */}
        <div className="border-t border-border-panel/50 mt-auto pt-1.5 grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-[7px] uppercase tracking-widest text-text-secondary">Uptime</span>
            <span className="text-[9px] font-mono text-text-primary">--</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] uppercase tracking-widest text-text-secondary">DB</span>
            <span className="text-[9px] font-mono text-text-primary">--</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[7px] uppercase tracking-widest text-text-secondary">Memory</span>
            <span className="text-[9px] font-mono text-text-primary">
              {memoryFileCount > 0 ? `${memoryFileCount} arq` : '--'}
            </span>
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ── Bottom Row: Sessions ─────────────────────────────────────────────────────

function SessionsCard({ sessions }: { sessions: MCSession[] }) {
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)),
    [sessions],
  );

  if (sorted.length === 0) {
    return (
      <DashCard>
        <CardHeader>Sessoes ativas</CardHeader>
        <div className="flex items-center justify-center py-3">
          <Icon name="terminal" size="sm" className="text-text-secondary opacity-40" />
          <span className="text-[9px] text-text-secondary ml-2">Nenhuma sessao</span>
        </div>
      </DashCard>
    );
  }

  return (
    <DashCard>
      <CardHeader>Sessoes ativas</CardHeader>
      <div className="flex flex-col gap-1">
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_auto_60px_60px_50px] gap-2 items-center px-1">
          <span />
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">Agente</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">Modelo</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary text-right">Idade</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary text-right">Tokens</span>
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary text-right">Custo</span>
        </div>

        {/* Rows */}
        {sorted.map((session) => (
          <div
            key={session.id}
            className={cn(
              'grid grid-cols-[24px_1fr_auto_60px_60px_50px] gap-2 items-center px-1 py-1.5 rounded-sm',
              session.active && 'border-l-2 border-l-brand-mint bg-brand-mint/5',
              !session.active && 'border-l-2 border-l-transparent',
            )}
          >
            {/* Avatar */}
            <MCAgentAvatar
              name={session.agent ?? 'Unknown'}
              status={session.active ? 'busy' : 'offline'}
              size="sm"
              showStatus={false}
            />

            {/* Agent name */}
            <span className="text-[10px] font-bold text-text-primary truncate">
              {session.agent ?? '--'}
            </span>

            {/* Model badge */}
            <span className={cn(
              'text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-sm border',
              'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
            )}>
              {session.model}
            </span>

            {/* Age */}
            <span className="text-[9px] font-mono text-text-secondary text-right">
              {session.age || '--'}
            </span>

            {/* Tokens */}
            <span className="text-[9px] font-mono text-text-secondary text-right">
              {session.tokens}
            </span>

            {/* Cost */}
            <span className="text-[9px] font-mono text-text-primary text-right">
              {session.cost != null ? `$${session.cost.toFixed(3)}` : '--'}
            </span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface MCDashboardPanelProps {
  onAgentClick?: (agentId: string) => void;
}

export function MCDashboardPanel({ onAgentClick }: MCDashboardPanelProps) {
  const agents = useMissionControlStore((s) => s.agents);
  const tasks = useMissionControlStore((s) => s.tasks);
  const sessions = useMissionControlStore((s) => s.sessions);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const memoryFiles = useMissionControlStore((s) => s.memoryFiles);

  const visibleAgents = useMemo(() => agents.filter((a) => !a.hidden), [agents]);
  const memoryFileCount = useMemo(() => {
    // Count leaf files recursively
    function countFiles(files: typeof memoryFiles): number {
      let count = 0;
      for (const f of files) {
        if (f.type === 'file') count++;
        if (f.children) count += countFiles(f.children);
      }
      return count;
    }
    return countFiles(memoryFiles);
  }, [memoryFiles]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Top row: 3 cards */}
      <div className="grid grid-cols-3 gap-3">
        <AgentsCard agents={visibleAgents} onAgentClick={onAgentClick} />
        <TasksCard tasks={tasks} />
        <Cost7DaysCard tokenUsage={tokenUsage} />
      </div>

      {/* Middle row: 2 cards */}
      <div className="grid grid-cols-2 gap-3">
        <CostPerAgentCard sessions={sessions} tokenUsage={tokenUsage} agents={visibleAgents} />
        <SystemCard agents={visibleAgents} memoryFileCount={memoryFileCount} />
      </div>

      {/* Bottom row: full-width sessions */}
      <SessionsCard sessions={sessions} />
    </div>
  );
}
