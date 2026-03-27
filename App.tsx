import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys, useGoKeys } from './hooks/useHotkeys';
import { useFlowState } from './hooks/useFlowState';
import { useGhostMode } from './hooks/useGhostMode';
import { useAppHydration, useDebouncedPersistence } from './hooks/useAppPersistence';
import { useAgentRosterSync } from './hooks/useAgentRosterSync';
import { useAppDomainActions } from './hooks/useAppDomainActions';
import type { StoredAgent, StoredContact, StoredEvent, StoredNote } from './data/models';
import type { Agent } from './types/agents';
import type { View, Theme, Project, Task } from './lib/appTypes';
import AppContentRouter from './components/AppContentRouter';

// Re-export types for backwards compatibility
export type { View, Project, Task } from './lib/appTypes';

// Lazy-loaded focus mode components
const GhostMode = lazy(() => import('./components/focus/GhostMode').then(m => ({ default: m.GhostMode })));
const DeepWorkPanel = lazy(() => import('./components/focus/DeepWorkPanel').then(m => ({ default: m.DeepWorkPanel })));

// Lazy-loaded Sprint E components
const QuickCaptureModal = lazy(() => import('./components/capture/QuickCaptureModal').then(m => ({ default: m.QuickCaptureModal })));

const CommandPalette = lazy(() => import('./components/CommandPalette'));
const AgentAddModal = lazy(() => import('./components/AgentAddModal'));
const MissionModal = lazy(() => import('./components/MissionModal'));
const ProjectSwitcher = lazy(() => import('./components/layout/ProjectSwitcher'));
const ShortcutsDialog = lazy(() => import('./components/layout/ShortcutsDialog'));
const NotionDataProvider = lazy(() => import('./contexts/NotionDataContext').then(m => ({ default: m.NotionDataProvider })));

// Error boundary
import { ErrorBoundary } from './components/ErrorBoundary';

import { ToastContainer, showToast } from './components/ui';
import { useAgents, useConnectionState } from './contexts/OpenClawContext';
import { SupabaseDataProvider, useSupabaseData } from './contexts/SupabaseDataContext';
import { ProjectProvider } from './contexts/ProjectContext';
import {
  checklistItemToTask,
  projetoItemToProject,
  buildProjectIdMap,
} from './utils/taskMappings';
import { openMarcoOsV2 } from './lib/marcoOsV2';
import { useClickUpTasks } from './hooks/useClickUpTasks';
import { createQuickCaptureNote, createQuickCaptureTask } from './data/domainFactories';
import { summarizeProjectControl } from './lib/projectControl';

// Layout components
import AppHeader from './components/layout/AppHeader';
import AppSidebar from './components/layout/AppSidebar';
import MobileNav from './components/layout/MobileNav';

// ─── Framer Motion variants ─────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const };
const NOTION_VIEWS = new Set<View>(['dashboard', 'health', 'learning', 'planner', 'notes', 'crm']);

// ─── Constants ──────────────────────────────────────────────────────────────
const PROJECT_COLORS = ['#0A84FF', '#BF5AF2', '#FF9F0A', '#FF453A', '#FF5500', '#4CD964', '#5AC8FA'];

const DEFAULT_PROJECTS: Project[] = [
  { id: 'pessoal',       name: 'Pessoal',            color: '#00FF95', icon: 'person',           deletable: false },
  { id: 'zaremba-gestao', name: 'Zaremba - Gestão',  color: '#0A84FF', icon: 'business_center',  deletable: true  },
];

