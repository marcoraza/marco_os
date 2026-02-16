// Mission Control V2 — Enhanced Agent Stream Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgentData, ActivityEvent, PerformanceMetrics } from '../types/mission-control.types';

// Mock WebSocket data - expanded with more realistic agents
const generateMockAgents = (): AgentData[] => [
  {
    id: "agent-001",
    status: "active",
    task: "Research Instagram APIs on RapidAPI marketplace",
    progress: [
      "Started web search for Instagram APIs on RapidAPI marketplace. Found several candidates including Official Instagram API, Instagram Scraper API, and Social Media Data API.",
      "Comparing pricing tiers and rate limits. The Official API requires business verification but offers 200 requests/day on free tier. Scraper API has 500 requests/month.",
      "Currently testing endpoints with sample requests to verify response format and data completeness."
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 12453,
    owner: "marco",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    estimatedCompletion: new Date(Date.now() + 1000 * 60 * 8).toISOString(),
    tokenHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), tokens: 3200 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), tokens: 5800 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), tokens: 9100 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), tokens: 12453 },
    ]
  },
  {
    id: "agent-002",
    status: "queued",
    task: "Build TikTok adapter for pipeline v3",
    progress: [
      "Waiting for Agent 1 to complete API research. Once Instagram adapter is validated, will use same pattern for TikTok integration.",
      "Prepared repository structure and identified required dependencies. Will need tiktok-scraper package and rate limiting middleware."
    ],
    model: "google/gemini-flash-1.5",
    tokens: 3201,
    owner: "marco",
    createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    dependencies: ["agent-001"],
    tokenHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(), tokens: 3201 },
    ]
  },
  {
    id: "agent-003",
    status: "completed",
    task: "Create Twitter/X adapter for pipeline v3",
    progress: [
      "Implemented Twitter/X adapter following pipeline v3 architecture. Created callback handler for inline button interactions (insights, digest, connections).",
      "Added tweet metadata extraction including author, timestamp, engagement metrics. Integrated with existing url_router.py for automatic platform detection.",
      "Completed testing with sample tweets. All callbacks working correctly. Merged to main branch and deployed."
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 18732,
    owner: "marco",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    tokenHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), tokens: 4200 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), tokens: 8900 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), tokens: 13400 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), tokens: 16800 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), tokens: 18732 },
    ]
  },
  {
    id: "agent-004",
    status: "active",
    task: "Analyze competitor pricing models and feature sets",
    progress: [
      "Compiled list of 12 direct competitors in the AI automation space. Extracted pricing tiers, feature matrices, and positioning statements from public websites.",
      "Created comparison spreadsheet with normalized metrics. Identified 3 key differentiators we should emphasize: real-time collaboration, cross-platform integrations, and transparent token usage.",
      "Currently drafting recommendation report with pricing strategy suggestions."
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 9823,
    owner: "sarah",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    estimatedCompletion: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    tokenHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(), tokens: 2100 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), tokens: 4500 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), tokens: 6700 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), tokens: 8200 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString(), tokens: 9823 },
    ]
  },
  {
    id: "agent-005",
    status: "failed",
    task: "Generate weekly analytics digest email",
    progress: [
      "Started data aggregation from PostgreSQL analytics tables. Query executed successfully and returned 24,583 events from past 7 days.",
      "Encountered error while formatting chart images: ChartJS renderer timeout. Attempted retry with reduced resolution but same error persists.",
      "Error: Puppeteer headless browser failed to initialize. Missing system dependency: libnss3. Cannot proceed without infrastructure fix."
    ],
    model: "google/gemini-flash-1.5",
    tokens: 5432,
    owner: "automation",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    tokenHistory: [
      { timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), tokens: 1800 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), tokens: 3600 },
      { timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), tokens: 5432 },
    ]
  }
];

export interface UseAgentStreamResult {
  agents: AgentData[];
  activityFeed: ActivityEvent[];
  isConnected: boolean;
  isRefreshing: boolean;
  refresh: () => void;
  addActivityEvent: (event: ActivityEvent) => void;
  getPerformanceMetrics: (agentId: string) => PerformanceMetrics | null;
}

