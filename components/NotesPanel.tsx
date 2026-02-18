import React, { useState, useRef, useEffect } from 'react';
import type { StoredNote } from '../data/models';
import { Icon, Card, SectionLabel } from './ui';
import { cn } from '../utils/cn';

interface NotesPanelProps {
  notes: StoredNote[];
  setNotes: React.Dispatch<React.SetStateAction<StoredNote[]>>;
  activeProjectId: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, setNotes, activeProjectId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showListMobile, setShowListMobile] = useState(true);
  const autosaveRef = useRef<ReturnType<typeof setTimeout>>();

  const projectNotes = notes.filter(n => !n.projectId || n.projectId === activeProjectId);
  const selected = projectNotes.find(n => n.id === selectedId);

  const createNote = () => {
    const title = newTitle.trim() || 'Nota sem título';
    const now = new Date().toISOString();
    const id = crypto?.randomUUID?.() ?? `note-${Date.now()}`;
    const note: StoredNote = { id, title, body: '', createdAt: now, updatedAt: now, projectId: activeProjectId };
    setNotes(prev => [note, ...prev]);
    setSelectedId(id);
    setNewTitle('');
  };

  const updateBody = (body: string) => {
    if (!selectedId) return;
    if (autosaveRef.current) clearTimeout(autosaveRef.current);
    // Update immediately in state for responsiveness
    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, body, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Icon name="sticky_note_2" size="lg" className="text-accent-orange" />
          <div>
            <SectionLabel className="text-[12px] text-text-primary tracking-[0.1em]">Notas</SectionLabel>
            <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{projectNotes.length} notas</p>
          </div>
        </div>
      </div>

      {/* Create */}
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createNote()}
          placeholder="Título da nova nota…"
          className="flex-1 bg-bg-base border border-border-panel rounded-md px-3 py-2 text-[11px] text-text-primary focus:outline-none focus:border-accent-orange/50 transition-colors placeholder:text-text-secondary/40"
        />
        <button
          onClick={createNote}
          className="px-3 py-2 bg-accent-orange/10 border border-accent-orange/30 rounded-md text-accent-orange text-[10px] font-bold uppercase hover:bg-accent-orange/20 transition-colors"
        >
          <Icon name="add" size="sm" />
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Notes List — full width on mobile when no note selected, hidden when editing */}
        <div className={cn(
          'md:w-64 md:shrink-0 overflow-y-auto space-y-2',
          showListMobile ? 'w-full' : 'hidden md:block'
        )}>
          {projectNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon name="note_stack" size="lg" className="text-text-secondary/30 mb-2" />
              <p className="text-[10px] font-bold text-text-secondary/40 uppercase tracking-widest">Nenhuma nota</p>
              <p className="text-[8px] text-text-secondary/25 mt-1">Crie sua primeira nota acima</p>
            </div>
          )}
          {projectNotes.map(note => (
            <Card
              key={note.id}
              interactive
              onClick={() => { setSelectedId(note.id); setShowListMobile(false); }}
              className={cn(
                'p-3 group',
                selectedId === note.id && 'border-accent-orange/40 bg-accent-orange/5'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-text-primary truncate">{note.title}</p>
                  <p className="text-[9px] text-text-secondary mt-1 line-clamp-2">{note.body || 'Vazia'}</p>
                  <p className="text-[8px] text-text-secondary/50 mt-1">
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                  className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-accent-red transition-all shrink-0"
                >
                  <Icon name="delete" size="sm" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Editor — hidden on mobile when list is showing */}
        <div className={cn(
          'flex-1 flex flex-col min-w-0',
          !showListMobile ? 'w-full' : 'hidden md:flex'
        )}>
          {selected ? (
            <>
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <button
                  onClick={() => setShowListMobile(true)}
                  className="md:hidden text-text-secondary hover:text-text-primary p-1"
                >
                  <Icon name="arrow_back" size="sm" />
                </button>
                <input
                  type="text"
                  value={selected.title}
                  onChange={e => {
                    const val = e.target.value;
                    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, title: val, updatedAt: new Date().toISOString() } : n));
                  }}
                  className="flex-1 bg-transparent border-none text-sm font-bold text-text-primary focus:outline-none"
                />
                <span className="text-[8px] text-text-secondary/50 shrink-0">autosave</span>
              </div>
              <textarea
                value={selected.body}
                onChange={e => updateBody(e.target.value)}
                placeholder="Escreva aqui…"
                className="flex-1 bg-bg-base border border-border-panel rounded-md p-4 text-sm text-text-primary resize-none focus:outline-none focus:border-accent-orange/30 transition-colors placeholder:text-text-secondary/30 leading-relaxed"
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Icon name="edit_note" size="lg" className="text-text-secondary/20 mb-2" />
              <p className="text-[10px] text-text-secondary/30 font-bold uppercase tracking-widest">Selecione uma nota</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
