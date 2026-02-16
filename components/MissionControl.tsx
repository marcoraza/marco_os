import React, { useState, useMemo, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AgentCard } from './AgentCard';
import { useAgentStream } from '../hooks/useAgentStream';
import type { AgentData } from '../hooks/useAgentStream';
import { cn } from '../utils/cn';

type FilterTab = 'all' | 'active' | 'queued' | 'completed';

const CARD_ORDER_KEY = 'mission-control-card-order';

export default function MissionControl() {
  const { agents, isConnected, isRefreshing, refresh } = useAgentStream();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  
  // Card order (persist in localStorage)
  const [cardOrder, setCardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(CARD_ORDER_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    return () => clearInterval(interval);
  }, [refresh]);

  // Sync cardOrder when agents change
  useEffect(() => {
    if (agents.length > 0 && cardOrder.length === 0) {
      const initialOrder = agents.map(a => a.id);
      setCardOrder(initialOrder);
      localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(initialOrder));
    }
  }, [agents, cardOrder.length]);

  // Sort agents by cardOrder
  const sortedAgents = useMemo(() => {
    if (cardOrder.length === 0) return agents;
    
    const agentMap = new Map(agents.map(a => [a.id, a]));
    const sorted: AgentData[] = [];
    
    // Add agents in cardOrder
    cardOrder.forEach(id => {
      const agent = agentMap.get(id);
      if (agent) sorted.push(agent);
    });
    
    // Add any new agents not in cardOrder
    agents.forEach(agent => {
      if (!cardOrder.includes(agent.id)) {
        sorted.push(agent);
      }
    });
    
    return sorted;
  }, [agents, cardOrder]);

  // Filter agents based on active tab
  const filteredAgents = useMemo(() => {
    if (activeFilter === 'all') return sortedAgents;
    return sortedAgents.filter(agent => agent.status === activeFilter);
  }, [sortedAgents, activeFilter]);

  // Count by status
  const counts = useMemo(() => {
    return {
      all: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      queued: agents.filter(a => a.status === 'queued').length,
      completed: agents.filter(a => a.status === 'completed').length,
    };
  }, [agents]);

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.indexOf(active.id as string);
      const newIndex = cardOrder.indexOf(over.id as string);

      const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
      setCardOrder(newOrder);
      localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(newOrder));
    }
  };

  // TODO: Auto-archive agents após 24h sem atividade
  // Implementar quando backend estiver pronto

  const handleRefresh = (id: string) => {
    console.log('Refresh agent:', id);
    // TODO: Refresh specific agent
    refresh();
  };

  const handleClose = (id: string) => {
    console.log('Close agent:', id);
    // TODO: Close/archive agent
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Tabs Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
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

          {/* Refresh indicator */}
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Updating...</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable agent cards with drag & drop */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="p-6 flex gap-4 h-full items-start min-w-min">
            {filteredAgents.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-gray-500 text-sm">No agents found</p>
                </div>
              </div>
            ) : (
              <SortableContext
                items={filteredAgents.map(a => a.id)}
                strategy={horizontalListSortingStrategy}
              >
                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onRefresh={handleRefresh}
                    onClose={handleClose}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
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
