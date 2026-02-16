import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  // Collapse/expand state (persist in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem(`agent-card-collapsed-${agent.id}`);
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(`agent-card-collapsed-${agent.id}`, String(isCollapsed));
  }, [isCollapsed, agent.id]);

  // Drag & drop sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-[320px] flex-shrink-0 transition-all duration-200',
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div className={cn(
        'bg-zinc-800 rounded-lg p-5 flex flex-col gap-3 transition-all duration-200 ease-in-out overflow-hidden',
        isCollapsed && 'h-[80px]'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <button
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-zinc-700 rounded transition-colors"
                  title="Drag to reorder"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </button>
                <span className="text-white font-semibold text-sm">Agent {agent.id}</span>
              </div>
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
                {/* Collapse/expand button */}
                <button
                  onClick={toggleCollapse}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                  title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  <svg 
                    className="w-4 h-4 text-gray-400 transition-transform duration-200"
                    style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
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

        {/* Collapsible content */}
        {!isCollapsed && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
