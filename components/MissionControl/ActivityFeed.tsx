// Mission Control V2 — Activity Feed Component

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import type { ActivityEvent } from '../../types/mission-control.types';

interface ActivityFeedProps {
  events: ActivityEvent[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

type EventFilter = 'all' | 'errors' | 'completed';

const eventTypeConfig = {
  spawned: {
    icon: '▶',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  status_changed: {
    icon: '↻',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10'
  },
  completed: {
    icon: '✓',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  failed: {
    icon: '✕',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10'
  },
  progress_update: {
    icon: '○',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10'
  }
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ActivityFeed({ events, isCollapsed = false, onToggle }: ActivityFeedProps) {
  const [filter, setFilter] = useState<EventFilter>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'errors') return event.type === 'failed';
    if (filter === 'completed') return event.type === 'completed';
    return true;
  });

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  // Detect manual scroll to disable auto-scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    setAutoScroll(isAtBottom);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-zinc-800 rounded transition-colors"
          title="Show Activity Feed"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Event count badge */}
        {events.length > 0 && (
          <div className="mt-4 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold">
            {events.length > 99 ? '99+' : events.length}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Activity Feed</h3>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-zinc-800 rounded transition-colors"
            title="Collapse"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'errors', 'completed'] as EventFilter[]).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                filter === filterType
                  ? 'bg-white/10 text-white'
                  : 'bg-zinc-800 text-gray-400 hover:text-gray-300'
              )}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Events list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
      >
        {filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No activity yet</p>
          </div>
        ) : (
          filteredEvents.map(event => {
            const config = eventTypeConfig[event.type];
            return (
              <div
                key={event.id}
                className="flex gap-3 p-3 bg-zinc-800 rounded border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className={cn(
                  'w-6 h-6 rounded flex items-center justify-center flex-shrink-0',
                  config.bgColor
                )}>
                  <span className={cn('text-xs font-bold', config.color)}>
                    {config.icon}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-500 font-mono">
                      {event.agentId}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded shadow-lg transition-colors"
          >
            ↓ New events
          </button>
        </div>
      )}
    </div>
  );
}
