import React, { useCallback } from 'react';
import { cn } from '../../utils/cn';

interface FormRangeProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string;
  hint?: string;
  className?: string;
}

export function FormRange({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  hint,
  className,
}: FormRangeProps) {
  const progress = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em]">
            {label}
          </label>
          <span className="text-sm font-mono font-bold text-text-primary">
            {value}
            {unit && (
              <span className="text-text-secondary ml-0.5">{unit}</span>
            )}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label={label || 'Range slider'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="w-full"
        style={
          {
            '--range-progress': `${progress}%`,
          } as React.CSSProperties
        }
      />
      <div className="flex justify-between">
        <span className="text-[8px] text-text-secondary/60">{min}{unit ? ` ${unit}` : ''}</span>
        <span className="text-[8px] text-text-secondary/60">{max}{unit ? ` ${unit}` : ''}</span>
      </div>
      {hint && <p className="text-[8px] text-text-secondary/60">{hint}</p>}
      {error && <p className="text-[9px] text-accent-red">{error}</p>}
    </div>
  );
}
