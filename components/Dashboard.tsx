import React, { useState } from 'react';
import { Task } from '../App';

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick?: (taskId: number) => void;
  activeContext: string;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, setTasks, onTaskClick, activeContext }) => {
  // Widget States
  const [missionView, setMissionView] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [pointsView, setPointsView] = useState<'diario' | 'semanal'>('diario');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'team'>('all');
  
  // Calculate Progress Stats (Global - uses 'tasks')
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  // Simulated stats for "Today" (Global)
  const todayTasksTotal = tasks.filter(t => t.id <= 10).length; 
  const todayTasksDone = tasks.filter(t => t.id <= 10 && t.status === 'done').length;

  // Filter Tasks based on Context AND Filter Type
  const contextTasks = activeContext === 'GERAL' 
    ? tasks 
    : tasks.filter(t => t.context === activeContext);

  const displayTasks = contextTasks.filter(task => {
    if (activeFilter === 'mine') return task.assignee === 'MA'; // Assuming 'MA' is current user
    if (activeFilter === 'team') return task.assignee !== 'MA';
    return true; // 'all'
  });
  
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('taskId', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData('taskId'));
    
    if (!isNaN(id)) {
      setTasks((prevTasks) => 
        prevTasks.map(task => 
          task.id === id ? { ...task, status: newStatus } : task
        )
      );
    }
  };

  const toggleMissionView = () => {
    if (missionView === 'hoje') setMissionView('semana');
    else if (missionView === 'semana') setMissionView('mes');
    else setMissionView('hoje');
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'high': return <span className="text-[8px] text-[#FF453A] font-black uppercase tracking-wider bg-[#FF453A]/10 px-1.5 py-0.5 border border-[#FF453A]/20 rounded-sm flex items-center gap-1"><span className="material-symbols-outlined text-[8px]">keyboard_double_arrow_up</span> Alta</span>;
      case 'medium': return <span className="text-[8px] text-[#FF9F0A] font-black uppercase tracking-wider bg-[#FF9F0A]/10 px-1.5 py-0.5 border border-[#FF9F0A]/20 rounded-sm flex items-center gap-1"><span className="material-symbols-outlined text-[8px]">equal</span> Média</span>;
      default: return <span className="text-[8px] text-[#0A84FF] font-black uppercase tracking-wider bg-[#0A84FF]/10 px-1.5 py-0.5 border border-[#0A84FF]/20 rounded-sm flex items-center gap-1"><span className="material-symbols-outlined text-[8px]">keyboard_arrow_down</span> Baixa</span>;
    }
  };

  const columns: { id: Task['status']; title: string; color: string; border: string }[] = [
    { id: 'assigned', title: 'Atribuídas', color: 'bg-slate-500', border: 'border-slate-500' },
    { id: 'started', title: 'Iniciadas', color: 'bg-blue-500', border: 'border-blue-500' },
    { id: 'in-progress', title: 'Em Andamento', color: 'bg-orange-500', border: 'border-orange-500' },
    { id: 'standby', title: 'Stand By', color: 'bg-yellow-500', border: 'border-yellow-500' },
    { id: 'done', title: 'Concluídas', color: 'bg-[#00FF95]', border: 'border-[#00FF95]' },
  ];

  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'mine', label: 'Minhas' },
    { id: 'team', label: 'Time' },
  ];

  return (
    <div className="flex flex-row h-full overflow-hidden">
      {/* CENTRAL AREA */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
        
        {/* Mission Queue Header */}
        <div className="p-4 border-b border-border-panel flex flex-col gap-4 z-10 bg-bg-base shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-brand-mint text-lg">layers</span>
              <div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.1em] text-text-primary">Fila de Missões</h3>
                  <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">{activeContext}</p>
              </div>
            </div>
            
            {/* Filter Controls with Optimized Animation */}
            <div className="flex bg-header-bg p-1 rounded-md border border-border-panel hidden sm:flex relative">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id as any)}
                  className={`relative z-10 px-3 py-1 text-[9px] font-black rounded-sm uppercase tracking-tight transition-all duration-300 ${
                    activeFilter === filter.id 
                      ? 'text-white shadow-sm' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {activeFilter === filter.id && (
                    <span className="absolute inset-0 bg-surface border border-border-panel/40 rounded-sm -z-10 animate-in fade-in zoom-in-95 duration-200"></span>
                  )}
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KANBAN BOARD - Grid Layout for no scroll - Uses displayTasks (Context & Type filtered) */}
        <div className="flex-grow p-4 grid grid-cols-5 gap-3 h-full overflow-hidden">
          {columns.map((col) => (
            <div 
              key={col.id}
              className="flex flex-col gap-2 h-full min-w-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-1 border-b border-border-panel/50">
                <span className="text-[9px] font-black text-text-primary uppercase tracking-[0.05em] flex items-center gap-1.5 truncate">
                  <span className={`size-1.5 rounded-full shadow-[0_0_6px_rgba(0,0,0,0.6)] ${col.color}`}></span> 
                  {col.title}
                </span>
                <span className="text-[8px] text-text-secondary font-black bg-surface px-1.5 py-0.5 rounded border border-border-panel">
                  {displayTasks.filter(t => t.status === col.id).length}
                </span>
              </div>
              
              {/* Tasks Container */}
              <div className="space-y-2 overflow-y-auto pr-1 pb-2 flex-grow scrollbar-thin transition-colors rounded-lg">
                {displayTasks.filter(t => t.status === col.id).map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)} 
                    onClick={() => onTaskClick && onTaskClick(task.id)}
                    className={`p-2.5 bg-surface border rounded-md transition-all duration-200 cursor-pointer layered-card group relative active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg flex flex-col gap-2
                        ${col.id === 'assigned' ? 'border-border-card hover:border-slate-500/50' : ''}
                        ${col.id === 'started' ? 'border-border-card hover:border-blue-500/50' : ''}
                        ${col.id === 'in-progress' ? 'border-border-card hover:border-orange-500/50' : ''}
                        ${col.id === 'standby' ? 'border-border-card hover:border-yellow-500/50' : ''}
                        ${col.id === 'done' ? 'border-border-card hover:border-[#00FF95]/50' : ''}
                    `}
                  >
                    
                    {/* Card Top: Priority & Menu */}
                    <div className="flex justify-between items-center">
                      {getPriorityBadge(task.priority)}
                      <button className="text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[14px]">more_horiz</span>
                      </button>
                    </div>

                    {/* Card Content: Title */}
                    <div>
                        <h4 className="text-[10px] font-bold text-text-primary leading-tight group-hover:text-white transition-colors line-clamp-2">
                        {task.title}
                        </h4>
                    </div>

                    {/* Card Bottom: Meta Data */}
                    <div className="flex items-center justify-between pt-2 border-t border-border-panel/50 mt-1">
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1 text-[#8E8E93]" title="Deadline">
                                <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                                <span className="text-[8px] font-bold uppercase truncate max-w-[50px]">{task.deadline}</span>
                             </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {task.assignee.startsWith('http') ? (
                                <img src={task.assignee} className="size-4 rounded-full object-cover border border-border-panel" alt="Assignee" />
                            ) : (
                                <div className="size-4 rounded-full bg-indigo-500 flex items-center justify-center text-[7px] font-bold text-white border border-border-panel">{task.assignee}</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Context Badge (Optional, but good for GERAL view) */}
                    {activeContext === 'GERAL' && (
                        <div className="absolute top-2.5 right-8 opacity-0 group-hover:opacity-100 transition-opacity"> 
                           <span className="px-1.5 py-0.5 bg-bg-base border border-border-panel text-[7px] font-bold text-text-secondary uppercase rounded-sm shadow-sm">{task.context}</span>
                        </div>
                    )}
                    {activeContext !== 'GERAL' && (
                        <div className="absolute top-2.5 right-8 opacity-0 group-hover:opacity-100 transition-opacity"> 
                           <span className="px-1.5 py-0.5 bg-bg-base border border-border-panel text-[7px] font-bold text-text-secondary uppercase rounded-sm shadow-sm">{task.tag}</span>
                        </div>
                    )}

                  </div>
                ))}
                
                {/* Empty State */}
                {displayTasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="h-16 border-2 border-dashed border-border-panel rounded-lg flex items-center justify-center text-[9px] text-text-secondary font-bold uppercase tracking-widest opacity-30">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM WIDGETS ROW - Global Stats (Uses total 'tasks', not 'displayTasks') */}
        <div className="h-40 shrink-0 border-t border-border-panel bg-[#151515] p-6 flex gap-4 overflow-x-auto no-scrollbar">
          
          {/* Widget 1: MISSÕES (Switchable) */}
          <div 
            onClick={toggleMissionView}
            className="flex-1 bg-surface border border-border-card rounded p-4 flex flex-col justify-between min-w-[200px] hover:border-text-secondary/40 transition-colors group cursor-pointer"
          >
            <div className="flex justify-between items-start">
               <div className="flex flex-col gap-1">
                  <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-1">Missões</p>
                  <span className="bg-[#2A2A2A] text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-[#333] inline-block hover:bg-[#333] transition-colors">
                    {missionView}
                  </span>
               </div>
               <div className="relative size-10 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-border-panel" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                    <path className="text-brand-mint drop-shadow-[0_0_4px_rgba(0,255,149,0.5)] transition-all duration-500" 
                        strokeDasharray={`${missionView === 'hoje' ? '75' : missionView === 'semana' ? '45' : '90'}, 100`} 
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-text-primary">
                    {missionView === 'hoje' ? '75%' : missionView === 'semana' ? '45%' : '90%'}
                  </div>
               </div>
            </div>
            <p className="text-xl font-black text-text-primary mt-2">
                {missionView === 'hoje' ? '12/16' : missionView === 'semana' ? '34/75' : '112/125'}
            </p>
          </div>

          {/* Widget 2: STREAK */}
          <div className="flex-1 bg-surface border border-border-card rounded p-4 flex items-center gap-4 min-w-[200px] hover:border-text-secondary/40 transition-colors cursor-pointer group">
            <div className="size-10 rounded-full bg-brand-flame/10 flex items-center justify-center shrink-0 border border-brand-flame/20 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-brand-flame animate-pulse">local_fire_department</span>
            </div>
            <div>
              <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-0.5">Streak</p>
              <p className="text-xl font-black text-text-primary group-hover:text-brand-flame transition-colors">12 Dias</p>
              <p className="text-[8px] text-text-secondary mt-1">Sem perder prazos</p>
            </div>
          </div>

          {/* Widget 3: PONTOS (Switchable) */}
          <div className="flex-1 bg-surface border border-border-card rounded p-4 flex flex-col justify-between min-w-[200px] hover:border-text-secondary/40 transition-colors cursor-pointer group">
             <div className="flex justify-between items-start">
                <div className="size-8 rounded-full bg-accent-purple/10 flex items-center justify-center shrink-0 border border-accent-purple/20 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-accent-purple text-lg">stars</span>
                </div>
                <div className="flex gap-1 bg-bg-base p-0.5 rounded border border-border-panel/50">
                    <button onClick={() => setPointsView('diario')} className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm transition-colors ${pointsView === 'diario' ? 'bg-surface text-accent-purple border border-border-panel shadow-sm' : 'text-text-secondary hover:text-white'}`}>Dia</button>
                    <button onClick={() => setPointsView('semanal')} className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm transition-colors ${pointsView === 'semanal' ? 'bg-surface text-accent-purple border border-border-panel shadow-sm' : 'text-text-secondary hover:text-white'}`}>Sem</button>
                </div>
             </div>
             <div>
                <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-0.5">Pontos XP</p>
                <div className="relative h-8 overflow-hidden">
                    <p className={`text-xl font-black text-text-primary group-hover:text-accent-purple transition-all duration-300 absolute top-0 ${pointsView === 'diario' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                        245 XP
                    </p>
                    <p className={`text-xl font-black text-text-primary group-hover:text-accent-purple transition-all duration-300 absolute top-0 ${pointsView === 'semanal' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        1.850 XP
                    </p>
                </div>
             </div>
          </div>

          {/* Widget 4: PROGRESSO (Dual Bars - Global) */}
          <div className="flex-1 bg-surface border border-border-card rounded p-4 flex flex-col justify-center gap-3 min-w-[200px] hover:border-text-secondary/40 transition-colors cursor-pointer group">
            
            {/* Hoje Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Hoje</p>
                    <p className="text-[9px] font-black text-brand-mint">{todayTasksDone}/{todayTasksTotal}</p>
                </div>
                <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden border border-border-panel/30">
                    <div 
                        className="h-full bg-brand-mint transition-all duration-1000 ease-out group-hover:shadow-[0_0_8px_rgba(0,255,149,0.5)]" 
                        style={{width: `${(todayTasksDone/todayTasksTotal)*100}%`}}
                    ></div>
                </div>
            </div>

            {/* Semana Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Semana</p>
                    <p className="text-[9px] font-black text-accent-blue">{completedTasks}/{totalTasks}</p>
                </div>
                <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden border border-border-panel/30">
                    <div 
                        className="h-full bg-accent-blue transition-all duration-1000 ease-out" 
                        style={{width: `${(completedTasks/totalTasks)*100}%`}}
                    ></div>
                </div>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDEBAR (FEED) */}
      <aside className="w-80 border-l border-border-panel bg-header-bg flex-col shrink-0 z-10 hidden xl:flex">
        <div className="p-6 border-b border-border-panel flex items-center justify-between bg-surface/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-mint">Feed Ao Vivo</h3>
          <div className="flex items-center gap-2 bg-accent-red/10 px-2 py-1 border border-accent-red/20 rounded-sm animate-pulse">
            <span className="size-1.5 bg-accent-red rounded-full"></span>
            <span className="text-[9px] font-black text-accent-red tracking-widest uppercase">Transmitindo</span>
          </div>
        </div>

        <div className="p-6 border-b border-border-panel/50">
          <div className="bg-surface border border-brand-mint rounded-lg p-5 relative overflow-hidden shadow-[0_0_15px_rgba(0,255,149,0.1)] group">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-brand-mint/10 border border-brand-mint/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-brand-mint">smart_toy</span>
              </div>
              <div>
                <h4 className="text-[12px] font-black text-text-primary uppercase tracking-wide">Frank</h4>
                <p className="text-[10px] text-text-secondary font-medium">Briefing Diário</p>
              </div>
            </div>
            <p className="text-[11px] text-text-primary/90 leading-relaxed mb-4 italic">
              "Bom dia. Otimização de recursos aumentou em 12%. Recomendo atenção às prioridades da coluna Leste."
            </p>
            <button className="w-full bg-[#15151A] hover:bg-[#1E1E24] border border-border-panel rounded flex items-center justify-between p-2 group-hover:border-brand-mint/30 transition-all">
              <div className="flex items-center gap-2">
                <div className="size-6 bg-brand-mint text-black rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                </div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider group-hover:text-text-primary">Ouvir Áudio</span>
              </div>
              <div className="flex items-end gap-0.5 h-4">
                <div className="w-0.5 h-2 bg-brand-mint/40 rounded-full animate-pulse"></div>
                <div className="w-0.5 h-3 bg-brand-mint/60 rounded-full animate-pulse"></div>
                <div className="w-0.5 h-4 bg-brand-mint rounded-full animate-pulse"></div>
                <div className="w-0.5 h-2 bg-brand-mint/50 rounded-full animate-pulse"></div>
                <div className="w-0.5 h-3 bg-brand-mint/70 rounded-full animate-pulse"></div>
                <div className="w-0.5 h-1 bg-brand-mint/30 rounded-full animate-pulse"></div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          <div className="flex gap-4 relative group">
            <div className="absolute left-4 top-8 bottom-[-30px] w-[1px] bg-border-panel group-last:hidden"></div>
            <div className="size-8 rounded-sm bg-surface border border-border-panel shrink-0 flex items-center justify-center z-10 text-accent-red/70 group-hover:border-accent-red/30 transition-colors">
              <span className="material-symbols-outlined text-base">pause</span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-text-primary">Sistema PAUSADO</p>
              <p className="text-[10px] text-text-secondary leading-normal">Todos os agentes em espera via protocolo /pause</p>
              <p className="text-[9px] text-text-secondary/40 uppercase font-black pt-1 tracking-widest">15h atrás</p>
            </div>
          </div>

          <div className="flex gap-4 relative group">
            <div className="absolute left-4 top-8 bottom-[-30px] w-[1px] bg-border-panel group-last:hidden"></div>
            <div className="size-8 rounded-sm bg-surface border border-border-panel shrink-0 flex items-center justify-center z-10 text-brand-mint/70 group-hover:border-brand-mint/30 transition-colors">
              <span className="material-symbols-outlined text-base">task_alt</span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-text-primary">@Frank fez check-in</p>
              <p className="text-[10px] text-text-secondary leading-normal">Tarefas atribuídas completas. Auditoria anotada.</p>
              <p className="text-[9px] text-text-secondary/40 uppercase font-black pt-1 tracking-widest">Frank • 16h atrás</p>
            </div>
          </div>

          <div className="flex gap-4 relative group">
            <div className="size-8 rounded-sm bg-surface border border-border-panel shrink-0 flex items-center justify-center z-10 text-brand-mint/70 group-hover:border-brand-mint/30 transition-colors">
              <span className="material-symbols-outlined text-base">bolt</span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-text-primary">Otimização de Energia</p>
              <p className="text-[10px] text-text-secondary leading-normal">Redução de consumo em segundo plano.</p>
              <p className="text-[9px] text-text-secondary/40 uppercase font-black pt-1 tracking-widest">Sistema • 18h atrás</p>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-border-panel bg-header-bg space-y-2">
          <div className="flex items-center justify-between p-2 bg-surface border border-border-panel rounded-sm">
            <span className="text-[9px] font-bold text-text-secondary uppercase">Integridade</span>
            <span className="text-[9px] font-black text-brand-mint">100%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-surface border border-border-panel rounded-sm">
            <span className="text-[9px] font-bold text-text-secondary uppercase">Análise</span>
            <span className="text-[9px] font-black text-brand-mint">Ótimo</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Dashboard;