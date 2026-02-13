import React from 'react';
import { cn } from '../../utils/cn';

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'mint' | 'red' | 'orange' | 'blue';
  pulse?: boolean;
  glow?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const colorStyles = {
  mint: 'bg-brand-mint',
  red: 'bg-accent-red',
  orange: 'bg-accent-orange',
  blue: 'bg-accent-blue',
};

const glowStyles = {
  mint: 'shadow-[0_0_8px_rgba(0,255,149,0.5)]',
  red: 'shadow-[0_0_8px_rgba(255,69,58,0.5)]',
  orange: 'shadow-[0_0_8px_rgba(255,159,10,0.5)]',
  blue: 'shadow-[0_0_8px_rgba(10,132,255,0.5)]',
};

export function StatusDot({ color = 'mint', pulse = false, glow = false, size = 'sm', className, ...props }: StatusDotProps) {
  return (
    <span 
      className={cn(
        'rounded-full inline-block',
        size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
        colorStyles[color],
        glow && glowStyles[color],
        pulse && 'animate-pulse',
        className
      )} 
      {...props}
    />
  );
}