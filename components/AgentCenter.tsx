import React, { useMemo, useState } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';
import type { Agent, AgentStatus } from '../types/agents';
import MissionControl from './MissionControl/index';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CronJob {
  id: string; name: string; schedule: string; lastRun: string; nextRun: string;
  status: 'ok' | 'warning' | 'failed' | 'paused'; integration: string;
}
interface HeartbeatEvent {
  id: string; agentId: string; agentName: string; ts: string; latencyMs: number;
  status: 'ok' | 'late' | 'missed'; note?: string;
}
interface MemoryArtifact {
  id: string; path: string; kind: 'daily' | 'long-term' | 'config' | 'log';
  updatedAt: string; size: string; summary: string; content?: string;
}
interface CommsEvent {
  id: string; channel: string; ts: string; title: string; from?: string; to?: string;
  status: 'sent' | 'received' | 'scheduled' | 'action-required' | 'info'; detail?: string;
}
interface RunItem {
  id: string; name: string; agentName: string; status: 'running' | 'done' | 'failed' | 'queued';
  startedAt: string; duration: string;
}

// ─── Badge maps ───────────────────────────────────────────────────────────────
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
const hbBadge: Record<HeartbeatEvent['status'], { variant: 'mint' | 'orange' | 'red'; label: string; icon: string }> = {
  ok: { variant: 'mint', label: 'OK', icon: 'wifi_tethering' },
  late: { variant: 'orange', label: 'LATE', icon: 'schedule' },
  missed: { variant: 'red', label: 'MISSED', icon: 'wifi_off' },
};
const memBadge: Record<MemoryArtifact['kind'], { variant: 'mint' | 'orange' | 'blue' | 'neutral'; label: string; icon: string }> = {
  daily: { variant: 'mint', label: 'DAILY', icon: 'calendar_today' },
  'long-term': { variant: 'blue', label: 'LONG-TERM', icon: 'bookmark' },
  config: { variant: 'neutral', label: 'CONFIG', icon: 'tune' },
  log: { variant: 'orange', label: 'LOG', icon: 'receipt_long' },
};
const commsBadge: Record<CommsEvent['status'], { variant: 'mint' | 'orange' | 'blue' | 'neutral' | 'red'; label: string; icon: string }> = {
  sent: { variant: 'blue', label: 'ENVIADO', icon: 'send' },
  received: { variant: 'mint', label: 'RECEBIDO', icon: 'inbox' },
  scheduled: { variant: 'neutral', label: 'AGENDADO', icon: 'event' },
  'action-required': { variant: 'orange', label: 'AÇÃO', icon: 'priority_high' },
  info: { variant: 'neutral', label: 'INFO', icon: 'info' },
};
const runBadge: Record<RunItem['status'], { variant: 'mint' | 'orange' | 'red' | 'neutral'; label: string; icon: string }> = {
  running: { variant: 'orange', label: 'RODANDO', icon: 'autorenew' },
  done: { variant: 'mint', label: 'CONCLUÍDO', icon: 'check_circle' },
  failed: { variant: 'red', label: 'FALHOU', icon: 'error' },
  queued: { variant: 'neutral', label: 'NA FILA', icon: 'hourglass_empty' },
};

// ─── Modules (sub-nav) ───────────────────────────────────────────────────────
type ModuleId = 'overview' | 'mission-control' | 'runs' | 'cron' | 'heartbeat' | 'memory' | 'comms' | 'config';
const modules: { id: ModuleId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Visão Geral', icon: 'monitoring' },
  { id: 'mission-control', label: 'Mission Control', icon: 'view_column' },
  { id: 'runs', label: 'Execuções', icon: 'rocket_launch' },
  { id: 'cron', label: 'Cron Jobs', icon: 'schedule' },
  { id: 'heartbeat', label: 'Heartbeat', icon: 'monitor_heart' },
  { id: 'memory', label: 'Memória', icon: 'folder_open' },
  { id: 'comms', label: 'Comunicações', icon: 'forum' },
  { id: 'config', label: 'Config. Agente', icon: 'tune' },
];

// ─── Component ────────────────────────────────────────────────────────────────
type AgentCenterProps = { selectedAgentId: string; roster: Agent[] };

