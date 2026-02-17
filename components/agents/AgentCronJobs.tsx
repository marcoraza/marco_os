import { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { jobBadge } from '../../data/agentMockData';
import type { CronJob } from '../../data/agentMockData';
import { useCronJobs, useCronJobActions, useAgents } from '../../contexts/OpenClawContext';

interface AgentCronJobsProps {
  agentId: string;
}

export default function AgentCronJobs({ agentId }: AgentCronJobsProps) {
  const { agents } = useAgents();
  const agent = agents.find(a => a.id === agentId);
  const jobs = useCronJobs(agent?.role === 'coordinator' ? undefined : agentId);
  const { updateCronJob, createCronJob, deleteCronJob } = useCronJobActions();

  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editPaused, setEditPaused] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  const stats = useMemo(() => {
    const counts = { ok: 0, warning: 0, failed: 0, paused: 0 };
    for (const job of jobs) {
      counts[job.status]++;
    }
    return counts;
  }, [jobs]);

  const startEdit = (job: CronJob) => {
    setEditingJobId(job.id);
    setEditName(job.name);
    setEditSchedule(job.schedule);
    setEditPaused(job.status === 'paused');
  };

  const cancelEdit = () => {
    setEditingJobId(null);
    setEditName('');
    setEditSchedule('');
    setEditPaused(false);
  };

  const saveEdit = (job: CronJob) => {
    updateCronJob({
      ...job,
      name: editName,
      schedule: editSchedule,
      status: editPaused ? 'paused' : job.status === 'paused' ? 'ok' : job.status,
    });
    cancelEdit();
  };

  const handleCreate = () => {
    if (!newName.trim() || !newSchedule.trim()) return;
    createCronJob({
      name: newName,
      schedule: newSchedule,
      lastRun: '',
      nextRun: '',
      status: 'ok',
      integration: 'OpenClaw',
      agentId,
    });
    setNewName('');
    setNewSchedule('');
    setShowNewForm(false);
  };

  if (jobs.length === 0 && !showNewForm) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel icon="schedule">CRON JOBS</SectionLabel>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-border-panel/50 text-text-secondary hover:text-brand-mint hover:border-brand-mint/20 hover:bg-brand-mint/5 transition-colors"
          >
            <Icon name="add" size="xs" />
            <span className="text-[8px] font-black uppercase tracking-widest">Novo Job</span>
          </button>
        </div>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="schedule" size="lg" />
            <span className="text-[11px]">Nenhum cron job configurado</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon="schedule">CRON JOBS</SectionLabel>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded border border-border-panel/50 text-text-secondary hover:text-brand-mint hover:border-brand-mint/20 hover:bg-brand-mint/5 transition-colors"
        >
          <Icon name="add" size="xs" />
          <span className="text-[8px] font-black uppercase tracking-widest">Novo Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Job List */}
        <div className="xl:col-span-2 space-y-2">
          {/* New Job Form */}
          {showNewForm && (
            <Card className="p-4 space-y-3 border-brand-mint/20">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-mint">Novo Cron Job</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Nome</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome do job..."
                    className="w-full bg-bg-base border border-border-panel rounded px-2 py-1.5 text-[10px] text-text-primary font-mono placeholder:text-text-secondary/30 focus:outline-none focus:border-brand-mint/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Schedule (cron)</label>
                  <input
                    type="text"
                    value={newSchedule}
                    onChange={(e) => setNewSchedule(e.target.value)}
                    placeholder="*/5 * * * *"
                    className="w-full bg-bg-base border border-border-panel rounded px-2 py-1.5 text-[10px] text-text-primary font-mono placeholder:text-text-secondary/30 focus:outline-none focus:border-brand-mint/30 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || !newSchedule.trim()}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-colors',
                    newName.trim() && newSchedule.trim()
                      ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20'
                      : 'bg-surface border border-border-panel text-text-secondary/40 cursor-not-allowed'
                  )}
                >
                  <Icon name="check" size="xs" /> Criar
                </button>
                <button
                  onClick={() => { setShowNewForm(false); setNewName(''); setNewSchedule(''); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded border border-border-panel text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Icon name="close" size="xs" /> Cancelar
                </button>
              </div>
            </Card>
          )}

          {jobs.map((job) => {
            const badge = jobBadge[job.status];
            const isEditing = editingJobId === job.id;

            return (
              <Card key={job.id} className={cn('p-4 space-y-3 transition-colors', isEditing && 'border-brand-mint/20')}>
                {isEditing ? (
                  /* ─── EDIT MODE ─── */
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Nome</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-bg-base border border-border-panel rounded px-2 py-1.5 text-[10px] text-text-primary font-mono focus:outline-none focus:border-brand-mint/30 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">Schedule</label>
                        <input
                          type="text"
                          value={editSchedule}
                          onChange={(e) => setEditSchedule(e.target.value)}
                          className="w-full bg-bg-base border border-border-panel rounded px-2 py-1.5 text-[10px] text-text-primary font-mono focus:outline-none focus:border-brand-mint/30 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Paused toggle */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditPaused(!editPaused)}
                        className={cn(
                          'relative w-8 h-4 rounded-full transition-colors',
                          editPaused ? 'bg-text-secondary/30' : 'bg-brand-mint/40'
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                          !editPaused && 'translate-x-4'
                        )} />
                      </button>
                      <span className="text-[9px] text-text-secondary font-bold">
                        {editPaused ? 'PAUSADO' : 'ATIVO'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(job)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-brand-mint/10 border border-brand-mint/30 text-brand-mint text-[9px] font-bold uppercase tracking-wider hover:bg-brand-mint/20 transition-colors"
                      >
                        <Icon name="check" size="xs" /> Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-border-panel text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <Icon name="close" size="xs" /> Cancelar
                      </button>
                      <button
                        onClick={() => { deleteCronJob(job.id); cancelEdit(); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded border border-accent-red/20 text-[9px] font-bold uppercase tracking-wider text-accent-red/60 hover:text-accent-red hover:bg-accent-red/5 transition-colors ml-auto"
                      >
                        <Icon name="delete" size="xs" /> Excluir
                      </button>
                    </div>
                  </>
                ) : (
                  /* ─── VIEW MODE ─── */
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-text-primary font-medium">{job.name}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => startEdit(job)}
                          className="p-1 rounded text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors"
                          title="Editar"
                        >
                          <Icon name="edit" size="xs" />
                        </button>
                        <Badge variant={badge.variant} size="sm">
                          <Icon name={badge.icon} size="xs" />
                          {badge.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="neutral" size="xs">{job.integration}</Badge>
                      <span className="text-[10px] font-mono text-text-secondary">{job.schedule}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-bg-base rounded p-2">
                        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Última execução</div>
                        <div className="text-[10px] font-mono text-text-primary">{job.lastRun || '—'}</div>
                      </div>
                      <div className="bg-bg-base rounded p-2">
                        <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Próxima execução</div>
                        <div className="text-[10px] font-mono text-text-primary">{job.nextRun || '—'}</div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: Stats Sidebar */}
        <div>
          <Card className="p-4 space-y-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Status dos Jobs</span>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="mint" glow />
                  <span className="text-[10px] text-text-secondary">Saudável</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.ok}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="orange" glow />
                  <span className="text-[10px] text-text-secondary">Alertas</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.warning}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="red" glow />
                  <span className="text-[10px] text-text-secondary">Falhou</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.failed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusDot color="blue" glow />
                  <span className="text-[10px] text-text-secondary">Pausados</span>
                </div>
                <span className="text-xs font-mono text-text-primary">{stats.paused}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
