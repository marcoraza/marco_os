import { useState, useEffect, useCallback } from 'react';

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
      "Iniciado web_search em busca de APIs oficiais e wrappers confiáveis",
      "Encontrado 3 APIs candidatas no RapidAPI com boa reputação",
      "Testando endpoints de cada API para validar rate limits e response format"
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
      "Aguardando conclusão do Agent 1 para replicar estrutura de API discovery"
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
      "Pipeline v3 structure implementada com opinião crítica + nota sistema",
      "Callback handler criado para menu de 16 botões",
      "Testing completo com URLs reais do Twitter/X",
      "Merged to main após code review do Marco"
    ],
    model: "anthropic/claude-sonnet-4-5",
    tokens: 18732,
    createdAt: "2026-02-16T13:45:00Z",
    updatedAt: "2026-02-16T14:12:00Z"
  }
];

export function useAgentStream(autoRefreshMs: number = 5000) {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAgents = useCallback(() => {
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setAgents(mockAgents);
      setIsRefreshing(false);
    }, 300);

    // TODO: Replace with real API call
    // fetch('/api/agents/active')
    //   .then(res => res.json())
    //   .then(data => {
    //     setAgents(data.agents);
    //     setIsRefreshing(false);
    //   })
    //   .catch(() => {
    //     setIsRefreshing(false);
    //   });
  }, []);

  useEffect(() => {
    // Initial load
    setIsConnected(true);
    fetchAgents();

    // Auto-refresh interval
    const interval = setInterval(fetchAgents, autoRefreshMs);

    // TODO: Implement real WebSocket connection
    // const ws = new WebSocket('ws://localhost:8080/agents');
    // ws.onopen = () => setIsConnected(true);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setAgents(data.agents);
    // };
    // ws.onerror = () => setIsConnected(false);
    // ws.onclose = () => setIsConnected(false);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
      // ws?.close();
    };
  }, [fetchAgents, autoRefreshMs]);

  return { agents, isConnected, isRefreshing, refetch: fetchAgents };
}