export default function AgentCenter({ selectedAgentId, roster }: AgentCenterProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>('overview');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<'global' | 'agent'>('global');

  const selectedAgent = roster.find(a => a.id === selectedAgentId) || roster[0];

  // ── Mock data ─────────────────────────────────────────────────────────────
  const agents: Agent[] = useMemo(() => [
    { id: 'frank', name: 'Frank', role: 'coordinator', model: 'OpenClaw', owner: '@marco', status: 'online', lastHeartbeat: '22:51:58Z', uptime: '14d 03h', currentMission: 'PR14 • Mission Control', tags: ['orchestrator', 'gateway'] },
    { id: 'gpt52-planner', name: 'Planner', role: 'sub-agent', model: 'GPT-5.2', owner: 'Frank', status: 'busy', lastHeartbeat: '22:51:43Z', uptime: '3h 18m', currentMission: 'Spec + UX alignment', tags: ['analysis', 'roadmap'] },
    { id: 'gpt52-codegen', name: 'CodeGen', role: 'sub-agent', model: 'GPT-5.2', owner: 'Frank', status: 'online', lastHeartbeat: '22:51:47Z', uptime: '2h 02m', currentMission: 'React/Vite implementation', tags: ['typescript', 'ui'] },
    { id: 'gpt52-qa', name: 'QA', role: 'sub-agent', model: 'GPT-5.2', owner: 'Frank', status: 'idle', lastHeartbeat: '22:51:21Z', uptime: '52m', currentMission: 'Build verification', tags: ['tests', 'lint'] },
    { id: 'gmail-calendar', name: 'Gmail/Calendar Bridge', role: 'integration', status: 'online', lastHeartbeat: '22:50:10Z', uptime: '7d 09h', currentMission: 'Sync events + emails', tags: ['gmail', 'calendar'] },
  ], []);

  const runs: RunItem[] = useMemo(() => [
    { id: 'run-1', name: 'Mission Control layout refactor', agentName: 'CodeGen', status: 'running', startedAt: '21:02Z', duration: '48m' },
    { id: 'run-2', name: 'PR #13 merge + deploy gh-pages', agentName: 'Frank', status: 'done', startedAt: '20:07Z', duration: '12m' },
    { id: 'run-3', name: 'last30days research PT-BR', agentName: 'Frank', status: 'done', startedAt: '19:30Z', duration: '8m' },
    { id: 'run-4', name: 'Build verification pass', agentName: 'QA', status: 'queued', startedAt: '—', duration: '—' },
  ], []);

  const jobs: CronJob[] = useMemo(() => [
    { id: 'cron-1', name: 'Inbox triage → action queue', schedule: '*/20m', lastRun: '22:40Z (OK)', nextRun: '23:00Z', status: 'ok', integration: 'Gmail' },
    { id: 'cron-2', name: 'Calendar scan → next 48h brief', schedule: '0 */3h', lastRun: '21:00Z (OK)', nextRun: '00:00Z', status: 'ok', integration: 'Google Calendar' },
    { id: 'cron-3', name: 'PR watcher → mentions + reviews', schedule: '*/10m', lastRun: '22:50Z (WARN)', nextRun: '23:00Z', status: 'warning', integration: 'GitHub' },
    { id: 'cron-4', name: 'Gateway healthcheck', schedule: '*/5m', lastRun: '22:50Z (OK)', nextRun: '22:55Z', status: 'ok', integration: 'OpenClaw' },
    { id: 'cron-5', name: 'Weekly memory distill → MEMORY.md', schedule: 'Mon 09:00', lastRun: '2026-02-10 (PAUSED)', nextRun: '2026-02-17', status: 'paused', integration: 'OpenClaw' },
  ], []);

  const heartbeats: HeartbeatEvent[] = useMemo(() => [
    { id: 'hb-1', agentId: 'frank', agentName: 'Frank', ts: '22:51:58Z', latencyMs: 84, status: 'ok', note: 'gateway ok' },
    { id: 'hb-2', agentId: 'gpt52-codegen', agentName: 'CodeGen', ts: '22:51:47Z', latencyMs: 132, status: 'ok' },
    { id: 'hb-3', agentId: 'gpt52-planner', agentName: 'Planner', ts: '22:51:43Z', latencyMs: 210, status: 'late', note: 'high tool load' },
    { id: 'hb-4', agentId: 'gmail-calendar', agentName: 'Gmail/Calendar Bridge', ts: '22:50:10Z', latencyMs: 510, status: 'ok' },
    { id: 'hb-5', agentId: 'gpt52-qa', agentName: 'QA', ts: '22:47:03Z', latencyMs: 0, status: 'missed', note: 'sleeping / idle budget' },
  ], []);

  const memory: MemoryArtifact[] = useMemo(() => [
    { id: 'mem-1', path: 'MEMORY.md', kind: 'long-term', updatedAt: '2026-02-13 20:00Z', size: '18.2 KB', summary: 'Long-term memories: workflows, preferences, recurring patterns.', content: '# MEMORY.md\n\n## Marco (o humano)\n- Nascido em 1990, brasiliense\n- Ex-produtor musical\n- Objetivos: estudar IA, montar negocio focado em IA\n\n## Preferencias\n- Idioma: PT-BR sempre\n- Sem emojis, sem travessao\n- Tom: polido, elegante, minimalista' },
    { id: 'mem-2', path: 'memory/2026-02-13.md', kind: 'daily', updatedAt: '2026-02-13 21:00Z', size: '3.8 KB', summary: 'Mission Control design decisions, PR13 merge, deploy gh-pages.', content: '# 2026-02-13\n\n## Decisoes\n- Mission Control como tela dentro de Agentes\n- Layout 3 colunas\n- Clique no agente = troca perfil\n\n## PRs\n- PR13 mergeado e deployed' },
    { id: 'mem-3', path: 'AGENTS.md', kind: 'config', updatedAt: '2026-02-10 18:40Z', size: '5.1 KB', summary: 'Workspace rules, heartbeat guidance, safety and cadence.' },
    { id: 'mem-4', path: 'memory/heartbeat-state.json', kind: 'log', updatedAt: '2026-02-13 21:01Z', size: '0.7 KB', summary: 'Last checks state for email/calendar/weather rotations.' },
    { id: 'mem-5', path: 'HEARTBEAT.md', kind: 'config', updatedAt: '2026-02-13 12:03Z', size: '0.8 KB', summary: 'Checklist curto para heartbeat polling e ClawDeck.' },
  ], []);

  const comms: CommsEvent[] = useMemo(() => [
    { id: 'c-1', channel: 'GitHub', ts: '21:02Z', title: 'PR #14 branch criada', from: 'Frank', status: 'info', detail: 'feat/mission-control-v2' },
    { id: 'c-2', channel: 'GitHub', ts: '20:07Z', title: 'PR #13 merged + deployed', from: 'Frank', status: 'sent', detail: 'Agent center click → gh-pages updated' },
    { id: 'c-3', channel: 'Telegram', ts: '20:40Z', title: 'Status update enviado', from: 'Frank', to: '@marco', status: 'sent' },
    { id: 'c-4', channel: 'Gmail', ts: '22:40Z', title: 'Unread: "Invoice • AWS Credits"', from: 'billing@amazon.com', status: 'received', detail: 'Auto-labeled: FINANÇAS.' },
    { id: 'c-5', channel: 'Calendar', ts: 'Amanhã 13:00', title: 'Meeting: Product sync (45m)', to: '@marco', status: 'scheduled' },
  ], []);

  // Agent config fields
  const configFields = useMemo(() => [
    { id: 'cfg-1', label: 'Nome', value: selectedAgent?.name || '—' },
    { id: 'cfg-2', label: 'Modelo', value: selectedAgent?.model || '—' },
    { id: 'cfg-3', label: 'Role', value: selectedAgent?.role || '—' },
    { id: 'cfg-4', label: 'Owner', value: selectedAgent?.owner || '—' },
    { id: 'cfg-5', label: 'Domain', value: selectedAgent?.domain || '—' },
    { id: 'cfg-6', label: 'Status', value: selectedAgent?.status || '—' },
    { id: 'cfg-7', label: 'Uptime', value: selectedAgent?.uptime || '—' },
    { id: 'cfg-8', label: 'Last Heartbeat', value: selectedAgent?.lastHeartbeat || '—' },
  ], [selectedAgent]);

  // ── Filtered items for middle column ──────────────────────────────────────
  const q = search.toLowerCase();
  const getItems = (): { id: string; primary: string; secondary: string; badge?: React.ReactNode }[] => {
    switch (activeModule) {
      case 'overview':
        return agents.filter(a => a.name.toLowerCase().includes(q)).map(a => ({
          id: a.id,
          primary: a.name,
          secondary: a.currentMission || a.role,
          badge: <StatusDot color={statusDot[a.status].color} glow={a.status !== 'offline'} />,
        }));
      case 'runs':
        return runs.filter(r => r.name.toLowerCase().includes(q)).map(r => {
          const b = runBadge[r.status];
          return { id: r.id, primary: r.name, secondary: `${r.agentName} • ${r.startedAt}`, badge: <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge> };
        });
      case 'cron':
        return jobs.filter(j => j.name.toLowerCase().includes(q)).map(j => {
          const b = jobBadge[j.status];
          return { id: j.id, primary: j.name, secondary: `${j.integration} • ${j.schedule}`, badge: <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge> };
        });
      case 'heartbeat':
        return heartbeats.filter(h => h.agentName.toLowerCase().includes(q)).map(h => {
          const b = hbBadge[h.status];
          return { id: h.id, primary: h.agentName, secondary: `${h.ts} • ${h.latencyMs}ms`, badge: <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge> };
        });
      case 'memory':
        return memory.filter(m => m.path.toLowerCase().includes(q)).map(m => {
          const b = memBadge[m.kind];
          return { id: m.id, primary: m.path, secondary: `${m.updatedAt} • ${m.size}`, badge: <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge> };
        });
      case 'comms':
        return comms.filter(c => c.title.toLowerCase().includes(q)).map(c => {
          const b = commsBadge[c.status];
          return { id: c.id, primary: c.title, secondary: `${c.channel} • ${c.ts}`, badge: <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge> };
        });
      case 'config':
        return configFields.map(f => ({ id: f.id, primary: f.label, secondary: f.value }));
      default:
        return [];
    }
  };

  const items = getItems();

  // ── Detail renderer ───────────────────────────────────────────────────────
  const renderDetail = () => {
    if (!selectedItemId) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-3 py-20">
          <Icon name="touch_app" className="text-4xl opacity-30" />
          <p className="text-[11px] font-bold uppercase tracking-widest">Selecione um item para ver detalhes</p>
        </div>
      );
    }

    if (activeModule === 'overview') {
      const agent = agents.find(a => a.id === selectedItemId);
      if (!agent) return null;
      const sd = statusDot[agent.status];
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn('size-12 rounded-md border flex items-center justify-center shrink-0',
              agent.role === 'coordinator' ? 'bg-accent-purple/10 border-accent-purple/20 text-accent-purple' :
              agent.role === 'integration' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' :
              'bg-brand-mint/10 border-brand-mint/20 text-brand-mint'
            )}>
              <Icon name={agent.role === 'coordinator' ? 'shield' : agent.role === 'integration' ? 'link' : 'psychology'} size="lg" />
            </div>
            <div>
              <p className="text-sm font-black text-text-primary">{agent.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusDot color={sd.color} glow={agent.status !== 'offline'} />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">{sd.label}</span>
                {agent.model && <Badge variant="neutral" size="xs"><Icon name="bolt" className="text-[10px]" /> {agent.model}</Badge>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Uptime</p>
              <p className="text-sm font-black text-brand-mint mt-1">{agent.uptime}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Heartbeat</p>
              <p className="text-sm font-black text-accent-blue mt-1">{agent.lastHeartbeat}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Owner</p>
              <p className="text-sm font-black text-text-primary mt-1">{agent.owner || '—'}</p>
            </div>
          </div>
          {agent.currentMission && (
            <div className="p-3 rounded-md border border-border-panel bg-surface">
              <p className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Missão Atual</p>
              <p className="text-xs font-bold text-text-primary mt-1">{agent.currentMission}</p>
            </div>
          )}
          {agent.tags && agent.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {agent.tags.map(t => (
                <span key={t} className="text-[9px] font-bold text-text-secondary bg-surface px-2 py-0.5 rounded-sm border border-border-panel">{t}</span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeModule === 'runs') {
      const run = runs.find(r => r.id === selectedItemId);
      if (!run) return null;
      const b = runBadge[run.status];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-text-primary">{run.name}</p>
            <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Agente</p>
              <p className="text-xs font-bold text-text-primary mt-1">{run.agentName}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Iniciado</p>
              <p className="text-xs font-bold text-text-primary mt-1 font-mono">{run.startedAt}</p>
            </div>
          </div>
          <div className="p-3 rounded-md border border-border-panel bg-surface">
            <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Duração</p>
            <p className="text-xs font-bold text-text-primary mt-1 font-mono">{run.duration}</p>
          </div>
        </div>
      );
    }

    if (activeModule === 'cron') {
      const job = jobs.find(j => j.id === selectedItemId);
      if (!job) return null;
      const b = jobBadge[job.status];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-text-primary">{job.name}</p>
            <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Schedule</p>
              <p className="text-xs font-bold text-text-primary mt-1 font-mono">{job.schedule}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Integração</p>
              <p className="text-xs font-bold text-text-primary mt-1">{job.integration}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-surface">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Última execução</p>
              <p className="text-[10px] font-bold text-text-primary mt-1 font-mono">{job.lastRun}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-surface">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Próxima</p>
              <p className="text-[10px] font-bold text-text-primary mt-1 font-mono">{job.nextRun}</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === 'heartbeat') {
      const hb = heartbeats.find(h => h.id === selectedItemId);
      if (!hb) return null;
      const b = hbBadge[hb.status];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-text-primary">{hb.agentName}</p>
            <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Timestamp</p>
              <p className="text-xs font-bold text-text-primary mt-1 font-mono">{hb.ts}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Latência</p>
              <p className="text-xs font-bold text-text-primary mt-1 font-mono">{hb.latencyMs > 0 ? `${hb.latencyMs}ms` : '—'}</p>
            </div>
          </div>
          {hb.note && (
            <div className="p-3 rounded-md border border-border-panel bg-surface">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Nota</p>
              <p className="text-xs font-bold text-text-primary mt-1">{hb.note}</p>
            </div>
          )}
        </div>
      );
    }

    if (activeModule === 'memory') {
      const m = memory.find(x => x.id === selectedItemId);
      if (!m) return null;
      const b = memBadge[m.kind];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-text-primary font-mono">{m.path}</p>
            <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-text-secondary font-bold">
            <span className="font-mono">{m.updatedAt}</span>
            <span className="font-mono">{m.size}</span>
          </div>
          <p className="text-[10px] text-text-secondary font-bold">{m.summary}</p>
          {m.content && (
            <div className="p-4 rounded-md border border-border-panel bg-bg-base font-mono text-[11px] text-text-primary whitespace-pre-wrap leading-relaxed overflow-auto max-h-[400px]">
              {m.content}
            </div>
          )}
        </div>
      );
    }

    if (activeModule === 'comms') {
      const c = comms.find(x => x.id === selectedItemId);
      if (!c) return null;
      const b = commsBadge[c.status];
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-text-primary">{c.title}</p>
            <Badge variant={b.variant} size="xs"><Icon name={b.icon} className="text-[10px]" /> {b.label}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Canal</p>
              <p className="text-xs font-bold text-text-primary mt-1">{c.channel}</p>
            </div>
            <div className="p-3 rounded-md border border-border-panel bg-bg-base/40">
              <p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Horário</p>
              <p className="text-xs font-bold text-text-primary mt-1 font-mono">{c.ts}</p>
            </div>
          </div>
          {(c.from || c.to) && (
            <div className="grid grid-cols-2 gap-3">
              {c.from && <div className="p-3 rounded-md border border-border-panel bg-surface"><p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">De</p><p className="text-xs font-bold text-text-primary mt-1">{c.from}</p></div>}
              {c.to && <div className="p-3 rounded-md border border-border-panel bg-surface"><p className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Para</p><p className="text-xs font-bold text-text-primary mt-1">{c.to}</p></div>}
            </div>
          )}
          {c.detail && <p className="text-[10px] text-text-secondary font-bold">{c.detail}</p>}
        </div>
      );
    }

    if (activeModule === 'config') {
      const f = configFields.find(x => x.id === selectedItemId);
      if (!f) return null;
      return (
        <div className="space-y-4">
          <p className="text-sm font-black text-text-primary">{f.label}</p>
          <div className="p-4 rounded-md border border-border-panel bg-bg-base font-mono text-sm text-brand-mint">
            {f.value}
          </div>
        </div>
      );
    }

    return null;
  };

  const onlineCount = agents.filter(a => a.status !== 'offline').length;
  const busyCount = agents.filter(a => a.status === 'busy').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-panel bg-bg-base shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-md bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center text-brand-mint shrink-0">
              <Icon name="hub" size="lg" />
            </div>
            <div>
              <h1 className="text-sm font-black text-text-primary">Mission Control</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="mint" size="xs"><Icon name="podcasts" className="text-[10px]" /> {onlineCount} ONLINE</Badge>
                <Badge variant={busyCount > 0 ? 'orange' : 'neutral'} size="xs"><Icon name="autorenew" className="text-[10px]" /> {busyCount} BUSY</Badge>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-[10px] font-bold uppercase tracking-wide text-text-secondary hover:text-text-primary flex items-center gap-1.5">
              <Icon name="refresh" size="sm" /> Sync
            </button>
          </div>
        </div>
      </div>

      {/* 3-column body */}
      <div className="flex-grow flex overflow-hidden">
        {/* Mission Control: full-width layout */}
        {activeModule === 'mission-control' ? (
          <MissionControl />
        ) : (
          <>
        {/* LEFT: Sub-nav */}
        <div className="w-[200px] bg-header-bg border-r border-border-panel flex flex-col shrink-0 hidden lg:flex">
          <div className="flex-grow overflow-y-auto py-4 px-3">
            <SectionLabel className="mb-3 px-2">Módulos</SectionLabel>
            <nav className="space-y-0.5">
              {modules.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setActiveModule(m.id); setSelectedItemId(null); setSearch(''); }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all',
                    activeModule === m.id
                      ? 'bg-surface text-text-primary border-l-2 border-brand-mint'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border-l-2 border-transparent'
                  )}
                >
                  <Icon name={m.icon} size="lg" />
                  {m.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Scope toggle */}
          <div className="px-3 py-3 border-t border-border-panel">
            <SectionLabel className="mb-2 px-2">Escopo</SectionLabel>
            <div className="flex p-0.5 bg-bg-base rounded-sm border border-border-panel">
              <button
                onClick={() => setScope('global')}
                className={cn('flex-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all',
                  scope === 'global' ? 'bg-surface text-text-primary' : 'text-text-secondary hover:text-text-primary'
                )}
              >Global</button>
              <button
                onClick={() => setScope('agent')}
                className={cn('flex-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all truncate',
                  scope === 'agent' ? 'bg-surface text-brand-mint' : 'text-text-secondary hover:text-text-primary'
                )}
              >{selectedAgent?.name || 'Agente'}</button>
            </div>
          </div>
        </div>

        {/* MIDDLE: List */}
        <div className="w-[280px] bg-bg-base border-r border-border-panel flex flex-col shrink-0 hidden md:flex">
          <div className="px-3 pt-3 pb-2 border-b border-border-panel shrink-0">
            <div className="relative">
              <Icon name="search" size="sm" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-surface border border-border-panel rounded-sm pl-8 pr-3 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-brand-mint/50 transition-colors placeholder:text-text-secondary/40"
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">
                {modules.find(m => m.id === activeModule)?.label}
              </span>
              <span className="text-[9px] font-bold text-text-secondary bg-surface px-1.5 py-0.5 rounded-sm border border-border-panel">
                {items.length}
              </span>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={cn(
                  'w-full px-3 py-2.5 text-left border-b border-border-panel/50 transition-all',
                  selectedItemId === item.id
                    ? 'bg-surface border-l-2 border-l-brand-mint'
                    : 'hover:bg-surface/50 border-l-2 border-l-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-text-primary truncate">{item.primary}</p>
                    <p className="text-[9px] text-text-secondary font-bold mt-0.5 truncate">{item.secondary}</p>
                  </div>
                  {item.badge && <div className="shrink-0 mt-0.5">{item.badge}</div>}
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="px-3 py-8 text-center text-[10px] text-text-secondary font-bold">
                Nenhum item encontrado
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Detail */}
        <div className="flex-grow bg-bg-base overflow-y-auto p-6">
          {renderDetail()}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
