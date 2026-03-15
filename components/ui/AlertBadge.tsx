import React from 'react';
import { cn } from '@/utils/cn';

interface AlertBadgeProps {
  count: number;
  onClick?: () => void;
}

export function AlertBadge({ count, onClick }: AlertBadgeProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${count} alertas ativos`}
      className={cn(
        'bg-accent-red/20 border border-accent-red/40 text-accent-red',
        'text-[7px] font-bold px-1.5 py-0.5 rounded-sm',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        'transition-colors',
        count > 0 && 'animate-pulse'
      )}
    >
      {count}
    </button>
  );
}
