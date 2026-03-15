import React from 'react';
import { SectionLabel } from '../ui/SectionLabel';
import { MetricDelta } from '../ui/MetricDelta';
import { Sparkline } from '../ui/Sparkline';
import { netWorthMonthly } from './data';

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

export default function NetWorthCard() {
  const current = netWorthMonthly[netWorthMonthly.length - 1];
  const previous = netWorthMonthly[netWorthMonthly.length - 2];
  const deltaPercent = previous > 0 ? Math.round(((current - previous) / previous) * 100 * 10) / 10 : 0;
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-4 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <SectionLabel className="text-text-secondary tracking-[0.1em]">Patrimonio Liquido</SectionLabel>
        <span className="text-[28px] font-black font-mono text-text-primary leading-tight">
          {formatBRL(current)}
        </span>
        <MetricDelta value={deltaPercent} label="vs mes anterior" />
      </div>
      <Sparkline data={netWorthMonthly} width={120} height={40} color={deltaPercent >= 0 ? 'mint' : 'red'} showDot />
    </div>
  );
}
