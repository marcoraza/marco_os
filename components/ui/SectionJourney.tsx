import React, { useState, useCallback } from 'react';
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
import { FormMoneyInput } from './FormMoneyInput';
import { FormUrlInput } from './FormUrlInput';
import { RepeatableFieldGroup } from './RepeatableFieldGroup';
import { JourneyCompletionScreen } from './JourneyCompletionScreen';
import type { JourneyConfig, JourneyStep, JourneyFieldDef } from '../../lib/journeyTypes';

interface SectionJourneyProps {
  config: JourneyConfig;
  onComplete: () => void;
  onSkip: () => void;
}

// Evaluate field condition
function evaluateCondition(
  condition: JourneyFieldDef['condition'],
  allValues: Record<string, unknown>
): boolean {
  if (!condition) return true;
  const fieldValue = allValues[condition.field];
  switch (condition.operator) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'includes':
      return Array.isArray(fieldValue) && fieldValue.includes(condition.value as string);
    case 'gt':
      return Number(fieldValue) > Number(condition.value);
    case 'lt':
      return Number(fieldValue) < Number(condition.value);
    default:
      return true;
  }
}

const stepVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
  }),
};

const stepTransition = {
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

export function SectionJourney({
  config,
  onComplete,
  onSkip,
}: SectionJourneyProps) {
  const [phase, setPhase] = useState<'welcome' | 'steps' | 'completion'>('welcome');
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [allValues, setAllValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = config.steps.length;
  const step = config.steps[currentStep];
  const progress = phase === 'completion' ? 100 : ((currentStep) / totalSteps) * 100;

  const updateValue = useCallback((name: string, value: unknown) => {
    setAllValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateStep = useCallback(
    (stepDef: JourneyStep): Record<string, string> => {
      const stepErrors: Record<string, string> = {};
      for (const field of stepDef.fields) {
        // Skip hidden fields
        if (field.condition && !evaluateCondition(field.condition, allValues)) continue;

        const val = allValues[field.name];

        if (field.required) {
          if (val === undefined || val === null || val === '') {
            stepErrors[field.name] = 'Preencha este campo';
          } else if (Array.isArray(val) && val.length === 0) {
            stepErrors[field.name] = `Selecione pelo menos ${field.minSelected || 1}`;
          }
        }

        // Min selection check
        if (field.minSelected && Array.isArray(val) && val.length < field.minSelected) {
          stepErrors[field.name] = `Selecione pelo menos ${field.minSelected}`;
        }

        // Custom validation
        if (field.validation) {
          const err = field.validation(val);
          if (err) stepErrors[field.name] = err;
        }
      }
      return stepErrors;
    },
    [allValues]
  );

  const handleNext = useCallback(async () => {
    if (!step) return;

    // Validate
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    // Persist step data
    setIsSubmitting(true);
    try {
      if (step.onStepComplete) {
        await step.onStepComplete(allValues);
      }
    } catch {
      // Data is fire-and-forget, continue anyway
    }
    setIsSubmitting(false);

    // Advance
    if (currentStep < totalSteps - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      // Last step -> completion
      if (config.onJourneyComplete) {
        try {
          await config.onJourneyComplete(allValues);
        } catch {
          // fire-and-forget
        }
      }
      setPhase('completion');
    }
  }, [step, currentStep, totalSteps, allValues, validateStep, config]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const renderField = (field: JourneyFieldDef) => {
    // Check condition
    if (field.condition && !evaluateCondition(field.condition, allValues)) {
      return null;
    }

    const val = allValues[field.name];
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <FormInput
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            type={field.type}
            value={(val as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={error}
          />
        );

      case 'time':
        return (
          <FormInput
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            type="time"
            value={(val as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            error={error}
          />
        );

      case 'select':
        return (
          <FormSelect
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            options={field.options || []}
            value={(val as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={error}
          />
        );

      case 'textarea':
        return (
          <FormTextarea
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            value={(val as string) || ''}
            onChange={(e) => updateValue(field.name, e.target.value)}
            placeholder={field.placeholder}
            error={error}
          />
        );

      case 'toggle':
        return (
          <FormToggle
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            checked={(val as boolean) || false}
            onChange={(checked) => updateValue(field.name, checked)}
          />
        );

      case 'range':
        return (
          <FormRange
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            value={(val as number) ?? field.defaultValue ?? field.min ?? 0}
            onChange={(v) => updateValue(field.name, v)}
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step}
            unit={field.unit}
            hint={field.hint}
            error={error}
          />
        );

      case 'multi-checkbox':
        return (
          <FormMultiCheckbox
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            options={field.multiOptions || []}
            value={(val as string[]) || []}
            onChange={(selected) => updateValue(field.name, selected)}
            minSelected={field.minSelected}
            maxSelected={field.maxSelected}
            columns={field.columns}
            hint={field.hint}
            error={error}
          />
        );

      case 'icon-select':
        return (
          <FormIconSelect
            key={field.name}
            label={field.required ? `${field.label} *` : field.label}
            options={field.iconOptions || []}
            value={(val as string) || ''}
            onChange={(v) => updateValue(field.name, v)}
            hint={field.hint}
            error={error}
          />
        );

      case 'money':
        return (
          <FormMoneyInput
            key={field.name}
            label={field.label}
            value={(val as number) || ''}
            onChange={(v) => updateValue(field.name, v)}
            placeholder={field.placeholder}
            hint={field.hint}
            required={field.required}
            error={error}
          />
        );

      case 'url':
        return (
          <FormUrlInput
            key={field.name}
            label={field.label}
            value={(val as string) || ''}
            onChange={(v) => updateValue(field.name, v)}
            placeholder={field.placeholder}
            hint={field.hint}
            required={field.required}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  // ─── WELCOME PHASE ──────────────────────────────────────────────
  if (phase === 'welcome') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-bg-base">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md text-center space-y-6"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-sm bg-brand-mint/10 border border-brand-mint/30 flex items-center justify-center mx-auto">
            <Icon name={config.icon} size="lg" className="text-brand-mint" />
          </div>

          {/* Title & subtitle */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
              {config.welcomeTitle}
            </h2>
            <p className="text-xs text-text-secondary mt-2">
              {config.welcomeSubtitle}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-text-secondary">
            <span>{totalSteps} etapas</span>
            <span className="w-1 h-1 rounded-full bg-border-panel" />
            <span>{config.estimatedMinutes} min</span>
          </div>

          {/* CTA */}
          <button
            onClick={() => setPhase('steps')}
            className="w-full py-3 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all"
          >
            Comecar Setup
          </button>

          {/* Skip */}
          <button
            onClick={onSkip}
            className="text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          >
            Fazer depois
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── COMPLETION PHASE ──────────────────────────────────────────
  if (phase === 'completion') {
    const completionStats = config.getCompletionStats
      ? config.getCompletionStats(allValues)
      : [];

    return (
      <div className="flex-1 flex flex-col bg-bg-base">
        {/* Progress bar at 100% */}
        <div className="px-6 pt-4">
          <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint rounded-full transition-all duration-500"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <JourneyCompletionScreen
          sectionTitle={config.sectionTitle}
          icon={config.icon}
          stats={completionStats}
          onConfirm={onComplete}
        />
      </div>
    );
  }

  // ─── STEPS PHASE ──────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-bg-base overflow-y-auto">
      {/* Progress bar */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-mono text-text-secondary">
            {currentStep + 1} / {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          >
            Fazer depois
          </button>
        </div>
        <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-mint rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={stepTransition}
            className="w-full max-w-2xl bg-surface border border-border-panel rounded-sm p-6 space-y-6"
          >
            {/* Step icon */}
            {step.icon && (
              <div className="w-12 h-12 rounded-sm bg-surface border border-border-panel flex items-center justify-center mx-auto">
                <Icon name={step.icon} size="md" className="text-text-secondary" />
              </div>
            )}

            {/* Step title & subtitle */}
            <div className="text-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                {step.title}
              </h3>
              {step.subtitle && (
                <p className="text-xs text-text-secondary mt-1">
                  {step.subtitle}
                </p>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {step.fields.map((field) => renderField(field))}
            </div>

            {/* Repeatable group (if step has it) */}
            {step.repeatable && (
              <RepeatableFieldGroup
                itemLabel={step.repeatable.itemLabel}
                items={
                  (allValues[`__repeatable_${currentStep}`] as Record<string, unknown>[]) || [{}]
                }
                renderItem={(item, _index, onChange) =>
                  step.fields.map((field) => {
                    const val = item[field.name];
                    const key = `${field.name}_${_index}`;
                    // Render field for repeatable item
                    switch (field.type) {
                      case 'text':
                      case 'number':
                      case 'date':
                        return (
                          <FormInput
                            key={key}
                            label={field.label}
                            type={field.type}
                            value={(val as string) || ''}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        );
                      case 'select':
                        return (
                          <FormSelect
                            key={key}
                            label={field.label}
                            options={field.options || []}
                            value={(val as string) || ''}
                            onChange={(e) => onChange(field.name, e.target.value)}
                          />
                        );
                      case 'money':
                        return (
                          <FormMoneyInput
                            key={key}
                            label={field.label}
                            value={(val as number) || ''}
                            onChange={(v) => onChange(field.name, v)}
                            placeholder={field.placeholder}
                          />
                        );
                      case 'url':
                        return (
                          <FormUrlInput
                            key={key}
                            label={field.label}
                            value={(val as string) || ''}
                            onChange={(v) => onChange(field.name, v)}
                            placeholder={field.placeholder}
                          />
                        );
                      case 'textarea':
                        return (
                          <FormTextarea
                            key={key}
                            label={field.label}
                            value={(val as string) || ''}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                          />
                        );
                      default:
                        return null;
                    }
                  })
                }
                onAddItem={() => {
                  const key = `__repeatable_${currentStep}`;
                  const current = (allValues[key] as Record<string, unknown>[]) || [{}];
                  updateValue(key, [...current, {}]);
                }}
                onRemoveItem={(index) => {
                  const key = `__repeatable_${currentStep}`;
                  const current = (allValues[key] as Record<string, unknown>[]) || [];
                  updateValue(
                    key,
                    current.filter((_, i) => i !== index)
                  );
                }}
                onItemChange={(index, field, value) => {
                  const key = `__repeatable_${currentStep}`;
                  const current = [...((allValues[key] as Record<string, unknown>[]) || [{}])];
                  current[index] = { ...current[index], [field]: value };
                  updateValue(key, current);
                }}
                minItems={step.repeatable.minItems}
                maxItems={step.repeatable.maxItems}
                addLabel={step.repeatable.addLabel}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel rounded-sm hover:text-text-primary hover:border-text-secondary transition-colors"
                >
                  Voltar
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className={cn(
                  'px-6 py-3 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSubmitting
                  ? 'Salvando...'
                  : currentStep < totalSteps - 1
                  ? 'Proximo'
                  : 'Concluir'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
