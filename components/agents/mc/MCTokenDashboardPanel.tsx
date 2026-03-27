import React, { useMemo, useCallback, useState } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCTokenUsage } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  return days[d.getDay()] ?? dateStr.slice(-2);
}

function getLast7Days(): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">
        {label}
      </div>
      <div className="text-lg font-black font-mono text-text-primary">{value}</div>
      {subtitle && (
        <div className="text-[8px] font-mono text-text-secondary">{subtitle}</div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-border-panel animate-pulse rounded-sm h-16" />
        ))}
      </div>
      <div className="bg-border-panel animate-pulse rounded-sm h-20" />
      <div className="bg-border-panel animate-pulse rounded-sm h-32" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
        monitoring
      </span>
      <p className="text-text-secondary text-xs text-center">
        Nenhum dado de uso registrado
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function MCTokenDashboardPanel({ agentId }: { agentId?: string }) {
  const tokenUsage = useMissionControlStore((s) => s.tokenUsage);
  const setTokenUsage = useMissionControlStore((s) => s.setTokenUsage);
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    try {
      const raw = await mcApi.get<{ data: MCTokenUsage[] } | MCTokenUsage[]>('/api/tokens');
      const items = Array.isArray(raw) ? raw : raw.data ?? [];
      setTokenUsage(items);
    } catch {
      // Fail silently, keep existing data
    } finally {
      setLoading(false);
    }
  }, [setTokenUsage]);

  useMCPoll(fetchTokens, 30_000);

  // ── Aggregated metrics ─────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const totalCost = tokenUsage.reduce((acc, t) => acc + t.cost, 0);
    const totalTokens = tokenUsage.reduce((acc, t) => acc + t.totalTokens, 0);
    const uniqueSessions = new Set(tokenUsage.map((t) => t.sessionId)).size;
    const uniqueModels = new Set(tokenUsage.map((t) => t.model)).size;
    return { totalCost, totalTokens, uniqueSessions, uniqueModels };
  }, [tokenUsage]);

  // ── Daily sparkline (last 7 days) ──────────────────────────────────────────

  const dailyBars = useMemo(() => {
    const last7 = getLast7Days();
    const byDay = new Map<string, number>();
    for (const day of last7) byDay.set(day, 0);

    for (const t of tokenUsage) {
      const day = t.date.slice(0, 10);
      if (byDay.has(day)) {
        byDay.set(day, (byDay.get(day) ?? 0) + t.totalTokens);
      }
    }

    const values = last7.map((d) => byDay.get(d) ?? 0);
    const maxVal = Math.max(...values, 1);

    return last7.map((d, i) => ({
      label: getDayLabel(d),
      pct: Math.max((values[i] / maxVal) * 100, 2), // min 2% so bars are visible
      tokens: values[i],
    }));
  }, [tokenUsage]);

  // ── Model breakdown ────────────────────────────────────────────────────────

  const modelBreakdown = useMemo(() => {
    const byModel = new Map<string, { tokens: number; cost: number }>();
    for (const t of tokenUsage) {
      const existing = byModel.get(t.model) ?? { tokens: 0, cost: 0 };
      existing.tokens += t.totalTokens;
      existing.cost += t.cost;
      byModel.set(t.model, existing);
    }

    const total = metrics.totalTokens || 1;
    return Array.from(byModel.entries())
      .map(([model, data]) => ({
        model,
        tokens: data.tokens,
        cost: data.cost,
        pct: ((data.tokens / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }, [tokenUsage, metrics.totalTokens]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading && tokenUsage.length === 0 && connectionStatus === 'connecting') {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Uso de tokens
        </span>
        <LoadingSkeleton />
      </div>
    );
  }

  if (tokenUsage.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Uso de tokens
        </span>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
        Uso de tokens
      </span>

      {/* Agent filter note */}
      {agentId && (
        <div className="flex items-center gap-1 text-[8px] font-mono text-text-secondary">
          <Icon name="info" size="xs" />
          <span>Filtro por agente indisponivel para tokens</span>
        </div>
      )}

      {/* Top metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          label="Custo total"
          value={formatCost(metrics.totalCost)}
          subtitle={`${tokenUsage.length} registros`}
        />
        <MetricCard
          label="Tokens total"
          value={formatTokens(metrics.totalTokens)}
          subtitle="input + output"
        />
        <MetricCard
          label="Sessoes"
          value={String(metrics.uniqueSessions)}
        />
        <MetricCard
          label="Modelos"
          value={String(metrics.uniqueModels)}
        />
      </div>

      {/* Sparkline - daily usage (last 7 days) */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
          Uso diario (7d)
        </div>
        <div className="flex items-end gap-1 h-12">
          {dailyBars.map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full bg-brand-mint/60 rounded-sm transition-all duration-300 ease-out"
                style={{ height: `${bar.pct}%` }}
                title={`${formatTokens(bar.tokens)} tokens`}
              />
              <span className="text-[7px] font-mono text-text-secondary">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model breakdown table */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-2">
          Por modelo
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-panel">
              <th className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-left py-1">
                Modelo
              </th>
              <th className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-right py-1">
                Tokens
              </th>
              <th className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-right py-1">
                Custo
              </th>
              <th className="text-[8px] font-bold uppercase tracking-widest text-text-secondary text-right py-1">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {modelBreakdown.map((row) => (
              <tr
                key={row.model}
                className="border-b border-border-panel/50 hover:bg-surface-hover transition-colors"
              >
                <td className="text-[10px] font-mono text-text-primary py-1.5">
                  {row.model}
                </td>
                <td className="text-[10px] font-mono text-text-secondary text-right">
                  {formatTokens(row.tokens)}
                </td>
                <td className="text-[10px] font-mono text-brand-mint text-right">
                  ${row.cost.toFixed(4)}
                </td>
                <td className="text-[10px] font-mono text-text-secondary text-right">
                  {row.pct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
