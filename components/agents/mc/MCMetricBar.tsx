/**
 * MCMetricBar — production-quality sticky metric strip for Mission Control.
 *
 * Layout: ConnectionDot | 6 MetricPills (with border-l accent) | 7-bar cost sparkline | action buttons.
 * All store access via granular selectors (one per field).
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore } from '../../../store/missionControl';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build last-7-day cost array from tokenUsage entries. */
function buildDailyCosts(
  tokenUsage: { date: string; cost: number }[],
): number[] {
  const map = new Map<string, number>();
  for (let d = 6; d >= 0; d--) {
    const key = new Date(Date.now() - d * 86_400_000).toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const t of tokenUsage) {
    if (map.has(t.date)) {
      map.set(t.date, (map.get(t.date) ?? 0) + t.cost);
    }
  }
  return Array.from(map.values());
}

// ── MiniBarSparkline ─────────────────────────────────────────────────────────

function MiniBarSparkline({
  data,
  width = 40,
  height = 16,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data, 0.01);
  const barCount = data.length;
  const gap = 1;
  const barWidth = (width - gap * (barCount - 1)) / barCount;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      {data.map((value, i) => {
        const barHeight = Math.max((value / max) * (height - 2), 1);
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        const isLast = i === barCount - 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={0.5}
            fill={isLast ? 'var(--color-accent-blue)' : 'var(--color-accent-blue)'}
            opacity={isLast ? 0.7 : 0.35}
          />
        );
      })}
    </svg>
  );
}

// ── ConnectionDot ────────────────────────────────────────────────────────────

function ConnectionDot() {
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const agentCount = useMissionControlStore((s) => s.agents.length);
  const hasMockData = connectionStatus !== 'connected' && agentCount > 0;

  const isConnected = connectionStatus === 'connected';

  const dotColor =
    isConnected ? 'bg-brand-mint' :
    hasMockData ? 'bg-accent-purple' :
    connectionStatus === 'connecting' ? 'bg-accent-orange' :
    connectionStatus === 'error' ? 'bg-accent-red' :
    'bg-text-secondary';

  const textColor =
    isConnected ? 'text-brand-mint' :
    hasMockData ? 'text-accent-purple' :
    connectionStatus === 'connecting' ? 'text-accent-orange' :
    connectionStatus === 'error' ? 'text-accent-red' :
    'text-text-secondary';

  const label =
    isConnected ? 'Conectado' :
    hasMockData ? 'Mock' :
    connectionStatus === 'connecting' ? 'Conectando' :
    connectionStatus === 'error' ? 'Erro' :
    'Offline';

  return (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span
            className={cn(
              'absolute inset-0 rounded-full opacity-60 animate-ping',
              dotColor,
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', dotColor)} />
      </span>
      <span className={cn('text-[8px] font-bold uppercase tracking-widest font-mono', textColor)}>
        {label}
      </span>
    </span>
  );
}

// ── MetricPill ───────────────────────────────────────────────────────────────

interface MetricPillProps {
  label: string;
  value: string;
  color: string;
  borderColor: string;
  /** If provided, renders value as `numerator/denominator` with dimmed denominator. */
  fraction?: { numerator: string; denominator: string };
  /** Optional trailing element (sparkline, badge, etc.) */
  trailing?: React.ReactNode;
}

function MetricPill({
  label,
  value,
  color,
  borderColor,
  fraction,
  trailing,
}: MetricPillProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 pl-2.5 pr-1 py-1 min-w-0',
        'border-l-2',
        borderColor,
      )}
    >
      <div className="flex flex-col gap-0 min-w-0">
        {fraction ? (
          <span className="text-[11px] font-mono font-bold leading-tight">
            <span className={color}>{fraction.numerator}</span>
            <span className="text-text-secondary opacity-50">/{fraction.denominator}</span>
          </span>
        ) : (
          <span className={cn('text-[11px] font-mono font-bold leading-tight', color)}>
            {value}
          </span>
        )}
        <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary leading-tight">
          {label}
        </span>
      </div>
      {trailing}
    </div>
  );
}

// ── ActionButton ─────────────────────────────────────────────────────────────

