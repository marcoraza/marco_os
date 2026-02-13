import React, { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot, TabNav } from './ui';
import type { Tab } from './ui/TabNav';
import { cn } from '../utils/cn';

import type { Agent, AgentStatus, AgentRole } from '../types/agents';

interface PullRequest {
  id: string;
  title: string;
  repo: string;
  branch: string;
  status: 'draft' | 'review' | 'approved' | 'merged' | 'blocked';
  author: string;
  updatedAt: string;
}

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'ok' | 'warning' | 'failed' | 'paused';
  integration: 'OpenClaw' | 'Gmail' | 'Google Calendar' | 'GitHub';
}

interface HeartbeatEvent {
  id: string;
  agentId: string;
  agentName: string;
  ts: string;
  latencyMs: number;
  status: 'ok' | 'late' | 'missed';
  note?: string;
}

interface MemoryArtifact {
  id: string;
  path: string;
  kind: 'daily' | 'long-term' | 'config' | 'log';
  updatedAt: string;
  size: string;
  summary: string;
}

interface CommsEvent {
  id: string;
  channel: 'Gmail' | 'Calendar' | 'Telegram' | 'GitHub';
  ts: string;
  title: string;
  from?: string;
  to?: string;
  status: 'sent' | 'received' | 'scheduled' | 'action-required' | 'info';
  detail?: string;
}

const statusDot: Record<AgentStatus, { color: 'mint' | 'orange' | 'blue' | 'red'; label: string }> = {
  online: { color: 'mint', label: 'ONLINE' },
  busy: { color: 'orange', label: 'BUSY' },
  idle: { color: 'blue', label: 'IDLE' },
  offline: { color: 'red', label: 'OFFLINE' },
};

const jobBadge: Record<CronJob['status'], { variant: 'mint' | 'orange' | 'red' | 'neutral'; label: string; icon: string }> = {
  ok: { variant: 'mint', label: 'OK', icon: 'check_circle' },
  warning: { variant: 'orange', label: 'WARN', icon: 'warning' },
  failed: { variant: 'red', label: 'FAILED', icon: 'error' },
  paused: { variant: 'neutral', label: 'PAUSED', icon: 'pause_circle' },
};

const prBadge: Record<PullRequest['status'], { variant: 'mint' | 'orange' | 'red' | 'blue' | 'neutral'; label: string; icon: string }> = {
  draft: { variant: 'neutral', label: 'DRAFT', icon: 'edit' },
  review: { variant: 'orange', label: 'REVIEW', icon: 'rate_review' },
  approved: { variant: 'mint', label: 'APPROVED', icon: 'verified' },
  merged: { variant: 'mint', label: 'MERGED', icon: 'merge' },
  blocked: { variant: 'red', label: 'BLOCKED', icon: 'block' },
};

const heartbeatBadge: Record<HeartbeatEvent['status'], { variant: 'mint' | 'orange' | 'red'; label: string; icon: string }> = {
  ok: { variant: 'mint', label: 'OK', icon: 'wifi_tethering' },
  late: { variant: 'orange', label: 'LATE', icon: 'schedule' },
  missed: { variant: 'red', label: 'MISSED', icon: 'wifi_off' },
};

const commsBadge: Record<CommsEvent['status'], { variant: 'mint' | 'orange' | 'blue' | 'neutral' | 'red'; label: string; icon: string }> = {
  sent: { variant: 'blue', label: 'SENT', icon: 'send' },
  received: { variant: 'mint', label: 'RECEIVED', icon: 'inbox' },
  scheduled: { variant: 'neutral', label: 'SCHEDULED', icon: 'event' },
  'action-required': { variant: 'orange', label: 'ACTION', icon: 'priority_high' },
  info: { variant: 'neutral', label: 'INFO', icon: 'info' },
};

