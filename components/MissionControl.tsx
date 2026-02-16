import React, { useState, useMemo } from 'react';
import { Badge, Icon } from './ui';
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

  const handleViewLog = (id: string) => {
    console.log('View log for agent:', id);
    // TODO: Open log viewer modal
  };

  const handleKill = (id: string) => {
    console.log('Kill agent:', id);
    // TODO: Send kill signal to agent
  };

  const handleArchive = (id: string) => {
    console.log('Archive agent:', id);
    // TODO: Archive agent
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with filters */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border-panel">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name="view_column" size="lg" className="text-brand-mint" />
            <h1 className="font-black text-lg uppercase tracking-widest text-text-primary">
              Mission Control
            </h1>
            <Badge variant="neutral" size="md">
              {counts.all} {counts.all === 1 ? 'Agent' : 'Agents'}
            </Badge>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-brand-mint animate-pulse' : 'bg-accent-red'
            )} />
            <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(['all', 'active', 'queued', 'completed'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all border',
                activeFilter === tab
                  ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/40'
                  : 'bg-surface text-text-secondary border-border-panel hover:border-text-secondary/40'
              )}
            >
              {tab}
              <span className="ml-1.5 opacity-70">
                ({counts[tab]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable agent cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="p-6 flex gap-4 h-full items-start">
          {filteredAgents.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <Icon name="search_off" size="lg" className="text-text-secondary/50 mx-auto" />
                <p className="text-sm text-text-secondary uppercase tracking-wider font-medium">
                  No agents found
                </p>
              </div>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onViewLog={handleViewLog}
                onKill={handleKill}
                onArchive={handleArchive}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
