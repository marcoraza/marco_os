import { useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel, StatusDot } from '../ui';
import { cn } from '../../utils/cn';
import { getMemoryForAgent, agents } from '../../data/agentMockData';
import type { MemoryArtifact } from '../../data/agentMockData';

interface AgentMemoryProps {
  agentId: string;
}

const kindBadge: Record<MemoryArtifact['kind'], { variant: 'mint' | 'blue' | 'neutral' | 'orange'; label: string }> = {
  daily: { variant: 'mint', label: 'DAILY' },
  'long-term': { variant: 'blue', label: 'LONG-TERM' },
  config: { variant: 'neutral', label: 'CONFIG' },
  log: { variant: 'orange', label: 'LOG' },
};

export default function AgentMemory({ agentId }: AgentMemoryProps) {
  const artifacts = useMemo(() => getMemoryForAgent(agentId), [agentId]);

  const agentName = useMemo(() => {
    const agent = agents.find((a) => a.id === agentId);
    return agent?.name ?? agentId;
  }, [agentId]);

  if (artifacts.length === 0) {
    return (
      <div className="space-y-3">
        <SectionLabel icon="memory">MEMÓRIA</SectionLabel>
        <Card className="p-4">
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
            <Icon name="memory" size="lg" />
            <span className="text-[11px]">Nenhum artefato de memória encontrado</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLabel icon="memory">MEMÓRIA</SectionLabel>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left: Memory Artifact List */}
        <div className="xl:col-span-2 space-y-2">
          {artifacts.map((artifact) => {
            const kb = kindBadge[artifact.kind];
            const artAgent = artifact.agentId
              ? agents.find((a) => a.id === artifact.agentId)
              : undefined;

            return (
              <Card key={artifact.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-brand-mint">{artifact.path}</span>
                  <Badge variant={kb.variant} size="sm">{kb.label}</Badge>
                </div>

                <div className="text-[10px] text-text-secondary leading-relaxed">
                  {artifact.summary}
                </div>

                <div className="flex items-center gap-4 text-[9px] text-text-secondary">
                  {artAgent && (
                    <div className="flex items-center gap-1">
                      <Icon name="smart_toy" size="xs" />
                      <span>{artAgent.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Icon name="schedule" size="xs" />
                    <span className="font-mono">{artifact.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="storage" size="xs" />
                    <span className="font-mono">{artifact.size}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-3">
          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Buscar</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar artefatos..."
                className="w-full bg-bg-base border border-border-panel rounded px-3 py-1.5 text-[10px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint/40"
              />
              <Icon name="search" size="xs" />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Filtrar por Tipo</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(kindBadge) as MemoryArtifact['kind'][]).map((kind) => {
                const kb = kindBadge[kind];
                return (
                  <button
                    key={kind}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-border-panel bg-bg-base text-text-secondary hover:text-brand-mint hover:border-brand-mint/30 transition-colors"
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest">{kb.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 space-y-2 border-brand-mint/10">
            <div className="flex items-center gap-1.5">
              <Icon name="lightbulb" size="xs" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-mint">Dica</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              Artefatos de memória são criados automaticamente pelos agentes durante suas execuções. Arquivos
              <span className="font-mono text-brand-mint"> daily</span> são gerados diariamente, enquanto{' '}
              <span className="font-mono text-accent-blue">long-term</span> são destilados semanalmente.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
