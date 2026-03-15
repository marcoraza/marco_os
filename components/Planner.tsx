import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Icon, Card, SectionLabel, FormModal, JourneyOverlay, JourneyTriggerButton, DataBadge, Badge, EmptyState } from './ui';
import type { Project, Task } from '../lib/appTypes';
import type { StoredPlan, StoredPlanStep, StoredContentEntry, StoredProjectEntry } from '../data/models';
import type { ChecklistItem } from '../lib/dataProvider';
import { loadPlans, putPlan, deletePlan, putContentEntry, putProjetosEntry } from '../data/repository';
import { contentFields, projectFields } from '../lib/formConfigs';
import { cn } from '../utils/cn';
import { useSectionSetup } from '../hooks/useSectionSetup';
import { plannerJourneyConfig } from '../lib/journeyConfigs/planner';
import { useSupabaseData } from '../contexts/SupabaseDataContext';
import { showToast } from './ui';
import { buildPlanExportTasks, getPlanExportCandidates, getPlannerResumeTarget, summarizePlanDrift, summarizePlanExecution } from '../lib/plannerWorkflows';
import { derivePlanMilestones } from '../lib/projectControl';

// ─── Props ───────────────────────────────────────────────────────────────────
interface PlannerProps {
  projects: Project[];
  activeProjectId: string;
  tasks: Task[];
  addTasks: (tasks: Omit<Task, 'id' | 'assignee' | 'dependencies'>[]) => Task[];
}

const PLANNER_DRAFT_KEY = 'planner-draft';
const PLANNER_RESUME_REQUEST_KEY = 'planner-resume-requested';

// ─── Task status mapping ─────────────────────────────────────────────────────
type TaskColumn = 'Aberto' | 'Em progresso' | 'Revisão' | 'Concluído';

const STATUS_COLUMNS: TaskColumn[] = ['Aberto', 'Em progresso', 'Revisão', 'Concluído'];

function mapStatus(status: string): TaskColumn {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('progresso') || s.includes('andamento') || s === 'in-progress' || s === 'started') return 'Em progresso';
  if (s.includes('revis') || s === 'review') return 'Revisão';
  if (s === 'done' || s.includes('conclu') || s.includes('finaliz')) return 'Concluído';
  return 'Aberto';
}

// ─── Priority helpers ─────────────────────────────────────────────────────────
const PRIORITY_LABELS: Record<string, string> = {
  P0: 'P0', P1: 'P1', P2: 'P2',
  high: 'P0', medium: 'P1', low: 'P2',
};

function priorityVariant(p: string): 'red' | 'orange' | 'neutral' {
  const l = (p || '').toLowerCase();
  if (l === 'p0' || l === 'high') return 'red';
  if (l === 'p1' || l === 'medium') return 'orange';
  return 'neutral';
}

function priorityBorderClass(p: string): string {
  const l = (p || '').toLowerCase();
  if (l === 'p0' || l === 'high') return 'border-l-2 border-accent-red';
  if (l === 'p1' || l === 'medium') return 'border-l-2 border-accent-orange';
  return '';
}

// ─── Due date helpers ─────────────────────────────────────────────────────────
type DueDateStatus = 'overdue' | 'today' | 'week' | 'normal';

function getDueDateStatus(prazo: string | undefined): DueDateStatus {
  if (!prazo) return 'normal';
  const d = new Date(prazo);
  if (isNaN(d.getTime())) return 'normal';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = dDay.getTime() - today.getTime();
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff <= 7 * 86400000) return 'week';
  return 'normal';
}

function dueDateBorderClass(status: DueDateStatus): string {
  if (status === 'overdue') return 'border-l-2 border-accent-red';
  if (status === 'today') return 'border-l-2 border-accent-orange';
  return '';
}

// ─── Filter storage key ───────────────────────────────────────────────────────
const FILTER_KEY = 'planner-task-filters';

interface TaskFilters {
  owner: string; // 'Todos' | 'Marco' | 'Frank' | 'Coder' | 'Researcher'
  priority: string; // '' | 'P0' | 'P1' | 'P2'
  statuses: TaskColumn[];
}

const DEFAULT_FILTERS: TaskFilters = {
  owner: 'Todos',
  priority: '',
  statuses: [...STATUS_COLUMNS],
};

