import { useMemo, useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCTask } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Types ────────────────────────────────────────────────────────────────────

interface MCTaskBoardPanelProps {
  agentId?: string;
}

type KanbanColumnKey = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done';

interface ColumnDef {
  key: KanbanColumnKey;
  label: string;
  icon: string;
}

type FilterKey = 'all' | 'mine' | 'urgent' | 'this_week';

// ── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: 'inbox', label: 'ENTRADA', icon: 'inbox' },
  { key: 'assigned', label: 'ATRIBUIDO', icon: 'person_add' },
  { key: 'in_progress', label: 'EM PROGRESSO', icon: 'play_circle' },
  { key: 'review', label: 'REVISAO', icon: 'rate_review' },
  { key: 'done', label: 'CONCLUIDO', icon: 'check_circle' },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'mine', label: 'Minhas Tasks' },
  { key: 'urgent', label: 'Urgentes' },
  { key: 'this_week', label: 'Esta Semana' },
];

const PRIORITY_STYLE: Record<MCTask['priority'], { cls: string; icon: string }> = {
  urgent:   { cls: 'text-accent-red border-accent-red/30 bg-accent-red/10', icon: 'error' },
  critical: { cls: 'text-accent-red border-accent-red/30 bg-accent-red/10', icon: 'priority_high' },
  high:     { cls: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10', icon: 'arrow_upward' },
  medium:   { cls: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10', icon: 'remove' },
  low:      { cls: 'text-text-secondary border-border-panel bg-surface', icon: 'arrow_downward' },
};

const POLL_INTERVAL_MS = 15_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status: MCTask['status']): KanbanColumnKey {
  if (status === 'quality_review' || status === 'awaiting_owner') return 'review';
  return status as KanbanColumnKey;
}

function isThisWeek(epoch: number): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  const d = new Date(epoch * 1000);
  return d >= startOfWeek && d < endOfWeek;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MCTaskBoardPanel({ agentId }: MCTaskBoardPanelProps) {
  const tasks = useMissionControlStore((s) => s.tasks);
  const setTasks = useMissionControlStore((s) => s.setTasks);

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  // Fetch tasks from MC API
  const fetchTasks = useCallback(async () => {
    try {
      const raw = await mcApi.get<{ data?: MCTask[] } | MCTask[]>('/api/tasks');
      const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
      setTasks(list);
    } catch {
      // Keep existing tasks on error, silently degrade
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useMCPoll(fetchTasks, POLL_INTERVAL_MS, { enabled: true, backoff: true });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let pool = tasks;

    // Agent filter from prop
    if (agentId) {
      pool = pool.filter((t) => t.assigned_to === agentId);
    }

    // UI filter
    switch (activeFilter) {
      case 'mine':
        pool = pool.filter((t) => t.assigned_to === agentId);
        break;
      case 'urgent':
        pool = pool.filter((t) => t.priority === 'urgent' || t.priority === 'critical');
        break;
      case 'this_week':
        pool = pool.filter((t) => isThisWeek(t.created_at));
        break;
      default:
        break;
    }

    return pool;
  }, [tasks, agentId, activeFilter]);

  // Group by column
  const columns = useMemo(() => {
    const grouped: Record<KanbanColumnKey, MCTask[]> = {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
    };

    for (const task of filteredTasks) {
      const col = normalizeStatus(task.status);
      if (grouped[col]) {
        grouped[col].push(task);
      }
    }

    return grouped;
  }, [filteredTasks]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="view_kanban" size="sm" className="text-text-secondary" />
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
            TASK BOARD
          </span>
          <span className="text-[9px] font-mono text-text-secondary">
            {filteredTasks.length}
          </span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 border rounded-sm transition-all',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              activeFilter === f.key
                ? 'text-brand-mint border-brand-mint/30 bg-brand-mint/10'
                : 'text-text-secondary border-border-panel bg-surface hover:text-text-primary hover:bg-surface-hover'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {COLUMNS.map((col) => {
          const colTasks = columns[col.key];
          const count = colTasks.length;

          return (
            <div key={col.key} className="flex-1 min-w-[180px]">
              {/* Column header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Icon name={col.icon} size="xs" className="text-text-secondary" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
                    {col.label}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-text-secondary">{count}</span>
              </div>

              {/* Column body */}
              <div className="space-y-1.5 min-h-[120px]">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : count === 0 ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-[9px] text-text-secondary">Nenhuma task</span>
                  </div>
                ) : (
                  colTasks.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task }: { task: MCTask }) {
  const prio = PRIORITY_STYLE[task.priority];

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-2.5 hover:bg-surface-hover transition-all cursor-pointer">
      <div className="flex items-start justify-between gap-1">
        <p className="text-[10px] font-bold text-text-primary leading-tight flex-1 min-w-0">
          {task.title}
        </p>
        <span
          className={cn(
            'text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm shrink-0',
            prio.cls
          )}
        >
          {task.priority}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {task.assigned_to && (
          <span className="flex items-center gap-1 text-[8px] font-mono text-text-secondary">
            <Icon name="person" size="xs" className="text-text-secondary" />
            {task.assigned_to}
          </span>
        )}
        {task.ticket_ref && (
          <span className="text-[8px] font-mono text-accent-blue">
            {task.ticket_ref}
          </span>
        )}
        {task.project_name && (
          <span className="text-[8px] font-mono text-text-secondary truncate max-w-[80px]">
            {task.project_name}
          </span>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[7px] font-bold uppercase tracking-widest text-text-secondary bg-bg-base border border-border-panel px-1.5 py-0.5 rounded-sm"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[7px] font-mono text-text-secondary">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Due date warning */}
      {task.due_date && (
        <DueDateIndicator epoch={task.due_date} />
      )}
    </div>
  );
}

// ── Due Date ─────────────────────────────────────────────────────────────────

function DueDateIndicator({ epoch }: { epoch: number }) {
  const now = Date.now() / 1000;
  const diff = epoch - now;
  const days = Math.ceil(diff / 86400);
  const isOverdue = diff < 0;
  const isSoon = days >= 0 && days <= 2;

  const date = new Date(epoch * 1000);
  const label = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <Icon
        name="schedule"
        size="xs"
        className={cn(
          isOverdue ? 'text-accent-red' : isSoon ? 'text-accent-orange' : 'text-text-secondary'
        )}
      />
      <span
        className={cn(
          'text-[8px] font-mono',
          isOverdue ? 'text-accent-red' : isSoon ? 'text-accent-orange' : 'text-text-secondary'
        )}
      >
        {isOverdue ? `Atrasado (${label})` : label}
      </span>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface border border-border-panel rounded-sm p-2.5 space-y-2">
      <div className="bg-border-panel animate-pulse rounded-sm h-3 w-3/4" />
      <div className="flex gap-2">
        <div className="bg-border-panel animate-pulse rounded-sm h-2.5 w-16" />
        <div className="bg-border-panel animate-pulse rounded-sm h-2.5 w-12" />
      </div>
    </div>
  );
}
