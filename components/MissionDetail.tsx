import React, { useState } from 'react';
import type { Task } from '../App';
import { Icon, Badge, Card, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';

interface MissionDetailProps {
  task: Task;
  onBack: () => void;
  onStatusChange: (taskId: number, newStatus: Task['status']) => void;
}

const statusConfig: { id: Task['status']; label: string; icon: string; color: string; dotColor: 'mint' | 'orange' | 'blue' | 'red' | 'purple'; variant: 'neutral' | 'blue' | 'orange' | 'purple' | 'mint' }[] = [
  { id: 'assigned', label: 'Atribuída', icon: 'inbox', color: 'text-text-secondary', dotColor: 'blue', variant: 'neutral' },
  { id: 'started', label: 'Iniciada', icon: 'play_circle', color: 'text-accent-blue', dotColor: 'blue', variant: 'blue' },
  { id: 'in-progress', label: 'Em Andamento', icon: 'autorenew', color: 'text-accent-orange', dotColor: 'orange', variant: 'orange' },
  { id: 'standby', label: 'Stand By', icon: 'pause_circle', color: 'text-accent-purple', dotColor: 'purple', variant: 'purple' },
  { id: 'done', label: 'Concluída', icon: 'check_circle', color: 'text-brand-mint', dotColor: 'mint', variant: 'mint' },
];

const priorityConfig: Record<string, { label: string; bg: string; text: string; fullLabel: string }> = {
  high: { label: 'P0', bg: 'bg-accent-red', text: 'text-white', fullLabel: 'Crítica' },
  medium: { label: 'P1', bg: 'bg-accent-orange', text: 'text-white', fullLabel: 'Média' },
  low: { label: 'P2', bg: 'bg-text-secondary/40', text: 'text-white', fullLabel: 'Baixa' },
};

const MissionDetail: React.FC<MissionDetailProps> = ({ task, onBack, onStatusChange }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const currentStatus = statusConfig.find(s => s.id === task.status) || statusConfig[0];
  const priority = priorityConfig[task.priority] || priorityConfig.low;

  // Mock timeline based on task status
  const getTimeline = () => {
    const entries: { time: string; title: string; description: string; active: boolean }[] = [];
    const now = new Date();
    const fmtTime = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    if (task.status === 'done') {
      entries.push({ time: `HOJE - ${fmtTime(now)}`, title: 'Missão Concluída', description: 'Tarefa marcada como finalizada.', active: true });
    }
    if (['done', 'in-progress', 'standby'].includes(task.status)) {
      entries.push({ time: `HOJE - ${fmtTime(new Date(now.getTime() - 3600000))}`, title: 'Em Progresso', description: 'Trabalho ativo na tarefa.', active: task.status === 'in-progress' });
    }
    if (['done', 'in-progress', 'standby', 'started'].includes(task.status)) {
      entries.push({ time: `HOJE - ${fmtTime(new Date(now.getTime() - 7200000))}`, title: 'Missão Iniciada', description: 'Início do trabalho registrado no sistema.', active: task.status === 'started' });
    }
    entries.push({ time: 'CRIAÇÃO', title: 'Missão Atribuída', description: `Tarefa criada e atribuída a ${task.assignee}.`, active: task.status === 'assigned' });
    return entries;
  };

  const timeline = getTimeline();

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Header */}
      <header className="h-14 bg-header-bg border-b border-border-panel px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <button onClick={onBack} className="flex items-center gap-1.5 text-text-secondary hover:text-brand-mint transition-colors shrink-0">
            <Icon name="arrow_back" size="sm" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Voltar</span>
          </button>
          <div className="h-5 w-px bg-border-panel shrink-0 hidden sm:block" />
          <h1 className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-text-primary truncate">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={currentStatus.variant} size="sm">
            <Icon name={currentStatus.icon} className="text-[10px]" />
            <span className="hidden sm:inline">{currentStatus.label}</span>
          </Badge>
          <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black shrink-0', priority.bg, priority.text)}>
            {priority.label}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* LEFT: Task details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Status Switcher */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">STATUS DA MISSÃO</span>
                  <button
                    onClick={() => setIsChangingStatus(!isChangingStatus)}
                    className="text-[8px] font-bold text-brand-mint uppercase tracking-widest hover:underline"
                  >
                    {isChangingStatus ? 'Fechar' : 'Alterar'}
                  </button>
                </div>

                {isChangingStatus ? (
                  <div className="flex flex-wrap gap-2">
                    {statusConfig.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { onStatusChange(task.id, s.id); setIsChangingStatus(false); }}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-sm border text-[10px] font-bold uppercase tracking-wide transition-all',
                          task.status === s.id
                            ? 'border-brand-mint/30 bg-brand-mint/5 text-brand-mint'
                            : 'border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/30'
                        )}
                      >
                        <Icon name={s.icon} size="xs" className={s.color} />
                        {s.label}
                        {task.status === s.id && <Icon name="check" size="xs" className="text-brand-mint" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* Progress track */}
                    <div className="flex items-center gap-1 flex-1">
                      {statusConfig.map((s, i) => {
                        const currentIdx = statusConfig.findIndex(x => x.id === task.status);
                        const isActive = i <= currentIdx;
                        const isCurrent = s.id === task.status;
                        return (
                          <React.Fragment key={s.id}>
                            <div className={cn(
                              'size-8 rounded-sm border flex items-center justify-center transition-all shrink-0',
                              isCurrent
                                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint scale-110'
                                : isActive
                                  ? 'bg-surface border-border-panel text-text-primary'
                                  : 'bg-bg-base border-border-panel/50 text-text-secondary/30'
                            )}>
                              <Icon name={s.icon} size="xs" />
                            </div>
                            {i < statusConfig.length - 1 && (
                              <div className={cn(
                                'flex-1 h-[2px] rounded-full min-w-[8px]',
                                i < currentIdx ? 'bg-brand-mint/40' : 'bg-border-panel'
                              )} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border-panel border border-border-panel rounded-sm overflow-hidden">
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">RESPONSÁVEL</p>
                  <div className="flex items-center gap-2">
                    {task.assignee.startsWith('http') ? (
                      <img src={task.assignee} className="size-5 rounded-sm object-cover" alt="" />
                    ) : (
                      <div className="size-5 rounded-sm bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">{task.assignee}</div>
                    )}
                    <p className="text-[11px] font-bold text-text-primary">{task.assignee.startsWith('http') ? 'Membro' : task.assignee}</p>
                  </div>
                </div>
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Prioridade</p>
                  <div className="flex items-center gap-2">
                    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black', priority.bg, priority.text)}>{priority.label}</span>
                    <p className="text-[11px] font-bold text-text-primary">{priority.fullLabel}</p>
                  </div>
                </div>
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Prazo</p>
                  <p className={cn('text-[11px] font-bold', task.deadline === 'Hoje' ? 'text-accent-red' : 'text-text-primary')}>{task.deadline}</p>
                </div>
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">Tag</p>
                  <Badge variant="neutral" size="xs">{task.tag}</Badge>
                </div>
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">DEPENDÊNCIAS</p>
                  <p className="text-[11px] font-bold text-text-primary font-mono">{task.dependencies || 0}</p>
                </div>
                <div className="bg-surface p-4 space-y-1">
                  <p className="text-[8px] uppercase font-black text-text-secondary tracking-widest">ID</p>
                  <p className="text-[11px] font-bold text-text-secondary font-mono">#{task.id}</p>
                </div>
              </div>

              {/* Task Card Preview — same style as kanban */}
              <div>
                <SectionLabel className="mb-3 text-text-secondary" icon="preview">Preview do Card</SectionLabel>
                <Card className="p-4 space-y-2 max-w-sm">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[13px] text-text-primary font-medium leading-snug">
                      {task.title}
                    </span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black shrink-0', priority.bg, priority.text)}>
                      {priority.label}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-text-secondary leading-relaxed">{task.tag}</p>
                    {task.deadline && task.deadline !== 'A definir' && (
                      <p className={cn(
                        'text-[11px] leading-relaxed',
                        task.deadline === 'Hoje' ? 'text-accent-red'
                          : task.deadline === 'Amanhã' ? 'text-accent-orange'
                          : task.deadline.includes('atrás') || task.deadline === 'Ontem' ? 'text-brand-mint'
                          : 'text-text-secondary'
                      )}>
                        {task.deadline === 'Hoje' ? 'Prazo: Hoje — urgente'
                          : task.deadline === 'Amanhã' ? 'Prazo: Amanhã'
                          : task.deadline === 'Ontem' ? 'Concluído ontem'
                          : `Prazo: ${task.deadline}`}
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-text-secondary/60 pt-0.5">
                    2026-02-16T{(20 + (task.id % 4)).toString().padStart(2, '0')}:{((task.id * 17) % 60).toString().padStart(2, '0')}:00Z
                  </p>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {task.status !== 'done' && (
                  <button
                    onClick={() => onStatusChange(task.id, 'done')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-colors"
                  >
                    <Icon name="check_circle" size="xs" />
                    Marcar como Concluída
                  </button>
                )}
                {task.status === 'assigned' && (
                  <button
                    onClick={() => onStatusChange(task.id, 'started')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-accent-blue/20 transition-colors"
                  >
                    <Icon name="play_circle" size="xs" />
                    Iniciar Missão
                  </button>
                )}
                {task.status === 'started' && (
                  <button
                    onClick={() => onStatusChange(task.id, 'in-progress')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-accent-orange/20 transition-colors"
                  >
                    <Icon name="autorenew" size="xs" />
                    Mover para Em Andamento
                  </button>
                )}
                {task.status === 'in-progress' && (
                  <button
                    onClick={() => onStatusChange(task.id, 'standby')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-panel text-text-secondary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:text-text-primary transition-colors"
                  >
                    <Icon name="pause_circle" size="xs" />
                    Pausar
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Timeline */}
            <aside className="space-y-4">
              <SectionLabel className="text-text-secondary" icon="timeline">Timeline</SectionLabel>

              <Card className="p-5">
                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-px before:bg-border-panel">
                  {timeline.map((entry, i) => (
                    <div key={i} className="relative pl-8">
                      <StatusDot
                        color={entry.active ? currentStatus.dotColor : 'blue'}
                        glow={entry.active}
                        className="absolute left-1 top-0.5 z-10"
                        size="md"
                      />
                      <div className="space-y-0.5">
                        <p className={cn(
                          'text-[9px] font-mono',
                          entry.active ? currentStatus.color : 'text-text-secondary/60'
                        )}>{entry.time}</p>
                        <p className="text-[11px] font-bold uppercase text-text-primary">{entry.title}</p>
                        <p className="text-[10px] text-text-secondary leading-snug">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick info */}
              <Card className="p-4 space-y-3">
                <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">RESUMO RÁPIDO</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-text-secondary">Status</span>
                    <Badge variant={currentStatus.variant} size="xs">
                      <Icon name={currentStatus.icon} className="text-[8px]" />
                      {currentStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-text-secondary">Prioridade</span>
                    <span className={cn('px-2 py-0.5 rounded-full text-[8px] font-black', priority.bg, priority.text)}>{priority.label} — {priority.fullLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-text-secondary">Prazo</span>
                    <span className={cn(
                      'text-[9px] font-bold',
                      task.deadline === 'Hoje' ? 'text-accent-red' : 'text-text-primary'
                    )}>{task.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-text-secondary">Tag</span>
                    <span className="text-[9px] font-bold text-text-primary">{task.tag}</span>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MissionDetail;