export function useAgentStream(): UseAgentStreamResult {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Calculate performance metrics for an agent
  const getPerformanceMetrics = useCallback((agentId: string): PerformanceMetrics | null => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !agent.tokenHistory || agent.tokenHistory.length < 2) {
      return null;
    }

    const history = agent.tokenHistory;
    const firstPoint = history[0];
    const lastPoint = history[history.length - 1];
    
    const durationMs = new Date(lastPoint.timestamp).getTime() - new Date(firstPoint.timestamp).getTime();
    const durationMinutes = durationMs / (1000 * 60);
    const tokensUsed = lastPoint.tokens - firstPoint.tokens;
    
    const tokensPerMinute = durationMinutes > 0 ? tokensUsed / durationMinutes : 0;
    
    // Estimate time remaining based on progress
    const progressRatio = agent.progress.length / 10; // Assume ~10 progress steps for completion
    const avgCompletionTime = durationMinutes / progressRatio;
    const estimatedTimeRemaining = avgCompletionTime - durationMinutes;
    
    // Efficiency score (higher is better) - based on tokens/min and status
    let efficiency = Math.min(100, (tokensPerMinute / 100) * 100);
    if (agent.status === 'failed') efficiency = 0;
    if (agent.status === 'completed') efficiency = 100;
    
    return {
      tokensPerMinute: Math.round(tokensPerMinute),
      avgCompletionTime: Math.round(avgCompletionTime),
      efficiency: Math.round(efficiency),
      estimatedTimeRemaining: estimatedTimeRemaining > 0 ? Math.round(estimatedTimeRemaining) : undefined
    };
  }, [agents]);

  const addActivityEvent = useCallback((event: ActivityEvent) => {
    setActivityFeed(prev => [event, ...prev].slice(0, 100)); // Keep last 100 events
  }, []);

  // Fetch/refresh function
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate network delay
    setTimeout(() => {
      // TODO: Replace with real fetch
      // const response = await fetch('/api/agents');
      // const data = await response.json();
      // setAgents(data.agents);
      
      const updatedAgents = generateMockAgents().map(agent => ({
        ...agent,
        updatedAt: new Date().toISOString()
      }));
      
      setAgents(updatedAgents);
      setIsRefreshing(false);
    }, 300);
  }, []);

  useEffect(() => {
    // Initial load
    setIsConnected(true);
    refresh();

    // Generate initial activity events
    const initialEvents: ActivityEvent[] = [
      {
        id: 'evt-001',
        type: 'spawned',
        agentId: 'agent-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        description: 'Agent spawned: Research Instagram APIs'
      },
      {
        id: 'evt-002',
        type: 'progress_update',
        agentId: 'agent-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        description: 'Started API comparison'
      },
      {
        id: 'evt-003',
        type: 'spawned',
        agentId: 'agent-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        description: 'Agent spawned: Build TikTok adapter'
      },
      {
        id: 'evt-004',
        type: 'completed',
        agentId: 'agent-003',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        description: 'Agent completed successfully'
      },
      {
        id: 'evt-005',
        type: 'failed',
        agentId: 'agent-005',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        description: 'Agent failed: Missing system dependency'
      },
    ];
    setActivityFeed(initialEvents);

    // TODO: Implement real WebSocket connection
    // const ws = new WebSocket('ws://localhost:8080/agents');
    // wsRef.current = ws;
    
    // ws.onopen = () => {
    //   setIsConnected(true);
    //   console.log('WebSocket connected');
    // };
    
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   
    //   if (data.type === 'agent_update') {
    //     setAgents(prev => {
    //       const index = prev.findIndex(a => a.id === data.agent.id);
    //       if (index >= 0) {
    //         const next = [...prev];
    //         next[index] = data.agent;
    //         return next;
    //       }
    //       return [...prev, data.agent];
    //     });
    //   }
    //   
    //   if (data.type === 'activity_event') {
    //     addActivityEvent(data.event);
    //   }
    // };
    
    // ws.onerror = (error) => {
    //   console.error('WebSocket error:', error);
    //   setIsConnected(false);
    // };
    
    // ws.onclose = () => {
    //   console.log('WebSocket closed');
    //   setIsConnected(false);
    // };

    return () => {
      setIsConnected(false);
      // if (wsRef.current) {
      //   wsRef.current.close();
      // }
    };
  }, [refresh, addActivityEvent]);

  return {
    agents,
    activityFeed,
    isConnected,
    isRefreshing,
    refresh,
    addActivityEvent,
    getPerformanceMetrics
  };
}
