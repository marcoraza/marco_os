import { useState, useEffect, useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { useOpenClaw } from '../../contexts/OpenClawContext';
import { getConfigForAgent } from '../../data/agentMockData';
import type { AgentConfig as AgentConfigType } from '../../data/agentMockData';

interface AgentConfigProps {
  agentId: string;
}

const roleBadge: Record<string, { variant: 'mint' | 'blue' | 'purple'; label: string }> = {
  coordinator: { variant: 'mint',   label: 'COORDENADOR' },
  'sub-agent': { variant: 'blue',   label: 'SUB-AGENTE' },
  integration: { variant: 'purple', label: 'INTEGRAÇÃO' },
};

export default function AgentConfig({ agentId }: AgentConfigProps) {
  const { http, isLive } = useOpenClaw();
  const [liveConfig, setLiveConfig] = useState<AgentConfigType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLive || !http) return;
    setLoading(true);
    http.fileRead('config/agents.json')
      .then(({ content }) => {
        const parsed = JSON.parse(content) as { agents: AgentConfigType[] };
        const found = parsed.agents.find(a => a.id === agentId) ?? parsed.agents[0];
        setLiveConfig(found ?? null);
      })
      .catch(() => setLiveConfig(null))
      .finally(() => setLoading(false));
  }, [isLive, http, agentId]);

  const config = liveConfig ?? getConfigForAgent(agentId);

  if (loading) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="settings">CONFIGURAÇÃO</SectionLabel>
        <Card className="p-4 text-center text-text-secondary text-[10px]">Carregando...</Card>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="settings">CONFIGURAÇÃO</SectionLabel>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="settings" size="lg" />
            <span className="text-[11px]">Nenhuma configuração encontrada</span>
          </div>
        </Card>
      </div>
    );
  }

  const role = roleBadge[config.role] ?? { variant: 'neutral' as const, label: config.role.toUpperCase() };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon="settings">CONFIGURAÇÃO</SectionLabel>
        {isLive
          ? <Badge variant="mint" size="sm">LIVE</Badge>
          : <Badge variant="neutral" size="sm">MOCK</Badge>
        }
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
          <Card className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-mint/10 flex items-center justify-center">
                  <Icon name="smart_toy" size="md" />
                </div>
                <div>
                  <div className="text-sm text-text-primary font-medium">{config.name}</div>
                  <Badge variant={role.variant} size="xs">{role.label}</Badge>
                </div>
              </div>
              <Badge variant={config.enabled ? 'mint' : 'red'} size="sm">
                {config.enabled ? 'ATIVO' : 'INATIVO'}
              </Badge>
            </div>

            {/* Model */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Modelo</span>
              <div className="text-[11px] font-mono text-text-primary">{config.model}</div>
            </div>

            {/* System Prompt */}
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">System Prompt</span>
              <div className="bg-bg-base rounded border border-border-panel p-3">
                <p className="text-[10px] font-mono text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {config.systemPrompt}
                </p>
              </div>
            </div>

            {/* Temperature + Max Tokens */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-base rounded p-2">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Temperature</div>
                <div className="text-sm font-mono text-text-primary">{config.temperature}</div>
              </div>
              <div className="bg-bg-base rounded p-2">
                <div className="text-[8px] font-black uppercase tracking-widest text-text-secondary mb-1">Max Tokens</div>
                <div className="text-sm font-mono text-text-primary">{config.maxTokens.toLocaleString()}</div>
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Ferramentas</span>
              <div className="flex flex-wrap gap-1.5">
                {config.tools.map((tool) => (
                  <Badge key={tool} variant="neutral" size="sm">
                    <Icon name="build" size="xs" />
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Icon name="menu_book" size="xs" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Fonte</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              {isLive
                ? 'Configuração via config/agents.json no workspace (live).'
                : 'Gateway offline — exibindo dados mock.'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
