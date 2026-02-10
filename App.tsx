import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Finance from './components/Finance';
import Health from './components/Health';
import Learning from './components/Learning';
import CRM from './components/CRM';
import Settings from './components/Settings';
import MissionModal from './components/MissionModal';
import MissionDetail from './components/MissionDetail';

// Types
export type View = 'dashboard' | 'finance' | 'health' | 'learning' | 'crm' | 'settings' | 'mission-detail';
type UptimeView = '24H' | '7D' | '30D' | '90D' | '120D' | '365D';

export interface Task {
  id: number;
  title: string;
  tag: string;
  context: string; // New field for project separation
  status: 'assigned' | 'started' | 'in-progress' | 'standby' | 'done';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  assignee: string; // URL da imagem ou iniciais
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [uptime, setUptime] = useState(0); // Seconds in current session
  const [uptimeView, setUptimeView] = useState<UptimeView>('24H');
  const [activeContext, setActiveContext] = useState('GERAL');

  const contexts = ['GERAL', 'PESSOAL', 'PROJETO A', 'PROJETO B', 'PROJETO C'];

  // Shared State for Kanban (Simulated Database - Populated for 3-5 items per context)
  const [tasks, setTasks] = useState<Task[]>([
    // --- PESSOAL (5 tasks) ---
    { id: 1, title: 'Treino de Hipertrofia A', tag: 'SAÚDE', context: 'PESSOAL', status: 'assigned', priority: 'high', deadline: 'Hoje', assignee: 'MA' },
    { id: 2, title: 'Agendar check-up médico', tag: 'SAÚDE', context: 'PESSOAL', status: 'standby', priority: 'medium', deadline: 'Prox. Mês', assignee: 'MA' },
    { id: 3, title: 'Pagar fatura cartão Black', tag: 'FINANÇAS', context: 'PESSOAL', status: 'started', priority: 'high', deadline: 'Amanhã', assignee: 'MA' },
    { id: 4, title: 'Ler 20 pág. "Clean Code"', tag: 'ESTUDO', context: 'PESSOAL', status: 'done', priority: 'low', deadline: 'Ontem', assignee: 'MA' },
    { id: 5, title: 'Organizar Home Office', tag: 'CASA', context: 'PESSOAL', status: 'in-progress', priority: 'low', deadline: 'Fim de Semana', assignee: 'MA' },

    // --- PROJETO A - Tech/Dev (5 tasks) ---
    { id: 6, title: 'Definir Arquitetura AWS', tag: 'DEV', context: 'PROJETO A', status: 'assigned', priority: 'high', deadline: '10 Fev', assignee: 'https://i.pravatar.cc/150?u=1' },
    { id: 7, title: 'Refatoração da API de Login', tag: 'BACKEND', context: 'PROJETO A', status: 'in-progress', priority: 'high', deadline: 'Hoje', assignee: 'MA' },
    { id: 8, title: 'Deploy v2.4 em Staging', tag: 'DEVOPS', context: 'PROJETO A', status: 'done', priority: 'medium', deadline: 'Ontem', assignee: 'JP' },
    { id: 9, title: 'Design System Tokens', tag: 'DESIGN', context: 'PROJETO A', status: 'started', priority: 'medium', deadline: '12 Fev', assignee: 'https://i.pravatar.cc/150?u=2' },
    { id: 10, title: 'Code Review PR #402', tag: 'DEV', context: 'PROJETO A', status: 'assigned', priority: 'low', deadline: 'Hoje', assignee: 'MA' },

    // --- PROJETO B - Marketing (5 tasks) ---
    { id: 11, title: 'Briefing Campanha Q1', tag: 'MKT', context: 'PROJETO B', status: 'assigned', priority: 'medium', deadline: 'Amanhã', assignee: 'JP' },
    { id: 12, title: 'Análise de Concorrentes', tag: 'STRATEGY', context: 'PROJETO B', status: 'started', priority: 'low', deadline: '15 Fev', assignee: 'MA' },
    { id: 13, title: 'Gravação Vídeo Youtube', tag: 'SOCIAL', context: 'PROJETO B', status: 'in-progress', priority: 'medium', deadline: 'Hoje', assignee: 'https://i.pravatar.cc/150?u=4' },
    { id: 14, title: 'Copywriting Landing Page', tag: 'COPY', context: 'PROJETO B', status: 'standby', priority: 'high', deadline: 'Indef.', assignee: 'MA' },
    { id: 15, title: 'Newsletter Semanal', tag: 'MKT', context: 'PROJETO B', status: 'done', priority: 'medium', deadline: '2d atrás', assignee: 'https://i.pravatar.cc/150?u=5' },

    // --- PROJETO C - Gestão/Legal (5 tasks) ---
    { id: 16, title: 'Revisar Contrato Fornecedor', tag: 'JURÍDICO', context: 'PROJETO C', status: 'assigned', priority: 'high', deadline: '10 Fev', assignee: 'MA' },
    { id: 17, title: 'Reunião Investidores', tag: 'GESTÃO', context: 'PROJETO C', status: 'in-progress', priority: 'high', deadline: 'Amanhã', assignee: 'MA' },
    { id: 18, title: 'Aprovação Orçamento TI', tag: 'FINANÇAS', context: 'PROJETO C', status: 'standby', priority: 'medium', deadline: 'Pendente', assignee: 'JP' },
    { id: 19, title: 'Onboarding Novo Dev', tag: 'RH', context: 'PROJETO C', status: 'started', priority: 'medium', deadline: 'Hoje', assignee: 'JP' },
    { id: 20, title: 'Feedback Trimestral', tag: 'RH', context: 'PROJETO C', status: 'assigned', priority: 'low', deadline: '20 Fev', assignee: 'MA' },
  ]);

