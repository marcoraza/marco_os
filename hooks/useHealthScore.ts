// hooks/useHealthScore.ts
import { useMemo } from 'react';
import { useNotionData } from '../contexts/NotionDataContext';
import { useFinanceData } from './useFinanceData';
import { calculateHealthScore, getScoreColor } from '../utils/scoreUtils';
import { getDayKey } from '../utils/dateUtils';
import { extractProviderItems } from '../lib/providerData';

export interface ScoreDimension {
  label: string;
  value: number;
  weight: number;
  detail: string;
}

export interface HealthScoreResult {
  score: number;
  color: string;
  dimensions: ScoreDimension[];
  isLoading: boolean;
}

export function useHealthScore(): HealthScoreResult {
  const { projetos, saude, reunioes, isLoading } = useNotionData();
  const finance = useFinanceData();

  const projetosItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(projetos.items),
    [projetos.items]
  );
  const saudeItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(saude.items),
    [saude.items]
  );
  const reunioesItems = useMemo(
    () => extractProviderItems<Record<string, unknown>>(reunioes.items),
    [reunioes.items]
  );

  return useMemo(() => {
    // Dimension 1: Tasks/Projetos — count completed
    const completedProjects = projetosItems.filter(
      p => (p['Status'] ?? p['status']) === 'Concluído' || (p['Status'] ?? p['status']) === 'Concluido'
    ).length;
    const tasksScore = Math.min(100, completedProjects * 25);

    // Dimension 2: Health — any saude entries in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSaude = saudeItems.filter(s => {
      const dateStr = (s['Data'] ?? s['data']) as string | undefined;
      if (!dateStr) return false;
      return new Date(dateStr) >= sevenDaysAgo;
    });
    const healthScore = recentSaude.length > 0 ? Math.min(100, recentSaude.length * 25) : 0;

    // Dimension 3: Finance — saldo >= 0
    const financeScore = finance.isLoading ? 50 : (finance.saldo >= 0 ? 100 : 0);

    // Dimension 4: Projects — active projects (not Pausado)
    const activeProjects = projetosItems.filter(p => {
      const status = (p['Status'] ?? p['status']) as string | undefined;
      return status && status !== 'Pausado' && status !== 'Concluído' && status !== 'Concluido';
    });
    const projectsScore = Math.min(100, activeProjects.length > 0 ? 60 + activeProjects.length * 10 : 0);

    // Dimension 5: Follow-ups — reunioes without pending follow-ups
    const reunioesWithoutPending = reunioesItems.filter(r => {
      const followUp = (r['Follow-up'] ?? r['follow_up']) as string | undefined;
      return !followUp || followUp.trim() === '';
    });
    const total = reunioesItems.length;
    const followUpsScore = total === 0 ? 80 : Math.round((reunioesWithoutPending.length / total) * 100);

    const dimensions: ScoreDimension[] = [
      {
        label: 'Tarefas',
        value: tasksScore,
        weight: 0.2,
        detail: `${completedProjects} concluídos`,
      },
      {
        label: 'Saúde',
        value: healthScore,
        weight: 0.2,
        detail: `${recentSaude.length} atividade(s) esta semana`,
      },
      {
        label: 'Finanças',
        value: financeScore,
        weight: 0.2,
        detail: finance.isLoading ? 'Carregando...' : (finance.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'),
      },
      {
        label: 'Projetos',
        value: projectsScore,
        weight: 0.2,
        detail: `${activeProjects.length} ativo(s)`,
      },
      {
        label: 'Follow-ups',
        value: followUpsScore,
        weight: 0.2,
        detail: `${reunioesWithoutPending.length}/${total} em dia`,
      },
    ];

    const score = calculateHealthScore(dimensions);
    const color = getScoreColor(score);

    return { score, color, dimensions, isLoading };
  }, [projetosItems, saudeItems, reunioesItems, finance, isLoading]);
}
