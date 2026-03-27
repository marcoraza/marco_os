/**
 * MCMetricBar — production-quality sticky metric strip for Mission Control.
 *
 * Layout: HealthScoreRing | ConnectionDot | Uptime | Tasks Ativas | Bloqueados | Atrasados | Custo hoje + sparkline + forecast | terminal | settings
 * All store access via granular selectors (one per field).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { MetricDelta } from '../../ui/MetricDelta';
import { useMissionControlStore } from '../../../store/missionControl';
import { MCTeamHealthScore } from './MCTeamHealthScore';

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
  pulseLastBar = false,
}: {
  data: number[];
  width?: number;
  height?: number;
  pulseLastBar?: boolean;
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
            fill="var(--color-accent-blue)"
            opacity={isLast ? 0.7 : 0.35}
            className={isLast && pulseLastBar ? 'mc-sparkline-pulse' : undefined}
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
  /** Optional extra className applied to the value span (for animations). */
  valueClassName?: string;
}

function MetricPill({
  label,
  value,
  color,
  borderColor,
  fraction,
  trailing,
  valueClassName,
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
          <span className={cn('text-[11px] font-mono font-bold leading-tight', valueClassName)}>
            <span className={color}>{fraction.numerator}</span>
            <span className="text-text-secondary opacity-50">/{fraction.denominator}</span>
          </span>
        ) : (
          <span className={cn('text-[11px] font-mono font-bold leading-tight', color, valueClassName)}>
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
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const logs = useMissionControlStore((s) => s.logs);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const toggleLogTerminal = useMissionControlStore((s) => s.toggleLogTerminal);
  const setShowConfigView = useMissionControlStore((s) => s.setShowConfigView);

  const hasErrorLogs = useMemo(
    () => logs.some((l) => l.level === 'error'),
    [logs],
  );

  const metrics = useMemo(() => {
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const blocked = tasks.filter(
      (t) => t.status === 'review' || t.status === 'quality_review',
    ).length;
    const overdue = tasks.filter(
      (t) => t.due_date && t.due_date < Date.now() && t.status !== 'done',
    ).length;

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    const costToday = tokenUsage
      .filter((t) => t.date === today)
      .reduce((sum, t) => sum + t.cost, 0);
    const costYesterday = tokenUsage
      .filter((t) => t.date === yesterday)
      .reduce((sum, t) => sum + t.cost, 0);

    return {
      inProgress,
      blocked,
      overdue,
      costToday,
      costYesterday,
      costDelta: costToday - costYesterday,
      costLabel: `$${costToday.toFixed(2)}`,
    };
  }, [tasks, tokenUsage]);

  const dailyCosts = useMemo(
    () => buildDailyCosts(tokenUsage),
    [tokenUsage],
  );

  // -- Cost forecast: 7-day average projected to week --
  const weeklyForecast = useMemo(() => {
    const sum = dailyCosts.reduce((acc, v) => acc + v, 0);
    const avgDaily = dailyCosts.length > 0 ? sum / dailyCosts.length : 0;
    return avgDaily * 7;
  }, [dailyCosts]);

  const forecastColor =
    weeklyForecast > 50
      ? 'text-accent-red'
      : weeklyForecast > 20
        ? 'text-accent-orange'
        : 'text-text-secondary';

  // -- Cost flash animation: brief opacity dip when cost changes --
  const prevCostRef = useRef(metrics.costToday);
  const [costFlash, setCostFlash] = useState(false);

  useEffect(() => {
    if (prevCostRef.current !== metrics.costToday) {
      prevCostRef.current = metrics.costToday;
      setCostFlash(true);
      const timer = setTimeout(() => setCostFlash(false), 300);
      return () => clearTimeout(timer);
    }
  }, [metrics.costToday]);

  // -- Sparkline pulse: last bar pulses when dailyCosts array changes --
  const prevDailyCostsRef = useRef(dailyCosts);
  const [sparklinePulse, setSparklinePulse] = useState(false);

  useEffect(() => {
    const prev = prevDailyCostsRef.current;
    const changed = prev.length !== dailyCosts.length || prev.some((v, i) => v !== dailyCosts[i]);
    if (changed) {
      prevDailyCostsRef.current = dailyCosts;
      setSparklinePulse(true);
      const timer = setTimeout(() => setSparklinePulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [dailyCosts]);

  // -- Uptime placeholder (MC service offline, show '--') --
  const uptimeLabel = connectionStatus === 'connected' ? '99.9%' : '--';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-1.5',
        'border-b border-border-panel bg-header-bg shrink-0',
        'flex-wrap xl:flex-nowrap',
      )}
    >
      {/* Team health ring */}
      <MCTeamHealthScore />

      {/* Connection status */}
      <ConnectionDot />

      {/* Divider */}
      <div className="h-5 w-px bg-border-panel shrink-0" />

      {/* Metric pills */}
      <div className="flex items-center gap-3 flex-wrap xl:flex-nowrap min-w-0">
        <MetricPill
          label="Uptime"
          value={uptimeLabel}
          color={connectionStatus === 'connected' ? 'text-brand-mint' : 'text-text-secondary'}
          borderColor={connectionStatus === 'connected' ? 'border-brand-mint/40' : 'border-border-panel'}
        />
        <MetricPill
          label="Tasks Ativas"
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
          valueClassName={costFlash ? 'mc-cost-flash' : undefined}
          trailing={
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <MiniBarSparkline data={dailyCosts} pulseLastBar={sparklinePulse} />
                {metrics.costDelta !== 0 && (metrics.costYesterday > 0 || metrics.costToday > 0) && (
                  <MetricDelta
                    value={parseFloat(metrics.costDelta.toFixed(2))}
                    suffix=""
                    size="sm"
                    forceColor={metrics.costDelta > 0 ? 'red' : 'mint'}
                    className="text-[8px]"
                  />
                )}
              </div>
              <span className={cn('text-[7px] font-mono', forecastColor)}>
                ~${weeklyForecast.toFixed(2)}/sem
              </span>
            </div>
          }
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
