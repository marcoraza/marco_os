import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface TimelineItemProps {
  timestamp: string;
  title: string;
  badge?: ReactNode;
  children?: ReactNode;
  variant?: 'default' | 'error';
}

export function TimelineItem({ timestamp, title, badge, children, variant = 'default' }: TimelineItemProps) {
  return (
    <div
      className={cn(
        'relative py-2 px-3 border-l-2',
        variant === 'error'
          ? 'bg-accent-red/5 border-accent-red'
          : 'border-border-panel'
      )}
    >
      {/* Dot indicator */}
      <span
        className={cn(
          'absolute -left-[5px] top-3 w-2 h-2 rounded-full border',
          variant === 'error'
            ? 'bg-accent-red border-accent-red'
            : 'bg-bg-base border-border-panel'
        )}
      />
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <span className="text-xs font-bold text-text-primary">{title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {badge}
          <span className="text-[8px] font-mono text-text-secondary">{timestamp}</span>
        </div>
      </div>
      {children && (
        <div className="text-xs text-text-secondary">{children}</div>
      )}
    </div>
  );
}
