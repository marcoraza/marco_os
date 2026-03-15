// components/learning/CreatorsRoster.tsx
// Tab "Criadores" — Creators roster from criadores.json

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { FilterPills } from '@/components/ui/FilterPills';
import { NotionCard } from '@/components/ui/NotionCard';
import { Badge } from '@/components/ui/Badge';
import { StatusDot } from '@/components/ui/StatusDot';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawCriadorItem {
  _id: string;
  _url: string;
  Name: string;
  Plataforma: string | string[] | null;
  'Ativo no radar': boolean;
  'Research Count': number | null;
  'Deep Dives Count': number | null;
  Tier?: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

function normalizePlataforma(plataforma: string | string[] | null): string {
  if (!plataforma) return '';
  if (Array.isArray(plataforma)) return plataforma.join(', ');
  return plataforma;
}

const FILTER_OPTIONS = ['Todos', 'Ativo no Radar'];

// ─── Component ────────────────────────────────────────────────────────────────

export function CreatorsRoster({ className }: { className?: string }) {
  const { criadores } = useNotionData();
  const [filter, setFilter] = useState('Todos');

  const rawItems = extractItems<RawCriadorItem>(criadores.items);

  const filteredItems =
    filter === 'Ativo no Radar'
      ? rawItems.filter((item) => item['Ativo no radar'] === true)
      : rawItems;

  if (criadores.error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{criadores.error}</p>
      </div>
    );
  }

  if (criadores.isLoading && rawItems.length === 0) {
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
        onChange={setFilter}
      />

      {filteredItems.length === 0 && (
        <EmptyState
          icon="person_search"
          title="Nenhum criador encontrado"
          description={
            filter === 'Ativo no Radar'
              ? 'Nenhum criador marcado como ativo no radar.'
              : 'Criadores aparecerão aqui após sincronização com o Notion.'
          }
        />
      )}

      {filteredItems.map((item) => {
        const plataforma = normalizePlataforma(item.Plataforma);
        const researchCount = item['Research Count'] ?? 0;
        const tier = item.Tier;
        const isActive = item['Ativo no radar'] === true;

        return (
          <NotionCard
            key={item._id}
            title={item.Name || '(sem nome)'}
            source="notion"
            href={item._url ?? undefined}
            meta={
              <div className="flex flex-wrap items-center gap-2">
                {isActive && <StatusDot color="mint" />}
                {plataforma && (
                  <Badge variant="blue" size="sm">
                    {plataforma}
                  </Badge>
                )}
                {tier && (
                  <Badge variant="orange" size="sm">
                    {tier}
                  </Badge>
                )}
                <span className="text-[8px] font-mono text-text-secondary">
                  {researchCount} research
                </span>
              </div>
            }
          />
        );
      })}
    </div>
  );
}

export default CreatorsRoster;
