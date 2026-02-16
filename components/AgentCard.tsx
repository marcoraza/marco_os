import React from 'react';
import { Badge, Card, Icon, StatusDot } from './ui';
import { cn } from '../utils/cn';
import type { AgentData } from '../hooks/useAgentStream';

interface AgentCardProps {
  agent: AgentData;
  onViewLog?: (id: string) => void;
  onKill?: (id: string) => void;
  onArchive?: (id: string) => void;
}

const statusConfig: Record<AgentData['status'], { color: 'mint' | 'orange' | 'blue' | 'red'; label: string; borderColor: string }> = {
  active: { color: 'mint', label: 'ACTIVE', borderColor: 'border-l-brand-mint' },
  queued: { color: 'orange', label: 'QUEUED', borderColor: 'border-l-accent-orange' },
  completed: { color: 'blue', label: 'COMPLETED', borderColor: 'border-l-accent-blue' },
  failed: { color: 'red', label: 'FAILED', borderColor: 'border-l-accent-red' },
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k tokens`;
  }
  return `${tokens} tokens`;
}

export function AgentCard({ agent, onViewLog, onKill, onArchive }: AgentCardProps) {
  const config = statusConfig[agent.status];

  return (
    <Card 
      className={cn(
        'w-80 flex-shrink-0 border-l-4 p-4 flex flex-col gap-3',
        config.borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant={config.color === 'mint' ? 'mint' : config.color === 'orange' ? 'orange' : config.color === 'blue' ? 'blue' : 'red'} size="sm">
          <StatusDot color={config.color} size="sm" pulse={agent.status === 'active'} />
          Agent #{agent.id}
        </Badge>
        <Badge variant="neutral" size="xs">
          {config.label}
        </Badge>
      </div>

      {/* Task */}
      <div>
        <h3 className="font-black text-sm text-text-primary uppercase tracking-widest leading-tight">
          {agent.task}
        </h3>
        <p className="text-xs text-text-secondary mt-1">
          {formatTimestamp(agent.updatedAt)}
        </p>
      </div>

      {/* Progress */}
      <div className="flex-1 space-y-1">
        {agent.progress.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="flex-shrink-0">{item.startsWith('✅') ? '✅' : '⏳'}</span>
            <span className="leading-tight">{item.replace(/^[✅⏳]\s*/, '')}</span>
          </div>
        ))}
      </div>

      {/* Footer Metadata */}
      <div className="border-t border-border-panel pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">
            {agent.model}
          </span>
          <span className="text-[10px] text-text-secondary font-mono">
            {formatTokens(agent.tokens)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
          <button
            onClick={() => onViewLog?.(agent.id)}
            className="flex-1 px-2 py-1.5 bg-surface hover:bg-background border border-border-panel rounded transition-colors text-text-primary"
          >
            View Log
          </button>
          <button
            onClick={() => onKill?.(agent.id)}
            className="px-2 py-1.5 bg-surface hover:bg-accent-red/10 border border-border-panel hover:border-accent-red/40 rounded transition-colors text-text-secondary hover:text-accent-red"
            disabled={agent.status === 'completed' || agent.status === 'failed'}
          >
            Kill
          </button>
          <button
            onClick={() => onArchive?.(agent.id)}
            className="px-2 py-1.5 bg-surface hover:bg-background border border-border-panel rounded transition-colors text-text-secondary"
          >
            Archive
          </button>
        </div>
      </div>
    </Card>
  );
}
