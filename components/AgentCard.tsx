import React from 'react';
import { cn } from '../utils/cn';
import type { AgentData } from '../hooks/useAgentStream';

interface AgentCardProps {
  agent: AgentData;
  onRefresh?: (id: string) => void;
  onClose?: (id: string) => void;
}

const statusConfig: Record<AgentData['status'], { 
  color: string; 
  bgColor: string; 
  textColor: string;
}> = {
  active: { 
    color: '#10b981', 
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500'
  },
  queued: { 
    color: '#f59e0b',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500'
  },
  completed: { 
    color: '#6b7280',
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-500'
  },
  failed: { 
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-500'
  },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function AgentCard({ agent, onRefresh, onClose }: AgentCardProps) {
  const config = statusConfig[agent.status];

  return (
    <div className="w-[320px] flex-shrink-0 bg-zinc-800 rounded-lg p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">Agent {agent.id}</span>
            <span className="text-gray-400 text-xs">{formatTime(agent.updatedAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              config.bgColor,
              config.textColor
            )}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </span>
            
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => onRefresh?.(agent.id)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                title="Refresh"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => onClose?.(agent.id)}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-white font-bold text-sm leading-tight">
        {agent.task}
      </h3>

      {/* Progress (plain text, not bullets) */}
      <div className="space-y-2 text-gray-400 text-xs leading-relaxed">
        {agent.progress.map((item, idx) => (
          <p key={idx}>{item}</p>
        ))}
      </div>

      {/* Footer Metadata */}
      <div className="mt-auto pt-3 border-t border-zinc-700 flex items-center justify-between text-[10px] text-gray-500">
        <span>{agent.model}</span>
        <span>{(agent.tokens / 1000).toFixed(1)}k tokens</span>
      </div>
    </div>
  );
}
