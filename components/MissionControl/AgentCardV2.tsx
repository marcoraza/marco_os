// Mission Control V2 — Enhanced Agent Card

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../utils/cn';
import { statusConfig } from '../../utils/colors';
import type { AgentData, PerformanceMetrics } from '../../types/mission-control.types';

interface AgentCardV2Props {
  agent: AgentData;
  isSelected?: boolean;
  isCollapsed?: boolean;
  metrics?: PerformanceMetrics | null;
  onToggleCollapse?: () => void;
  onToggleSelect?: () => void;
  onViewLogs?: () => void;
  onKill?: () => void;
  onArchive?: () => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function Sparkline({ points }: { points: { tokens: number }[] }) {
  if (!points || points.length < 2) return null;

  const maxTokens = Math.max(...points.map(p => p.tokens));
  const minTokens = Math.min(...points.map(p => p.tokens));
  const range = maxTokens - minTokens;

  if (range === 0) return null;

  const width = 120;
  const height = 24;
  const padding = 2;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((p.tokens - minTokens) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={pathPoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-emerald-500"
      />
    </svg>
  );
}

export default function AgentCardV2({
  agent,
  isSelected = false,
  isCollapsed = false,
  metrics,
  onToggleCollapse,
  onToggleSelect,
  onViewLogs,
  onKill,
  onArchive
}: AgentCardV2Props) {
  const config = statusConfig[agent.status];
  const [showActions, setShowActions] = useState(false);

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'w-80 flex-shrink-0 transition-all duration-200 relative',
        isDragging && 'opacity-60 scale-98 z-50'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'bg-zinc-800 rounded-lg overflow-hidden transition-all duration-200 ease-in-out',
          'border-l-4 shadow-sm hover:shadow-md',
          isSelected && 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-zinc-900',
          isCollapsed ? 'h-20' : 'h-full'
        )}
        style={{ borderLeftColor: config.color }}
      >
        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            {/* Left: Checkbox + Drag Handle + Agent ID */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              
              <button
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-zinc-700 rounded transition-colors"
                title="Drag to reorder"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>

              <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                {agent.id}
              </span>
            </div>

            {/* Right: Status + Time */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono">
                {formatTime(agent.updatedAt)}
              </span>
            </div>
          </div>

          {/* Status Badge + Actions */}
          <div className="flex items-center justify-between mb-4">
            <span className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              config.bgColor,
              config.textColor
            )}>
              {config.label}
            </span>

            {/* Action buttons (show on hover) */}
            <div className={cn(
              'flex items-center gap-1 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0'
            )}>
              <button
                onClick={onToggleCollapse}
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
                onClick={onViewLogs}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                title="View Logs"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              {agent.status === 'active' && (
                <button
                  onClick={onKill}
                  className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                  title="Kill Agent"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {(agent.status === 'completed' || agent.status === 'failed') && (
                <button
                  onClick={onArchive}
                  className="p-1 hover:bg-zinc-700 rounded transition-colors"
                  title="Archive"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isCollapsed && (
          <div className="px-5 pb-5 space-y-4">
            {/* Task Title */}
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
              {agent.task}
            </h3>

            {/* Progress */}
            <div className="space-y-2">
              {agent.progress.map((item, idx) => (
                <p key={idx} className="text-xs text-gray-400 leading-relaxed">
                  {item}
                </p>
              ))}
            </div>

            {/* Performance Metrics */}
            {metrics && agent.status === 'active' && (
              <div className="pt-4 border-t border-zinc-700 space-y-3">
                {/* Sparkline */}
                {agent.tokenHistory && agent.tokenHistory.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-gray-500 font-mono">Token Usage</span>
                    <Sparkline points={agent.tokenHistory} />
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-900 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 font-mono mb-1">Tokens/min</p>
                    <p className="text-sm font-bold text-white">{metrics.tokensPerMinute}</p>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 font-mono mb-1">Efficiency</p>
                    <p className="text-sm font-bold text-emerald-400">{metrics.efficiency}%</p>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <p className="text-[10px] uppercase text-gray-500 font-mono mb-1">ETA</p>
                    <p className="text-sm font-bold text-white">
                      {metrics.estimatedTimeRemaining ? `${metrics.estimatedTimeRemaining}m` : '—'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Metadata */}
            <div className="pt-4 border-t border-zinc-700 flex items-center justify-between text-[10px] font-mono uppercase">
              <span className="text-gray-500">{agent.model}</span>
              <span className="text-gray-400 font-bold">{(agent.tokens / 1000).toFixed(1)}k tokens</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
