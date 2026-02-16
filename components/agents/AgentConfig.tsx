import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { getConfigForAgent } from '../../data/agentMockData';

interface AgentConfigProps {
  agentId: string;
}

const roleBadge: Record<string, { variant: 'mint' | 'blue' | 'purple'; label: string }> = {
  coordinator: { variant: 'mint', label: 'COORDENADOR' },
  'sub-agent': { variant: 'blue', label: 'SUB-AGENTE' },
  integration: { variant: 'purple', label: 'INTEGRAÇÃO' },
};

export default function AgentConfig({ agentId }: AgentConfigProps) {
  const config = useMemo(() => getConfigForAgent(agentId), [agentId]);

  if (!config) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="settings">CONFIGURAÇÃO</SectionLabel>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="settings" size="lg" />
            <span className="text-[11px]">Nenhuma configuração encontrada</span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-brand-mint/30 bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 transition-colors">
              <Icon name="add" size="xs" />
              <span className="text-[9px] font-black uppercase tracking-widest">Criar Configuração</span>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const role = roleBadge[config.role] ?? { variant: 'neutral' as const, label: config.role.toUpperCase() };

  return (
    <div className="space-y-3">
      <SectionLabel icon="settings">CONFIGURAÇÃO</SectionLabel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Config Details */}
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

            {/* Edit Button */}
            <div className="flex justify-end pt-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border-panel bg-surface text-text-secondary hover:text-brand-mint hover:border-brand-mint/30 transition-colors">
                <Icon name="edit" size="xs" />
                <span className="text-[9px] font-black uppercase tracking-widest">Editar</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Right: Guide Sidebar */}
        <div>
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <Icon name="menu_book" size="xs" />
              <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Guia de Configuração</span>
            </div>

            <div className="space-y-3 text-[10px] text-text-secondary leading-relaxed">
              <div>
                <span className="text-text-primary font-medium">Temperature:</span> Valores mais baixos (0.1-0.3) geram respostas mais determinísticas. Valores mais altos (0.7-1.0) geram respostas mais criativas.
              </div>
              <div>
                <span className="text-text-primary font-medium">Max Tokens:</span> Limite máximo de tokens na resposta. Valores maiores permitem respostas mais longas mas consomem mais recursos.
              </div>
              <div>
                <span className="text-text-primary font-medium">System Prompt:</span> Instruções que definem o comportamento e personalidade do agente. Seja específico e claro.
              </div>
              <div>
                <span className="text-text-primary font-medium">Ferramentas:</span> APIs e capacidades disponíveis para o agente durante execuções.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
