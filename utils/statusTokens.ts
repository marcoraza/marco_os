export const PIPELINE_STATUS_MAP: Record<string, { color: string; label: string }> = {
  'Pendente':         { color: 'text-text-secondary border-border-panel', label: 'Pendente' },
  'Na Fila':          { color: 'text-accent-orange border-accent-orange/30', label: 'Na Fila' },
  'Em Execução':      { color: 'text-accent-blue border-accent-blue/30', label: 'Em Execução' },
  'Analisado':        { color: 'text-brand-mint border-brand-mint/30', label: 'Analisado' },
  'Ativo':            { color: 'text-brand-mint border-brand-mint/30', label: 'Ativo' },
  'Pausado':          { color: 'text-accent-orange border-accent-orange/30', label: 'Pausado' },
  'Concluído':        { color: 'text-text-secondary border-border-panel', label: 'Concluído' },
  'Processado':       { color: 'text-brand-mint border-brand-mint/30', label: 'Processado' },
  'Agendada':         { color: 'text-accent-blue border-accent-blue/30', label: 'Agendada' },
  'Realizada':        { color: 'text-text-secondary border-border-panel', label: 'Realizada' },
  'Outcome Pendente': { color: 'text-accent-orange border-accent-orange/30', label: 'Outcome Pendente' },
  'Resolvida':        { color: 'text-brand-mint border-brand-mint/30', label: 'Resolvida' },
  'passing':          { color: 'text-brand-mint border-brand-mint/30', label: 'Passing' },
  'failing':          { color: 'text-accent-red border-accent-red/30', label: 'Failing' },
};

export function getStatusToken(status: string): { color: string; label: string } {
  return PIPELINE_STATUS_MAP[status] ?? { color: 'text-text-secondary border-border-panel', label: status };
}
