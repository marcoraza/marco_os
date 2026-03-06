import React from 'react';
import { Icon, SectionLabel } from '../ui';
import { MiniLineAreaChart } from '../ui/LightweightCharts';
import { MetricDelta } from '../ui/MetricDelta';
import { netWorthMonthly } from './data';
import { formatBRL } from './utils';

// ── Mock data ────────────────────────────────────────────────────────────────

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const assets = [
  { name: 'Conta corrente', icon: 'account_balance_wallet', value: 12500 },
  { name: 'Investimentos',  icon: 'trending_up',            value: 85000 },
  { name: 'Poupança',       icon: 'savings',                value: 8000  },
  { name: 'Cripto',         icon: 'currency_bitcoin',       value: 6500  },
  { name: 'Imóveis',        icon: 'apartment',              value: 0     },
  { name: 'Veículos',       icon: 'directions_car',         value: 6000  },
];

const liabilities = [
  { name: 'Cartão de crédito', icon: 'credit_card', value: 2800 },
  { name: 'Financiamento',     icon: 'home',        value: 0    },
  { name: 'Outras dívidas',    icon: 'receipt',     value: 0    },
];

const GOAL = 500000;

// ── Derived values ────────────────────────────────────────────────────────────

const totalAssets     = assets.reduce((s, a) => s + a.value, 0);       // 118 000
const totalLiabilities = liabilities.reduce((s, l) => s + l.value, 0); // 2 800
const netWorth        = totalAssets - totalLiabilities;                 // 115 200

const prevNetWorth    = netWorthMonthly[netWorthMonthly.length - 2];    // 112 000
const currentNetWorth = netWorthMonthly[netWorthMonthly.length - 1];    // 118 000
const deltaPercent    = Math.round(((currentNetWorth - prevNetWorth) / prevNetWorth) * 100);

const goalProgress    = (netWorth / GOAL) * 100;

// Average monthly delta (based on last 6 months)
const last6  = netWorthMonthly.slice(-6);
const avgDelta = (last6[last6.length - 1] - last6[0]) / 5; // ~6 600 / month
const monthsToGoal = avgDelta > 0 ? Math.ceil((GOAL - netWorth) / avgDelta) : null;

const chartData = netWorthMonthly.map((v, i) => ({ month: MONTHS[i], value: v }));

// ── Sub-components ───────────────────────────────────────────────────────────

interface AssetRowProps {
  name: string;
  icon: string;
  value: number;
  total: number;
}

function AssetRow({ name, icon, value, total }: AssetRowProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Icon name={icon} className="text-sm text-text-secondary shrink-0" />
        <span className="flex-1 text-xs text-text-primary truncate">{name}</span>
        <span className="font-mono text-xs text-text-primary">{formatBRL(value)}</span>
      </div>
      <div className="h-1 bg-border-panel rounded-sm overflow-hidden">
        <div
          className="h-full bg-brand-mint rounded-sm transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface LiabilityRowProps {
  name: string;
  icon: string;
  value: number;
}

