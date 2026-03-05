import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys, useGoKeys } from './hooks/useHotkeys';
import { useFlowState } from './hooks/useFlowState';
import { useGhostMode } from './hooks/useGhostMode';
import type { StoredAgent, StoredContact, StoredEvent, StoredNote } from './data/models';
import { bootstrapIfEmpty, bootstrapAgentsIfEmpty, loadAll, loadAgents, loadContacts, putAgent, deleteAgent, saveEvents, saveNotes, saveProjects, saveTasks } from './data/repository';
import { defaultAgents } from './data/agentsSeed';
import type { Agent } from './types/agents';
import type { View, Theme, Project, Task } from './lib/appTypes';

// Re-export types for backwards compatibility
export type { View, Project, Task } from './lib/appTypes';

// Lazy-loaded focus mode components
const GhostMode = lazy(() => import('./components/focus/GhostMode').then(m => ({ default: m.GhostMode })));
const DeepWorkPanel = lazy(() => import('./components/focus/DeepWorkPanel').then(m => ({ default: m.DeepWorkPanel })));

// Lazy-loaded Sprint E components
const QuickCaptureModal = lazy(() => import('./components/capture/QuickCaptureModal').then(m => ({ default: m.QuickCaptureModal })));

// Lazy-loaded pages (code-split)
const Dashboard = lazy(() => import('./components/Dashboard'));
const Finance = lazy(() => import('./components/Finance'));
const Health = lazy(() => import('./components/Health'));
const Learning = lazy(() => import('./components/Learning'));
const Planner = lazy(() => import('./components/Planner'));
const CRM = lazy(() => import('./components/CRM'));
const Settings = lazy(() => import('./components/Settings'));
const NotesPanel = lazy(() => import('./components/NotesPanel'));
const AgentCommandCenter = lazy(() => import('./components/AgentCommandCenter'));
const AgentDetailView = lazy(() => import('./components/AgentDetailView'));
const MissionDetail = lazy(() => import('./components/MissionDetail'));

// Error boundary
import { ErrorBoundary } from './components/ErrorBoundary';

// Eagerly loaded (always needed)
import CommandPalette from './components/CommandPalette';
import AgentAddModal from './components/AgentAddModal';
import MissionModal from './components/MissionModal';
import { ToastContainer, showToast } from './components/ui';
import { useConnectionState, useOpenClaw } from './contexts/OpenClawContext';
import { NotionDataProvider } from './contexts/NotionDataContext';
import { SupabaseDataProvider, useSupabaseData } from './contexts/SupabaseDataContext';
import { ProjectProvider } from './contexts/ProjectContext';
import {
  checklistItemToTask,
  projetoItemToProject,
  buildProjectIdMap,
  syncTaskStatus,
} from './utils/taskMappings';

// Layout components
import { AppHeader, AppSidebar, ProjectSwitcher, MobileNav, ShortcutsDialog } from './components/layout';

// ─── Framer Motion variants ─────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};
const pageTransition = { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] };

// ─── Constants ──────────────────────────────────────────────────────────────
const PROJECT_COLORS = ['#0A84FF', '#BF5AF2', '#FF9F0A', '#FF453A', '#FF5500', '#4CD964', '#5AC8FA'];

const DEFAULT_PROJECTS: Project[] = [
  { id: 'pessoal',       name: 'Pessoal',            color: '#00FF95', icon: 'person',           deletable: false },
  { id: 'zaremba-gestao', name: 'Zaremba - Gestão',  color: '#0A84FF', icon: 'business_center',  deletable: true  },
];

