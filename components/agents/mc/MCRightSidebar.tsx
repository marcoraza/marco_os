/**
 * MCRightSidebar — V3 redesign
 *
 * Three stacked sections:
 * 1. Chat with focused agent (~40% height)
 * 2. Inter-agent chat timeline (~30% height)
 * 3. Activity feed (~30% height)
 *
 * Width: w-80 (320px). Visible on xl+ only.
 * All store access via granular selectors.
 */
import React, { Suspense, lazy, useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCInterAgentMessage, type MCActivity } from '../../../store/missionControl';

const MCChatPanel = lazy(() => import('./MCChatPanel').then((m) => ({ default: m.MCChatPanel })));

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

const ACTIVITY_DOT_COLOR: Record<string, string> = {
  task: 'bg-accent-blue',
  agent: 'bg-brand-mint',
  session: 'bg-accent-purple',
  system: 'bg-text-secondary',
  cron: 'bg-accent-orange',
  error: 'bg-accent-red',
};

function activityDotColor(type: string): string {
  return ACTIVITY_DOT_COLOR[type] ?? 'bg-text-secondary';
}

// ── Section 1: Agent Chat ────────────────────────────────────────────────────

function AgentChatSection() {
  const agents = useMissionControlStore((s) => s.agents);
  const focusedAgentId = useMissionControlStore((s) => s.focusedAgentId);

  const focusedAgent = useMemo(() => {
    if (focusedAgentId !== null) {
      return agents.find((a) => a.id === focusedAgentId) ?? null;
    }
    return agents[0] ?? null;
  }, [agents, focusedAgentId]);

  return (
    <div className="flex flex-col min-h-0" style={{ flex: '4 1 0%' }}>
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary px-3 py-2 border-b border-border-panel shrink-0">
        {focusedAgent
          ? `Chat com ${focusedAgent.name}`
          : 'Selecione um agente'}
      </div>
      {focusedAgent ? (
        <div className="flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="p-3">
                <div className="bg-border-panel animate-pulse rounded-sm h-12" />
              </div>
            }
          >
            <MCChatPanel agentId={String(focusedAgent.id)} />
          </Suspense>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary text-[9px] text-center">
            Selecione um agente no painel
          </p>
        </div>
      )}
    </div>
  );
}

// ── Section 2: Inter-Agent Chat ──────────────────────────────────────────────

function InterAgentItem({ msg }: { msg: MCInterAgentMessage }) {
  return (
    <div className="px-3 py-1.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[9px] font-bold text-text-primary truncate">
          {msg.from} <span className="text-text-secondary font-normal">→</span> {msg.to}
        </span>
        <span className="text-[8px] font-mono text-text-secondary shrink-0">
          {relativeTime(msg.timestamp)}
        </span>
      </div>
      <p className="text-[9px] text-text-secondary line-clamp-2 mt-0.5">
        {msg.content}
      </p>
      {msg.taskRef && (
        <span className="inline-block text-[7px] font-bold uppercase tracking-widest text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-1.5 py-0.5 rounded-sm mt-0.5">
          {msg.taskRef}
        </span>
      )}
    </div>
  );
}

function InterAgentSection() {
  const interAgentMessages = useMissionControlStore((s) => s.interAgentMessages);

  const sorted = useMemo(
    () => [...interAgentMessages].sort((a, b) => b.timestamp - a.timestamp),
    [interAgentMessages],
  );

  return (
    <div className="flex flex-col min-h-0 border-t border-border-panel" style={{ flex: '3 1 0%' }}>
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary px-3 py-2 border-b border-border-panel shrink-0">
        Conversas entre agentes
      </div>
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-text-secondary text-[9px] text-center py-4">
            Sem conversas recentes
          </p>
        ) : (
          <div className="divide-y divide-border-panel">
            {sorted.map((msg) => (
              <InterAgentItem key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section 3: Activity Feed ─────────────────────────────────────────────────

function ActivityItem({ activity }: { activity: MCActivity }) {
  return (
    <div className="flex items-start gap-2 px-3 py-1" style={{ minHeight: 24 }}>
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full mt-1 shrink-0',
          activityDotColor(activity.type),
        )}
      />
      <div className="flex-1 min-w-0">
        <span className="text-[9px] text-text-primary">
          <span className="font-bold">{activity.actor}</span>{' '}
          <span className="text-text-secondary">{activity.description}</span>
        </span>
      </div>
      <span className="text-[8px] font-mono text-text-secondary shrink-0">
        {relativeTime(activity.created_at)}
      </span>
    </div>
  );
}

function ActivityFeedSection() {
  const activities = useMissionControlStore((s) => s.activities);

  const recent = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 15),
    [activities],
  );

  return (
    <div className="flex flex-col min-h-0 border-t border-border-panel" style={{ flex: '3 1 0%' }}>
      <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary px-3 py-2 border-b border-border-panel shrink-0">
        Atividades
      </div>
      <div className="flex-1 overflow-y-auto">
        {recent.length === 0 ? (
          <p className="text-text-secondary text-[9px] text-center py-4">
            Sem atividades recentes
          </p>
        ) : (
          recent.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export function MCRightSidebar() {
  return (
    <div className="w-80 shrink-0 hidden xl:flex flex-col overflow-hidden border-l border-border-panel bg-bg-base">
      <AgentChatSection />
      <InterAgentSection />
      <ActivityFeedSection />
    </div>
  );
}
