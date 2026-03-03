// components/planner/NotionProjectsView.tsx
// Tab "Projetos" — Notion projects + checklists per project

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { NotionCard } from '@/components/ui/NotionCard';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawProjetoItem {
  _id: string;
  _url: string;
  Name: string;
  Status: string | null;
  Prioridade: string | null;
  Deadline: string | null;
  Progresso: number | null;
  Tipo: string | null;
}

interface RawChecklistItem {
  _id: string;
  _url: string;
  Name: string;
  Status: string | null;
  Projeto: string | null;
  Prazo: string | null;
  Prioridade: string | null;
}

interface RawContentItem {
  _id: string;
  _url: string;
  Name: string;
  Projeto: string | null;
  Tipo?: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

const FILTER_OPTIONS = ['Todos', 'Conteúdo'];

// ─── Component ────────────────────────────────────────────────────────────────

export function NotionProjectsView({ className }: { className?: string }) {
  const { projetos, checklist, content } = useNotionData();
  const [filter, setFilter] = useState('Todos');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const rawProjetos = extractItems<RawProjetoItem>(projetos.items);
  const rawChecklists = extractItems<RawChecklistItem>(checklist.items);
  const rawContent = extractItems<RawContentItem>(content.items);

  // Content filter: show only projects that have a related content item
  const contentProjectNames = new Set(
    rawContent.map((c) => c.Projeto).filter(Boolean) as string[]
  );

  const filteredProjetos =
    filter === 'Conteúdo'
      ? rawProjetos.filter(
          (p) =>
            p.Tipo === 'Conteúdo' ||
            (p.Name && contentProjectNames.has(p.Name))
        )
      : rawProjetos.filter((p) => p.Name && p.Name.trim() !== '');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getChecklistsForProject = (projectName: string): RawChecklistItem[] =>
    rawChecklists.filter((c) => c.Projeto === projectName);

  const isLoading = projetos.isLoading && rawProjetos.length === 0;
  const error = projetos.error;

  if (error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-3', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">
          Carregando...
        </span>
      </div>
    );
  }

  if (filteredProjetos.length === 0) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
        <EmptyState
          icon="folder_open"
          title="Nenhum projeto encontrado"
          description={
            filter === 'Conteúdo'
              ? 'Nenhum projeto de conteúdo sincronizado.'
              : 'Projetos aparecerão aqui após sincronização com o Notion.'
          }
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <div className="flex flex-col gap-2">
        {filteredProjetos.map((projeto) => {
          const checklists = getChecklistsForProject(projeto.Name);
          const isExpanded = expandedIds.has(projeto._id);

          return (
            <div key={projeto._id}>
              <NotionCard
                title={projeto.Name}
                source="notion"
                href={projeto._url ?? undefined}
                actions={
                  checklists.length > 0 ? (
                    <button
                      onClick={() => toggleExpand(projeto._id)}
                      aria-expanded={isExpanded}
                      aria-label="Expandir checklists"
                      className={cn(
                        'text-text-secondary hover:text-text-primary transition-colors rounded-sm',
                        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                        'min-h-[44px] flex items-center px-1'
                      )}
                    >
                      <Icon
                        name={isExpanded ? 'expand_less' : 'expand_more'}
                        size="sm"
                      />
                    </button>
                  ) : undefined
                }
                meta={
                  <>
                    <PipelineBadge status={projeto.Status ?? 'Pendente'} />
                    {projeto.Prioridade && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-accent-orange border border-accent-orange/30 px-2 py-0.5 rounded-sm">
                        {projeto.Prioridade}
                      </span>
                    )}
                    {projeto.Deadline && (
                      <span className="text-[8px] font-mono text-text-secondary">
                        {formatRelative(projeto.Deadline)}
                      </span>
                    )}
                    <SourceBadge source="notion" />
                  </>
                }
              >
                {isExpanded && checklists.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 border-t border-border-panel pt-2">
                    {checklists.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-2 text-xs text-text-secondary"
                      >
                        <div
                          className={cn(
                            'w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center',
                            item.Status === 'Concluído'
                              ? 'border-brand-mint bg-brand-mint/10'
                              : 'border-border-panel'
                          )}
                        >
                          {item.Status === 'Concluído' && (
                            <Icon name="check" size="xs" className="text-brand-mint" />
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-xs',
                            item.Status === 'Concluído'
                              ? 'text-text-secondary line-through'
                              : 'text-text-primary'
                          )}
                        >
                          {item.Name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </NotionCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotionProjectsView;