function loadFilters(): TaskFilters {
  try {
    const raw = localStorage.getItem(FILTER_KEY);
    if (raw) return { ...DEFAULT_FILTERS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_FILTERS;
}

function saveFilters(f: TaskFilters) {
  try { localStorage.setItem(FILTER_KEY, JSON.stringify(f)); } catch { /* ignore */ }
}

// ─── Mock plan generator ─────────────────────────────────────────────────────
function generateMockPlan(title: string): Omit<StoredPlan, 'id' | 'context' | 'projectId' | 'exported' | 'createdAt' | 'updatedAt'> {
  return {
    title,
    summary: `Plano gerado para "${title}". Este é um plano mockado que será substituído pela integração com Gemini.`,
    objectives: [
      `Definir escopo e entregáveis de "${title}"`,
      'Mapear dependências e recursos necessários',
      'Estabelecer timeline realista com checkpoints',
    ],
    steps: [
      { text: 'Levantar requisitos e restrições', done: false },
      { text: 'Criar documento de escopo', done: false },
      { text: 'Validar com stakeholders', done: false },
      { text: 'Executar sprint 1 (MVP)', done: false },
      { text: 'Revisar e iterar', done: false },
    ],
    risks: [
      { risk: 'Escopo mal definido', mitigation: 'Documento de requisitos aprovado antes de iniciar' },
      { risk: 'Prazo apertado', mitigation: 'Priorizar MVP, cortar nice-to-haves' },
      { risk: 'Dependência externa', mitigation: 'Identificar alternativas e plano B' },
    ],
    checklist: [
      'Requisitos documentados',
      'Aprovação do plano',
      'Recursos alocados',
      'Primeira entrega validada',
      'Retrospectiva feita',
    ],
    suggestedTasks: [
      { title: `[${title}] Levantar requisitos`, tag: 'PLANEJAMENTO', priority: 'high', deadline: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10) },
      { title: `[${title}] Criar documento de escopo`, tag: 'PLANEJAMENTO', priority: 'high', deadline: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10) },
      { title: `[${title}] Executar MVP`, tag: 'DEV', priority: 'medium', deadline: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10) },
    ],
  };
}

// ─── Bridge API URL ────────────────────────────────────────────────────────────
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

// ─── Task Card Component ──────────────────────────────────────────────────────
interface TaskCardProps {
  task: ChecklistItem;
  isSelected: boolean;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isSelected, onClick }) => {
  const dueDateStatus = getDueDateStatus(task.prazo);
  const borderClass = dueDateStatus !== 'normal'
    ? dueDateBorderClass(dueDateStatus)
    : priorityBorderClass(task.prioridade);

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-bg-base rounded-sm p-3 cursor-pointer hover:border-accent-blue/40 transition-all space-y-2',
        'border',
        borderClass || 'border-border-panel',
        isSelected && 'border-accent-blue/50 bg-accent-blue/5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-text-primary leading-snug flex-1">{task.title}</p>
        <Badge
          variant={priorityVariant(task.prioridade)}
          size="xs"
        >
          {PRIORITY_LABELS[task.prioridade] ?? task.prioridade ?? 'P2'}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {task.responsavel && (
          <span className="text-[9px] text-text-secondary bg-surface px-1.5 py-0.5 rounded-sm border border-border-panel">
            {task.responsavel}
          </span>
        )}
        {task.prazo && (
          <span className={cn(
            'text-[9px] font-mono',
            dueDateStatus === 'overdue' ? 'text-accent-red font-bold' :
            dueDateStatus === 'today' ? 'text-accent-orange font-bold' :
            'text-text-secondary'
          )}>
            {task.prazo}
          </span>
        )}
        {dueDateStatus === 'overdue' && (
          <span className="text-[8px] font-bold text-accent-red uppercase tracking-wide">Atrasada</span>
        )}
        {dueDateStatus === 'today' && (
          <span className="text-[8px] font-bold text-accent-orange uppercase tracking-wide">Hoje</span>
        )}
        {dueDateStatus === 'week' && (
          <span className="text-[8px] text-text-secondary/70 uppercase tracking-wide">Esta semana</span>
        )}
      </div>

      {task.projeto && (
        <p className="text-[9px] text-text-secondary truncate">{task.projeto}</p>
      )}
    </div>
  );
};

// ─── Task Detail Panel ────────────────────────────────────────────────────────
interface TaskDetailPanelProps {
  task: ChecklistItem;
  onClose: () => void;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose }) => {
  const dueDateStatus = getDueDateStatus(task.prazo);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary leading-snug">{task.title}</h3>
          {task.projeto && (
            <p className="text-[10px] text-text-secondary mt-0.5">{task.projeto}</p>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded transition-colors text-text-secondary">
          <Icon name="close" size="sm" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[10px]">
        <div>
          <span className="text-text-secondary uppercase tracking-widest font-bold text-[8px]">Prioridade</span>
          <div className="mt-1">
            <Badge variant={priorityVariant(task.prioridade)} size="xs">
              {PRIORITY_LABELS[task.prioridade] ?? task.prioridade ?? 'P2'}
            </Badge>
          </div>
        </div>
        <div>
          <span className="text-text-secondary uppercase tracking-widest font-bold text-[8px]">Responsavel</span>
          <p className="mt-1 text-text-primary font-medium">{task.responsavel || '—'}</p>
        </div>
        <div>
          <span className="text-text-secondary uppercase tracking-widest font-bold text-[8px]">Status</span>
          <p className="mt-1 text-text-primary">{task.status || '—'}</p>
        </div>
        <div>
          <span className="text-text-secondary uppercase tracking-widest font-bold text-[8px]">Prazo</span>
          <p className={cn(
            'mt-1 font-mono',
            dueDateStatus === 'overdue' ? 'text-accent-red font-bold' :
            dueDateStatus === 'today' ? 'text-accent-orange font-bold' :
            'text-text-primary'
          )}>{task.prazo || '—'}</p>
        </div>
      </div>

      {task.progresso !== undefined && task.progresso > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] uppercase tracking-widest font-bold text-text-secondary">Progresso</span>
            <span className="text-[9px] font-mono text-brand-mint">{task.progresso}%</span>
          </div>
          <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint rounded-full"
              style={{ width: `${task.progresso}%` }}
            />
          </div>
        </div>
      )}

      {task.notion_url && (
        <a
          href={task.notion_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[10px] text-accent-blue hover:underline"
        >
          <Icon name="open_in_new" size="xs" />
          Abrir no Notion
        </a>
      )}
    </div>
  );
};

