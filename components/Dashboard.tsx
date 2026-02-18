import React, { useState, useMemo } from 'react';
import { Task, Project } from '../App';
import type { StoredEvent } from '../data/models';
import { Icon, Badge, Card, SectionLabel } from './ui';
import { cn } from '../utils/cn';
import AgendaWidget from './AgendaWidget';
import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskClick?: (taskId: number) => void;
  activeProjectId: string;
  projects: Project[];
  onAddTask?: () => void;
  events: StoredEvent[];
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, setTasks, onTaskClick, activeProjectId, projects, onAddTask, events, setEvents }) => {
  const activeProject = projects.find(p => p.id === activeProjectId);
  // Quick Capture
  const [quickCapture, setQuickCapture] = useState('');
  const handleQuickCapture = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickCapture.trim()) {
      setTasks(prev => [...prev, {
        id: Date.now(),
        title: quickCapture.trim(),
        tag: 'GERAL',
        projectId: activeProjectId,
        status: 'assigned' as const,
        priority: 'medium' as const,
        deadline: 'A definir',
        assignee: 'MA',
        dependencies: 0,
      }]);
      setQuickCapture('');
    }
  };
  // Widget States
  const [missionView, setMissionView] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [pointsView, setPointsView] = useState<'diario' | 'semanal'>('diario');
  const [focusMode, setFocusMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'team'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<Task['status']>('assigned');
  const [collapsedCols, setCollapsedCols] = useState<Set<Task['status']>>(new Set());

  const toggleCollapse = (colId: Task['status']) => {
    setCollapsedCols(prev => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      return next;
    });
  };

  // Calculate Progress Stats (Global - uses 'tasks')
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  // Simulated stats for "Today" (Global)
  const todayTasksTotal = tasks.filter(t => t.id <= 10).length;
  const todayTasksDone = tasks.filter(t => t.id <= 10 && t.status === 'done').length;

  // Unique tags for filter list
  const availableTags = Array.from(new Set(tasks.map(t => t.tag))).sort();

  // Filter Tasks based on active project
  const contextTasks = tasks.filter(t => t.projectId === activeProjectId);

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
  const criticalMission = tasks.filter(t => t.priority === 'high' && t.status !== 'done').pop();

  // Focus Mode: next task to focus on (highest priority, not done, in active project)
  const focusTask = contextTasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const prio: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (prio[a.priority] ?? 2) - (prio[b.priority] ?? 2);
    })[0] || null;

  // Gamification: achievements
  const achievements = [
    { id: 'first-blood', icon: 'military_tech', label: 'First Blood', desc: 'Completou a 1a tarefa', unlocked: completedTasks >= 1 },
    { id: 'streak-7', icon: 'local_fire_department', label: 'Semana de Fogo', desc: '7 dias sem perder prazo', unlocked: true },
    { id: 'centurion', icon: 'shield', label: 'Centuri\u00e3o', desc: '100 tasks completadas', unlocked: completedTasks >= 5 },
    { id: 'multitask', icon: 'hub', label: 'Multitarefa', desc: '3+ tasks em andamento', unlocked: contextTasks.filter(t => t.status === 'in-progress').length >= 2 },
    { id: 'clean-slate', icon: 'auto_awesome', label: 'Tela Limpa', desc: 'Zero no backlog', unlocked: contextTasks.filter(t => t.status === 'assigned').length === 0 },
    { id: 'early-bird', icon: 'wb_sunny', label: 'Early Bird', desc: 'Tarefa antes do prazo', unlocked: true },
  ];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  // XP calculation
  const xpPerComplete = 50;
  const xpPerHighPrio = 30;
  const xpStreak = 12 * 15; // 12-day streak * 15xp/day
  const xpTasks = completedTasks * xpPerComplete + tasks.filter(t => t.priority === 'high' && t.status === 'done').length * xpPerHighPrio;
  const totalXP = xpTasks + xpStreak;
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const xpToNext = 500;

  // ─── CHART DATA ───
  const statusChartData = useMemo(() => {
    const statusMap: Record<Task['status'], number> = {
      'assigned': 0,
      'started': 0,
      'in-progress': 0,
      'standby': 0,
      'done': 0,
    };
    contextTasks.forEach(t => { statusMap[t.status]++; });
    return [
      { name: 'Atrib.', count: statusMap['assigned'], fill: '#64748b' },
      { name: 'Inic.', count: statusMap['started'], fill: '#0A84FF' },
      { name: 'Andam.', count: statusMap['in-progress'], fill: '#FF9F0A' },
      { name: 'Stand.', count: statusMap['standby'], fill: '#EAB308' },
      { name: 'Done', count: statusMap['done'], fill: '#00FF95' },
    ];
  }, [contextTasks]);

  const weeklyActivityData = useMemo(() => [
    { day: 'Seg', tasks: 2 },
    { day: 'Ter', tasks: 5 },
    { day: 'Qua', tasks: 3 },
    { day: 'Qui', tasks: 7 },
    { day: 'Sex', tasks: 4 },
    { day: 'S\u00e1b', tasks: 6 },
    { day: 'Dom', tasks: 1 },
  ], []);

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: '#1C1C1C',
      border: '1px solid #2A2A2A',
      borderRadius: '4px',
      fontSize: '10px',
      color: '#E1E1E1',
    },
    itemStyle: { color: '#E1E1E1' },
    labelStyle: { color: '#8E8E93', fontSize: '9px', fontWeight: 700 },
  };

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

  const getPriorityPill = (priority: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      high: { label: 'P0', bg: 'bg-accent-red', text: 'text-white' },
      medium: { label: 'P1', bg: 'bg-accent-orange', text: 'text-white' },
      low: { label: 'P2', bg: 'bg-text-secondary/40', text: 'text-white' },
    };
    const c = config[priority] || config.low;
    return (
      <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black shrink-0', c.bg, c.text)}>
        {c.label}
      </span>
    );
  };

  // Generate a fake timestamp based on task ID for display
  const getTaskTimestamp = (task: Task) => {
    const base = new Date('2026-02-16T20:00:00Z');
    base.setMinutes(base.getMinutes() + task.id * 17);
    return base.toISOString().replace(/\.\d{3}Z/, 'Z');
  };

  // Map deadline to colored info line
  const getDeadlineColor = (deadline: string) => {
    if (deadline === 'Hoje') return 'text-accent-red';
    if (deadline === 'Amanh\u00e3') return 'text-accent-orange';
    if (deadline === 'Ontem' || deadline.includes('atr\u00e1s')) return 'text-brand-mint';
    return 'text-text-secondary';
  };

  const columns: { id: Task['status']; title: string; color: string; border: string; icon: string; variant: 'neutral' | 'blue' | 'orange' | 'purple' | 'mint' | 'red' }[] = [
    { id: 'assigned', title: 'Atribu\u00eddas', color: 'bg-slate-500', border: 'border-slate-500', icon: 'inbox', variant: 'neutral' },
    { id: 'started', title: 'Iniciadas', color: 'bg-accent-blue', border: 'border-accent-blue', icon: 'play_circle', variant: 'blue' },
    { id: 'in-progress', title: 'Em Andamento', color: 'bg-accent-orange', border: 'border-accent-orange', icon: 'autorenew', variant: 'orange' },
    { id: 'standby', title: 'Stand By', color: 'bg-yellow-500', border: 'border-yellow-500', icon: 'pause_circle', variant: 'purple' },
    { id: 'done', title: 'Conclu\u00eddas', color: 'bg-brand-mint', border: 'border-brand-mint', icon: 'check_circle', variant: 'mint' },
  ];

  const prioPillColor: Record<string, string> = {
    high: 'bg-accent-red/60',
    medium: 'bg-accent-orange/60',
    low: 'bg-text-secondary/30',
  };

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
                  <SectionLabel className="text-[12px] tracking-[0.1em] text-text-primary">Fila de Miss\u00f5es</SectionLabel>
                  <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
                    {activeProject && (
                      <span className="size-1.5 rounded-full inline-block" style={{ backgroundColor: activeProject.color }}></span>
                    )}
                    {activeProject?.name ?? '\u2013'}
                  </p>
              </div>
            </div>

            {/* Quick Capture */}
            <div className="flex-grow max-w-sm relative hidden sm:block">
              <Icon name="bolt" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-mint" />
              <input
                type="text"
                value={quickCapture}
                onChange={e => setQuickCapture(e.target.value)}
                onKeyDown={handleQuickCapture}
                placeholder="Captura r\u00e1pida\u2026 Enter para criar"
                className="w-full bg-bg-base border border-border-panel rounded-md pl-9 pr-3 py-2 text-[11px] text-text-primary focus:outline-none focus:border-brand-mint/50 transition-colors placeholder:text-text-secondary/40"
              />
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
                    { val: 'medium', label: 'M\u00e9dia', color: 'text-accent-orange border-accent-orange/30 bg-accent-orange/10' },
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

        {/* KANBAN BOARD \u2014 Clean design matching AgentKanban */}
        <div className="flex-grow p-4 flex gap-3 h-full overflow-hidden">
          {columns.map((col) => {
            const colTasks = displayTasks.filter(t => t.status === col.id);
            const isCollapsed = collapsedCols.has(col.id);

            if (isCollapsed) {
              return (
                <div
                  key={col.id}
                  className="w-12 shrink-0 bg-bg-base rounded-lg border border-border-panel hidden md:flex flex-col items-center py-3 gap-3 cursor-pointer hover:border-text-secondary/30 transition-all"
                  onClick={() => toggleCollapse(col.id)}
                >
                  <Icon name="chevron_right" size="xs" className="text-text-secondary" />
                  <Badge variant={col.variant} size="xs">{colTasks.length}</Badge>
                  <span
                    className="text-[8px] font-black uppercase tracking-widest text-text-secondary"
                    style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
                  >
                    {col.title}
                  </span>
                  <div className="flex flex-col gap-1 mt-auto px-1.5 w-full">
                    {colTasks.slice(0, 6).map((task) => (
                      <div
                        key={task.id}
                        className={cn('h-[3px] rounded-full w-full', prioPillColor[task.priority] || 'bg-text-secondary/30')}
                        title={task.title}
                      />
                    ))}
                    {colTasks.length > 6 && (
                      <span className="text-[7px] text-text-secondary text-center">+{colTasks.length - 6}</span>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={col.id}
                className={cn(
                  'flex-1 flex flex-col gap-2 min-w-0 transition-all duration-200',
                  activeColumn !== col.id && 'hidden md:flex'
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => toggleCollapse(col.id)}
                    className="p-0.5 rounded hover:bg-surface transition-colors text-text-secondary hover:text-text-primary hidden md:block"
                  >
                    <Icon name="expand_more" size="xs" />
                  </button>
                  <Icon name={col.icon} size="xs" className="text-text-secondary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                    {col.title}
                  </span>
                  <Badge variant={col.variant} size="xs">{colTasks.length}</Badge>
                </div>

                {/* Column Body */}
                <div className="flex flex-col gap-2 flex-grow bg-bg-base rounded-lg border border-border-panel p-2 overflow-y-auto scrollbar-thin">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-2 text-text-secondary py-8">
                      <Icon name="inbox" size="md" />
                      <span className="text-[10px]">Sem tarefas</span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <Card
                        key={task.id}
                        className="p-4 space-y-2 cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskClick && onTaskClick(task.id)}
                      >
                        {/* Title + Priority Pill */}
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[13px] text-text-primary font-medium leading-snug">
                            {task.title}
                          </span>
                          {getPriorityPill(task.priority)}
                        </div>

                        {/* Info lines */}
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-text-secondary leading-relaxed">{task.tag}</p>
                          {task.deadline && task.deadline !== 'A definir' && (
                            <p className={cn('text-[11px] leading-relaxed', getDeadlineColor(task.deadline))}>
                              {task.deadline === 'Hoje' ? 'Prazo: Hoje \u2014 urgente'
                                : task.deadline === 'Amanh\u00e3' ? 'Prazo: Amanh\u00e3'
                                : task.deadline === 'Ontem' ? 'Conclu\u00eddo ontem'
                                : task.deadline.includes('atr\u00e1s') ? `Finalizado ${task.deadline}`
                                : `Prazo: ${task.deadline}`}
                            </p>
                          )}
                        </div>

                        {/* Timestamp */}
                        <p className="text-[11px] font-mono text-text-secondary/60 pt-0.5">
                          {getTaskTimestamp(task)}
                        </p>
                      </Card>
                    ))
                  )}

                  {/* Add Task Button */}
                  <button
                    onClick={() => onAddTask && onAddTask()}
                    className="flex items-center justify-center gap-1 py-1.5 rounded text-text-secondary/40 hover:text-brand-mint hover:bg-brand-mint/5 transition-colors"
                  >
                    <Icon name="add" size="xs" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Adicionar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PANEL \u2014 Gamification + Focus Mode */}
        <div className="shrink-0 border-t border-border-panel bg-header-bg">

          {/* \u2500\u2500\u2500 FOCUS MODE OVERLAY \u2500\u2500\u2500 */}
          {focusMode && focusTask && (
            <div className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="w-full max-w-lg space-y-6">
                {/* Focus header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-brand-mint/10 border border-brand-mint/30 flex items-center justify-center">
                      <Icon name="center_focus_strong" size="md" className="text-brand-mint" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-brand-mint uppercase tracking-widest">Focus Mode</h2>
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest">Uma tarefa. Sem distra\u00e7\u00f5es.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFocusMode(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-sm border border-border-panel text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Icon name="close" size="xs" />
                    Sair
                  </button>
                </div>

                {/* The ONE task */}
                <Card className="p-6 border-brand-mint/20 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-black text-text-primary leading-snug">{focusTask.title}</h3>
                    {getPriorityPill(focusTask.priority)}
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="neutral" size="sm">{focusTask.tag}</Badge>
                    <span className={cn(
                      'text-[10px] font-bold',
                      focusTask.deadline === 'Hoje' ? 'text-accent-red' : 'text-text-secondary'
                    )}>
                      {focusTask.deadline}
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="flex items-center gap-1.5 pt-2">
                    {columns.map((col, i) => {
                      const currentIdx = columns.findIndex(c => c.id === focusTask.status);
                      const isActive = i <= currentIdx;
                      const isCurrent = col.id === focusTask.status;
                      return (
                        <React.Fragment key={col.id}>
                          <button
                            onClick={() => { setTasks(prev => prev.map(t => t.id === focusTask.id ? { ...t, status: col.id } : t)); }}
                            className={cn(
                              'size-8 rounded-sm border flex items-center justify-center transition-all shrink-0',
                              isCurrent
                                ? 'bg-brand-mint/10 border-brand-mint/30 text-brand-mint scale-110'
                                : isActive
                                  ? 'bg-surface border-border-panel text-text-primary hover:border-brand-mint/20'
                                  : 'bg-bg-base border-border-panel/50 text-text-secondary/30 hover:text-text-secondary hover:border-border-panel'
                            )}
                            title={col.title}
                          >
                            <Icon name={col.icon} size="xs" />
                          </button>
                          {i < columns.length - 1 && (
                            <div className={cn('flex-1 h-[2px] rounded-full', i < currentIdx ? 'bg-brand-mint/40' : 'bg-border-panel')} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-2 pt-2">
                    {focusTask.status !== 'done' ? (
                      <button
                        onClick={() => setTasks(prev => prev.map(t => t.id === focusTask.id ? { ...t, status: 'done' } : t))}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-mint text-black rounded-sm text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                      >
                        <Icon name="check_circle" size="xs" />
                        Concluir Tarefa
                      </button>
                    ) : (
                      <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[10px] font-black uppercase tracking-widest">
                        <Icon name="check_circle" size="xs" />
                        Conclu\u00edda!
                      </div>
                    )}
                    <button
                      onClick={() => onTaskClick && onTaskClick(focusTask.id)}
                      className="flex items-center justify-center gap-1.5 px-4 py-3 border border-border-panel text-text-secondary rounded-sm text-[10px] font-bold uppercase tracking-widest hover:text-text-primary hover:border-text-secondary/30 transition-colors"
                    >
                      <Icon name="open_in_new" size="xs" />
                      Detalhes
                    </button>
                  </div>
                </Card>

                {/* Mini stats in focus */}
                <div className="flex items-center justify-center gap-6 text-text-secondary/60">
                  <div className="flex items-center gap-1.5">
                    <Icon name="local_fire_department" size="xs" className="text-brand-flame" />
                    <span className="text-[9px] font-black">12 dias streak</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="stars" size="xs" className="text-accent-purple" />
                    <span className="text-[9px] font-black">{totalXP} XP</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="layers" size="xs" />
                    <span className="text-[9px] font-black">{contextTasks.filter(t => t.status !== 'done').length} restantes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* \u2500\u2500\u2500 GAMIFICATION BAR \u2500\u2500\u2500 */}
          <div className="p-4 md:p-5 flex flex-col gap-4">

            {/* Row 1: XP + Level + Streak + Focus toggle */}
            <div className="flex flex-col md:flex-row gap-3">

              {/* XP & Level */}
              <Card className="flex-[2] p-4">
                <div className="flex items-center gap-4">
                  {/* Level badge */}
                  <div className="relative shrink-0">
                    <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
                      <path stroke="var(--color-border-panel)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" />
                      <path
                        className="text-accent-purple drop-shadow-[0_0_6px_rgba(191,90,242,0.5)] transition-all duration-1000"
                        strokeDasharray={`${(xpInLevel / xpToNext) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-accent-purple">{level}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Level {level}</span>
                      <span className="text-[8px] font-mono text-text-secondary/60">{xpInLevel}/{xpToNext} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-base rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-accent-purple/60 to-accent-purple rounded-full transition-all duration-1000"
                        style={{ width: `${(xpInLevel / xpToNext) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Icon name="stars" size="xs" className="text-accent-purple" />
                        <span className="text-xs font-black text-text-primary">{totalXP} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="task_alt" size="xs" className="text-brand-mint" />
                        <span className="text-[9px] font-bold text-text-secondary">{completedTasks} completadas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Streak */}
              <Card className="flex-1 p-4 group cursor-pointer" onClick={toggleMissionView}>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-brand-flame/10 flex items-center justify-center shrink-0 border border-brand-flame/20 group-hover:scale-110 transition-transform">
                    <Icon name="local_fire_department" className="text-brand-flame animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary block">Streak</span>
                    <p className="text-xl font-black text-text-primary group-hover:text-brand-flame transition-colors leading-none mt-0.5">12</p>
                    <p className="text-[8px] text-text-secondary mt-0.5">dias consecutivos</p>
                  </div>
                </div>
                {/* Mini week display */}
                <div className="flex items-center gap-1 mt-3">
                  {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                    <div key={i} className={cn(
                      'flex-1 h-5 rounded-sm flex items-center justify-center text-[7px] font-black',
                      i < 5 ? 'bg-brand-flame/20 text-brand-flame' : i === 5 ? 'bg-brand-flame/10 text-brand-flame/60 border border-dashed border-brand-flame/30' : 'bg-bg-base text-text-secondary/30 border border-border-panel/50'
                    )}>
                      {day}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Focus Mode toggle */}
              <Card
                className={cn(
                  'flex-1 p-4 cursor-pointer transition-all',
                  focusMode ? 'border-brand-mint/30 bg-brand-mint/[0.03]' : 'hover:border-brand-mint/20'
                )}
                onClick={() => setFocusMode(!focusMode)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'size-10 rounded-full flex items-center justify-center shrink-0 border transition-all',
                    focusMode
                      ? 'bg-brand-mint/20 border-brand-mint/40 text-brand-mint'
                      : 'bg-surface border-border-panel text-text-secondary'
                  )}>
                    <Icon name="center_focus_strong" size="md" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary block">Focus Mode</span>
                    <p className={cn('text-[10px] font-bold mt-0.5', focusMode ? 'text-brand-mint' : 'text-text-primary')}>
                      {focusMode ? 'ATIVO' : 'Desativado'}
                    </p>
                  </div>
                </div>
                {focusTask && !focusMode && (
                  <div className="bg-bg-base rounded-sm p-2 border border-border-panel/50">
                    <p className="text-[9px] text-text-secondary truncate">Pr\u00f3xima: <span className="text-text-primary font-medium">{focusTask.title}</span></p>
                  </div>
                )}
                {focusMode && (
                  <div className="bg-brand-mint/5 rounded-sm p-2 border border-brand-mint/20">
                    <p className="text-[9px] text-brand-mint font-bold">Focado em 1 tarefa</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Row 1.5: Productivity Analytics Charts */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="monitoring" size="xs" className="text-brand-mint" />
                <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Produtividade</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3">

                {/* Chart 1: Task Distribution by Status */}
                <Card className="flex-1 p-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-2">Tarefas por Status</span>
                  <div style={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} barCategoryGap="20%">
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 8, fill: '#8E8E93' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                          contentStyle={chartTooltipStyle.contentStyle}
                          itemStyle={chartTooltipStyle.itemStyle}
                          labelStyle={chartTooltipStyle.labelStyle}
                        />
                        <Bar
                          dataKey="count"
                          radius={[3, 3, 0, 0]}
                          isAnimationActive={true}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Chart 2: Weekly Activity */}
                <Card className="flex-1 p-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-2">Atividade Semanal</span>
                  <div style={{ width: '100%', height: 120 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyActivityData}>
                        <defs>
                          <linearGradient id="mintGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00FF95" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#00FF95" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          tick={{ fontSize: 8, fill: '#8E8E93' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip
                          cursor={{ stroke: '#00FF95', strokeWidth: 1, strokeDasharray: '3 3' }}
                          contentStyle={chartTooltipStyle.contentStyle}
                          itemStyle={chartTooltipStyle.itemStyle}
                          labelStyle={chartTooltipStyle.labelStyle}
                        />
                        <Area
                          type="monotone"
                          dataKey="tasks"
                          stroke="#00FF95"
                          strokeWidth={2}
                          fill="url(#mintGradient)"
                          dot={{ r: 3, fill: '#00FF95', stroke: '#1C1C1C', strokeWidth: 2 }}
                          activeDot={{ r: 4, fill: '#00FF95', stroke: '#1C1C1C', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </div>
            </div>

            {/* Row 2: Achievements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5">
                  <Icon name="emoji_events" size="xs" className="text-accent-orange" />
                  Conquistas
                </span>
                <span className="text-[8px] font-mono text-text-secondary">{unlockedCount}/{achievements.length}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {achievements.map(a => (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-sm border shrink-0 transition-all',
                      a.unlocked
                        ? 'bg-surface border-accent-orange/20 hover:border-accent-orange/40'
                        : 'bg-bg-base border-border-panel/50 opacity-40'
                    )}
                  >
                    <Icon
                      name={a.icon}
                      size="xs"
                      className={a.unlocked ? 'text-accent-orange' : 'text-text-secondary/40'}
                    />
                    <div>
                      <p className={cn('text-[9px] font-bold leading-none', a.unlocked ? 'text-text-primary' : 'text-text-secondary/40')}>{a.label}</p>
                      <p className="text-[7px] text-text-secondary/60 leading-none mt-0.5">{a.desc}</p>
                    </div>
                    {a.unlocked && <Icon name="check_circle" size="xs" className="text-brand-mint shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <aside className="w-72 border-l border-border-panel bg-header-bg flex flex-col shrink-0 z-10 hidden xl:flex overflow-hidden">

        {/* Smart Functions */}
        <div className="p-4 border-b border-border-panel shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
            <Icon name="auto_awesome" size="xs" className="text-brand-mint" />
            A\u00e7\u00f5es R\u00e1pidas
          </span>
          <div className="space-y-1">
            {[
              { icon: 'summarize', label: 'Briefing Di\u00e1rio', desc: 'Resumo do dia pelo Frank' },
              { icon: 'mail', label: 'Triar Inbox', desc: 'Escanear emails pendentes' },
              { icon: 'monitor_heart', label: 'Health Check', desc: 'Checar status dos sistemas' },
              { icon: 'sync', label: 'Sync Mem\u00f3ria', desc: 'Destilar mem\u00f3rias recentes' },
              { icon: 'bolt', label: 'Task R\u00e1pida', desc: 'Criar e delegar tarefa' },
            ].map((fn, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm hover:bg-surface border border-transparent hover:border-border-panel transition-all group text-left"
              >
                <div className="size-7 rounded-sm bg-brand-mint/5 border border-brand-mint/10 flex items-center justify-center shrink-0 group-hover:border-brand-mint/30 transition-colors">
                  <Icon name={fn.icon} size="xs" className="text-brand-mint" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-text-primary group-hover:text-brand-mint transition-colors">{fn.label}</p>
                  <p className="text-[8px] text-text-secondary truncate">{fn.desc}</p>
                </div>
                <Icon name="chevron_right" size="xs" className="text-text-secondary/30 group-hover:text-brand-mint transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Agenda */}
        <div className="p-4 border-b border-border-panel shrink-0">
          <AgendaWidget events={events} setEvents={setEvents} activeProjectId={activeProjectId} />
        </div>

        {/* Critical Mission */}
        {criticalMission && (
          <div className="p-4 border-b border-border-panel bg-accent-red/[0.02] shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon name="warning" size="xs" className="text-accent-red" />
              <span className="text-[8px] font-black uppercase tracking-widest text-accent-red">Miss\u00e3o Cr\u00edtica</span>
            </div>
            <Card className="p-2.5 border-accent-red/20 cursor-pointer hover:border-accent-red/40 transition-colors" onClick={() => onTaskClick && onTaskClick(criticalMission.id)}>
              <p className="text-[10px] font-medium text-text-primary leading-tight mb-1.5">{criticalMission.title}</p>
              <div className="flex items-center gap-2">
                <Badge variant="red" size="xs">IMEDIATO</Badge>
                <span className="text-[8px] text-text-secondary">{criticalMission.tag}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications */}
        <div className="p-4 border-b border-border-panel shrink-0">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
            <Icon name="notifications" size="xs" className="text-accent-orange" />
            Notifica\u00e7\u00f5es
            <span className="ml-auto px-1.5 py-0.5 rounded-sm bg-accent-orange/10 border border-accent-orange/20 text-[8px] font-mono text-accent-orange">5</span>
          </span>
          <div className="space-y-1.5">
            {[
              { icon: 'warning', color: 'text-accent-orange', text: 'Lint com alertas \u2014 QA verificando', time: '2min' },
              { icon: 'check_circle', color: 'text-brand-mint', text: 'Build #42 passou com sucesso', time: '8min' },
              { icon: 'mail', color: 'text-accent-blue', text: '3 emails novos triados pelo Frank', time: '15min' },
              { icon: 'psychology', color: 'text-accent-purple', text: 'Planner atualizou roadmap Q1', time: '22min' },
              { icon: 'payments', color: 'text-accent-red', text: 'Fatura cart\u00e3o vence amanh\u00e3', time: '1h' },
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-surface transition-colors cursor-pointer">
                <Icon name={n.icon} size="xs" className={cn('shrink-0 mt-0.5', n.color)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] text-text-primary leading-tight">{n.text}</p>
                  <p className="text-[7px] font-mono text-text-secondary mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="flex-grow overflow-y-auto p-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-1.5 mb-3">
            <Icon name="bolt" size="xs" className="text-accent-blue" />
            Atividade
          </span>
          <div className="relative pl-4 space-y-4 before:absolute before:inset-0 before:ml-1.5 before:h-full before:w-px before:bg-border-panel">
            {[
              { time: '14:32', user: 'Frank', action: 'Atualizou status de infraestrutura', type: 'system' },
              { time: '12:15', user: 'MA', action: 'Concluiu "Revis\u00e3o de PR"', type: 'user' },
              { time: '09:45', user: 'Agente E2', action: 'Novo lead qualificado no CRM', type: 'agent' },
              { time: '08:00', user: 'System', action: 'Backup di\u00e1rio realizado', type: 'system' },
            ].map((log, i) => (
              <div key={i} className="relative">
                <div className={cn(
                  'absolute -left-[19px] top-1.5 size-2 rounded-full border-2 border-bg-base',
                  log.type === 'system' ? 'bg-text-secondary' : log.type === 'user' ? 'bg-brand-mint' : 'bg-accent-purple'
                )} />
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-bold text-text-primary">{log.user}</span>
                  <span className="text-[8px] font-mono text-text-secondary">{log.time}</span>
                </div>
                <p className="text-[9px] text-text-secondary mt-0.5 leading-snug">{log.action}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

    </div>
  );
};

export default Dashboard;