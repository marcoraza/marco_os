import type { View } from '../../lib/appTypes';
import type { Agent } from '../../types/agents';
import { Icon, StatusDot } from '../ui';
import { NotificationBell } from '../NotificationCenter';
import { cn } from '../../utils/cn';

interface AppHeaderProps {
  currentView: View;
  currentTime: Date;
  activeAgent: Agent | undefined;
  activeAgentStatusColor: 'mint' | 'orange' | 'blue' | 'red';
  agentsOnlineCount: number;
  isLive: boolean;
  onNavigateHome: () => void;
  onOpenPalette: () => void;
  onOpenMissionModal: () => void;
}

const viewLabels: Record<string, string> = {
  dashboard: 'Central',
  finance: 'Finanças',
  health: 'Saúde',
  learning: 'Aprendizado',
  planner: 'Planejador',
  notes: 'Notas',
  crm: 'Rede',
  settings: 'Config',
  'mission-detail': 'Missão',
  'agents-overview': 'Mission Control',
  'agent-detail': 'Agente',
};

export default function AppHeader({
  currentView,
  currentTime,
  activeAgent,
  activeAgentStatusColor,
  agentsOnlineCount,
  isLive,
  onNavigateHome,
  onOpenPalette,
  onOpenMissionModal,
}: AppHeaderProps) {
  if (currentView === 'mission-detail') return null;

  return (
    <header className="h-16 bg-header-bg border-b border-border-panel px-6 flex items-center justify-between shrink-0 gap-4 z-30 relative transition-colors duration-300">
      <div className="flex items-center gap-6 lg:gap-10 shrink-0">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Icon name="grid_view" className="text-text-primary text-2xl" />
          <h2 className="text-text-primary text-[10px] font-black tracking-widest uppercase hidden sm:block">Marco OS</h2>
        </button>
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
        <div className="hidden md:flex items-center gap-1.5 bg-surface/50 border border-border-panel px-2.5 py-1.5 rounded-sm">
          <span className={cn('w-1.5 h-1.5 rounded-full', isLive ? 'bg-brand-mint animate-pulse' : 'bg-text-secondary/30')} />
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
            {isLive ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-text-primary absolute left-1/2 -translate-x-1/2">
        {viewLabels[currentView]}
      </span>

      <div className="flex-grow max-w-lg relative hidden xl:block">
        <Icon name="search" size="lg" className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          readOnly
          onFocus={onOpenPalette}
          onClick={onOpenPalette}
          placeholder="Cmd/Ctrl+K • Buscar / criar…"
          className="w-full bg-bg-base border border-border-panel rounded-md pl-11 pr-28 py-2.5 text-xs text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder:text-text-secondary/40 cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-text-secondary/70 border border-border-panel bg-surface px-2 py-1 rounded-sm">
          ⌘K
        </div>
      </div>

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
        <NotificationBell />
        <button
          onClick={onOpenMissionModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all"
        >
          <Icon name="add" size="xs" />
          <span>Nova Missão</span>
        </button>
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-surface/50 border border-border-panel pl-1.5 pr-3 py-1 rounded-sm">
            <div className="size-7 rounded-sm overflow-hidden shrink-0 border border-border-panel/50">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-text-primary leading-none">Marco</span>
              <span className="text-[7px] font-bold text-text-secondary uppercase tracking-wider leading-none mt-0.5">Admin</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-text-primary font-mono leading-none">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[7px] font-bold text-text-secondary uppercase tracking-wider leading-none mt-1">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '')}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
