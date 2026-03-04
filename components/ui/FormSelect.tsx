import React from 'react';
import { cn } from '../../utils/cn';

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: FormSelectOption[];
  placeholder?: string;
}

const BASE_CLASSES =
  'w-full bg-header-bg border border-border-panel rounded-sm py-2 px-3 text-xs text-text-primary focus:border-brand-mint focus:outline-none transition-colors';

export function FormSelect({ label, error, options, placeholder, className, id, ...props }: FormSelectProps) {
  const selectId = id || (label ? `form-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(BASE_CLASSES, error && 'border-accent-red focus:border-accent-red', className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
