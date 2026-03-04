import React from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface IconSelectOption {
  value: string;
  icon: string;
  label: string;
}

interface FormIconSelectProps {
  label?: string;
  options: IconSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  className?: string;
}

export function FormIconSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  className,
}: FormIconSelectProps) {
  // Responsive grid: wraps on mobile, uses option count on desktop
  const gridClass =
    options.length >= 5
      ? 'grid-cols-3 sm:grid-cols-5'
      : options.length === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-3';

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
          {label}
        </label>
      )}
      <div className={cn('grid gap-2', gridClass)}>
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${opt.label}${isSelected ? ' (selecionado)' : ''}`}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 border rounded-sm cursor-pointer transition-colors text-center',
                isSelected
                  ? 'bg-brand-mint/5 border-brand-mint/30'
                  : 'bg-header-bg border-border-panel hover:border-text-secondary'
              )}
            >
              <Icon
                name={opt.icon}
                size="md"
                className={cn(
                  isSelected ? 'text-brand-mint' : 'text-text-secondary'
                )}
              />
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wide',
                  isSelected ? 'text-brand-mint' : 'text-text-secondary'
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {hint && <p className="text-[8px] text-text-secondary/60">{hint}</p>}
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
