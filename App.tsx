import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Health from './components/Health';
import Learning from './components/Learning';
import CRM from './components/CRM';
import Settings from './components/Settings';
import AgentCenter from './components/AgentCenter';
import MissionModal from './components/MissionModal';
import MissionDetail from './components/MissionDetail';
import { Icon, Badge, SectionLabel, StatusDot } from './components/ui';
import { cn } from './utils/cn';

// Types
export type View = 'dashboard' | 'finance' | 'health' | 'learning' | 'crm' | 'agents' | 'settings' | 'mission-detail';
type UptimeView = '24H' | '7D' | '30D' | '90D' | '120D' | '365D';
type Theme = 'dark' | 'light' | 'system';

export interface Task {
  id: number;
  title: string;
  tag: string;
  context: string; // New field for project separation
  status: 'assigned' | 'started' | 'in-progress' | 'standby' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignee: string; // URL da imagem ou iniciais
  dependencies?: number; // Mocked dependencies count
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [uptime, setUptime] = useState(0); // Seconds in current session
  const [uptimeView, setUptimeView] = useState<UptimeView>('24H');
  const [activeContext, setActiveContext] = useState('GERAL');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Theme Management
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('marco-os-theme') as Theme) || 'dark';
    }
    return 'dark';
  });

  // Mobile Navigation States
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);

  const contexts = ['GERAL', 'PESSOAL', 'EMPRESA 1', 'EMPRESA 2'];

  const viewLabels: Record<string, string> = {
    dashboard: 'Central',
    finance: 'Finanças',
    health: 'Saúde',
    learning: 'Aprendizado',
    crm: 'Rede',
    agents: 'Agentes',
    settings: 'Config',
    'mission-detail': 'Missão'
  };

  // Shared State for Kanban (Simulated Database - Populated for 3-5 items per context)
  const [tasks, setTasks] = useState<Task[]>([
    // --- PESSOAL (5 tasks) ---
    { id: 1, title: 'Treino de Hipertrofia A', tag: 'SAÚDE', context: 'PESSOAL', status: 'assigned', priority: 'high', deadline: 'Hoje', assignee: 'MA', dependencies: 0 },
    { id: 2, title: 'Agendar check-up médico', tag: 'SAÚDE', context: 'PESSOAL', status: 'standby', priority: 'medium', deadline: 'Prox. Mês', assignee: 'MA', dependencies: 1 },
    { id: 3, title: 'Pagar fatura cartão Black', tag: 'FINANÇAS', context: 'PESSOAL', status: 'started', priority: 'high', deadline: 'Amanhã', assignee: 'MA', dependencies: 0 },
    { id: 4, title: 'Ler 20 pág. "Clean Code"', tag: 'ESTUDO', context: 'PESSOAL', status: 'done', priority: 'low', deadline: 'Ontem', assignee: 'MA', dependencies: 0 },
    { id: 5, title: 'Organizar Home Office', tag: 'CASA', context: 'PESSOAL', status: 'in-progress', priority: 'low', deadline: 'Fim de Semana', assignee: 'MA', dependencies: 2 },

    // --- EMPRESA 1 - Tech/Dev (Was PROJETO A) ---
    { id: 6, title: 'Definir Arquitetura AWS', tag: 'DEV', context: 'EMPRESA 1', status: 'assigned', priority: 'high', deadline: '10 Fev', assignee: 'https://i.pravatar.cc/150?u=1', dependencies: 3 },
    { id: 7, title: 'Refatoração da API de Login', tag: 'BACKEND', context: 'EMPRESA 1', status: 'in-progress', priority: 'high', deadline: 'Hoje', assignee: 'MA', dependencies: 1 },
    { id: 8, title: 'Deploy v2.4 em Staging', tag: 'DEVOPS', context: 'EMPRESA 1', status: 'done', priority: 'medium', deadline: 'Ontem', assignee: 'JP', dependencies: 0 },
    { id: 9, title: 'Design System Tokens', tag: 'DESIGN', context: 'EMPRESA 1', status: 'started', priority: 'medium', deadline: '12 Fev', assignee: 'https://i.pravatar.cc/150?u=2', dependencies: 0 },
    { id: 10, title: 'Code Review PR #402', tag: 'DEV', context: 'EMPRESA 1', status: 'assigned', priority: 'low', deadline: 'Hoje', assignee: 'MA', dependencies: 0 },

    // --- EMPRESA 2 - Marketing (Was PROJETO B) ---
    { id: 11, title: 'Briefing Campanha Q1', tag: 'MKT', context: 'EMPRESA 2', status: 'assigned', priority: 'medium', deadline: 'Amanhã', assignee: 'JP', dependencies: 0 },
    { id: 12, title: 'Análise de Concorrentes', tag: 'STRATEGY', context: 'EMPRESA 2', status: 'started', priority: 'low', deadline: '15 Fev', assignee: 'MA', dependencies: 0 },
    { id: 13, title: 'Gravação Vídeo Youtube', tag: 'SOCIAL', context: 'EMPRESA 2', status: 'in-progress', priority: 'medium', deadline: 'Hoje', assignee: 'https://i.pravatar.cc/150?u=4', dependencies: 1 },
    { id: 14, title: 'Copywriting Landing Page', tag: 'COPY', context: 'EMPRESA 2', status: 'standby', priority: 'high', deadline: 'Indef.', assignee: 'MA', dependencies: 2 },
    { id: 15, title: 'Newsletter Semanal', tag: 'MKT', context: 'EMPRESA 2', status: 'done', priority: 'medium', deadline: '2d atrás', assignee: 'https://i.pravatar.cc/150?u=5', dependencies: 0 },
  ]);

  // Effects: Uptime & Clock
  useEffect(() => {
    const uptimeInterval = setInterval(() => setUptime(prev => prev + 1), 1000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(uptimeInterval);
      clearInterval(clockInterval);
    };
  }, []);

  // Effect: Theme
  useEffect(() => {
    const root = document.documentElement;
    let effectiveTheme = theme;
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', effectiveTheme);
    localStorage.setItem('marco-os-theme', theme);
  }, [theme]);

  const cycleUptimeView = () => {
    const views: UptimeView[] = ['24H', '7D', '30D', '90D', '120D', '365D'];
    const currentIndex = views.indexOf(uptimeView);
    const nextIndex = (currentIndex + 1) % views.length;
    setUptimeView(views[nextIndex]);
  };

  const getDisplayUptime = () => {
    const historyBase = {
        '24H': 0, '7D': 345600, '30D': 1209600, 
        '90D': 4320000, '120D': 6500000, '365D': 15000000 
    };
    const totalSeconds = uptime + historyBase[uptimeView];
    if (uptimeView === '24H') {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    } else {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
  };

  const addTask = (newTask: any) => {
    const adaptedTask: Task = {
        id: Date.now(),
        title: newTask.title,
        tag: newTask.tag || 'GERAL',
        context: activeContext === 'GERAL' ? 'PESSOAL' : activeContext,
        status: 'assigned',
        priority: newTask.priority || 'medium',
        deadline: 'A definir',
        assignee: 'MA',
        dependencies: 0
    };
    setTasks([...tasks, adaptedTask]);
    setIsMissionModalOpen(false);
  };

  const handleTaskClick = () => {
    setCurrentView('mission-detail');
  };

  // Calculate active tasks count per context for badges
  const activeTaskCounts = contexts.reduce((acc, ctx) => {
    // Filter active tasks (not done)
    const count = tasks.filter(t => (ctx === 'GERAL' ? true : t.context === ctx) && t.status !== 'done').length;
    acc[ctx] = count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex h-screen w-full flex-col bg-bg-base text-text-primary overflow-hidden font-sans transition-colors duration-300">
      
      {/* Hide global header only on mission-detail view if specifically requested */}
      {currentView !== 'mission-detail' && (
        <header className="h-16 bg-header-bg border-b border-border-panel px-6 flex items-center justify-between shrink-0 gap-4 z-30 relative transition-colors duration-300">
          <div className="flex items-center gap-6 lg:gap-10 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Icon name="grid_view" className="text-text-primary text-2xl" />
              <h2 className="text-text-primary text-[10px] font-black tracking-widest uppercase hidden sm:block">Marco OS</h2>
            </div>
            
            {/* Live Status Indicator - Agent Online (Desktop) */}
            <div className="hidden md:flex items-center gap-3 bg-surface/50 border border-border-panel px-3 py-1.5 rounded-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-mint opacity-75"></span>
                  <StatusDot color="mint" className="relative" />
                </div>
                <div className="flex items-center gap-2 border-l border-border-panel pl-2 ml-1">
                   <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Agentes Online:</span>
                   <span className="text-[9px] font-black text-brand-mint">2</span>
                </div>
            </div>
          </div>

          {/* Mobile View Title */}
          <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-text-primary absolute left-1/2 -translate-x-1/2">
            {viewLabels[currentView]}
          </span>

          {/* Search Bar - Square Style */}
          <div className="flex-grow max-w-lg relative hidden xl:block">
            <Icon name="search" size="lg" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Buscar missões, agentes ou logs..." 
              className="w-full bg-bg-base border border-border-panel rounded-md pl-11 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder:text-text-secondary/40"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Frank's Briefing Button */}
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
                {/* Live Clock */}
                <p className="text-[13px] font-black text-text-primary leading-none font-mono">
                    {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {/* Date */}
                <p className="text-[9px] text-brand-mint font-bold uppercase mt-1 tracking-wider">
                    {currentTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.','')}
                </p>
              </div>
              <div className="size-9 rounded-full bg-surface border border-border-panel overflow-hidden">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ" alt="User" className="w-full h-full object-cover grayscale opacity-80" />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* MAIN BODY */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* LEFT SIDEBAR (Desktop) */}
        {currentView !== 'mission-detail' && (
          <aside className="w-[220px] bg-header-bg border-r border-border-panel flex-col shrink-0 hidden md:flex z-10 transition-colors duration-300">
            <div className="flex-grow overflow-y-auto py-6">
              
              {/* Navigation */}
              <div className="px-4 mb-8">
                <SectionLabel className="mb-4 px-3">Navegação</SectionLabel>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', icon: 'dashboard', label: 'Central de Comando' },
                    { id: 'finance', icon: 'payments', label: 'Finanças' },
                    { id: 'health', icon: 'monitor_heart', label: 'Saúde' },
                    { id: 'learning', icon: 'school', label: 'Aprendizado' },
                    { id: 'crm', icon: 'contacts', label: 'Gestão de Contatos' },
                    { id: 'agents', icon: 'smart_toy', label: 'Agent Center' },
                    { id: 'settings', icon: 'settings', label: 'Configurações' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as View)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                        currentView === item.id 
                          ? 'nav-item-active' 
                          : 'nav-item-inactive'
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
                  <SectionLabel>Agentes</SectionLabel>
                  <span className="text-[9px] font-bold text-text-secondary/50 bg-surface px-2 py-0.5 rounded-sm border border-border-panel">2</span>
                </div>
                
                <div className="space-y-2">
                  <div className="p-2 bg-surface border border-border-card rounded-md flex items-center gap-3 hover:border-brand-mint/30 cursor-pointer transition-all">
                    <div className="size-8 rounded-sm bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0">
                      <Icon name="smart_toy" size="lg" />
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-text-primary truncate">Frank</p>
                        <Badge variant="orange" size="xs">COORDENADOR</Badge>
                      </div>
                    </div>
                    <StatusDot color="mint" glow />
                  </div>

                  <div className="p-2 hover:bg-surface rounded-md flex items-center gap-3 transition-all cursor-pointer group">
                    <div className="size-8 rounded-sm bg-surface flex items-center justify-center text-text-secondary group-hover:text-text-primary border border-border-panel shrink-0">
                      <Icon name="engineering" size="lg" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] font-bold text-text-primary">Agente E2</p>
                      <p className="text-[8px] text-text-secondary font-semibold uppercase tracking-tight">Operações @emilizaremba</p>
                    </div>
                    <StatusDot color="mint" glow className="shadow-[0_0_6px_rgba(0,255,149,0.4)]" />
                  </div>

                  <button className="w-full mt-4 flex items-center gap-2 text-brand-mint hover:text-text-primary transition-colors cursor-pointer py-2 px-1">
                    <Icon name="add" size="md" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Agente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uptime Counter - Leveled with Footer */}
            <div className="h-[72px] px-4 border-t border-border-panel bg-header-bg flex flex-col justify-center shrink-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-text-secondary uppercase tracking-[0.1em]">
                  <button 
                    onClick={cycleUptimeView}
                    className="flex items-center gap-2 hover:text-brand-mint transition-colors group"
                    title="Alternar período de visualização"
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
          {/* Main content with safe area padding bottom for mobile */}
          <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col pb-24 md:pb-0 safe-pb">
            {currentView === 'dashboard' && (
                <Dashboard 
                    tasks={tasks} 
                    setTasks={setTasks} 
                    onTaskClick={handleTaskClick} 
                    activeContext={activeContext}
                    onAddTask={() => setIsMissionModalOpen(true)}
                />
            )}
            {currentView === 'finance' && <Finance />}
            {currentView === 'health' && <Health />}
            {currentView === 'learning' && <Learning />}
            {currentView === 'crm' && <CRM />}
            {currentView === 'agents' && <AgentCenter />}
            {currentView === 'settings' && <Settings />}
            {currentView === 'mission-detail' && <MissionDetail onBack={() => setCurrentView('dashboard')} />}
          </div>

          {/* FOOTER BAR (Appears on Dashboard) - Height fixed to 72px for alignment */}
          {currentView === 'dashboard' && (
            <footer className="h-[72px] border-t border-border-panel bg-header-bg px-6 hidden md:flex items-center justify-between shrink-0 z-20 transition-colors duration-300">
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                {/* Context Switcher - Optimized Animation & Badges */}
                <div className="flex p-1 bg-bg-base rounded-md border border-border-panel overflow-x-auto max-w-full no-scrollbar relative items-center">
                  {contexts.map((ctx) => (
                    <button 
                        key={ctx}
                        onClick={() => setActiveContext(ctx)}
                        className={`relative z-10 px-4 py-1.5 text-[10px] font-black rounded-sm uppercase tracking-tight transition-all duration-300 whitespace-nowrap flex items-center gap-2 group ${
                            activeContext === ctx 
                            ? 'text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {activeContext === ctx && (
                            <span className="absolute inset-0 bg-surface border border-border-panel/40 rounded-sm -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
                        )}
                        <span className={activeContext === ctx ? 'text-text-primary' : ''}>{ctx}</span>
                        {/* Context Badge for Active Tasks */}
                        {activeTaskCounts[ctx] > 0 && (
                            <span className={`px-1.5 py-px text-[9px] font-bold rounded-sm border ${
                                activeContext === ctx 
                                ? 'bg-brand-mint text-black border-brand-mint' 
                                : 'bg-surface border-border-panel text-text-secondary'
                            }`}>
                                {activeTaskCounts[ctx]}
                            </span>
                        )}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 text-text-secondary hover:text-brand-mint transition-colors border-l border-border-panel sticky right-0 bg-bg-base z-20">
                    <Icon name="add" size="sm" className="font-bold" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-8 hidden md:flex shrink-0">
                 <p className="text-[9px] text-text-secondary/40 font-black tracking-[0.3em] uppercase">MARCO OS • V1.1</p>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center p-0.5 bg-bg-base rounded-sm border border-border-panel shrink-0 ml-4">
                <button 
                    onClick={() => setTheme('light')}
                    className={cn(
                        'p-1.5 transition-colors rounded-sm',
                        theme === 'light' 
                        ? 'bg-surface text-accent-orange shadow-sm border border-border-panel/40' 
                        : 'text-text-secondary hover:text-text-primary'
                    )} 
                    title="Light Mode"
                >
                    <Icon name="light_mode" size="sm" />
                </button>
                <button 
                    onClick={() => setTheme('dark')}
                    className={cn(
                        'p-1.5 transition-colors rounded-sm',
                        theme === 'dark' 
                        ? 'bg-surface text-brand-mint shadow-sm border border-border-panel/40' 
                        : 'text-text-secondary hover:text-text-primary'
                    )} 
                    title="Dark Mode"
                >
                    <Icon name="dark_mode" size="sm" />
                </button>
                <button 
                    onClick={() => setTheme('system')}
                    className={cn(
                        'p-1.5 transition-colors rounded-sm',
                        theme === 'system' 
                        ? 'bg-surface text-accent-blue shadow-sm border border-border-panel/40' 
                        : 'text-text-secondary hover:text-text-primary'
                    )} 
                    title="System"
                >
                    <Icon name="desktop_windows" size="sm" />
                </button>
              </div>
            </footer>
          )}
        </div>

      </div>

      {/* MOBILE BOTTOM NAV - Added safe area padding */}
      {currentView !== 'mission-detail' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-header-bg border-t border-border-panel z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
           
           {/* Context Menu Popover */}
           {isMobileContextOpen && (
             <div className="absolute bottom-full left-0 right-0 bg-surface border-t border-border-panel shadow-2xl animate-in slide-in-from-bottom-5 duration-200 mb-[env(safe-area-inset-bottom)]">
                <div className="p-2 grid grid-cols-2 gap-2">
                    {contexts.map(ctx => (
                        <button 
                            key={ctx}
                            onClick={() => { setActiveContext(ctx); setIsMobileContextOpen(false); }}
                            className={`flex items-center justify-between px-4 py-3 rounded-sm border text-[10px] font-black uppercase tracking-widest transition-colors ${
                                activeContext === ctx 
                                ? 'bg-brand-mint text-black border-brand-mint' 
                                : 'bg-bg-base text-text-secondary border-border-panel hover:bg-surface-hover'
                            }`}
                        >
                            {ctx}
                            {activeTaskCounts[ctx] > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${activeContext === ctx ? 'bg-black/20 text-black' : 'bg-surface text-brand-mint border border-border-panel'}`}>
                                    {activeTaskCounts[ctx]}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="bg-black/20 p-2 text-center" onClick={() => setIsMobileContextOpen(false)}>
                    <Icon name="expand_more" className="text-text-secondary" />
                </div>
             </div>
           )}

           {/* Context Indicator Bar */}
           <div 
             onClick={() => setIsMobileContextOpen(!isMobileContextOpen)}
             className="h-6 flex items-center justify-center gap-2 border-b border-border-panel/30 bg-surface/50 active:bg-surface cursor-pointer"
           >
             <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
               {activeContext}
             </span>
             <span className="text-[8px] font-bold text-brand-mint bg-brand-mint/10 px-1.5 rounded-sm border border-brand-mint/20">
                {activeTaskCounts[activeContext]}
             </span>
             <Icon name={isMobileContextOpen ? "expand_more" : "expand_less"} className="text-[10px] text-text-secondary" />
           </div>

           {/* More Menu Popover */}
           {isMobileMoreOpen && (
             <div className="absolute bottom-[60px] right-2 mb-[env(safe-area-inset-bottom)] bg-surface border border-border-panel rounded-md shadow-2xl py-1 min-w-[160px] animate-in zoom-in-95 origin-bottom-right duration-200">
                {[
                    { id: 'learning', icon: 'school', label: 'Aprendizado' },
                    { id: 'crm', icon: 'contacts', label: 'Rede (CRM)' },
                    { id: 'agents', icon: 'smart_toy', label: 'Agent Center' },
                    { id: 'settings', icon: 'settings', label: 'Configurações' }
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
                <Icon name="more_horiz" size="md" className={isMobileMoreOpen || ['learning', 'crm', 'agents', 'settings'].includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'} />
                <span className={`text-[8px] font-bold uppercase tracking-wide ${isMobileMoreOpen || ['learning', 'crm', 'agents', 'settings'].includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'}`}>Mais</span>
              </button>
           </div>
        </div>
      )}

      {/* Mission Modal */}
      {isMissionModalOpen && (
        <MissionModal onClose={() => setIsMissionModalOpen(false)} onSave={addTask} />
      )}
    </div>
  );
};

export default App;