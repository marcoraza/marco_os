// components/dashboard/HealthScoreWidget.tsx
import React, { useState } from 'react';
import { MetricBar } from '@/components/ui/MetricBar';
import { Icon } from '@/components/ui/Icon';
import { useHealthScore } from '@/hooks/useHealthScore';
import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/utils/cn';

export function HealthScoreWidget() {
  const [expanded, setExpanded] = useState(false);
  const { score, color, dimensions, isLoading } = useHealthScore();
  const animatedScore = useCountUp(isLoading ? 0 : score, 1200);

  const metrics = dimensions.map(d => ({
    label: d.label,
    value: `${d.value}`,
    unit: '%',
    color: d.value > 70
      ? 'text-brand-mint'
      : d.value >= 40
      ? 'text-accent-orange'
      : 'text-accent-red',
  }));

  return (
    <div
      className="bg-surface border border-border-panel rounded-sm p-2 flex flex-col cursor-pointer"
      onClick={() => setExpanded(v => !v)}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
    >
      {/* Collapsed: single row — label + score + arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">SCORE</span>
          {!isLoading && (
            <span className={cn('text-sm font-black font-mono leading-none', color)}>
              {animatedScore}<span className="text-[7px] text-text-secondary font-normal">/100</span>
            </span>
          )}
        </div>
        <Icon name={expanded ? 'expand_less' : 'expand_more'} size="xs" className="text-text-secondary" />
      </div>

      {/* Expanded: full breakdown */}
      {expanded && !isLoading && (
        <div className="mt-2">
          <MetricBar metrics={metrics} className="border-0 px-0 py-1 flex-wrap gap-3" />
          <ul className="flex flex-col gap-1 mt-2">
            {dimensions.map((d, i) => (
              <li key={i} className="flex items-center justify-between text-[9px]">
                <span className="text-text-secondary">{d.label}</span>
                <span className="text-text-secondary font-mono">{d.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default HealthScoreWidget;
