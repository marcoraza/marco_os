// components/learning/ChronicleView.tsx
// Unified timeline of all activity across databases — Sprint D

import React, { useState, useMemo } from 'react';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { TimelineList } from '@/components/ui/TimelineList';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

// ─── Raw JSON shapes ──────────────────────────────────────────────────────────

interface RawResearchItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  Data?: string | null;
  Plataforma?: string | null;
}

interface RawDeepDiveItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  Status?: string | null;
  'Data Análise'?: string | null;
}

interface RawReuniaoItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  Data?: string | null;
  Status?: string | null;
}

interface RawDecisionItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  data?: string | null;
  Status?: string | null;
}

interface RawContentItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  Hook?: string;
  Status?: string | null;
  Plataforma?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  // Pattern: [{_meta, items}] — context wraps whole JSON in array
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  // Pattern: {_meta, items} — raw object directly
  if (!Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function safeDate(primary: string | null | undefined, fallback: string): Date {
  if (primary) {
    const d = new Date(primary);
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(fallback);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

// ─── Chronicle entry ──────────────────────────────────────────────────────────

type SourceKey = 'research' | 'deep-dives' | 'reunioes' | 'decisoes' | 'conteudo';

interface ChronicleEntry {
  id: string;
  title: string;
  date: Date;
  source: SourceKey;
  status?: string;
  url?: string;
}

const SOURCE_ICONS: Record<SourceKey, string> = {
  research: 'search',
  'deep-dives': 'analytics',
  reunioes: 'groups',
  decisoes: 'gavel',
  conteudo: 'edit_note',
};

const SOURCE_LABELS: Record<SourceKey, string> = {
  research: 'Research',
  'deep-dives': 'Deep Dive',
  reunioes: 'Reunião',
  decisoes: 'Decisão',
  conteudo: 'Conteúdo',
};

const SOURCE_COLORS: Record<SourceKey, string> = {
  research: 'text-accent-blue border-accent-blue/30 bg-accent-blue/5',
  'deep-dives': 'text-accent-purple border-accent-purple/30 bg-accent-purple/5',
  reunioes: 'text-brand-mint border-brand-mint/30 bg-brand-mint/5',
  decisoes: 'text-accent-orange border-accent-orange/30 bg-accent-orange/5',
  conteudo: 'text-accent-red border-accent-red/30 bg-accent-red/5',
};

const FILTER_LABELS = ['Todos', 'Research', 'Deep Dives', 'Reuniões', 'Decisões', 'Conteúdo'];
const FILTER_TO_SOURCE: Record<string, SourceKey> = {
  Research: 'research',
  'Deep Dives': 'deep-dives',
  'Reuniões': 'reunioes',
  Decisões: 'decisoes',
  Conteúdo: 'conteudo',
};

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export function ChronicleView({ className }: { className?: string }) {
  const { research, deep_dives, reunioes, decisions, content } = useNotionData();
  const [filter, setFilter] = useState('Todos');
  const [page, setPage] = useState(1);

  // Build merged entries
  const allEntries = useMemo<ChronicleEntry[]>(() => {
    const entries: ChronicleEntry[] = [];

    extractItems<RawResearchItem>(research.items).forEach(item => {
      entries.push({
        id: `r-${item._id}`,
        title: item.Name || 'Sem título',
        date: safeDate(item.Data, item._created_time),
        source: 'research',
        url: item._url,
      });
    });

    extractItems<RawDeepDiveItem>(deep_dives.items).forEach(item => {
      entries.push({
        id: `d-${item._id}`,
        title: item.Name || 'Sem título',
        date: safeDate(item['Data Análise'], item._created_time),
        source: 'deep-dives',
        status: item.Status ?? undefined,
        url: item._url,
      });
    });

    extractItems<RawReuniaoItem>(reunioes.items).forEach(item => {
      entries.push({
        id: `m-${item._id}`,
        title: item.Name || 'Sem título',
        date: safeDate(item.Data, item._created_time),
        source: 'reunioes',
        status: item.Status ?? undefined,
        url: item._url,
      });
    });

    extractItems<RawDecisionItem>(decisions.items).forEach(item => {
      entries.push({
        id: `dec-${item._id}`,
        title: item.Name || 'Sem título',
        date: safeDate(item.data, item._created_time),
        source: 'decisoes',
        status: item.Status ?? undefined,
        url: item._url,
      });
    });

    extractItems<RawContentItem>(content.items).forEach(item => {
      entries.push({
        id: `c-${item._id}`,
        title: item.Hook || item.Name || 'Sem título',
        date: safeDate(item._created_time, item._created_time),
        source: 'conteudo',
        status: item.Status ?? undefined,
        url: item._url,
      });
    });

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [research.items, deep_dives.items, reunioes.items, decisions.items, content.items]);

  const filtered = useMemo<ChronicleEntry[]>(() => {
    if (filter === 'Todos') return allEntries;
    const src = FILTER_TO_SOURCE[filter];
    return src ? allEntries.filter(e => e.source === src) : allEntries;
  }, [allEntries, filter]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > paginated.length;

  const isLoading = research.isLoading || deep_dives.isLoading || reunioes.isLoading;

  const handleFilterChange = (v: string) => {
    setFilter(v);
    setPage(1);
  };

  if (isLoading && allEntries.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-border-panel rounded-sm h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500', className)}>
      <FilterPills
        options={FILTER_LABELS}
        value={filter}
        onChange={handleFilterChange}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon="history"
          title="Nenhuma atividade encontrada"
          description="Adicione itens ao Notion para ver o histórico de atividades aqui."
        />
      ) : (
        <>
          <TimelineList>
            {paginated.map(entry => (
              <TimelineItem
                key={entry.id}
                title={entry.title}
                timestamp={formatRelative(entry.date)}
                badge={
                  <span
                    className={cn(
                      'text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm',
                      SOURCE_COLORS[entry.source]
                    )}
                  >
                    {SOURCE_LABELS[entry.source]}
                  </span>
                }
              >
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Icon
                    name={SOURCE_ICONS[entry.source]}
                    size="xs"
                    className="text-text-secondary"
                  />
                  {entry.status && <PipelineBadge status={entry.status} />}
                  {entry.url && (
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-mint hover:text-brand-mint/70 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
                      aria-label="Abrir no Notion"
                    >
                      <Icon name="open_in_new" size="xs" />
                    </a>
                  )}
                </div>
              </TimelineItem>
            ))}
          </TimelineList>

          {hasMore && (
            <button
              onClick={() => setPage(p => p + 1)}
              className="w-full py-2 text-[9px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel rounded-sm hover:text-text-primary hover:border-text-secondary/50 transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
            >
              Mostrar mais ({filtered.length - paginated.length} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
