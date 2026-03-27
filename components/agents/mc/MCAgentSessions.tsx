/**
 * MCAgentSessions — active sessions for an agent in the profile view.
 * Shows session cards with model badge, tokens, cost, age, working directory,
 * and animated status indicators.
 */
import React, { useMemo } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { StatusDot } from '../../ui/StatusDot';
import { useMissionControlStore } from '../../../store/missionControl';

function relativeAge(age: string): string {
  // age comes pre-formatted from the store (e.g. "2h", "15m", "3d")
  return age || '--';
}

interface MCAgentSessionsProps {
  agentName: string;
}

export function MCAgentSessions({ agentName }: MCAgentSessionsProps) {
  const sessions = useMissionControlStore((s) => s.sessions);

  const agentSessions = useMemo(
    () =>
      sessions.filter(
        (s) => s.agent?.toLowerCase() === agentName.toLowerCase(),
      ),
    [sessions, agentName],
  );

  if (agentSessions.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 justify-center">
        <Icon name="terminal" size="sm" className="text-text-secondary opacity-40" />
        <p className="text-[10px] text-text-secondary">Nenhuma sessao ativa</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {agentSessions.map((session) => {
        const isActive = session.active;
        return (
          <div
            key={session.id}
            className={cn(
              'bg-bg-base border border-border-panel rounded-sm p-3',
              isActive
                ? 'border-l-2 border-l-brand-mint'
                : 'border-l-2 border-l-border-panel',
            )}
          >
            {/* Top row: status + agent + model badge + age */}
            <div className="flex items-center gap-2 flex-wrap">
              {isActive ? (
                <StatusDot color="mint" pulse glow size="sm" />
              ) : (
                <StatusDot color="blue" size="sm" />
              )}
              <span className="text-[10px] font-bold text-text-primary">
                {session.agent ?? agentName}
              </span>
              <span
                className={cn(
                  'text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-sm border',
                  'bg-accent-blue/10 border-accent-blue/30 text-accent-blue',
                )}
              >
                {session.model}
              </span>
              <span className="text-[8px] font-mono text-text-secondary">
                {relativeAge(session.age)}
              </span>
            </div>

            {/* Metrics row: tokens + cost */}
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[8px] font-mono text-text-secondary">
                {session.tokens} tokens
              </span>
              {session.cost != null && (
                <span className="text-[8px] font-mono text-text-primary">
                  ${session.cost.toFixed(2)}
                </span>
              )}
            </div>

            {/* Working directory */}
            {session.label && (
              <p className="mt-1.5 text-[9px] text-text-secondary font-mono truncate max-w-full">
                {session.label}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
