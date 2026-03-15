export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string; // ISO8601
  toolCalls?: Array<{ name: string; input: string; output: string }>;
}

export interface ChatSession {
  id: string;              // format: `${agentId}:${sectionId}`
  agentId: string;         // 'frank' | 'coder' | 'researcher'
  sectionId: string;       // view ID: 'finance' | 'health' | etc.
  openClawSessionId: string | null;
  messages: ChatMessage[];
  createdAt: string;       // ISO8601
  updatedAt: string;       // ISO8601
}
