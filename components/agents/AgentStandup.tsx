import { useState, useEffect, useCallback } from 'react';
import { Badge, Card, Icon, SectionLabel, Skeleton } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface StandupAgent {
  id: string;
  name: string;
  sessionsCount: number;
  lastActive: string;
}

interface StandupCron {
  name: string;
  status: string;
  lastRunAt: string;
}

interface StandupTask {
  title: string;
  from: string;
  to: string;
  movedAt: string;
}

interface StandupData {
  agents: StandupAgent[];
  cronsRan: StandupCron[];
  tasksMoved: StandupTask[];
  summary: string;
}

const API_URL = import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

export default function AgentStandup() {
  const [data, setData] = useState<StandupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/standup`, {
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar standup');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandup();
  }, [fetchStandup]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon="summarize">STANDUP — ÚLTIMAS 24H</SectionLabel>
        <button
          onClick={fetchStandup}
          disabled={loading}
          className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40"
        >
          <Icon name="refresh" size="xs" className={cn(loading && 'animate-spin')} />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      )}

      {error && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-accent-red">
            <Icon name="error_outline" size="sm" />
            <span className="text-[11px]">{error}</span>
          </div>
        </Card>
      )}

      {!loading && !error && data && (
        <div className="space-y-3">
          {/* Agent Activity */}
          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
              Atividade dos Agentes
            </span>
            {data.agents.length === 0 ? (
              <p className="text-[11px] text-text-secondary">Nenhum agente ativo</p>
            ) : (
              <div className="space-y-2">
                {data.agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="smart_toy" size="xs" className="text-text-secondary" />
                      <span className="text-[11px] text-text-primary">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="neutral" size="xs">
                        <span className="font-mono">{agent.sessionsCount}</span> sessões
                      </Badge>
                      <span className="text-[9px] font-mono text-text-secondary">
                        {formatRelativeTime(agent.lastActive)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Crons */}
          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
              Cron Jobs Executados
            </span>
            {data.cronsRan.length === 0 ? (
              <p className="text-[11px] text-text-secondary">Nenhum cron executado</p>
            ) : (
              <div className="space-y-2">
                {data.cronsRan.map((cron, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="schedule" size="xs" className="text-text-secondary" />
                      <span className="text-[11px] text-text-primary">{cron.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={cron.status === 'ok' || cron.status === 'success' ? 'mint' : 'red'}
                        size="xs"
                      >
                        {cron.status === 'ok' || cron.status === 'success' ? 'OK' : 'ERRO'}
                      </Badge>
                      <span className="text-[9px] font-mono text-text-secondary">
                        {cron.lastRunAt ? formatRelativeTime(cron.lastRunAt) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tasks Moved */}
          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
              Tarefas Movidas
            </span>
            {data.tasksMoved.length === 0 ? (
              <p className="text-[11px] text-text-secondary">Nenhuma tarefa movida</p>
            ) : (
              <div className="space-y-2">
                {data.tasksMoved.map((task, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="task_alt" size="xs" className="text-text-secondary shrink-0" />
                      <span className="text-[11px] text-text-primary truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Badge variant="neutral" size="xs">{task.from}</Badge>
                      <Icon name="arrow_forward" size="xs" className="text-text-secondary" />
                      <Badge variant="mint" size="xs">{task.to}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Summary */}
          {data.summary && (
            <Card className="p-4">
              <p className="text-[12px] font-bold text-text-primary">{data.summary}</p>
            </Card>
          )}
        </div>
      )}

      {!loading && !error && !data && (
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-secondary">
            <Icon name="summarize" size="lg" />
            <span className="text-[11px]">Standup não disponível</span>
          </div>
        </Card>
      )}
    </div>
  );
}
