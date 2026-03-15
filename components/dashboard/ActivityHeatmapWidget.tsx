// components/dashboard/ActivityHeatmapWidget.tsx
import React, { useState, useMemo } from 'react';
import { HeatmapGrid } from '@/components/ui/HeatmapGrid';
import { Icon } from '@/components/ui/Icon';
import { useNotionData } from '@/contexts/NotionDataContext';
import { getDayKey } from '@/utils/dateUtils';

// Safe extractor for raw JSON format: {_meta, items}
function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function buildHeatmapData(
  saudeItems: Record<string, unknown>[],
  projetosItems: Record<string, unknown>[],
  contentItems: Record<string, unknown>[]
): Record<string, 0 | 1 | 2 | 3 | 4> {
  const counts: Record<string, number> = {};
  const ninety = new Date();
  ninety.setDate(ninety.getDate() - 90);

  const addActivity = (dateStr: string | undefined) => {
    if (!dateStr) return;
    const d = new Date(dateStr);
    if (d < ninety) return;
    const key = getDayKey(d);
    counts[key] = (counts[key] ?? 0) + 1;
  };

  for (const item of saudeItems) {
    addActivity((item['Data'] ?? item['data']) as string | undefined);
  }
  for (const item of projetosItems) {
    const status = (item['Status'] ?? item['status']) as string | undefined;
    if (status === 'Concluído' || status === 'Concluido') {
      addActivity((item['Deadline'] ?? item['deadline'] ?? item['Data Início'] ?? item['data_inicio']) as string | undefined);
    }
  }
  for (const item of contentItems) {
    const status = (item['Status'] ?? item['status']) as string | undefined;
    if (status === 'Publicado' || status === 'Published') {
      addActivity((item['Data'] ?? item['data']) as string | undefined);
    }
  }

  const result: Record<string, 0 | 1 | 2 | 3 | 4> = {};
  for (const [key, count] of Object.entries(counts)) {
    result[key] = Math.min(4, count) as 0 | 1 | 2 | 3 | 4;
  }
  return result;
}

function calculateStreak(data: Record<string, 0 | 1 | 2 | 3 | 4>): number {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  while (true) {
    const key = getDayKey(cursor);
    if ((data[key] ?? 0) > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function ActivityHeatmapWidget() {
  const [expanded, setExpanded] = useState(false);
  const { saude, projetos, content } = useNotionData();

  const saudeItems = useMemo(() => extractItems<Record<string, unknown>>(saude.items), [saude.items]);
  const projetosItems = useMemo(() => extractItems<Record<string, unknown>>(projetos.items), [projetos.items]);
  const contentItems = useMemo(() => extractItems<Record<string, unknown>>(content.items), [content.items]);

  const heatmapData = useMemo(
    () => buildHeatmapData(saudeItems, projetosItems, contentItems),
    [saudeItems, projetosItems, contentItems]
  );

  const streak = useMemo(() => calculateStreak(heatmapData), [heatmapData]);
  const isLoading = saude.isLoading && projetos.isLoading;
  const totalActivities = Object.values(heatmapData).reduce((a, b) => a + b, 0);

  return (
    <div
      className="bg-surface border border-border-panel rounded-sm p-2 flex flex-col cursor-pointer"
      onClick={() => setExpanded(v => !v)}
      role="button"
      aria-expanded={expanded}
      tabIndex={0}
    >
      {/* Collapsed: single row — label + streak + total + arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-bold uppercase tracking-widest text-text-secondary">ATIVIDADE</span>
          {streak > 0 && (
            <span className="text-[7px] font-mono text-brand-mint">{streak}d streak</span>
          )}
          {!isLoading && (
            <span className="text-[7px] font-mono text-text-secondary">{totalActivities} ações</span>
          )}
        </div>
        <Icon name={expanded ? 'expand_less' : 'expand_more'} size="xs" className="text-text-secondary" />
      </div>

      {/* Expanded: full heatmap */}
      {expanded && !isLoading && (
        <div className="mt-2 overflow-hidden">
          <HeatmapGrid
            data={heatmapData}
            weeks={13}
            streakLabel={streak > 0 ? `${streak} dias seguidos` : undefined}
          />
        </div>
      )}
    </div>
  );
}

export default ActivityHeatmapWidget;