function LiabilityRow({ name, icon, value }: LiabilityRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon name={icon} className="text-sm text-text-secondary shrink-0" />
      <span className="flex-1 text-xs text-text-primary truncate">{name}</span>
      <span className={`font-mono text-xs ${value > 0 ? 'text-accent-red' : 'text-text-secondary'}`}>
        {formatBRL(value)}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function FinancePatrimonio() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full overflow-y-auto">

      {/* SEÇÃO 1 — Header Net Worth */}
      <div className="bg-surface border border-border-panel rounded-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <SectionLabel className="text-text-secondary tracking-[0.1em] mb-1">PATRIMÔNIO LÍQUIDO</SectionLabel>
          <div className="text-4xl font-bold font-mono text-brand-mint leading-none">
            {formatBRL(netWorth)}
          </div>
          <MetricDelta value={deltaPercent} label="vs mês anterior" className="mt-2" />
        </div>

        {/* Sparkline mini */}
        <div className="w-full sm:w-48 h-16 shrink-0">
          <MiniLineAreaChart
            data={chartData}
            xKey="month"
            compact
            showGrid={false}
            series={[{ key: 'value', label: 'Patrimônio', color: '#00FF95', fillOpacity: 0.12 }]}
          />
        </div>
      </div>

      {/* SEÇÃO 2 — Gráfico de evolução */}
      <div className="bg-surface border border-border-panel rounded-sm p-4">
        <SectionLabel className="text-text-secondary tracking-[0.1em] mb-3">EVOLUÇÃO 12 MESES</SectionLabel>
        <div className="h-48">
          <MiniLineAreaChart
            data={chartData}
            xKey="month"
            series={[{ key: 'value', label: 'Patrimônio', color: '#00FF95', fillOpacity: 0.16 }]}
          />
        </div>
      </div>

      {/* SEÇÃO 3 — Grid Ativos | Passivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Ativos */}
        <div className="bg-surface border border-border-panel rounded-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionLabel className="text-text-secondary tracking-[0.1em]">ATIVOS</SectionLabel>
            <span className="font-mono text-sm font-bold text-brand-mint">{formatBRL(totalAssets)}</span>
          </div>
          <div className="flex flex-col gap-3">
            {assets.map((a) => (
              <AssetRow key={a.name} name={a.name} icon={a.icon} value={a.value} total={totalAssets} />
            ))}
          </div>
          <div className="pt-1 border-t border-border-panel flex items-center justify-between">
            <span className="text-xs text-text-secondary font-mono uppercase tracking-widest">Total</span>
            <span className="font-mono text-sm font-bold text-brand-mint">{formatBRL(totalAssets)}</span>
          </div>
        </div>

        {/* Passivos */}
        <div className="bg-surface border border-border-panel rounded-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionLabel className="text-text-secondary tracking-[0.1em]">PASSIVOS</SectionLabel>
            <span className="font-mono text-sm font-bold text-accent-red">{formatBRL(totalLiabilities)}</span>
          </div>
          {totalLiabilities === 0 ? (
            <div className="flex items-center gap-2 py-4 text-brand-mint text-sm">
              <Icon name="check_circle" className="text-brand-mint" />
              <span>Sem dívidas registradas</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {liabilities.map((l) => (
                <LiabilityRow key={l.name} name={l.name} icon={l.icon} value={l.value} />
              ))}
            </div>
          )}
          <div className="pt-1 border-t border-border-panel flex items-center justify-between">
            <span className="text-xs text-text-secondary font-mono uppercase tracking-widest">Total</span>
            <span className="font-mono text-sm font-bold text-accent-red">{formatBRL(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 4 — Meta de patrimônio */}
      <div className="bg-surface border border-border-panel rounded-sm p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon name="flag" className="text-accent-orange" />
          <SectionLabel className="text-text-secondary tracking-[0.1em]">META DE PATRIMÔNIO</SectionLabel>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-text-secondary font-mono uppercase tracking-widest mb-0.5">Progresso</div>
            <div className="font-mono text-lg font-bold text-text-primary">
              {formatBRL(netWorth)}
              <span className="text-text-secondary text-sm font-normal"> / {formatBRL(GOAL)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-secondary font-mono uppercase tracking-widest mb-0.5">Conclusão</div>
            <div className="font-mono text-sm font-bold text-accent-orange">
              {goalProgress.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="h-2 bg-border-panel rounded-sm overflow-hidden">
          <div
            className="h-full bg-accent-orange rounded-sm transition-all"
            style={{ width: `${Math.min(goalProgress, 100)}%` }}
          />
        </div>

        {monthsToGoal !== null && (
          <div className="text-xs text-text-secondary font-mono">
            Com crescimento médio de{' '}
            <span className="text-brand-mint font-bold">{formatBRL(avgDelta)}/mês</span>
            {' '}— meta estimada em{' '}
            <span className="text-accent-orange font-bold">
              {monthsToGoal > 12
                ? `~${Math.round(monthsToGoal / 12)} anos`
                : `~${monthsToGoal} meses`}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
