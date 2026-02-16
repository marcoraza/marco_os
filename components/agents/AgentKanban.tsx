import { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { getTasksForAgent, kanbanColumns, KANBAN_ORDER, KanbanStatus } from '../../data/agentMockData';

interface AgentKanbanProps {
  agentId: string;
}

const priorityMap = {
  high: { label: 'P0', variant: 'red' as const, color: 'bg-accent-red/60' },
  medium: { label: 'P1', variant: 'orange' as const, color: 'bg-accent-orange/60' },
  low: { label: 'P2', variant: 'neutral' as const, color: 'bg-text-secondary/30' },
};

const messageTypeColor: Record<string, string> = {
  info: 'text-text-secondary',
  success: 'text-brand-mint',
  error: 'text-accent-red',
  progress: 'text-accent-orange',
};

export default function AgentKanban({ agentId }: AgentKanbanProps) {
  const tasks = useMemo(() => getTasksForAgent(agentId), [agentId]);
  const [collapsed, setCollapsed] = useState<Set<KanbanStatus>>(new Set());

  const tasksByColumn = useMemo(() => {
    const grouped: Record<KanbanStatus, typeof tasks> = {
      backlog: [],
      'em-progresso': [],
      revisao: [],
      concluido: [],
    };
    for (const task of tasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [tasks]);

  const toggleCollapse = (status: KanbanStatus) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <SectionLabel icon="view_kanban">KANBAN</SectionLabel>

      <div className="flex gap-3 items-stretch">
        {KANBAN_ORDER.map((status) => {
          const col = kanbanColumns[status];
          const columnTasks = tasksByColumn[status];
          const isCollapsed = collapsed.has(status);

          if (isCollapsed) {
            return (
              <div
                key={status}
                className="w-12 shrink-0 bg-bg-base rounded-lg border border-border-panel flex flex-col items-center py-3 gap-3 cursor-pointer hover:border-text-secondary/30 transition-all"
                onClick={() => toggleCollapse(status)}
              >
                <Icon name="chevron_right" size="xs" className="text-text-secondary" />
                <Badge variant={col.variant} size="xs">{columnTasks.length}</Badge>
                <span
                  className="text-[8px] font-black uppercase tracking-widest text-text-secondary"
                  style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
                >
                  {col.label}
                </span>
                {/* Mini task pills preview */}
                <div className="flex flex-col gap-1 mt-auto px-1.5 w-full">
                  {columnTasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className={cn('h-[3px] rounded-full w-full', priorityMap[task.priority].color)}
                      title={task.title}
                    />
                  ))}
                  {columnTasks.length > 6 && (
                    <span className="text-[7px] text-text-secondary text-center">+{columnTasks.length - 6}</span>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={status} className="flex-1 flex flex-col gap-2 min-w-0 transition-all duration-200">
              {/* Column Header */}
              <div className="flex items-center gap-2 px-1">
                <button
                  onClick={() => toggleCollapse(status)}
                  className="p-0.5 rounded hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
                >
                  <Icon name="expand_more" size="xs" />
                </button>
                <Icon name={col.icon} size="xs" className="text-text-secondary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                  {col.label}
                </span>
                <Badge variant={col.variant} size="xs">{columnTasks.length}</Badge>
              </div>

              {/* Column Body */}
              <div className="flex flex-col gap-2 min-h-[200px] bg-bg-base rounded-lg border border-border-panel p-2">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                    <Icon name="inbox" size="md" />
                    <span className="text-[10px]">Sem tarefas</span>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const prio = priorityMap[task.priority];
                    const lastMessages = task.messages.slice(-2);

                    return (
                      <Card
                        key={task.id}
                        className="p-3 space-y-2"
                        data-status={task.status}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] text-text-primary font-medium leading-tight">
                            {task.title}
                          </span>
                          <Badge variant={prio.variant} size="xs">{prio.label}</Badge>
                        </div>

                        {lastMessages.length > 0 && (
                          <div className="space-y-1">
                            {lastMessages.map((msg) => (
                              <div key={msg.id} className="flex items-start gap-1.5">
                                <span className={cn('text-[9px] leading-tight', messageTypeColor[msg.type])}>
                                  {msg.content}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-[8px] font-mono text-text-secondary">
                          {task.createdAt}
                        </div>
                      </Card>
                    );
                  })
                )}

                {/* Add Task Button */}
                <button className="flex items-center justify-center gap-1 py-1.5 rounded text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors">
                  <Icon name="add" size="xs" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Adicionar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
