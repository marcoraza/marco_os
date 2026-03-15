import type { Task } from '../../lib/appTypes';

export interface KanbanColumn {
  id: Task['status'];
  title: string;
  color: string;
  border: string;
  icon: string;
  variant: 'neutral' | 'blue' | 'orange' | 'purple' | 'mint' | 'red';
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'assigned',    title: 'ATRIBUÍDAS',   color: 'bg-slate-500',     border: 'border-slate-500',     icon: 'inbox',        variant: 'neutral' },
  { id: 'started',     title: 'Iniciadas',    color: 'bg-accent-blue',   border: 'border-accent-blue',   icon: 'play_circle',  variant: 'blue' },
  { id: 'in-progress', title: 'Em Andamento', color: 'bg-accent-orange', border: 'border-accent-orange', icon: 'autorenew',    variant: 'orange' },
  { id: 'standby',     title: 'Stand By',     color: 'bg-yellow-500',    border: 'border-yellow-500',    icon: 'pause_circle', variant: 'purple' },
  { id: 'done',        title: 'CONCLUÍDAS',   color: 'bg-brand-mint',    border: 'border-brand-mint',    icon: 'check_circle', variant: 'mint' },
];
