import { useMemo, useState } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCTask } from '../../../store/missionControl';
import { formatRelative } from '../../../utils/dateUtils';

// ── Column definitions ───────────────────────────────────────────────────────

type KanbanColumnKey = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done';

interface ColumnDef {
  key: KanbanColumnKey;
  label: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { key: 'inbox',       label: 'Entrada',      color: 'text-text-secondary' },
  { key: 'assigned',    label: 'Atribuido',     color: 'text-accent-blue' },
  { key: 'in_progress', label: 'Em Progresso',  color: 'text-accent-orange' },
  { key: 'review',      label: 'Revisao',       color: 'text-accent-purple' },
  { key: 'done',        label: 'Concluido',     color: 'text-brand-mint' },
];

// ── Priority color mapping ───────────────────────────────────────────────────

const PRIORITY_COLOR: Record<MCTask['priority'], string> = {
  urgent:   'text-accent-red',
  critical: 'text-accent-red',
  high:     'text-accent-orange',
  medium:   'text-accent-blue',
  low:      'text-text-secondary',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(status: MCTask['status']): KanbanColumnKey {
  if (status === 'quality_review' || status === 'awaiting_owner') return 'review';
  return status as KanbanColumnKey;
}

/** Convert epoch (ms) to relative time string. */
function relativeTime(epoch: number): string {
  return formatRelative(new Date(epoch));
}

/** Extract unique agent names from task list. */
function extractAgentNames(tasks: MCTask[]): string[] {
  const names = new Set<string>();
  for (const t of tasks) {
    if (t.assigned_to) names.add(t.assigned_to);
  }
  return Array.from(names).sort();
}

// ── Component ────────────────────────────────────────────────────────────────

export function MCAgentKanban() {
  const tasks = useMissionControlStore((s) => s.tasks);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Derive unique agent names from all tasks
  const agentNames = useMemo(() => extractAgentNames(tasks), [tasks]);

  // Build filter pills: "Todos" + each agent
  const pills = useMemo(
    () => [{ id: '__all__', label: 'Todos' }, ...agentNames.map((n) => ({ id: n, label: n }))],
    [agentNames],
  );
  const activeFilter = selectedAgent ?? '__all__';

  // Filter tasks by selected agent
  const filteredTasks = useMemo(() => {
    if (!selectedAgent) return tasks;
    return tasks.filter((t) => t.assigned_to === selectedAgent);
  }, [tasks, selectedAgent]);

  // Group into columns
  const grouped = useMemo(() => {
    const map: Record<KanbanColumnKey, MCTask[]> = {
      inbox: [],
      assigned: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of filteredTasks) {
      const col = normalizeStatus(task.status);
      if (map[col]) map[col].push(task);
    }
    return map;
  }, [filteredTasks]);

  return (
    <div className="space-y-3">
      {/* Agent filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {pills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setSelectedAgent(pill.id === '__all__' ? null : pill.id)}
            className={cn(
              'text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 border rounded-sm transition-all',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              activeFilter === pill.id
                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary hover:bg-surface-hover',
            )}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Kanban grid */}
      <div className="grid grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const colTasks = grouped[col.key];
          const count = colTasks.length;

          return (
            <div key={col.key} className="min-w-0">
              {/* Column header */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn('text-[8px] font-black uppercase tracking-widest', col.color)}>
                  {col.label}
                </span>
                <span className="text-[8px] font-mono text-text-secondary">{count}</span>
              </div>

              {/* Scrollable card container */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-border-panel scrollbar-track-transparent">
                {count === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-[9px] text-text-secondary">Nenhuma task</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
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
  const priorityColor = PRIORITY_COLOR[task.priority] ?? 'text-text-secondary';

  return (
    <div className="bg-bg-base border border-border-panel rounded-sm p-2.5 mb-2">
      <p className="text-[10px] font-bold text-text-primary truncate">{task.title}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={cn('text-[8px] font-bold uppercase', priorityColor)}>
          {task.priority}
        </span>
        {task.ticket_ref && (
          <span className="text-[7px] font-mono text-accent-blue">{task.ticket_ref}</span>
        )}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[8px] text-text-secondary truncate">
          {task.assigned_to ?? 'Sem atribuicao'}
        </span>
        <span className="text-[8px] font-mono text-text-secondary shrink-0">
          {relativeTime(task.updated_at)}
        </span>
      </div>
    </div>
  );
}
