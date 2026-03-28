import React, { lazy } from 'react';
import type { StoredEvent, StoredNote } from '../data/models';
import type { Project, Task, View } from '../lib/appTypes';
import { useMissionControlStore } from '../store/missionControl';

const Dashboard = lazy(() => import('./Dashboard'));
const Finance = lazy(() => import('./Finance'));
const Health = lazy(() => import('./Health'));
const Learning = lazy(() => import('./Learning'));
const Planner = lazy(() => import('./Planner'));
const NotesPanel = lazy(() => import('./NotesPanel'));
const CRM = lazy(() => import('./CRM'));
const AgentCommandCenter = lazy(() => import('./AgentCommandCenter'));
const MCAgentsShell = lazy(() => import('./agents/MCAgentsShell'));
const AgentDetailView = lazy(() => import('./AgentDetailView'));
const MCAgentDetail = lazy(() => import('./agents/MCAgentDetail'));
const MCAgentProfile = lazy(() => import('./agents/mc/MCAgentProfile').then((m) => ({ default: m.MCAgentProfile })));
const MCConfigShell = lazy(() => import('./agents/mc/MCConfigShell').then((m) => ({ default: m.MCConfigShell })));
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
  onMoveTask?: (taskId: number, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: number) => void;
  onRestoreTask?: (taskId: number) => void;
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
  onMoveTask,
  onDeleteTask,
  onRestoreTask,
  activeAgentId,
  selectedTaskId,
}: AppContentRouterProps) {
  const showConfigView = useMissionControlStore((s) => s.showConfigView);
  const setShowConfigView = useMissionControlStore((s) => s.setShowConfigView);

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
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
        onRestoreTask={onRestoreTask}
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
    if (showConfigView) {
      return <MCConfigShell onBack={() => setShowConfigView(false)} />;
    }
    return <MCAgentsShell onAgentClick={onAgentClick} />;
  }
  // agent-detail is now an overlay inside MCAgentsShell (profileAgentId).
  // Redirect legacy deep-links back to the shell and open the overlay.
  if (currentView === 'agent-detail') {
    if (activeAgentId) {
      useMissionControlStore.getState().setProfileAgentId(activeAgentId);
    }
    onNavigate('agents-overview');
    return null;
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
