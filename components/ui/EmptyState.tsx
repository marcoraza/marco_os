import React from 'react';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-surface border border-border-panel flex items-center justify-center mb-4">
        <Icon name={icon} size="lg" className="text-text-secondary/40" />
      </div>
      <h3 className="text-sm font-bold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-[11px] text-text-secondary max-w-[280px] leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-brand-mint/10 border border-brand-mint/30 rounded-md text-brand-mint text-[10px] font-bold uppercase tracking-wide hover:bg-brand-mint/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
