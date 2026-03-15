import React from 'react';
import { cn } from '@/utils/cn';

interface SourceBadgeProps {
  source: 'notion' | 'local';
  className?: string;
}

const sourceStyles: Record<'notion' | 'local', { color: string; label: string }> = {
  notion: {
    color: 'bg-brand-mint/5 border-brand-mint/20 text-brand-mint',
    label: 'NOTION',
  },
  local: {
    color: 'bg-accent-blue/5 border-accent-blue/20 text-accent-blue',
    label: 'LOCAL',
  },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const { color, label } = sourceStyles[source];
  return (
    <span
      className={cn(
        'text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm',
        color,
        className
      )}
    >
      {label}
    </span>
  );
}
