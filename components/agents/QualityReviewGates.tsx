import { useState, useEffect, useCallback } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface ReviewTask {
  id: string;
  title: string;
  assignee?: string;
  responsavel?: string;
  createdAt?: string;
  deadline?: string;
  notionUrl?: string;
}

const bridgeBase = import.meta.env.VITE_FORM_API_URL || '';
const bridgeHeaders: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_FORM_API_TOKEN || ''}`,
};

export default function QualityReviewGates() {
  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      if (!bridgeBase) {
        setTasks([]);
        return;
      }
      const res = await fetch(`${bridgeBase}/tasks`, { headers: bridgeHeaders });
      const data = await res.json();
      const all = data.ok ? (data.tasks ?? data.data ?? []) : [];
      setTasks(
        (Array.isArray(all) ? all : []).filter(
          (t: any) => t.status === 'Em Revisão'
        )
      );
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAction = useCallback(
    async (taskId: string, action: 'approve' | 'reject') => {
      if (!bridgeBase) return;
      setActing(taskId + action);
      try {
        await fetch(`${bridgeBase}/tasks/${taskId}/review`, {
          method: 'PATCH',
          headers: { ...bridgeHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, reviewer: reviewer.trim() || undefined }),
        });
        await fetchTasks();
      } catch {
        // silently fail — keep current state
      } finally {
        setActing(null);
      }
    },
    [reviewer, fetchTasks]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon="verified">REVISÃO DE QUALIDADE</SectionLabel>
        <button
          onClick={fetchTasks}
          disabled={loading}
          className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40"
        >
          <Icon name="refresh" size="xs" className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {/* Reviewer input */}
      <div className="flex items-center gap-2">
        <Icon name="person" size="sm" className="text-text-secondary shrink-0" />
        <input
          type="text"
          placeholder="Seu nome (revisor) — opcional"
          value={reviewer}
          onChange={(e) => setReviewer(e.target.value)}
          className="flex-1 bg-surface border border-border-panel rounded-sm px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-3/4" />
                <div className="h-2 bg-border-panel/40 rounded-sm animate-pulse w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="verified" size="lg" className="text-brand-mint/40" />
            <span className="text-[11px]">Nenhuma tarefa aguardando revisão</span>
          </div>
        </Card>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="text-[12px] font-bold text-text-primary leading-snug">
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {(task.assignee || task.responsavel) && (
                      <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                        <Icon name="person" size="xs" />
                        {task.assignee ?? task.responsavel}
                      </span>
                    )}
                    {(task.createdAt || task.deadline) && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-text-secondary">
                        <Icon name="schedule" size="xs" />
                        {formatRelativeTime(task.deadline ?? task.createdAt!)}
                      </span>
                    )}
                    <Badge variant="purple" size="xs">Em Revisão</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(task.id, 'approve')}
                  disabled={acting !== null}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-colors',
                    'bg-accent-green/10 border border-accent-green/20 text-accent-green',
                    'hover:bg-accent-green/20 disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Icon name="check_circle" size="xs" />
                  {acting === task.id + 'approve' ? 'Aprovando...' : 'Aprovar'}
                </button>
                <button
                  onClick={() => handleAction(task.id, 'reject')}
                  disabled={acting !== null}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-colors',
                    'bg-accent-red/10 border border-accent-red/20 text-accent-red',
                    'hover:bg-accent-red/20 disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Icon name="cancel" size="xs" />
                  {acting === task.id + 'reject' ? 'Rejeitando...' : 'Rejeitar'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
