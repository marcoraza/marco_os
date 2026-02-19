import { useState, useEffect } from 'react';
import type { View, UptimeView } from '../../lib/appTypes';
import type { Agent } from '../../types/agents';
import { Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';

interface AppSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  agentRoster: Agent[];
  activeAgentId: string;
  onAgentClick: (agentId: string) => void;
  onAddAgent: () => void;
  isLive: boolean;
  connectionState: string;
  agentsOnlineCount: number;
}

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard',      label: 'Central de Comando' },
  { id: 'finance',   icon: 'payments',       label: 'Finanças' },
  { id: 'health',    icon: 'monitor_heart',  label: 'Saúde' },
  { id: 'learning',  icon: 'school',         label: 'Aprendizado' },
  { id: 'planner',   icon: 'event_note',     label: 'Planejador' },
  { id: 'notes',     icon: 'sticky_note_2',  label: 'Notas' },
  { id: 'crm',       icon: 'contacts',       label: 'Gestão de Contatos' },
  { id: 'settings',  icon: 'settings',       label: 'Configurações' },
] as const;

export default function AppSidebar({
  currentView,
  onNavigate,
  agentRoster,
  activeAgentId,
  onAgentClick,
  onAddAgent,
  isLive,
  connectionState,
  agentsOnlineCount,
}: AppSidebarProps) {
  // Local uptime state
  const [uptime, setUptime] = useState(0);
  const [uptimeView, setUptimeView] = useState<UptimeView>('24H');

  useEffect(() => {
    const interval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const cycleUptimeView = () => {
    const views: UptimeView[] = ['24H', '7D', '30D', '90D', '120D', '365D'];
    setUptimeView(views[(views.indexOf(uptimeView) + 1) % views.length]);
  };

  const getDisplayUptime = () => {
    const historyBase: Record<UptimeView, number> = {
      '24H': 0, '7D': 345600, '30D': 1209600,
      '90D': 4320000, '120D': 6500000, '365D': 15000000,
    };
    const total = uptime + historyBase[uptimeView];
    if (uptimeView === '24H') {
      const h = Math.floor(total / 3600).toString().padStart(2, '0');
      const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
      const s = (total % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`;
  };

  if (currentView === 'mission-detail') return null;

  return (
    <aside className="w-[220px] bg-header-bg border-r border-border-panel flex-col shrink-0 hidden md:flex z-10 transition-colors duration-300">
      <div className="flex-grow overflow-y-auto py-6">
        <div className="px-4 mb-8">
          <SectionLabel className="mb-4 px-3">NAVEGAÇÃO</SectionLabel>
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                  currentView === item.id ? 'nav-item-active' : 'nav-item-inactive'
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
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <SectionLabel>Agentes</SectionLabel>
              <div className={cn(
                'size-1.5 rounded-full',
                isLive ? 'bg-brand-mint shadow-[0_0_4px_rgba(0,255,149,0.5)]' : connectionState === 'connecting' ? 'bg-accent-orange animate-pulse' : 'bg-text-secondary/30'
              )} title={isLive ? 'OpenClaw conectado' : connectionState === 'connecting' ? 'Conectando...' : 'Offline (mock data)'} />
            </div>
            <span className="text-[9px] font-bold text-text-secondary/50 bg-surface px-2 py-0.5 rounded-sm border border-border-panel">
              {agentsOnlineCount}/{agentRoster.length}
            </span>
          </div>

          <nav className="space-y-0.5 mb-3">
            <button
              onClick={() => onNavigate('agents-overview')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ease-out ${
                currentView === 'agents-overview' ? 'nav-item-active' : 'nav-item-inactive'
              }`}
            >
              <Icon name="hub" size="lg" />
              Mission Control
            </button>
          </nav>

          <div className="w-full h-[1px] bg-border-panel/50 mb-3"></div>

          <div className="space-y-0.5">
            {agentRoster.map(agent => {
              const roleBg = agent.role === 'coordinator' ? 'bg-accent-purple/10 text-accent-purple' : agent.role === 'integration' ? 'bg-accent-orange/10 text-accent-orange' : 'bg-accent-blue/10 text-accent-blue';
              const statusColor = agent.status === 'online' ? 'mint' as const : agent.status === 'busy' ? 'orange' as const : agent.status === 'idle' ? 'blue' as const : 'red' as const;
              const isOnline = agent.status === 'online' || agent.status === 'busy';
              const isSelected = currentView === 'agent-detail' && activeAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => onAgentClick(agent.id)}
                  className={cn(
                    'p-2 rounded-md flex items-center gap-3 cursor-pointer transition-all group',
                    isSelected
                      ? 'bg-brand-mint/5 border border-brand-mint/20'
                      : 'hover:bg-surface border border-transparent'
                  )}
                >
                  <div className={`size-7 rounded-sm flex items-center justify-center shrink-0 ${roleBg}`}>
                    <Icon name={agent.avatarIcon || (agent.role === 'coordinator' ? 'shield' : 'engineering')} size="md" />
                  </div>
                  <div className="flex-grow overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn('text-[10px] font-bold truncate', isSelected ? 'text-brand-mint' : 'text-text-primary')}>{agent.name}</p>
                    </div>
                    {agent.model && (
                      <p className="text-[8px] text-text-secondary/60 font-mono truncate">{agent.model}</p>
                    )}
                  </div>
                  <StatusDot color={statusColor} glow={isOnline} />
                </div>
              );
            })}
          </div>

          <button
            onClick={onAddAgent}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-border-panel/50 text-text-secondary/60 hover:text-brand-mint hover:bg-brand-mint/5 hover:border-brand-mint/20 transition-all text-[9px] font-bold uppercase tracking-widest"
          >
            <Icon name="add" size="xs" />
            Adicionar Agente
          </button>
        </div>
      </div>

      {/* Uptime Counter */}
      <div className="px-4 py-3 border-t border-border-panel bg-bg-base/50 shrink-0">
        <button
          onClick={cycleUptimeView}
          className="w-full group"
          title="Alternar período"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="size-5 rounded-sm bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center">
                <Icon name="timer" size="xs" className="text-brand-mint" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">Uptime</span>
              <span className="text-[7px] font-bold bg-surface border border-border-panel px-1.5 py-0.5 rounded-sm text-text-secondary/60 group-hover:border-brand-mint/30 transition-colors">{uptimeView}</span>
            </div>
            <span className="text-[11px] font-black text-brand-mint font-mono">{getDisplayUptime()}</span>
          </div>
          <div className="w-full h-[3px] bg-bg-base rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-mint/30 to-brand-mint/60 rounded-full relative" style={{ width: '100%' }}>
              <div className="absolute right-0 top-0 h-full w-4 bg-brand-mint/80 rounded-full animate-pulse" />
            </div>
          </div>
        </button>
      </div>
    </aside>
  );
}