const DEFAULT_TASKS: Task[] = [
  { id: 1,  title: 'Treinar musculação',         tag: 'FÍSICO',   projectId: 'pessoal',        status: 'assigned',    priority: 'high',   deadline: 'Hoje',    assignee: 'MA', dependencies: 0 },
  { id: 2,  title: 'Agendar check-up médico',    tag: 'FÍSICO',   projectId: 'pessoal',        status: 'standby',     priority: 'medium', deadline: '15 mar',  assignee: 'MA', dependencies: 1 },
  { id: 3,  title: 'Pagar fatura cartão Black',  tag: 'BIZ',      projectId: 'pessoal',        status: 'started',     priority: 'high',   deadline: 'Amanhã',  assignee: 'MA', dependencies: 0 },
  { id: 4,  title: 'Ler 20 pág Clean Code',      tag: 'MIND',     projectId: 'pessoal',        status: 'done',        priority: 'low',    deadline: '−1d',     assignee: 'MA', dependencies: 0 },
  { id: 5,  title: 'Organizar home office',       tag: 'LIFE',     projectId: 'pessoal',        status: 'in-progress', priority: 'low',    deadline: '5d',      assignee: 'MA', dependencies: 2 },
  { id: 6,  title: 'Definir arquitetura AWS',     tag: 'BUILD',    projectId: 'zaremba-gestao', status: 'assigned',    priority: 'urgent', deadline: '2d',      assignee: 'MA', dependencies: 3 },
  { id: 7,  title: 'Refatorar API de login',      tag: 'BUILD',    projectId: 'zaremba-gestao', status: 'in-progress', priority: 'high',   deadline: 'Hoje',    assignee: 'MA', dependencies: 1 },
  { id: 8,  title: 'Deploy v2.4 staging',         tag: 'BUILD',    projectId: 'zaremba-gestao', status: 'done',        priority: 'medium', deadline: '−1d',     assignee: 'JP', dependencies: 0 },
  { id: 9,  title: 'Design system tokens',        tag: 'BUILD',    projectId: 'zaremba-gestao', status: 'started',     priority: 'medium', deadline: '4d',      assignee: 'MA', dependencies: 0 },
  { id: 10, title: 'Code review PR #402',         tag: 'BUILD',    projectId: 'zaremba-gestao', status: 'assigned',    priority: 'low',    deadline: 'Hoje',    assignee: 'MA', dependencies: 0 },
  { id: 11, title: 'Briefing campanha Q1',        tag: 'BIZ',      projectId: 'pessoal',        status: 'assigned',    priority: 'medium', deadline: 'Amanhã',  assignee: 'JP', dependencies: 0 },
  { id: 12, title: 'Analisar concorrentes',       tag: 'BIZ',      projectId: 'pessoal',        status: 'started',     priority: 'low',    deadline: '7d',      assignee: 'MA', dependencies: 0 },
  { id: 13, title: 'Gravar vídeo YouTube',        tag: 'BIZ',      projectId: 'zaremba-gestao', status: 'in-progress', priority: 'medium', deadline: 'Hoje',    assignee: 'MA', dependencies: 1 },
  { id: 14, title: 'Copywriting landing page',    tag: 'BIZ',      projectId: 'zaremba-gestao', status: 'standby',     priority: 'high',   deadline: '',        assignee: 'MA', dependencies: 2 },
  { id: 15, title: 'Newsletter semanal',          tag: 'BIZ',      projectId: 'pessoal',        status: 'done',        priority: 'medium', deadline: '−2d',     assignee: 'MA', dependencies: 0 },
];

// ─── StoredAgent ↔ Agent conversion ──────────────────────────────────────────
function storedAgentToAgent(s: StoredAgent): Agent {
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    model: s.model,
    owner: s.owner,
    status: s.status,
    lastHeartbeat: s.lastHeartbeat || s.lastSeen,
    uptime: s.uptime || '—',
    tags: s.tags || s.capabilities || [],
    domain: s.domain,
    handle: s.handle,
    avatarIcon: s.avatarIcon,
    currentMission: s.currentMission,
  };
}

