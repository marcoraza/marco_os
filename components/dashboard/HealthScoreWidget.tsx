// components/dashboard/HealthScoreWidget.tsx
import React, { useState } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
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
      className="bg-surface border border-border-panel rounded-sm p-2 flex flex-col gap-1 cursor-pointer"
      onClick={() => setExpanded(v => !v)}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">SCORE</span>
        <Icon name={expanded ? 'expand_less' : 'expand_more'} size="xs" className="text-text-secondary" />
      </div>

      {isLoading ? (
        <div className="bg-border-panel animate-pulse rounded-sm h-6 w-16" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className={cn('text-[20px] font-black font-mono leading-none', color)}>
            {animatedScore}
          </span>
          <span className="text-[8px] text-text-secondary font-mono">/100</span>
        </div>
      )}

      {expanded && !isLoading && (
        <div className="mt-1">
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
