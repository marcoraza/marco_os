// Mission Control V2 — Main Container

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
import AgentCardV2 from './AgentCardV2';
import ActivityFeed from './ActivityFeed';
import SearchBar from './SearchBar';
import BulkActionsBar from './BulkActionsBar';
import { useAgentStream } from '../../hooks/useAgentStream';
import { useAgentActions } from '../../hooks/useAgentActions';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';
import { useStatePersistence } from '../../hooks/useStatePersistence';
import { cn } from '../../utils/cn';
import type { FilterTab } from '../../types/mission-control.types';

const CARD_ORDER_KEY = 'mission-control-v2-card-order';
const COLLAPSED_KEY = 'mission-control-v2-collapsed';
const SELECTED_KEY = 'mission-control-v2-selected';

export default function MissionControlV2() {
  const { agents, activityFeed, isConnected, isRefreshing, refresh, getPerformanceMetrics } = useAgentStream();
  const { killAgent, archiveAgent, exportLogs, bulkAction, isProcessing } = useAgentActions();
  
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [focusedCardIndex, setFocusedCardIndex] = useState<number>(0);

  // Persisted state
  const cardOrderState = useStatePersistence<string[]>(CARD_ORDER_KEY, []);
  const collapsedState = useStatePersistence<Record<string, boolean>>(COLLAPSED_KEY, {});
  const selectedState = useStatePersistence<Record<string, boolean>>(SELECTED_KEY, {});

  const cardOrder = cardOrderState.value;
  const setCardOrder = cardOrderState.setValue;
  const collapsed = collapsedState.value;
  const setCollapsed = collapsedState.setValue;
  const selected = selectedState.value;
  const setSelected = selectedState.setValue;

  // Sync card order when agents change
  React.useEffect(() => {
    if (agents.length > 0 && cardOrder.length === 0) {
      const initialOrder = agents.map(a => a.id);
      setCardOrder(initialOrder);
    }
  }, [agents, cardOrder.length, setCardOrder]);

  // Sort agents by card order
  const sortedAgents = useMemo(() => {
    if (cardOrder.length === 0) return agents;
    
    const agentMap = new Map(agents.map(a => [a.id, a]));
    const sorted = [];
    
    cardOrder.forEach(id => {
      const agent = agentMap.get(id);
      if (agent) sorted.push(agent);
    });
    
    agents.forEach(agent => {
      if (!cardOrder.includes(agent.id)) {
        sorted.push(agent);
      }
    });
    
    return sorted;
  }, [agents, cardOrder]);

  // Filter and search
  const filteredAgents = useMemo(() => {
    let result = sortedAgents;

    // Filter by tab
    if (activeFilter !== 'all') {
      result = result.filter(agent => agent.status === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.task.toLowerCase().includes(query) ||
        agent.model.toLowerCase().includes(query) ||
        agent.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [sortedAgents, activeFilter, searchQuery]);

  // Count by status
  const counts = useMemo(() => {
    return {
      all: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      queued: agents.filter(a => a.status === 'queued').length,
      completed: agents.filter(a => a.status === 'completed').length,
      failed: agents.filter(a => a.status === 'failed').length,
    };
  }, [agents]);

  // Selected agents
  const selectedAgents = useMemo(() => {
    return Object.keys(selected).filter(id => selected[id]);
  }, [selected]);

  const hasSelection = selectedAgents.length > 0;

  // Drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cardOrder.indexOf(active.id as string);
      const newIndex = cardOrder.indexOf(over.id as string);

      const newOrder = arrayMove(cardOrder, oldIndex, newIndex);
      setCardOrder(newOrder);
    }
  };

  // Card actions
  const toggleCollapse = useCallback((id: string) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setCollapsed]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setSelected]);

  const handleSelectAll = useCallback(() => {
    const newSelected: Record<string, boolean> = {};
    filteredAgents.forEach(agent => {
      newSelected[agent.id] = true;
    });
    setSelected(newSelected);
  }, [filteredAgents, setSelected]);

  const handleDeselectAll = useCallback(() => {
    setSelected({});
  }, [setSelected]);

  const handleKillSelected = useCallback(async () => {
    if (!confirm(`Kill ${selectedAgents.length} agent(s)?`)) return;
    
    await bulkAction({
      type: 'kill',
      agentIds: selectedAgents
    });
    
    handleDeselectAll();
    refresh();
  }, [selectedAgents, bulkAction, handleDeselectAll, refresh]);

  const handleArchiveSelected = useCallback(async () => {
    await bulkAction({
      type: 'archive',
      agentIds: selectedAgents
    });
    
    handleDeselectAll();
    refresh();
  }, [selectedAgents, bulkAction, handleDeselectAll, refresh]);

  const handleExportSelected = useCallback(async () => {
    await bulkAction({
      type: 'export',
      agentIds: selectedAgents
    });
  }, [selectedAgents, bulkAction]);

  // Keyboard navigation
  useKeyboardNav({
    onSelectAll: handleSelectAll,
    onKillSelected: handleKillSelected,
    onDeselectAll: handleDeselectAll,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onNavigateLeft: () => setFocusedCardIndex(prev => Math.max(0, prev - 1)),
    onNavigateRight: () => setFocusedCardIndex(prev => Math.min(filteredAgents.length - 1, prev + 1)),
    onToggleExpand: () => {
      const agent = filteredAgents[focusedCardIndex];
      if (agent) toggleCollapse(agent.id);
    },
    onToggleSelect: () => {
      const agent = filteredAgents[focusedCardIndex];
      if (agent) toggleSelect(agent.id);
    },
    enabled: true
  });

  return (
    <div className="h-screen flex flex-col bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 h-15 px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo / Title */}
          <h1 className="text-lg font-black text-white uppercase tracking-wider">Mission Control</h1>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'active', 'queued', 'completed', 'failed'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  'relative px-3 py-1.5 text-sm font-medium transition-colors rounded',
                  activeFilter === tab
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-zinc-800'
                )}
              >
                <span className="capitalize">{tab}</span>
                <span className={cn(
                  'ml-2 px-1.5 py-0.5 rounded text-xs',
                  activeFilter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-zinc-800 text-gray-500'
                )}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search agents..."
          />

          {/* Connection Status */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium',
            isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-emerald-500' : 'bg-red-500'
            )} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>

          {/* Refresh indicator */}
          {isRefreshing && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {hasSelection && (
        <BulkActionsBar
          count={selectedAgents.length}
          onKill={handleKillSelected}
          onArchive={handleArchiveSelected}
          onExport={handleExportSelected}
          onDeselectAll={handleDeselectAll}
          isProcessing={isProcessing}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agent Cards Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="p-6 flex gap-4 h-full items-start min-w-min">
              {filteredAgents.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-gray-500 text-sm">
                      {searchQuery ? 'No matching agents found' : 'No agents running'}
                    </p>
                  </div>
                </div>
              ) : (
                <SortableContext
                  items={filteredAgents.map(a => a.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  {filteredAgents.map((agent, index) => (
                    <AgentCardV2
                      key={agent.id}
                      agent={agent}
                      isSelected={!!selected[agent.id]}
                      isCollapsed={!!collapsed[agent.id]}
                      metrics={getPerformanceMetrics(agent.id)}
                      onToggleCollapse={() => toggleCollapse(agent.id)}
                      onToggleSelect={() => toggleSelect(agent.id)}
                      onViewLogs={() => console.log('View logs:', agent.id)}
                      onKill={async () => {
                        if (confirm(`Kill agent ${agent.id}?`)) {
                          await killAgent(agent.id);
                          refresh();
                        }
                      }}
                      onArchive={async () => {
                        await archiveAgent(agent.id);
                        refresh();
                      }}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </DndContext>
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          events={activityFeed}
          isCollapsed={feedCollapsed}
          onToggle={() => setFeedCollapsed(!feedCollapsed)}
        />
      </div>
    </div>
  );
}
