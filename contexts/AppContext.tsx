import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import type { Task, Project } from '../lib/appTypes';

// ─── TYPES ─────────────────────────────────────────────────────────────────

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  defaultView: string;
  compactMode: boolean;
  notificationsEnabled: boolean;
}

interface AppContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;

  // Projects
  projects: Project[];
  activeProjectId: string;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setActiveProjectId: (id: string) => void;

  // User preferences
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;

  // Sync status
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  defaultView: 'dashboard',
  compactMode: false,
  notificationsEnabled: true,
};

// ─── CONTEXT ───────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── PROVIDER ──────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    Storage.get<Task[]>(STORAGE_KEYS.TASKS, [])
  );

  const [projects, setProjects] = useState<Project[]>(() =>
    Storage.get<Project[]>(STORAGE_KEYS.PROJECTS, [
      { id: 'pessoal', name: 'Pessoal', color: '#00FF95', icon: 'person', deletable: false },
    ])
  );

  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    Storage.get<string>(STORAGE_KEYS.ACTIVE_PROJECT, 'pessoal')
  );

  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    Storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES)
  );

  const [isSyncing] = useState(false);
  const [lastSyncTime] = useState<Date | null>(null);

  // ─── PERSIST TO LOCALSTORAGE ──────────────────────────────────────────

  useEffect(() => {
    Storage.set(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.PROJECTS, projects);
  }, [projects]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.ACTIVE_PROJECT, activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    Storage.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }, [preferences]);

  // ─── TASK OPERATIONS ───────────────────────────────────────────────────

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: number) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // ─── PROJECT OPERATIONS ────────────────────────────────────────────────

  const addProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(proj => (proj.id === id ? { ...proj, ...updates } : proj))
    );
  };

  const deleteProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !project.deletable) return;

    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId('pessoal');
    }
  };

  // ─── PREFERENCES ───────────────────────────────────────────────────────

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  // ─── CONTEXT VALUE ─────────────────────────────────────────────────────

  const value: AppContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    projects,
    activeProjectId,
    addProject,
    updateProject,
    deleteProject,
    setActiveProjectId,
    preferences,
    updatePreferences,
    isSyncing,
    lastSyncTime,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── HOOK ──────────────────────────────────────────────────────────────────

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
