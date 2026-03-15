// components/learning/DecisionJournalView.tsx
// Decision Journal from Notion DB — Sprint D

import React, { useMemo } from 'react';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { NotionCard } from '@/components/ui/NotionCard';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { cn } from '@/utils/cn';
import { extractProviderItems } from '@/lib/providerData';

// ─── Raw item shape ────────────────────────────────────────────────────────────

interface RawDecisionItem {
  _id: string;
  _url?: string;
  _created_time: string;
  Name?: string;
  Titulo?: string;
  data?: string | null;
  Status?: string | null;
  contexto?: string | null;
  tags?: string[] | null;
  impacto?: string | null;
  decisao_tomada?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DecisionJournalView({
  className,
  searchQuery = '',
  limit,
  title = 'Decisões',
}: {
  className?: string;
  searchQuery?: string;
  limit?: number;
  title?: string;
}) {
  const { decisions } = useNotionData();

  const items = extractProviderItems<RawDecisionItem>(decisions.items);

  const sorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return [...items]
      .filter((item) => {
        if (!query) return true;
        return [
          item.Name,
          item.Titulo,
          item.contexto,
          item.decisao_tomada,
          ...(item.tags ?? []),
        ].some((value) => value?.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const da = new Date(a.data || a._created_time).getTime();
        const db = new Date(b.data || b._created_time).getTime();
        return db - da;
      })
      .slice(0, limit);
  }, [items, limit, searchQuery]);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon="gavel"
        title="Nenhuma decisão registrada"
        description="Decisões aparecem aqui quando adicionadas ao Notion"
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <SectionLabel>{title} ({sorted.length})</SectionLabel>

      <div className="space-y-2">
        {sorted.map(item => {
          const title = item.Name || item.Titulo || 'Sem título';
          const dateStr = item.data || item._created_time;

          return (
            <NotionCard
              key={item._id}
              title={title}
              source="notion"
              href={item._url}
              meta={
                <>
                  <span className="text-[8px] font-mono text-text-secondary">
                    {formatRelative(dateStr)}
                  </span>
                  {item.Status && <PipelineBadge status={item.Status} />}
                  {item.impacto && (
                    <span className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 border border-border-panel rounded-sm text-text-secondary bg-surface">
                      {item.impacto}
                    </span>
                  )}
                </>
              }
            >
              {item.contexto && (
                <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                  {item.contexto}
                </p>
              )}
              {item.decisao_tomada && !item.contexto && (
                <p className="text-xs text-text-secondary line-clamp-2 mt-1">
                  {item.decisao_tomada}
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 bg-surface border border-border-panel rounded-sm text-text-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </NotionCard>
          );
        })}
      </div>
    </div>
  );
}
