import React from 'react';
import type { Task } from '../../lib/appTypes';
import { cn } from '../../utils/cn';

export const getPriorityPill = (priority: string): React.ReactElement => {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    high:   { label: 'P0', bg: 'bg-accent-red',           text: 'text-white' },
    medium: { label: 'P1', bg: 'bg-accent-orange',        text: 'text-white' },
    low:    { label: 'P2', bg: 'bg-text-secondary/40',    text: 'text-white' },
  };
  const c = config[priority] || config.low;
  return React.createElement(
    'span',
    { className: cn('px-2 py-0.5 rounded-full text-[9px] font-black shrink-0', c.bg, c.text) },
    c.label
  );
};

export const getDeadlineColor = (deadline: string): string => {
  if (deadline === 'Hoje') return 'text-accent-red';
  if (deadline === 'Amanhã') return 'text-accent-orange';
  if (deadline === 'Ontem' || deadline.includes('atrás')) return 'text-brand-mint';
  return 'text-text-secondary';
};

export const getTaskTimestamp = (task: Task): string => {
  const base = new Date('2026-02-16T20:00:00Z');
  base.setMinutes(base.getMinutes() + task.id * 17);
  return base.toISOString().replace(/\.\d{3}Z/, 'Z');
};

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-panel)',
    borderRadius: '4px',
    fontSize: '10px',
    color: 'var(--color-text-primary)',
  },
  itemStyle: { color: 'var(--color-text-primary)' },
  labelStyle: { color: 'var(--color-text-secondary)', fontSize: '9px', fontWeight: 700 },
};

export const prioPillColor: Record<string, string> = {
  high:   'bg-accent-red/60',
  medium: 'bg-accent-orange/60',
  low:    'bg-text-secondary/30',
};
