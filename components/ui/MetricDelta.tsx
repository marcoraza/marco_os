import React from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface MetricDeltaProps {
  value: number;
  suffix?: string;
  label?: string;
  size?: 'sm' | 'md';
  forceColor?: 'mint' | 'red' | 'orange' | 'blue' | 'purple';
  className?: string;
}

export function MetricDelta({ value, suffix = '%', label, size = 'sm', forceColor, className }: MetricDeltaProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const colorClass = forceColor
    ? `text-${forceColor === 'mint' ? 'brand-mint' : `accent-${forceColor}`}`
    : isPositive ? 'text-brand-mint' : isNegative ? 'text-accent-red' : 'text-text-secondary';
  const iconName = isPositive ? 'arrow_upward' : isNegative ? 'arrow_downward' : 'remove';
  const sizeClasses = size === 'md' ? 'text-xs' : 'text-[10px]';
  return (
    <div className={cn('flex items-center gap-0.5', colorClass, className)}>
      <Icon name={iconName} size="xs" className={sizeClasses} />
      <span className={cn('font-mono font-bold', sizeClasses)}>
        {isPositive && '+'}{value}{suffix}
      </span>
      {label && <span className={cn('font-medium ml-0.5', sizeClasses)}>{label}</span>}
    </div>
  );
}
