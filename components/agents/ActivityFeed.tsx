import { useState, useEffect, useCallback } from 'react';
import { Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface ActivityEvent {
  id: string;
  type: 'session' | 'cron' | 'task';
  title: string;
  description?: string;
  createdAt: string;
}

const typeConfig: Record<ActivityEvent['type'], { icon: string; color: string; dot: string }> = {
  session: {
    icon: 'smart_toy',
    color: 'text-accent-blue',
    dot: 'bg-accent-blue',
  },
  cron: {
    icon: 'schedule',
    color: 'text-accent-purple',
    dot: 'bg-accent-purple',
  },
  task: {
    icon: 'task_alt',
    color: 'text-brand-mint',
    dot: 'bg-brand-mint',
  },
};

const API_URL = import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/activities?limit=30`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json.ok ? (json.activities ?? json.data ?? []) : [];
      setActivities(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 30_000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return (
    <div className="space-y-3">
      <SectionLabel icon="timeline">FEED DE ATIVIDADE</SectionLabel>

      <Card className="p-4">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-border-panel/60 animate-pulse mt-1.5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-3/4" />
                  <div className="h-2.5 bg-border-panel/60 rounded-sm animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-accent-red py-2">
            <Icon name="error_outline" size="sm" />
            <span className="text-[11px]">{error}</span>
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="timeline" size="lg" />
            <span className="text-[11px]">Nenhuma atividade recente</span>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[3px] top-2 bottom-2 w-px bg-border-panel" />

            <div className="space-y-4 pl-5">
              {activities.map((event, idx) => {
                const cfg = typeConfig[event.type] ?? typeConfig.task;
                return (
                  <div key={event.id} className="relative flex items-start gap-3">
                    {/* Dot */}
                    <div
                      className={cn(
                        'absolute -left-5 mt-1 w-2 h-2 rounded-full border-2 border-bg-base',
                        cfg.dot
                      )}
                    />
                    {/* Icon */}
                    <Icon name={cfg.icon} size="xs" className={cn('shrink-0 mt-0.5', cfg.color)} />
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-medium text-text-primary leading-tight">
                          {event.title}
                        </span>
                        <span className="text-[9px] font-mono text-text-secondary shrink-0">
                          {formatRelativeTime(event.createdAt)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-0.5 text-[10px] text-text-secondary leading-snug">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
