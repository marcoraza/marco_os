/**
 * MCRightSidebar — contextual right sidebar for Mission Control Overview.
 * Shows: focused agent card + full roster + next cron executions.
 * All store access via granular selectors.
 */
import React, { useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCAgent } from '../../../store/missionControl';

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT: Record<MCAgent['status'], string> = {
  idle: 'bg-brand-mint',
  busy: 'bg-accent-orange',
  error: 'bg-accent-red',
  offline: 'bg-text-secondary',
};

const STATUS_GLOW: Record<MCAgent['status'], string> = {
  idle: 'shadow-[0_0_4px_rgba(0,255,149,0.5)]',
  busy: 'shadow-[0_0_4px_rgba(255,159,10,0.5)]',
  error: 'shadow-[0_0_4px_rgba(255,69,58,0.5)]',
  offline: '',
};

const STATUS_BORDER: Record<MCAgent['status'], string> = {
  idle: 'border-l-2 border-l-brand-mint',
  busy: 'border-l-2 border-l-accent-orange',
  error: 'border-l-2 border-l-accent-red',
  offline: 'border-l-2 border-l-border-panel',
};

function relativeTime(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function relativeTimeFromNow(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = ts - Date.now();
  if (diff < 0) return 'atrasado';
  if (diff < 60_000) return `${Math.ceil(diff / 1_000)}s`;
  if (diff < 3_600_000) return `em ${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `em ${Math.floor(diff / 3_600_000)}h`;
  return `em ${Math.floor(diff / 86_400_000)}d`;
}

/** Returns time-to-run in ms (negative = overdue). */
function timeToRun(ts: number | undefined): number {
  if (!ts) return Infinity;
  return ts - Date.now();
}

// ── Mini Bar Sparkline ──────────────────────────────────────────────────────

function MiniBarSparkline({ data }: { data: number[] }) {
  const maxVal = Math.max(...data, 1);
  const barWidth = 3;
  const gap = 1;
  const svgWidth = data.length * barWidth + (data.length - 1) * gap;
  const svgHeight = 12;

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      className="shrink-0"
    >
      {data.map((val, i) => {
        const barHeight = Math.max((val / maxVal) * svgHeight, 1);
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={svgHeight - barHeight}
            width={barWidth}
            height={barHeight}
            rx={0.5}
            fill={val > 0 ? 'var(--color-brand-mint)' : 'var(--color-border-panel)'}
            opacity={val > 0 ? 0.7 : 0.3}
          />
        );
      })}
    </svg>
  );
}

// ── Focused Agent Card ──────────────────────────────────────────────────────

function FocusedAgentCard({
  agent,
  onViewProfile,
  onSendMission,
  onChat,
}: {
  agent: MCAgent;
  onViewProfile: () => void;
  onSendMission: () => void;
  onChat: () => void;
}) {
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const activities = useMissionControlStore((s) => s.activities);

  const stats = useMemo(() => {
    const agentTasks = tasks.filter(
      (t) => t.assigned_to?.toLowerCase() === agent.name.toLowerCase(),
    );
    const open = agentTasks.filter((t) => t.status !== 'done').length;
    const done = agentTasks.filter((t) => t.status === 'done').length;

    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 86_400_000).toISOString().slice(0, 10);
    const cost7d = tokenUsage
      .filter((t) => t.date >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.cost, 0);

    return { open, done, cost7d: `$${cost7d.toFixed(2)}` };
  }, [agent.name, tasks, tokenUsage]);

  // Build 7-day activity sparkline for this agent
  const sparklineData = useMemo(() => {
    const now = Date.now();
    const days: number[] = Array(7).fill(0);
    const agentNameLower = agent.name.toLowerCase();

    activities.forEach((a) => {
      if (a.actor?.toLowerCase() !== agentNameLower) return;
      const daysAgo = Math.floor((now - a.created_at) / 86_400_000);
      if (daysAgo >= 0 && daysAgo < 7) {
        days[6 - daysAgo] += 1;
      }
    });

    return days;
  }, [agent.name, activities]);

  return (
    <div
      className={cn(
        'bg-surface border border-border-panel rounded-sm p-3',
        STATUS_BORDER[agent.status],
      )}
    >
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
        Agente em foco
      </div>

      {/* Agent identity row */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            STATUS_DOT[agent.status],
            (agent.status === 'idle' || agent.status === 'busy') && STATUS_GLOW[agent.status],
          )}
        />
        <span className="text-xs font-bold text-text-primary truncate">{agent.name}</span>
        <span className="text-[8px] text-text-secondary font-mono">({agent.status})</span>
      </div>

      {/* Last activity text */}
      {agent.last_activity && (
        <div className="text-[9px] text-text-secondary italic truncate mb-1 pl-4">
          {agent.last_activity}
        </div>
      )}

      <div className="text-[9px] text-text-secondary mb-1">
        {agent.role} · visto {relativeTime(agent.last_seen)}
      </div>

      {/* Stats + sparkline row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 text-[9px] font-mono text-text-secondary">
          <span>
            <span className="text-text-primary">{stats.open}</span> abertas /{' '}
            <span className="text-brand-mint">{stats.done}</span> done
          </span>
        </div>
        <MiniBarSparkline data={sparklineData} />
      </div>

      <div className="text-[9px] font-mono text-text-secondary mb-3">
        Custo 7d: <span className="text-text-primary">{stats.cost7d}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSendMission}
          className="flex-1 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Enviar Missao
        </button>
        <button
          onClick={onChat}
          className="flex-1 bg-surface border border-border-panel text-text-primary rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1.5 hover:bg-surface-hover transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Chat
        </button>
      </div>
    </div>
  );
}

// ── Agent Roster ────────────────────────────────────────────────────────────

function AgentRoster({
  onAgentClick,
}: {
  onAgentClick: (agentId: number) => void;
}) {
  const agents = useMissionControlStore((s) => s.agents);
  const focusedAgentId = useMissionControlStore((s) => s.focusedAgentId);
  const tasks = useMissionControlStore((s) => s.tasks);
  const sessions = useMissionControlStore((s) => s.sessions);

  const visibleAgents = useMemo(
    () => agents.filter((a) => !a.hidden),
    [agents],
  );

  // Pre-compute active session set for O(1) lookup
  const agentsWithActiveSessions = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach((s) => {
      if (s.active && s.agent) {
        set.add(s.agent.toLowerCase());
      }
    });
    return set;
  }, [sessions]);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
        Todos os agentes
      </div>
      <div className="flex flex-col gap-1">
        {visibleAgents.map((agent) => {
          const taskCount = tasks.filter(
            (t) =>
              t.assigned_to?.toLowerCase() === agent.name.toLowerCase() && t.status !== 'done',
          ).length;

          const hasActiveSession = agentsWithActiveSessions.has(agent.name.toLowerCase());
          const isActive = agent.status === 'idle' || agent.status === 'busy';

          return (
            <button
              key={agent.id}
              onClick={() => onAgentClick(agent.id)}
              className={cn(
                'group flex items-center gap-2 px-2 py-1.5 rounded-sm transition-all w-full text-left',
                'hover:bg-surface-hover',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                focusedAgentId === agent.id && 'bg-brand-mint/5 border border-brand-mint/20',
                focusedAgentId !== agent.id && 'border border-transparent',
              )}
            >
              {/* Status dot with glow for active agents */}
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  STATUS_DOT[agent.status],
                  isActive && STATUS_GLOW[agent.status],
                )}
              />

              {/* Agent name + live indicator */}
              <span className="flex items-center gap-1 text-[10px] font-bold text-text-primary truncate flex-1">
                {agent.name}
                {hasActiveSession && (
                  <span className="w-1 h-1 rounded-full bg-brand-mint animate-pulse shrink-0" />
                )}
              </span>

              {/* Task count (more prominent on hover) */}
              <span
                className={cn(
                  'text-[8px] font-mono transition-colors',
                  taskCount > 0
                    ? 'text-text-secondary group-hover:text-text-primary'
                    : 'text-text-secondary',
                )}
              >
                {taskCount > 0 ? (
                  <span className="group-hover:font-bold">{taskCount} tasks</span>
                ) : (
                  agent.status
                )}
              </span>

              <Icon name="chevron_right" size="xs" className="text-text-secondary" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Next Crons ──────────────────────────────────────────────────────────────

function NextCrons() {
  const cronJobs = useMissionControlStore((s) => s.cronJobs);

  const upcoming = useMemo(
    () =>
      cronJobs
        .filter((job) => job.enabled && job.nextRun)
        .sort((a, b) => (a.nextRun ?? 0) - (b.nextRun ?? 0))
        .slice(0, 3),
    [cronJobs],
  );

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
        Proximas execucoes
      </div>
      <div className="flex flex-col gap-1.5">
        {upcoming.map((job) => {
          const ttl = timeToRun(job.nextRun);
          const isOverdue = ttl < 0;
          const isUrgent = ttl >= 0 && ttl < 3_600_000; // < 1h
          const timeColor = isOverdue
            ? 'text-accent-red'
            : isUrgent
              ? 'text-accent-orange'
              : 'text-brand-mint';

          return (
            <div key={job.id ?? job.name} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-text-primary truncate">
                <Icon name="schedule" size="xs" className="text-text-secondary shrink-0" />
                {job.name}
              </span>
              <span className={cn('text-[8px] font-mono whitespace-nowrap', timeColor)}>
                {relativeTimeFromNow(job.nextRun)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

interface MCRightSidebarProps {
  onAgentClick: (agentId: string) => void;
}

export function MCRightSidebar({ onAgentClick }: MCRightSidebarProps) {
  const agents = useMissionControlStore((s) => s.agents);
  const focusedAgentId = useMissionControlStore((s) => s.focusedAgentId);
  const setFocusedAgentId = useMissionControlStore((s) => s.setFocusedAgentId);

  const focusedAgent = useMemo(() => {
    if (focusedAgentId !== null) {
      return agents.find((a) => a.id === focusedAgentId) ?? null;
    }
    // Default: most active agent (most in_progress tasks or first busy)
    const busy = agents.find((a) => a.status === 'busy');
    return busy ?? agents[0] ?? null;
  }, [agents, focusedAgentId]);

  const handleRosterClick = useCallback(
    (agentId: number) => {
      setFocusedAgentId(agentId);
    },
    [setFocusedAgentId],
  );

  const handleViewProfile = useCallback(() => {
    if (focusedAgent) {
      onAgentClick(String(focusedAgent.id));
    }
  }, [focusedAgent, onAgentClick]);

  const handleSendMission = useCallback(() => {
    if (focusedAgent) {
      // TODO: wire to mission creation flow
      console.log('send-mission', focusedAgent.id);
    }
  }, [focusedAgent]);

  const handleChat = useCallback(() => {
    if (focusedAgent) {
      // TODO: wire to chat panel
      console.log('open-chat', focusedAgent.id);
    }
  }, [focusedAgent]);

  return (
    <div className="w-72 shrink-0 hidden xl:flex flex-col gap-3 overflow-y-auto p-3 border-l border-border-panel">
      {focusedAgent && (
        <FocusedAgentCard
          agent={focusedAgent}
          onViewProfile={handleViewProfile}
          onSendMission={handleSendMission}
          onChat={handleChat}
        />
      )}
      <AgentRoster onAgentClick={handleRosterClick} />
      <NextCrons />
    </div>
  );
}