function agentToStoredAgent(a: Agent): StoredAgent {
  const now = new Date().toISOString();
  return {
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status,
    tools: [],
    model: a.model || '',
    lastSeen: now,
    notes: '',
    capabilities: [],
    owner: a.owner,
    domain: a.domain,
    handle: a.handle,
    avatarIcon: a.avatarIcon,
    currentMission: a.currentMission,
    tags: a.tags,
    uptime: a.uptime,
    lastHeartbeat: a.lastHeartbeat,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── App Content (uses hooks inside providers) ─────────────────────────────
const AppContent: React.FC = () => {
  // ─── Supabase data for real tasks/projects ────────────────────────────────
  const { checklist, projetos } = useSupabaseData();
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDeepWorkOpen, setIsDeepWorkOpen] = useState(false);
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);

  // ─── Focus modes ─────────────────────────────────────────────────────────────
  const ghostMode = useGhostMode();
  const flowState = useFlowState();

  // OpenClaw connection
  const { connectionState, isLive } = useConnectionState();
  const { agents: liveAgents } = useAgents();

  // ─── Projects (from Supabase with fallback) ────────────────────────────────
  const realProjects = useMemo<Project[]>(() => {
    const activeProjects = projetos.items.filter(p => p.status === 'Ativo');
    if (activeProjects.length === 0) return [];
    
    const pessoalProject: Project = {
      id: 'pessoal',
      name: 'Pessoal',
      color: '#00FF95',
      icon: 'person',
      deletable: false,
    };
    
    const mapped = activeProjects.map((p, i) => projetoItemToProject(p, i));
    return [pessoalProject, ...mapped];
  }, [projetos.items]);
  
  const [localProjects, setLocalProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const projects = realProjects.length > 0 ? realProjects : localProjects;
  const setProjects = setLocalProjects; // For local additions
  const [activeProjectId, setActiveProjectId] = useState<string>('pessoal');

  // ─── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('marco-os-theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  // ─── Agents ────────────────────────────────────────────────────────────────
  const [agentRoster, setAgentRoster] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string>('main');
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);

  const activeAgent = agentRoster.find(a => a.id === activeAgentId) ?? agentRoster[0];
  const activeAgentStatusColor: 'mint' | 'orange' | 'blue' | 'red' =
    activeAgent?.status === 'online'
      ? 'mint'
      : activeAgent?.status === 'busy'
        ? 'orange'
        : activeAgent?.status === 'idle'
          ? 'blue'
          : 'red';
  const agentsOnlineCount = agentRoster.filter(a => a.status !== 'offline').length;

  // ─── Tasks (ClickUp primary, Notion fallback, mock last resort) ────────────
  // Build project name → ID map for task mapping
  const projectIdMap = useMemo(() => buildProjectIdMap(projects), [projects]);

  // ClickUp tasks from Supabase clickup_tasks table (populated every 5 min by Frank)
  const { tasks: clickupTasks, isLoading: clickupLoading, updateTaskStatus: clickupUpdateStatus, deleteTask: clickupDeleteTask, restoreTask: clickupRestoreTask } = useClickUpTasks();

  // Notion checklist tasks (legacy fallback)
  const realTasks = useMemo<Task[]>(() => {
    const marcoTasks = checklist.items.filter(item => {
      const resp = (item.responsavel || '').toLowerCase();
      return resp === '' || resp === 'marco' || resp === 'ma';
    });
    if (marcoTasks.length === 0) return [];
    return marcoTasks.map(item => checklistItemToTask(item, projectIdMap));
  }, [checklist.items, projectIdMap]);

  // Local tasks state (for fallback and local additions)
  const [localTasks, setLocalTasks] = useState<Task[]>(DEFAULT_TASKS);

  // Which source is active?
  const isClickUpActive = clickupTasks.length > 0;

  // Priority: ClickUp → Notion → mock
  const tasks = isClickUpActive
    ? clickupTasks
    : realTasks.length > 0
      ? realTasks
      : (!clickupLoading ? localTasks : []);

  // setTasks: when ClickUp is active, route to optimistic updater; otherwise local state
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = useCallback((action) => {
    setLocalTasks(prev => {
      const newTasks = typeof action === 'function' ? action(prev) : action;
      return newTasks;
    });
  }, []);

  // Status sync handler — optimistic for ClickUp, API for Notion
  const handleTaskStatusSync = useCallback(async (taskId: number, newStatus: Task['status']) => {
    if (isClickUpActive) {
      clickupUpdateStatus(taskId, newStatus);
      return;
    }

    // Notion fallback
    const task = tasks.find(t => t.id === taskId);
    const notionId = (task as Task & { notionId?: string })?.notionId;
    if (!notionId) return;

    const apiBase = import.meta.env.VITE_FORM_API_URL;
    const apiToken = import.meta.env.VITE_FORM_API_TOKEN;
    if (!apiBase) return;

    const { syncTaskStatus } = await import('./utils/taskMappings');
    await syncTaskStatus(notionId, newStatus, apiBase, apiToken || '');
  }, [isClickUpActive, clickupUpdateStatus, tasks]);

  // Move task: operates on correct state source (ClickUp hook or local state)
  const handleMoveTask = useCallback((taskId: number, newStatus: Task['status']) => {
    if (isClickUpActive) {
      clickupUpdateStatus(taskId, newStatus);
    } else {
      setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  }, [isClickUpActive, clickupUpdateStatus]);

  // Delete task: operates on correct state source
  const handleDeleteTask = useCallback((taskId: number) => {
    if (isClickUpActive) {
      clickupDeleteTask(taskId);
    } else {
      setLocalTasks(prev => prev.filter(t => t.id !== taskId));
    }
  }, [isClickUpActive, clickupDeleteTask]);

  // Restore task (undo delete)
  const handleRestoreTask = useCallback((taskId: number) => {
    if (isClickUpActive) {
      clickupRestoreTask(taskId);
    } else {
      // For local tasks, we can't restore (already removed from array)
      // This is a no-op for non-ClickUp mode
    }
  }, [isClickUpActive, clickupRestoreTask]);

  // Undo stack for task deletions (stores taskIds for restore)
  const undoStackRef = React.useRef<number[]>([]);

  // Delete task with undo support
  const handleDeleteTaskWithUndo = useCallback((taskId: number) => {
    handleDeleteTask(taskId);
    undoStackRef.current.push(taskId);
    // Auto-expire after 30s
    setTimeout(() => {
      undoStackRef.current = undoStackRef.current.filter(id => id !== taskId);
    }, 30000);
  }, [handleDeleteTask]);

  // Undo last delete
  const handleUndoDelete = useCallback(() => {
    const lastId = undoStackRef.current.pop();
    if (lastId != null) {
      handleRestoreTask(lastId);
      showToast('Tarefa restaurada');
    }
  }, [handleRestoreTask]);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // ─── Notes, Events & Contacts (persisted; used by Command Palette) ─────────
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [paletteContacts, setPaletteContacts] = useState<StoredContact[]>([]);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────────
  const navigate = useCallback((view: string) => setCurrentView(view as View), []);

  useHotkeys([
    { key: 'k', mod: true, handler: () => setIsPaletteOpen(true), description: 'Command Palette' },
    { key: 'n', mod: true, shift: true, handler: () => setQuickCaptureOpen(true), description: 'Quick Capture' },
    { key: 'g', mod: true, shift: true, handler: () => ghostMode.toggle(), description: 'Ghost Mode' },
    { key: 'd', mod: true, shift: true, handler: () => setIsDeepWorkOpen(o => !o), description: 'Deep Work' },
    { key: 'z', mod: true, shift: true, handler: () => handleUndoDelete(), description: 'Undo delete' },
    { key: '?', shift: true, handler: () => setIsShortcutsOpen(o => !o), description: 'Toggle shortcuts' },
    { key: 'Escape', handler: () => {
      if (ghostMode.isActive) { ghostMode.exit(); return; }
      if (quickCaptureOpen) { setQuickCaptureOpen(false); return; }
      if (isDeepWorkOpen) { setIsDeepWorkOpen(false); return; }
      setIsShortcutsOpen(false);
      setIsPaletteOpen(false);
      setIsMissionModalOpen(false);
      setIsAddAgentOpen(false);
    }, description: 'Close overlay' },
  ]);

  useGoKeys(navigate);

  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('marco-os-theme', theme);
  }, [theme]);

  const didHydrateRef = useAppHydration({
    defaultProjects: DEFAULT_PROJECTS,
    defaultTasks: DEFAULT_TASKS,
    activeProjectId,
    activeAgentId,
    setProjects,
    setTasks,
    setNotes,
    setEvents,
    setAgentRoster,
    setActiveProjectId,
    setActiveAgentId,
    setPaletteContacts,
    storedAgentToAgent,
  });

  useDebouncedPersistence({
    projects,
    tasks,
    notes,
    events,
    didHydrateRef,
    onPersisted: undefined,
  });

  useAgentRosterSync(liveAgents, setAgentRoster);

  const {
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
  } = useAppDomainActions({
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
    projectColors: PROJECT_COLORS,
  });

  // ─── Derived state ─────────────────────────────────────────────────────────
  const activeTaskCounts = useMemo(() => projects.reduce((acc, proj) => {
    acc[proj.id] = tasks.filter(t => t.projectId === proj.id && t.status !== 'done').length;
    return acc;
  }, {} as Record<string, number>), [projects, tasks]);
  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId),
    [activeProjectId, projects]
  );
  const projectControl = useMemo(
    () => summarizeProjectControl(activeProject, tasks, notes, events),
    [activeProject, events, notes, tasks]
  );
  const handleOpenPalette = useCallback(() => setIsPaletteOpen(true), []);
  const handleOpenQuickCapture = useCallback(() => setQuickCaptureOpen(true), []);
  const handleOpenMissionModal = useCallback(() => setIsMissionModalOpen(true), []);
  const handleOpenMarcoOsV2 = useCallback(() => {
    const result = openMarcoOsV2();
    showToast(
      result.mode === 'new-tab'
        ? 'Abrindo Marco OS V2 em nova aba'
        : 'Abrindo Marco OS V2 nesta aba',
      'info'
    );
  }, []);
  const handleNavigateDashboard = useCallback(() => setCurrentView('dashboard'), []);
  const handleOpenAddAgent = useCallback(() => setIsAddAgentOpen(true), []);
  const handleQuickCaptureSave = useCallback(({ type, content }: { type: 'Nota' | 'Tarefa' | 'Ideia' | 'Decisão'; content: string }) => {
    if (type === 'Tarefa') {
      const task = createQuickCaptureTask(content, activeProjectId);
      setTasks((prev) => [task, ...prev]);
      setCurrentView('dashboard');
      return;
    }

    const note = createQuickCaptureNote(content, type, activeProjectId);
    setNotes((prev) => [note, ...prev]);
    setCurrentView('notes');
  }, [activeProjectId, setNotes, setTasks]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full flex-col bg-bg-base text-text-primary overflow-hidden font-sans transition-colors duration-300">
      <Suspense fallback={null}>
        <AgentAddModal
          open={isAddAgentOpen}
          onClose={() => setIsAddAgentOpen(false)}
          onCreate={async (agent) => {
            const stored = agentToStoredAgent(agent);
            const { putAgent } = await import('./data/repository');
            await putAgent(stored);
            setAgentRoster(prev => [agent, ...prev]);
            setActiveAgentId(agent.id);
          }}
        />
      </Suspense>

      <AppHeader
        currentView={currentView}
        activeAgent={activeAgent}
        activeAgentStatusColor={activeAgentStatusColor}
        agentsOnlineCount={agentsOnlineCount}
        isLive={isLive}
        onNavigateHome={handleNavigateDashboard}
        onOpenPalette={handleOpenPalette}
        onOpenQuickCapture={handleOpenQuickCapture}
        onOpenMissionModal={handleOpenMissionModal}
      />

      {/* MAIN BODY */}
      <div className="flex-grow flex overflow-hidden">

        <AppSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenMarcoOsV2={handleOpenMarcoOsV2}
          agentRoster={agentRoster}
          activeAgentId={activeAgentId}
          onAgentClick={handleAgentClick}
          onAddAgent={handleOpenAddAgent}
          isLive={isLive}
          connectionState={connectionState}
          agentsOnlineCount={agentsOnlineCount}
        />

        {/* CONTENT AREA */}
        <div className="flex-grow flex flex-col min-w-0 bg-bg-base relative overflow-hidden transition-colors duration-300">
          <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col pb-24 md:pb-0 safe-pb">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView + (currentView === 'agent-detail' ? activeAgentId : '')}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
                className="flex-grow flex flex-col"
              >
                <ErrorBoundary>
                <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-text-secondary text-xs font-mono">Carregando...</div></div>}>
                {NOTION_VIEWS.has(currentView) ? (
                  <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-text-secondary text-xs font-mono">Sincronizando dados...</div></div>}>
                    <NotionDataProvider>
                      <AppContentRouter
                        currentView={currentView}
                        tasks={tasks}
                        setTasks={setTasks}
                        onTaskClick={handleTaskClick}
                        activeProjectId={activeProjectId}
                        projects={projects}
                        onAddTask={handleOpenMissionModal}
                        events={events}
                        setEvents={setEvents}
                        addTasks={addTasks}
                        notes={notes}
                        setNotes={setNotes}
                        onAgentClick={handleAgentClick}
                        onNavigate={setCurrentView}
                        onMoveTask={handleMoveTask}
                        onDeleteTask={handleDeleteTaskWithUndo}
                        onRestoreTask={handleRestoreTask}
                        activeAgentId={activeAgentId}
                        selectedTaskId={selectedTaskId}
                      />
                    </NotionDataProvider>
                  </Suspense>
                ) : (
                  <AppContentRouter
                    currentView={currentView}
                    tasks={tasks}
                    setTasks={setTasks}
                    onTaskClick={handleTaskClick}
                    activeProjectId={activeProjectId}
                    projects={projects}
                    onAddTask={handleOpenMissionModal}
                    events={events}
                    setEvents={setEvents}
                    addTasks={addTasks}
                    notes={notes}
                    setNotes={setNotes}
                    onAgentClick={handleAgentClick}
                    onNavigate={setCurrentView}
                    onTaskStatusSync={handleTaskStatusSync}
                    onMoveTask={handleMoveTask}
                    onDeleteTask={handleDeleteTask}
                    activeAgentId={activeAgentId}
                    selectedTaskId={selectedTaskId}
                  />
                )}
                </Suspense>
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>

          {currentView === 'dashboard' && (
            <Suspense fallback={null}>
              <ProjectSwitcher
                projects={projects}
                activeProjectId={activeProjectId}
                activeTaskCounts={activeTaskCounts}
              onProjectChange={setActiveProjectId}
              onAddProject={addProject}
              projectControl={projectControl}
              theme={theme}
              onThemeChange={setTheme}
            />
            </Suspense>
          )}
        </div>
      </div>

      <MobileNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenMarcoOsV2={handleOpenMarcoOsV2}
        onOpenMissionModal={handleOpenMissionModal}
        onOpenQuickCapture={handleOpenQuickCapture}
        projects={projects}
        activeProjectId={activeProjectId}
        activeTaskCounts={activeTaskCounts}
        onProjectChange={setActiveProjectId}
        onStartAddProject={() => { setCurrentView('dashboard'); }}
      />

      <Suspense fallback={null}>
        <CommandPalette
          open={isPaletteOpen}
          onClose={() => setIsPaletteOpen(false)}
          tasks={tasks}
          notes={notes}
          events={events}
          contacts={paletteContacts}
          onOpenTask={openTaskFromPalette}
          onOpenNote={openNoteFromPalette}
          onNavigate={(view) => { setCurrentView(view); }}
          onCreateTask={createTaskFromPalette}
          onCreateNote={createNoteFromPalette}
          onCreateEvent={createEventFromPalette}
          onQuickAction={(actionId) => {
            if (actionId === 'resume-plan') {
              localStorage.setItem('planner-resume-requested', '1');
              setCurrentView('planner');
              return;
            }
            if (actionId === 'open-marco-os-v2') {
              handleOpenMarcoOsV2();
              return;
            }
            if (actionId === 'open-starred-notes') {
              localStorage.setItem('notes-list-mode', 'starred');
              setCurrentView('notes');
              return;
            }
            if (actionId === 'focus-next-task') {
              const nextTask = [...tasks]
                .filter((task) => task.status !== 'done')
                .sort((left, right) => {
                  const priorityRank: Record<Task['priority'], number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                  return priorityRank[left.priority] - priorityRank[right.priority];
                })[0];
              if (nextTask) {
                setSelectedTaskId(nextTask.id);
                setCurrentView('mission-detail');
                return;
              }
              showToast('Nenhuma tarefa pendente');
              return;
            }
            const viewMap: Record<string, View> = {
              'new-finance': 'finance',
              'new-health': 'health',
              'new-braindump': 'notes',
            };
            const target = viewMap[actionId];
            if (target) setCurrentView(target);
          }}
        />
      </Suspense>

      {isMissionModalOpen && (
        <Suspense fallback={null}>
          <MissionModal onClose={() => setIsMissionModalOpen(false)} onSave={addTask} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <ShortcutsDialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
      </Suspense>

      {/* Focus Modes — rendered above all content */}
      <Suspense fallback={null}>
        <GhostMode
          isOpen={ghostMode.isActive}
          onClose={ghostMode.exit}
          taskTitle={ghostMode.taskTitle}
          flowState={flowState}
        />
        <DeepWorkPanel
          isOpen={isDeepWorkOpen}
          onClose={() => setIsDeepWorkOpen(false)}
          flowState={flowState}
          tasks={tasks}
        />
      </Suspense>

      {/* Sprint E — Quick Capture Modal */}
      <Suspense fallback={null}>
        <QuickCaptureModal
          open={quickCaptureOpen}
          onClose={() => setQuickCaptureOpen(false)}
          onSaveCapture={handleQuickCaptureSave}
        />
      </Suspense>

      <ToastContainer />
    </div>
  );
};

// ─── App (provider wrapper) ─────────────────────────────────────────────────
const App: React.FC = () => {
  return (
    <SupabaseDataProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </SupabaseDataProvider>
  );
};

export default App;
