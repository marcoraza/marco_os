import React from 'react';
import { cn } from '../../utils/cn';

type SparklineColor = 'mint' | 'red' | 'orange' | 'blue' | 'purple';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: SparklineColor;
  showDot?: boolean;
  className?: string;
}

const colorMap: Record<SparklineColor, string> = {
  mint: 'var(--color-brand-mint)',
  red: 'var(--color-accent-red)',
  orange: 'var(--color-accent-orange)',
  blue: 'var(--color-accent-blue)',
  purple: 'var(--color-accent-purple)',
};

export function Sparkline({ data, width = 80, height = 24, color = 'mint', showDot = false, className }: SparklineProps) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - ((v - min) / range) * innerHeight;
    return `${x},${y}`;
  });
  const strokeColor = colorMap[color];
  const lastPoint = points[points.length - 1].split(',');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className={cn('shrink-0', className)}>
      <polyline points={points.join(' ')} stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {showDot && <circle cx={lastPoint[0]} cy={lastPoint[1]} r={2} fill={strokeColor} />}
    </svg>
  );
}
