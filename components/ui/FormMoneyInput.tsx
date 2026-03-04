import React, { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';

interface FormMoneyInputProps {
  label?: string;
  value: number | '';
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  currency?: string;
  required?: boolean;
  className?: string;
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoney(raw: string): number {
  // Remove dots (thousands separator), replace comma with dot (decimal)
  const cleaned = raw.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function FormMoneyInput({
  label,
  value,
  onChange,
  placeholder = '0,00',
  error,
  hint,
  currency = 'BRL',
  required,
  className,
}: FormMoneyInputProps) {
  const [displayValue, setDisplayValue] = useState(
    value !== '' ? formatMoney(value) : ''
  );
  const [isFocused, setIsFocused] = useState(false);

  // Suppress unused var — isFocused drives future UX enhancements
  void isFocused;

  const prefix = currency === 'BRL' ? 'R$' : '$';

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Show raw number for editing
    if (value !== '' && value !== 0) {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const parsed = parseMoney(displayValue);
    onChange(parsed);
    if (parsed > 0) {
      setDisplayValue(formatMoney(parsed));
    } else {
      setDisplayValue('');
    }
  }, [displayValue, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers, dots, and commas while typing
      const raw = e.target.value.replace(/[^0-9.,]/g, '');
      setDisplayValue(raw);
    },
    []
  );

  const labelWithRequired = required ? `${label} *` : label;

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
          {labelWithRequired}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-secondary pointer-events-none">
          {prefix}
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={label || 'Valor monetario'}
          className={cn(
            'w-full bg-header-bg border border-border-panel rounded-sm py-2 pl-10 pr-3 text-xs font-mono text-text-primary focus:border-brand-mint focus:outline-none transition-colors placeholder:text-text-secondary/50',
            error && 'border-accent-red focus:border-accent-red'
          )}
        />
      </div>
      {hint && <p className="text-[8px] text-text-secondary/60">{hint}</p>}
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
