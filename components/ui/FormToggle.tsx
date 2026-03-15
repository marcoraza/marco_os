import React from 'react';
import { cn } from '../../utils/cn';

interface FormToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function FormToggle({ label, checked, onChange, className }: FormToggleProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {label && (
        <span className="text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-border-panel transition-colors',
          checked ? 'bg-brand-mint' : 'bg-header-bg'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform mt-[2px]',
            checked ? 'translate-x-[18px] bg-bg-base' : 'translate-x-[3px] bg-text-secondary'
          )}
        />
      </button>
    </div>
  );
}
