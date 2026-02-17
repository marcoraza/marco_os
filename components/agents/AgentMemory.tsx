import { useState, useEffect, useMemo } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { useOpenClaw } from '../../contexts/OpenClawContext';
import { getMemoryForAgent } from '../../data/agentMockData';
import type { MemoryArtifact } from '../../data/agentMockData';

interface AgentMemoryProps {
  agentId: string;
}

const kindBadge: Record<MemoryArtifact['kind'], { variant: 'mint' | 'blue' | 'neutral' | 'orange'; label: string }> = {
  daily:      { variant: 'mint',    label: 'DAILY' },
  'long-term':{ variant: 'blue',    label: 'LONG-TERM' },
  config:     { variant: 'neutral', label: 'CONFIG' },
  log:        { variant: 'orange',  label: 'LOG' },
};

function pathToKind(path: string): MemoryArtifact['kind'] {
  if (path.includes('memory/20'))   return 'daily';
  if (path.includes('MEMORY.md'))  return 'long-term';
  if (path.includes('config'))      return 'config';
  return 'log';
}

export default function AgentMemory({ agentId }: AgentMemoryProps) {
  const { memorySearch, isLive } = useOpenClaw();
  const [liveArtifacts, setLiveArtifacts] = useState<MemoryArtifact[] | null>(null);
  const [query, setQuery] = useState('');
  const [activeKind, setActiveKind] = useState<MemoryArtifact['kind'] | null>(null);
  const [loading, setLoading] = useState(false);

  // Busca live via memorySearch quando conectado
  useEffect(() => {
    if (!isLive) return;
    setLoading(true);
    memorySearch(query || agentId)
      .then(({ results }) => {
        const artifacts: MemoryArtifact[] = results.map((r, i) => ({
          id: `live-${i}`,
          agentId,
          path: r.path,
          kind: pathToKind(r.path),
          updatedAt: new Date().toLocaleDateString('pt-BR'),
          size: `${r.snippet.length}b`,
          summary: r.snippet.slice(0, 200),
        }));
        setLiveArtifacts(artifacts);
      })
      .catch(() => setLiveArtifacts(null))
      .finally(() => setLoading(false));
  }, [isLive, agentId, query, memorySearch]);

  // Debounce da busca
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(debouncedQuery), 400);
    return () => clearTimeout(t);
  }, [debouncedQuery]);

  const allArtifacts = liveArtifacts ?? getMemoryForAgent(agentId);

  const filtered = useMemo(() => {
    return activeKind ? allArtifacts.filter(a => a.kind === activeKind) : allArtifacts;
  }, [allArtifacts, activeKind]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon="memory">MEMÓRIA</SectionLabel>
        {isLive
          ? <Badge variant="mint" size="sm">LIVE</Badge>
          : <Badge variant="neutral" size="sm">MOCK</Badge>
        }
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Lista de artefatos */}
        <div className="xl:col-span-2 space-y-2">
          {loading && (
            <Card className="p-4 text-center text-text-secondary text-[10px]">
              Buscando artefatos...
            </Card>
          )}

          {!loading && filtered.length === 0 && (
            <Card className="p-4">
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
                <Icon name="memory" size="lg" />
                <span className="text-[11px]">Nenhum artefato encontrado</span>
              </div>
            </Card>
          )}

          {!loading && filtered.map((artifact) => {
            const kb = kindBadge[artifact.kind];
            return (
              <Card key={artifact.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-brand-mint truncate">{artifact.path}</span>
                  <Badge variant={kb.variant} size="sm">{kb.label}</Badge>
                </div>
                <div className="text-[10px] text-text-secondary leading-relaxed">
                  {artifact.summary}
                </div>
                <div className="flex items-center gap-4 text-[9px] text-text-secondary">
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

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Buscar</span>
            <input
              type="text"
              placeholder="Buscar artefatos..."
              value={debouncedQuery}
              onChange={e => setDebouncedQuery(e.target.value)}
              className="w-full bg-bg-base border border-border-panel rounded px-3 py-1.5 text-[10px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint/40"
            />
          </Card>

          <Card className="p-4 space-y-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">Filtrar por Tipo</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveKind(null)}
                className={`px-2 py-1 rounded border text-[8px] font-black uppercase tracking-widest transition-colors ${
                  activeKind === null
                    ? 'border-brand-mint/50 text-brand-mint bg-brand-mint/10'
                    : 'border-border-panel text-text-secondary hover:text-brand-mint'
                }`}
              >
                TODOS
              </button>
              {(Object.keys(kindBadge) as MemoryArtifact['kind'][]).map((kind) => {
                const kb = kindBadge[kind];
                return (
                  <button
                    key={kind}
                    onClick={() => setActiveKind(kind === activeKind ? null : kind)}
                    className={`px-2 py-1 rounded border text-[8px] font-black uppercase tracking-widest transition-colors ${
                      activeKind === kind
                        ? 'border-brand-mint/50 text-brand-mint bg-brand-mint/10'
                        : 'border-border-panel text-text-secondary hover:text-brand-mint'
                    }`}
                  >
                    {kb.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="p-4 space-y-2 border-brand-mint/10">
            <div className="flex items-center gap-1.5">
              <Icon name="lightbulb" size="xs" />
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-mint">Fonte</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              {isLive
                ? 'Artefatos via memory_search no Gateway OpenClaw (live).'
                : 'Gateway offline — exibindo dados mock. Conecte o Gateway pra ver memória real.'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
