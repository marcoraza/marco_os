import React, { lazy } from 'react';
import type { StoredEvent, StoredNote } from '../data/models';
import type { Project, Task, View } from '../lib/appTypes';

const Dashboard = lazy(() => import('./Dashboard'));
const Finance = lazy(() => import('./Finance'));
const Health = lazy(() => import('./Health'));
const Learning = lazy(() => import('./Learning'));
const Planner = lazy(() => import('./Planner'));
const NotesPanel = lazy(() => import('./NotesPanel'));
const CRM = lazy(() => import('./CRM'));
const AgentCommandCenter = lazy(() => import('./AgentCommandCenter'));
const AgentDetailView = lazy(() => import('./AgentDetailView'));
const Settings = lazy(() => import('./Settings'));
const MissionDetail = lazy(() => import('./MissionDetail'));

interface AppContentRouterProps {
  currentView: View;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick: (taskId: number) => void;
  activeProjectId: string;
  projects: Project[];
  onAddTask: () => void;
  events: StoredEvent[];
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
  addTasks: (tasks: Omit<Task, 'id' | 'assignee' | 'dependencies'>[]) => Task[];
  notes: StoredNote[];
  setNotes: React.Dispatch<React.SetStateAction<StoredNote[]>>;
  onAgentClick: (agentId: string) => void;
  onNavigate: React.Dispatch<React.SetStateAction<View>>;
  onTaskStatusSync?: (taskId: number, newStatus: Task['status']) => Promise<void>;
  activeAgentId: string;
  selectedTaskId: number | null;
}

export default function AppContentRouter({
  currentView,
  tasks,
  setTasks,
  onTaskClick,
  activeProjectId,
  projects,
  onAddTask,
  events,
  setEvents,
  addTasks,
  notes,
  setNotes,
  onAgentClick,
  onNavigate,
  onTaskStatusSync,
  activeAgentId,
  selectedTaskId,
}: AppContentRouterProps) {
  if (currentView === 'dashboard') {
    return (
      <Dashboard
        tasks={tasks}
        setTasks={setTasks}
        onTaskClick={onTaskClick}
        activeProjectId={activeProjectId}
        projects={projects}
        onAddTask={onAddTask}
        events={events}
        setEvents={setEvents}
        onNavigate={(view) => onNavigate(view as View)}
        onTaskStatusSync={onTaskStatusSync}
      />
    );
  }

  if (currentView === 'finance') return <Finance />;
  if (currentView === 'health') return <Health />;
  if (currentView === 'learning') return <Learning />;
  if (currentView === 'planner') {
    return <Planner projects={projects} activeProjectId={activeProjectId} addTasks={addTasks} tasks={tasks} />;
  }
  if (currentView === 'notes') {
    return <NotesPanel notes={notes} setNotes={setNotes} activeProjectId={activeProjectId} />;
  }
  if (currentView === 'crm') return <CRM />;
  if (currentView === 'agents-overview') {
    return <AgentCommandCenter onAgentClick={onAgentClick} onNavigate={onNavigate} />;
  }
  if (currentView === 'agent-detail' && activeAgentId) {
    return <AgentDetailView agentId={activeAgentId} onBack={() => onNavigate('agents-overview')} />;
  }
  if (currentView === 'settings') return <Settings />;
  if (currentView === 'mission-detail' && selectedTaskId) {
    const selectedTask = tasks.find((task) => task.id === selectedTaskId);
    if (!selectedTask) return null;
    return (
      <MissionDetail
        task={selectedTask}
        onBack={() => onNavigate('dashboard')}
        onStatusChange={(taskId, newStatus) => {
          setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
          if (onTaskStatusSync) {
            void onTaskStatusSync(taskId, newStatus);
          }
        }}
      />
    );
  }

  return null;
}
