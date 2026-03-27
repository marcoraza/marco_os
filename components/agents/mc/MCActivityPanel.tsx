import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { FilterPills } from '../../ui/FilterPills';
import { mcApi } from '../../../lib/mcApi';
import { useMissionControlStore, type MCActivity } from '../../../store/missionControl';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Props ────────────────────────────────────────────────────────────────────

interface MCActivityPanelProps {
  agentId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 20_000;
const MAX_DISPLAY = 50;
const SKELETON_COUNT = 5;

const FILTER_PILLS = [
  { id: 'all', label: 'Todos' },
  { id: 'task', label: 'Tasks' },
  { id: 'agent', label: 'Agentes' },
  { id: 'session', label: 'Sessoes' },
  { id: 'comment', label: 'Comentarios' },
];

const ICON_MAP: Record<string, string> = {
  'task.created': 'add_task',
  'task.status_changed': 'swap_horiz',
  'task.completed': 'check_circle',
  'agent.registered': 'person_add',
  'agent.status_changed': 'sync',
  'comment.added': 'chat_bubble',
  'session.started': 'play_circle',
  'session.ended': 'stop_circle',
};

const COLOR_MAP: Record<string, { text: string; border: string; bg: string }> = {
  'task.completed': {
    text: 'text-brand-mint',
    border: 'border-brand-mint/30',
    bg: 'bg-brand-mint/10',
  },
  'task.created': {
    text: 'text-accent-blue',
    border: 'border-accent-blue/30',
    bg: 'bg-accent-blue/10',
  },
  'agent.registered': {
    text: 'text-accent-purple',
    border: 'border-accent-purple/30',
    bg: 'bg-accent-purple/10',
  },
  'comment.added': {
    text: 'text-accent-orange',
    border: 'border-accent-orange/30',
    bg: 'bg-accent-orange/10',
  },
};

const DEFAULT_COLOR = {
  text: 'text-text-secondary',
  border: 'border-border-panel',
  bg: 'bg-surface',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getIcon(type: string): string {
  return ICON_MAP[type] || 'info';
}

function getColor(type: string) {
  return COLOR_MAP[type] || DEFAULT_COLOR;
}

function relativeTime(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'agora';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  return Math.floor(s / 86400) + 'd';
}

function matchesFilter(activity: MCActivity, filter: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'comment') return activity.type.startsWith('comment.');
  return activity.entity_type === filter || activity.type.startsWith(filter + '.');
}

// ── Component ────────────────────────────────────────────────────────────────

export function MCActivityPanel({ agentId }: MCActivityPanelProps) {
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const activities = useMissionControlStore((s) => s.activities);
  const setActivities = useMissionControlStore((s) => s.setActivities);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await mcApi.get<{ data: MCActivity[] } | MCActivity[]>(
        '/api/activities?limit=50',
      );
      const items = Array.isArray(res) ? res : res.data;
      setActivities(items);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setActivities]);

  useMCPoll(fetchActivities, POLL_INTERVAL_MS);

  const filtered = useMemo(() => {
    let items = [...activities];

    // Filter by agent if prop provided
    if (agentId) {
      items = items.filter(
        (a) => a.actor.toLowerCase() === agentId.toLowerCase(),
      );
    }

    // Filter by type pill
    items = items.filter((a) => matchesFilter(a, filter));

    // Sort newest first
    items.sort((a, b) => b.created_at - a.created_at);

    return items.slice(0, MAX_DISPLAY);
  }, [activities, agentId, filter]);

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading && activities.length === 0) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
          Atividade recente
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 bg-border-panel animate-pulse rounded-sm shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-border-panel animate-pulse rounded-sm w-3/4" />
                <div className="h-2.5 bg-border-panel animate-pulse rounded-sm w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3">
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-3">
        Atividade recente
      </div>

      <FilterPills
        pills={FILTER_PILLS}
        activeId={filter}
        onSelect={setFilter}
        className="mb-3"
      />

      {error && activities.length === 0 && (
        <p className="text-text-secondary text-xs text-center py-6">
          Falha ao carregar atividades
        </p>
      )}

      {!error && filtered.length === 0 && (
        <p className="text-text-secondary text-xs text-center py-6">
          Nenhuma atividade registrada
        </p>
      )}

      {filtered.length > 0 && (
        <div className="flex flex-col">
          {filtered.map((activity, index) => {
            const isLast = index === filtered.length - 1;
            const color = getColor(activity.type);
            const iconName = getIcon(activity.type);

            return (
              <div key={activity.id} className="flex gap-3">
                {/* Icon column with vertical connector */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-sm flex items-center justify-center border',
                      color.bg,
                      color.border,
                      color.text,
                    )}
                  >
                    <Icon name={iconName} size="xs" />
                  </div>
                  {!isLast && (
                    <div className="w-px flex-1 bg-border-panel mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-text-primary">
                        {activity.actor}
                      </span>
                      <span className="text-[10px] text-text-secondary ml-1">
                        {activity.description}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-text-secondary whitespace-nowrap">
                      {relativeTime(activity.created_at)}
                    </span>
                  </div>
                  {activity.entity?.title && (
                    <p className="text-[9px] text-text-secondary mt-0.5 truncate">
                      {activity.entity.title}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