function ActionButton({
  icon,
  tooltip,
  onClick,
  showPulse,
}: {
  icon: string;
  tooltip: string;
  onClick: () => void;
  showPulse?: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          'relative p-1.5 rounded-sm transition-all',
          'text-text-secondary hover:text-text-primary',
          'hover:bg-surface-hover',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        )}
        aria-label={tooltip}
      >
        <Icon name={icon} size="sm" />
        {showPulse && (
          <span className="absolute top-0.5 right-0.5 flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-accent-red opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-red" />
          </span>
        )}
      </button>
      {/* Tooltip */}
      <div
        className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1',
          'bg-surface border border-border-panel rounded-sm',
          'text-[9px] text-text-primary whitespace-nowrap',
          'opacity-0 pointer-events-none group-hover:opacity-100',
          'transition-opacity duration-200',
        )}
        role="tooltip"
      >
        {tooltip}
      </div>
    </div>
  );
}

// ── MCMetricBar ──────────────────────────────────────────────────────────────

export function MCMetricBar() {
  const agents = useMissionControlStore((s) => s.agents);
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const sessions = useMissionControlStore((s) => s.sessions);
  const logs = useMissionControlStore((s) => s.logs);
  const toggleLogTerminal = useMissionControlStore((s) => s.toggleLogTerminal);
  const setShowConfigView = useMissionControlStore((s) => s.setShowConfigView);

  const hasErrorLogs = useMemo(
    () => logs.some((l) => l.level === 'error'),
    [logs],
  );

  const metrics = useMemo(() => {
    const visibleAgents = agents.filter((a) => !a.hidden);
    const online = visibleAgents.filter((a) => a.status !== 'offline').length;
    const total = visibleAgents.length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const blocked = tasks.filter(
      (t) => t.status === 'review' || t.status === 'quality_review',
    ).length;
    const overdue = tasks.filter(
      (t) => t.due_date && t.due_date < Date.now() && t.status !== 'done',
    ).length;

    const today = new Date().toISOString().slice(0, 10);
    const costToday = tokenUsage
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + t.cost, 0);

    const activeSessions = sessions.filter((s) => s.active).length;

    return {
      online,
      total,
      inProgress,
      blocked,
      overdue,
      costToday,
      costLabel: `$${costToday.toFixed(2)}`,
      sessions: activeSessions,
    };
  }, [agents, tasks, tokenUsage, sessions]);

  const dailyCosts = useMemo(
    () => buildDailyCosts(tokenUsage),
    [tokenUsage],
  );

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-1.5',
        'border-b border-border-panel bg-header-bg shrink-0',
        'flex-wrap xl:flex-nowrap',
      )}
    >
      {/* Connection status */}
      <ConnectionDot />

      {/* Divider */}
      <div className="h-5 w-px bg-border-panel shrink-0" />

      {/* Metric pills */}
      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap min-w-0">
        <MetricPill
          label="Online"
          value={`${metrics.online}/${metrics.total}`}
          color="text-brand-mint"
          borderColor="border-brand-mint/40"
          fraction={{
            numerator: String(metrics.online),
            denominator: String(metrics.total),
          }}
        />
        <MetricPill
          label="Em progresso"
          value={String(metrics.inProgress)}
          color="text-accent-blue"
          borderColor="border-accent-blue/40"
        />
        <MetricPill
          label="Bloqueados"
          value={String(metrics.blocked)}
          color={metrics.blocked > 0 ? 'text-accent-red' : 'text-text-secondary'}
          borderColor={metrics.blocked > 0 ? 'border-accent-red/40' : 'border-border-panel'}
        />
        <MetricPill
          label="Atrasados"
          value={String(metrics.overdue)}
          color={metrics.overdue > 0 ? 'text-accent-orange' : 'text-text-secondary'}
          borderColor={metrics.overdue > 0 ? 'border-accent-orange/40' : 'border-border-panel'}
        />
        <MetricPill
          label="Custo hoje"
          value={metrics.costLabel}
          color="text-text-primary"
          borderColor="border-accent-blue/40"
          trailing={<MiniBarSparkline data={dailyCosts} />}
        />
        <MetricPill
          label="Sessoes"
          value={String(metrics.sessions)}
          color="text-accent-blue"
          borderColor="border-accent-blue/40"
        />
      </div>

      {/* Action buttons — pushed right */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <ActionButton
          icon="terminal"
          tooltip="Log Terminal (Cmd+L)"
          onClick={toggleLogTerminal}
          showPulse={hasErrorLogs}
        />
        <ActionButton
          icon="settings"
          tooltip="Configuracao"
          onClick={() => setShowConfigView(true)}
        />
      </div>
    </div>
  );
}
