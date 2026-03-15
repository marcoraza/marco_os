import type { StoredContact } from '../data/models';

export type DelegationQueueStatus = 'pending' | 'sent' | 'running' | 'done' | 'failed';

export interface DelegationQueueItem {
  id: string;
  agentId: string;
  mission: string;
  priority: 'high' | 'medium' | 'low';
  status: DelegationQueueStatus;
  createdAt: string;
}

export interface ExecutiveBriefingInput {
  meetingsToday: number;
  tasksDueToday: number;
  urgentTasks: number;
  activeProjects: number;
  pendingFollowUps: number;
  balance: number;
  healthCheckins: number;
}

export interface WeeklyReviewInput {
  pendingKnowledge: number;
  decisionsThisWeek: number;
  tasksDoneThisWeek: number;
  healthCheckinsThisWeek: number;
  tags: string[];
}

export type RelationshipSegment = 'cliente' | 'parceiro' | 'investidor' | 'pessoal' | 'geral';

export function buildExecutiveBriefing(input: ExecutiveBriefingInput) {
  const priorities: string[] = [];

  if (input.urgentTasks > 0) priorities.push(`${input.urgentTasks} prioridade(s) alta(s) pedem ação hoje`);
  if (input.pendingFollowUps > 0) priorities.push(`${input.pendingFollowUps} follow-up(s) pendente(s)`);
  if (input.meetingsToday > 0) priorities.push(`${input.meetingsToday} reunião(ões) na agenda`);
  if (input.balance < 0) priorities.push('fluxo financeiro do mês está negativo');
  if (input.healthCheckins === 0) priorities.push('sem check-in recente de saúde');

  const summary = priorities[0]
    ?? (input.tasksDueToday > 0
      ? `${input.tasksDueToday} tarefa(s) vencem hoje em ${input.activeProjects} projeto(s)`
      : `dia relativamente limpo com ${input.activeProjects} projeto(s) ativo(s)`);

  return {
    summary,
    priorities: priorities.slice(0, 3),
    balanceTone: input.balance > 0 ? 'positive' : input.balance < 0 ? 'negative' : 'neutral',
  };
}

export function rankTopTags(tags: string[]) {
  const counts = new Map<string, number>();
  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([tag, count]) => ({ tag, count }));
}

export function buildWeeklyReview(input: WeeklyReviewInput) {
  const topTags = rankTopTags(input.tags).slice(0, 5);
  const focus: string[] = [];

  if (input.pendingKnowledge > 0) focus.push(`revisar ${input.pendingKnowledge} anotação(ões) pendente(s)`);
  if (input.decisionsThisWeek > 0) focus.push(`consolidar ${input.decisionsThisWeek} decisão(ões) da semana`);
  if (input.tasksDoneThisWeek === 0) focus.push('sem tarefas concluídas nesta semana');
  if (input.healthCheckinsThisWeek < 3) focus.push('rotina de saúde com baixa consistência');

  const headline = focus[0] ?? 'sem pendências críticas de revisão';
  const retention = input.pendingKnowledge + input.decisionsThisWeek === 0
    ? 100
    : Math.max(0, Math.min(100, Math.round((input.tasksDoneThisWeek / (input.pendingKnowledge + input.decisionsThisWeek + input.tasksDoneThisWeek)) * 100)));

  return {
    headline,
    focus: focus.slice(0, 3),
    topTags,
    retention,
  };
}

export function summarizeDelegationQueue(items: DelegationQueueItem[]) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      summary[item.status] += 1;
      return summary;
    },
    { total: 0, pending: 0, sent: 0, running: 0, done: 0, failed: 0 }
  );
}

export function inferRelationshipSegment(contact: Pick<StoredContact, 'tags' | 'role' | 'company'>): RelationshipSegment {
  const tags = (contact.tags ?? []).map((tag) => tag.toLowerCase());
  const role = contact.role.toLowerCase();
  const company = contact.company.toLowerCase();

  if (tags.some((tag) => tag.includes('cliente') || tag.includes('prospect'))) return 'cliente';
  if (tags.some((tag) => tag.includes('parceiro'))) return 'parceiro';
  if (tags.some((tag) => tag.includes('investidor')) || role.includes('investor') || role.includes('angel')) return 'investidor';
  if (tags.some((tag) => tag.includes('pessoal')) || company.includes('family') || company.includes('friend')) return 'pessoal';
  return 'geral';
}

function parseRelativeDays(lastContact: string) {
  const match = lastContact.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

export function scoreRelationship(contact: Pick<StoredContact, 'status' | 'lastContact' | 'tags' | 'interactionLog' | 'nextFollowUp'>, today = '2026-03-06') {
  const statusWeight = contact.status === 'hot' ? 45 : contact.status === 'warm' ? 30 : 15;
  const recencyPenalty = Math.min(parseRelativeDays(contact.lastContact), 90);
  const interactionWeight = Math.min((contact.interactionLog?.length ?? 0) * 5, 20);
  const tagWeight = Math.min((contact.tags?.length ?? 0) * 3, 12);
  const followUpWeight = contact.nextFollowUp && contact.nextFollowUp <= today ? -12 : 8;

  return Math.max(0, Math.min(100, statusWeight - Math.round(recencyPenalty / 3) + interactionWeight + tagWeight + followUpWeight));
}

export function buildRelationshipNextStep(contact: Pick<StoredContact, 'name' | 'nextFollowUp' | 'status'>, segment: RelationshipSegment, today = '2026-03-06') {
  if (contact.nextFollowUp && contact.nextFollowUp <= today) {
    return `Retomar contato com ${contact.name} hoje`;
  }
  if (segment === 'investidor') return `Atualizar ${contact.name} com progresso e próximos marcos`;
  if (segment === 'cliente') return `Enviar follow-up comercial com próximo passo claro`;
  if (segment === 'parceiro') return `Reativar parceria com contexto de colaboração recente`;
  if (contact.status === 'cold') return `Reaquecer relação com mensagem curta e contexto`;
  return `Registrar próximo toque para ${contact.name}`;
}
