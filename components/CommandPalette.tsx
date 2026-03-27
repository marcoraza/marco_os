import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Task, View } from '../lib/appTypes';
import type { StoredEvent, StoredNote, StoredContact } from '../data/models';
import { Icon, SectionLabel, showToast } from './ui';
import { cn } from '../utils/cn';
import { rankPaletteNotes } from '../lib/notesWorkflows';

type PaletteItem =
  | { kind: 'nav'; id: string; title: string; subtitle?: string; icon: string; view: View }
  | { kind: 'task'; id: number; title: string; subtitle?: string; projectId: string }
  | { kind: 'note'; id: string; title: string; subtitle?: string; projectId?: string }
  | { kind: 'event'; id: string; title: string; subtitle?: string; projectId?: string }
  | { kind: 'contact'; id: string; title: string; subtitle?: string }
  | { kind: 'create-task'; title: string }
  | { kind: 'create-note'; title: string }
  | { kind: 'create-event'; title: string }
  | { kind: 'action'; id: string; title: string; subtitle: string; icon: string };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  notes: StoredNote[];
  events: StoredEvent[];
  contacts?: StoredContact[];
  onOpenTask?: (taskId: number, projectId: string) => void;
  onOpenNote?: (noteId: string) => void | Promise<void>;
  onNavigate?: (view: View) => void | Promise<void>;
  onCreateTask: (title: string) => unknown;
  onCreateNote: (title: string) => unknown;
  onCreateEvent: (title: string) => unknown;
  onQuickAction?: (actionId: string) => void | Promise<void>;
}

const NAV_COMMANDS: { id: View; icon: string; label: string; subtitle: string }[] = [
  { id: 'dashboard', icon: 'dashboard', label: 'Central de Comando', subtitle: 'Ir para o dashboard' },
  { id: 'finance', icon: 'payments', label: 'Finanças', subtitle: 'Ir para finanças' },
  { id: 'health', icon: 'monitor_heart', label: 'Saúde', subtitle: 'Ir para saúde' },
  { id: 'learning', icon: 'school', label: 'Aprendizado', subtitle: 'Ir para aprendizado' },
  { id: 'planner', icon: 'event_note', label: 'Planejador', subtitle: 'Ir para planejador' },
  { id: 'notes', icon: 'sticky_note_2', label: 'Notas', subtitle: 'Ir para notas' },
  { id: 'crm', icon: 'contacts', label: 'Gestão de Contatos', subtitle: 'Ir para CRM' },
  { id: 'agents-overview', icon: 'hub', label: 'Mission Control', subtitle: 'Ir para centro de agentes' },
  { id: 'settings', icon: 'settings', label: 'Configurações', subtitle: 'Ir para configurações' },
];

