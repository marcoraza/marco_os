import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'card' | 'chart';
  count?: number;
}

export function Skeleton({ className, variant = 'line', count = 1 }: SkeletonProps) {
  const base = 'animate-pulse bg-border-panel/60 rounded-sm';

  if (variant === 'circle') {
    return <div className={cn(base, 'rounded-full', className)} />;
  }

  if (variant === 'chart') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className={cn(base, 'h-3 w-24')} />
        <div className={cn(base, 'h-40 w-full rounded-md')} />
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('bg-surface border border-border-panel rounded-md p-4 space-y-3', className)}>
        <div className={cn(base, 'h-3 w-2/3')} />
        <div className={cn(base, 'h-2 w-full')} />
        <div className={cn(base, 'h-2 w-4/5')} />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn(base, 'h-3', i === count - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}
