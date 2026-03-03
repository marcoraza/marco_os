// components/learning/LearningExploration.tsx
// Tab "Exploração" — Research Pipeline + Deep Dives

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { NotionCard } from '@/components/ui/NotionCard';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawResearchItem {
  _id: string;
  _url: string;
  Name: string;
  Data: string | null;
  Plataforma: string | null;
  Qualidade: string | null;
  Reprocessar?: boolean;
}

interface RawDeepDiveItem {
  _id: string;
  _url: string;
  Name: string;
  Status: string;
  Plataforma: string | null;
  Rating: string | null;
  'Data Análise'?: string | null;
}

// JSON files wrap items in { _meta: {...}, items: [...] }
// The DataProvider caches the full object; extract items here.
function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

const FILTER_OPTIONS = ['Todos', 'Pendente', 'Na Fila', 'Em Execução', 'Analisado'];

// ─── Component ────────────────────────────────────────────────────────────────

export function LearningExploration({ className }: { className?: string }) {
  const { research, deep_dives } = useNotionData();
  const [filter, setFilter] = useState('Todos');

  const isLoading = research.isLoading && deep_dives.isLoading;
  const error = research.error ?? deep_dives.error;

  const researchItems = extractItems<RawResearchItem>(research.items);
  const deepDiveItems = extractItems<RawDeepDiveItem>(deep_dives.items);

  // Filter deep dives by status
  const filteredDeepDives =
    filter === 'Todos'
      ? deepDiveItems
      : deepDiveItems.filter((item) => item.Status === filter);

  // Research items have no Status field — always shown when "Todos",
  // hidden when filtering by a specific status
  const filteredResearch = filter === 'Todos' ? researchItems : [];

  if (error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (isLoading && researchItems.length === 0 && deepDiveItems.length === 0) {
    return (
      <div className={cn('p-3', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">
          Carregando...
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <FilterPills
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
      />

      {/* Research Pipeline */}
      <div className="flex flex-col gap-2">
        <SectionLabel>RESEARCH PIPELINE</SectionLabel>

        {filteredResearch.length === 0 && filter === 'Todos' && (
          <EmptyState
            icon="science"
            title="Nenhum research encontrado"
            description="Itens de research aparecerão aqui após sincronização com o Notion."
          />
        )}

        {filteredResearch.map((item) => (
          <NotionCard
            key={item._id}
            title={item.Name || '(sem título)'}
            source="notion"
            href={item._url ?? undefined}
            meta={
              <>
                <PipelineBadge status={item.Reprocessar ? 'Pendente' : 'Analisado'} />
                {item.Data && (
                  <span className="text-[8px] font-mono text-text-secondary">
                    {formatRelative(item.Data)}
                  </span>
                )}
                {item.Plataforma && (
                  <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel px-2 py-0.5 rounded-sm">
                    {item.Plataforma}
                  </span>
                )}
              </>
            }
          />
        ))}
      </div>

      {/* Deep Dives */}
      <div className="flex flex-col gap-2">
        <SectionLabel>DEEP DIVES</SectionLabel>

        {filteredDeepDives.length === 0 && (
          <EmptyState
            icon="book_2"
            title="Nenhum deep dive encontrado"
            description={
              filter !== 'Todos'
                ? `Nenhum deep dive com status "${filter}".`
                : 'Itens de deep dive aparecerão aqui após sincronização com o Notion.'
            }
          />
        )}

        {filteredDeepDives.map((item) => (
          <NotionCard
            key={item._id}
            title={item.Name || '(sem título)'}
            source="notion"
            href={item._url ?? undefined}
            meta={
              <>
                <PipelineBadge status={item.Status || 'Pendente'} />
                {item['Data Análise'] && (
                  <span className="text-[8px] font-mono text-text-secondary">
                    {formatRelative(item['Data Análise'])}
                  </span>
                )}
                {item.Plataforma && (
                  <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel px-2 py-0.5 rounded-sm">
                    {item.Plataforma}
                  </span>
                )}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default LearningExploration;