  // Uptime Timer Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cycleUptimeView = () => {
    const views: UptimeView[] = ['24H', '7D', '30D', '90D', '120D', '365D'];
    const currentIndex = views.indexOf(uptimeView);
    const nextIndex = (currentIndex + 1) % views.length;
    setUptimeView(views[nextIndex]);
  };

  const getDisplayUptime = () => {
    // Simulated historical data in seconds
    const historyBase = {
        '24H': 0, // Starts at 0 + session
        '7D': 345600, // ~4 days
        '30D': 1209600, // ~14 days
        '90D': 4320000, // ~50 days
        '120D': 6500000, // ~75 days
        '365D': 15000000 // ~173 days
    };

    const totalSeconds = uptime + historyBase[uptimeView];

    if (uptimeView === '24H') {
        const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    } else {
        // For longer periods, show hours/minutes
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        return `${h}h ${m}m`;
    }
  };

  const addTask = (newTask: any) => {
    // Simple adapter for the modal data to task data
    const adaptedTask: Task = {
        id: Date.now(),
        title: newTask.title,
        tag: newTask.tag || 'GERAL',
        context: activeContext === 'GERAL' ? 'PESSOAL' : activeContext, // Default to PERSONAL if in GENERAL, else current context
        status: 'assigned',
        priority: newTask.priority || 'medium',
        deadline: 'A definir',
        assignee: 'MA'
    };
    setTasks([...tasks, adaptedTask]);
    setIsMissionModalOpen(false);
  };

  const handleTaskClick = () => {
    setCurrentView('mission-detail');
  };

  return (
    <div className="flex h-screen w-full flex-col bg-bg-base text-text-primary overflow-hidden font-sans">
      
      {/* Hide global header only on mission-detail view if specifically requested */}
      {currentView !== 'mission-detail' && (
        <header className="h-16 bg-header-bg border-b border-border-panel px-6 flex items-center justify-between shrink-0 gap-8 z-30">
          <div className="flex items-center gap-10 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-primary text-2xl">grid_view</span>
              <h2 className="text-text-primary text-[10px] font-black tracking-widest uppercase">Marco OS</h2>
            </div>
            
            {/* Top Stats */}
            <div className="hidden md:flex items-center gap-6 border-l border-border-panel pl-6">
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-[0.1em]">Agentes</span>
                <span className="text-sm font-black text-text-primary">4</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-[0.1em]">Missões</span>
                <span className="text-sm font-black text-text-primary">12</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-text-secondary font-bold uppercase tracking-[0.1em]">Sequência</span>
                <span className="text-sm font-black text-text-primary">5</span>
              </div>
            </div>
          </div>

          {/* Search Bar - Square Style */}
          <div className="flex-grow max-w-xl relative hidden md:block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">search</span>
            <input 
              type="text" 
              placeholder="Buscar missões, agentes ou logs..." 
              className="w-full bg-[#08080A] border border-border-panel rounded-md pl-11 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder:text-text-secondary/40"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={() => setIsMissionModalOpen(true)}
              className="bg-brand-mint text-black px-5 py-2 pill-radius text-[11px] font-extrabold hover:bg-[#33ffaa] transition-all flex items-center gap-2 uppercase tracking-tight shadow-[0_0_15px_rgba(0,255,149,0.2)] hover:scale-105"
            >
              <span className="material-symbols-outlined text-base font-bold">add</span>
              Nova Missão
            </button>
            
            <div className="hidden lg:block h-8 w-[1px] bg-border-panel mx-2"></div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                {/* Clock: HH:MM only */}
                <p className="text-[11px] font-black text-text-primary leading-none">13:46</p>
                {/* Date: Green */}
                <p className="text-[9px] text-brand-mint font-bold uppercase mt-1 tracking-wider">05 FEV</p>
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
        
        {/* LEFT SIDEBAR */}
        {currentView !== 'mission-detail' && (
          <aside className="w-[220px] bg-header-bg border-r border-border-panel flex-col shrink-0 hidden md:flex z-10">
            <div className="flex-grow overflow-y-auto py-6">
              
              {/* Navigation */}
              <div className="px-4 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 px-3">Navegação</h3>
                <nav className="space-y-1">
                  {[
                    { id: 'dashboard', icon: 'dashboard', label: 'Central de Comando' },
                    { id: 'finance', icon: 'payments', label: 'Finanças' },
                    { id: 'health', icon: 'monitor_heart', label: 'Saúde' },
                    { id: 'learning', icon: 'school', label: 'Aprendizado' },
                    { id: 'crm', icon: 'contacts', label: 'Gestão de Contatos' },
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
                      <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="w-full h-[1px] bg-border-panel mb-6"></div>

              {/* Agents */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Agentes</h3>
                  <span className="text-[9px] font-bold text-text-secondary/50 bg-surface px-2 py-0.5 rounded-sm border border-border-panel">16</span>
                </div>
                
                <div className="space-y-2">
                  <div className="p-2 bg-surface border border-border-card rounded-md flex items-center gap-3 hover:border-brand-mint/30 cursor-pointer transition-all">
                    <div className="size-8 rounded-sm bg-accent-purple/10 flex items-center justify-center text-accent-purple shrink-0">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-text-primary truncate">Bhanu</p>
                        <span className="text-[7px] bg-accent-orange/10 text-accent-orange px-1 rounded-sm font-black border border-accent-orange/20">LÍDER</span>
                      </div>
                    </div>
                    <span className="size-1.5 bg-brand-mint rounded-full shadow-[0_0_8px_rgba(0,255,149,0.5)]"></span>
                  </div>

                  <div className="p-2 hover:bg-surface rounded-md flex items-center gap-3 transition-all cursor-pointer group">
                    <div className="size-8 rounded-sm bg-surface flex items-center justify-center text-text-secondary group-hover:text-text-primary border border-border-panel shrink-0">
                      <span className="material-symbols-outlined text-lg">engineering</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] font-bold text-text-primary">Friday</p>
                      <p className="text-[8px] text-text-secondary font-semibold uppercase tracking-tight">Dev Agent</p>
                    </div>
                    <span className="size-1.5 bg-brand-mint rounded-full shadow-[0_0_6px_rgba(0,255,149,0.4)]"></span>
                  </div>

                  <div className="flex items-center gap-3 px-2 py-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-md hover:bg-surface/50">
                     <div className="size-6 flex items-center justify-center"><span className="material-symbols-outlined text-base">visibility</span></div>
                     <span className="text-[10px] font-bold uppercase tracking-wide">Gavião</span>
                     <span className="ml-auto size-1.5 bg-brand-mint rounded-full"></span>
                  </div>

                  <div className="flex items-center gap-3 px-2 py-1.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer rounded-md hover:bg-surface/50">
                     <div className="size-6 flex items-center justify-center"><span className="material-symbols-outlined text-base">token</span></div>
                     <span className="text-[10px] font-bold uppercase tracking-wide">Groot</span>
                     <span className="ml-auto size-1.5 bg-brand-mint rounded-full"></span>
                  </div>

                  <button className="w-full mt-4 flex items-center gap-2 text-brand-mint hover:text-white transition-colors cursor-pointer py-2 px-1">
                    <span className="material-symbols-outlined text-base">add</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Agente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Uptime Counter - Leveled with Footer */}
            <div className="h-[72px] px-4 border-t border-border-panel bg-surface/10 flex flex-col justify-center shrink-0">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black text-text-secondary uppercase tracking-[0.1em]">
                  <button 
                    onClick={cycleUptimeView}
                    className="flex items-center gap-2 hover:text-brand-mint transition-colors group"
                    title="Alternar período de visualização"
                  >
                    <span className="material-symbols-outlined text-sm">timer</span> 
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
        <div className="flex-grow flex flex-col min-w-0 bg-bg-base relative overflow-hidden">
          <div className="flex-grow overflow-y-auto overflow-x-hidden flex flex-col">
            {currentView === 'dashboard' && <Dashboard tasks={tasks} setTasks={setTasks} onTaskClick={handleTaskClick} activeContext={activeContext} />}
            {currentView === 'finance' && <Finance />}
            {currentView === 'health' && <Health />}
            {currentView === 'learning' && <Learning />}
            {currentView === 'crm' && <CRM />}
            {currentView === 'settings' && <Settings />}
            {currentView === 'mission-detail' && <MissionDetail onBack={() => setCurrentView('dashboard')} />}
          </div>

          {/* FOOTER BAR (Appears on Dashboard) - Height fixed to 72px for alignment */}
          {currentView === 'dashboard' && (
            <footer className="h-[72px] border-t border-border-panel bg-header-bg px-6 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-4">
                {/* Context Switcher - Optimized Animation */}
                <div className="flex p-1 bg-bg-base rounded-md border border-border-panel overflow-x-auto max-w-[50vw] no-scrollbar relative">
                  {contexts.map((ctx) => (
                    <button 
                        key={ctx}
                        onClick={() => setActiveContext(ctx)}
                        className={`relative z-10 px-4 py-1.5 text-[10px] font-black rounded-sm uppercase tracking-tight transition-all duration-300 whitespace-nowrap ${
                            activeContext === ctx 
                            ? 'text-white shadow-sm' 
                            : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {activeContext === ctx && (
                            <span className="absolute inset-0 bg-surface border border-border-panel/40 rounded-sm -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
                        )}
                        {ctx}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 text-text-secondary hover:text-brand-mint transition-colors border-l border-border-panel sticky right-0 bg-bg-base z-20">
                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-8 hidden md:flex">
                 <p className="text-[9px] text-text-secondary/40 font-black tracking-[0.3em] uppercase">MARCO OS • CENTRAL DE COMANDO V1.0</p>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center p-0.5 bg-bg-base rounded-sm border border-border-panel">
                <button className="p-1.5 hover:text-white text-text-secondary transition-colors" title="Light Mode">
                    <span className="material-symbols-outlined text-sm">light_mode</span>
                </button>
                <button className="p-1.5 bg-surface text-brand-mint rounded-sm shadow-sm border border-border-panel/40 transition-colors" title="Dark Mode">
                    <span className="material-symbols-outlined text-sm">dark_mode</span>
                </button>
                <button className="p-1.5 hover:text-white text-text-secondary transition-colors" title="System Theme">
                    <span className="material-symbols-outlined text-sm">desktop_windows</span>
                </button>
              </div>
            </footer>
          )}
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      {currentView !== 'mission-detail' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-header-bg border-t border-border-panel z-50 flex items-center justify-around px-2">
           <button onClick={() => setCurrentView('dashboard')} className={`p-2 ${currentView === 'dashboard' ? 'text-brand-mint' : 'text-text-secondary'}`}><span className="material-symbols-outlined">dashboard</span></button>
           <button onClick={() => setCurrentView('finance')} className={`p-2 ${currentView === 'finance' ? 'text-brand-mint' : 'text-text-secondary'}`}><span className="material-symbols-outlined">payments</span></button>
           <button onClick={() => setIsMissionModalOpen(true)} className="size-10 bg-brand-mint rounded-full text-black flex items-center justify-center -mt-6 border-4 border-bg-base shadow-lg"><span className="material-symbols-outlined font-bold">add</span></button>
           <button onClick={() => setCurrentView('health')} className={`p-2 ${currentView === 'health' ? 'text-brand-mint' : 'text-text-secondary'}`}><span className="material-symbols-outlined">monitor_heart</span></button>
           <button onClick={() => setCurrentView('crm')} className={`p-2 ${currentView === 'crm' ? 'text-brand-mint' : 'text-text-secondary'}`}><span className="material-symbols-outlined">contacts</span></button>
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