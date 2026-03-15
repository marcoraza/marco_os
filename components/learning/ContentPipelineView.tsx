// components/learning/ContentPipelineView.tsx
// Content pipeline visualization — Sprint D

import React, { useState, useMemo } from 'react';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

// ─── Raw item shape ────────────────────────────────────────────────────────────

interface RawContentItem {
  _id: string;
  _url?: string;
  _created_time: string;
  _edited_time?: string;
  Name?: string;
  Hook?: string;
  Status?: string | null;
  Etapa?: string | null;
  Plataforma?: string | null;
  CTA?: string | null;
  'Publicado em'?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  if (!Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function getItemStatus(item: RawContentItem): string {
  return item.Status || item.Etapa || 'Sem Status';
}

function getItemDate(item: RawContentItem): string {
  return item['Publicado em'] || item._edited_time || item._created_time;
}

// Default pipeline order
const DEFAULT_STAGES = ['Ideia', 'Rascunho', 'Gravado', 'Editado', 'Publicado'];

// ─── Component ────────────────────────────────────────────────────────────────

export function ContentPipelineView({ className }: { className?: string }) {
  const { content } = useNotionData();
  const [filter, setFilter] = useState('Todos');

  const items = extractItems<RawContentItem>(content.items);

  // Collect unique statuses that exist in data
  const existingStatuses = useMemo(() => {
    const seen = new Set<string>();
    items.forEach(item => {
      const s = getItemStatus(item);
      if (s && s !== 'Sem Status') seen.add(s);
    });
    // Merge with default stages, keeping default order first
    const merged: string[] = [];
    DEFAULT_STAGES.forEach(s => { if (seen.has(s)) merged.push(s); });
    seen.forEach(s => { if (!DEFAULT_STAGES.includes(s)) merged.push(s); });
    return merged;
  }, [items]);

  const filterOptions = useMemo(
    () => ['Todos', ...existingStatuses],
    [existingStatuses]
  );

  const filtered = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) =>
        new Date(getItemDate(b)).getTime() - new Date(getItemDate(a)).getTime()
    );
    if (filter === 'Todos') return sorted;
    return sorted.filter(item => getItemStatus(item) === filter);
  }, [items, filter]);

  if (items.length === 0 && !content.isLoading) {
    return (
      <EmptyState
        icon="edit_note"
        title="Pipeline vazio"
        description="Adicione conteúdo ao Notion para visualizar o pipeline aqui."
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500', className)}>
      {filterOptions.length > 1 && (
        <FilterPills
          options={filterOptions}
          value={filter}
          onChange={setFilter}
        />
      )}

      {content.isLoading && items.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-border-panel rounded-sm h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="edit_note"
          title="Nenhum conteúdo nesta etapa"
          description="Selecione outra etapa ou adicione conteúdo ao Notion."
        />
      ) : (
        <div className="space-y-2">
          <SectionLabel>
            {filter === 'Todos' ? 'Todo o Conteúdo' : filter} ({filtered.length})
          </SectionLabel>

          {filtered.map(item => {
            const title = item.Hook || item.Name || 'Sem título';
            const status = getItemStatus(item);
            const date = getItemDate(item);

            return (
              <div
                key={item._id}
                className="bg-surface border border-border-panel rounded-sm p-3 flex items-start justify-between gap-3 hover:border-brand-mint/20 transition-colors group"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-xs font-bold text-text-primary block truncate group-hover:text-text-primary">
                    {title}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {status !== 'Sem Status' && <PipelineBadge status={status} />}
                    {item.Plataforma && (
                      <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border border-border-panel rounded-sm text-text-secondary bg-surface">
                        {item.Plataforma}
                      </span>
                    )}
                    {item.CTA && (
                      <span className="text-[8px] text-text-secondary truncate max-w-[160px]">
                        {item.CTA}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] font-mono text-text-secondary">
                    {formatRelative(date)}
                  </span>
                  {item._url && (
                    <a
                      href={item._url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-mint hover:text-brand-mint/70 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
                      aria-label="Abrir no Notion"
                    >
                      <Icon name="open_in_new" size="xs" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
