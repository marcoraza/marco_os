import type { Task } from '../../lib/appTypes';
import type { StoredEvent } from '../../data/models';
import { Icon, Badge, Card } from '../ui';
import { cn } from '../../utils/cn';
import AgendaWidget from '../AgendaWidget';

interface DashboardRightSidebarProps {
  criticalMission: Task | undefined;
  onTaskClick: (id: number) => void;
  events: StoredEvent[];
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
  activeProjectId: string;
}

const QUICK_ACTIONS = [
  { icon: 'summarize',     label: 'BRIEFING DIÁRIO', desc: 'Resumo do dia pelo Frank' },
  { icon: 'mail',          label: 'Triar Inbox',      desc: 'Escanear emails pendentes' },
  { icon: 'monitor_heart', label: 'Health Check',     desc: 'Checar status dos sistemas' },
  { icon: 'sync',          label: 'SYNC MEMÓRIA',     desc: 'Destilar memórias recentes' },
  { icon: 'bolt',          label: 'TASK RÁPIDA',      desc: 'Criar e delegar tarefa' },
] as const;

const NOTIFICATIONS = [
  { icon: 'warning',    color: 'text-accent-orange', text: 'Lint com alertas — QA verificando',      time: '2min' },
  { icon: 'check_circle', color: 'text-brand-mint',  text: 'Build #42 passou com sucesso',           time: '8min' },
  { icon: 'mail',       color: 'text-accent-blue',   text: '3 emails novos triados pelo Frank',      time: '15min' },
  { icon: 'psychology', color: 'text-accent-purple', text: 'Planner atualizou roadmap Q1',           time: '22min' },
  { icon: 'payments',   color: 'text-accent-red',    text: 'Fatura cartão vence amanhã',             time: '1h' },
] as const;

const ACTIVITY_LOG = [
  { time: '14:32', user: 'Frank', action: 'Atualizou status de infraestrutura', type: 'system' },
  { time: '12:15', user: 'MA',    action: 'Concluiu "Revisão de PR"',           type: 'user' },
  { time: '09:45', user: 'Agente E2', action: 'Novo lead qualificado no CRM',   type: 'agent' },
  { time: '08:00', user: 'System',    action: 'Backup diário realizado',         type: 'system' },
] as const;

export default function DashboardRightSidebar({
  criticalMission,
  onTaskClick,
  events,
  setEvents,
  activeProjectId,
}: DashboardRightSidebarProps) {
  return (
    <aside className="w-72 border-l border-border-panel bg-header-bg flex flex-col shrink-0 z-10 hidden xl:flex overflow-hidden">

      {/* Quick Actions */}
      <div className="p-4 border-b border-border-panel shrink-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
          <Icon name="auto_awesome" size="xs" className="text-brand-mint" />
          AÇÕES RÁPIDAS
        </span>
        <div className="space-y-1">
          {QUICK_ACTIONS.map((fn, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm hover:bg-surface border border-transparent hover:border-border-panel transition-all group text-left"
            >
              <div className="size-7 rounded-sm bg-brand-mint/5 border border-brand-mint/10 flex items-center justify-center shrink-0 group-hover:border-brand-mint/30 transition-colors">
                <Icon name={fn.icon} size="xs" className="text-brand-mint" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-text-primary group-hover:text-brand-mint transition-colors">{fn.label}</p>
                <p className="text-[8px] text-text-secondary truncate">{fn.desc}</p>
              </div>
              <Icon name="chevron_right" size="xs" className="text-text-secondary/30 group-hover:text-brand-mint transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Agenda */}
      <div className="p-4 border-b border-border-panel shrink-0">
        <AgendaWidget events={events} setEvents={setEvents} activeProjectId={activeProjectId} />
      </div>

      {/* Critical Mission */}
      {criticalMission && (
        <div className="p-4 border-b border-border-panel bg-accent-red/[0.02] shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="warning" size="xs" className="text-accent-red" />
            <span className="text-[8px] font-black uppercase tracking-widest text-accent-red">MISSÃO CRÍTICA</span>
          </div>
          <Card
            className="p-2.5 border-accent-red/20 cursor-pointer hover:border-accent-red/40 transition-colors"
            onClick={() => onTaskClick(criticalMission.id)}
          >
            <p className="text-[10px] font-medium text-text-primary leading-tight mb-1.5">{criticalMission.title}</p>
            <div className="flex items-center gap-2">
              <Badge variant="red" size="xs">IMEDIATO</Badge>
              <span className="text-[8px] text-text-secondary">{criticalMission.tag}</span>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications */}
      <div className="p-4 border-b border-border-panel shrink-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
          <Icon name="notifications" size="xs" className="text-accent-orange" />
          NOTIFICAÇÕES
          <span className="ml-auto px-1.5 py-0.5 rounded-sm bg-accent-orange/10 border border-accent-orange/20 text-[8px] font-mono text-accent-orange">5</span>
        </span>
        <div className="space-y-1.5">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-surface transition-colors cursor-pointer">
              <Icon name={n.icon} size="xs" className={cn('shrink-0 mt-0.5', n.color)} />
              <div className="min-w-0 flex-1">
                <p className="text-[9px] text-text-primary leading-tight">{n.text}</p>
                <p className="text-[7px] font-mono text-text-secondary mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="flex-grow overflow-y-auto p-4">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
          <Icon name="bolt" size="xs" className="text-accent-blue" />
          Atividade
        </span>
        <div className="relative pl-4 space-y-4 before:absolute before:inset-0 before:ml-1.5 before:h-full before:w-px before:bg-border-panel">
          {ACTIVITY_LOG.map((log, i) => (
            <div key={i} className="relative">
              <div className={cn(
                'absolute -left-[19px] top-1.5 size-2 rounded-full border-2 border-bg-base',
                log.type === 'system' ? 'bg-text-secondary' : log.type === 'user' ? 'bg-brand-mint' : 'bg-accent-purple'
              )} />
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-text-primary">{log.user}</span>
                <span className="text-[8px] font-mono text-text-secondary">{log.time}</span>
              </div>
              <p className="text-[9px] text-text-secondary mt-0.5 leading-snug">{log.action}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
