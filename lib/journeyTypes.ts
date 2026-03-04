export interface JourneyFieldDef {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'date'
    | 'textarea'
    | 'toggle'
    | 'range'
    | 'time'
    | 'multi-checkbox'
    | 'icon-select'
    | 'money'
    | 'url';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;

  // Conditional rendering
  condition?: {
    field: string;
    operator: 'eq' | 'neq' | 'includes' | 'gt' | 'lt';
    value: unknown;
  };

  // Visual grouping
  section?: string;

  // Help text below field
  hint?: string;

  // For 'range'
  min?: number;
  max?: number;
  step?: number;
  unit?: string;

  // For 'multi-checkbox'
  multiOptions?: { value: string; label: string; icon?: string }[];
  minSelected?: number;
  maxSelected?: number;
  columns?: 2 | 3 | 4;

  // For 'icon-select'
  iconOptions?: { value: string; icon: string; label: string }[];

  // For 'money'
  currency?: string;

  // Custom validation
  validation?: (value: unknown) => string | null;
}

export interface RepeatableConfig {
  itemLabel: string;
  minItems: number;
  maxItems: number;
  addLabel: string;
}

export interface JourneyStep {
  title: string;
  subtitle?: string;
  icon?: string;
  fields: JourneyFieldDef[];
  repeatable?: RepeatableConfig;
  onStepComplete?: (allValues: Record<string, unknown>) => Promise<void>;
}

export interface JourneyConfig {
  viewId: string;
  tabId?: string;
  sectionTitle: string;
  icon: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  estimatedMinutes: number;
  steps: JourneyStep[];
  onJourneyComplete?: (allValues: Record<string, unknown>) => Promise<void>;
  getCompletionStats?: (allValues: Record<string, unknown>) => { label: string; value: string | number }[];
}
