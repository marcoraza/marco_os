import React from 'react';
import { cn } from '@/utils/cn';
import { getStatusToken } from '@/utils/statusTokens';

interface PipelineBadgeProps {
  status: string;
  className?: string;
}

export function PipelineBadge({ status, className }: PipelineBadgeProps) {
  const { color, label } = getStatusToken(status);
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
