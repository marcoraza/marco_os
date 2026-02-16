import React, { useState, useEffect, useRef } from 'react';
import type { StoredAgent, StoredEvent, StoredNote } from './data/models';
import { bootstrapIfEmpty, bootstrapAgentsIfEmpty, loadAll, loadAgents, putAgent, saveAgents, saveEvents, saveNotes, saveProjects, saveTasks } from './data/repository';
import { defaultAgents } from './data/agentsSeed';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Health from './components/Health';
import Learning from './components/Learning';
import Planner from './components/Planner';
import CRM from './components/CRM';
import CommandPalette from './components/CommandPalette';
import Settings from './components/Settings';
import AgentAddModal from './components/AgentAddModal';
import AgentCenter from './components/AgentCenter';
import type { Agent } from './types/agents';
import MissionModal from './components/MissionModal';
import MissionDetail from './components/MissionDetail';
import NotesPanel from './components/NotesPanel';
import MissionControlV2 from './components/MissionControl';
import { Icon, Badge, SectionLabel, StatusDot, ToastContainer, showToast } from './components/ui';
import { cn } from './utils/cn';

// Types
export type View = 'dashboard' | 'finance' | 'health' | 'learning' | 'planner' | 'crm' | 'notes' | 'settings' | 'agent-center' | 'mission-detail' | 'mission-control';
type UptimeView = '24H' | '7D' | '30D' | '90D' | '120D' | '365D';
type Theme = 'dark' | 'light' | 'system';

// ─── Project model ───────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  color: string;   // hex
  icon?: string;   // material-symbols name (optional)
  deletable: boolean;
}

// ─── Task model (projectId replaces context) ─────────────────────────────────
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

// Palette for auto-assigning colors to new projects
const PROJECT_COLORS = ['#0A84FF', '#BF5AF2', '#FF9F0A', '#FF453A', '#FF5500', '#4CD964', '#5AC8FA'];
const SWITCHER_MAX = 5; // max visible project tabs (including Pessoal)

const DEFAULT_PROJECTS: Project[] = [
  { id: 'pessoal',       name: 'Pessoal',            color: '#00FF95', icon: 'person',           deletable: false },
  { id: 'zaremba-gestao', name: 'Zaremba - Gestão',  color: '#0A84FF', icon: 'business_center',  deletable: true  },
];

