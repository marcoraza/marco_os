import { useState, useRef, useEffect } from 'react';
import type { Project, Theme } from '../../lib/appTypes';
import { Icon } from '../ui';
import { cn } from '../../utils/cn';

const SWITCHER_MAX = 5;

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId: string;
  activeTaskCounts: Record<string, number>;
  onProjectChange: (id: string) => void;
  onAddProject: (name: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function ProjectSwitcher({
  projects,
  activeProjectId,
  activeTaskCounts,
  onProjectChange,
  onAddProject,
  theme,
  onThemeChange,
}: ProjectSwitcherProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingProject && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAddingProject]);

  const visibleProjects = projects.slice(0, SWITCHER_MAX);
  const overflowProjects = projects.slice(SWITCHER_MAX);

  const handleAddProject = () => {
    const name = newProjectName.trim();
    if (!name) { setIsAddingProject(false); return; }
    onAddProject(name);
    setNewProjectName('');
    setIsAddingProject(false);
    setIsMoreOpen(false);
  };

  return (
    <footer className="h-[72px] border-t border-border-panel bg-header-bg px-6 hidden md:flex items-center justify-between shrink-0 z-20 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1 overflow-hidden relative">
        <div className="flex p-1 bg-bg-base rounded-md border border-border-panel items-center gap-0.5 max-w-full overflow-hidden">

          {visibleProjects.map(proj => {
            const isActive = activeProjectId === proj.id;
            const count = activeTaskCounts[proj.id] ?? 0;
            return (
              <button
                key={proj.id}
                onClick={() => { onProjectChange(proj.id); setIsMoreOpen(false); }}
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
                <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }}></span>
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

              {isMoreOpen && (
                <div className="absolute bottom-full mb-2 left-0 min-w-[180px] bg-surface border border-border-panel rounded-md shadow-2xl py-1 z-50 animate-in zoom-in-95 origin-bottom-left duration-150">
                  {overflowProjects.map(proj => {
                    const isActive = activeProjectId === proj.id;
                    const count = activeTaskCounts[proj.id] ?? 0;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => { onProjectChange(proj.id); setIsMoreOpen(false); }}
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

          <div className="h-5 w-[1px] bg-border-panel mx-1 shrink-0"></div>

          {isAddingProject ? (
            <div className="flex items-center gap-1 pl-1">
              <input
                ref={addInputRef}
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddProject(); if (e.key === 'Escape') setIsAddingProject(false); }}
                placeholder="Nome do projeto..."
                className="bg-bg-base border border-brand-mint/40 rounded-sm px-2 py-1 text-[10px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none w-36"
              />
              <button onClick={handleAddProject} className="p-1 text-brand-mint hover:text-text-primary transition-colors">
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

      <div className="flex items-center p-0.5 bg-bg-base rounded-sm border border-border-panel shrink-0 ml-4">
        {([
          { t: 'light' as Theme, icon: 'light_mode',     active: 'text-accent-orange' },
          { t: 'dark'  as Theme, icon: 'dark_mode',      active: 'text-brand-mint'    },
          { t: 'system' as Theme, icon: 'desktop_windows', active: 'text-accent-blue'  },
        ] as const).map(({ t, icon, active }) => (
          <button
            key={t}
            onClick={() => onThemeChange(t)}
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
  );
}
