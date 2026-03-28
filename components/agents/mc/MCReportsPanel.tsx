/**
 * MCReportsPanel — Sprint 6
 *
 * Relatorios tab with 2 sub-tabs: Dashboard | Standup
 * Dashboard: 2-col grid with charts, bars, ring, heatmap (existing content).
 * Standup: MCStandupPanel (narrative report).
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { MiniLineAreaChart, MiniDonutChart } from '../../ui/LightweightCharts';
import { Ring } from '../../ui/Ring';
import { HeatmapGrid } from '../../ui/HeatmapGrid';
import { useMissionControlStore, type MCRelatoriosSubTab } from '../../../store/missionControl';
import { MCStandupPanel } from './MCStandupPanel';

// ── Sub-tab bar ───────────────────────────────────────────────────────────────

const RELATORIOS_TABS: { id: MCRelatoriosSubTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'analytics' },
  { id: 'standup',   label: 'Standup',   icon: 'summarize' },
];

function RelatoriosSubTabBar() {
  const active = useMissionControlStore((s) => s.activeRelatoriosSubTab);
  const setActive = useMissionControlStore((s) => s.setActiveRelatoriosSubTab);

  return (
    <div className="flex items-center gap-1 border-b border-border-panel px-3 bg-bg-base">
      {RELATORIOS_TABS.map((tab) => (
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

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function getDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  } catch {
    return dateStr.slice(8, 10);
  }
}

function getDateKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CardShell({ children, className, span }: { children: React.ReactNode; className?: string; span?: boolean }) {
  return (
    <div className={cn('bg-surface border border-border-panel rounded-sm p-3', span && 'col-span-2', className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
      {children}
    </div>
  );
}

/** Horizontal bar with proportional width */
function HorizontalBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold text-text-primary w-20 truncate">{label}</span>
      <div className="flex-1 h-3 bg-bg-base rounded-sm overflow-hidden">
        <div className="h-full rounded-sm transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[9px] font-mono text-text-secondary w-6 text-right">{value}</span>
    </div>
  );
}

// ── Productivity Chart ───────────────────────────────────────────────────────

function ProductivityChart() {
  const tasks = useMissionControlStore((s) => s.tasks);

  const chartData = useMemo(() => {
    const now = Date.now();
    const days: Array<{ day: string; created: number; done: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 86_400_000);
      const key = getDateKey(date.getTime());
      const label = getDayLabel(key);

      const created = tasks.filter((t) => getDateKey(t.created_at) === key).length;
      const done = tasks.filter((t) => t.status === 'done' && t.completed_at && getDateKey(t.completed_at) === key).length
        + tasks.filter((t) => t.status === 'done' && !t.completed_at && getDateKey(t.updated_at) === key).length;

      days.push({ day: label, created, done });
    }

    return days;
  }, [tasks]);

  return (
    <CardShell>
      <SectionTitle>Produtividade semanal</SectionTitle>
      <div className="h-36">
        <MiniLineAreaChart
          data={chartData}
          xKey="day"
          series={[
            { key: 'created', label: 'Criadas', color: 'var(--color-accent-blue)', fillOpacity: 0.08 },
            { key: 'done', label: 'Concluidas', color: 'var(--color-brand-mint)', fillOpacity: 0.12 },
          ]}
          showDots
          compact
        />
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[8px] text-text-secondary">
          <span className="w-2 h-[2px] bg-accent-blue rounded-full inline-block" /> Criadas
        </span>
        <span className="flex items-center gap-1.5 text-[8px] text-text-secondary">
          <span className="w-2 h-[2px] bg-brand-mint rounded-full inline-block" /> Concluidas
        </span>
      </div>
    </CardShell>
  );
}

// ── Cost Distribution Donut ──────────────────────────────────────────────────

function CostDistribution() {
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);

  const { donutData, totalCost } = useMemo(() => {
    const byModel: Record<string, number> = {};
    let cost = 0;

    for (const entry of tokenUsage) {
      const key = entry.model.includes('opus')
        ? 'Opus'
        : entry.model.includes('sonnet')
          ? 'Sonnet'
          : entry.model.includes('codex')
            ? 'Codex'
            : entry.model;
      byModel[key] = (byModel[key] || 0) + entry.cost;
      cost += entry.cost;
    }

    const data = Object.entries(byModel).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
    return { donutData: data, totalCost: cost };
  }, [tokenUsage]);

  const colors = donutData.map((d) =>
    d.name === 'Opus' ? 'var(--color-accent-blue)' :
    d.name === 'Sonnet' ? 'var(--color-brand-mint)' :
    d.name === 'Codex' ? 'var(--color-accent-purple)' :
    'var(--color-text-secondary)'
  );

  return (
    <CardShell>
      <SectionTitle>Distribuicao de custo</SectionTitle>
      <div className="h-28 w-28 mx-auto">
        <MiniDonutChart
          data={donutData}
          colors={colors}
          centerLabel={formatCost(totalCost)}
          centerSubLabel="7 dias"
        />
      </div>
      <div className="flex items-center justify-center gap-3 mt-2">
        {donutData.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1 text-[8px] text-text-secondary">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colors[i] }} />
            {d.name}
          </span>
        ))}
      </div>
    </CardShell>
  );
}