const DEFAULT_TASKS: Task[] = [
  // Pessoal
  { id: 1,  title: 'Treino de Hipertrofia A',   tag: 'SAÚDE',    projectId: 'pessoal',        status: 'assigned',    priority: 'high',   deadline: 'Hoje',          assignee: 'MA', dependencies: 0 },
  { id: 2,  title: 'Agendar check-up médico',   tag: 'SAÚDE',    projectId: 'pessoal',        status: 'standby',     priority: 'medium', deadline: 'Prox. Mês',     assignee: 'MA', dependencies: 1 },
  { id: 3,  title: 'Pagar fatura cartão Black', tag: 'FINANÇAS', projectId: 'pessoal',        status: 'started',     priority: 'high',   deadline: 'Amanhã',        assignee: 'MA', dependencies: 0 },
  { id: 4,  title: 'Ler 20 pág. "Clean Code"', tag: 'ESTUDO',   projectId: 'pessoal',        status: 'done',        priority: 'low',    deadline: 'Ontem',         assignee: 'MA', dependencies: 0 },
  { id: 5,  title: 'Organizar Home Office',     tag: 'CASA',     projectId: 'pessoal',        status: 'in-progress', priority: 'low',    deadline: 'Fim de Semana', assignee: 'MA', dependencies: 2 },
  // Zaremba – Gestão (antigo EMPRESA 1)
  { id: 6,  title: 'Definir Arquitetura AWS',   tag: 'DEV',      projectId: 'zaremba-gestao', status: 'assigned',    priority: 'high',   deadline: '10 Fev',        assignee: 'https://i.pravatar.cc/150?u=1', dependencies: 3 },
  { id: 7,  title: 'Refatoração da API de Login', tag: 'BACKEND', projectId: 'zaremba-gestao', status: 'in-progress', priority: 'high',  deadline: 'Hoje',          assignee: 'MA', dependencies: 1 },
  { id: 8,  title: 'Deploy v2.4 em Staging',   tag: 'DEVOPS',   projectId: 'zaremba-gestao', status: 'done',        priority: 'medium', deadline: 'Ontem',         assignee: 'JP', dependencies: 0 },
  { id: 9,  title: 'Design System Tokens',      tag: 'DESIGN',   projectId: 'zaremba-gestao', status: 'started',     priority: 'medium', deadline: '12 Fev',        assignee: 'https://i.pravatar.cc/150?u=2', dependencies: 0 },
  { id: 10, title: 'Code Review PR #402',       tag: 'DEV',      projectId: 'zaremba-gestao', status: 'assigned',    priority: 'low',    deadline: 'Hoje',          assignee: 'MA', dependencies: 0 },
  // Marketing (antigo EMPRESA 2) – também em pessoal para aproveitarmos os dados
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [uptimeView, setUptimeView] = useState<UptimeView>('24H');
  const [currentTime, setCurrentTime] = useState(new Date());

  // ─── Projects ──────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('pessoal');

  // ─── "Mais" / overflow popover ─────────────────────────────────────────────
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // ─── Add-project inline state ───────────────────────────────────────────────
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  // ─── Theme ─────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('marco-os-theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  // Mobile Nav
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);

  const viewLabels: Record<string, string> = {
    dashboard: 'Central',
    finance: 'Finanças',
    health: 'Saúde',
    learning: 'Aprendizado',
    planner: 'Planejador',
    notes: 'Notas',
    crm: 'Rede',
    settings: 'Config',
    'agent-center': 'Agentes',
    'mission-detail': 'Missão',
    'mission-control': 'Mission Control',
  };

  // ─── Centro de Agentes (sidebar) — persisted in IndexedDB ───────────────────
  const [agentRoster, setAgentRoster] = useState<Agent[]>([]);
  const [activeAgentId, setActiveAgentId] = useState<string>('frank-opus');
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

  // ─── Tasks (projectId replaces context) ────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);

  // ─── Notes & Events (persisted; used by Command Palette) ───────────────────
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [events, setEvents] = useState<StoredEvent[]>([]);

  // ─── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const uptimeInterval = setInterval(() => setUptime(prev => prev + 1), 1000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(uptimeInterval); clearInterval(clockInterval); };
  }, []);

  // Cmd/Ctrl+K opens command palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('marco-os-theme', theme);
  }, [theme]);

  // Focus the new-project input when it appears
  useEffect(() => {
    if (isAddingProject && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingProject]);

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
        await bootstrapAgentsIfEmpty(defaultAgents);
        const { projects: p, tasks: t, notes: n, events: e } = await loadAll();
        if (p.length) setProjects(p);
        if (t.length) setTasks(t);
        setNotes(n);
        setEvents(e);
        // ensure active project stays valid
        if (p.length && !p.some(x => x.id === activeProjectId)) setActiveProjectId(p[0].id);
        // Load agents from IndexedDB
        const agents = await loadAgents();
        if (agents.length) {
          setAgentRoster(agents.map(storedAgentToAgent));
          if (!agents.some(a => a.id === activeAgentId)) setActiveAgentId(agents[0].id);
        }
      } finally {
        didHydrateRef.current = true;
      }
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

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const cycleUptimeView = () => {
    const views: UptimeView[] = ['24H', '7D', '30D', '90D', '120D', '365D'];
    setUptimeView(views[(views.indexOf(uptimeView) + 1) % views.length]);
  };

  const getDisplayUptime = () => {
    const historyBase: Record<UptimeView, number> = {
      '24H': 0, '7D': 345600, '30D': 1209600,
      '90D': 4320000, '120D': 6500000, '365D': 15000000,
    };
    const total = uptime + historyBase[uptimeView];
    if (uptimeView === '24H') {
      const h = Math.floor(total / 3600).toString().padStart(2, '0');
      const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
      const s = (total % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
  };

  // ─── Project management ─────────────────────────────────────────────────────
  const addProject = () => {
    const name = newProjectName.trim();
    if (!name) { setIsAddingProject(false); return; }
    const id = `proj-${Date.now()}`;
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects(prev => [...prev, { id, name, color, icon: 'folder', deletable: true }]);
    setActiveProjectId(id);
    setNewProjectName('');
    setIsAddingProject(false);
    setIsMoreOpen(false);
  };

  const renameProject = (id: string, newName: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const deleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj || !proj.deletable) return;
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) setActiveProjectId('pessoal');
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

  const handleTaskClick = () => setCurrentView('mission-detail');

  // ─── Active task counts per project ─────────────────────────────────────────
  const activeTaskCounts = projects.reduce((acc, proj) => {
    acc[proj.id] = tasks.filter(t => t.projectId === proj.id && t.status !== 'done').length;
    return acc;
  }, {} as Record<string, number>);

  // ─── Switcher: split visible vs overflow ────────────────────────────────────
  const visibleProjects = projects.slice(0, SWITCHER_MAX);
  const overflowProjects = projects.slice(SWITCHER_MAX);
  const activeProjectObj = projects.find(p => p.id === activeProjectId);

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

      {currentView !== 'mission-detail' && currentView !== 'mission-control' && (
        <header className="h-16 bg-header-bg border-b border-border-panel px-6 flex items-center justify-between shrink-0 gap-4 z-30 relative transition-colors duration-300">
          <div className="flex items-center gap-6 lg:gap-10 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Icon name="grid_view" className="text-text-primary text-2xl" />
              <h2 className="text-text-primary text-[10px] font-black tracking-widest uppercase hidden sm:block">Marco OS</h2>
            </div>
            {/* Indicador de perfil ativo */}
            <div className="hidden md:flex items-center gap-3 bg-surface/50 border border-border-panel px-3 py-1.5 rounded-sm">
              <div className="flex items-center gap-2 min-w-0">
                <StatusDot
                  size="md"
                  color={activeAgentStatusColor}
                  glow={activeAgent?.status !== 'offline'}
                  pulse={activeAgent?.status === 'online' || activeAgent?.status === 'busy'}
                />
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Perfil Ativo:</span>
                <span className="text-[9px] font-black text-text-primary truncate max-w-[140px]">{activeAgent?.name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 border-l border-border-panel pl-2 ml-1 shrink-0">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Agentes Online:</span>
                <span className="text-[9px] font-black text-brand-mint">{agentsOnlineCount}</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView("mission-control")}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-border-panel hover:border-brand-mint/30 rounded-sm transition-all group cursor-pointer"
            >
              <Icon name="hub" size="lg" className="text-brand-mint group-hover:rotate-12 transition-transform" />
              <span className="text-[9px] font-bold text-text-primary uppercase tracking-widest">Mission Control V2</span>
            </button>
          </div>

          {/* Mobile View Title */}
          <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-text-primary absolute left-1/2 -translate-x-1/2">
            {viewLabels[currentView]}
          </span>

          {/* Search */}
          <div className="flex-grow max-w-lg relative hidden xl:block">
            <Icon name="search" size="lg" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              readOnly
              onFocus={() => setIsPaletteOpen(true)}
              onClick={() => setIsPaletteOpen(true)}
              placeholder="Cmd/Ctrl+K • Buscar / criar…"
              className="w-full bg-bg-base border border-border-panel rounded-md pl-11 pr-28 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder:text-text-secondary/40 cursor-pointer"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-text-secondary/70 border border-border-panel bg-surface px-2 py-1 rounded-sm">
              ⌘K
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="md:hidden flex items-center gap-2 bg-surface/50 border border-border-panel px-2 py-1 rounded-sm max-w-[160px]">
              <StatusDot
                color={activeAgentStatusColor}
                glow={activeAgent?.status !== 'offline'}
                pulse={activeAgent?.status === 'online' || activeAgent?.status === 'busy'}
              />
              <span className="text-[8px] font-bold text-text-secondary uppercase tracking-widest whitespace-nowrap">Perfil Ativo:</span>
              <span className="text-[9px] font-black text-text-primary truncate">{activeAgent?.name ?? '—'}</span>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover border border-border-panel hover:border-brand-mint/30 rounded-sm transition-all group">
              <Icon name="smart_toy" size="lg" className="text-brand-mint group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wide">Briefing do Frank</span>
            </button>
            <button
              onClick={() => setIsMissionModalOpen(true)}
              className="hidden sm:flex bg-brand-mint text-black px-4 py-2 pill-radius text-[11px] font-extrabold hover:brightness-110 transition-all items-center gap-2 uppercase tracking-tight shadow-[0_0_15px_rgba(0,255,149,0.2)] hover:scale-105"
            >
              <Icon name="add" className="text-base font-bold" />
              <span>Nova Missão</span>
            </button>
            <div className="hidden lg:block h-8 w-[1px] bg-border-panel mx-2"></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-[13px] font-black text-text-primary leading-none font-mono">
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[9px] text-brand-mint font-bold uppercase mt-1 tracking-wider">
                  {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
                </p>
              </div>
              <div className="size-9 rounded-full bg-surface border border-border-panel overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"
                  alt="User"
                  className="w-full h-full object-cover grayscale opacity-80"
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY */}
      <div className="flex-grow flex overflow-hidden">

        {/* LEFT SIDEBAR */}
        {currentView !== 'mission-detail' && currentView !== 'mission-control' && (
          <aside className="w-[220px] bg-header-bg border-r border-border-panel flex-col shrink-0 hidden md:flex z-10 transition-colors duration-300">
            <div className="flex-grow overflow-y-auto py-6">
              <div className="px-4 mb-8">
                <SectionLabel className="mb-4 px-3">Navegação</SectionLabel>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', icon: 'dashboard',      label: 'Central de Comando' },
                    { id: 'finance',   icon: 'payments',       label: 'Finanças' },
                    { id: 'health',    icon: 'monitor_heart',  label: 'Saúde' },
                    { id: 'learning',  icon: 'school',         label: 'Aprendizado' },
                    { id: 'planner',   icon: 'event_note',     label: 'Planejador' },
                    { id: 'notes',     icon: 'sticky_note_2',  label: 'Notas' },
                    { id: 'crm',       icon: 'contacts',       label: 'Gestão de Contatos' },
                    // Agent Center moved to sidebar lower "Agentes" section
                    { id: 'settings',  icon: 'settings',       label: 'Configurações' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as View)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                        currentView === item.id ? 'nav-item-active' : 'nav-item-inactive'
                      }`}
                    >
                      <Icon name={item.icon} size="lg" />
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="w-full h-[1px] bg-border-panel mb-6"></div>

              {/* Agents */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <SectionLabel>Centro de Agentes</SectionLabel>
                  <span className="text-[9px] font-bold text-text-secondary/50 bg-surface px-2 py-0.5 rounded-sm border border-border-panel">{agentRoster.length}</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentView("agent-center")}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ease-out mb-2",
                      currentView === "agent-center" ? "nav-item-active" : "nav-item-inactive"
                    )}
                  >
                    <Icon name="hub" size="lg" />
                    Mission Control
                  </button>
                  {agentRoster.map(agent => (
                    <div
                      key={agent.id}
                      onClick={() => {
                        setActiveAgentId(agent.id);
                      }}
                      className={cn(
                        'p-2 rounded-md flex items-center gap-3 transition-all cursor-pointer group border',
                        activeAgentId === agent.id
                          ? 'bg-surface border-brand-mint/30'
                          : 'bg-bg-base/0 hover:bg-surface border-border-card'
                      )}
                    >
                      <div
                        className={cn(
                          'size-8 rounded-sm flex items-center justify-center shrink-0 border',
                          agent.role === 'coordinator'
                            ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                            : 'bg-surface text-text-secondary group-hover:text-text-primary border-border-panel'
                        )}
                      >
                        <Icon name={agent.avatarIcon || (agent.role === 'coordinator' ? 'shield' : 'engineering')} size="lg" />
                      </div>

                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-[10px] font-bold text-text-primary truncate">{agent.name}</p>
                          <Badge variant={agent.role === 'coordinator' ? 'orange' : 'mint'} size="xs">
                            {(agent.domain || (agent.role === 'coordinator' ? 'COORDENADOR' : 'AGENTE')).toUpperCase()}
                          </Badge>
                        </div>
                        {agent.handle && (
                          <p className="text-[8px] text-text-secondary font-semibold uppercase tracking-tight truncate">
                            {agent.handle}
                          </p>
                        )}
                      </div>

                      <StatusDot
                        color={agent.status === 'online' ? 'mint' : agent.status === 'busy' ? 'orange' : agent.status === 'idle' ? 'blue' : 'red'}
                        glow={agent.status !== 'offline'}
                        className={agent.status === 'online' ? 'shadow-[0_0_6px_rgba(0,255,149,0.4)]' : ''}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() => setIsAddAgentOpen(true)}
                    className="w-full mt-4 flex items-center gap-2 text-brand-mint hover:text-text-primary transition-colors cursor-pointer py-2 px-1"
                  >
                    <Icon name="add" size="md" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Agente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uptime Counter */}
            <div className="h-[72px] px-4 border-t border-border-panel bg-header-bg flex flex-col justify-center shrink-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-text-secondary uppercase tracking-[0.1em]">
                  <button
                    onClick={cycleUptimeView}
                    className="flex items-center gap-2 hover:text-brand-mint transition-colors group"
                    title="Alternar período"
                  >
                    <Icon name="timer" size="sm" />
                    UPTIME <span className="bg-surface border border-border-panel px-1 rounded text-[8px] group-hover:border-brand-mint/50">{uptimeView}</span>
                  </button>
                  <span className="text-brand-mint font-mono text-xs">{getDisplayUptime()}</span>
                </div>
                <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden border border-border-panel">
                  <div className="w-full h-full bg-brand-mint/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-mint/40 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CONTENT AREA */}
        <div className="flex-grow flex flex-col min-w-0 bg-bg-base relative overflow-hidden transition-colors duration-300">
          <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col pb-24 md:pb-0 safe-pb">
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
            {currentView === 'settings'        && <Settings />}
            {currentView === 'agent-center'    && <AgentCenter selectedAgentId={activeAgentId} roster={agentRoster} />}
            {currentView === 'mission-detail'  && <MissionDetail onBack={() => setCurrentView('dashboard')} />}
            {currentView === 'mission-control' && <MissionControlV2 />}
          </div>

          {/* ─── FOOTER BAR (Dashboard only) ──────────────────────────────── */}
          {currentView === 'dashboard' && (
            <footer className="h-[72px] border-t border-border-panel bg-header-bg px-6 hidden md:flex items-center justify-between shrink-0 z-20 transition-colors duration-300">
              <div className="flex items-center gap-4 flex-1 overflow-hidden relative">

                {/* Project Switcher */}
                <div className="flex p-1 bg-bg-base rounded-md border border-border-panel items-center gap-0.5 max-w-full overflow-hidden">

                  {/* Visible project tabs (up to SWITCHER_MAX) */}
                  {visibleProjects.map(proj => {
                    const isActive = activeProjectId === proj.id;
                    const count = activeTaskCounts[proj.id] ?? 0;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => { setActiveProjectId(proj.id); setIsMoreOpen(false); }}
                        className={`relative z-10 px-3 py-1.5 text-[10px] font-black rounded-sm uppercase tracking-tight transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 group ${
                          isActive ? 'text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                        }`}
                        style={isActive ? { '--tw-shadow-color': proj.color } as React.CSSProperties : undefined}
                      >
                        {isActive && (
                          <span
                            className="absolute inset-0 rounded-sm -z-10 animate-in fade-in zoom-in-95 duration-200 border border-border-panel/40"
                            style={{ backgroundColor: proj.color + '22' }}
                          ></span>
                        )}
                        {/* Color dot */}
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color }}
                        ></span>
                        <span className={isActive ? 'text-text-primary' : ''}>{proj.name}</span>
                        {count > 0 && (
                          <span
                            className="px-1.5 py-px text-[9px] font-bold rounded-sm border"
                            style={isActive
                              ? { backgroundColor: proj.color, color: '#000', borderColor: proj.color }
                              : { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-panel)' }}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* "Mais" button (overflow) */}
                  {overflowProjects.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-sm uppercase tracking-tight transition-all border whitespace-nowrap flex items-center gap-1 ${
                          isMoreOpen || overflowProjects.some(p => p.id === activeProjectId)
                            ? 'border-brand-mint/30 text-brand-mint bg-brand-mint/10'
                            : 'border-border-panel text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <Icon name="more_horiz" size="sm" />
                        Mais
                      </button>

                      {/* Overflow popover */}
                      {isMoreOpen && (
                        <div className="absolute bottom-full mb-2 left-0 min-w-[180px] bg-surface border border-border-panel rounded-md shadow-2xl py-1 z-50 animate-in zoom-in-95 origin-bottom-left duration-150">
                          {overflowProjects.map(proj => {
                            const isActive = activeProjectId === proj.id;
                            const count = activeTaskCounts[proj.id] ?? 0;
                            return (
                              <button
                                key={proj.id}
                                onClick={() => { setActiveProjectId(proj.id); setIsMoreOpen(false); }}
                                className={`w-full px-4 py-2.5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wide hover:bg-surface-hover transition-colors ${
                                  isActive ? 'text-text-primary bg-brand-mint/5' : 'text-text-secondary'
                                }`}
                              >
                                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }}></span>
                                <span className="flex-1 text-left">{proj.name}</span>
                                {count > 0 && (
                                  <span className="px-1.5 py-px text-[9px] font-bold rounded-sm bg-surface border border-border-panel text-text-secondary">{count}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Separator + Add project */}
                  <div className="h-5 w-[1px] bg-border-panel mx-1 shrink-0"></div>

                  {isAddingProject ? (
                    <div className="flex items-center gap-1 pl-1">
                      <input
                        ref={addInputRef}
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addProject(); if (e.key === 'Escape') setIsAddingProject(false); }}
                        placeholder="Nome do projeto..."
                        className="bg-bg-base border border-brand-mint/40 rounded-sm px-2 py-1 text-[10px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none w-36"
                      />
                      <button onClick={addProject} className="p-1 text-brand-mint hover:text-text-primary transition-colors">
                        <Icon name="check" size="sm" />
                      </button>
                      <button onClick={() => { setIsAddingProject(false); setNewProjectName(''); }} className="p-1 text-text-secondary hover:text-text-primary transition-colors">
                        <Icon name="close" size="sm" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingProject(true)}
                      className="px-2 py-1.5 text-text-secondary hover:text-brand-mint transition-colors"
                      title="Novo projeto"
                    >
                      <Icon name="add" size="sm" className="font-bold" />
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-8 shrink-0">
                <p className="text-[9px] text-text-secondary/40 font-black tracking-[0.3em] uppercase">MARCO OS • V1.2</p>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center p-0.5 bg-bg-base rounded-sm border border-border-panel shrink-0 ml-4">
                {([
                  { t: 'light' as Theme, icon: 'light_mode',     active: 'text-accent-orange' },
                  { t: 'dark'  as Theme, icon: 'dark_mode',      active: 'text-brand-mint'    },
                  { t: 'system' as Theme, icon: 'desktop_windows', active: 'text-accent-blue'  },
                ] as const).map(({ t, icon, active }) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'p-1.5 transition-colors rounded-sm',
                      theme === t
                        ? `bg-surface ${active} shadow-sm border border-border-panel/40`
                        : 'text-text-secondary hover:text-text-primary'
                    )}
                    title={t}
                  >
                    <Icon name={icon} size="sm" />
                  </button>
                ))}
              </div>
            </footer>
          )}
        </div>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      {currentView !== 'mission-detail' && currentView !== 'mission-control' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-header-bg border-t border-border-panel z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">

          {/* Mobile Context/Project Popover */}
          {isMobileContextOpen && (
            <div className="absolute bottom-full left-0 right-0 bg-surface border-t border-border-panel shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
              <div className="p-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {projects.map(proj => {
                  const isActive = activeProjectId === proj.id;
                  const count = activeTaskCounts[proj.id] ?? 0;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => { setActiveProjectId(proj.id); setIsMobileContextOpen(false); }}
                      className="flex items-center justify-between px-4 py-3 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-colors"
                      style={isActive
                        ? { backgroundColor: proj.color + '33', color: proj.color, borderColor: proj.color }
                        : { backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-secondary)', borderColor: 'var(--color-border-panel)' }
                      }
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }}></span>
                        {proj.name}
                      </span>
                      {count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold ml-1 shrink-0"
                          style={isActive ? { backgroundColor: '#00000033', color: proj.color } : { backgroundColor: 'var(--color-surface)', color: 'var(--color-brand-mint)', border: '1px solid var(--color-border-panel)' }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Add project from mobile */}
                <button
                  onClick={() => { setIsMobileContextOpen(false); setIsAddingProject(true); setCurrentView('dashboard'); }}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-dashed border-border-panel text-text-secondary text-[10px] font-black uppercase tracking-widest hover:border-brand-mint hover:text-brand-mint transition-colors"
                >
                  <Icon name="add" size="sm" />
                  Novo Projeto
                </button>
              </div>
              <div className="bg-black/20 p-2 text-center" onClick={() => setIsMobileContextOpen(false)}>
                <Icon name="expand_more" className="text-text-secondary" />
              </div>
            </div>
          )}

          {/* Active Project Indicator */}
          <div
            onClick={() => setIsMobileContextOpen(!isMobileContextOpen)}
            className="h-6 flex items-center justify-center gap-2 border-b border-border-panel/30 bg-surface/50 active:bg-surface cursor-pointer"
          >
            {activeProjectObj && (
              <span className="size-1.5 rounded-full" style={{ backgroundColor: activeProjectObj.color }}></span>
            )}
            <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
              {activeProjectObj?.name ?? '–'}
            </span>
            {activeTaskCounts[activeProjectId] > 0 && (
              <span className="text-[8px] font-bold bg-brand-mint/10 text-brand-mint px-1.5 rounded-sm border border-brand-mint/20">
                {activeTaskCounts[activeProjectId]}
              </span>
            )}
            <Icon name={isMobileContextOpen ? 'expand_more' : 'expand_less'} className="text-[10px] text-text-secondary" />
          </div>

          {/* More Menu Popover */}
          {isMobileMoreOpen && (
            <div className="absolute bottom-[60px] right-2 mb-[env(safe-area-inset-bottom)] bg-surface border border-border-panel rounded-md shadow-2xl py-1 min-w-[160px] animate-in zoom-in-95 origin-bottom-right duration-200">
              {[
                { id: 'learning', icon: 'school',      label: 'Aprendizado' },
                { id: 'planner',  icon: 'event_note', label: 'Planejador'  },
                { id: 'notes',    icon: 'sticky_note_2', label: 'Notas'    },
                { id: 'crm',      icon: 'contacts',   label: 'Rede (CRM)'  },
                // Agent Center moved to sidebar lower "Agentes" section
                { id: 'settings', icon: 'settings',   label: 'Configurações' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id as View); setIsMobileMoreOpen(false); }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wide hover:bg-surface-hover transition-colors ${currentView === item.id ? 'text-brand-mint bg-brand-mint/5' : 'text-text-secondary'}`}
                >
                  <Icon name={item.icon} size="sm" />
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Main Nav Bar */}
          <div className="h-14 flex items-center justify-around px-2 relative">
            <button onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
              <Icon name="dashboard" size="md" className={currentView === 'dashboard' ? 'text-brand-mint' : 'text-text-secondary'} />
              <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'dashboard' ? 'text-brand-mint' : 'text-text-secondary'}`}>Central</span>
            </button>
            <button onClick={() => setCurrentView('finance')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
              <Icon name="payments" size="md" className={currentView === 'finance' ? 'text-brand-mint' : 'text-text-secondary'} />
              <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'finance' ? 'text-brand-mint' : 'text-text-secondary'}`}>Finanças</span>
            </button>
            <div className="relative -top-5">
              <button
                onClick={() => setIsMissionModalOpen(true)}
                className="size-12 bg-brand-mint rounded-full text-black flex items-center justify-center border-4 border-bg-base shadow-[0_0_15px_rgba(0,255,149,0.3)] active:scale-95 transition-transform"
              >
                <Icon name="add" className="font-black text-xl" />
              </button>
            </div>
            <button onClick={() => setCurrentView('health')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
              <Icon name="monitor_heart" size="md" className={currentView === 'health' ? 'text-brand-mint' : 'text-text-secondary'} />
              <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'health' ? 'text-brand-mint' : 'text-text-secondary'}`}>Saúde</span>
            </button>
            <button onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
              <Icon name="more_horiz" size="md" className={isMobileMoreOpen || ['learning','planner','notes','crm','settings'].includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'} />
              <span className={`text-[8px] font-bold uppercase tracking-wide ${isMobileMoreOpen || ['learning','planner','notes','crm','settings'].includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'}`}>Mais</span>
            </button>
          </div>
        </div>
      )}

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        tasks={tasks}
        notes={notes}
        events={events}
        onOpenTask={openTaskFromPalette}
        onCreateTask={createTaskFromPalette}
        onCreateNote={createNoteFromPalette}
        onCreateEvent={createEventFromPalette}
      />

      {/* Mission Modal */}
      {isMissionModalOpen && (
        <MissionModal onClose={() => setIsMissionModalOpen(false)} onSave={addTask} />
      )}

      <ToastContainer />
    </div>
  );
};

export default App;
