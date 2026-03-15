// components/dashboard/DashboardWidgetGrid.tsx
import React, { useMemo } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import { useNotionData } from '@/contexts/NotionDataContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { cn } from '@/utils/cn';
import { formatRelative } from '@/utils/dateUtils';

// Safe extractor for raw JSON format: {_meta, items}
function extractItems<T>(raw: unknown): T[] {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.length > 0 && (raw[0] as Record<string, unknown>)?._meta) {
    return ((raw[0] as Record<string, unknown>).items ?? []) as T[];
  }
  return Array.isArray(raw) ? (raw as T[]) : [];
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Widget 1: Próximas Reuniões
function ReunioesWidget() {
  const { reunioes } = useNotionData();
  const items = useMemo(
    () => extractItems<Record<string, unknown>>(reunioes.items),
    [reunioes.items]
  );

  const today = todayKey();
  const upcoming = items
    .filter(r => {
      const d = (r['Data'] ?? r['data']) as string | undefined;
      return d && d.slice(0, 10) >= today;
    })
    .sort((a, b) => {
      const da = new Date((a['Data'] ?? a['data']) as string).getTime();
      const db = new Date((b['Data'] ?? b['data']) as string).getTime();
      return da - db;
    })
    .slice(0, 2);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col gap-2">
      <SectionLabel icon="event">PRÓXIMAS REUNIÕES</SectionLabel>
      {reunioes.isLoading ? (
        <div className="bg-border-panel animate-pulse rounded-sm h-8 w-full" />
      ) : upcoming.length === 0 ? (
        <p className="text-text-secondary text-xs">Sem reuniões</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {upcoming.map((r, i) => {
            const name = (r['Name'] ?? r['title'] ?? r['Titulo'] ?? 'Reunião') as string;
            const dataStr = (r['Data'] ?? r['data']) as string | undefined;
            const dateLabel = dataStr
              ? new Date(dataStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
              : '';
            return (
              <li key={i} className="flex items-start justify-between gap-1">
                <span className="text-[10px] text-text-primary font-bold truncate flex-1">{name}</span>
                {dateLabel && (
                  <span className="text-[8px] font-mono text-text-secondary shrink-0">{dateLabel}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <a
        href="#"
        className="text-[8px] text-brand-mint uppercase tracking-widest cursor-pointer flex items-center gap-0.5 mt-auto focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
      >
        Ver tudo <Icon name="arrow_forward" size="xs" />
      </a>
    </div>
  );
}

// Widget 2: Projetos Ativos
function ProjetosWidget() {
  const { projetos } = useNotionData();
  const items = useMemo(
    () => extractItems<Record<string, unknown>>(projetos.items),
    [projetos.items]
  );

  const priorityOrder: Record<string, number> = { Alta: 0, Media: 1, Média: 1, Baixa: 2 };

  const active = items
    .filter(p => {
      const status = (p['Status'] ?? p['status']) as string | undefined;
      return status && status !== 'Pausado' && status !== 'Concluído' && status !== 'Concluido';
    })
    .sort((a, b) => {
      const pa = (a['Prioridade'] ?? a['prioridade']) as string | undefined;
      const pb = (b['Prioridade'] ?? b['prioridade']) as string | undefined;
      return (priorityOrder[pa ?? ''] ?? 9) - (priorityOrder[pb ?? ''] ?? 9);
    })
    .slice(0, 3);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col gap-2">
      <SectionLabel icon="rocket_launch">PROJETOS ATIVOS</SectionLabel>
      {projetos.isLoading ? (
        <div className="bg-border-panel animate-pulse rounded-sm h-8 w-full" />
      ) : active.length === 0 ? (
        <p className="text-text-secondary text-xs">Sem projetos ativos</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {active.map((p, i) => {
            const name = (p['Name'] ?? p['title'] ?? p['Titulo'] ?? 'Projeto') as string;
            const status = (p['Status'] ?? p['status']) as string | undefined;
            const prioridade = (p['Prioridade'] ?? p['prioridade']) as string | undefined;
            const prioColor =
              prioridade === 'Alta' ? 'text-accent-red'
              : prioridade === 'Media' || prioridade === 'Média' ? 'text-accent-orange'
              : 'text-text-secondary';
            return (
              <li key={i} className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-text-primary font-bold truncate flex-1">{name}</span>
                {status && (
                  <span className={cn('text-[8px] font-bold uppercase tracking-widest shrink-0', prioColor)}>
                    {status}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <a
        href="#"
        className="text-[8px] text-brand-mint uppercase tracking-widest cursor-pointer flex items-center gap-0.5 mt-auto focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
      >
        Ver tudo <Icon name="arrow_forward" size="xs" />
      </a>
    </div>
  );
}

// Widget 3: Finanças
function FinancasWidget() {
  const finance = useFinanceData();

  const saldoColor = finance.isLoading
    ? 'text-text-primary'
    : finance.saldo >= 0 ? 'text-brand-mint' : 'text-accent-red';

  const topCategorias = Object.entries(finance.porCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col gap-2">
      <SectionLabel icon="account_balance_wallet">FINANÇAS</SectionLabel>
      {finance.isLoading ? (
        <div className="bg-border-panel animate-pulse rounded-sm h-8 w-full" />
      ) : (
        <>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-1">
              <span className={cn('text-[20px] font-black font-mono leading-none', saldoColor)}>
                {finance.saldo >= 0 ? '+' : '-'}R${Math.abs(finance.saldo).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-[8px] text-text-secondary uppercase tracking-widest">saldo atual</span>
          </div>
          {topCategorias.length > 0 && (
            <ul className="flex flex-col gap-1">
              {topCategorias.map(([cat, val]) => (
                <li key={cat} className="flex items-center justify-between">
                  <span className="text-[9px] text-text-secondary">{cat}</span>
                  <span className="text-[9px] font-mono text-accent-red">
                    -R${val.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <a
        href="#"
        className="text-[8px] text-brand-mint uppercase tracking-widest cursor-pointer flex items-center gap-0.5 mt-auto focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
      >
        Ver tudo <Icon name="arrow_forward" size="xs" />
      </a>
    </div>
  );
}

// Widget 4: Saúde
function SaudeWidget() {
  const { saude } = useNotionData();
  const items = useMemo(
    () => extractItems<Record<string, unknown>>(saude.items),
    [saude.items]
  );

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const da = new Date((a['Data'] ?? a['data']) as string).getTime();
        const db = new Date((b['Data'] ?? b['data']) as string).getTime();
        return db - da;
      }),
    [items]
  );

  const last = sorted[0];
  const lastDate = last ? ((last['Data'] ?? last['data']) as string | undefined) : undefined;
  const lastTitle = last ? ((last['Titulo'] ?? last['title'] ?? 'Atividade') as string) : '';
  const lastDuracao = last ? ((last['Duracao'] ?? last['duracao']) as number | undefined) : undefined;

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col gap-2">
      <SectionLabel icon="fitness_center">SAÚDE</SectionLabel>
      {saude.isLoading ? (
        <div className="bg-border-panel animate-pulse rounded-sm h-8 w-full" />
      ) : !last ? (
        <p className="text-text-secondary text-xs">Sem atividades</p>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-text-primary truncate">{lastTitle}</span>
          <div className="flex items-center gap-2">
            {lastDate && (
              <span className="text-[8px] font-mono text-text-secondary">
                {formatRelative(lastDate)}
              </span>
            )}
            {lastDuracao && (
              <span className="text-[8px] font-mono text-brand-mint">{lastDuracao}min</span>
            )}
          </div>
          <span className="text-[8px] text-text-secondary">
            {sorted.length} atividade(s) registrada(s)
          </span>
        </div>
      )}
      <a
        href="#"
        className="text-[8px] text-brand-mint uppercase tracking-widest cursor-pointer flex items-center gap-0.5 mt-auto focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
      >
        Ver tudo <Icon name="arrow_forward" size="xs" />
      </a>
    </div>
  );
}

// Main grid component — only Reuniões + Projetos (Finance/Health have their own sections)
export function DashboardWidgetGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <ReunioesWidget />
      <ProjetosWidget />
    </div>
  );
}

export default DashboardWidgetGrid;
