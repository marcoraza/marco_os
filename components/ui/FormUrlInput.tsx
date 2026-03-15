import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface FormUrlInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function FormUrlInput({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  error,
  hint,
  required,
  className,
}: FormUrlInputProps) {
  const [warning, setWarning] = useState<string | null>(null);

  const labelWithRequired = required ? `${label} *` : label;

  const handleBlur = useCallback(() => {
    if (!value) {
      setWarning(null);
      return;
    }
    let url = value.trim();
    // Auto-prepend https:// if missing protocol
    if (url && !url.match(/^https?:\/\//)) {
      url = `https://${url}`;
      onChange(url);
    }
    // Basic validation: must contain a dot
    if (url && !url.includes('.')) {
      setWarning('URL parece incompleta');
    } else {
      setWarning(null);
    }
  }, [value, onChange]);

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
          {labelWithRequired}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
          <Icon name="link" size="xs" />
        </span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={label || 'URL'}
          className={cn(
            'w-full bg-header-bg border border-border-panel rounded-sm py-2 pl-9 pr-3 text-xs text-text-primary focus:border-brand-mint focus:outline-none transition-colors placeholder:text-text-secondary/50',
            error && 'border-accent-red focus:border-accent-red'
          )}
        />
      </div>
      {warning && !error && (
        <p className="text-[9px] text-accent-orange">{warning}</p>
      )}
      {hint && <p className="text-[8px] text-text-secondary/60">{hint}</p>}
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
