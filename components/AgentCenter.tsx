import React, { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot, TabNav } from './ui';
import type { Tab } from './ui/TabNav';
import { cn } from '../utils/cn';

type AgentStatus = 'online' | 'busy' | 'idle' | 'offline';

type AgentRole = 'coordinator' | 'sub-agent' | 'integration';

interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  model?: string;
  owner?: string;
  status: AgentStatus;
  lastHeartbeat: string;
  uptime: string;
  currentMission?: string;
  tags: string[];

  // roster meta
  domain?: string;    // ex: OPERAÇÕES
  handle?: string;    // ex: @emilizaremba
  avatarIcon?: string; // material-symbols
}

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
  { id: 'agents', label: 'Agentes', icon: 'groups' },
  { id: 'mission-control', label: 'Mission Control', icon: 'hub' },
  { id: 'cron-jobs', label: 'Cron Jobs', icon: 'schedule' },
  { id: 'heartbeat', label: 'Heartbeat Monitor', icon: 'monitor_heart' },
  { id: 'memory', label: 'Memory Browser', icon: 'memory' },
  { id: 'comms', label: 'Communication Log', icon: 'forum' },
];

export default function AgentCenter() {
  const [activeTab, setActiveTab] = useState<string>('agents');

  // Local-only roster state (UI mock)
  const [roster, setRoster] = useState<Agent[]>(() => [
    {
      id: 'frank-roster',
      name: 'Frank',
      role: 'coordinator',
      model: 'OpenClaw',
      owner: '@marco',
      status: 'online',
      lastHeartbeat: '22:51:58Z',
      uptime: '14d 03h',
      tags: ['orchestrator'],
      domain: 'COORDENADOR',
      avatarIcon: 'shield',
    },
    {
      id: 'e2',
      name: 'Agente E2',
      role: 'sub-agent',
      model: 'Opus',
      owner: 'Frank',
      status: 'online',
      lastHeartbeat: '22:51:12Z',
      uptime: '6h 44m',
      tags: ['ops'],
      domain: 'OPERAÇÕES',
      handle: '@emilizaremba',
      avatarIcon: 'psychology',
    },
  ]);

  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [addAgentStep, setAddAgentStep] = useState<'choose' | 'integrate' | 'create'>('choose');
  const [addAgentForm, setAddAgentForm] = useState({
    name: '',
    role: 'sub-agent' as AgentRole,
    domain: '',
    handle: '',
    instructions: '',
    model: 'Opus',
    apiKey: '',
    tools: {
      gmail: false,
      calendar: false,
      github: false,
      clawDeck: false,
    },
  });

  const resetAddAgent = () => {
    setAddAgentStep('choose');
    setAddAgentForm({
      name: '',
      role: 'sub-agent',
      domain: '',
      handle: '',
      instructions: '',
      model: 'Opus',
      apiKey: '',
      tools: { gmail: false, calendar: false, github: false, clawDeck: false },
    });
  };

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
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Roster */}
            <Card className="xl:col-span-1 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="groups">AGENTES</SectionLabel>
                <Badge variant="neutral" size="xs">
                  <Icon name="badge" className="text-[10px]" /> {roster.length}
                </Badge>
              </div>

              <div className="space-y-2">
                {roster.map(agent => (
                  <div
                    key={agent.id}
                    className="p-3 rounded-md border border-border-card bg-bg-base/40 hover:bg-surface-hover transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'size-9 rounded-md border flex items-center justify-center shrink-0',
                          agent.role === 'coordinator' && 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple',
                          agent.role === 'sub-agent' && 'bg-brand-mint/10 border-brand-mint/20 text-brand-mint',
                          agent.role === 'integration' && 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue'
                        )}
                      >
                        <Icon
                          name={agent.avatarIcon || (agent.role === 'integration' ? 'link' : agent.role === 'coordinator' ? 'shield' : 'psychology')}
                          size="lg"
                        />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-xs font-black text-text-primary truncate">{agent.name}</p>
                          <Badge
                            variant={agent.role === 'coordinator' ? 'purple' : agent.role === 'integration' ? 'blue' : 'mint'}
                            size="xs"
                          >
                            {agent.domain || (agent.role === 'coordinator' ? 'COORDENADOR' : agent.role === 'integration' ? 'INTEGRATION' : 'SUB-AGENT')}
                          </Badge>
                        </div>

                        {agent.handle && (
                          <p className="text-[10px] text-text-secondary font-bold mt-1 truncate">{agent.handle}</p>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <StatusDot color={statusDot[agent.status].color} glow={agent.status !== 'offline'} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                            {statusDot[agent.status].label}
                          </span>
                          {agent.model && (
                            <Badge variant="neutral" size="xs">
                              <Icon name="bolt" className="text-[10px]" /> {agent.model}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  resetAddAgent();
                  setIsAddAgentOpen(true);
                }}
                className="mt-4 w-full px-3 py-2 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary flex items-center justify-center gap-2"
              >
                <Icon name="add" size="sm" /> + ADICIONAR AGENTE
              </button>
            </Card>

            {/* Details / placeholder */}
            <Card className="xl:col-span-2 p-4">
              <div className="flex items-center justify-between mb-4">
                <SectionLabel icon="dashboard">Resumo</SectionLabel>
                <Badge variant="neutral" size="xs">
                  <Icon name="info" className="text-[10px]" /> UI mock
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Ativo agora</p>
                  <p className="mt-2 text-sm font-black text-text-primary">{roster.filter(a => a.status !== 'offline').length}</p>
                </div>
                <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Integrações</p>
                  <p className="mt-2 text-sm font-black text-text-primary">Gmail • Calendar • GitHub</p>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-text-secondary font-bold leading-relaxed">
                Esta aba é apenas front-end/state local. O roster e o modal de criação são mockados para alinhar com o layout do print.
              </p>
            </Card>

            {/* Add Agent Modal */}
            {isAddAgentOpen && (
              <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                  onClick={() => setIsAddAgentOpen(false)}
                />

                <div className="relative w-full md:max-w-2xl bg-surface rounded-t-xl md:rounded-xl border-t md:border border-border-panel shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 max-h-[90vh] md:max-h-[85vh] flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b border-border-panel shrink-0">
                    <h2 className="text-base md:text-lg font-black tracking-tight text-text-primary flex items-center gap-2">
                      <Icon name="person_add" className="text-brand-mint" />
                      ADICIONAR AGENTE
                    </h2>
                    <button
                      onClick={() => setIsAddAgentOpen(false)}
                      className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-border-panel"
                    >
                      <Icon name="close" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
                    {addAgentStep === 'choose' && (
                      <div className="space-y-3">
                        <div className="p-3 rounded-md border border-border-card bg-bg-base/40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Opções</p>
                          <p className="mt-1 text-xs text-text-secondary font-bold">Selecione como deseja adicionar um agente ao roster.</p>
                        </div>

                        <button
                          onClick={() => setAddAgentStep('integrate')}
                          className="w-full text-left p-4 rounded-md border border-border-panel bg-bg-base/40 hover:bg-surface-hover transition-colors"
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <div className="size-9 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center shrink-0">
                              <Icon name="link" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-text-primary">Integrar agente</p>
                              <p className="text-[10px] text-text-secondary font-bold mt-1">Placeholder (em breve): conectar agentes existentes / integrações.</p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => setAddAgentStep('create')}
                          className="w-full text-left p-4 rounded-md border border-brand-mint/30 bg-brand-mint/5 hover:bg-brand-mint/10 transition-colors"
                          type="button"
                        >
                          <div className="flex items-start gap-3">
                            <div className="size-9 rounded-md bg-brand-mint/10 border border-brand-mint/20 text-brand-mint flex items-center justify-center shrink-0">
                              <Icon name="add_circle" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-text-primary">Criar agente do zero</p>
                              <p className="text-[10px] text-text-secondary font-bold mt-1">Define nome, role, modelo, API key e tools (state local).</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {addAgentStep === 'integrate' && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-md border border-border-card bg-bg-base/40">
                          <div className="flex items-start gap-3">
                            <div className="size-9 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center shrink-0">
                              <Icon name="construction" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-text-primary">Integrar agente</p>
                              <p className="text-[10px] text-text-secondary font-bold mt-1">Placeholder por enquanto.</p>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setAddAgentStep('choose')}
                          className="px-3 py-2 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary flex items-center gap-2"
                          type="button"
                        >
                          <Icon name="arrow_back" size="sm" /> Voltar
                        </button>
                      </div>
                    )}

                    {addAgentStep === 'create' && (
                      <form
                        className="space-y-5"
                        onSubmit={(e) => {
                          e.preventDefault();

                          const tools = addAgentForm.tools;
                          const toolTags = [
                            tools.gmail ? 'gmail' : null,
                            tools.calendar ? 'calendar' : null,
                            tools.github ? 'github' : null,
                            tools.clawDeck ? 'clawdeck' : null,
                          ].filter(Boolean) as string[];

                          const newAgent: Agent = {
                            id: `${addAgentForm.name || 'agent'}-${Date.now()}`, 
                            name: addAgentForm.name || 'Novo agente',
                            role: addAgentForm.role,
                            model: addAgentForm.model,
                            owner: 'Frank',
                            status: 'online',
                            lastHeartbeat: 'agora',
                            uptime: '0m',
                            tags: toolTags.length ? toolTags : ['custom'],
                            domain: addAgentForm.domain ? addAgentForm.domain.toUpperCase() : undefined,
                            handle: addAgentForm.handle || undefined,
                            avatarIcon: addAgentForm.role === 'integration' ? 'link' : addAgentForm.role === 'coordinator' ? 'shield' : 'psychology',
                          };

                          setRoster(prev => [newAgent, ...prev]);
                          setIsAddAgentOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Criar agente do zero</p>
                          <button
                            type="button"
                            onClick={() => setAddAgentStep('choose')}
                            className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                          >
                            Voltar
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Nome</label>
                            <input
                              value={addAgentForm.name}
                              onChange={(e) => setAddAgentForm(s => ({ ...s, name: e.target.value }))}
                              type="text"
                              placeholder="Ex: Agente E3"
                              className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Role</label>
                            <div className="relative">
                              <select
                                value={addAgentForm.role}
                                onChange={(e) => setAddAgentForm(s => ({ ...s, role: e.target.value as AgentRole }))}
                                className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary appearance-none focus:outline-none focus:border-brand-mint cursor-pointer"
                              >
                                <option value="coordinator">Coordinator</option>
                                <option value="sub-agent">Sub-agent</option>
                                <option value="integration">Integration</option>
                              </select>
                              <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-sm" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Domínio</label>
                            <input
                              value={addAgentForm.domain}
                              onChange={(e) => setAddAgentForm(s => ({ ...s, domain: e.target.value }))}
                              type="text"
                              placeholder="Ex: OPERAÇÕES"
                              className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Handle</label>
                            <input
                              value={addAgentForm.handle}
                              onChange={(e) => setAddAgentForm(s => ({ ...s, handle: e.target.value }))}
                              type="text"
                              placeholder="Ex: @emilizaremba"
                              className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Instruções</label>
                          <textarea
                            value={addAgentForm.instructions}
                            onChange={(e) => setAddAgentForm(s => ({ ...s, instructions: e.target.value }))}
                            placeholder="Descreva como o agente deve agir, limites, objetivos, etc..."
                            rows={4}
                            className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary resize-none focus:ring-1 focus:ring-brand-mint"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Modelo</label>
                            <div className="relative">
                              <select
                                value={addAgentForm.model}
                                onChange={(e) => setAddAgentForm(s => ({ ...s, model: e.target.value }))}
                                className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary appearance-none focus:outline-none focus:border-brand-mint cursor-pointer"
                              >
                                <option>Opus</option>
                                <option>Sonnet</option>
                                <option>GPT-5.2</option>
                                <option>Gemini</option>
                                <option>Claude</option>
                              </select>
                              <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-sm" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">API Key</label>
                            <input
                              value={addAgentForm.apiKey}
                              onChange={(e) => setAddAgentForm(s => ({ ...s, apiKey: e.target.value }))}
                              type="password"
                              placeholder="••••••••••••••"
                              className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                            />
                            <p className="text-[9px] text-text-secondary font-bold">Armazenado apenas em state local (mock). Não persiste.</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Tools / Integrações</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(
                              [
                                { k: 'gmail', label: 'Gmail' },
                                { k: 'calendar', label: 'Calendar' },
                                { k: 'github', label: 'GitHub' },
                                { k: 'clawDeck', label: 'ClawDeck' },
                              ] as const
                            ).map(opt => (
                              <label
                                key={opt.k}
                                className="flex items-center gap-2 p-3 rounded-md border border-border-panel bg-bg-base/40 hover:bg-surface-hover transition-colors cursor-pointer"
                              >
                                <input
                                  checked={addAgentForm.tools[opt.k]}
                                  onChange={(e) =>
                                    setAddAgentForm(s => ({
                                      ...s,
                                      tools: { ...s.tools, [opt.k]: e.target.checked },
                                    }))
                                  }
                                  type="checkbox"
                                  className="accent-brand-mint"
                                />
                                <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary">{opt.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border-panel flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsAddAgentOpen(false)}
                            className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-sm bg-brand-mint text-black text-xs font-bold uppercase hover:bg-brand-mint/80 transition-colors shadow-lg shadow-brand-mint/20"
                          >
                            Salvar
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
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
