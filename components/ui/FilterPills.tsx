import React from 'react';
import { cn } from '@/utils/cn';

interface FilterPillsProps {
  options?: string[];
  value?: string;
  onChange?: (value: string) => void;
  pills?: { id: string; label: string }[];
  activeId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

export function FilterPills({ options, value, onChange, pills, activeId, onSelect, className }: FilterPillsProps) {
  const entries = pills ?? options?.map(option => ({ id: option, label: option })) ?? [];
  const selected = activeId ?? value ?? '';
  const handleSelect = onSelect ?? onChange ?? (() => {});

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {entries.map(entry => {
        const isActive = entry.id === selected;
        return (
          <button
            key={entry.id}
            onClick={() => handleSelect(entry.id)}
            aria-pressed={isActive}
            className={cn(
              'text-[8px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm border transition-all min-h-[44px]',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              isActive
                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary'
            )}
          >
            {entry.label}
          </button>
        );
      })}
    </div>
  );
}
