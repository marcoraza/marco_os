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

// Mock WebSocket data
const mockAgents: AgentData[] = [
  {
    id: "1",
    status: "active",
    task: "Pesquisar APIs Instagram no RapidAPI",
    progress: [
      "✅ Iniciado web_search",
      "✅ Encontrado 3 APIs candidatas",
      "⏳ Testando endpoints"
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
      "⏳ Aguardando conclusão do Agent 1"
    ],
    model: "google/gemini-flash-1.5",
    tokens: 3201,
    createdAt: "2026-02-16T14:24:00Z",
    updatedAt: "2026-02-16T14:24:00Z"
  },
  {
    id: "3",
    status: "completed",
    task: "Criar adapter X/Twitter pro pipeline",
    progress: [
      "✅ Pipeline v3 structure",
      "✅ Callback handler",
      "✅ Testing completo",
      "✅ Merged to main"
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
