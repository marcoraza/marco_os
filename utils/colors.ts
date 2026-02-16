// Mission Control V2 — Design System Colors

export const colors = {
  bg: {
    app: '#0a0a0a',      // Mais escuro que antes
    surface: '#18181b',  // zinc-900
    card: '#27272a',     // zinc-800
    hover: '#3f3f46',    // zinc-700
  },
  border: {
    default: '#3f3f46',  // zinc-700
    focus: '#52525b',    // zinc-600
  },
  text: {
    primary: '#fafafa',  // zinc-50
    secondary: '#a1a1aa', // zinc-400
    tertiary: '#71717a',  // zinc-500
  },
  status: {
    active: '#10b981',   // emerald-500
    queued: '#f59e0b',   // amber-500
    completed: '#3b82f6', // blue-500
    failed: '#ef4444',    // red-500
  }
} as const;

export const statusConfig = {
  active: {
    color: colors.status.active,
    borderColor: colors.status.active,
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    label: 'Active'
  },
  queued: {
    color: colors.status.queued,
    borderColor: colors.status.queued,
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500',
    label: 'Queued'
  },
  completed: {
    color: colors.status.completed,
    borderColor: colors.status.completed,
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    label: 'Completed'
  },
  failed: {
    color: colors.status.failed,
    borderColor: colors.status.failed,
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500',
    label: 'Failed'
  }
} as const;

export const iconSizes = {
  sm: 'w-5 h-5',  // 20px
  md: 'w-6 h-6',  // 24px
  lg: 'w-7 h-7',  // 28px
} as const;
