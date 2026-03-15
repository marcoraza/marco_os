import { useState, useEffect } from 'react';

export interface AgentData {
  id: string;
  status: 'active' | 'queued' | 'completed' | 'failed';
  task: string;
  progress: string[];
  model: string;
  tokens: number;
  createdAt: string;
  updatedAt: string;
}

// Mock WebSocket data - texto corrido como na screenshot
const mockAgents: AgentData[] = [
  {
    id: "1",
    status: "active",
    task: "Pesquisar APIs Instagram no RapidAPI",
    progress: [
      "Started web search for Instagram APIs on RapidAPI marketplace. Found several candidates including Official Instagram API, Instagram Scraper API, and Social Media Data API.",
      "Comparing pricing tiers and rate limits. The Official API requires business verification but offers 200 requests/day on free tier. Scraper API has 500 requests/month.",
      "Currently testing endpoints with sample requests to verify response format and data completeness."
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 12453,
    createdAt: "2026-02-16T14:23:00Z",
    updatedAt: "2026-02-16T14:25:32Z"
  },
  {
    id: "2",
    status: "queued",
    task: "Construir adapter TikTok pro pipeline v3",
    progress: [
      "Waiting for Agent 1 to complete API research. Once Instagram adapter is validated, will use same pattern for TikTok integration.",
      "Prepared repository structure and identified required dependencies. Will need tiktok-scraper package and rate limiting middleware."
    ],
    model: "google/gemini-flash-1.5",
    tokens: 3201,
    createdAt: "2026-02-16T14:24:00Z",
    updatedAt: "2026-02-16T14:24:00Z"
  },
  {
    id: "3",
    status: "completed",
    task: "Criar adapter X/Twitter pro pipeline v3",
    progress: [
      "Implemented Twitter/X adapter following pipeline v3 architecture. Created callback handler for inline button interactions (insights, digest, connections).",
      "Added tweet metadata extraction including author, timestamp, engagement metrics. Integrated with existing url_router.py for automatic platform detection.",
      "Completed testing with sample tweets. All callbacks working correctly. Merged to main branch and deployed."
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 18732,
    createdAt: "2026-02-16T13:45:00Z",
    updatedAt: "2026-02-16T14:12:00Z"
  }
];

export function useAgentStream() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection
    setIsConnected(true);
    setAgents(mockAgents);

    // TODO: Implement real WebSocket connection
    // const ws = new WebSocket('ws://localhost:8080/agents');
    // ws.onopen = () => setIsConnected(true);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setAgents(data.agents);
    // };
    // ws.onerror = () => setIsConnected(false);
    // ws.onclose = () => setIsConnected(false);
    // return () => ws.close();

    return () => {
      setIsConnected(false);
    };
  }, []);

  return { agents, isConnected };
}
