// components/crm/ReunioesView.tsx
// Tab "Reuniões" — Meetings list (upcoming + past)

import React from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { NotionCard } from '@/components/ui/NotionCard';
import { PipelineBadge } from '@/components/ui/PipelineBadge';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawReuniaoItem {
  _id: string;
  _url: string;
  Name: string;
  Data: string | null;
  Participantes: string | null;
  Status: string | null;
  Briefing?: string | null;
  'Follow-up'?: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReunioesView({ className }: { className?: string }) {
  const { reunioes } = useNotionData();
  const rawItems = extractItems<RawReuniaoItem>(reunioes.items);

  const now = new Date();

  // Sort by date descending (most recent first)
  const sorted = [...rawItems].sort((a, b) => {
    const da = parseDate(a.Data)?.getTime() ?? 0;
    const db = parseDate(b.Data)?.getTime() ?? 0;
    return db - da;
  });

  const upcoming = sorted.filter((item) => {
    const d = parseDate(item.Data);
    return d ? d > now : false;
  });

  const past = sorted.filter((item) => {
    const d = parseDate(item.Data);
    return !d || d <= now;
  });

  if (reunioes.error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{reunioes.error}</p>
      </div>
    );
  }

  if (reunioes.isLoading && rawItems.length === 0) {
    return (
      <div className={cn('p-3', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">
          Carregando...
        </span>
      </div>
    );
  }

  if (rawItems.length === 0) {
    return (
      <div className={cn('', className)}>
        <EmptyState
          icon="event_busy"
          title="Nenhuma reunião encontrada"
          description="Reuniões aparecerão aqui após sincronização com o Notion."
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Upcoming meetings */}
      {upcoming.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel>PRÓXIMAS REUNIÕES</SectionLabel>
          {upcoming.map((item) => (
            <MeetingCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Past meetings */}
      {past.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionLabel>REUNIÕES REALIZADAS</SectionLabel>
          {past.map((item) => (
            <MeetingCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function MeetingCard({ item }: { item: RawReuniaoItem }) {
  return (
    <NotionCard
      title={item.Name || '(sem título)'}
      source="notion"
      href={item._url ?? undefined}
      meta={
        <>
          {item.Data && (
            <span className="text-[8px] font-mono text-text-secondary">
              {formatRelative(item.Data)}
            </span>
          )}
          {item.Participantes && (
            <span className="text-[8px] text-text-secondary truncate max-w-[120px]">
              {item.Participantes}
            </span>
          )}
          <PipelineBadge status={item.Status ?? 'Agendada'} />
        </>
      }
    />
  );
}

export default ReunioesView;