const DEFAULT_TASKS: Task[] = [
  { id: 1,  title: 'Treino de Hipertrofia A',   tag: 'SAÚDE',    projectId: 'pessoal',        status: 'assigned',    priority: 'high',   deadline: 'Hoje',          assignee: 'MA', dependencies: 0 },
  { id: 2,  title: 'Agendar check-up médico',   tag: 'SAÚDE',    projectId: 'pessoal',        status: 'standby',     priority: 'medium', deadline: 'Prox. Mês',     assignee: 'MA', dependencies: 1 },
  { id: 3,  title: 'Pagar fatura cartão Black', tag: 'FINANÇAS', projectId: 'pessoal',        status: 'started',     priority: 'high',   deadline: 'Amanhã',        assignee: 'MA', dependencies: 0 },
  { id: 4,  title: 'Ler 20 pág. "Clean Code"', tag: 'ESTUDO',   projectId: 'pessoal',        status: 'done',        priority: 'low',    deadline: 'Ontem',         assignee: 'MA', dependencies: 0 },
  { id: 5,  title: 'Organizar Home Office',     tag: 'CASA',     projectId: 'pessoal',        status: 'in-progress', priority: 'low',    deadline: 'Fim de Semana', assignee: 'MA', dependencies: 2 },
  { id: 6,  title: 'Definir Arquitetura AWS',   tag: 'DEV',      projectId: 'zaremba-gestao', status: 'assigned',    priority: 'high',   deadline: '10 Fev',        assignee: 'https://i.pravatar.cc/150?u=1', dependencies: 3 },
  { id: 7,  title: 'Refatoração da API de Login', tag: 'BACKEND', projectId: 'zaremba-gestao', status: 'in-progress', priority: 'high',  deadline: 'Hoje',          assignee: 'MA', dependencies: 1 },
  { id: 8,  title: 'Deploy v2.4 em Staging',   tag: 'DEVOPS',   projectId: 'zaremba-gestao', status: 'done',        priority: 'medium', deadline: 'Ontem',         assignee: 'JP', dependencies: 0 },
  { id: 9,  title: 'Design System Tokens',      tag: 'DESIGN',   projectId: 'zaremba-gestao', status: 'started',     priority: 'medium', deadline: '12 Fev',        assignee: 'https://i.pravatar.cc/150?u=2', dependencies: 0 },
  { id: 10, title: 'Code Review PR #402',       tag: 'DEV',      projectId: 'zaremba-gestao', status: 'assigned',    priority: 'low',    deadline: 'Hoje',          assignee: 'MA', dependencies: 0 },
  { id: 11, title: 'Briefing Campanha Q1',      tag: 'MKT',      projectId: 'pessoal',        status: 'assigned',    priority: 'medium', deadline: 'Amanhã',        assignee: 'JP', dependencies: 0 },
  { id: 12, title: 'Análise de Concorrentes',   tag: 'STRATEGY', projectId: 'pessoal',        status: 'started',     priority: 'low',    deadline: '15 Fev',        assignee: 'MA', dependencies: 0 },
  { id: 13, title: 'Gravação Vídeo Youtube',    tag: 'SOCIAL',   projectId: 'zaremba-gestao', status: 'in-progress', priority: 'medium', deadline: 'Hoje',          assignee: 'https://i.pravatar.cc/150?u=4', dependencies: 1 },
  { id: 14, title: 'Copywriting Landing Page',  tag: 'COPY',     projectId: 'zaremba-gestao', status: 'standby',     priority: 'high',   deadline: 'Indef.',        assignee: 'MA', dependencies: 2 },
  { id: 15, title: 'Newsletter Semanal',        tag: 'MKT',      projectId: 'pessoal',        status: 'done',        priority: 'medium', deadline: '2d atrás',      assignee: 'https://i.pravatar.cc/150?u=5', dependencies: 0 },
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // ─── Focus modes ─────────────────────────────────────────────────────────────
  const ghostMode = useGhostMode();
  const flowState = useFlowState();

  // OpenClaw connection
  const { connectionState, isLive } = useConnectionState();
  const { agents: liveAgents } = useOpenClaw();

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

  // ─── Tasks (from Supabase with fallback) ───────────────────────────────────
  // Build project name → ID map for task mapping
  const projectIdMap = useMemo(() => buildProjectIdMap(projects), [projects]);
  
  // Map ChecklistItem to Task - filter for Marco's tasks only
  const realTasks = useMemo<Task[]>(() => {
    const marcoTasks = checklist.items.filter(item => {
      const resp = (item.responsavel || '').toLowerCase();
      // Include tasks for Marco or tasks without responsavel (personal)
      return resp === '' || resp === 'marco' || resp === 'ma';
    });
    
    if (marcoTasks.length === 0) return [];
    return marcoTasks.map(item => checklistItemToTask(item, projectIdMap));
  }, [checklist.items, projectIdMap]);
  
  // Local tasks state (for fallback and local additions)
  const [localTasks, setLocalTasks] = useState<Task[]>(DEFAULT_TASKS);
  
  // Combined tasks: prefer real tasks, fallback to local
  const tasks = realTasks.length > 0 ? realTasks : localTasks;
  
  // Wrapper setTasks that handles both local and API sync
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = useCallback((action) => {
    setLocalTasks(prev => {
      const newTasks = typeof action === 'function' ? action(prev) : action;
      return newTasks;
    });
  }, []);
  
  // Notify ID map for syncing (notionId → Task ID)
  const notionIdMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const task of realTasks) {
      if ((task as Task & { notionId?: string }).notionId) {
        map.set(task.id, (task as Task & { notionId?: string }).notionId!);
      }
    }
    return map;
  }, [realTasks]);
  
  // Status sync handler - called when dragging tasks in kanban
  const handleTaskStatusSync = useCallback(async (taskId: number, newStatus: Task['status']) => {
    const notionId = notionIdMap.get(taskId);
    if (!notionId) {
      console.warn('[TaskSync] No Notion ID for task:', taskId);
      return;
    }
    
    const apiBase = import.meta.env.VITE_FORM_API_URL;
    const apiToken = import.meta.env.VITE_FORM_API_TOKEN;
    
    if (!apiBase) {
      console.warn('[TaskSync] VITE_FORM_API_URL not configured');
      return;
    }
    
    const success = await syncTaskStatus(notionId, newStatus, apiBase, apiToken || '');
    if (success) {
      showToast('Status atualizado');
    } else {
      showToast('Erro ao sincronizar');
    }
  }, [notionIdMap]);
  
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // ─── Notes, Events & Contacts (persisted; used by Command Palette) ─────────
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [paletteContacts, setPaletteContacts] = useState<StoredContact[]>([]);

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // ─── Keyboard shortcuts ─────────────────────────────────────────────────────
  const navigate = useCallback((view: string) => setCurrentView(view as View), []);

  useHotkeys([
    { key: 'k', mod: true, handler: () => setIsPaletteOpen(true), description: 'Command Palette' },
    { key: 'n', mod: true, shift: true, handler: () => setQuickCaptureOpen(true), description: 'Quick Capture' },
    { key: 'g', mod: true, shift: true, handler: () => ghostMode.toggle(), description: 'Ghost Mode' },
    { key: 'd', mod: true, shift: true, handler: () => setIsDeepWorkOpen(o => !o), description: 'Deep Work' },
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

  // ─── Local persistence (IndexedDB via idb) ─────────────────────────────────
  const didHydrateRef = useRef(false);
  const persistTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});

  const schedulePersist = (key: string, fn: () => void, delayMs = 350) => {
    const prev = persistTimersRef.current[key];
    if (prev) clearTimeout(prev);
    persistTimersRef.current[key] = setTimeout(fn, delayMs);
  };

  useEffect(() => {
    (async () => {
      try {
        await bootstrapIfEmpty({ projects: DEFAULT_PROJECTS, tasks: DEFAULT_TASKS, notes: [], events: [] });
        // Force re-bootstrap if stored agents don't include the real IDs
        const existingAgents = await loadAgents();
        const hasRealIds = existingAgents.some(a => a.id === 'main');
        const hasOldIds = existingAgents.some(a => ['frank', 'head-code', 'planner', 'qa'].includes(a.id));
        if (!hasRealIds || hasOldIds) {
          // Remove old mock agents
          for (const old of existingAgents) {
            if (['frank', 'head-code', 'planner', 'qa'].includes(old.id)) {
              await deleteAgent(old.id);
            }
          }
          // Add real agents
          for (const agent of defaultAgents) {
            await putAgent(agent);
          }
        }
        const { projects: p, tasks: t, notes: n, events: e } = await loadAll();
        if (p.length) setProjects(p);
        if (t.length) setTasks(t);
        setNotes(n);
        setEvents(e);
        if (p.length && !p.some(x => x.id === activeProjectId)) setActiveProjectId(p[0].id);
      } catch (err) {
        console.error('[Marco OS] hydration (core):', err);
      }

      try {
        const agents = await loadAgents();
        if (agents.length) {
          setAgentRoster(agents.map(storedAgentToAgent));
          if (!agents.some(a => a.id === activeAgentId)) setActiveAgentId(agents[0].id);
        } else {
          console.warn('[Marco OS] No agents in DB after bootstrap — using in-memory fallback');
          setAgentRoster(defaultAgents.map(storedAgentToAgent));
          setActiveAgentId(defaultAgents[0].id);
        }
      } catch (err) {
        console.error('[Marco OS] hydration (agents):', err);
        setAgentRoster(defaultAgents.map(storedAgentToAgent));
        setActiveAgentId(defaultAgents[0].id);
      }

      try {
        const cts = await loadContacts();
        setPaletteContacts(cts);
      } catch (err) {
        console.error('[Marco OS] hydration (contacts):', err);
      }

      didHydrateRef.current = true;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('projects', () => { void saveProjects(projects).then(() => showToast('Salvo')); });
  }, [projects]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('tasks', () => { void saveTasks(tasks).then(() => showToast('Salvo')); });
  }, [tasks]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('notes', () => { void saveNotes(notes).then(() => showToast('Salvo')); });
  }, [notes]);

  useEffect(() => {
    if (!didHydrateRef.current) return;
    schedulePersist('events', () => { void saveEvents(events).then(() => showToast('Salvo')); });
  }, [events]);

  // ─── Sync Bridge API agents to agentRoster ──────────────────────────────────
  useEffect(() => {
    if (liveAgents.length === 0) return;
    // Only sync if agents have real data (check for known real IDs)
    const hasRealAgent = liveAgents.some(a => ['main', 'coder', 'researcher'].includes(a.id));
    if (!hasRealAgent) return;

    setAgentRoster(prev => {
      const merged = [...prev];
      for (const live of liveAgents) {
        const idx = merged.findIndex(a => a.id === live.id);
        const updated: Agent = {
          id: live.id,
          name: live.name,
          role: live.role as Agent['role'],
          model: live.model,
          status: live.status as Agent['status'],
          lastHeartbeat: live.lastHeartbeat || '',
          uptime: live.uptime || '',
          tags: live.tags || [],
          currentMission: live.currentMission,
        };
        if (idx >= 0) {
          merged[idx] = { ...merged[idx], ...updated };
        } else {
          merged.push(updated);
        }
      }
      return merged;
    });
  }, [liveAgents]);

  // ─── Project management ─────────────────────────────────────────────────────
  const addProject = (name: string) => {
    const id = `proj-${Date.now()}`;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects(prev => [...prev, { id, name, color, icon: 'folder', deletable: true }]);
    setActiveProjectId(id);
  };

  // ─── Task management ────────────────────────────────────────────────────────
  const addTask = (newTask: any) => {
    const adapted: Task = {
      id: Date.now(),
      title: newTask.title,
      tag: newTask.tag || 'GERAL',
      projectId: activeProjectId,
      status: 'assigned',
      priority: newTask.priority || 'medium',
      deadline: 'A definir',
      assignee: 'MA',
      dependencies: 0,
    };
    setTasks(prev => [...prev, adapted]);
    setIsMissionModalOpen(false);
  };

  const addTasks = (newTasks: Omit<Task, 'id' | 'assignee' | 'dependencies'>[]) => {
    const adapted: Task[] = newTasks.map((t, i) => ({
      ...t,
      id: Date.now() + i,
      assignee: 'MA',
      dependencies: 0,
    }));
    setTasks(prev => [...prev, ...adapted]);
  };

  const createTaskFromPalette = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: trimmed,
      tag: 'GERAL',
      projectId: activeProjectId,
      status: 'assigned',
      priority: 'medium',
      deadline: 'A definir',
      assignee: 'MA',
      dependencies: 0,
    }]);
    setCurrentView('dashboard');
  };

  const createNoteFromPalette = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `note-${Date.now()}`;
    setNotes(prev => [{ id, title: trimmed, body: '', createdAt: now, updatedAt: now, projectId: activeProjectId }, ...prev]);
  };

  const createEventFromPalette = (title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const now = new Date();
    const iso = now.toISOString();
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `event-${Date.now()}`;
    const date = iso.slice(0, 10);
    setEvents(prev => [{ id, title: trimmed, date, createdAt: iso, updatedAt: iso, projectId: activeProjectId }, ...prev]);
  };

  const openTaskFromPalette = (_taskId: number, projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView('dashboard');
  };

  const openNoteFromPalette = (_noteId: string) => {
    setCurrentView('notes');
  };

  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
    setCurrentView('mission-detail');
  };

  const handleAgentClick = (agentId: string) => {
    setActiveAgentId(agentId);
    setCurrentView('agent-detail');
  };

  // ─── Derived state ─────────────────────────────────────────────────────────
  const activeTaskCounts = projects.reduce((acc, proj) => {
    acc[proj.id] = tasks.filter(t => t.projectId === proj.id && t.status !== 'done').length;
    return acc;
  }, {} as Record<string, number>);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen w-full flex-col bg-bg-base text-text-primary overflow-hidden font-sans transition-colors duration-300">
      <AgentAddModal
        open={isAddAgentOpen}
        onClose={() => setIsAddAgentOpen(false)}
        onCreate={(agent) => {
          const stored = agentToStoredAgent(agent);
          putAgent(stored);
          setAgentRoster(prev => [agent, ...prev]);
          setActiveAgentId(agent.id);
        }}
      />

      <AppHeader
        currentView={currentView}
        currentTime={currentTime}
        activeAgent={activeAgent}
        activeAgentStatusColor={activeAgentStatusColor}
        agentsOnlineCount={agentsOnlineCount}
        isLive={isLive}
        onNavigateHome={() => setCurrentView('dashboard')}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenMissionModal={() => setIsMissionModalOpen(true)}
      />

      {/* MAIN BODY */}
      <div className="flex-grow flex overflow-hidden">

        <AppSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          agentRoster={agentRoster}
          activeAgentId={activeAgentId}
          onAgentClick={handleAgentClick}
          onAddAgent={() => setIsAddAgentOpen(true)}
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
                {currentView === 'dashboard' && (
                  <Dashboard
                    tasks={tasks}
                    setTasks={setTasks}
                    onTaskClick={handleTaskClick}
                    activeProjectId={activeProjectId}
                    projects={projects}
                    onAddTask={() => setIsMissionModalOpen(true)}
                    events={events}
                    setEvents={setEvents}
                    onNavigate={navigate}
                    onTaskStatusSync={handleTaskStatusSync}
                  />
                )}
                {currentView === 'finance'         && <Finance />}
                {currentView === 'health'          && <Health />}
                {currentView === 'learning'        && <Learning />}
                {currentView === 'planner'         && (
                  <Planner
                    projects={projects}
                    activeProjectId={activeProjectId}
                    addTasks={addTasks}
                  />
                )}
                {currentView === 'notes'           && <NotesPanel notes={notes} setNotes={setNotes} activeProjectId={activeProjectId} />}
                {currentView === 'crm'             && <CRM />}
                {currentView === 'agents-overview' && <AgentCommandCenter onAgentClick={handleAgentClick} onNavigate={setCurrentView} />}
                {currentView === 'agent-detail' && activeAgentId && <AgentDetailView agentId={activeAgentId} onBack={() => setCurrentView('agents-overview')} />}
                {currentView === 'settings'        && <Settings />}
                {currentView === 'mission-detail' && selectedTaskId && (
                  <MissionDetail
                    task={tasks.find(t => t.id === selectedTaskId)!}
                    onBack={() => setCurrentView('dashboard')}
                    onStatusChange={(taskId, newStatus) => {
                      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
                    }}
                  />
                )}
                </Suspense>
                </ErrorBoundary>
              </motion.div>
            </AnimatePresence>
          </div>

          {currentView === 'dashboard' && (
            <ProjectSwitcher
              projects={projects}
              activeProjectId={activeProjectId}
              activeTaskCounts={activeTaskCounts}
              onProjectChange={setActiveProjectId}
              onAddProject={addProject}
              theme={theme}
              onThemeChange={setTheme}
            />
          )}
        </div>
      </div>

      <MobileNav
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenMissionModal={() => setIsMissionModalOpen(true)}
        projects={projects}
        activeProjectId={activeProjectId}
        activeTaskCounts={activeTaskCounts}
        onProjectChange={setActiveProjectId}
        onStartAddProject={() => { setCurrentView('dashboard'); }}
      />

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
          const viewMap: Record<string, View> = {
            'new-finance': 'finance',
            'new-health': 'health',
            'new-braindump': 'notes',
          };
          const target = viewMap[actionId];
          if (target) setCurrentView(target);
        }}
      />

      {isMissionModalOpen && (
        <MissionModal onClose={() => setIsMissionModalOpen(false)} onSave={addTask} />
      )}

      <ShortcutsDialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

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
      <NotionDataProvider>
        <ProjectProvider>
          <AppContent />
        </ProjectProvider>
      </NotionDataProvider>
    </SupabaseDataProvider>
  );
};

export default App;
