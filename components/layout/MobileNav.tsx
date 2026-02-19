import { useState } from 'react';
import type { View, Project } from '../../lib/appTypes';
import { Icon } from '../ui';

interface MobileNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenMissionModal: () => void;
  projects: Project[];
  activeProjectId: string;
  activeTaskCounts: Record<string, number>;
  onProjectChange: (id: string) => void;
  onStartAddProject: () => void;
}

const MORE_ITEMS = [
  { id: 'learning', icon: 'school',        label: 'Aprendizado' },
  { id: 'planner',  icon: 'event_note',   label: 'Planejador'  },
  { id: 'notes',    icon: 'sticky_note_2', label: 'Notas'    },
  { id: 'crm',      icon: 'contacts',     label: 'Rede (CRM)'  },
  { id: 'agents-overview', icon: 'smart_toy',    label: 'Agentes' },
  { id: 'settings', icon: 'settings',     label: 'Configurações' },
] as const;

const MORE_VIEW_IDS = ['learning','planner','notes','crm','agents-overview','agent-detail','settings'];

export default function MobileNav({
  currentView,
  onNavigate,
  onOpenMissionModal,
  projects,
  activeProjectId,
  activeTaskCounts,
  onProjectChange,
  onStartAddProject,
}: MobileNavProps) {
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileContextOpen, setIsMobileContextOpen] = useState(false);

  if (currentView === 'mission-detail') return null;

  const activeProjectObj = projects.find(p => p.id === activeProjectId);

  return (
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
                  onClick={() => { onProjectChange(proj.id); setIsMobileContextOpen(false); }}
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

            <button
              onClick={() => { setIsMobileContextOpen(false); onStartAddProject(); }}
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
          {MORE_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id as View); setIsMobileMoreOpen(false); }}
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
        <button onClick={() => onNavigate('dashboard')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
          <Icon name="dashboard" size="md" className={currentView === 'dashboard' ? 'text-brand-mint' : 'text-text-secondary'} />
          <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'dashboard' ? 'text-brand-mint' : 'text-text-secondary'}`}>Central</span>
        </button>
        <button onClick={() => onNavigate('finance')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
          <Icon name="payments" size="md" className={currentView === 'finance' ? 'text-brand-mint' : 'text-text-secondary'} />
          <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'finance' ? 'text-brand-mint' : 'text-text-secondary'}`}>FINANÇAS</span>
        </button>
        <div className="relative -top-5">
          <button
            onClick={onOpenMissionModal}
            className="size-12 bg-brand-mint rounded-full text-black flex items-center justify-center border-4 border-bg-base shadow-[0_0_15px_rgba(0,255,149,0.3)] active:scale-95 transition-transform"
          >
            <Icon name="add" className="font-black text-xl" />
          </button>
        </div>
        <button onClick={() => onNavigate('health')} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
          <Icon name="monitor_heart" size="md" className={currentView === 'health' ? 'text-brand-mint' : 'text-text-secondary'} />
          <span className={`text-[8px] font-bold uppercase tracking-wide ${currentView === 'health' ? 'text-brand-mint' : 'text-text-secondary'}`}>SAÚDE</span>
        </button>
        <button onClick={() => setIsMobileMoreOpen(!isMobileMoreOpen)} className="flex flex-col items-center gap-0.5 p-2 min-w-[48px]">
          <Icon name="more_horiz" size="md" className={isMobileMoreOpen || MORE_VIEW_IDS.includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'} />
          <span className={`text-[8px] font-bold uppercase tracking-wide ${isMobileMoreOpen || MORE_VIEW_IDS.includes(currentView) ? 'text-brand-mint' : 'text-text-secondary'}`}>Mais</span>
        </button>
      </div>
    </div>
  );
}
