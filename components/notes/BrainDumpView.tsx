// components/notes/BrainDumpView.tsx
// Tab "Brain Dump" — Captured thoughts from brain-dump.json

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { NotionCard } from '@/components/ui/NotionCard';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawBrainDumpItem {
  _id: string;
  _url: string;
  Name: string | null;
  Data: string | null;
  Status: string | null;
  Destino: string | null;
  Tipo?: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

const FILTER_OPTIONS = ['Todos', 'Pendente', 'Processado'];

// Map raw Status values to filter pill values
function matchesFilter(status: string | null, filter: string): boolean {
  if (filter === 'Todos') return true;
  if (filter === 'Pendente') return status === 'Pendente' || status === 'Novo';
  if (filter === 'Processado') return status === 'Processado';
  return false;
}

const PAGE_SIZE = 50;

// ─── DestinoBadge ─────────────────────────────────────────────────────────────

function DestinoBadge({ destino }: { destino: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-accent-purple text-[8px] font-bold uppercase tracking-widest">
      <Icon name="arrow_forward" size="xs" className="text-accent-purple" />
      {destino}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BrainDumpView({ className }: { className?: string }) {
  const { brain_dump } = useNotionData();
  const [filter, setFilter] = useState('Todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const rawItems = extractItems<RawBrainDumpItem>(brain_dump.items);

  // Sort by date descending
  const sorted = [...rawItems].sort((a, b) => {
    const da = a.Data ? new Date(a.Data).getTime() : 0;
    const db = b.Data ? new Date(b.Data).getTime() : 0;
    return db - da;
  });

  const filteredItems = sorted.filter((item) =>
    matchesFilter(item.Status, filter)
  );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > visibleCount;

  if (brain_dump.error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{brain_dump.error}</p>
      </div>
    );
  }

  if (brain_dump.isLoading && rawItems.length === 0) {
    return (
      <div className={cn('p-3', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">
          Carregando...
        </span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <FilterPills
        options={FILTER_OPTIONS}
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setVisibleCount(PAGE_SIZE); // reset pagination on filter change
        }}
      />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon="lightbulb"
          title={
            filter === 'Todos'
              ? 'Nenhum item no Brain Dump'
              : `Nenhum item "${filter}"`
          }
          description={
            filter === 'Todos'
              ? 'Itens capturados aparecerão aqui após sincronização com o Notion.'
              : 'Tente outro filtro.'
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {visibleItems.map((item) => (
              <NotionCard
                key={item._id}
                title={item.Name || '(sem título)'}
                source="notion"
                href={item._url ?? undefined}
                meta={
                  <>
                    <PipelineBadge status={item.Status ?? 'Pendente'} />
                    {item.Destino && (
                      <DestinoBadge destino={item.Destino} />
                    )}
                    {item.Data && (
                      <span className="text-[8px] font-mono text-text-secondary">
                        {formatRelative(item.Data)}
                      </span>
                    )}
                  </>
                }
              />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className={cn(
                'self-start mt-1 px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest',
                'bg-surface border border-border-panel text-text-secondary',
                'hover:text-text-primary hover:border-brand-mint/30 transition-all',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                'min-h-[44px] flex items-center'
              )}
            >
              Mostrar mais ({filteredItems.length - visibleCount} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default BrainDumpView;
