import React, { useState, useMemo } from 'react';
import { Icon, SectionLabel } from '../ui';
import { useNotionData } from '../../contexts/NotionDataContext';
import { cn } from '../../utils/cn';
import type { ReuniaoItem, ProjetoItem, SaudeItem, ContentItem } from '../../lib/dataProvider';

// ─── extractItems helper (CRITICAL pattern) ────────────────────────────────────
function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Widget {
  id: string;
  icon: string;
  label: string;
  text: string;
  actionLabel?: string;
  priority?: 'mint' | 'orange' | 'blue';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const today = new Date().toISOString().slice(0, 10);
    return dateStr.slice(0, 10) === today;
  } catch {
    return false;
  }
}

function daysAgo(dateStr: string): number {
  if (!dateStr) return 999;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  } catch {
    return 999;
  }
}

// ─── Widget card ─────────────────────────────────────────────────────────────
interface WidgetCardProps {
  widget: Widget;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget }) => {
  const iconColor =
    widget.priority === 'mint'
      ? 'text-brand-mint'
      : widget.priority === 'orange'
        ? 'text-accent-orange'
        : 'text-accent-blue';

  return (
    <div
      className="bg-surface border border-border-panel rounded-sm p-2 flex items-center gap-2 min-h-[44px]"
      role="status"
      aria-label={widget.label}
    >
      <Icon
        name={widget.icon}
        size="sm"
        className={cn('shrink-0', iconColor)}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[8px] font-bold uppercase tracking-widest text-text-secondary leading-none mb-0.5">
          {widget.label}
        </div>
        <div className="text-[10px] text-text-primary leading-tight truncate">
          {widget.text}
        </div>
      </div>
      {widget.actionLabel && (
        <span className="text-[8px] text-brand-mint font-bold uppercase tracking-widest shrink-0">
          {widget.actionLabel}
        </span>
      )}
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
export const PredictiveWidgets: React.FC<{ inline?: boolean }> = ({ inline = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { reunioes, projetos, saude, content } = useNotionData();

  // Widget 1 — Próxima Ação Sugerida
  const actionWidget = useMemo((): Widget | null => {
    const rawReunioes = extractItems<ReuniaoItem>(reunioes.items);
    const rawProjetos = extractItems<ProjetoItem>(projetos.items);

    // Check for meetings today
    const todayMeeting = rawReunioes.find(r => isToday(r.data));
    if (todayMeeting) {
      return {
        id: 'action-meeting',
        icon: 'event',
        label: 'Próxima Ação Sugerida',
        text: `Reunião hoje: ${todayMeeting.title}`,
        actionLabel: 'Preparar',
        priority: 'orange',
      };
    }

    // Check for highest priority active project
    const priorityOrder: Record<string, number> = {
      'Alta': 0, 'High': 0, 'alta': 0,
      'Média': 1, 'Medium': 1, 'media': 1, 'média': 1,
      'Baixa': 2, 'Low': 2, 'baixa': 2,
    };
    const activeProjects = rawProjetos
      .filter(p => p.status && !['Concluído', 'Concluido', 'Done', 'Arquivado'].includes(p.status))
      .sort((a, b) => (priorityOrder[a.prioridade] ?? 3) - (priorityOrder[b.prioridade] ?? 3));

    if (activeProjects.length > 0) {
      return {
        id: 'action-project',
        icon: 'rocket_launch',
        label: 'Próxima Ação Sugerida',
        text: `Projeto prioritário: ${activeProjects[0].title}`,
        actionLabel: 'Revisar',
        priority: 'mint',
      };
    }

    return null;
  }, [reunioes.items, projetos.items]);

  // Widget 2 — Padrão Detectado (saude)
  const patternWidget = useMemo((): Widget | null => {
    const rawSaude = extractItems<SaudeItem>(saude.items);

    // Filter last 7 days
    const last7 = rawSaude.filter(s => daysAgo(s.data) <= 7);
    const activityEntries = last7.filter(
      s => s.tipo && (s.tipo.toLowerCase().includes('treino') || s.tipo.toLowerCase().includes('atividade')),
    );

    if (activityEntries.length < 2) {
      return {
        id: 'pattern-activity',
        icon: 'trending_down',
        label: 'Padrão Detectado',
        text: 'Atividade física abaixo do normal nos últimos 7 dias',
        priority: 'orange',
      };
    }

    // Check for streak break — if most recent entry is > 2 days ago
    if (rawSaude.length > 0) {
      const sorted = [...rawSaude].sort((a, b) => b.data.localeCompare(a.data));
      const latestDaysAgo = daysAgo(sorted[0]?.data ?? '');
      if (latestDaysAgo > 2) {
        return {
          id: 'pattern-streak',
          icon: 'local_fire_department',
          label: 'Padrão Detectado',
          text: `Streak interrompido há ${latestDaysAgo} dias`,
          priority: 'orange',
        };
      }
    }

    return null;
  }, [saude.items]);

  // Widget 3 — Conteúdo Pendente
  const contentWidget = useMemo((): Widget | null => {
    const rawContent = extractItems<ContentItem>(content.items);
    const pending = rawContent.filter(
      c => c.status && c.status !== 'Publicado' && c.status !== 'Publicado ✓',
    );

    if (pending.length === 0) return null;

    return {
      id: 'content-pipeline',
      icon: 'pending_actions',
      label: 'Conteúdo Pendente',
      text: `${pending.length} ${pending.length === 1 ? 'item' : 'itens'} no pipeline`,
      actionLabel: 'Ver tudo',
      priority: 'blue',
    };
  }, [content.items]);

  // Collect active widgets
  const widgets = [actionWidget, patternWidget, contentWidget].filter(Boolean) as Widget[];

  // Smart empty state — return null if nothing to show and data has loaded
  const hasData = !reunioes.isLoading && !projetos.isLoading && !saude.isLoading && !content.isLoading;
  if (hasData && widgets.length === 0) return null;

  // While loading, show skeleton
  if (!hasData && widgets.length === 0) return null;

  // Inline mode: render as a single compact card in the achievements row
  if (inline) {
    const top = widgets[0];
    if (!top) return null;
    const colorMap = { mint: 'text-brand-mint', orange: 'text-accent-orange', blue: 'text-accent-blue' };
    const iconColor = colorMap[top.priority ?? 'mint'];
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-sm border shrink-0 bg-surface border-brand-mint/20 hover:border-brand-mint/40 transition-all">
        <Icon name={top.icon} size="xs" className={iconColor} />
        <div>
          <p className="text-[9px] font-bold leading-none text-text-primary">{top.label}</p>
          <p className="text-[7px] text-text-secondary/60 leading-none mt-0.5">{top.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Section header with collapse toggle */}
      <button
        className={cn(
          'flex items-center justify-between w-full min-h-[44px] px-1 py-1',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm',
          'transition-colors duration-200',
        )}
        onClick={() => setCollapsed(v => !v)}
        aria-expanded={!collapsed}
        aria-label="Expandir ou recolher insights"
      >
        <SectionLabel>INSIGHTS</SectionLabel>
        <Icon
          name={collapsed ? 'expand_more' : 'expand_less'}
          size="sm"
          className="text-text-secondary"
        />
      </button>

      {/* Widgets */}
      {!collapsed && (
        <div className="flex flex-col gap-1.5">
          {widgets.map(w => (
            <WidgetCard key={w.id} widget={w} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveWidgets;
