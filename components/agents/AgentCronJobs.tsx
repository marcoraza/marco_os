import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { getCronJobsForAgent, jobBadge } from '../../data/agentMockData';

interface AgentCronJobsProps {
  agentId: string;
}

export default function AgentCronJobs({ agentId }: AgentCronJobsProps) {
  const jobs = useMemo(() => getCronJobsForAgent(agentId), [agentId]);

  const stats = useMemo(() => {
    const counts = { ok: 0, warning: 0, failed: 0, paused: 0 };
    for (const job of jobs) {
      counts[job.status]++;
    }
    return counts;
  }, [jobs]);

  if (jobs.length === 0) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="schedule">CRON JOBS</SectionLabel>
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
      <SectionLabel icon="schedule">CRON JOBS</SectionLabel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Job List */}
        <div className="xl:col-span-2 space-y-2">
          {jobs.map((job) => {
            const badge = jobBadge[job.status];
            return (
              <Card key={job.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-primary font-medium">{job.name}</span>
                  <Badge variant={badge.variant} size="sm">
                    <Icon name={badge.icon} size="xs" />
                    {badge.label}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="neutral" size="xs">{job.integration}</Badge>
                  <span className="text-[10px] font-mono text-text-secondary">{job.schedule}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg-base rounded p-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Última execução</div>
                    <div className="text-[10px] font-mono text-text-primary">{job.lastRun}</div>
                  </div>
                  <div className="bg-bg-base rounded p-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Próxima execução</div>
                    <div className="text-[10px] font-mono text-text-primary">{job.nextRun}</div>
                  </div>
                </div>
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
