import React from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Icon name="search" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-bg-base border border-border-panel rounded-sm py-2 pl-9 pr-9 text-xs text-text-primary focus:outline-none focus:border-brand-mint/30 transition-colors placeholder:text-text-secondary/40" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors" type="button">
          <Icon name="close" size="xs" />
        </button>
      )}
    </div>
  );
}
