// components/planner/NotionProjectsView.tsx
// Tab "Projetos" — Kanban visual com 3 colunas: Ativo / Pausado / Concluído

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { useNotionData } from '@/contexts/NotionDataContext';
import { formatRelative } from '@/utils/dateUtils';
import { FilterPills } from '@/components/ui/FilterPills';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';

// ─── Raw JSON field shapes ────────────────────────────────────────────────────

export interface RawProjetoItem {
  _id: string;
  _url: string;
  Name: string;
  Status: string | null;
  Prioridade: string | null;
  Deadline: string | null;
  Progresso: number | null;
  Tipo: string | null;
}

function extractItems<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const obj = raw as Record<string, unknown> | null;
  if (obj?.items && Array.isArray(obj.items)) return obj.items as T[];
  return [];
}

// ─── Kanban column config ─────────────────────────────────────────────────────

type ColumnId = 'Ativo' | 'Pausado' | 'Concluído';

interface ColumnConfig {
  id: ColumnId;
  label: string;
  headerClass: string;
  cardOpacity?: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'Ativo',     label: 'Ativo',     headerClass: 'text-brand-mint' },
  { id: 'Pausado',   label: 'Pausado',   headerClass: 'text-accent-orange' },
  { id: 'Concluído', label: 'Concluído', headerClass: 'text-text-secondary', cardOpacity: 'opacity-60' },
];

function resolveColumn(status: string | null): ColumnId {
  if (status === 'Pausado')   return 'Pausado';
  if (status === 'Concluído') return 'Concluído';
  return 'Ativo'; // "Ativo", null, or any other value
}

const FILTER_OPTIONS = ['Todos', 'Conteúdo'];

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  projeto: RawProjetoItem;
  opacity?: string;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

function ProjectCard({ projeto, opacity, onDragStart }: ProjectCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, projeto._id)}
      className={cn(
        'bg-bg-base border border-border-panel rounded-sm p-3',
        'cursor-grab active:cursor-grabbing',
        'hover:border-text-secondary/40 transition-colors',
        opacity
      )}
    >
      {/* linha 1: nome */}
      <p className="text-xs font-bold text-text-primary truncate">{projeto.Name}</p>

      {/* linha 2: badges */}
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {projeto.Tipo && (
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary border border-border-panel px-1.5 py-0.5 rounded-sm">
            {projeto.Tipo}
          </span>
        )}
        {projeto.Prioridade && (
          <span className="text-[8px] font-bold uppercase tracking-widest text-accent-orange border border-accent-orange/30 px-1.5 py-0.5 rounded-sm">
            {projeto.Prioridade}
          </span>
        )}
        {projeto.Deadline && (
          <span className="text-[8px] font-mono text-text-secondary">
            {formatRelative(projeto.Deadline)}
          </span>
        )}
      </div>

      {/* linha 3: progresso (só se Progresso > 0) */}
      {projeto.Progresso != null && projeto.Progresso > 0 && (
        <div className="mt-2">
          <div className="h-0.5 bg-border-panel rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-mint rounded-full transition-all"
              style={{ width: `${projeto.Progresso}%` }}
            />
          </div>
          <span className="text-[8px] font-mono text-text-secondary mt-0.5 block">
            {projeto.Progresso}% concluído
          </span>
        </div>
      )}

      {/* link para Notion */}
      {projeto._url && (
        <a
          href={projeto._url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Icon name="open_in_new" size="xs" /> Notion
        </a>
      )}
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  config: ColumnConfig;
  cards: RawProjetoItem[];
  isDragOver: boolean;
  cardOpacity?: string;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: ColumnId) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

function KanbanColumn({
  config,
  cards,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, config.id)}
      className={cn(
        'flex-1 min-w-0 flex flex-col gap-2 p-3 rounded-sm border transition-colors',
        isDragOver
          ? 'border-brand-mint/50 bg-brand-mint/5'
          : 'border-border-panel bg-surface'
      )}
    >
      {/* Header da coluna */}
      <div className="flex items-center justify-between mb-1">
        <span className={cn('text-[9px] font-black uppercase tracking-widest', config.headerClass)}>
          {config.label}
        </span>
        <span className="text-[9px] font-mono text-text-secondary bg-border-panel px-1.5 py-0.5 rounded-sm">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2">
        {cards.map((projeto) => (
          <React.Fragment key={projeto._id}>
            <ProjectCard
              projeto={projeto}
              opacity={config.cardOpacity}
              onDragStart={onDragStart}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Empty state da coluna */}
      {cards.length === 0 && (
        <div className="border border-dashed border-border-panel rounded-sm p-4 text-center">
          <span className="text-[9px] text-text-secondary">Arraste projetos aqui</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function NotionProjectsView({ className }: { className?: string }) {
  const { projetos } = useNotionData();
  const [filter, setFilter] = useState('Todos');
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const rawProjetos = extractItems<RawProjetoItem>(projetos.items);

  // Apply filter
  const filteredProjetos =
    filter === 'Conteúdo'
      ? rawProjetos.filter((p) => p.Tipo === 'Conteúdo' && p.Name && p.Name.trim() !== '')
      : rawProjetos.filter((p) => p.Name && p.Name.trim() !== '');

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumn: ColumnId) => {
    e.preventDefault();
    if (!draggedId) return;
    setLocalStatus((prev) => ({ ...prev, [draggedId]: targetColumn }));
    setDraggedId(null);
    setDragOverColumn(null);
  };

  // Split projects into columns
  const columnCards: Record<ColumnId, RawProjetoItem[]> = {
    Ativo: [],
    Pausado: [],
    'Concluído': [],
  };

  for (const projeto of filteredProjetos) {
    const effectiveStatus = localStatus[projeto._id] ?? projeto.Status;
    const col = resolveColumn(effectiveStatus as string | null);
    columnCards[col].push(projeto);
  }

  const totalProjetos = filteredProjetos.length;
  const ativos = columnCards['Ativo'].length;

  const isLoading = projetos.isLoading && rawProjetos.length === 0;
  const error = projetos.error;

  if (error) {
    return (
      <div className={cn('p-4', className)}>
        <p className="text-accent-red text-xs font-mono">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <span className="animate-pulse text-text-secondary text-xs font-mono">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4 p-4 h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Projetos</h3>
          <p className="text-[10px] text-text-secondary">
            {totalProjetos} projetos · {ativos} ativos
          </p>
        </div>
        <FilterPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </div>

      {/* Empty state global */}
      {filteredProjetos.length === 0 && (
        <EmptyState
          icon="folder_open"
          title="Nenhum projeto encontrado"
          description={
            filter === 'Conteúdo'
              ? 'Nenhum projeto de conteúdo sincronizado.'
              : 'Projetos aparecerão aqui após sincronização com o Notion.'
          }
        />
      )}

      {/* Kanban board */}
      {filteredProjetos.length > 0 && (
        <div className="flex gap-3 flex-1 overflow-x-auto">
          {COLUMNS.map((col) => (
            <React.Fragment key={col.id}>
              <KanbanColumn
                config={col}
                cards={columnCards[col.id]}
                isDragOver={dragOverColumn === col.id}
                onDragOver={() => setDragOverColumn(col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={handleDrop}
                onDragStart={handleDragStart}
              />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotionProjectsView;
