import React from 'react';
import { Ring } from '../ui/Ring';
import type { RingColor } from '../ui/Ring';

interface BudgetRingProps {
  spent: number;
  budget: number;
  className?: string;
}

function formatCompact(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function BudgetRing({ spent, budget, className }: BudgetRingProps) {
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const color: RingColor = percent > 90 ? 'red' : percent > 70 ? 'orange' : 'mint';
  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-2">
        <Ring value={percent} size={80} strokeWidth={5} color={color} showValue label="Orcamento" />
        <span className="text-[9px] font-mono text-text-secondary">
          R$ {formatCompact(spent)} / R$ {formatCompact(budget)}
        </span>
      </div>
    </div>
  );
}
