import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface AuditEntry {
  id?: string;
  timestamp: string;
  type: 'dispatch' | 'cron' | 'config' | 'review' | string;
  action: string;
  details?: string;
  user?: string;
}

type FilterType = 'all' | 'dispatch' | 'cron' | 'config' | 'review';

const FILTER_PILLS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'dispatch', label: 'Dispatch' },
  { id: 'cron', label: 'Cron' },
  { id: 'config', label: 'Config' },
  { id: 'review', label: 'Revisão' },
];

const TYPE_BADGE: Record<string, string> = {
  dispatch: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
  cron: 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
  config: 'bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow',
  review: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
};

const bridgeBase = import.meta.env.VITE_FORM_API_URL || '';
const bridgeHeaders: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_FORM_API_TOKEN || ''}`,
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLog = useCallback(async (type?: FilterType) => {
    if (!bridgeBase) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (type && type !== 'all') params.set('type', type);
      const res = await fetch(`${bridgeBase}/audit?${params}`, { headers: bridgeHeaders });
      const data = await res.json();
      const list = data.ok ? (data.entries ?? data.data ?? []) : [];
      setEntries(Array.isArray(list) ? list : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog(filter);

    intervalRef.current = setInterval(() => {
      fetchLog(filter);
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [filter, fetchLog]);

  const badgeClass = (type: string) =>
    TYPE_BADGE[type] ?? 'bg-surface border-border-panel text-text-secondary';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon="history">AUDITORIA</SectionLabel>
        <button
          onClick={() => fetchLog(filter)}
          disabled={loading}
          className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40"
        >
          <Icon name="refresh" size="xs" className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilter(pill.id)}
            className={cn(
              'px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide border transition-colors',
              filter === pill.id
                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/30'
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {loading && (
        <Card className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-2 bg-border-panel/60 rounded-sm animate-pulse w-20 shrink-0" />
                <div className="h-2 bg-border-panel/60 rounded-sm animate-pulse w-14" />
                <div className="h-2 bg-border-panel/60 rounded-sm animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && entries.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="history" size="lg" className="opacity-30" />
            <span className="text-[11px]">Nenhum registro de auditoria</span>
          </div>
        </Card>
      )}

      {!loading && entries.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-border-panel bg-bg-base/60">
                  <th className="px-4 py-2 text-left font-bold text-text-secondary uppercase tracking-widest text-[9px] whitespace-nowrap">
                    Quando
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-text-secondary uppercase tracking-widest text-[9px]">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-text-secondary uppercase tracking-widest text-[9px]">
                    Ação
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-text-secondary uppercase tracking-widest text-[9px]">
                    Detalhes
                  </th>
                  <th className="px-4 py-2 text-left font-bold text-text-secondary uppercase tracking-widest text-[9px]">
                    Usuário
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-panel/50">
                {entries.map((entry, idx) => (
                  <tr key={entry.id ?? idx} className="hover:bg-surface/40 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] text-text-secondary">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest',
                          badgeClass(entry.type)
                        )}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-text-primary font-medium max-w-[200px] truncate">
                      {entry.action}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary max-w-[240px] truncate">
                      {entry.details ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-text-secondary whitespace-nowrap">
                      {entry.user ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
