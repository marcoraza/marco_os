import React from 'react';
import type { Task, Project } from '../../lib/appTypes';
import { Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import type { KanbanColumn } from './types';

interface DashboardHeaderProps {
  activeProject: Project | undefined;
  quickCapture: string;
  onQuickCaptureChange: (v: string) => void;
  onQuickCaptureKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  activeFilter: 'all' | 'mine' | 'team';
  onFilterChange: (f: 'all' | 'mine' | 'team') => void;
  priorityFilter: string | null;
  onPriorityFilterChange: (p: string | null) => void;
  tagFilter: string | null;
  onTagFilterChange: (t: string | null) => void;
  availableTags: string[];
  activeColumn: Task['status'];
  onColumnChange: (c: Task['status']) => void;
  columns: KanbanColumn[];
  displayTasks: Task[];
}

const FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'mine', label: 'Minhas' },
  { id: 'team', label: 'Time' },
] as const;

const PRIORITIES = [
  { val: 'high',   label: 'Alta',  color: 'text-accent-red border-accent-red/30 bg-accent-red/10' },
  { val: 'medium', label: 'MÉDIA', color: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10' },
  { val: 'low',    label: 'Baixa', color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10' },
] as const;

export default function DashboardHeader({
  activeProject,
  quickCapture,
  onQuickCaptureChange,
  onQuickCaptureKeyDown,
  activeFilter,
  onFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  tagFilter,
  onTagFilterChange,
  availableTags,
  activeColumn,
  onColumnChange,
  columns,
  displayTasks,
}: DashboardHeaderProps) {
  return (
    <div className="p-4 border-b border-border-panel flex flex-col gap-3 z-10 bg-bg-base shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon name="layers" size="lg" className="text-brand-mint" />
          <div>
            <SectionLabel className="text-[12px] tracking-[0.1em] text-text-primary">Fila de MISSÕES</SectionLabel>
            <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
              {activeProject && (
                <span className="size-1.5 rounded-full inline-block" style={{ backgroundColor: activeProject.color }}></span>
              )}
              {activeProject?.name ?? '–'}
            </p>
          </div>
        </div>

        {/* Quick Capture */}
        <div className="flex-grow max-w-sm relative hidden sm:block">
          <Icon name="bolt" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mint" />
          <input
            type="text"
            value={quickCapture}
            onChange={e => onQuickCaptureChange(e.target.value)}
            onKeyDown={onQuickCaptureKeyDown}
            placeholder="Captura rápida… Enter para criar"
            className="w-full bg-bg-base border border-border-panel rounded-md pl-9 pr-3 py-2 text-[11px] text-text-primary focus:outline-none focus:border-brand-mint/50 transition-colors placeholder:text-text-secondary/40"
          />
        </div>

        {/* Assignee Filters */}
        <div className="flex bg-header-bg p-1 rounded-md border border-border-panel hidden sm:flex relative">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`relative z-10 px-3 py-1 text-[9px] font-black rounded-sm uppercase tracking-tight transition-all duration-300 ${
                activeFilter === filter.id
                  ? 'text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {activeFilter === filter.id && (
                <span className="absolute inset-0 bg-surface border border-border-panel/40 rounded-sm -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
              )}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority & Tag Filters */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <div className="flex items-center gap-2 pr-4 border-r border-border-panel/50">
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mr-1">Prioridade:</span>
          {PRIORITIES.map(p => (
            <button
              key={p.val}
              onClick={() => onPriorityFilterChange(priorityFilter === p.val ? null : p.val)}
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border transition-all ${
                priorityFilter === p.val
                  ? p.color
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-panel'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mr-1">Tags:</span>
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagFilterChange(tagFilter === tag ? null : tag)}
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border transition-all whitespace-nowrap ${
                tagFilter === tag
                  ? 'text-brand-mint border-brand-mint/30 bg-brand-mint/10'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-panel'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {(priorityFilter || tagFilter) && (
          <button
            onClick={() => { onPriorityFilterChange(null); onTagFilterChange(null); }}
            className="text-[9px] font-bold text-text-secondary hover:text-text-primary uppercase flex items-center gap-1 ml-auto"
          >
            <Icon name="close" className="text-[10px]" /> Limpar
          </button>
        )}
      </div>

      {/* Column Selector (Mobile Only) */}
      <div className="flex gap-2 overflow-x-auto py-1 md:hidden no-scrollbar">
        {columns.map(col => {
          const count = displayTasks.filter(t => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => onColumnChange(col.id)}
              className={cn(
                'px-3 py-1.5 text-[9px] font-black uppercase tracking-wide rounded-sm whitespace-nowrap border transition-colors flex items-center gap-1.5',
                activeColumn === col.id
                  ? 'bg-surface border-brand-mint/30 text-brand-mint shadow-sm'
                  : 'border-border-panel text-text-secondary bg-header-bg'
              )}
            >
              {col.title}
              <span className={cn('px-1 rounded-sm text-[8px]', activeColumn === col.id ? 'bg-brand-mint/10 text-brand-mint' : 'bg-bg-base text-text-secondary')}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