const memoryBadge: Record<MemoryArtifact['kind'], { variant: 'mint' | 'orange' | 'blue' | 'neutral'; label: string; icon: string }> = {
  daily: { variant: 'mint', label: 'DAILY', icon: 'calendar_today' },
  'long-term': { variant: 'blue', label: 'LONG-TERM', icon: 'bookmark' },
  config: { variant: 'neutral', label: 'CONFIG', icon: 'tune' },
  log: { variant: 'orange', label: 'LOG', icon: 'receipt_long' },
};

const tabs: Tab[] = [
  { id: 'agents', label: 'Centro de Agentes', icon: 'monitoring' },
  { id: 'mission-control', label: 'Mission Control', icon: 'hub' },
  { id: 'cron-jobs', label: 'Cron Jobs', icon: 'schedule' },
  { id: 'heartbeat', label: 'Heartbeat Monitor', icon: 'monitor_heart' },
  { id: 'memory', label: 'Memory Browser', icon: 'memory' },
  { id: 'comms', label: 'Communication Log', icon: 'forum' },
];

type AgentCenterProps = {
  selectedAgentId: string;
  roster: Agent[];
};

export default function AgentCenter({ selectedAgentId, roster }: AgentCenterProps) {
  const [activeTab, setActiveTab] = useState<string>('agents');

  const selectedAgent = roster.find(a => a.id === selectedAgentId) || roster[0];

  // NOTE: Roster + add-agent modal now live in the left sidebar (App.tsx).

  // Mock data (realistic to OpenClaw/Frank setup)
  const agents: Agent[] = useMemo(
    () => [
      {
        id: 'frank',
        name: 'Frank',
        role: 'coordinator',
        model: 'OpenClaw',
        owner: '@marco',
        status: 'online',
        lastHeartbeat: '22:51:58Z',
        uptime: '14d 03h',
        currentMission: 'PR4 • Agent Center (P0)',
        tags: ['orchestrator', 'gateway', 'mission-control'],
      },
      {
        id: 'gpt52-planner',
        name: 'Planner',
        role: 'sub-agent',
        model: 'GPT-5.2',
        owner: 'Frank',
        status: 'busy',
        lastHeartbeat: '22:51:43Z',
        uptime: '3h 18m',
        currentMission: 'Spec + UX alignment',
        tags: ['analysis', 'tickets', 'roadmap'],
      },
      {
        id: 'gpt52-codegen',
        name: 'CodeGen',
        role: 'sub-agent',
        model: 'GPT-5.2',
        owner: 'Frank',
        status: 'online',
        lastHeartbeat: '22:51:47Z',
        uptime: '2h 02m',
        currentMission: 'React/Vite component implementation',
        tags: ['typescript', 'ui', 'vite'],
      },
      {
        id: 'gpt52-qa',
        name: 'QA',
        role: 'sub-agent',
        model: 'GPT-5.2',
        owner: 'Frank',
        status: 'idle',
        lastHeartbeat: '22:51:21Z',
        uptime: '52m',
        currentMission: 'Build verification + smoke checks',
        tags: ['tests', 'build', 'lint'],
      },
      {
        id: 'gmail-calendar',
        name: 'Gmail/Calendar Bridge',
        role: 'integration',
        status: 'online',
        lastHeartbeat: '22:50:10Z',
        uptime: '7d 09h',
        currentMission: 'Sync events + actionable emails',
        tags: ['gmail', 'calendar', 'sync'],
      },
    ],
    []
  );

  const prs: PullRequest[] = useMemo(
    () => [
      {
        id: '#2',
        title: 'Sync latest zip export (theme + mobile)',
        repo: 'marco_os',
        branch: 'chore/sync-latest-zip',
        status: 'merged',
        author: 'Frank',
        updatedAt: '2026-02-12 20:11Z',
      },
      {
        id: '#4',
        title: 'Agent Center (Mission Control) reintroduction',
        repo: 'marco_os',
        branch: 'feat/agent-center',
        status: 'review',
        author: 'CodeGen',
        updatedAt: '2026-02-12 22:52Z',
      },
      {
        id: '#7',
        title: 'Cron/Heartbeat telemetry widgets',
        repo: 'openclaw',
        branch: 'feat/telemetry-widgets',
        status: 'draft',
        author: 'Planner',
        updatedAt: '2026-02-11 18:04Z',
      },
    ],
    []
  );

  const jobs: CronJob[] = useMemo(
    () => [
      {
        id: 'cron-1',
        name: 'Inbox triage → action queue',
        schedule: '*/20m',
        lastRun: '22:40Z (OK)',
        nextRun: '23:00Z',
        status: 'ok',
        integration: 'Gmail',
      },
      {
        id: 'cron-2',
        name: 'Calendar scan → next 48h brief',
        schedule: '0 */3h',
        lastRun: '21:00Z (OK)',
        nextRun: '00:00Z',
        status: 'ok',
        integration: 'Google Calendar',
      },
      {
        id: 'cron-3',
        name: 'PR watcher → mentions + reviews',
        schedule: '*/10m',
        lastRun: '22:50Z (WARN)',
        nextRun: '23:00Z',
        status: 'warning',
        integration: 'GitHub',
      },
      {
        id: 'cron-4',
        name: 'Gateway healthcheck (OpenClaw daemon)',
        schedule: '*/5m',
        lastRun: '22:50Z (OK)',
        nextRun: '22:55Z',
        status: 'ok',
        integration: 'OpenClaw',
      },
      {
        id: 'cron-5',
        name: 'Weekly memory distill → MEMORY.md',
        schedule: 'Mon 09:00',
        lastRun: '2026-02-10 (PAUSED)',
        nextRun: '2026-02-17',
        status: 'paused',
        integration: 'OpenClaw',
      },
    ],
    []
  );

  const heartbeats: HeartbeatEvent[] = useMemo(
    () => [
      { id: 'hb-1', agentId: 'frank', agentName: 'Frank', ts: '22:51:58Z', latencyMs: 84, status: 'ok', note: 'gateway ok' },
      { id: 'hb-2', agentId: 'gpt52-codegen', agentName: 'CodeGen', ts: '22:51:47Z', latencyMs: 132, status: 'ok' },
      { id: 'hb-3', agentId: 'gpt52-planner', agentName: 'Planner', ts: '22:51:43Z', latencyMs: 210, status: 'late', note: 'high tool load' },
      { id: 'hb-4', agentId: 'gmail-calendar', agentName: 'Gmail/Calendar Bridge', ts: '22:50:10Z', latencyMs: 510, status: 'ok' },
      { id: 'hb-5', agentId: 'gpt52-qa', agentName: 'QA', ts: '22:47:03Z', latencyMs: 0, status: 'missed', note: 'sleeping / idle budget' },
    ],
    []
  );

  const memory: MemoryArtifact[] = useMemo(
    () => [
      {
        id: 'mem-1',
        path: 'MEMORY.md',
        kind: 'long-term',
        updatedAt: '2026-02-11 09:12Z',
        size: '18.2 KB',
        summary: 'Long-term memories: workflows, preferences, recurring patterns.',
      },
      {
        id: 'mem-2',
        path: 'memory/2026-02-12.md',
        kind: 'daily',
        updatedAt: '2026-02-12 22:10Z',
        size: '6.4 KB',
        summary: 'PR4 planning, UI alignment, build checks and repo sync notes.',
      },
      {
        id: 'mem-3',
        path: 'AGENTS.md',
        kind: 'config',
        updatedAt: '2026-02-10 18:40Z',
        size: '5.1 KB',
        summary: 'Workspace rules, heartbeat guidance, safety and cadence.',
      },
      {
        id: 'mem-4',
        path: 'memory/heartbeat-state.json',
        kind: 'log',
        updatedAt: '2026-02-12 22:50Z',
        size: '0.7 KB',
        summary: 'Last checks state for email/calendar/weather rotations.',
      },
    ],
    []
  );

  const comms: CommsEvent[] = useMemo(
    () => [
      {
        id: 'c-1',
        channel: 'GitHub',
        ts: '22:52Z',
        title: 'PR #4 requested review',
        from: 'CodeGen',
        status: 'action-required',
        detail: 'Needs UI consistency pass + mobile nav integration.',
      },
      {
        id: 'c-2',
        channel: 'Gmail',
        ts: '22:40Z',
        title: 'Unread: “Invoice • AWS Credits”',
        from: 'billing@amazon.com',
        status: 'received',
        detail: 'Auto-labeled: FINANÇAS. Suggested action: add task to Finance.',
      },
      {
        id: 'c-3',
        channel: 'Calendar',
        ts: 'Tomorrow 13:00',
        title: 'Meeting: Product sync (45m)',
        to: '@marco',
        status: 'scheduled',
        detail: 'Prep brief created. Agenda + last decisions attached.',
      },
      {
        id: 'c-4',
        channel: 'Telegram',
        ts: '21:10Z',
        title: 'Message: “ship tonight?”',
        from: '@marco',
        status: 'received',
        detail: 'Auto-drafted response saved (not sent).',
      },
    ],
    []
  );

  const onlineCount = agents.filter(a => a.status !== 'offline').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-md bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint shrink-0">
                <Icon name="smart_toy" size="lg" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-text-secondary">Agent Center</p>
                <h1 className="text-sm md:text-base font-black text-text-primary truncate">Mission Control • OpenClaw</h1>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="mint" size="sm"><Icon name="podcasts" className="text-[12px]" /> {onlineCount} ONLINE</Badge>
              <Badge variant={busyCount > 0 ? 'orange' : 'neutral'} size="sm"><Icon name="autorenew" className="text-[12px]" /> {busyCount} BUSY</Badge>
              <Badge variant="neutral" size="sm"><Icon name="account_tree" className="text-[12px]" /> OpenClaw/Frank</Badge>
              <Badge variant="neutral" size="sm"><Icon name="psychology" className="text-[12px]" /> GPT-5.2 sub-agents</Badge>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button className="px-3 py-2 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-xs font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary flex items-center gap-2">
              <Icon name="refresh" size="sm" />
              Sync
            </button>
            <button className="px-3 py-2 rounded-md border border-border-panel bg-bg-base hover:bg-surface-hover transition-colors text-xs font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary flex items-center gap-2">
              <Icon name="tune" size="sm" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor="mint" />

      {/* Body */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-6">
        {activeTab === 'agents' && selectedAgent && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className={cn(
                    'size-12 rounded-md border flex items-center justify-center shrink-0',
                    selectedAgent.role === 'coordinator' && 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
                    selectedAgent.role === 'sub-agent' && 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                    selectedAgent.role === 'integration' && 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
                  )}>
                    <Icon name={selectedAgent.avatarIcon || (selectedAgent.role === 'coordinator' ? 'shield' : selectedAgent.role === 'integration' ? 'link' : 'psychology')} size="lg" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-text-primary truncate">{selectedAgent.name}</p>
                      <Badge variant={selectedAgent.role === 'coordinator' ? 'purple' : selectedAgent.role === 'integration' ? 'blue' : 'mint'} size="xs">
                        {(selectedAgent.domain || (selectedAgent.role === 'coordinator' ? 'COORDENADOR' : selectedAgent.role === 'integration' ? 'INTEGRAÇÃO' : 'SUB-AGENT')).toUpperCase()}
                      </Badge>
                      <StatusDot color={statusDot[selectedAgent.status].color} glow={selectedAgent.status !== 'offline'} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                        {statusDot[selectedAgent.status].label}
                      </span>
                      {selectedAgent.model && (
                        <Badge variant="neutral" size="xs"><Icon name="bolt" className="text-[10px]" /> {selectedAgent.model}</Badge>
                      )}
                    </div>
                    {selectedAgent.handle && (
                      <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">{selectedAgent.handle}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="neutral" size="xs"><Icon name="timer" className="text-[10px]" /> Uptime {selectedAgent.uptime}</Badge>
                      <Badge variant="neutral" size="xs"><Icon name="favorite" className="text-[10px]" /> HB {selectedAgent.lastHeartbeat}</Badge>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Centro de Agentes</p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Painel do agente selecionado</p>
                </div>
              </div>
            </Card>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: 'smart_toy', label: 'Agentes Ativos', value: String(roster.filter(a => a.status !== 'offline').length), color: 'text-brand-mint' },
                { icon: 'rocket_launch', label: 'Missões em Execução', value: '3', color: 'text-accent-orange' },
                { icon: 'timer', label: 'Uptime Médio', value: '14d 03h', color: 'text-accent-blue' },
                { icon: 'task_alt', label: 'Tasks Concluídas', value: '47', color: 'text-brand-mint' },
              ].map(stat => (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('size-10 rounded-md border border-border-panel bg-surface flex items-center justify-center', stat.color)}>
                      <Icon name={stat.icon} size="lg" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{stat.label}</p>
                      <p className={cn('text-xl font-black mt-1', stat.color)}>{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Activity Chart (CSS-only) */}
              <Card className="xl:col-span-2 p-4">
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel icon="bar_chart">Atividade Semanal</SectionLabel>
                  <Badge variant="neutral" size="xs"><Icon name="calendar_today" className="text-[10px]" /> 7 dias</Badge>
                </div>
                <div className="flex items-end gap-2 h-40 px-2">
                  {[
                    { day: 'Seg', h: 65, tasks: 8 },
                    { day: 'Ter', h: 80, tasks: 11 },
                    { day: 'Qua', h: 45, tasks: 5 },
                    { day: 'Qui', h: 90, tasks: 14 },
                    { day: 'Sex', h: 70, tasks: 9 },
                    { day: 'Sáb', h: 30, tasks: 3 },
                    { day: 'Dom', h: 20, tasks: 2 },
                  ].map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold text-brand-mint">{d.tasks}</span>
                      <div className="w-full rounded-t-sm bg-brand-mint/20 relative overflow-hidden" style={{ height: `${d.h}%` }}>
                        <div className="absolute inset-0 bg-brand-mint/40 rounded-t-sm" style={{ height: `${Math.min(100, d.h + 10)}%` }} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary">{d.day}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Timeline */}
              <Card className="p-4">
                <SectionLabel icon="history" className="mb-4">Eventos Recentes</SectionLabel>
                <div className="space-y-0">
                  {[
                    { agent: 'Frank', action: 'Mergeou PR #7 (Agent Roster)', time: '14:18', color: 'bg-accent-purple' },
                    { agent: 'Frank', action: 'Atualizou preview GitHub Pages', time: '14:39', color: 'bg-accent-purple' },
                    { agent: 'Agente E2', action: 'Novo lead qualificado no CRM', time: '09:45', color: 'bg-brand-mint' },
                    { agent: 'System', action: 'Backup diário realizado', time: '08:00', color: 'bg-text-secondary' },
                    { agent: 'Frank', action: 'Heartbeat check: email + calendar', time: '07:30', color: 'bg-accent-purple' },
                  ].map((ev, i) => (
                    <div key={i} className="flex gap-3 py-2">
                      <div className="flex flex-col items-center">
                        <div className={cn('size-2 rounded-full shrink-0 mt-1.5', ev.color)} />
                        {i < 4 && <div className="w-px flex-1 bg-border-panel mt-1" />}
                      </div>
                      <div className="min-w-0 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-text-primary">{ev.agent}</span>
                          <span className="text-[9px] font-mono text-text-secondary">{ev.time}</span>
                        </div>
                        <p className="text-[10px] text-text-secondary font-bold mt-0.5">{ev.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Agent Performance Cards */}
              {roster.slice(0, 4).map(agent => (
                <Card key={agent.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'size-12 rounded-md border flex items-center justify-center shrink-0',
                      agent.role === 'coordinator' && 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
                      agent.role === 'sub-agent' && 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                      agent.role === 'integration' && 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
                    )}>
                      <Icon name={agent.avatarIcon || (agent.role === 'coordinator' ? 'shield' : 'psychology')} className="text-2xl" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-text-primary">{agent.name}</p>
                        <Badge variant={agent.role === 'coordinator' ? 'purple' : 'mint'} size="xs">
                          {agent.domain || (agent.role === 'coordinator' ? 'COORDENADOR' : 'SUB-AGENT')}
                        </Badge>
                        <StatusDot color={statusDot[agent.status].color} glow={agent.status !== 'offline'} />
                      </div>
                      {agent.handle && <p className="text-[10px] text-text-secondary font-bold mt-1">{agent.handle}</p>}
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        <div className="p-2 rounded-md border border-border-panel bg-bg-base/40 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Missões</p>
                          <p className="text-sm font-black text-brand-mint mt-1">{agent.role === 'coordinator' ? '24' : '12'}</p>
                        </div>
                        <div className="p-2 rounded-md border border-border-panel bg-bg-base/40 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Tempo Médio</p>
                          <p className="text-sm font-black text-accent-blue mt-1">{agent.role === 'coordinator' ? '18m' : '25m'}</p>
                        </div>
                        <div className="p-2 rounded-md border border-border-panel bg-bg-base/40 text-center">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Uptime</p>
                          <p className="text-sm font-black text-text-primary mt-1">{agent.uptime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Integrations Status */}
            <Card className="p-4">
              <SectionLabel icon="extension" className="mb-4">Integrações Ativas</SectionLabel>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: 'Gmail', icon: 'mail', connected: true, color: '#EA4335' },
                  { name: 'Calendar', icon: 'calendar_today', connected: true, color: '#4285F4' },
                  { name: 'GitHub', icon: 'code', connected: true, color: '#FFFFFF' },
                  { name: 'ClawDeck', icon: 'dashboard', connected: true, color: '#00FF95' },
                ].map(intg => (
                  <div key={intg.name} className="p-3 rounded-md border border-border-panel bg-bg-base/40 hover:bg-surface-hover transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md flex items-center justify-center border border-border-panel" style={{ color: intg.color, backgroundColor: `${intg.color}10`, borderColor: `${intg.color}30` }}>
                        <Icon name={intg.icon} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-text-primary">{intg.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn('size-1.5 rounded-full', intg.connected ? 'bg-brand-mint' : 'bg-accent-red')} />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary">
                            {intg.connected ? 'Conectado' : 'Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        {activeTab === 'mission-control' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Agents list */}
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="smart_toy">Agents</SectionLabel>
                <Badge variant="neutral" size="xs"><Icon name="groups" className="text-[10px]" /> {agents.length} TOTAL</Badge>
              </div>

              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'size-9 rounded-md border flex items-center justify-center shrink-0',
                        agent.role === 'coordinator' && 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
                        agent.role === 'sub-agent' && 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                        agent.role === 'integration' && 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
                      )}>
                        <Icon name={agent.role === 'integration' ? 'link' : agent.role === 'coordinator' ? 'shield' : 'psychology'} size="lg" />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{agent.name}</p>
                          <Badge
                            variant={agent.role === 'coordinator' ? 'purple' : agent.role === 'integration' ? 'blue' : 'mint'}
                            size="xs"
                          >
                            {agent.role === 'coordinator' ? 'COORDENADOR' : agent.role === 'integration' ? 'INTEGRATION' : 'SUB-AGENT'}
                          </Badge>
                          {agent.model && (
                            <Badge variant="neutral" size="xs"><Icon name="bolt" className="text-[10px]" /> {agent.model}</Badge>
                          )}
                        </div>

                        <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">
                          {agent.currentMission ? agent.currentMission : 'No active mission'}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="neutral" size="xs"><Icon name="timer" className="text-[10px]" /> Uptime {agent.uptime}</Badge>
                          <Badge variant="neutral" size="xs"><Icon name="favorite" className="text-[10px]" /> HB {agent.lastHeartbeat}</Badge>
                          <div className="flex items-center gap-2">
                            <StatusDot color={statusDot[agent.status].color} glow={agent.status !== 'offline'} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                              {statusDot[agent.status].label}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {agent.tags.slice(0, 4).map(t => (
                            <span key={t} className="text-[9px] font-bold text-text-secondary bg-surface px-2 py-0.5 rounded-sm border border-border-panel">{t}</span>
                          ))}
                        </div>
                      </div>

                      <button className="shrink-0 px-2 py-1 rounded-md border border-border-panel bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors">
                        <Icon name="more_horiz" size="sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* PRs */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="code">Pull Requests</SectionLabel>
                <Badge variant="neutral" size="xs"><Icon name="fork_right" className="text-[10px]" /> {prs.length}</Badge>
              </div>

              <div className="space-y-2">
                {prs.map(pr => {
                  const b = prBadge[pr.status];
                  return (
                    <div key={pr.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-text-primary truncate">{pr.id} {pr.title}</p>
                          <p className="text-[9px] text-text-secondary font-bold mt-1 truncate">
                            {pr.repo} • {pr.branch}
                          </p>
                        </div>
                        <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-text-secondary font-bold">
                        <span className="truncate">by {pr.author}</span>
                        <span className="font-mono">{pr.updatedAt}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'cron-jobs' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="schedule">Cron Jobs</SectionLabel>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="xs"><Icon name="auto_awesome" className="text-[10px]" /> mock</Badge>
                  <Badge variant="neutral" size="xs"><Icon name="list" className="text-[10px]" /> {jobs.length}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                {jobs.map(job => {
                  const b = jobBadge[job.status];
                  return (
                    <div key={job.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{job.name}</p>
                          <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">
                            {job.integration} • <span className="font-mono">{job.schedule}</span>
                          </p>
                        </div>
                        <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-md border border-border-panel bg-surface">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Last run</p>
                          <p className="text-[10px] font-bold text-text-primary mt-1 font-mono">{job.lastRun}</p>
                        </div>
                        <div className="p-2 rounded-md border border-border-panel bg-surface">
                          <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Next run</p>
                          <p className="text-[10px] font-bold text-text-primary mt-1 font-mono">{job.nextRun}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <SectionLabel icon="insights" className="mb-4">Telemetry</SectionLabel>

              <div className="space-y-3">
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Healthy</p>
                    <Badge variant="mint" size="xs"><Icon name="check" className="text-[10px]" /> {jobs.filter(j => j.status === 'ok').length}</Badge>
                  </div>
                  <p className="mt-2 text-xs font-black text-text-primary">Automations stable</p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Most runs are <span className="text-brand-mint">OK</span>; warnings are typically API throttling.</p>
                </div>

                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Attention</p>
                    <Badge variant={jobs.some(j => j.status === 'failed') ? 'red' : 'orange'} size="xs">
                      <Icon name="warning" className="text-[10px]" /> {jobs.filter(j => j.status === 'warning' || j.status === 'failed').length}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs font-black text-text-primary">GitHub watcher throttling</p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Backoff set to 10m; recommend token rotation if persistent.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'heartbeat' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="monitor_heart">Heartbeat Monitor</SectionLabel>
                <Badge variant="neutral" size="xs"><Icon name="timeline" className="text-[10px]" /> latest pings</Badge>
              </div>

              <div className="space-y-2">
                {heartbeats.map(hb => {
                  const b = heartbeatBadge[hb.status];
                  return (
                    <div key={hb.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{hb.agentName}</p>
                          <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">{hb.note || 'No note'}</p>
                        </div>
                        <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-text-secondary font-bold">
                        <span className="font-mono">{hb.ts}</span>
                        <span className="font-mono">{hb.latencyMs > 0 ? `${hb.latencyMs}ms` : '—'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <SectionLabel icon="shield" className="mb-4">SLO</SectionLabel>
              <div className="space-y-3">
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Target</p>
                  <p className="mt-2 text-xs font-black text-text-primary">Heartbeat <span className="text-brand-mint">&lt; 60s</span></p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Late pings are tolerated during heavy tool usage.</p>
                </div>
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Now</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant="mint" size="xs"><Icon name="check" className="text-[10px]" /> {heartbeats.filter(h => h.status === 'ok').length} OK</Badge>
                    <Badge variant="orange" size="xs"><Icon name="schedule" className="text-[10px]" /> {heartbeats.filter(h => h.status === 'late').length} LATE</Badge>
                    <Badge variant="red" size="xs"><Icon name="wifi_off" className="text-[10px]" /> {heartbeats.filter(h => h.status === 'missed').length} MISSED</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="memory">Memory Browser</SectionLabel>
                <Badge variant="neutral" size="xs"><Icon name="folder" className="text-[10px]" /> artifacts</Badge>
              </div>

              <div className="space-y-2">
                {memory.map(m => {
                  const b = memoryBadge[m.kind];
                  return (
                    <div key={m.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{m.path}</p>
                          <p className="text-[10px] text-text-secondary font-bold mt-1">{m.summary}</p>
                        </div>
                        <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-text-secondary font-bold">
                        <span className="font-mono">{m.updatedAt}</span>
                        <span className="font-mono">{m.size}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <SectionLabel icon="travel_explore" className="mb-4">Search</SectionLabel>
              <div className="space-y-3">
                <div className="relative">
                  <Icon name="search" size="lg" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    placeholder="Search memories, tags, agents…"
                    className="w-full bg-bg-base border border-border-panel rounded-md pl-10 pr-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder:text-text-secondary/40"
                  />
                </div>
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Tip</p>
                  <p className="mt-2 text-xs font-black text-text-primary">Distill → MEMORY.md</p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">Keep daily logs raw; promote stable preferences to long-term memory.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'comms' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="forum">Communication Log</SectionLabel>
                <Badge variant="neutral" size="xs"><Icon name="history" className="text-[10px]" /> recent</Badge>
              </div>

              <div className="space-y-2">
                {comms.map(ev => {
                  const b = commsBadge[ev.status];
                  return (
                    <div key={ev.id} className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{ev.title}</p>
                          <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">
                            {ev.channel}{ev.from ? ` • from ${ev.from}` : ''}{ev.to ? ` • to ${ev.to}` : ''}
                          </p>
                        </div>
                        <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
                      </div>
                      {ev.detail && (
                        <p className="mt-2 text-[10px] text-text-secondary font-bold">{ev.detail}</p>
                      )}
                      <div className="mt-2 flex justify-end text-[10px] text-text-secondary font-bold">
                        <span className="font-mono">{ev.ts}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <SectionLabel icon="mark_email_unread" className="mb-4">Quick Actions</SectionLabel>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-xs font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary flex items-center gap-2 justify-center">
                  <Icon name="mail" size="sm" />
                  Open Inbox
                </button>
                <button className="w-full px-3 py-2 rounded-md border border-border-panel bg-bg-base hover:bg-surface-hover transition-colors text-xs font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary flex items-center gap-2 justify-center">
                  <Icon name="event" size="sm" />
                  Open Calendar
                </button>
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40 mt-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Note</p>
                  <p className="mt-2 text-xs font-black text-text-primary">Outbound actions are disabled in mock</p>
                  <p className="text-[10px] text-text-secondary font-bold mt-1">This panel is UI-first; wiring to OpenClaw cron/logs can come next.</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
