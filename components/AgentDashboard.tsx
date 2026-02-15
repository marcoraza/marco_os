import React, { useMemo } from 'react';
import { Card, Badge, Icon } from './ui';
import type { Agent } from '../types/agents';

interface AgentDashboardProps {
  roster: Agent[];
}

export default function AgentDashboard({ roster }: AgentDashboardProps) {
  // Stats calculations
  const stats = useMemo(() => {
    const total = roster.length;
    const online = roster.filter(a => a.status === 'online').length;
    const busy = roster.filter(a => a.status === 'busy').length;
    const idle = roster.filter(a => a.status === 'idle').length;
    const offline = roster.filter(a => a.status === 'offline').length;
    const uptimeAvg = roster.reduce((acc, a) => {
      const days = parseInt(a.uptime?.split('d')[0] || '0');
      return acc + days;
    }, 0) / (total || 1);
    
    return { total, online, busy, idle, offline, uptimeAvg };
  }, [roster]);

  // Mini bar chart data
  const chartData = [
    { label: 'Online', value: stats.online, color: 'bg-emerald-500', icon: 'check_circle' },
    { label: 'Busy', value: stats.busy, color: 'bg-amber-500', icon: 'timer' },
    { label: 'Idle', value: stats.idle, color: 'bg-blue-500', icon: 'pause_circle' },
    { label: 'Offline', value: stats.offline, color: 'bg-red-500', icon: 'cancel' },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Agentes Online</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.online}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Icon name="wifi_tethering" className="text-emerald-500 text-xl" />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">{((stats.online / stats.total) * 100).toFixed(0)}% do total</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Ocupados</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.busy}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Icon name="engineering" className="text-amber-500 text-xl" />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Em execucao ativa</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Disponiveis</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.idle}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Icon name="schedule" className="text-blue-500 text-xl" />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Prontos para tarefas</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Uptime Medio</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.uptimeAvg.toFixed(0)}d</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Icon name="trending_up" className="text-purple-500 text-xl" />
            </div>
          </div>
          <p className="text-[10px] text-text-secondary mt-2">Media de todos agentes</p>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Status dos Agentes</h3>
          <Badge variant="neutral" size="sm">{stats.total} total</Badge>
        </div>
        
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-24 flex items-center gap-2">
                <Icon name={item.icon} className="text-text-secondary text-sm" />
                <span className="text-xs font-bold text-text-secondary">{item.label}</span>
              </div>
              <div className="flex-1 h-8 bg-surface rounded-md overflow-hidden relative">
                <div 
                  className={`h-full ${item.color} transition-all duration-500 ease-out rounded-md`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-text-primary mix-blend-difference">
                  {item.value > 0 && item.value}
                </span>
              </div>
              <div className="w-12 text-right">
                <span className="text-xs font-bold text-text-primary">{((item.value / stats.total) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Agent Performance List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Performance por Agente</h3>
          <Badge variant="neutral" size="sm">Uptime & Status</Badge>
        </div>
        
        <div className="space-y-3">
          {roster.map((agent) => {
            const statusColors = {
              online: 'text-emerald-500 bg-emerald-500/10',
              busy: 'text-amber-500 bg-amber-500/10',
              idle: 'text-blue-500 bg-blue-500/10',
              offline: 'text-red-500 bg-red-500/10',
            };
            
            return (
              <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg border border-border-panel hover:bg-surface/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${statusColors[agent.status].split(' ')[0].replace('text-', 'bg-')}`} />
                  <div>
                    <p className="text-sm font-bold text-text-primary">{agent.name}</p>
                    <p className="text-[10px] text-text-secondary">{agent.role} • {agent.model}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-mono text-text-primary">{agent.uptime}</p>
                    <p className="text-[10px] text-text-secondary">uptime</p>
                  </div>
                  <Badge 
                    variant={agent.status === 'online' ? 'mint' : agent.status === 'busy' ? 'orange' : agent.status === 'idle' ? 'neutral' : 'red'} 
                    size="xs"
                  >
                    {agent.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timeline / Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Atividade Recente</h3>
          <Badge variant="neutral" size="sm">Ultimas 24h</Badge>
        </div>
        
        <div className="space-y-4">
          {[
            { time: '22:51', agent: 'Frank', action: 'PR #14 merge', status: 'ok' },
            { time: '22:45', agent: 'CodeGen', action: 'Build deploy', status: 'ok' },
            { time: '22:30', agent: 'Planner', action: 'Spec review', status: 'ok' },
            { time: '22:15', agent: 'QA', action: 'Tests pass', status: 'ok' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 text-xs font-mono text-text-secondary">{item.time}</div>
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-bold text-text-primary">{item.action}</p>
                <p className="text-[10px] text-text-secondary">por {item.agent}</p>
              </div>
              <Icon name="check_circle" className="text-emerald-500 text-sm" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
