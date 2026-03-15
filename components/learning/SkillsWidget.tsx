import React from 'react';
import { SectionLabel, EmptyState, Icon } from '../ui';
import { useNotionData } from '../../contexts/NotionDataContext';
import { cn } from '../../utils/cn';

interface SkillItem {
  id: string;
  title?: string;
  Nome?: string;
  Name?: string;
  Progresso?: number;
  Nivel?: string;
  Prioridade?: string;
}

function extractItems(data: any): SkillItem[] {
  if (!data?.items) return [];
  if (Array.isArray(data.items) && data.items.length > 0 && data.items[0]?.items) {
    return data.items[0].items ?? [];
  }
  return Array.isArray(data.items) ? data.items : [];
}

export function SkillsWidget() {
  const { skills } = useNotionData();
  const items = extractItems(skills);

  if (skills.isLoading && items.length === 0) {
    return (
      <div className="mt-4 p-3">
        <span className="animate-pulse text-text-secondary text-xs font-mono">Carregando...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface border border-border-panel rounded-sm p-4 mt-4">
        <SectionLabel className="mb-3">HABILIDADES</SectionLabel>
        <EmptyState
          icon="psychology"
          message="Nenhuma habilidade registrada"
        />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-4 mt-4">
      <SectionLabel className="mb-3">HABILIDADES</SectionLabel>
      <div className="flex flex-col gap-3">
        {items.map((skill) => {
          const name = skill.Nome ?? skill.Name ?? skill.title ?? 'Sem nome';
          const progress = skill.Progresso ?? 0;
          const nivel = skill.Nivel ?? '';

          return (
            <div key={skill.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-primary font-bold">{name}</span>
                <span className="text-[8px] font-mono text-text-secondary">
                  {nivel && `${nivel} · `}{progress}%
                </span>
              </div>
              <div className="w-full bg-border-panel h-1.5 rounded-sm overflow-hidden">
                <div
                  className="bg-brand-mint h-full rounded-sm transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SkillsWidget;
