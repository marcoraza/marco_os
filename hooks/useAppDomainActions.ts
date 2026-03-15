import { useCallback } from 'react';
import type { StoredEvent, StoredNote } from '../data/models';
import type { Project, Task, View } from '../lib/appTypes';
import { createPaletteEvent, createPaletteNote, createPaletteTask, createProject, createTaskFromInput } from '../data/domainFactories';
import { showToast } from '../components/ui';

interface AppDomainActionsParams {
  activeProjectId: string;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setActiveProjectId: React.Dispatch<React.SetStateAction<string>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setNotes: React.Dispatch<React.SetStateAction<StoredNote[]>>;
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
  setCurrentView: React.Dispatch<React.SetStateAction<View>>;
  setSelectedTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveAgentId: React.Dispatch<React.SetStateAction<string>>;
  setIsMissionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projectColors: string[];
}

export function useAppDomainActions({
  activeProjectId,
  setProjects,
  setActiveProjectId,
  setTasks,
  setNotes,
  setEvents,
  setCurrentView,
  setSelectedTaskId,
  setActiveAgentId,
  setIsMissionModalOpen,
  projectColors,
}: AppDomainActionsParams) {
  const addProject = useCallback((name: string) => {
    const color = projectColors[Math.floor(Math.random() * projectColors.length)] || '#0A84FF';
    const project = createProject(name, color);
    setProjects((prev) => [...prev, project]);
    setActiveProjectId(project.id);
  }, [projectColors, setActiveProjectId, setProjects]);

  const addTask = useCallback((newTask: any) => {
    const adapted = createTaskFromInput(newTask, activeProjectId);
    setTasks((prev) => [...prev, adapted]);
    setIsMissionModalOpen(false);
    showToast('Missao criada');
  }, [activeProjectId, setIsMissionModalOpen, setTasks]);

  const addTasks = useCallback((newTasks: Omit<Task, 'id' | 'assignee' | 'dependencies'>[]) => {
    const adapted: Task[] = newTasks.map((task, index) => ({
      ...task,
      id: Date.now() + index,
      assignee: 'MA',
      dependencies: 0,
    }));
    setTasks((prev) => [...prev, ...adapted]);
    return adapted;
  }, [setTasks]);

  const createTaskFromPalette = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const task = createPaletteTask(trimmed, activeProjectId);
    setTasks((prev) => [...prev, task]);
    setCurrentView('dashboard');
    return task;
  }, [activeProjectId, setCurrentView, setTasks]);

  const createNoteFromPalette = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const note = createPaletteNote(trimmed, activeProjectId);
    setNotes((prev) => [note, ...prev]);
    return note;
  }, [activeProjectId, setNotes]);

  const createEventFromPalette = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return null;
    const event = createPaletteEvent(trimmed, activeProjectId);
    setEvents((prev) => [event, ...prev]);
    return event;
  }, [activeProjectId, setEvents]);

  const openTaskFromPalette = useCallback((_taskId: number, projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('dashboard');
  }, [setActiveProjectId, setCurrentView]);

  const openNoteFromPalette = useCallback((_noteId: string) => {
    setCurrentView('notes');
  }, [setCurrentView]);

  const handleTaskClick = useCallback((taskId: number) => {
    setSelectedTaskId(taskId);
    setCurrentView('mission-detail');
  }, [setCurrentView, setSelectedTaskId]);

  const handleAgentClick = useCallback((agentId: string) => {
    setActiveAgentId(agentId);
    setCurrentView('agent-detail');
  }, [setActiveAgentId, setCurrentView]);

  return {
    addProject,
    addTask,
    addTasks,
    createTaskFromPalette,
    createNoteFromPalette,
    createEventFromPalette,
    openTaskFromPalette,
    openNoteFromPalette,
    handleTaskClick,
    handleAgentClick,
  };
}
