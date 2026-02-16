// Mission Control V2 — Type Definitions

export type AgentStatus = 'active' | 'queued' | 'completed' | 'failed';

export interface AgentData {
  id: string;
  status: AgentStatus;
  task: string;
  progress: string[];
  model: string;
  tokens: number;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  dependencies?: string[]; // Agent IDs this agent depends on
  estimatedCompletion?: string; // ISO timestamp
  tokenHistory?: TokenUsagePoint[]; // For sparkline chart
}

export interface TokenUsagePoint {
  timestamp: string;
  tokens: number;
}

export interface ActivityEvent {
  id: string;
  type: 'spawned' | 'status_changed' | 'completed' | 'failed' | 'progress_update';
  agentId: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string; // Material Symbol name
  defaultModel: string;
  defaultTask: string;
  tags: string[];
}

export interface SavedFilter {
  id: string;
  name: string;
  status?: AgentStatus[];
  models?: string[];
  owners?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PerformanceMetrics {
  tokensPerMinute: number;
  avgCompletionTime: number; // minutes
  efficiency: number; // 0-100 score
  estimatedTimeRemaining?: number; // minutes
}

export type ViewMode = 'kanban' | 'graph';

export type FilterTab = 'all' | 'active' | 'queued' | 'completed' | 'failed';

export interface BulkAction {
  type: 'kill' | 'archive' | 'export';
  agentIds: string[];
}
