import React, { useState } from 'react';
import { Task } from '../App';
import { Icon, Badge, Card, SectionLabel, StatusDot } from './ui';
import { cn } from '../utils/cn';

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick?: (taskId: number) => void;
  activeContext: string;
  onAddTask?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, setTasks, onTaskClick, activeContext, onAddTask }) => {
  // Widget States
  const [missionView, setMissionView] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [pointsView, setPointsView] = useState<'diario' | 'semanal'>('diario');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'team'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<Task['status']>('assigned');
  
  // Calculate Progress Stats (Global - uses 'tasks')
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  // Simulated stats for "Today" (Global)
  const todayTasksTotal = tasks.filter(t => t.id <= 10).length; 
  const todayTasksDone = tasks.filter(t => t.id <= 10 && t.status === 'done').length;

  // Unique tags for filter list
  const availableTags = Array.from(new Set(tasks.map(t => t.tag))).sort();

  // Filter Tasks based on Context AND Filter Type
  const contextTasks = activeContext === 'GERAL' 
    ? tasks 
    : tasks.filter(t => t.context === activeContext);

  const displayTasks = contextTasks.filter(task => {
    // 1. Assignee Filter
    if (activeFilter === 'mine' && task.assignee !== 'MA') return false;
    if (activeFilter === 'team' && task.assignee === 'MA') return false;
    
    // 2. Priority Filter
    if (priorityFilter && task.priority !== priorityFilter) return false;

    // 3. Tag Filter
    if (tagFilter && task.tag !== tagFilter) return false;

    return true; // 'all'
  });

  // Find Critical Mission for Side Feed (High Priority and not done)
  // Sort by ID (desc) to simulate finding the most recent high priority task
  const criticalMission = tasks.filter(t => t.priority === 'high' && t.status !== 'done').pop();
  
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
      case 'high': 
        return <Badge variant="red" size="xs"><Icon name="keyboard_double_arrow_up" className="text-[10px]" /> Alta</Badge>;
      case 'medium': 
        return <Badge variant="orange" size="xs"><Icon name="equal" className="text-[10px]" /> Média</Badge>;
      default: 
        return <Badge variant="blue" size="xs"><Icon name="keyboard_arrow_down" className="text-[10px]" /> Baixa</Badge>;
    }
  };

  const columns: { id: Task['status']; title: string; color: string; border: string }[] = [
    { id: 'assigned', title: 'Atribuídas', color: 'bg-slate-500', border: 'border-slate-500' },
    { id: 'started', title: 'Iniciadas', color: 'bg-accent-blue', border: 'border-accent-blue' },
    { id: 'in-progress', title: 'Em Andamento', color: 'bg-accent-orange', border: 'border-accent-orange' },
    { id: 'standby', title: 'Stand By', color: 'bg-yellow-500', border: 'border-yellow-500' },
    { id: 'done', title: 'Concluídas', color: 'bg-brand-mint', border: 'border-brand-mint' },
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
        <div className="p-4 border-b border-border-panel flex flex-col gap-3 z-10 bg-bg-base shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="layers" size="lg" className="text-brand-mint" />
              <div>
                  <SectionLabel className="text-[12px] tracking-[0.1em] text-text-primary">Fila de Missões</SectionLabel>
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
                      ? 'text-text-primary shadow-sm' 
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

          {/* Mini Header: Filters (Priority & Tags) */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
             {/* Priority Chips */}
             <div className="flex items-center gap-2 pr-4 border-r border-border-panel/50">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mr-1">Prioridade:</span>
                {[
                    { val: 'high', label: 'Alta', color: 'text-accent-red border-accent-red/30 bg-accent-red/10' },
                    { val: 'medium', label: 'Média', color: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10' },
                    { val: 'low', label: 'Baixa', color: 'text-accent-blue border-accent-blue/30 bg-accent-blue/10' }
                ].map(p => (
                    <button
                        key={p.val}
                        onClick={() => setPriorityFilter(priorityFilter === p.val ? null : p.val)}
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm border transition-all ${
                            priorityFilter === p.val 
                            ? p.color 
                            : 'text-text-secondary border-border-panel hover:text-text-primary bg-surface'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
             </div>

             {/* Tag Chips (Hidden on Mobile) */}
             <div className="hidden sm:flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mr-1">Tags:</span>
                {availableTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm border transition-all whitespace-nowrap ${
                            tagFilter === tag 
                            ? 'text-brand-mint border-brand-mint/30 bg-brand-mint/10' 
                            : 'text-text-secondary border-border-panel hover:text-text-primary bg-surface'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
             </div>
             
             {/* Clear Filters */}
             {(priorityFilter || tagFilter) && (
                 <button 
                    onClick={() => { setPriorityFilter(null); setTagFilter(null); }}
                    className="text-[9px] font-bold text-text-secondary hover:text-text-primary uppercase flex items-center gap-1 ml-auto"
                 >
                    <Icon name="close" className="text-[10px]" /> Limpar
                 </button>
             )}
          </div>

          {/* Column Selector (Mobile Only) */}
          <div className="flex gap-2 overflow-x-auto py-1 md:hidden no-scrollbar">
            {columns.map(col => {
                const count = displayTasks.filter(t => t.status === col.id).length;
                return (
                <button
                    key={col.id}
                    onClick={() => setActiveColumn(col.id)}
                    className={cn(
                    'px-3 py-1.5 text-[9px] font-black uppercase tracking-wide rounded-sm whitespace-nowrap border transition-colors flex items-center gap-1.5',
                    activeColumn === col.id
                        ? 'bg-surface border-brand-mint/30 text-brand-mint shadow-sm'
                        : 'border-border-panel text-text-secondary bg-header-bg'
                    )}
                >
                    {col.title} <span className={cn('px-1 rounded-sm text-[8px]', activeColumn === col.id ? 'bg-brand-mint/10 text-brand-mint' : 'bg-bg-base text-text-secondary')}>{count}</span>
                </button>
                );
            })}
          </div>
        </div>

        {/* KANBAN BOARD - Grid Layout for no scroll - Uses displayTasks (Context & Type filtered) */}
        <div className="flex-grow p-4 flex flex-col md:grid md:grid-cols-5 gap-3 h-full overflow-hidden">
          {columns.map((col) => (
            <div 
              key={col.id}
              className={cn(
                'flex flex-col gap-2 h-full min-w-0',
                activeColumn !== col.id && 'hidden md:flex'
              )}
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
              <div className="space-y-2 overflow-y-auto pr-1 pb-2 flex-grow scrollbar-thin transition-colors rounded flex flex-col">
                {displayTasks.filter(t => t.status === col.id).map(task => (
                  <Card 
                    key={task.id} 
                    interactive
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)} 
                    onClick={() => onTaskClick && onTaskClick(task.id)}
                    className={`p-3 group relative active:cursor-grabbing flex flex-col justify-between min-h-[120px] md:min-h-[140px]
                        ${col.id === 'assigned' ? 'hover:border-slate-500/50' : ''}
                        ${col.id === 'started' ? 'hover:border-accent-blue/50' : ''}
                        ${col.id === 'in-progress' ? 'hover:border-accent-orange/50' : ''}
                        ${col.id === 'standby' ? 'hover:border-yellow-500/50' : ''}
                        ${col.id === 'done' ? 'hover:border-brand-mint/50' : ''}
                    `}
                  >
                    
                    <div className="flex flex-col gap-2">
                        {/* Card Top: Priority & Menu */}
                        <div className="flex justify-between items-center">
                            {getPriorityBadge(task.priority)}
                            
                            {/* Context/Tag Badge inline with priority for cleaner look */}
                            <span className="text-[7px] font-bold text-text-secondary bg-bg-base px-1.5 py-0.5 rounded-sm border border-border-panel uppercase tracking-wide truncate max-w-[60px]">
                                {activeContext === 'GERAL' ? task.context : task.tag}
                            </span>
                        </div>

                        {/* Card Content: Title */}
                        <div>
                            <h4 className="text-[11px] font-bold text-text-primary leading-snug group-hover:text-text-primary transition-colors line-clamp-3" title={task.title}>
                                {task.title}
                            </h4>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Indicators Row */}
                        <div className="flex items-center gap-3 pt-2 border-t border-border-panel/30">
                            {/* Dependencies */}
                            {task.dependencies && task.dependencies > 0 ? (
                                <div className="flex items-center gap-1 text-accent-orange bg-accent-orange/10 px-1.5 py-0.5 rounded-sm border border-accent-orange/20" title={`${task.dependencies} Dependências`}>
                                    <Icon name="link" className="text-[10px]" />
                                    <span className="text-[8px] font-bold">{task.dependencies}</span>
                                </div>
                            ) : null}
                            
                            {/* Time Remaining Mock */}
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm border ${task.deadline === 'Hoje' ? 'text-accent-red bg-accent-red/10 border-accent-red/20' : 'text-text-secondary bg-bg-base border-border-panel'}`}>
                                <Icon name="schedule" className="text-[10px]" />
                                <span className="text-[8px] font-bold uppercase">{task.deadline}</span>
                            </div>
                        </div>

                        {/* Card Bottom: Assignee & Menu */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {task.assignee.startsWith('http') ? (
                                    <img src={task.assignee} className="size-5 rounded-full object-cover border border-border-panel" alt="Assignee" />
                                ) : (
                                    <div className="size-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white border border-border-panel">{task.assignee}</div>
                                )}
                            </div>
                            <button className="text-text-secondary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100">
                                <Icon name="more_horiz" className="text-[16px]" />
                            </button>
                        </div>
                    </div>

                  </Card>
                ))}
                
                {/* Empty State */}
                {displayTasks.filter(t => t.status === col.id).length === 0 && (
                  <div className="h-20 border-2 border-dashed border-border-panel rounded flex items-center justify-center text-[9px] text-text-secondary font-bold uppercase tracking-widest opacity-30">
                    Sem Tarefas
                  </div>
                )}

                {/* Contextual "Add Task" Button */}
                <button 
                    onClick={() => onAddTask && onAddTask()}
                    className="mt-2 w-full py-2 border border-dashed border-border-panel rounded hover:border-brand-mint/50 hover:bg-surface/50 text-text-secondary hover:text-brand-mint transition-all flex items-center justify-center gap-2 group opacity-60 hover:opacity-100"
                >
                    <Icon name="add" size="sm" className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Adicionar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM WIDGETS ROW - Global Stats (Uses total 'tasks', not 'displayTasks') */}
        <div className="h-auto md:h-40 shrink-0 border-t border-border-panel bg-header-bg p-4 md:p-6 flex flex-col md:flex-row gap-3 md:gap-4 overflow-y-auto md:overflow-y-hidden overflow-x-hidden md:overflow-x-auto no-scrollbar">
          
          {/* Widget 1: MISSÕES (Switchable) */}
          <Card 
            hover
            onClick={toggleMissionView}
            className="flex-1 p-4 flex flex-col justify-between min-w-0 md:min-w-[200px] group cursor-pointer"
          >
            <div className="flex justify-between items-start">
               <div className="flex flex-col gap-1">
                  <SectionLabel className="mb-1 text-text-secondary">Missões</SectionLabel>
                  <span className="bg-border-panel text-text-primary text-[9px] font-black uppercase px-2 py-1 rounded border border-surface-hover inline-block hover:bg-surface-hover transition-colors w-fit">
                    {missionView}
                  </span>
               </div>
               <div className="relative size-10 shrink-0">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                    <path stroke="var(--color-border-panel)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
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
          </Card>

          {/* Widget 2: STREAK */}
          <Card hover className="flex-1 p-4 flex items-center gap-4 min-w-0 md:min-w-[200px] cursor-pointer group">
            <div className="size-10 rounded-full bg-brand-flame/10 flex items-center justify-center shrink-0 border border-brand-flame/20 group-hover:scale-110 transition-transform">
              <Icon name="local_fire_department" className="text-brand-flame animate-pulse" />
            </div>
            <div>
              <SectionLabel className="mb-0.5 text-text-secondary">Streak</SectionLabel>
              <p className="text-xl font-black text-text-primary group-hover:text-brand-flame transition-colors">12 Dias</p>
              <p className="text-[8px] text-text-secondary mt-1">Sem perder prazos</p>
            </div>
          </Card>

          {/* Widget 3: PONTOS (Switchable) */}
          <Card hover className="flex-1 p-4 flex flex-col justify-between min-w-0 md:min-w-[200px] cursor-pointer group">
             <div className="flex justify-between items-start">
                <div className="size-8 rounded-full bg-accent-purple/10 flex items-center justify-center shrink-0 border border-accent-purple/20 group-hover:scale-110 transition-transform">
                  <Icon name="stars" size="lg" className="text-accent-purple" />
                </div>
                <div className="flex gap-1 bg-bg-base p-0.5 rounded border border-border-panel/50">
                    <button onClick={() => setPointsView('diario')} className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm transition-colors ${pointsView === 'diario' ? 'bg-surface text-accent-purple border border-border-panel shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Dia</button>
                    <button onClick={() => setPointsView('semanal')} className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-sm transition-colors ${pointsView === 'semanal' ? 'bg-surface text-accent-purple border border-border-panel shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Sem</button>
                </div>
             </div>
             <div>
                <SectionLabel className="mb-0.5 text-text-secondary">Pontos XP</SectionLabel>
                <div className="relative h-8 overflow-hidden">
                    <p className={`text-xl font-black text-text-primary group-hover:text-accent-purple transition-all duration-300 absolute top-0 ${pointsView === 'diario' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                        245 XP
                    </p>
                    <p className={`text-xl font-black text-text-primary group-hover:text-accent-purple transition-all duration-300 absolute top-0 ${pointsView === 'semanal' ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                        1.850 XP
                    </p>
                </div>
             </div>
          </Card>

          {/* Widget 4: PROGRESSO (Dual Bars - Global) */}
          <Card hover className="flex-1 p-4 flex flex-col justify-center gap-3 min-w-0 md:min-w-[200px] cursor-pointer group">
            
            {/* Hoje Bar */}
            <div className="space-y-1">
                <div className="flex justify-between items-end">
                    <SectionLabel className="text-text-secondary">Hoje</SectionLabel>
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
                    <SectionLabel className="text-text-secondary">Semana</SectionLabel>
                    <p className="text-[9px] font-black text-accent-blue">{completedTasks}/{totalTasks}</p>
                </div>
                <div className="w-full h-1 bg-bg-base rounded-full overflow-hidden border border-border-panel/30">
                    <div 
                        className="h-full bg-accent-blue transition-all duration-1000 ease-out" 
                        style={{width: `${(completedTasks/totalTasks)*100}%`}}
                    ></div>
                </div>
            </div>

          </Card>

        </div>
      </div>

      {/* RIGHT SIDEBAR (FEED) - Reorganized with Fixed Slots */}
      <aside className="w-80 border-l border-border-panel bg-header-bg flex flex-col shrink-0 z-10 hidden xl:flex overflow-hidden">
        
        {/* FIXED TOP SLOTS - "Sticky" area for Critical Items */}
        <div className="flex flex-col bg-bg-base border-b border-border-panel z-20 shadow-md shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-border-panel bg-surface/5">
                <SectionLabel className="text-brand-mint">Feed Ao Vivo</SectionLabel>
                <div className="flex items-center gap-2 bg-accent-red/10 px-2 py-1 border border-accent-red/20 rounded-sm animate-pulse mt-2">
                    <StatusDot color="red" />
                    <span className="text-[9px] font-black text-accent-red tracking-widest uppercase">Transmitindo</span>
                </div>
            </div>

            {/* Slot 1: Frank's Last Report */}
            <div className="p-4 border-b border-border-panel bg-surface/30">
                <Card className="bg-header-bg border-brand-mint/30 p-4 relative overflow-hidden shadow-[0_0_15px_rgba(0,255,149,0.05)] group hover:border-brand-mint/60">
                    <div className="absolute top-0 right-0 p-1.5 bg-brand-mint text-black rounded-bl-md">
                        <Icon name="smart_toy" size="sm" className="font-bold" />
                    </div>
                    <h4 className="text-[10px] font-black text-brand-mint uppercase tracking-wide mb-1">Último Relatório do Frank</h4>
                    <p className="text-[10px] text-text-secondary leading-snug mb-3 line-clamp-3">
                    "Otimização de recursos em 12%. Recomendo atenção às prioridades da coluna Leste. 2 novos leads identificados no CRM."
                    </p>
                    <button className="w-full bg-brand-mint/10 hover:bg-brand-mint/20 border border-brand-mint/20 rounded flex items-center justify-center p-1.5 transition-all text-[9px] font-bold text-brand-mint uppercase tracking-widest">
                        Ler Completo
                    </button>
                </Card>
            </div>

            {/* Slot 2: Critical Mission (Dynamic) */}
            {criticalMission && (
                <div className="p-4 border-b border-border-panel bg-accent-red/5">
                    <SectionLabel className="text-accent-red mb-2" icon="warning">Missão Crítica</SectionLabel>
                    <Card className="bg-bg-base border-accent-red/30 p-3 relative overflow-hidden group hover:border-accent-red/60 cursor-pointer" onClick={() => onTaskClick && onTaskClick(criticalMission.id)}>
                        <div className="flex justify-between items-start mb-1">
                             <Badge variant="red" size="xs">IMEDIATO</Badge>
                             <span className="text-[9px] font-bold text-text-secondary uppercase">{criticalMission.deadline}</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-text-primary leading-snug mb-2 group-hover:text-accent-red transition-colors">{criticalMission.title}</h4>
                        <div className="flex items-center gap-2">
                            <div className="size-4 rounded-full bg-indigo-500 text-[8px] flex items-center justify-center text-white font-bold">{criticalMission.assignee}</div>
                            <span className="text-[9px] text-text-secondary">{criticalMission.tag}</span>
                        </div>
                    </Card>
                </div>
            )}
        </div>

        {/* SCROLLABLE FEED AREA */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
             <SectionLabel className="text-text-secondary">Log de Atividades</SectionLabel>
             
             {/* Log Items */}
             <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-1.5 before:h-full before:w-px before:bg-border-panel">
                 {[
                    { time: '14:32', user: 'Frank', action: 'Atualizou status de infraestrutura', type: 'system' },
                    { time: '12:15', user: 'MA', action: 'Concluiu "Revisão de PR"', type: 'user' },
                    { time: '09:45', user: 'Agente E2', action: 'Novo lead qualificado no CRM', type: 'agent' },
                    { time: '08:00', user: 'System', action: 'Backup diário realizado', type: 'system' },
                 ].map((log, i) => (
                     <div key={i} className="relative">
                         <div className={`absolute -left-[19px] top-1.5 size-2.5 rounded-full border-2 border-bg-base ${
                             log.type === 'system' ? 'bg-text-secondary' : 
                             log.type === 'user' ? 'bg-brand-mint' : 'bg-accent-purple'
                         }`}></div>
                         <div className="flex justify-between items-start">
                             <span className="text-[10px] font-bold text-text-primary">{log.user}</span>
                             <span className="text-[9px] font-mono text-text-secondary">{log.time}</span>
                         </div>
                         <p className="text-[10px] text-text-secondary mt-0.5 leading-snug">{log.action}</p>
                     </div>
                 ))}
             </div>
             
             <div className="p-3 bg-surface border border-border-panel rounded-sm mt-4">
                 <div className="flex items-center gap-2 mb-2">
                     <Icon name="cloud_sync" size="sm" className="text-brand-mint" />
                     <span className="text-[10px] font-bold uppercase text-text-primary">Sincronização</span>
                 </div>
                 <div className="w-full bg-header-bg h-1.5 rounded-full overflow-hidden mb-1">
                     <div className="bg-brand-mint h-full w-[85%]"></div>
                 </div>
                 <div className="flex justify-between text-[9px] font-mono text-text-secondary">
                     <span>Google Workspace</span>
                     <span>85%</span>
                 </div>
             </div>

        </div>
        
        {/* // TODO: Mobile feed drawer */}
      </aside>

    </div>
  );
};

export default Dashboard;