export default function CommandPalette(props: CommandPaletteProps) {
  const {
    open,
    onClose,
    tasks,
    notes,
    events,
    contacts = [],
    onOpenTask,
    onOpenNote,
    onNavigate,
    onCreateTask,
    onCreateNote,
    onCreateEvent,
    onQuickAction,
  } = props;

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    setIsExecuting(false);
    setErrorMessage(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Navigation commands (show when query matches or when empty with ">" prefix or just empty)
    const navItems: PaletteItem[] = NAV_COMMANDS
      .filter(nav => !q || nav.label.toLowerCase().includes(q) || nav.subtitle.toLowerCase().includes(q))
      .slice(0, q ? 4 : 3)
      .map(nav => ({
        kind: 'nav',
        id: nav.id,
        title: nav.label,
        subtitle: nav.subtitle,
        icon: nav.icon,
        view: nav.id,
      }));

    const taskItems: PaletteItem[] = (q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q)) : tasks)
      .slice(0, 6)
      .map(t => ({
        kind: 'task',
        id: t.id,
        title: t.title,
        subtitle: `${t.tag} • ${t.deadline}`,
        projectId: t.projectId,
      }));

    const searchableNotes = rankPaletteNotes(notes);
    const noteItems: PaletteItem[] = (q ? searchableNotes.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(q)) : searchableNotes)
      .slice(0, 4)
      .map(n => ({
        kind: 'note',
        id: n.id,
        title: n.title,
        subtitle: n.body ? n.body.slice(0, 80) : undefined,
        projectId: n.projectId,
      }));

    const eventItems: PaletteItem[] = (q ? events.filter(e => (e.title + ' ' + (e.note ?? '')).toLowerCase().includes(q)) : events)
      .slice(0, 4)
      .map(e => ({
        kind: 'event',
        id: e.id,
        title: e.title,
        subtitle: `${e.date}${e.time ? ' • ' + e.time : ''}`,
        projectId: e.projectId,
      }));

    const contactItems: PaletteItem[] = (q ? contacts.filter(c => (c.name + ' ' + c.company + ' ' + c.email).toLowerCase().includes(q)) : [])
      .slice(0, 4)
      .map(c => ({
        kind: 'contact',
        id: c.id,
        title: c.name,
        subtitle: `${c.role} • ${c.company}`,
      }));

    const create: PaletteItem[] = q
      ? [
          { kind: 'create-task', title: query.trim() },
          { kind: 'create-note', title: query.trim() },
          { kind: 'create-event', title: query.trim() },
        ]
      : [];

    // Quick actions (always available, filterable)
    const quickActions: PaletteItem[] = [
      { kind: 'action' as const, id: 'new-finance', title: 'Nova entrada financeira', subtitle: 'Registrar receita ou despesa', icon: 'payments' },
      { kind: 'action' as const, id: 'new-health', title: 'Novo registro de saude', subtitle: 'Treino, peso, habito, sono ou humor', icon: 'monitor_heart' },
      { kind: 'action' as const, id: 'new-braindump', title: 'Nova nota rapida', subtitle: 'Brain dump para ideias e reflexoes', icon: 'sticky_note_2' },
      { kind: 'action' as const, id: 'open-marco-os-v2', title: 'Abrir Marco OS V2', subtitle: 'Launch do shell Mission Control V2', icon: 'open_in_new' },
      { kind: 'action' as const, id: 'resume-plan', title: 'Retomar ultimo plano', subtitle: 'Abrir o planejamento mais recente', icon: 'history' },
      { kind: 'action' as const, id: 'focus-next-task', title: 'Focar proxima tarefa', subtitle: 'Abrir a tarefa prioritaria do dashboard', icon: 'track_changes' },
      { kind: 'action' as const, id: 'open-starred-notes', title: 'Abrir notas favoritas', subtitle: 'Ir para notas com foco nas favoritas', icon: 'star' },
    ].filter(a => !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

    return [...create, ...(q ? [] : navItems), ...(q ? [] : quickActions), ...taskItems, ...noteItems, ...eventItems, ...contactItems, ...(q ? quickActions : []), ...(q ? navItems : [])];
  }, [query, tasks, notes, events, contacts]);

  const executeItem = async (item: PaletteItem) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setErrorMessage(null);
    try {
      switch (item.kind) {
        case 'nav':
          await onNavigate?.(item.view);
          break;
        case 'task':
          onOpenTask?.(item.id, item.projectId);
          break;
        case 'note':
          await onOpenNote?.(item.id);
          break;
        case 'event':
          await onNavigate?.('planner');
          showToast('Evento disponivel no planejador');
          break;
        case 'contact':
          await onNavigate?.('crm');
          break;
        case 'create-task':
          if (!onCreateTask(item.title)) throw new Error('Nao foi possivel criar a tarefa');
          showToast('Tarefa criada');
          break;
        case 'create-note':
          if (!onCreateNote(item.title)) throw new Error('Nao foi possivel criar a nota');
          showToast('Nota criada');
          break;
        case 'create-event':
          if (!onCreateEvent(item.title)) throw new Error('Nao foi possivel criar o evento');
          showToast('Evento criado');
          break;
        case 'action':
          await onQuickAction?.(item.id);
          break;
      }
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Acao falhou');
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, Math.max(items.length - 1, 0)));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = items[activeIndex];
        if (item) void executeItem(item);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, items, activeIndex]);

  if (!open) return null;

  const renderIcon = (kind: PaletteItem['kind'], item?: PaletteItem) => {
    if (kind === 'nav' && item && 'icon' in item) return <Icon name={item.icon} size="sm" className="text-accent-purple" />;
    if (kind === 'task') return <Icon name="check_circle" size="sm" className="text-brand-mint" />;
    if (kind === 'note') return <Icon name="description" size="sm" className="text-accent-blue" />;
    if (kind === 'event') return <Icon name="event" size="sm" className="text-accent-orange" />;
    if (kind === 'contact') return <Icon name="person" size="sm" className="text-accent-purple" />;
    if (kind === 'create-task') return <Icon name="add" size="sm" className="text-brand-mint" />;
    if (kind === 'create-note') return <Icon name="note_add" size="sm" className="text-accent-blue" />;
    if (kind === 'create-event') return <Icon name="add" size="sm" className="text-accent-orange" />;
    if (kind === 'action' && item && 'icon' in item) return <Icon name={(item as any).icon} size="sm" className="text-brand-mint" />;
    return <Icon name="add" size="sm" className="text-accent-orange" />;
  };

  const renderLabel = (item: PaletteItem) => {
    if (item.kind === 'nav') return `Ir para: ${item.title}`;
    if (item.kind === 'create-task') return `Criar task: ${item.title}`;
    if (item.kind === 'create-note') return `Criar nota: ${item.title}`;
    if (item.kind === 'create-event') return `Criar evento: ${item.title}`;
    if (item.kind === 'action') return item.title;
    if (item.kind === 'contact') return item.title;
    return item.title;
  };

  const renderBadge = (kind: PaletteItem['kind']) => {
    const badges: Record<string, { label: string; color: string }> = {
      nav: { label: 'NAV', color: 'text-accent-purple bg-accent-purple/10' },
      task: { label: 'TASK', color: 'text-brand-mint bg-brand-mint/10' },
      note: { label: 'NOTA', color: 'text-accent-blue bg-accent-blue/10' },
      event: { label: 'EVENTO', color: 'text-accent-orange bg-accent-orange/10' },
      contact: { label: 'CONTATO', color: 'text-accent-purple bg-accent-purple/10' },
      action: { label: 'ACAO', color: 'text-brand-mint bg-brand-mint/10' },
    };
    const badge = badges[kind];
    if (!badge) return null;
    return (
      <span className={cn('text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm', badge.color)}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute left-1/2 top-[12vh] w-[92vw] max-w-[720px] -translate-x-1/2"
      >
        <div className="bg-surface border border-border-panel rounded-lg shadow-2xl layered-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border-panel bg-header-bg">
            <div className="flex items-center gap-3">
              <Icon name="search" size="lg" className="text-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                placeholder="Buscar ou criar… (tasks, notas, eventos, contatos, navegação)"
                className="flex-1 bg-bg-base border border-border-panel rounded-md px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-mint transition-colors"
              />
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-secondary">
                <span className="px-2 py-1 rounded-sm border border-border-panel bg-bg-base">ESC</span>
              </div>
            </div>
          </div>

          <div className="max-h-[52vh] overflow-y-auto">
            <div className="px-4 pt-3">
              <SectionLabel className="px-1">Comandos</SectionLabel>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-text-secondary">
                Nenhum resultado.
              </div>
            ) : (
              <div className="p-2">
                {items.map((item, idx) => (
                  <button
                    key={`${item.kind}-${'id' in item ? (item as any).id : item.title}-${idx}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => void executeItem(item)}
                    disabled={isExecuting}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2 rounded-md border transition-colors text-left',
                      idx === activeIndex
                        ? 'bg-bg-base border-brand-mint/30'
                        : 'bg-surface border-transparent hover:bg-surface-hover',
                      isExecuting && 'opacity-70'
                    )}
                  >
                    <div className="mt-0.5">{renderIcon(item.kind, item)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-text-primary truncate">
                          {renderLabel(item)}
                        </span>
                        {renderBadge(item.kind)}
                      </div>
                      {'subtitle' in item && item.subtitle && (
                        <div className="text-[10px] font-bold text-text-secondary mt-0.5 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                    <Icon name="keyboard_return" size="sm" className="text-text-secondary/50" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-border-panel bg-header-bg flex items-center justify-between">
            <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">
              {isExecuting ? 'Executando comando...' : 'Cmd/Ctrl+K para abrir • ↑/↓ navegar • Enter confirmar'}
            </div>
            <div className="text-[9px] font-black text-text-secondary/50 uppercase tracking-[0.3em]">PALETTE</div>
          </div>
          {errorMessage && (
            <div className="px-4 py-2 border-t border-accent-red/20 bg-accent-red/10 text-[10px] font-medium text-accent-red">
              {errorMessage}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
