import { Badge, Card, Icon, SectionLabel } from '../ui';

const skillsData = [
  { name: 'agenda-compromisso', lines: 264, sections: 8, tokensBefore: 2596, tokensAfter: 690, savings: 73 },
  { name: 'skill-creator', lines: 510, sections: 9, tokensBefore: 8182, tokensAfter: 2270, savings: 72 },
  { name: 'clawvault', lines: 441, sections: 20, tokensBefore: 3861, tokensAfter: 561, savings: 85 },
  { name: 'project-launch', lines: 394, sections: 6, tokensBefore: 2981, tokensAfter: 1037, savings: 65 },
  { name: 'agent-browser', lines: 345, sections: 13, tokensBefore: 2713, tokensAfter: 529, savings: 81 },
  { name: 'coding-agent', lines: 300, sections: 12, tokensBefore: 2827, tokensAfter: 600, savings: 79 },
  { name: 'radar-youtube', lines: 315, sections: 16, tokensBefore: 2785, tokensAfter: 484, savings: 83 },
  { name: 'radar-noturno', lines: 279, sections: 15, tokensBefore: 2193, tokensAfter: 455, savings: 79 },
  { name: 'radar-x', lines: 262, sections: 16, tokensBefore: 2232, tokensAfter: 443, savings: 80 },
  { name: 'pipeline-builder', lines: 248, sections: 9, tokensBefore: 2100, tokensAfter: 560, savings: 73 },
  { name: 'ontology', lines: 248, sections: 12, tokensBefore: 2050, tokensAfter: 430, savings: 79 },
  { name: 'nfts-digest', lines: 200, sections: 16, tokensBefore: 1800, tokensAfter: 340, savings: 81 },
  { name: 'ai-self-improvement-digest', lines: 191, sections: 12, tokensBefore: 1650, tokensAfter: 370, savings: 78 },
  { name: 'notion-ops', lines: 186, sections: 7, tokensBefore: 1500, tokensAfter: 500, savings: 67 },
  { name: 'curiosity-engine', lines: 168, sections: 8, tokensBefore: 1400, tokensAfter: 420, savings: 70 },
  { name: 'gws', lines: 155, sections: 8, tokensBefore: 1300, tokensAfter: 390, savings: 70 },
  { name: 'drive-research', lines: 132, sections: 7, tokensBefore: 1100, tokensAfter: 370, savings: 66 },
  { name: 'shellmail', lines: 122, sections: 5, tokensBefore: 950, tokensAfter: 380, savings: 60 },
  { name: 'avatar-analyzer', lines: 101, sections: 4, tokensBefore: 800, tokensAfter: 350, savings: 56 },
  { name: 'summarize-agent', lines: 95, sections: 5, tokensBefore: 750, tokensAfter: 310, savings: 59 },
  { name: 'creator-clone', lines: 91, sections: 6, tokensBefore: 720, tokensAfter: 280, savings: 61 },
  { name: 'marco-os-design', lines: 83, sections: 5, tokensBefore: 650, tokensAfter: 290, savings: 55 },
  { name: 'workspace-config', lines: 80, sections: 5, tokensBefore: 620, tokensAfter: 280, savings: 55 },
  { name: 'material-extractor', lines: 80, sections: 7, tokensBefore: 610, tokensAfter: 230, savings: 62 },
  { name: 'radar-curadoria', lines: 73, sections: 6, tokensBefore: 550, tokensAfter: 230, savings: 58 },
  { name: 'x-poster', lines: 63, sections: 5, tokensBefore: 480, tokensAfter: 210, savings: 56 },
  { name: 'summarize', lines: 59, sections: 5, tokensBefore: 420, tokensAfter: 200, savings: 52 },
];

const totalBefore = skillsData.reduce((sum, skill) => sum + skill.tokensBefore, 0);
const totalAfter = skillsData.reduce((sum, skill) => sum + skill.tokensAfter, 0);
const totalSaved = totalBefore - totalAfter;
const highestSavings = [...skillsData].sort((a, b) => b.savings - a.savings).slice(0, 5);
const costProjectionRows = [
  { label: '7 dias', runs: 56, before: totalBefore * 56, after: totalAfter * 56, rate: 0.03 },
  { label: '30 dias', runs: 240, before: totalBefore * 240, after: totalAfter * 240, rate: 0.03 },
  { label: '90 dias', runs: 720, before: totalBefore * 720, after: totalAfter * 720, rate: 0.03 },
];

const numberFormatter = new Intl.NumberFormat('pt-BR');
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

function ComparisonCard({
  title,
  value,
  tone,
  helper,
  icon,
}: {
  title: string;
  value: number;
  tone: 'before' | 'after';
  helper: string;
  icon: string;
}) {
  const toneClasses = tone === 'before'
    ? 'border-accent-red/20 bg-accent-red/10 text-accent-red'
    : 'border-brand-mint/20 bg-brand-mint/10 text-brand-mint';

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon={icon}>{title}</SectionLabel>
        <div className={`size-8 rounded-md border flex items-center justify-center ${toneClasses}`}>
          <Icon name={icon} size="sm" />
        </div>
      </div>
      <div className="text-2xl font-black tracking-tight text-text-primary">
        {numberFormatter.format(value)}
      </div>
      <p className="text-[10px] text-text-secondary">{helper}</p>
    </Card>
  );
}

