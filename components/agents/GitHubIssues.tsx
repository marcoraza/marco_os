import { useState, useEffect, useCallback } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface GHLabel {
  name: string;
  color?: string;
}

interface GHIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  labels: GHLabel[];
  assignee?: string;
  updatedAt: string;
  url?: string;
}

const API_URL = import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

export default function GitHubIssues() {
  const [issues, setIssues] = useState<GHIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/github/issues`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      const json = await res.json();
      if (!json.ok && json.error) {
        setError(json.error);
        setIssues([]);
      } else {
        const list = json.issues ?? json.data ?? [];
        setIssues(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const openIssue = (issue: GHIssue) => {
    const url = issue.url ?? `https://github.com/marcoraza/marco_os/issues/${issue.number}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon="code">GITHUB ISSUES</SectionLabel>
        <button
          onClick={fetchIssues}
          disabled={loading}
          className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40"
        >
          <Icon name="refresh" size="xs" className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {loading && (
        <Card className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-8 shrink-0" />
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse flex-1" />
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-12 shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-red">
            <Icon name="error_outline" size="sm" />
            <span className="text-[11px]">{error}</span>
          </div>
        </Card>
      )}

      {!loading && !error && issues.length === 0 && (
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="code" size="lg" />
            <span className="text-[11px]">Nenhuma issue encontrada</span>
          </div>
        </Card>
      )}

      {!loading && !error && issues.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-border-panel">
            {issues.map((issue) => (
              <div
                key={issue.number}
                onClick={() => openIssue(issue)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-surface/50 cursor-pointer transition-colors group"
              >
                {/* Number */}
                <span className="text-[11px] font-mono text-text-secondary shrink-0 pt-0.5 group-hover:text-text-primary transition-colors">
                  #{issue.number}
                </span>

                {/* Title + labels */}
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] text-text-primary leading-tight line-clamp-2 group-hover:text-brand-mint transition-colors">
                    {issue.title}
                  </span>
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label.name}
                          className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-border-panel/40 text-text-secondary rounded-sm border border-border-panel/60"
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* State + assignee + time */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant={issue.state === 'open' ? 'mint' : 'neutral'}
                    size="xs"
                  >
                    {issue.state === 'open' ? 'ABERTA' : 'FECHADA'}
                  </Badge>
                  {issue.assignee && (
                    <span className="text-[9px] text-text-secondary truncate max-w-[80px]">
                      {issue.assignee}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-text-secondary">
                    {formatRelativeTime(issue.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