// ── Agent Activity Bars ──────────────────────────────────────────────────────

function AgentActivityBars() {
  const agents = useMissionControlStore((s) => s.agents);

  const barData = useMemo(() => {
    return agents
      .filter((a) => !a.hidden)
      .map((a) => ({
        name: a.name,
        count: a.taskStats?.total ?? 0,
        status: a.status,
      }))
      .sort((a, b) => b.count - a.count);
  }, [agents]);

  const maxValue = Math.max(...barData.map((d) => d.count), 1);

  const barColor = (status: string) =>
    status === 'busy' ? 'var(--color-brand-mint)' :
    status === 'idle' ? 'var(--color-accent-blue)' :
    status === 'error' ? 'var(--color-accent-red)' :
    'var(--color-text-secondary)';

  return (
    <CardShell>
      <SectionTitle>Atividade por agente</SectionTitle>
      <div className="flex flex-col gap-2">
        {barData.map((d) => (
          <HorizontalBar key={d.name} label={d.name} value={d.count} maxValue={maxValue} color={barColor(d.status)} />
        ))}
      </div>
    </CardShell>
  );
}

// ── System Health Ring ───────────────────────────────────────────────────────

function SystemHealth() {
  const agents = useMissionControlStore((s) => s.agents);
  const tasks = useMissionControlStore((s) => s.tasks);
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);

  const { healthScore, onlineCount, totalAgents, blockerCount, weekCost } = useMemo(() => {
    const visible = agents.filter((a) => !a.hidden);
    const total = visible.length;
    const online = visible.filter((a) => a.status !== 'offline').length;

    // Blockers: tasks overdue or in error state
    const blockers = tasks.filter(
      (t) => (t.due_date && t.due_date < Date.now() && t.status !== 'done') ||
             t.outcome === 'failed',
    ).length;

    // Health score: weighted formula
    const agentHealth = total > 0 ? (online / total) * 40 : 0;
    const taskHealth = tasks.length > 0
      ? (tasks.filter((t) => t.status === 'done').length / tasks.length) * 40
      : 20;
    const blockerPenalty = Math.min(blockers * 10, 20);
    const score = Math.round(Math.min(100, Math.max(0, agentHealth + taskHealth + 20 - blockerPenalty)));

    const cost = tokenUsage.reduce((sum, e) => sum + e.cost, 0);

    return { healthScore: score, onlineCount: online, totalAgents: total, blockerCount: blockers, weekCost: cost };
  }, [agents, tasks, tokenUsage]);

  const ringColor = healthScore >= 70 ? 'mint' : healthScore >= 40 ? 'orange' : 'red';

  return (
    <CardShell>
      <SectionTitle>Saude do sistema</SectionTitle>
      <div className="flex items-center gap-4">
        <Ring value={healthScore} size={64} color={ringColor} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Icon name="group" size="xs" className="text-text-secondary" />
            <span className="text-[9px] text-text-primary font-mono">{onlineCount}/{totalAgents} online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="error_outline" size="xs" className="text-accent-orange" />
            <span className="text-[9px] text-text-primary font-mono">{blockerCount} bloqueios</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="payments" size="xs" className="text-text-secondary" />
            <span className="text-[9px] text-text-primary font-mono">{formatCost(weekCost)} (7d)</span>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

// ── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap() {
  const activities = useMissionControlStore((s) => s.activities);
  const tasks = useMissionControlStore((s) => s.tasks);

  const heatData = useMemo(() => {
    const map: Record<string, number> = {};

    // Count activities per day
    for (const act of activities) {
      const key = getDateKey(act.created_at);
      map[key] = (map[key] || 0) + 1;
    }

    // Also count task updates
    for (const task of tasks) {
      const key = getDateKey(task.updated_at);
      map[key] = (map[key] || 0) + 1;
    }

    // Normalize to 0-4 intensity
    const values = Object.values(map);
    const maxVal = Math.max(...values, 1);

    const normalized: Record<string, 0 | 1 | 2 | 3 | 4> = {};
    for (const [date, count] of Object.entries(map)) {
      const ratio = count / maxVal;
      normalized[date] = ratio === 0 ? 0 : ratio <= 0.25 ? 1 : ratio <= 0.5 ? 2 : ratio <= 0.75 ? 3 : 4;
    }

    return normalized;
  }, [activities, tasks]);

  return (
    <CardShell span>
      <SectionTitle>Mapa de atividade (30 dias)</SectionTitle>
      <HeatmapGrid data={heatData} weeks={4} />
    </CardShell>
  );
}

