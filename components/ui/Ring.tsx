import React from 'react';
import { cn } from '../../utils/cn';

export type RingColor = 'mint' | 'red' | 'orange' | 'blue' | 'purple';

interface RingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: RingColor;
  showValue?: boolean;
  label?: string;
  className?: string;
}

const colorMap: Record<RingColor, string> = {
  mint: 'var(--color-brand-mint)',
  red: 'var(--color-accent-red)',
  orange: 'var(--color-accent-orange)',
  blue: 'var(--color-accent-blue)',
  purple: 'var(--color-accent-purple)',
};

export function Ring({ value, size = 64, strokeWidth = 4, color = 'mint', showValue = true, label, className }: RingProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;
  const center = size / 2;
  const strokeColor = colorMap[color];
  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-border-panel)" strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500 ease-out" />
      </svg>
      {showValue && (
        <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-text-primary"
          style={{ fontSize: size < 48 ? '9px' : size < 80 ? '12px' : '14px' }}>
          {clampedValue}%
        </span>
      )}
      {label && <span className="mt-1 text-[7px] uppercase font-bold tracking-wider text-text-secondary">{label}</span>}
    </div>
  );
}
