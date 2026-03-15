import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/Badge';
import { SectionLabel } from '../ui/SectionLabel';

type ContentStatus = 'idea' | 'draft' | 'review' | 'scheduled' | 'published';
type ContentType = 'post' | 'video' | 'newsletter' | 'thread' | 'podcast';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  date: string;
  platform: string;
}

const MOCK_CONTENT: ContentItem[] = [
  { id: 'c1', title: 'Como construir um OS pessoal em 2024', type: 'post', status: 'published', date: '2024-01-05', platform: 'LinkedIn' },
  { id: 'c2', title: 'Thread sobre produtividade extrema', type: 'thread', status: 'scheduled', date: '2024-01-08', platform: 'X' },
  { id: 'c3', title: 'Newsletter: Sistemas de alto desempenho', type: 'newsletter', status: 'draft', date: '2024-01-10', platform: 'Substack' },
  { id: 'c4', title: 'Video: Setup para Deep Work', type: 'video', status: 'review', date: '2024-01-12', platform: 'YouTube' },
  { id: 'c5', title: 'Podcast: Entrevista com CEO de startup', type: 'podcast', status: 'idea', date: '2024-01-15', platform: 'Spotify' },
  { id: 'c6', title: 'Post: Frameworks de decisao', type: 'post', status: 'draft', date: '2024-01-18', platform: 'LinkedIn' },
];

const STATUS_COLORS: Record<ContentStatus, string> = {
  idea: 'text-text-secondary border-border-panel bg-surface',
  draft: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10',
  review: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10',
  scheduled: 'text-accent-purple border-accent-purple/30 bg-accent-purple/10',
  published: 'text-brand-mint border-brand-mint/30 bg-brand-mint/10',
};

const TYPE_ICONS: Record<ContentType, string> = {
  post: 'article',
  video: 'videocam',
  newsletter: 'email',
  thread: 'forum',
  podcast: 'mic',
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Ideia',
  draft: 'Rascunho',
  review: 'Revisao',
  scheduled: 'Agendado',
  published: 'Publicado',
};

export default function ContentCalendar() {
  const [filter, setFilter] = useState<ContentStatus | 'all'>('all');

  const filtered = filter === 'all' ? MOCK_CONTENT : MOCK_CONTENT.filter(c => c.status === filter);

  const statusFilters: Array<{ id: ContentStatus | 'all'; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'idea', label: 'Ideias' },
    { id: 'draft', label: 'Rascunhos' },
    { id: 'review', label: 'Revisao' },
    { id: 'scheduled', label: 'Agendados' },
    { id: 'published', label: 'Publicados' },
  ];

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel className="tracking-[0.1em]">Calendario de Conteudo</SectionLabel>
        <div className="flex items-center gap-1 text-text-secondary">
          <Icon name="calendar_month" size="sm" />
          <span className="text-[9px] font-mono font-bold uppercase">{MOCK_CONTENT.length} itens</span>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {statusFilters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wide border transition-colors',
              filter === f.id
                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint'
                : 'bg-bg-base border-border-panel text-text-secondary hover:text-text-primary hover:border-border-panel/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      <div className="space-y-2">
        {filtered.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-bg-base border border-border-panel rounded-sm hover:border-brand-mint/20 transition-colors group"
          >
            <div className="shrink-0 w-8 h-8 rounded-sm bg-surface border border-border-panel flex items-center justify-center text-text-secondary group-hover:text-text-primary transition-colors">
              <Icon name={TYPE_ICONS[item.type]} size="sm" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-text-primary truncate">{item.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono text-text-secondary">{item.platform}</span>
                <span className="text-[9px] text-text-secondary/50">·</span>
                <span className="text-[9px] font-mono text-text-secondary">
                  {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>

            <span className={cn(
              'shrink-0 px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wide border',
              STATUS_COLORS[item.status]
            )}>
              {STATUS_LABELS[item.status]}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-text-secondary/50">
            <Icon name="event_busy" size="lg" />
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Nenhum item</p>
          </div>
        )}
      </div>
    </div>
  );
}
