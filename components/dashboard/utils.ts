import React from 'react';
import type { Task } from '../../lib/appTypes';
import { cn } from '../../utils/cn';

export const getPriorityPill = (priority: string): React.ReactElement => {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    urgent: { label: 'P0', bg: 'bg-accent-red',           text: 'text-white' },
    high:   { label: 'P1', bg: 'bg-accent-orange',        text: 'text-white' },
    medium: { label: 'P2', bg: 'bg-text-secondary/50',    text: 'text-white' },
    low:    { label: 'P3', bg: 'bg-text-secondary/25',    text: 'text-text-secondary' },
  };
  const c = config[priority] || config.medium;
  return React.createElement(
    'span',
    { className: cn('px-2 py-0.5 rounded-full text-[9px] font-black shrink-0', c.bg, c.text) },
    c.label
  );
};

export const getDeadlineColor = (deadline: string): string => {
  if (deadline === 'Hoje') return 'text-accent-red';
  if (deadline === 'Amanhã') return 'text-accent-orange';
  if (deadline.startsWith('−')) return 'text-accent-red'; // overdue: −2d
  return 'text-text-secondary';
};

export const getTaskTimestamp = (task: Task): string => {
  // ClickUp tasks use hashed IDs (large numbers) — no fake timestamp for real data
  if (task.id > 100_000) return '';
  // Mock tasks: generate deterministic fake timestamp
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
  urgent: 'bg-accent-red/60',
  high:   'bg-accent-orange/60',
  medium: 'bg-text-secondary/40',
  low:    'bg-text-secondary/20',
};
