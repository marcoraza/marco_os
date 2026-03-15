import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';

interface AlertBannerProps {
  count: number;
  label: string;
  onExpand?: () => void;
  expanded?: boolean;
  children?: ReactNode;
  color?: 'orange' | 'red';
  className?: string;
}

const colorStyles = {
  orange: {
    container: 'bg-accent-orange/10 border-accent-orange/30',
    text: 'text-accent-orange',
  },
  red: {
    container: 'bg-accent-red/10 border-accent-red/30',
    text: 'text-accent-red',
  },
};

export function AlertBanner({
  count,
  label,
  onExpand,
  expanded = false,
  children,
  color = 'orange',
  className,
}: AlertBannerProps) {
  const styles = colorStyles[color];

  return (
    <div className={cn('rounded-sm border', styles.container, className)}>
      <div className="px-3 py-2 flex items-center justify-between">
        <span className={cn('flex items-center gap-2 text-xs', styles.text)}>
          <Icon name="warning" size="sm" />
          {count} {label}
        </span>
        {onExpand && (
          <button
            onClick={onExpand}
            className={cn(
              'cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              styles.text
            )}
            aria-expanded={expanded}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
          >
            <Icon name={expanded ? 'expand_less' : 'expand_more'} size="sm" />
          </button>
        )}
      </div>
      {expanded && children && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
