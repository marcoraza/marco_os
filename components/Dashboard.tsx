import React, { useState, useMemo } from 'react';
import type { Task, Project } from '../lib/appTypes';
import type { StoredEvent } from '../data/models';
import {
  DashboardHeader,
  KanbanBoard,
  FocusMode,
  GamificationBar,
  DashboardRightSidebar,
  KANBAN_COLUMNS,
} from './dashboard/index';

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

const Dashboard: React.FC<DashboardProps> = ({
  tasks, setTasks, onTaskClick, activeProjectId, projects, onAddTask, events, setEvents,
}) => {
  const activeProject = projects.find(p => p.id === activeProjectId);

  // State
  const [quickCapture, setQuickCapture] = useState('');
  const [missionView, setMissionView] = useState<'hoje' | 'semana' | 'mes'>('hoje');
  const [focusMode, setFocusMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'team'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<Task['status']>('assigned');
  const [collapsedCols, setCollapsedCols] = useState<Set<Task['status']>>(new Set());

  // Handlers
  const handleQuickCaptureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const toggleCollapse = (colId: Task['status']) => {
    setCollapsedCols(prev => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId); else next.add(colId);
      return next;
    });
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
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const handleTaskStatusChange = (taskId: number, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  // Derived state
  const contextTasks = tasks.filter(t => t.projectId === activeProjectId);
  const availableTags = Array.from(new Set(tasks.map(t => t.tag))).sort();

  const displayTasks = contextTasks.filter(task => {
    if (activeFilter === 'mine' && task.assignee !== 'MA') return false;
    if (activeFilter === 'team' && task.assignee === 'MA') return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (tagFilter && task.tag !== tagFilter) return false;
    return true;
  });

  const criticalMission = tasks.filter(t => t.priority === 'high' && t.status !== 'done').pop();

  const focusTask = contextTasks
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const prio: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (prio[a.priority] ?? 2) - (prio[b.priority] ?? 2);
    })[0] || null;

  // Gamification
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const xpTasks = completedTasks * 50 + tasks.filter(t => t.priority === 'high' && t.status === 'done').length * 30;
  const totalXP = xpTasks + (12 * 15);
  const level = Math.floor(totalXP / 500) + 1;
  const xpInLevel = totalXP % 500;
  const xpToNext = 500;

  const achievements = [
    { id: 'first-blood', icon: 'military_tech',          label: 'First Blood',    desc: 'Completou a 1a tarefa',       unlocked: completedTasks >= 1 },
    { id: 'streak-7',    icon: 'local_fire_department',   label: 'Semana de Fogo', desc: '7 dias sem perder prazo',     unlocked: true },
    { id: 'centurion',   icon: 'shield',                  label: 'CENTURIÃO',      desc: '100 tasks completadas',       unlocked: completedTasks >= 5 },
    { id: 'multitask',   icon: 'hub',                     label: 'Multitarefa',    desc: '3+ tasks em andamento',       unlocked: contextTasks.filter(t => t.status === 'in-progress').length >= 2 },
    { id: 'clean-slate', icon: 'auto_awesome',            label: 'Tela Limpa',     desc: 'Zero no backlog',             unlocked: contextTasks.filter(t => t.status === 'assigned').length === 0 },
    { id: 'early-bird',  icon: 'wb_sunny',                label: 'Early Bird',     desc: 'Tarefa antes do prazo',       unlocked: true },
  ];

  const statusChartData = useMemo(() => {
    const statusMap: Record<Task['status'], number> = { 'assigned': 0, 'started': 0, 'in-progress': 0, 'standby': 0, 'done': 0 };
    contextTasks.forEach(t => { statusMap[t.status]++; });
    return [
      { name: 'Atrib.',  count: statusMap['assigned'],    fill: '#64748b' },
      { name: 'Inic.',   count: statusMap['started'],     fill: '#0A84FF' },
      { name: 'Andam.',  count: statusMap['in-progress'], fill: '#FF9F0A' },
      { name: 'Stand.',  count: statusMap['standby'],     fill: '#EAB308' },
      { name: 'Done',    count: statusMap['done'],        fill: '#00FF95' },
    ];
  }, [contextTasks]);

  const weeklyActivityData = useMemo(() => [
    { day: 'Seg', tasks: 2 }, { day: 'Ter', tasks: 5 }, { day: 'Qua', tasks: 3 },
    { day: 'Qui', tasks: 7 }, { day: 'Sex', tasks: 4 }, { day: 'Sáb', tasks: 6 }, { day: 'Dom', tasks: 1 },
  ], []);

  return (
    <div className="flex flex-row h-full overflow-hidden">
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden">

        <DashboardHeader
          activeProject={activeProject}
          quickCapture={quickCapture}
          onQuickCaptureChange={setQuickCapture}
          onQuickCaptureKeyDown={handleQuickCaptureKeyDown}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          availableTags={availableTags}
          activeColumn={activeColumn}
          onColumnChange={setActiveColumn}
          columns={KANBAN_COLUMNS}
          displayTasks={displayTasks}
        />

        <KanbanBoard
          columns={KANBAN_COLUMNS}
          displayTasks={displayTasks}
          collapsedCols={collapsedCols}
          activeColumn={activeColumn}
          onToggleCollapse={toggleCollapse}
          onTaskClick={id => onTaskClick && onTaskClick(id)}
          onAddTask={() => onAddTask && onAddTask()}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />

        {focusMode && focusTask && (
          <FocusMode
            focusTask={focusTask}
            columns={KANBAN_COLUMNS}
            totalXP={totalXP}
            contextTasksRemaining={contextTasks.filter(t => t.status !== 'done').length}
            onClose={() => setFocusMode(false)}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskClick={id => onTaskClick && onTaskClick(id)}
          />
        )}

        <GamificationBar
          level={level}
          xpInLevel={xpInLevel}
          xpToNext={xpToNext}
          totalXP={totalXP}
          completedTasks={completedTasks}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode(v => !v)}
          focusTask={focusTask}
          missionView={missionView}
          onToggleMissionView={() => {
            if (missionView === 'hoje') setMissionView('semana');
            else if (missionView === 'semana') setMissionView('mes');
            else setMissionView('hoje');
          }}
          achievements={achievements}
          unlockedCount={achievements.filter(a => a.unlocked).length}
          statusChartData={statusChartData}
          weeklyActivityData={weeklyActivityData}
        />
      </div>

      <DashboardRightSidebar
        criticalMission={criticalMission}
        onTaskClick={id => onTaskClick && onTaskClick(id)}
        events={events}
        setEvents={setEvents}
        activeProjectId={activeProjectId}
      />
    </div>
  );
};

export default Dashboard;
