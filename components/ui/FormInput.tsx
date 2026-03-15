import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
}

const BASE_CLASSES =
  'w-full bg-header-bg border border-border-panel rounded-sm py-2 px-3 text-xs text-text-primary focus:border-brand-mint focus:outline-none transition-colors placeholder:text-text-secondary/50';

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput({ label, error, className, id, ...props }, ref) {
    const inputId = id || (label ? `form-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(BASE_CLASSES, error && 'border-accent-red focus:border-accent-red', className)}
          {...props}
        />
        {error && <p className="text-[9px] text-accent-red">{error}</p>}
      </div>
    );
  }
);
