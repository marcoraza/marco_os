// components/health/ActivitiesView.tsx
// Tab "Atividades" — Health activities (Treino, Peso, Hábito)

import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { useOnboardingTrigger } from '@/hooks/useOnboardingTrigger';
import { FilterPills } from '@/components/ui/FilterPills';
import { NotionCard } from '@/components/ui/NotionCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

interface RawSaudeItem {
  _id: string;
  _url: string;
  Titulo: string | null;
  Data: string | null;
  Tipo: string | null;
  Valor: number | null;
  Duracao: number | null;
  Notas: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

const FILTER_OPTIONS = ['Todos', 'Treino', 'Peso', 'Hábito'];

// Type → badge variant mapping
const tipoVariant: Record<string, 'mint' | 'blue' | 'orange' | 'purple' | 'neutral'> = {
  Treino: 'mint',
  Peso: 'blue',
  Hábito: 'orange',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ActivitiesView({ className }: { className?: string }) {
  const { saude } = useNotionData();
  const [filter, setFilter] = useState('Todos');

  // openChat is a no-op for now — ChatPanel wiring is separate
  const openChat = useCallback(() => {}, []);

  const rawItems = extractItems<RawSaudeItem>(saude.items);

  const filteredItems =
    filter === 'Todos'
      ? rawItems
      : rawItems.filter((item) => item.Tipo === filter);

  const isEmpty = rawItems.length === 0;

  // Trigger onboarding if data is empty (once per session)
  useOnboardingTrigger(isEmpty, 'saude-atividades', openChat);

  if (saude.error) {
    return (
      <div className={cn('p-3', className)}>
        <p className="text-accent-red text-xs font-mono">{saude.error}</p>
      </div>
    );
  }

  if (saude.isLoading && rawItems.length === 0) {
    return (
      <div className={cn('p-3', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">
          Carregando...
        </span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
        <EmptyState
          icon="monitor_heart"
          title="Nenhuma atividade registrada"
          description="Registre treinos, peso e hábitos no Notion para visualizá-los aqui."
          action={{ label: 'Configurar com Frank', onClick: openChat }}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      {filteredItems.length === 0 ? (
        <EmptyState
          icon="filter_list"
          title={`Nenhuma atividade do tipo "${filter}"`}
          description="Tente outro filtro ou registre novas atividades no Notion."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredItems.map((item) => {
            const tipo = item.Tipo ?? 'Treino';
            const variant = tipoVariant[tipo] ?? 'neutral';
            const valueText =
              item.Duracao != null
                ? `${item.Duracao} min`
                : item.Valor != null
                ? String(item.Valor)
                : null;

            return (
              <NotionCard
                key={item._id}
                title={item.Titulo || '(sem título)'}
                source="notion"
                href={item._url ?? undefined}
                meta={
                  <>
                    {item.Data && (
                      <span className="text-[8px] font-mono text-text-secondary">
                        {formatRelative(item.Data)}
                      </span>
                    )}
                    <Badge variant={variant} size="sm">
                      {tipo}
                    </Badge>
                    {valueText && (
                      <span className="text-[8px] font-mono text-text-secondary">
                        {valueText}
                      </span>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ActivitiesView;
