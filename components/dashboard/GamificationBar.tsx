import type { Task } from '../../lib/appTypes';
import { Icon, Card } from '../ui';
import { cn } from '../../utils/cn';
import {
  BarChart, Bar, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { chartTooltipStyle } from './utils';

interface Achievement {
  id: string;
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
}

interface StatusChartEntry {
  name: string;
  count: number;
  fill: string;
}

interface WeeklyEntry {
  day: string;
  tasks: number;
}

interface GamificationBarProps {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  totalXP: number;
  completedTasks: number;
  focusMode: boolean;
  onToggleFocusMode: () => void;
  focusTask: Task | null;
  missionView: 'hoje' | 'semana' | 'mes';
  onToggleMissionView: () => void;
  achievements: Achievement[];
  unlockedCount: number;
  statusChartData: StatusChartEntry[];
  weeklyActivityData: WeeklyEntry[];
}

export default function GamificationBar({
  level, xpInLevel, xpToNext, totalXP, completedTasks,
  focusMode, onToggleFocusMode, focusTask,
  missionView, onToggleMissionView,
  achievements, unlockedCount,
  statusChartData, weeklyActivityData,
}: GamificationBarProps) {
  return (
    <div className="shrink-0 border-t border-border-panel bg-header-bg">
      <div className="p-4 md:p-5 flex flex-col gap-4">

        {/* Row 1: XP + Streak + Focus toggle */}
        <div className="flex flex-col md:flex-row gap-3">

          {/* XP & Level */}
          <Card className="flex-[2] p-4">
            <div className="flex items-center gap-4">
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
          <Card className="flex-1 p-4 group cursor-pointer" onClick={onToggleMissionView}>
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
            onClick={onToggleFocusMode}
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
                <p className="text-[9px] text-text-secondary truncate">Próxima: <span className="text-text-primary font-medium">{focusTask.title}</span></p>
              </div>
            )}
            {focusMode && (
              <div className="bg-brand-mint/5 rounded-sm p-2 border border-brand-mint/20">
                <p className="text-[9px] text-brand-mint font-bold">Focado em 1 tarefa</p>
              </div>
            )}
          </Card>
        </div>

        {/* Charts */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Icon name="monitoring" size="xs" className="text-brand-mint" />
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Produtividade</span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Card className="flex-1 p-4">
              <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-2">Tarefas por Status</span>
              <div style={{ width: '100%', height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChartData} barCategoryGap="20%">
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={chartTooltipStyle.contentStyle} itemStyle={chartTooltipStyle.itemStyle} labelStyle={chartTooltipStyle.labelStyle} />
                    <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={true}>
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

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
                    <XAxis dataKey="day" tick={{ fontSize: 8, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip cursor={{ stroke: '#00FF95', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={chartTooltipStyle.contentStyle} itemStyle={chartTooltipStyle.itemStyle} labelStyle={chartTooltipStyle.labelStyle} />
                    <Area type="monotone" dataKey="tasks" stroke="#00FF95" strokeWidth={2} fill="url(#mintGradient)"
                      dot={{ r: 3, fill: '#00FF95', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }}
                      activeDot={{ r: 4, fill: '#00FF95', stroke: 'var(--color-bg-surface)', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Achievements */}
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
                <Icon name={a.icon} size="xs" className={a.unlocked ? 'text-accent-orange' : 'text-text-secondary/40'} />
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
  );
}
