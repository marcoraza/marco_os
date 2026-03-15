// components/dashboard/MorningBriefCard.tsx
import React, { useState, useMemo } from 'react';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Icon } from '@/components/ui/Icon';
import { useNotionData } from '@/contexts/NotionDataContext';
import { useFinanceData } from '@/hooks/useFinanceData';
import { extractProviderItems } from '@/lib/providerData';
import { buildExecutiveBriefing } from '@/lib/productSignals';
import { cn } from '@/utils/cn';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function MorningBriefCard() {
  const [expanded, setExpanded] = useState(false);
  const { reunioes, projetos, checklist, saude, pessoas } = useNotionData();
  const finance = useFinanceData();

  const reunioesItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(reunioes.items),
    [reunioes.items]
  );
  const projetosItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(projetos.items),
    [projetos.items]
  );
  const checklistItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(checklist.items),
    [checklist.items]
  );
  const saudeItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(saude.items),
    [saude.items]
  );
  const pessoasItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(pessoas.items),
    [pessoas.items]
  );

  const today = todayKey();

  const reunioesHoje = reunioesItems.filter(r => {
    const d = (r['Data'] ?? r['data']) as string | undefined;
    return d?.slice(0, 10) === today;
  });

  const projetosAtivos = projetosItems.filter(p => {
    const status = (p['Status'] ?? p['status']) as string | undefined;
    return status && status !== 'Pausado' && status !== 'Concluído' && status !== 'Concluido';
  });

  const tarefasHoje = checklistItems.filter((item) => {
    const prazo = (item['Prazo'] ?? item['prazo']) as string | undefined;
    return prazo?.slice(0, 10) === today;
  }).length;

  const prioridadesAltas = checklistItems.filter((item) => {
    const prioridade = String(item['Prioridade'] ?? item['prioridade'] ?? '').toLowerCase();
    const status = String(item['Status'] ?? item['status'] ?? '').toLowerCase();
    return (prioridade.includes('alta') || prioridade === 'p0' || prioridade === 'high') && !status.includes('conclu');
  }).length;

  const checkinsRecentes = saudeItems.filter((item) => {
    const data = (item['Data'] ?? item['data']) as string | undefined;
    return data?.slice(0, 10) === today;
  }).length;

  const followUpsPendentes = pessoasItems.filter((item) => {
    const acao = String(item['Próxima ação'] ?? item['proxima_acao'] ?? '').trim();
    return acao.length > 0;
  }).length;

  const briefing = useMemo(() => buildExecutiveBriefing({
    meetingsToday: reunioesHoje.length,
    tasksDueToday: tarefasHoje,
    urgentTasks: prioridadesAltas,
    activeProjects: projetosAtivos.length,
    pendingFollowUps: followUpsPendentes,
    balance: finance.saldo,
    healthCheckins: checkinsRecentes,
  }), [checkinsRecentes, finance.saldo, followUpsPendentes, prioridadesAltas, projetosAtivos.length, reunioesHoje.length, tarefasHoje]);

  const summaryText = useMemo(() => {
    return briefing.summary;
  }, [briefing.summary]);

  return (
    <div className="bg-surface border border-brand-mint/20 rounded-sm">
      {/* Header */}
      <button
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
          'min-h-[44px]'
        )}
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <SectionLabel>MORNING BRIEF</SectionLabel>
          <span className="text-[8px] font-mono text-text-secondary">{formatTime()}</span>
        </div>
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          size="sm"
          className="text-text-secondary"
        />
      </button>

      {/* Collapsed summary */}
      {!expanded && (
        <div className="px-3 pb-2">
          <p className="text-xs text-text-secondary truncate">{summaryText}</p>
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {/* Calendar events */}
          {reunioesHoje.length > 0 && (
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary block mb-1">
                Reuniões
              </span>
              <ul className="flex flex-col gap-1">
                {reunioesHoje.map((r, i) => {
                  const name = (r['Name'] ?? r['title'] ?? r['Titulo'] ?? 'Reunião') as string;
                  const hora = (r['Data'] ?? r['data']) as string | undefined;
                  const time = hora && hora.includes('T')
                    ? new Date(hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <li key={i} className="flex items-center gap-2 text-xs text-text-primary">
                      <Icon name="fiber_manual_record" size="xs" className="text-accent-blue" />
                      <span>{name}{time ? ` — ${time}` : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {reunioesHoje.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <Icon name="fiber_manual_record" size="xs" className="text-text-secondary opacity-40" />
              <span>Nenhuma reunião hoje</span>
            </div>
          )}

          {/* Active projects */}
          {projetosAtivos.length > 0 && (
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary block mb-1">
                Projetos Ativos
              </span>
              <ul className="flex flex-col gap-1">
                {projetosAtivos.slice(0, 3).map((p, i) => {
                  const name = (p['Name'] ?? p['title'] ?? p['Titulo'] ?? 'Projeto') as string;
                  const status = (p['Status'] ?? p['status']) as string | undefined;
                  return (
                    <li key={i} className="flex items-center gap-2 text-xs text-text-primary">
                      <Icon name="fiber_manual_record" size="xs" className="text-brand-mint" />
                      <span>{name}{status ? ` · ${status}` : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div>
            <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary block mb-1">
              Foco Executivo
            </span>
            <ul className="flex flex-col gap-1">
              {briefing.priorities.length > 0 ? (
                briefing.priorities.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-text-primary">
                    <Icon name="subdirectory_arrow_right" size="xs" className="text-brand-mint" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center gap-2 text-xs text-text-secondary">
                  <Icon name="check_circle" size="xs" className="text-brand-mint" />
                  <span>Sem pressão operacional fora do normal.</span>
                </li>
              )}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2 py-2">
              <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Hoje</p>
              <p className="mt-1 text-[11px] font-black font-mono text-accent-orange">{tarefasHoje}</p>
            </div>
            <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2 py-2">
              <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Follow-up</p>
              <p className="mt-1 text-[11px] font-black font-mono text-accent-blue">{followUpsPendentes}</p>
            </div>
            <div className="rounded-sm border border-border-panel/70 bg-bg-base px-2 py-2">
              <p className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Caixa</p>
              <p className={cn(
                'mt-1 text-[11px] font-black font-mono',
                briefing.balanceTone === 'positive' ? 'text-brand-mint' : briefing.balanceTone === 'negative' ? 'text-accent-red' : 'text-text-primary'
              )}>
                {finance.isLoading ? '...' : finance.saldo >= 0 ? 'OK' : 'ATN'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MorningBriefCard;
