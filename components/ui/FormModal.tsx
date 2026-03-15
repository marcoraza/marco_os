import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { FormTextarea } from './FormTextarea';
import { FormToggle } from './FormToggle';
import { FormRange } from './FormRange';
import { FormMultiCheckbox } from './FormMultiCheckbox';
import { FormIconSelect } from './FormIconSelect';
import { SectionLabel } from './SectionLabel';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea' | 'toggle'
       | 'range' | 'time' | 'icon-select' | 'multi-checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string | number | boolean | string[];
  validation?: (value: unknown) => string | null;
  customRenderer?: (value: unknown, onChange: (v: unknown) => void) => React.ReactNode;
  /** Grid span: 1 = half width (in 2-col grid), 2 = full width. Default: 2 */
  span?: 1 | 2;
  // --- NEW ---
  condition?: (formData: Record<string, unknown>) => boolean;
  hint?: string;
  section?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  icons?: { value: string; icon: string; label: string }[];
}

export interface FormModalProps {
  title: string;
  fields: FieldDef[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  initialValues?: Record<string, unknown>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FormModal({ title, fields, onSubmit, onClose, isOpen, initialValues }: FormModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Initialize defaults on open
  useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, unknown> = {};
      for (const field of fields) {
        // Priority: initialValues > defaultValue > type default
        if (initialValues && initialValues[field.name] !== undefined) {
          defaults[field.name] = initialValues[field.name];
        } else if (field.defaultValue !== undefined) {
          defaults[field.name] = field.defaultValue;
        } else if (field.type === 'toggle') {
          defaults[field.name] = false;
        } else if (field.type === 'number') {
          defaults[field.name] = '';
        } else if (field.type === 'multi-checkbox') {
          defaults[field.name] = [];
        } else {
          defaults[field.name] = '';
        }
      }
      setValues(defaults);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, fields, initialValues]);

  // Auto-focus first field
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => firstInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const updateValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      // Skip conditionally hidden fields
      if (field.condition && !field.condition(values)) continue;

      const val = values[field.name];

      // Required check
      if (field.required) {
        if (val === '' || val === undefined || val === null) {
          newErrors[field.name] = 'Campo obrigatorio';
          continue;
        }
        if (Array.isArray(val) && val.length === 0) {
          newErrors[field.name] = 'Campo obrigatorio';
          continue;
        }
      }

      // Custom validation
      if (field.validation) {
        const err = field.validation(val);
        if (err) newErrors[field.name] = err;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } catch {
      // Error handling is the caller's responsibility
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const renderField = (field: FieldDef, index: number) => {
    // Conditional rendering
    if (field.condition && !field.condition(values)) return null;

    const value = values[field.name];
    const error = errors[field.name];
    const isFirst = index === 0;
    const labelWithRequired = field.required ? `${field.label} *` : field.label;

    // Custom renderer
    if (field.customRenderer) {
      return (
        <div key={field.name} className={cn(field.span === 1 ? '' : 'col-span-2')}>
          <label className="block text-[10px] font-bold uppercase text-text-secondary tracking-[0.08em] mb-1">
            {labelWithRequired}
          </label>
          {field.customRenderer(value, (v) => updateValue(field.name, v))}
          {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          {error && <p className="text-[9px] text-accent-red mt-1">{error}</p>}
        </div>
      );
    }

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <div key={field.name} className={cn(field.span === 1 ? '' : 'col-span-2')}>
            <FormInput
              ref={isFirst ? (firstInputRef as React.Ref<HTMLInputElement>) : undefined}
              label={labelWithRequired}
              type={field.type}
              value={value as string}
              onChange={(e) => updateValue(field.name, field.type === 'number' ? e.target.value : e.target.value)}
              placeholder={field.placeholder}
              error={error}
            />
            {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          </div>
        );

      case 'time':
        return (
          <div key={field.name} className={cn(field.span === 1 ? '' : 'col-span-2')}>
            <FormInput
              label={labelWithRequired}
              type="time"
              value={value as string}
              onChange={(e) => updateValue(field.name, e.target.value)}
              error={error}
            />
            {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className={cn(field.span === 1 ? '' : 'col-span-2')}>
            <FormSelect
              label={labelWithRequired}
              options={field.options || []}
              value={value as string}
              onChange={(e) => updateValue(field.name, e.target.value)}
              placeholder={field.placeholder}
              error={error}
            />
            {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="col-span-2">
            <FormTextarea
              label={labelWithRequired}
              value={value as string}
              onChange={(e) => updateValue(field.name, e.target.value)}
              placeholder={field.placeholder}
              error={error}
            />
            {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          </div>
        );

      case 'toggle':
        return (
          <div key={field.name} className="col-span-2">
            <FormToggle
              label={labelWithRequired}
              checked={value as boolean}
              onChange={(checked) => updateValue(field.name, checked)}
            />
            {field.hint && <p className="text-[8px] text-text-secondary/60 mt-0.5">{field.hint}</p>}
          </div>
        );

      case 'range':
        return (
          <div key={field.name} className={cn(field.span === 1 ? '' : 'col-span-2')}>
            <FormRange
              label={labelWithRequired}
              value={Number(value ?? field.defaultValue ?? field.min ?? 0)}
              onChange={(v) => updateValue(field.name, v)}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step}
              unit={field.unit}
              hint={field.hint}
              error={error}
            />
          </div>
        );

      case 'icon-select':
        return (
          <div key={field.name} className="col-span-2">
            <FormIconSelect
              label={labelWithRequired}
              options={field.icons || []}
              value={(value as string) || ''}
              onChange={(v) => updateValue(field.name, v)}
              hint={field.hint}
              error={error}
            />
          </div>
        );

      case 'multi-checkbox':
        return (
          <div key={field.name} className="col-span-2">
            <FormMultiCheckbox
              label={labelWithRequired}
              options={field.options?.map(o => ({ value: o.value, label: o.label })) || []}
              value={(value as string[]) || []}
              onChange={(selected) => updateValue(field.name, selected)}
              hint={field.hint}
              error={error}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-lg bg-surface border border-border-panel rounded-sm shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-panel bg-header-bg">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 grid grid-cols-2 gap-3">
                {(() => {
                  // Group fields by section
                  const sections: Record<string, FieldDef[]> = {};
                  for (const field of fields) {
                    const section = field.section || '__default__';
                    if (!sections[section]) sections[section] = [];
                    sections[section].push(field);
                  }

                  return Object.entries(sections).map(([sectionName, sectionFields], si) => (
                    <React.Fragment key={sectionName}>
                      {sectionName !== '__default__' && si > 0 && (
                        <div className="col-span-2 border-t border-border-panel pt-3 mt-1">
                          <SectionLabel>{sectionName}</SectionLabel>
                        </div>
                      )}
                      {sectionName !== '__default__' && si === 0 && (
                        <div className="col-span-2">
                          <SectionLabel>{sectionName}</SectionLabel>
                        </div>
                      )}
                      {sectionFields.map((field, i) => renderField(field, si * 100 + i))}
                    </React.Fragment>
                  ));
                })()}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-4 border-t border-border-panel bg-header-bg">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel rounded-sm hover:text-text-primary hover:border-text-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'px-6 py-2 text-[9px] font-bold uppercase tracking-widest rounded-sm transition-all',
                    'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-pulse">Salvando...</span>
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
