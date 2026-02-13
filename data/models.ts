export interface StoredProject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  deletable: boolean;
}

export type StoredTaskStatus = 'assigned' | 'started' | 'in-progress' | 'standby' | 'done';
export type StoredTaskPriority = 'high' | 'medium' | 'low';

export interface StoredTask {
  id: number;
  title: string;
  tag: string;
  projectId: string;
  status: StoredTaskStatus;
  priority: StoredTaskPriority;
  deadline: string;
  assignee: string;
  dependencies?: number;
}

export interface StoredNote {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  projectId?: string;
}

export interface StoredEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  projectId?: string;
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
