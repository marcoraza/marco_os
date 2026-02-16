import React, { useState, useMemo } from 'react';
import { AgentCard } from './AgentCard';
import { useAgentStream } from '../hooks/useAgentStream';
import type { AgentData } from '../hooks/useAgentStream';
import { cn } from '../utils/cn';

type FilterTab = 'all' | 'active' | 'queued' | 'completed';

export default function MissionControl() {
  const { agents, isConnected } = useAgentStream();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  // Filter agents based on active tab
  const filteredAgents = useMemo(() => {
    if (activeFilter === 'all') return agents;
    return agents.filter(agent => agent.status === activeFilter);
  }, [agents, activeFilter]);

  // Count by status
  const counts = useMemo(() => {
    return {
      all: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      queued: agents.filter(a => a.status === 'queued').length,
      completed: agents.filter(a => a.status === 'completed').length,
    };
  }, [agents]);

  // TODO: Auto-archive agents após 24h sem atividade
  // Implementar quando backend estiver pronto

  const handleRefresh = (id: string) => {
    console.log('Refresh agent:', id);
    // TODO: Refresh agent state
  };

  const handleClose = (id: string) => {
    console.log('Close agent:', id);
    // TODO: Close/archive agent
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tabs Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          {(['all', 'active', 'queued', 'completed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium transition-colors',
                activeFilter === tab
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <span className="capitalize">
                {tab === 'all' ? 'All Agents' : tab}
              </span>
              <span className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeFilter === tab
                  ? 'bg-white/10 text-white'
                  : 'bg-zinc-800 text-gray-400'
              )}>
                {counts[tab]}
              </span>
              
              {/* Active tab indicator */}
              {activeFilter === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable agent cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="p-6 flex gap-4 h-full items-start min-w-min">
          {filteredAgents.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-gray-500 text-sm">No agents found</p>
              </div>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onRefresh={handleRefresh}
                onClose={handleClose}
              />
            ))
          )}
        </div>
      </div>

      {/* Connection status (subtle, bottom-right) */}
      {!isConnected && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
          Disconnected
        </div>
      )}
    </div>
  );
}