export default function SkillReport() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <SectionLabel icon="analytics">Before vs After</SectionLabel>
              <p className="text-[11px] text-text-secondary">
                Panorama consolidado da redução de contexto na camada de skills.
              </p>
            </div>
            <Badge variant="blue" size="sm">
              <Icon name="compare_arrows" size="xs" />
              Benchmark
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ComparisonCard
              title="Antes"
              value={totalBefore}
              tone="before"
              helper="Carga total de contexto por sessão sem compactação."
              icon="upload"
            />
            <ComparisonCard
              title="Depois"
              value={totalAfter}
              tone="after"
              helper="Payload otimizado após sumarização estrutural."
              icon="download"
            />
          </div>

          <div className="rounded-md border border-border-panel bg-bg-base p-4 space-y-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-text-secondary">
              <span>Tokens economizados</span>
              <span className="font-bold text-brand-mint">{numberFormatter.format(totalSaved)}</span>
            </div>
            <div className="h-3 rounded-full border border-border-panel bg-surface overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-red via-accent-orange to-brand-mint"
                style={{ width: `${Math.round((totalSaved / totalBefore) * 100)}%` }}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {highestSavings.map((skill) => (
                <div key={skill.name} className="rounded-sm border border-border-panel bg-surface px-3 py-2">
                  <div className="text-[10px] font-bold text-text-primary">{skill.name}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-text-secondary">
                    <span>{skill.sections} seções</span>
                    <span className="font-bold text-brand-mint">{skill.savings}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SectionLabel icon="verified">E2E Results</SectionLabel>
            <Badge variant="mint" size="md">9/9 PASS</Badge>
          </div>

          <div className="space-y-3">
            {[
              'Renderização das tabs lazy carregando sem regressão.',
              'Skills longas preservando seções críticas após compressão.',
              'Economia de tokens estável em todos os cenários simulados.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md border border-border-panel bg-bg-base px-3 py-3">
                <div className="mt-0.5 flex size-6 items-center justify-center rounded-full border border-brand-mint/20 bg-brand-mint/10 text-brand-mint">
                  <Icon name="check" size="xs" />
                </div>
                <p className="text-[11px] leading-relaxed text-text-primary">{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-accent-blue/20 bg-accent-blue/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Icon name="science" size="sm" className="text-accent-blue" />
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-accent-blue">
                Suite operacional validada
              </span>
            </div>
            <p className="mt-2 text-[11px] text-text-secondary">
              A instrumentação está pronta para trocar o baseline hardcoded por telemetria real assim que houver janela histórica.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: 'speed',
            title: 'Prompt boot mais curto',
            body: 'Redução agressiva do contexto inicial acelera handoff entre agentes e reduz latência de sessão.',
            badge: 'Tempo operacional',
          },
          {
            icon: 'hub',
            title: 'Menos ruído estrutural',
            body: 'Seções redundantes saem do caminho sem perder checkpoints, políticas e interfaces necessárias.',
            badge: 'Qualidade de contexto',
          },
          {
            icon: 'savings',
            title: 'Custo previsível',
            body: 'Com o payload pós-otimização, projeções mensais ficam estáveis e mais fáceis de governar.',
            badge: 'FinOps',
          },
        ].map((item, index) => (
          <Card key={item.title} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className={`size-9 rounded-md border flex items-center justify-center ${
                index === 0
                  ? 'border-brand-mint/20 bg-brand-mint/10 text-brand-mint'
                  : index === 1
                    ? 'border-accent-purple/20 bg-accent-purple/10 text-accent-purple'
                    : 'border-accent-orange/20 bg-accent-orange/10 text-accent-orange'
              }`}>
                <Icon name={item.icon} size="sm" />
              </div>
              <Badge variant={index === 0 ? 'mint' : index === 1 ? 'purple' : 'orange'} size="sm">{item.badge}</Badge>
            </div>
            <div>
              <h3 className="text-sm font-black text-text-primary">{item.title}</h3>
              <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{item.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <SectionLabel icon="table_chart">Projeção de Custos</SectionLabel>
            <p className="text-[11px] text-text-secondary">
              Cenários de custo considerando taxa blended de US$ 0,03 por 1K tokens.
            </p>
          </div>
          <Badge variant="neutral" size="sm">Estimativa</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[11px]">
            <thead className="border-b border-border-panel text-[9px] uppercase tracking-[0.14em] text-text-secondary">
              <tr>
                <th className="pb-3 pr-4 font-black">Janela</th>
                <th className="pb-3 pr-4 font-black">Execuções</th>
                <th className="pb-3 pr-4 font-black">Antes</th>
                <th className="pb-3 pr-4 font-black">Depois</th>
                <th className="pb-3 pr-4 font-black">Custo</th>
                <th className="pb-3 font-black">Economia</th>
              </tr>
            </thead>
            <tbody>
              {costProjectionRows.map((row) => {
                const beforeCost = (row.before / 1000) * row.rate;
                const afterCost = (row.after / 1000) * row.rate;
                const savingsValue = beforeCost - afterCost;

                return (
                  <tr key={row.label} className="border-b border-border-panel/60 transition-colors hover:bg-bg-base/70">
                    <td className="py-3 pr-4 font-bold text-text-primary">{row.label}</td>
                    <td className="py-3 pr-4 font-mono text-text-secondary">{numberFormatter.format(row.runs)}</td>
                    <td className="py-3 pr-4 font-mono text-accent-red">{currencyFormatter.format(beforeCost)}</td>
                    <td className="py-3 pr-4 font-mono text-brand-mint">{currencyFormatter.format(afterCost)}</td>
                    <td className="py-3 pr-4 font-mono text-text-primary">{currencyFormatter.format(afterCost)}</td>
                    <td className="py-3">
                      <Badge variant="mint" size="sm">{currencyFormatter.format(savingsValue)}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
