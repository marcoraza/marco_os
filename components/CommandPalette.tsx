import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Task } from '../App';
import type { StoredEvent, StoredNote } from '../data/models';
import { Icon, SectionLabel } from './ui';
import { cn } from '../utils/cn';

type PaletteItem =
  | { kind: 'task'; id: number; title: string; subtitle?: string; projectId: string }
  | { kind: 'note'; id: string; title: string; subtitle?: string; projectId?: string }
  | { kind: 'event'; id: string; title: string; subtitle?: string; projectId?: string }
  | { kind: 'create-task'; title: string }
  | { kind: 'create-note'; title: string }
  | { kind: 'create-event'; title: string };

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  notes: StoredNote[];
  events: StoredEvent[];
  onOpenTask?: (taskId: number, projectId: string) => void;
  onCreateTask: (title: string) => void;
  onCreateNote: (title: string) => void;
  onCreateEvent: (title: string) => void;
}

export default function CommandPalette(props: CommandPaletteProps) {
  const {
    open,
    onClose,
    tasks,
    notes,
    events,
    onOpenTask,
    onCreateTask,
    onCreateNote,
    onCreateEvent,
  } = props;

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    // small delay so the element exists in DOM
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    const taskItems: PaletteItem[] = (q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.tag.toLowerCase().includes(q)) : tasks)
      .slice(0, 6)
      .map(t => ({
        kind: 'task',
        id: t.id,
        title: t.title,
        subtitle: `${t.tag} • ${t.deadline}`,
        projectId: t.projectId,
      }));

    const noteItems: PaletteItem[] = (q ? notes.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(q)) : notes)
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

    const create: PaletteItem[] = q
      ? [
          { kind: 'create-task', title: query.trim() },
          { kind: 'create-note', title: query.trim() },
          { kind: 'create-event', title: query.trim() },
        ]
      : [];

    return [...create, ...taskItems, ...noteItems, ...eventItems];
  }, [query, tasks, notes, events]);

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
        if (!item) return;

        if (item.kind === 'task') {
          onOpenTask?.(item.id, item.projectId);
          onClose();
          return;
        }
        if (item.kind === 'create-task') {
          onCreateTask(item.title);
          onClose();
          return;
        }
        if (item.kind === 'create-note') {
          onCreateNote(item.title);
          onClose();
          return;
        }
        if (item.kind === 'create-event') {
          onCreateEvent(item.title);
          onClose();
          return;
        }

        // notes/events currently only persist (no dedicated screen yet)
        if (item.kind === 'note' || item.kind === 'event') {
          onClose();
          return;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, items, activeIndex, onOpenTask, onCreateTask, onCreateNote, onCreateEvent]);

  if (!open) return null;

  const renderIcon = (kind: PaletteItem['kind']) => {
    if (kind === 'task') return <Icon name="check_circle" size="sm" className="text-brand-mint" />;
    if (kind === 'note') return <Icon name="description" size="sm" className="text-accent-blue" />;
    if (kind === 'event') return <Icon name="event" size="sm" className="text-accent-orange" />;
    if (kind === 'create-task') return <Icon name="add" size="sm" className="text-brand-mint" />;
    if (kind === 'create-note') return <Icon name="note_add" size="sm" className="text-accent-blue" />;
    return <Icon name="add" size="sm" className="text-accent-orange" />;
  };

  const renderLabel = (item: PaletteItem) => {
    if (item.kind === 'create-task') return `Criar task: ${item.title}`;
    if (item.kind === 'create-note') return `Criar nota: ${item.title}`;
    if (item.kind === 'create-event') return `Criar evento: ${item.title}`;
    return item.title;
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-[12vh] w-[92vw] max-w-[720px] -translate-x-1/2">
        <div className="bg-surface border border-border-panel rounded-lg shadow-2xl layered-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border-panel bg-header-bg">
            <div className="flex items-center gap-3">
              <Icon name="search" size="lg" className="text-text-secondary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar ou criar… (tasks, notas, eventos)"
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
                    onClick={() => {
                      // mimic Enter behavior
                      const it = items[idx];
                      if (!it) return;
                      if (it.kind === 'task') {
                        onOpenTask?.(it.id, it.projectId);
                        onClose();
                        return;
                      }
                      if (it.kind === 'create-task') {
                        onCreateTask(it.title);
                        onClose();
                        return;
                      }
                      if (it.kind === 'create-note') {
                        onCreateNote(it.title);
                        onClose();
                        return;
                      }
                      if (it.kind === 'create-event') {
                        onCreateEvent(it.title);
                        onClose();
                        return;
                      }
                      onClose();
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2 rounded-md border transition-colors text-left',
                      idx === activeIndex
                        ? 'bg-bg-base border-brand-mint/30'
                        : 'bg-surface border-transparent hover:bg-surface-hover'
                    )}
                  >
                    <div className="mt-0.5">{renderIcon(item.kind)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-text-primary truncate">
                        {renderLabel(item)}
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
              Cmd/Ctrl+K para abrir • ↑/↓ navegar • Enter confirmar
            </div>
            <div className="text-[9px] font-black text-text-secondary/50 uppercase tracking-[0.3em]">PALETTE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
