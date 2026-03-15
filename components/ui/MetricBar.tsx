import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

interface Metric {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: string;
}

interface MetricBarProps {
  metrics: Metric[];
  className?: string;
}

export function MetricBar({ metrics, className }: MetricBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-x-4 gap-y-2 py-2 px-4 border-b border-border-panel bg-bg-base', className)}>
      {metrics.map((metric, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {metric.icon && (
            <Icon name={metric.icon} size="xs" className="text-text-secondary" />
          )}
          <span className={cn('font-mono text-xs', metric.color ?? 'text-text-primary')}>
            {metric.value}
            {metric.unit && (
              <span className="text-[8px] text-text-secondary ml-0.5">{metric.unit}</span>
            )}
          </span>
          <span className="text-[8px] text-text-secondary uppercase tracking-widest">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}
