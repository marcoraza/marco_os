import { useMemo, useState, useRef, useCallback } from 'react';
import { Badge, Card, Icon, SectionLabel, showToast } from '../ui';
import { cn } from '../../utils/cn';
import { kanbanColumns, KANBAN_ORDER, KanbanStatus } from '../../data/agentMockData';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useKanban, useAgents, useKanbanActions, useOpenClawActions } from '../../contexts/OpenClawContext';

interface TaskComment {
  id: string;
  text: string;
  createdAt: string;
}

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
  const { agents } = useAgents();
  const { updateTaskStatus } = useKanbanActions();
  const { fetchTaskComments, addTaskComment } = useOpenClawActions();
  const agent = agents.find(a => a.id === agentId);
  // Coordinator sees ALL tasks; sub-agents see only their own
  const tasks = useKanban(agent?.role === 'coordinator' ? undefined : agentId);
  const [collapsed, setCollapsed] = useState<Set<KanbanStatus>>(new Set());
  const dragTaskId = useRef<string | null>(null);
  const dragFromStatus = useRef<KanbanStatus | null>(null);
  const { isMobile } = useBreakpoint();
  const [mobileColumn, setMobileColumn] = useState<KanbanStatus>('backlog');

  // Comments state
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [commentsByTask, setCommentsByTask] = useState<Record<string, TaskComment[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  const fetchComments = useCallback(async (taskId: string) => {
    setLoadingComments(taskId);
    setCommentError(null);
    try {
      const list = await fetchTaskComments(taskId);
      setCommentsByTask(prev => ({ ...prev, [taskId]: Array.isArray(list) ? list : [] }));
    } catch {
      setCommentError('Nao foi possivel carregar comentarios.');
    } finally {
      setLoadingComments(null);
    }
  }, [fetchTaskComments]);

  const handleTaskExpand = useCallback((taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      if (!commentsByTask[taskId]) {
        fetchComments(taskId);
      }
    }
  }, [expandedTaskId, commentsByTask, fetchComments]);

  const handlePostComment = useCallback(async (taskId: string) => {
    const text = commentInput.trim();
    if (!text || postingComment) return;
    setPostingComment(true);
    setCommentError(null);
    setCommentFeedback(null);
    try {
      const ok = await addTaskComment(taskId, text);
      if (ok) {
        setCommentInput('');
        await fetchComments(taskId);
        setCommentFeedback('Comentario enviado.');
        showToast('Comentario enviado');
      } else {
        setCommentError('Nao foi possivel enviar comentario.');
      }
    } catch {
      setCommentError('Nao foi possivel enviar comentario.');
    } finally {
      setPostingComment(false);
    }
  }, [addTaskComment, commentInput, postingComment, fetchComments]);

  const handleDragStart = (taskId: string, fromStatus: KanbanStatus) => {
    dragTaskId.current = taskId;
    dragFromStatus.current = fromStatus;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toStatus: KanbanStatus) => {
    e.preventDefault();
    const taskId = dragTaskId.current;
    const fromStatus = dragFromStatus.current;
    if (!taskId || !fromStatus || fromStatus === toStatus) return;
    dragTaskId.current = null;
    dragFromStatus.current = null;
    setStatusError(null);
    void updateTaskStatus(taskId, toStatus).then((ok) => {
      if (!ok) {
        setStatusError('Nao foi possivel mover a tarefa.');
      }
    });
  };

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

  // Mobile: single column view with dropdown selector
  if (isMobile) {
    const col = kanbanColumns[mobileColumn];
    const columnTasks = tasksByColumn[mobileColumn];

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SectionLabel icon="view_kanban">KANBAN</SectionLabel>
          <select
            value={mobileColumn}
            onChange={e => setMobileColumn(e.target.value as KanbanStatus)}
            className="flex-1 bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-brand-mint transition-colors"
          >
            {KANBAN_ORDER.map(s => (
              <option key={s} value={s}>
                {kanbanColumns[s].label} ({tasksByColumn[s].length})
              </option>
            ))}
          </select>
        </div>
        {statusError && (
          <div className="rounded border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-[10px] text-accent-red">
            {statusError}
          </div>
        )}

        <div
          className="flex flex-col gap-2 min-h-[200px] bg-bg-base rounded-lg border border-border-panel p-2"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, mobileColumn)}
        >
          {columnTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
              <Icon name="inbox" size="md" />
              <span className="text-[10px]">Sem tarefas</span>
            </div>
          ) : (
            columnTasks.map((task) => {
              const prio = priorityMap[task.priority];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-sm bg-surface border border-border-panel min-h-[44px]"
                  draggable
                  onDragStart={() => handleDragStart(task.id, task.status)}
                >
                  <div className={cn('size-2 rounded-full shrink-0', prio.color)} />
                  <span className="flex-1 text-[11px] text-text-primary font-medium truncate">{task.title}</span>
                  <Badge variant={prio.variant} size="xs">{prio.label}</Badge>
                  <div className="size-2 rounded-full shrink-0 bg-brand-mint/60" title={task.status} />
                </div>
              );
            })
          )}
        </div>

        <p className="text-[9px] text-text-secondary font-mono text-center">
          {col.label}: {columnTasks.length} tarefa{columnTasks.length !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel icon="view_kanban">KANBAN</SectionLabel>
      {statusError && (
        <div className="rounded border border-accent-red/30 bg-accent-red/10 px-3 py-2 text-[10px] text-accent-red">
          {statusError}
        </div>
      )}

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
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
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
              <div
                className="flex flex-col gap-2 min-h-[200px] bg-bg-base rounded-lg border border-border-panel p-2"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                    <Icon name="inbox" size="md" />
                    <span className="text-[10px]">Sem tarefas</span>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const prio = priorityMap[task.priority];
                    const lastMessages = task.messages.slice(-2);
                    const isExpanded = expandedTaskId === task.id;
                    const comments = commentsByTask[task.id] ?? [];

                    return (
                      <Card
                        key={task.id}
                        className="p-3 space-y-2 cursor-grab active:cursor-grabbing"
                        data-status={task.status}
                        draggable
                        onDragStart={() => handleDragStart(task.id, task.status)}
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

                        <div className="flex items-center justify-between">
                          <div className="text-[8px] font-mono text-text-secondary">
                            {task.createdAt}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTaskExpand(task.id); }}
                            className="flex items-center gap-1 text-[9px] text-text-secondary hover:text-brand-mint transition-colors"
                          >
                            <Icon name="comment" size="xs" />
                            <span>Comentários</span>
                            <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size="xs" />
                          </button>
                        </div>

                        {/* Comments section */}
                        {isExpanded && (
                          <div
                            className="border-t border-border-panel pt-2 space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {commentError && (
                              <div className="rounded border border-accent-red/30 bg-accent-red/10 px-2 py-1.5 text-[9px] text-accent-red">
                                {commentError}
                              </div>
                            )}
                            {commentFeedback && (
                              <div className="rounded border border-brand-mint/30 bg-brand-mint/10 px-2 py-1.5 text-[9px] text-brand-mint">
                                {commentFeedback}
                              </div>
                            )}
                            {loadingComments === task.id ? (
                              <div className="flex items-center gap-2 text-text-secondary py-1">
                                <Icon name="hourglass_empty" size="xs" className="animate-spin" />
                                <span className="text-[9px]">Carregando...</span>
                              </div>
                            ) : comments.length === 0 ? (
                              <p className="text-[9px] text-text-secondary py-1">Nenhum comentário ainda</p>
                            ) : (
                              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                {comments.map((c) => (
                                  <div key={c.id} className="bg-bg-base rounded-sm p-2 space-y-0.5">
                                    <p className="text-[10px] text-text-primary leading-snug">{c.text}</p>
                                    <p className="text-[8px] font-mono text-text-secondary">{c.createdAt}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={commentInput}
                                onChange={e => setCommentInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePostComment(task.id)}
                                placeholder="Adicionar comentário..."
                                className="flex-1 bg-bg-base border border-border-panel rounded-sm px-2 py-1 text-[10px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint/50 transition-colors"
                              />
                              <button
                                onClick={() => handlePostComment(task.id)}
                                disabled={!commentInput.trim() || postingComment}
                                className="p-1.5 rounded-sm bg-brand-mint/10 border border-brand-mint/20 text-brand-mint hover:bg-brand-mint/20 transition-colors disabled:opacity-40"
                              >
                                <Icon name="send" size="xs" />
                              </button>
                            </div>
                          </div>
                        )}
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
