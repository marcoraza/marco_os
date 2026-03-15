import React, { useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface MultiCheckboxOption {
  value: string;
  label: string;
  icon?: string;
}

interface FormMultiCheckboxProps {
  label?: string;
  options: MultiCheckboxOption[];
  value: string[];
  onChange: (selected: string[]) => void;
  minSelected?: number;
  maxSelected?: number;
  error?: string;
  hint?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function FormMultiCheckbox({
  label,
  options,
  value,
  onChange,
  minSelected,
  maxSelected,
  error,
  hint,
  columns = 2,
  className,
}: FormMultiCheckboxProps) {
  // Suppress unused var warning — minSelected is used for external validation
  void minSelected;

  const toggleOption = useCallback(
    (optionValue: string) => {
      const isSelected = value.includes(optionValue);
      if (isSelected) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        if (maxSelected && value.length >= maxSelected) return;
        onChange([...value, optionValue]);
      }
    },
    [value, onChange, maxSelected]
  );

  // Responsive: single column on mobile, configured columns on desktop
  const gridClass =
    columns === 4
      ? 'grid-cols-1 sm:grid-cols-4'
      : columns === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2';

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
          {label}
        </label>
      )}
      <div className={cn('grid gap-2', gridClass)}>
        {options.map((opt) => {
          const isSelected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${opt.label}${isSelected ? ' (selecionado)' : ''}`}
              onClick={() => toggleOption(opt.value)}
              className={cn(
                'flex items-center gap-2 p-3 border rounded-sm cursor-pointer transition-colors text-left',
                isSelected
                  ? 'bg-brand-mint/5 border-brand-mint/30'
                  : 'bg-header-bg border-border-panel hover:border-text-secondary'
              )}
            >
              {/* Checkbox indicator */}
              <span
                className={cn(
                  'w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center',
                  isSelected
                    ? 'bg-brand-mint/20 border-brand-mint'
                    : 'border-border-panel'
                )}
              >
                {isSelected && (
                  <Icon name="check" size="xs" className="text-brand-mint" />
                )}
              </span>
              {/* Icon if present */}
              {opt.icon && (
                <Icon
                  name={opt.icon}
                  size="sm"
                  className={cn(
                    isSelected ? 'text-brand-mint' : 'text-text-secondary'
                  )}
                />
              )}
              {/* Label */}
              <span
                className={cn(
                  'text-xs',
                  isSelected ? 'text-text-primary' : 'text-text-primary'
                )}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
      {maxSelected && (
        <p className="text-[9px] font-mono text-text-secondary text-right mt-1">
          {value.length} de {maxSelected} selecionados
        </p>
      )}
      {hint && <p className="text-[8px] text-text-secondary/60">{hint}</p>}
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
