import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'mint' | 'red' | 'orange' | 'blue' | 'purple' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  mint:    'bg-brand-mint/10 text-brand-mint border-brand-mint/20',
  red:     'bg-accent-red/10 text-accent-red border-accent-red/20',
  orange:  'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
  blue:    'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
  purple:  'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  neutral: 'bg-surface text-text-secondary border-border-panel',
};

const sizeStyles = {
  xs: 'text-[7px] px-1 py-px',
  sm: 'text-[8px] px-1.5 py-0.5',
  md: 'text-[9px] px-2 py-0.5',
};

export function Badge({ children, variant = 'neutral', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'font-black uppercase tracking-wider border rounded-sm inline-flex items-center gap-1 select-none',
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {children}
    </span>
  );
}