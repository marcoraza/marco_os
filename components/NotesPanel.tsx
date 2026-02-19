import React, { useState, useRef, useCallback } from 'react';
import type { StoredNote } from '../data/models';
import { Icon, Card, SectionLabel } from './ui';
import { cn } from '../utils/cn';

interface NotesPanelProps {
  notes: StoredNote[];
  setNotes: React.Dispatch<React.SetStateAction<StoredNote[]>>;
  activeProjectId: string;
}

// ─── Simple markdown → HTML renderer ─────────────────────────────────────────
function renderMarkdown(md: string): string {
  let html = md
    // Code blocks (```...```)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-bg-base border border-border-panel rounded p-3 text-xs font-mono overflow-x-auto my-2"><code>$1</code></pre>')
    // Inline code (`...`)
    .replace(/`([^`]+)`/g, '<code class="bg-bg-base border border-border-panel rounded px-1.5 py-0.5 text-xs font-mono">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-text-primary mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-text-primary mt-4 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-text-primary mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del class="line-through text-text-secondary">$1</del>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-accent-blue underline hover:text-accent-blue/80">$1</a>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-sm">$1</li>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="border-border-panel my-3" />')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-accent-blue pl-3 text-text-secondary italic my-2">$1</blockquote>')
    // Line breaks (double newline → paragraph gap)
    .replace(/\n\n/g, '<div class="h-3"></div>')
    // Single newlines → br
    .replace(/\n/g, '<br />');

  return html;
}

// ─── Toolbar actions ─────────────────────────────────────────────────────────
type FormatAction = 'bold' | 'italic' | 'heading' | 'code' | 'list' | 'link' | 'strikethrough' | 'quote';

function applyFormat(
  textarea: HTMLTextAreaElement,
  action: FormatAction,
  updateBody: (body: string) => void,
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  let replacement = '';
  let cursorOffset = 0;

  switch (action) {
    case 'bold':
      replacement = `**${selected || 'texto'}**`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `*${selected || 'texto'}*`;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'heading':
      replacement = `## ${selected || 'Título'}`;
      cursorOffset = replacement.length;
      break;
    case 'code':
      replacement = selected.includes('\n') ? `\`\`\`\n${selected || 'código'}\n\`\`\`` : `\`${selected || 'código'}\``;
      cursorOffset = selected ? replacement.length : (selected.includes('\n') ? 4 : 1);
      break;
    case 'list':
      replacement = selected
        ? selected.split('\n').map(line => `- ${line}`).join('\n')
        : '- item';
      cursorOffset = replacement.length;
      break;
    case 'link':
      replacement = `[${selected || 'texto'}](url)`;
      cursorOffset = selected ? replacement.length - 1 : 1;
      break;
    case 'strikethrough':
      replacement = `~~${selected || 'texto'}~~`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'quote':
      replacement = selected
        ? selected.split('\n').map(line => `> ${line}`).join('\n')
        : '> citação';
      cursorOffset = replacement.length;
      break;
  }

  const newValue = value.slice(0, start) + replacement + value.slice(end);
  updateBody(newValue);

  // Restore cursor position after React re-render
  requestAnimationFrame(() => {
    textarea.focus();
    const newPos = start + cursorOffset;
    textarea.setSelectionRange(newPos, newPos);
  });
}

const TOOLBAR_ITEMS: { action: FormatAction; icon: string; label: string }[] = [
  { action: 'bold', icon: 'format_bold', label: 'Negrito' },
  { action: 'italic', icon: 'format_italic', label: 'Itálico' },
  { action: 'strikethrough', icon: 'strikethrough_s', label: 'Riscado' },
  { action: 'heading', icon: 'title', label: 'Título' },
  { action: 'code', icon: 'code', label: 'Código' },
  { action: 'list', icon: 'format_list_bulleted', label: 'Lista' },
  { action: 'quote', icon: 'format_quote', label: 'Citação' },
  { action: 'link', icon: 'link', label: 'Link' },
];

// ─── Component ───────────────────────────────────────────────────────────────
const NotesPanel: React.FC<NotesPanelProps> = ({ notes, setNotes, activeProjectId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showListMobile, setShowListMobile] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setPreviewMode(false);
  };

  const updateBody = useCallback((body: string) => {
    if (!selectedId) return;
    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, body, updatedAt: new Date().toISOString() } : n));
  }, [selectedId, setNotes]);

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
        {/* Notes List */}
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
              onClick={() => { setSelectedId(note.id); setShowListMobile(false); setPreviewMode(false); }}
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

        {/* Editor / Preview */}
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
                {/* Edit/Preview toggle */}
                <div className="flex items-center p-0.5 bg-bg-base rounded-sm border border-border-panel shrink-0">
                  <button
                    onClick={() => setPreviewMode(false)}
                    className={cn(
                      'px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider transition-colors',
                      !previewMode ? 'bg-surface text-accent-orange border border-border-panel/40 shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setPreviewMode(true)}
                    className={cn(
                      'px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider transition-colors',
                      previewMode ? 'bg-surface text-accent-blue border border-border-panel/40 shadow-sm' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    Preview
                  </button>
                </div>
                <span className="text-[8px] text-text-secondary/50 shrink-0">autosave</span>
              </div>

              {/* Toolbar (edit mode only) */}
              {!previewMode && (
                <div className="flex items-center gap-0.5 mb-2 p-1 bg-bg-base border border-border-panel rounded-md shrink-0 overflow-x-auto">
                  {TOOLBAR_ITEMS.map(item => (
                    <button
                      key={item.action}
                      onClick={() => {
                        if (textareaRef.current) {
                          applyFormat(textareaRef.current, item.action, updateBody);
                        }
                      }}
                      title={item.label}
                      className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors shrink-0"
                    >
                      <Icon name={item.icon} size="sm" />
                    </button>
                  ))}
                </div>
              )}

              {previewMode ? (
                <div
                  className="flex-1 bg-bg-base border border-border-panel rounded-md p-4 text-sm text-text-primary overflow-y-auto leading-relaxed prose-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.body || '<span class="text-text-secondary/30 italic">Nada para exibir</span>') }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={selected.body}
                  onChange={e => updateBody(e.target.value)}
                  placeholder="Escreva aqui… (suporta **markdown**)"
                  className="flex-1 bg-bg-base border border-border-panel rounded-md p-4 text-sm text-text-primary resize-none focus:outline-none focus:border-accent-orange/30 transition-colors placeholder:text-text-secondary/30 leading-relaxed font-mono"
                />
              )}
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
