import React, { useState, useEffect } from 'react';
import { Icon, Card, SectionLabel } from './ui';
import type { Project, Task } from '../App';
import type { StoredPlan, StoredPlanStep } from '../data/models';
import { loadPlans, putPlan, deletePlan } from '../data/repository';
import { cn } from '../utils/cn';

// ─── Props ───────────────────────────────────────────────────────────────────
interface PlannerProps {
  projects: Project[];
  activeProjectId: string;
  addTasks: (tasks: Omit<Task, 'id'>[]) => void;
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

// ─── Component ───────────────────────────────────────────────────────────────
const Planner: React.FC<PlannerProps> = ({ projects, activeProjectId, addTasks }) => {
  // Form state
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [deadlineMode, setDeadlineMode] = useState<'hoje' | 'semana' | 'custom'>('semana');
  const [customDeadline, setCustomDeadline] = useState('');
  const [projectId, setProjectId] = useState(activeProjectId);

  // Plan state
  const [activePlan, setActivePlan] = useState<StoredPlan | null>(null);
  const [steps, setSteps] = useState<StoredPlanStep[]>([]);

  // History
  const [history, setHistory] = useState<StoredPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load plan history on mount & when project changes
  useEffect(() => {
    loadPlans().then(setHistory);
  }, []);

  const persistPlan = async (plan: StoredPlan) => {
    await putPlan(plan);
    setHistory(await loadPlans());
  };

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
      createdAt: now,
      updatedAt: now,
    };
    setActivePlan(plan);
    setSteps(plan.steps.map(s => ({ ...s })));
    await persistPlan(plan);
  };

  const toggleStep = async (idx: number) => {
    const newSteps = steps.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    setSteps(newSteps);
    if (activePlan) {
      const updated = { ...activePlan, steps: newSteps, updatedAt: new Date().toISOString() };
      setActivePlan(updated);
      await persistPlan(updated);
    }
  };

  const handleExportKanban = async () => {
    if (!activePlan) return;
    const newTasks: Omit<Task, 'id'>[] = activePlan.suggestedTasks.map(st => ({
      title: st.title,
      tag: st.tag,
      projectId,
      status: 'assigned' as const,
      priority: st.priority,
      deadline: st.deadline,
      assignee: 'MA',
      dependencies: 0,
    }));
    addTasks(newTasks);
    const updated = { ...activePlan, exported: true, updatedAt: new Date().toISOString() };
    setActivePlan(updated);
    await persistPlan(updated);
  };

  const handleReset = () => {
    setTitle('');
    setContext('');
    setDeadlineMode('semana');
    setCustomDeadline('');
    setActivePlan(null);
    setSteps([]);
  };

  const handleLoadPlan = (plan: StoredPlan) => {
    setActivePlan(plan);
    setSteps(plan.steps.map(s => ({ ...s })));
    setTitle(plan.title);
    setContext(plan.context);
    setProjectId(plan.projectId);
    setShowHistory(false);
  };

  const handleDeletePlan = async (id: string) => {
    await deletePlan(id);
    setHistory(await loadPlans());
    if (activePlan?.id === id) handleReset();
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-accent-red';
    if (p === 'medium') return 'text-accent-orange';
    return 'text-text-secondary';
  };

  const stepsProgress = steps.length > 0 ? Math.round((steps.filter(s => s.done).length / steps.length) * 100) : 0;

  return (
    <div className="space-y-6 p-1">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Planejador de Missões</h2>
          <p className="text-xs text-text-secondary mt-0.5">Ideia &rarr; Plano &rarr; Tarefas &rarr; Execução</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors border',
              showHistory
                ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                : 'bg-surface border-border-card text-text-secondary hover:text-text-primary'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-hover border border-border-card text-text-secondary text-xs transition-colors"
            >
              <Icon name="restart_alt" size="sm" />
              Nova Missão
            </button>
          )}
        </div>
      </div>

      {/* ─── History Panel ────────────────────────────────────────────────── */}
      {showHistory && (
        <div className="bg-surface border border-border-card rounded-lg p-4">
          <SectionLabel>PLANOS SALVOS</SectionLabel>
          {history.length === 0 ? (
            <p className="text-xs text-text-secondary mt-3">Nenhum plano salvo ainda.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {history.map(plan => {
                const proj = projects.find(p => p.id === plan.projectId);
                const progress = plan.steps.length > 0
                  ? Math.round((plan.steps.filter(s => s.done).length / plan.steps.length) * 100)
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
                          {plan.exported && <span className="ml-2 text-brand-mint">✓ Exportado</span>}
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
                        onClick={e => { e.stopPropagation(); handleDeletePlan(plan.id); }}
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

      {/* ─── Input Form ─────────────────────────────────────────────────── */}
      {!activePlan && (
        <div className="bg-surface border border-border-card rounded-lg p-5 space-y-4">
          <SectionLabel>ENTRADA DA MISSÃO</SectionLabel>

          {/* Title */}
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

          {/* Context */}
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

          {/* Deadline + Project row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deadline */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Prazo</label>
              <div className="flex gap-2">
                {(['hoje', 'semana', 'custom'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setDeadlineMode(mode)}
                    className={cn(
                      'px-3 py-1.5 rounded text-xs font-medium transition-colors border',
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

            {/* Project */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Projeto</label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="w-full bg-bg-base border border-border-panel rounded px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!title.trim()}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded font-medium text-sm transition-all',
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

      {/* ─── Plan Result ────────────────────────────────────────────────── */}
      {activePlan && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
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

          {/* Summary */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>SUMÁRIO</SectionLabel>
            <p className="text-sm text-text-primary mt-2">{activePlan.summary}</p>
          </div>

          {/* Objectives */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>Objetivos</SectionLabel>
            <ul className="mt-2 space-y-1.5">
              {activePlan.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                  <Icon name="target" size="sm" className="text-accent-blue mt-0.5 shrink-0" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>Passos</SectionLabel>
            <ol className="mt-2 space-y-2">
              {steps.map((step, i) => (
                <li
                  key={i}
                  onClick={() => toggleStep(i)}
                  className="flex items-center gap-3 cursor-pointer group"
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

          {/* Risks */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>RISCOS E MITIGAÇÕES</SectionLabel>
            <div className="mt-2 space-y-3">
              {activePlan.risks.map((r, i) => (
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

          {/* Checklist */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>Checklist Final</SectionLabel>
            <ul className="mt-2 space-y-1.5">
              {activePlan.checklist.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-primary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Tasks Preview */}
          <div className="bg-surface border border-border-card rounded-lg p-4">
            <SectionLabel>Tasks Sugeridas</SectionLabel>
            <div className="mt-2 space-y-2">
              {activePlan.suggestedTasks.map((t, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded bg-bg-base border border-border-panel">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold uppercase', priorityColor(t.priority))}>{t.priority[0]}</span>
                    <span className="text-sm text-text-primary">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">{t.tag}</span>
                    <span className="text-xs text-text-secondary">{t.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleExportKanban}
              disabled={activePlan.exported}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-medium text-sm transition-all',
                activePlan.exported
                  ? 'bg-brand-mint/20 text-brand-mint cursor-default'
                  : 'bg-brand-mint text-black hover:opacity-90'
              )}
            >
              <Icon name={activePlan.exported ? 'check_circle' : 'view_kanban'} size="sm" />
              {activePlan.exported ? 'Enviado para Kanban' : 'Enviar para Kanban'}
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
  );
};

export default Planner;
