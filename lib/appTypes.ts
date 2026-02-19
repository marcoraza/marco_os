// Types extracted from App.tsx for shared use across components

export type View =
  | 'dashboard'
  | 'finance'
  | 'health'
  | 'learning'
  | 'planner'
  | 'crm'
  | 'notes'
  | 'settings'
  | 'mission-detail'
  | 'agents-overview'
  | 'agent-detail';

export type UptimeView = '24H' | '7D' | '30D' | '90D' | '120D' | '365D';

export type Theme = 'dark' | 'light' | 'system';

export interface Project {
  id: string;
  name: string;
  color: string;   // hex
  icon?: string;   // material-symbols name (optional)
  deletable: boolean;
}

export interface Task {
  id: number;
  title: string;
  tag: string;
  projectId: string; // references Project.id
  status: 'assigned' | 'started' | 'in-progress' | 'standby' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignee: string;
  dependencies?: number;
}
