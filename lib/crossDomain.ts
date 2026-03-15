import type { ProjetoItem, ReuniaoItem, ChecklistItem, PessoaItem, FinancaItem, SaudeItem, CalendarEvent } from './dataProvider';

// Types para os resultados de agregação
export interface HealthScore {
  total: number;        // 0-100
  tasks: number;        // 0-20 — % checklists concluídas
  health: number;       // 0-20 — streak de registros saude
  finance: number;      // 0-20 — saldo positivo = 20, negativo = 0
  projects: number;     // 0-20 — % projetos sem blocker
  followups: number;    // 0-20 — % follow-ups feitos (reunioes)
}

export interface PredictiveAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  icon: string;         // Material Symbol name
  title: string;
  description: string;
  section: string;      // view id to navigate to
  timestamp: string;
}

export interface MorningBrief {
  date: string;
  events_today: number;
  tasks_pending: number;
  projects_active: number;
  alerts: PredictiveAlert[];
  summary: string;
}

// Calcular Health Score
export function calculateHealthScore(data: {
  checklists: ChecklistItem[];
  financas: FinancaItem[];
  projetos: ProjetoItem[];
  reunioes: ReuniaoItem[];
  saude: SaudeItem[];
}): HealthScore {
  // Tasks: % de checklists com status "Concluído" ou "Feito"
  const tasksDone = data.checklists.filter(c =>
    c.status?.toLowerCase().includes('conclu') || c.status?.toLowerCase().includes('feit')
  ).length;
  const tasksScore = data.checklists.length > 0
    ? Math.round((tasksDone / data.checklists.length) * 20) : 10; // default 10 se sem dados

  // Health: tem registros nos últimos 7 dias?
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recentHealth = data.saude.filter(s => s.data && s.data >= weekAgo).length;
  const healthScore = Math.min(20, recentHealth * 3); // 7 registros = 20

  // Finance: saldo positivo
  const entradas = data.financas
    .filter(f => f.tipo === 'Entrada')
    .reduce((s, f) => s + (f.valor || 0), 0);
  const saidas = data.financas
    .filter(f => f.tipo === 'Saida')
    .reduce((s, f) => s + (f.valor || 0), 0);
  const financeScore = entradas >= saidas
    ? 20
    : Math.max(0, Math.round((entradas / (saidas || 1)) * 20));

  // Projects: % sem status "Bloqueado"
  const notBlocked = data.projetos.filter(p => !p.status?.toLowerCase().includes('bloqu')).length;
  const projectsScore = data.projetos.length > 0
    ? Math.round((notBlocked / data.projetos.length) * 20) : 10;

  // Follow-ups: reuniões com follow_up preenchido
  const withFollowup = data.reunioes.filter(r => r.follow_up && r.follow_up.trim()).length;
  const followupsScore = data.reunioes.length > 0
    ? Math.round((withFollowup / data.reunioes.length) * 20) : 10;

  const total = tasksScore + healthScore + financeScore + projectsScore + followupsScore;

  return { total, tasks: tasksScore, health: healthScore, finance: financeScore, projects: projectsScore, followups: followupsScore };
}

// Gerar alertas preditivos
export function generateAlerts(data: {
  projetos: ProjetoItem[];
  reunioes: ReuniaoItem[];
  checklists: ChecklistItem[];
  pessoas: PessoaItem[];
  financas: FinancaItem[];
  calendar?: CalendarEvent[];
}): PredictiveAlert[] {
  const alerts: PredictiveAlert[] = [];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // Projetos com deadline estourado
  data.projetos.forEach(p => {
    if (p.deadline && p.deadline < today && !p.status?.toLowerCase().includes('conclu')) {
      alerts.push({
        id: `proj-deadline-${p.id}`,
        type: 'urgent',
        icon: 'warning',
        title: `Prazo estourado: ${p.title}`,
        description: `Deadline era ${p.deadline}`,
        section: 'planner',
        timestamp: now.toISOString(),
      });
    }
  });

  // Reunião nas próximas 24h sem resumo (sem pauta preparada)
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  data.reunioes.forEach(r => {
    if (r.data && r.data >= today && r.data <= tomorrow && !r.resumo?.trim()) {
      alerts.push({
        id: `reuniao-noprep-${r.id}`,
        type: 'warning',
        icon: 'event_busy',
        title: `Reunião sem pauta: ${r.title}`,
        description: r.participantes || 'Sem participantes definidos',
        section: 'crm',
        timestamp: now.toISOString(),
      });
    }
  });

  // Follow-ups pendentes
  data.pessoas.forEach(p => {
    if (p.proxima_acao?.trim() && p.proxima_acao !== '') {
      alerts.push({
        id: `followup-${p.id}`,
        type: 'info',
        icon: 'person_alert',
        title: `Follow-up pendente: ${p.title}`,
        description: p.proxima_acao,
        section: 'crm',
        timestamp: now.toISOString(),
      });
    }
  });

  // Saldo negativo
  const entradas = data.financas
    .filter(f => f.tipo === 'Entrada')
    .reduce((s, f) => s + (f.valor || 0), 0);
  const saidas = data.financas
    .filter(f => f.tipo === 'Saida')
    .reduce((s, f) => s + (f.valor || 0), 0);
  if (saidas > entradas && data.financas.length > 0) {
    alerts.push({
      id: 'finance-negative',
      type: 'urgent',
      icon: 'account_balance_wallet',
      title: 'Saldo negativo',
      description: `Saídas R$${saidas.toFixed(0)} > Entradas R$${entradas.toFixed(0)}`,
      section: 'finance',
      timestamp: now.toISOString(),
    });
  }

  // Sort: urgent first, then warning, then info
  const priority: Record<PredictiveAlert['type'], number> = { urgent: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => priority[a.type] - priority[b.type]);

  return alerts;
}

// Gerar Morning Brief resumo
export function generateMorningBrief(data: {
  projetos: ProjetoItem[];
  checklists: ChecklistItem[];
  calendar?: CalendarEvent[];
  alerts: PredictiveAlert[];
}): MorningBrief {
  const today = new Date().toISOString().slice(0, 10);
  const eventsToday = (data.calendar || []).filter(e => e.start?.startsWith(today)).length;
  const tasksPending = data.checklists.filter(c => !c.status?.toLowerCase().includes('conclu')).length;
  const projectsActive = data.projetos.filter(p => p.status?.toLowerCase().includes('progresso')).length;

  let summary = '';
  if (data.alerts.filter(a => a.type === 'urgent').length > 0) {
    summary = 'Atenção: itens urgentes precisam de ação hoje.';
  } else if (eventsToday > 0) {
    summary = `${eventsToday} evento(s) hoje. ${tasksPending} tarefa(s) pendente(s).`;
  } else {
    summary = `Dia livre de eventos. ${tasksPending} tarefa(s) pendente(s), ${projectsActive} projeto(s) ativo(s).`;
  }

  return {
    date: today,
    events_today: eventsToday,
    tasks_pending: tasksPending,
    projects_active: projectsActive,
    alerts: data.alerts,
    summary,
  };
}