// ── Tasks by Status Bars ─────────────────────────────────────────────────────

function TasksByStatus() {
  const tasks = useMissionControlStore((s) => s.tasks);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1;
    }

    const statusConfig: Array<{ key: string; label: string; color: string }> = [
      { key: 'done', label: 'Concluidas', color: 'var(--color-brand-mint)' },
      { key: 'in_progress', label: 'Em progresso', color: 'var(--color-accent-blue)' },
      { key: 'review', label: 'Em revisao', color: 'var(--color-accent-purple)' },
      { key: 'quality_review', label: 'QA review', color: 'var(--color-accent-purple)' },
      { key: 'assigned', label: 'Atribuidas', color: 'var(--color-text-primary)' },
      { key: 'inbox', label: 'Inbox', color: 'var(--color-text-secondary)' },
    ];

    return statusConfig
      .map((s) => ({ ...s, count: counts[s.key] || 0 }))
      .filter((s) => s.count > 0);
  }, [tasks]);

  const maxCount = Math.max(...statusData.map((s) => s.count), 1);

  return (
    <CardShell>
      <SectionTitle>Tasks por status</SectionTitle>
      <div className="flex flex-col gap-2">
        {statusData.map((s) => (
          <HorizontalBar key={s.key} label={s.label} value={s.count} maxValue={maxCount} color={s.color} />
        ))}
      </div>
    </CardShell>
  );
}

// ── Cron Execution Log ───────────────────────────────────────────────────────

function CronExecutionLog() {
  const cronJobs = useMissionControlStore((s) => s.cronJobs);

  const sortedJobs = useMemo(() => {
    return [...cronJobs]
      .filter((j) => j.lastRun)
      .sort((a, b) => (b.lastRun || 0) - (a.lastRun || 0))
      .slice(0, 7);
  }, [cronJobs]);

  if (sortedJobs.length === 0) {
    return (
      <CardShell>
        <SectionTitle>Cron execution log</SectionTitle>
        <p className="text-text-secondary text-[9px] text-center py-4">Nenhuma execucao registrada</p>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <SectionTitle>Cron execution log</SectionTitle>
      <div className="flex flex-col gap-1.5">
        {sortedJobs.map((job) => {
          const isSuccess = job.lastStatus === 'success';
          const isError = job.lastStatus === 'error';
          const isRunning = job.lastStatus === 'running';

          return (
            <div key={job.id || job.name} className="flex items-center gap-2">
              <Icon
                name={isSuccess ? 'check_circle' : isError ? 'cancel' : 'pending'}
                size="xs"
                className={cn(
                  isSuccess && 'text-brand-mint',
                  isError && 'text-accent-red',
                  isRunning && 'text-accent-orange',
                )}
              />
              <span className="text-[9px] font-mono text-text-primary flex-1 truncate">{job.name}</span>
              <span className={cn(
                'text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm',
                isSuccess && 'text-brand-mint border-brand-mint/30',
                isError && 'text-accent-red border-accent-red/30',
                isRunning && 'text-accent-orange border-accent-orange/30',
                !isSuccess && !isError && !isRunning && 'text-text-secondary border-border-panel',
              )}>
                {job.lastStatus || 'pending'}
              </span>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

// ── Dashboard sub-tab ────────────────────────────────────────────────────────

function ReportsDashboard() {
  return (
    <div className="grid grid-cols-2 gap-3 p-3">
      <ProductivityChart />
      <CostDistribution />
      <AgentActivityBars />
      <SystemHealth />
      <ActivityHeatmap />
      <TasksByStatus />
      <CronExecutionLog />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function MCReportsPanel() {
  const subTab = useMissionControlStore((s) => s.activeRelatoriosSubTab);

  return (
    <div className="flex flex-col h-full">
      <RelatoriosSubTabBar />
      <div className="flex-1 overflow-y-auto">
        {subTab === 'dashboard' ? <ReportsDashboard /> : <MCStandupPanel />}
      </div>
    </div>
  );
}