// ─── Nova Tarefa Form ─────────────────────────────────────────────────────────
interface NovaTarefaFormProps {
  projects: Project[];
  onClose: () => void;
  onSuccess: () => void;
}

const NovaTarefaForm: React.FC<NovaTarefaFormProps> = ({ projects, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('P1');
  const [responsavel, setResponsavel] = useState('Marco');
  const [projeto, setProjeto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const url = BRIDGE_URL ? `${BRIDGE_URL}/api/dispatch` : '/api/dispatch';
      const body = {
        type: 'nova_tarefa',
        title: title.trim(),
        priority,
        responsavel,
        projeto,
        descricao: descricao.trim(),
      };
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
        },
        body: JSON.stringify(body),
      });
      showToast('Tarefa criada com sucesso');
      onSuccess();
    } catch {
      showToast('Tarefa criada (modo offline)');
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>NOVA TAREFA</SectionLabel>
        <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded transition-colors text-text-secondary">
          <Icon name="close" size="sm" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Revisar proposta comercial"
            className="w-full bg-bg-base border border-border-panel rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1">Prioridade</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option value="P0">P0 — Urgente</option>
              <option value="P1">P1 — Alta</option>
              <option value="P2">P2 — Normal</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1">Responsável</label>
            <select
              value={responsavel}
              onChange={e => setResponsavel(e.target.value)}
              className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option value="Marco">Marco</option>
              <option value="Frank">Frank</option>
              <option value="Coder">Coder</option>
              <option value="Researcher">Researcher</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1">Projeto</label>
          <select
            value={projeto}
            onChange={e => setProjeto(e.target.value)}
            className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
          >
            <option value="">Sem projeto</option>
            {projects.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[9px] font-bold uppercase tracking-widest text-text-secondary mb-1">Descrição</label>
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Detalhes, contexto, critérios de aceite..."
            rows={3}
            className="w-full bg-bg-base border border-border-panel rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors resize-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-sm font-medium text-sm transition-all',
              title.trim() && !isSubmitting
                ? 'bg-brand-mint text-black hover:opacity-90'
                : 'bg-surface-hover text-text-secondary cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <Icon name="hourglass_empty" size="sm" className="animate-spin" />
            ) : (
              <Icon name="add_task" size="sm" />
            )}
            Criar Tarefa
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-sm bg-surface border border-border-panel text-text-secondary text-sm hover:bg-surface-hover transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Tasks Tab ─────────────────────────────────────────────────────────────────
interface TasksTabProps {
  projects: Project[];
  openForm: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ projects, openForm, onOpenForm, onCloseForm }) => {
  const { checklist, refetch } = useSupabaseData();
  const tasks: ChecklistItem[] = checklist.items;

  const [filters, setFilters] = useState<TaskFilters>(() => {
    const saved = loadFilters();
    // Default to Marco's tasks only — agent tasks belong in Agent Kanban
    if (!saved.owner || saved.owner === 'Todos') saved.owner = 'Marco';
    return saved;
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const updateFilters = useCallback((update: Partial<TaskFilters>) => {
    setFilters(prev => {
      const next = { ...prev, ...update };
      saveFilters(next);
      return next;
    });
  }, []);

  const toggleStatus = useCallback((col: TaskColumn) => {
    setFilters(prev => {
      const has = prev.statuses.includes(col);
      const next = {
        ...prev,
        statuses: has
          ? prev.statuses.filter(s => s !== col)
          : [...prev.statuses, col],
      };
      saveFilters(next);
      return next;
    });
  }, []);

  const handleFormSuccess = useCallback(() => {
    onCloseForm();
    void refetch();
  }, [onCloseForm, refetch]);

  // Filter tasks — "Marco" includes tasks with no responsavel (personal tasks)
  const filteredTasks = tasks.filter(task => {
    if (filters.owner !== 'Todos') {
      const resp = (task.responsavel || '').toLowerCase();
      const owner = filters.owner.toLowerCase();
      if (owner === 'marco') {
        // Marco's view: show his tasks + unassigned tasks (personal)
        if (resp && resp !== 'marco') return false;
      } else {
        if (!resp.includes(owner)) return false;
      }
    }
    if (filters.priority) {
      const pLabel = PRIORITY_LABELS[task.prioridade] ?? '';
      if (pLabel !== filters.priority) return false;
    }
    const col = mapStatus(task.status);
    if (!filters.statuses.includes(col)) return false;
    return true;
  });

  // Group by column
  const grouped: Record<TaskColumn, ChecklistItem[]> = {
    'Aberto': [],
    'Em progresso': [],
    'Revisão': [],
    'Concluído': [],
  };
  for (const t of filteredTasks) {
    grouped[mapStatus(t.status)].push(t);
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  const OWNER_OPTIONS = ['Todos', 'Marco', 'Frank', 'Coder', 'Researcher'] as const;
  const PRIORITY_OPTIONS = ['', 'P0', 'P1', 'P2'] as const;

  const columnColors: Record<TaskColumn, string> = {
    'Aberto': 'text-text-secondary',
    'Em progresso': 'text-accent-blue',
    'Revisão': 'text-accent-orange',
    'Concluído': 'text-brand-mint',
  };
  const totalFilteredTasks = filteredTasks.length;
  const hasActiveFilters = filters.owner !== 'Marco' || filters.priority !== '' || filters.statuses.length !== STATUS_COLUMNS.length;

  return (
    <div className="space-y-4">
      {/* ─── Filter Bar ───────────────────────────────────────────────── */}
      <div className="bg-surface border border-border-panel rounded-sm p-3 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[10px] font-bold text-text-primary">Fila do planner</p>
            <p className="text-[9px] text-text-secondary">
              {totalFilteredTasks} tarefa{totalFilteredTasks !== 1 ? 's' : ''} visiveis
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => {
                saveFilters(DEFAULT_FILTERS);
                setFilters({ ...DEFAULT_FILTERS, owner: 'Marco' });
              }}
              className="rounded-sm border border-border-panel px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
        {/* Owner pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary/60 shrink-0">Pessoa:</span>
          {OWNER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => updateFilters({ owner: opt })}
              className={cn(
                'px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wide transition-all border',
                filters.owner === opt
                  ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                  : 'bg-bg-base border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
              )}
            >
              {opt === 'Marco' ? 'Minhas' : opt}
            </button>
          ))}
        </div>

        {/* Priority pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary/60 shrink-0">Prioridade:</span>
          {PRIORITY_OPTIONS.map(opt => (
            <button
              key={opt || 'all'}
              onClick={() => updateFilters({ priority: opt })}
              className={cn(
                'px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wide transition-all border',
                filters.priority === opt
                  ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                  : 'bg-bg-base border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/40'
              )}
            >
              {opt === '' ? 'Todas' : opt}
            </button>
          ))}
        </div>

        {/* Status checkboxes */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary/60 shrink-0">Status:</span>
          {STATUS_COLUMNS.map(col => (
            <label
              key={col}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.statuses.includes(col)}
                onChange={() => toggleStatus(col)}
                className="w-3 h-3 accent-brand-mint"
              />
              <span className={cn('text-[9px] font-medium', filters.statuses.includes(col) ? columnColors[col] : 'text-text-secondary/50')}>
                {col}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* ─── Nova Tarefa Button ──────────────────────────────────────────── */}
      {!openForm && (
        <button
          onClick={onOpenForm}
          className="flex items-center gap-2 px-3 py-2 rounded-sm bg-brand-mint/10 border border-brand-mint/30 text-brand-mint text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all"
        >
          <Icon name="add_task" size="sm" />
          Nova Tarefa
        </button>
      )}

      {/* ─── Nova Tarefa Form ─────────────────────────────────────────── */}
      {openForm && (
        <NovaTarefaForm
          projects={projects}
          onClose={onCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* ─── Selected Task Detail ────────────────────────────────────── */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* ─── Kanban Columns ──────────────────────────────────────────── */}
      {checklist.isLoading ? (
        <div className="flex items-center gap-2 py-6 text-text-secondary">
          <Icon name="hourglass_empty" size="sm" className="animate-spin" />
          <span className="text-xs">Carregando tarefas...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-surface border border-border-panel rounded-sm p-8 text-center">
          <EmptyState
            icon="task_alt"
            title="Nenhuma tarefa encontrada"
            description="Conecte o Supabase ou adicione tarefas via Notion."
            className="py-2"
          />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-surface border border-border-panel rounded-sm p-8 text-center">
          <EmptyState
            icon="filter_alt_off"
            title="Nenhuma tarefa bate com os filtros"
            description="Ajuste pessoa, prioridade ou status para ampliar a fila."
            className="py-2"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STATUS_COLUMNS.map(col => {
            const colTasks = grouped[col];
            return (
              <div key={col} className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-1">
                  <span className={cn('text-[9px] font-black uppercase tracking-widest', columnColors[col])}>
                    {col}
                  </span>
                  <span className="text-[9px] font-mono text-text-secondary/60 bg-surface border border-border-panel px-1.5 py-0.5 rounded-sm">
                    {colTasks.length}
                  </span>
                </div>
                <div className="bg-bg-base border border-border-panel rounded-sm p-2 flex flex-col gap-2 min-h-[120px]">
                  {colTasks.length === 0 ? (
                    <div className="flex items-center justify-center flex-1 py-6">
                      <span className="text-[10px] text-text-secondary/40">Vazio</span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={selectedTaskId === task.id}
                        onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Main Planner Component ───────────────────────────────────────────────────
const Planner: React.FC<PlannerProps> = ({ projects, activeProjectId, tasks, addTasks }) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'planos' | 'tarefas' | 'projetos'>('planos');
  const [novaTarefaOpen, setNovaTarefaOpen] = useState(false);

  // Form state (Planos tab)
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [deadlineMode, setDeadlineMode] = useState<'hoje' | 'semana' | 'custom'>('semana');
  const [customDeadline, setCustomDeadline] = useState('');
  const [projectId, setProjectId] = useState(activeProjectId);

  // Plan state
  const [activePlan, setActivePlan] = useState<StoredPlan | null>(null);
  const [steps, setSteps] = useState<StoredPlanStep[]>([]);

  // Journey setup
  const { isSetupDone, markDone } = useSectionSetup('planner');
  const [showJourney, setShowJourney] = useState(false);

  // Modal state for new project / content
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  // History
  const [history, setHistory] = useState<StoredPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load plan history on mount
  useEffect(() => {
    loadPlans().then(plans => setHistory(plans ?? [])).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    setProjectId(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    try {
      const rawDraft = localStorage.getItem(PLANNER_DRAFT_KEY);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft) as {
        title?: string;
        context?: string;
        deadlineMode?: 'hoje' | 'semana' | 'custom';
        customDeadline?: string;
        projectId?: string;
      };
      if (draft.title) setTitle(draft.title);
      if (draft.context) setContext(draft.context);
      if (draft.deadlineMode) setDeadlineMode(draft.deadlineMode);
      if (draft.customDeadline) setCustomDeadline(draft.customDeadline);
      if (draft.projectId) setProjectId(draft.projectId);
    } catch {
      // Ignore invalid draft state.
    }
  }, []);

  useEffect(() => {
    const draft = { title, context, deadlineMode, customDeadline, projectId };
    localStorage.setItem(PLANNER_DRAFT_KEY, JSON.stringify(draft));
  }, [title, context, deadlineMode, customDeadline, projectId]);

  const persistPlan = async (plan: StoredPlan) => {
    await putPlan(plan);
    const plans = await loadPlans();
    setHistory(plans ?? []);
  };

  const resumePlan = useMemo(() => getPlannerResumeTarget(history), [history]);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const id = crypto?.randomUUID?.() ?? `plan-${Date.now()}`;
    const generated = generateMockPlan(title.trim());
    const plan: StoredPlan = {
      id,
      ...generated,
      context: context.trim(),
      projectId,
      exported: false,
      lastOpenedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    setActivePlan(plan);
    setSteps((plan.steps ?? []).map(s => ({ ...s })));
    await persistPlan(plan);
    showToast('Plano gerado');
  };

  const toggleStep = async (idx: number) => {
    const newSteps = (steps ?? []).map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    setSteps(newSteps);
    if (activePlan) {
      const updated = { ...activePlan, steps: newSteps, updatedAt: new Date().toISOString() };
      setActivePlan(updated);
      await persistPlan(updated);
    }
  };

  const handleExportKanban = async () => {
    if (!activePlan) return;
    const exportCandidates = getPlanExportCandidates(activePlan, tasks, projectId);
    if (exportCandidates.length === 0) {
      showToast('Nenhuma nova tarefa para exportar');
      return;
    }
    const exportedTasks = addTasks(buildPlanExportTasks({ ...activePlan, suggestedTasks: exportCandidates }, projectId));
    const now = new Date().toISOString();
    const updated = {
      ...activePlan,
      exported: true,
      exportedAt: now,
      exportedTaskIds: [...(activePlan.exportedTaskIds ?? []), ...exportedTasks.map((task) => task.id)],
      lastOpenedAt: now,
      updatedAt: now,
    };
    setActivePlan(updated);
    await persistPlan(updated);
    setActiveTab('tarefas');
    setNovaTarefaOpen(false);
    showToast('Plano enviado para tarefas');
  };

  const handleReset = () => {
    setTitle('');
    setContext('');
    setDeadlineMode('semana');
    setCustomDeadline('');
    setActivePlan(null);
    setSteps([]);
  };

  const handleLoadPlan = useCallback((plan: StoredPlan) => {
    const updatedPlan = { ...plan, lastOpenedAt: new Date().toISOString() };
    setActivePlan(updatedPlan);
    setSteps((plan.steps ?? []).map(s => ({ ...s })));
    setTitle(plan.title ?? '');
    setContext(plan.context ?? '');
    setProjectId(plan.projectId ?? activeProjectId);
    setShowHistory(false);
    void persistPlan(updatedPlan);
    showToast('Plano carregado');
  }, [activeProjectId]);

  useEffect(() => {
    if (!resumePlan) return;
    if (localStorage.getItem(PLANNER_RESUME_REQUEST_KEY) !== '1') return;
    localStorage.removeItem(PLANNER_RESUME_REQUEST_KEY);
    handleLoadPlan(resumePlan);
  }, [handleLoadPlan, resumePlan]);

  const handleDeletePlan = async (id: string) => {
    await deletePlan(id);
    const plans = await loadPlans();
    setHistory(plans ?? []);
    if (activePlan?.id === id) handleReset();
    showToast('Plano removido');
  };

  const handleCreateProject = async (data: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const entry: StoredProjectEntry = {
      id: crypto?.randomUUID?.() ?? `proj-${Date.now()}`,
      name: data.name as string,
      descricao: (data.descricao as string) || undefined,
      status: (data.status as StoredProjectEntry['status']) || 'ativo',
      prioridade: (data.prioridade as StoredProjectEntry['prioridade']) || 'media',
      deadline: (data.deadline as string) || undefined,
      linkDrive: (data.linkDrive as string) || undefined,
      linkNotion: (data.linkNotion as string) || undefined,
      linkGithub: (data.linkGithub as string) || undefined,
      notas: (data.notas as string) || undefined,
      createdAt: now,
      updatedAt: now,
    };
    await putProjetosEntry(entry);
    setShowProjectModal(false);
  };

  const handleCreateContent = async (data: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const entry: StoredContentEntry = {
      id: crypto?.randomUUID?.() ?? `content-${Date.now()}`,
      title: data.title as string,
      tipo: (data.tipo as StoredContentEntry['tipo']) || 'post',
      plataforma: (data.plataforma as string) || 'linkedin',
      status: (data.status as StoredContentEntry['status']) || 'ideia',
      data: (data.data as string) || undefined,
      link: (data.link as string) || undefined,
      notas: (data.notas as string) || undefined,
      projectId: activeProjectId,
      createdAt: now,
      updatedAt: now,
    };
    await putContentEntry(entry);
    setShowContentModal(false);
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-accent-red';
    if (p === 'medium') return 'text-accent-orange';
    return 'text-text-secondary';
  };

  const safeSteps = steps ?? [];
  const stepsProgress = safeSteps.length > 0 ? Math.round((safeSteps.filter(s => s.done).length / safeSteps.length) * 100) : 0;
  const planExecution = activePlan ? summarizePlanExecution(activePlan, tasks) : { total: 0, done: 0, inProgress: 0, open: 0 };
  const planDrift = activePlan ? summarizePlanDrift(activePlan, tasks) : { missing: [], extra: [] };
  const exportCandidates = activePlan ? getPlanExportCandidates(activePlan, tasks, projectId) : [];
  const milestones = activePlan ? derivePlanMilestones(activePlan.title, (activePlan.suggestedTasks ?? []).map((task) => task.deadline)) : [];

  const TABS = [
    { id: 'planos' as const, label: 'Planos', icon: 'auto_awesome' },
    { id: 'tarefas' as const, label: 'Tarefas', icon: 'task_alt' },
    { id: 'projetos' as const, label: 'Projetos', icon: 'folder_open' },
  ];

  return (
    <>
      {showJourney && (
        <JourneyOverlay
          config={plannerJourneyConfig}
          isOpen={showJourney}
          onClose={() => setShowJourney(false)}
          onComplete={() => { markDone(); setShowJourney(false); }}
        />
      )}

      <div className="space-y-6 p-1">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Planejador de Missões</h2>
            <p className="text-xs text-text-secondary mt-0.5">Ideia &rarr; Plano &rarr; Tarefas &rarr; Execução</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <DataBadge isReal={history.length > 0} lastSync={history.length > 0 ? history[0]?.updatedAt ?? null : null} />
            <JourneyTriggerButton
              isConfigured={isSetupDone}
              onClick={() => setShowJourney(true)}
            />
            <button
              onClick={() => setShowProjectModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-mint/10 border border-brand-mint/30 text-brand-mint text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all min-h-[36px]"
            >
              <Icon name="add" size="sm" />
              Novo Projeto
            </button>
            <button
              onClick={() => setShowContentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-[9px] font-bold uppercase tracking-widest hover:bg-accent-blue/20 transition-all min-h-[36px]"
            >
              <Icon name="note_add" size="sm" />
              Novo Conteudo
            </button>
          </div>
        </div>

        {/* ─── Tab Navigation ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-border-panel">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'tarefas') setNovaTarefaOpen(false);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest border-b-2 -mb-px transition-all',
                activeTab === tab.id
                  ? 'border-brand-mint text-brand-mint'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-panel'
              )}
            >
              <Icon name={tab.icon} size="sm" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab: Planos ─────────────────────────────────────────────────── */}
        {activeTab === 'planos' && (
          <div className="space-y-4">
            {/* History toggle + buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border min-h-[36px]',
                  showHistory
                    ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                    : 'bg-surface border-border-panel text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon name="history" size="sm" />
                Histórico
                {history.length > 0 && (
                  <span className="text-[9px] font-bold bg-surface border border-border-panel px-1.5 py-0.5 rounded-sm">
                    {history.length}
                  </span>
                )}
              </button>
              {activePlan && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-hover border border-border-panel text-text-secondary text-xs transition-colors min-h-[36px]"
                >
                  <Icon name="restart_alt" size="sm" />
                  Nova Missão
                </button>
              )}
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="bg-surface border border-border-panel rounded-sm p-4">
                <SectionLabel>PLANOS SALVOS</SectionLabel>
                {history.length === 0 ? (
                  <p className="text-xs text-text-secondary mt-3">Nenhum plano salvo ainda.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(history ?? []).map(plan => {
                      const proj = (projects ?? []).find(p => p.id === plan.projectId);
                      const planSteps = plan.steps ?? [];
                      const progress = planSteps.length > 0
                        ? Math.round((planSteps.filter(s => s.done).length / planSteps.length) * 100)
                        : 0;
                      return (
                        <div
                          key={plan.id}
                          className={cn(
                            'flex items-center justify-between px-3 py-2.5 rounded bg-bg-base border border-border-panel group cursor-pointer hover:border-accent-blue/30 transition-colors',
                            activePlan?.id === plan.id && 'border-accent-blue/40 bg-accent-blue/5'
                          )}
                          onClick={() => handleLoadPlan(plan)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: proj?.color ?? '#888' }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate">{plan.title}</p>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                {new Date(plan.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {plan.exported && <span className="ml-2 text-brand-mint">Exportado</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-border-panel rounded-full overflow-hidden">
                                <div className="h-full bg-brand-mint rounded-full transition-all" style={{ width: `${progress}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-text-secondary">{progress}%</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); void handleDeletePlan(plan.id); }}
                              className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-accent-red transition-all p-1"
                            >
                              <Icon name="delete" size="sm" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Input Form */}
            {!activePlan && (
              <div className="bg-surface border border-border-panel rounded-sm p-5 space-y-4">
                <SectionLabel>ENTRADA DA MISSÃO</SectionLabel>
                {resumePlan && (
                  <button
                    onClick={() => handleLoadPlan(resumePlan)}
                    className="w-full flex items-center justify-between gap-3 rounded-sm border border-border-panel bg-bg-base px-3 py-2 text-left hover:border-accent-blue/30 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Continuar ultimo plano</p>
                      <p className="mt-1 text-sm text-text-primary">{resumePlan.title}</p>
                      <p className="mt-1 text-[9px] text-text-secondary">
                        {resumePlan.exported ? 'Ja exportado para tarefas' : 'Pronto para exportar'}
                      </p>
                    </div>
                    <Icon name="history" size="sm" className="text-accent-blue" />
                  </button>
                )}
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Título</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Lançar MVP do produto"
                    className="w-full bg-bg-base border border-border-panel rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Contexto</label>
                  <textarea
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    placeholder="Descreva o objetivo, restrições, recursos disponíveis..."
                    rows={3}
                    className="w-full bg-bg-base border border-border-panel rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-blue transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Prazo</label>
                    <div className="flex gap-2 flex-wrap">
                      {(['hoje', 'semana', 'custom'] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setDeadlineMode(mode)}
                          className={cn(
                            'px-3 py-1.5 rounded text-xs font-medium transition-colors border min-h-[36px]',
                            deadlineMode === mode
                              ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                              : 'bg-surface-hover border-border-panel text-text-secondary hover:text-text-primary'
                          )}
                        >
                          {mode === 'hoje' ? 'Hoje' : mode === 'semana' ? 'Esta semana' : 'Data'}
                        </button>
                      ))}
                    </div>
                    {deadlineMode === 'custom' && (
                      <input
                        type="date"
                        value={customDeadline}
                        onChange={e => setCustomDeadline(e.target.value)}
                        className="mt-2 w-full bg-bg-base border border-border-panel rounded px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Projeto</label>
                    <select
                      value={projectId}
                      onChange={e => setProjectId(e.target.value)}
                      className="w-full bg-bg-base border border-border-panel rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                    >
                      {(projects ?? []).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => void handleGenerate()}
                  disabled={!title.trim()}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-2.5 rounded font-medium text-sm transition-all min-h-[44px]',
                    title.trim()
                      ? 'bg-brand-mint text-black hover:opacity-90'
                      : 'bg-surface-hover text-text-secondary cursor-not-allowed'
                  )}
                >
                  <Icon name="auto_awesome" size="sm" />
                  Gerar Plano
                </button>
              </div>
            )}

            {/* Plan Result */}
            {activePlan && (
              <div className="space-y-4">
                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <SectionLabel>PROGRESSO</SectionLabel>
                    <span className="text-xs font-bold text-brand-mint">{stepsProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-mint/60 to-brand-mint rounded-full transition-all duration-300"
                      style={{ width: `${stepsProgress}%` }}
                    />
                  </div>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>SUMÁRIO</SectionLabel>
                  <p className="text-sm text-text-primary mt-2">{activePlan.summary}</p>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>Objetivos</SectionLabel>
                  <ul className="mt-2 space-y-1.5">
                    {(activePlan.objectives ?? []).map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                        <Icon name="target" size="sm" className="text-accent-blue mt-0.5 shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>Passos</SectionLabel>
                  <ol className="mt-2 space-y-2">
                    {safeSteps.map((step, i) => (
                      <li
                        key={i}
                        onClick={() => void toggleStep(i)}
                        className="flex items-center gap-3 cursor-pointer group min-h-[36px]"
                      >
                        <div className={cn(
                          'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                          step.done
                            ? 'bg-brand-mint/20 border-brand-mint'
                            : 'border-border-panel group-hover:border-text-secondary'
                        )}>
                          {step.done && <Icon name="check" size="sm" className="text-brand-mint" />}
                        </div>
                        <span className={cn(
                          'text-sm transition-colors',
                          step.done ? 'text-text-secondary line-through' : 'text-text-primary'
                        )}>
                          {i + 1}. {step.text}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>RISCOS E MITIGAÇÕES</SectionLabel>
                  <div className="mt-2 space-y-3">
                    {(activePlan.risks ?? []).map((r, i) => (
                      <div key={i} className="text-sm">
                        <div className="flex items-start gap-2">
                          <Icon name="warning" size="sm" className="text-accent-orange mt-0.5 shrink-0" />
                          <span className="text-text-primary font-medium">{r.risk}</span>
                        </div>
                        <div className="flex items-start gap-2 ml-6 mt-0.5">
                          <Icon name="shield" size="sm" className="text-brand-mint mt-0.5 shrink-0" />
                          <span className="text-text-secondary">{r.mitigation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>Checklist Final</SectionLabel>
                  <ul className="mt-2 space-y-1.5">
                    {(activePlan.checklist ?? []).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <SectionLabel>Tasks Sugeridas</SectionLabel>
                  <div className="mt-2 space-y-2">
                    {(activePlan.suggestedTasks ?? []).map((t, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded bg-bg-base border border-border-panel">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-bold uppercase', priorityColor(t.priority))}>{t.priority[0]}</span>
                          <span className="text-sm text-text-primary">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-text-secondary">{t.tag}</span>
                          <span className="text-xs font-mono text-text-secondary">{t.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {milestones.length > 0 && (
                  <div className="bg-surface border border-border-panel rounded-sm p-4">
                    <SectionLabel>Milestones</SectionLabel>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      {milestones.map((milestone) => (
                        <div key={milestone.id} className="rounded-sm border border-border-panel bg-bg-base px-3 py-2">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">{milestone.label}</p>
                          <p className="mt-1 text-[10px] font-medium text-text-primary">{milestone.deadline}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(planDrift.missing.length > 0 || planDrift.extra.length > 0) && (
                  <div className="bg-surface border border-border-panel rounded-sm p-4 space-y-3">
                    <SectionLabel>Reconciliação</SectionLabel>
                    {planDrift.missing.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-accent-orange">Ainda não exportadas</p>
                        <div className="mt-2 space-y-1.5">
                          {planDrift.missing.slice(0, 3).map((task) => (
                            <div key={task.title} className="rounded-sm border border-border-panel bg-bg-base px-3 py-2 text-[10px] text-text-primary">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {planDrift.extra.length > 0 && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-accent-blue">Extras no projeto</p>
                        <div className="mt-2 space-y-1.5">
                          {planDrift.extra.slice(0, 3).map((task) => (
                            <div key={task.id} className="rounded-sm border border-border-panel bg-bg-base px-3 py-2 text-[10px] text-text-primary">
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-surface border border-border-panel rounded-sm p-4">
                  <div className="flex items-center justify-between gap-3">
                    <SectionLabel>Execução Vinculada</SectionLabel>
                    <button
                      onClick={() => setActiveTab('tarefas')}
                      className="rounded-sm border border-border-panel px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary hover:border-text-secondary/40 transition-colors"
                    >
                      Abrir tarefas
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                    <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2.5 py-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Mapeadas</p>
                      <p className="mt-1 text-sm font-black font-mono text-text-primary">{planExecution.total}</p>
                    </div>
                    <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2.5 py-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Em progresso</p>
                      <p className="mt-1 text-sm font-black font-mono text-accent-blue">{planExecution.inProgress}</p>
                    </div>
                    <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2.5 py-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Abertas</p>
                      <p className="mt-1 text-sm font-black font-mono text-accent-orange">{planExecution.open}</p>
                    </div>
                    <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2.5 py-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Concluídas</p>
                      <p className="mt-1 text-sm font-black font-mono text-brand-mint">{planExecution.done}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-text-secondary">
                    {activePlan.exported
                      ? `Ultima exportacao em ${new Date(activePlan.exportedAt ?? activePlan.updatedAt).toLocaleString('pt-BR')}.`
                      : 'Este plano ainda nao foi exportado para a fila de tarefas.'}
                  </p>
                  <p className="mt-1 text-[10px] text-text-secondary">
                    {exportCandidates.length > 0
                      ? `${exportCandidates.length} tarefa${exportCandidates.length !== 1 ? 's' : ''} nova${exportCandidates.length !== 1 ? 's' : ''} pronta${exportCandidates.length !== 1 ? 's' : ''} para exportar.`
                      : 'Plano reconciliado com a fila atual.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => void handleExportKanban()}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-medium text-sm transition-all min-h-[44px]',
                      exportCandidates.length === 0
                        ? 'bg-brand-mint/20 text-brand-mint cursor-default'
                        : 'bg-brand-mint text-black hover:opacity-90'
                    )}
                  >
                    <Icon name={exportCandidates.length === 0 ? 'check_circle' : 'view_kanban'} size="sm" />
                    {exportCandidates.length === 0 ? 'Fila conciliada' : activePlan.exported ? 'Exportar novas tarefas' : 'Enviar para Kanban'}
                  </button>
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-medium text-sm bg-surface-hover text-text-secondary cursor-not-allowed border border-border-panel"
                  >
                    <Icon name="event" size="sm" />
                    Criar Eventos
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Tarefas ────────────────────────────────────────────────── */}
        {activeTab === 'tarefas' && (
          <TasksTab
            projects={projects}
            openForm={novaTarefaOpen}
            onOpenForm={() => setNovaTarefaOpen(true)}
            onCloseForm={() => setNovaTarefaOpen(false)}
          />
        )}

        {/* ─── Tab: Projetos ───────────────────────────────────────────────── */}
        {activeTab === 'projetos' && (
          <div className="space-y-3">
            {(projects ?? []).map(proj => (
              <div key={proj.id} className="bg-surface border border-border-panel rounded-sm p-4 flex items-center gap-4">
                <div
                  className="size-3 rounded-full shrink-0"
                  style={{ backgroundColor: proj.color }}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{proj.name}</p>
                </div>
                <Icon name={proj.icon || 'folder'} size="sm" className="text-text-secondary shrink-0" />
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-xs text-text-secondary py-4">Nenhum projeto. Crie um usando o botão acima.</p>
            )}
          </div>
        )}

        {/* ─── Modals ──────────────────────────────────────────────────────── */}
        <FormModal
          title="Novo Projeto"
          fields={projectFields}
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
        <FormModal
          title="Novo Conteudo"
          fields={contentFields}
          isOpen={showContentModal}
          onClose={() => setShowContentModal(false)}
          onSubmit={handleCreateContent}
        />
      </div>
    </>
  );
};

export default Planner;
