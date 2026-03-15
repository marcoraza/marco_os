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

const totalSkills = skillsData.length;
const totalTokensBefore = skillsData.reduce((sum, skill) => sum + skill.tokensBefore, 0);
const totalTokensAfter = skillsData.reduce((sum, skill) => sum + skill.tokensAfter, 0);
const totalTokensSaved = totalTokensBefore - totalTokensAfter;
const averageSavings = Math.round(skillsData.reduce((sum, skill) => sum + skill.savings, 0) / totalSkills);
const projectedMonthlyCost = (totalTokensAfter * 240 * 0.03) / 1000;

const numberFormatter = new Intl.NumberFormat('pt-BR');
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

function SummaryMetric({
  icon,
  label,
  value,
  helper,
  tone = 'mint',
}: {
  icon: string;
  label: string;
  value: string;
  helper: string;
  tone?: 'mint' | 'blue' | 'purple' | 'orange';
}) {
  const toneClass = {
    mint: 'text-brand-mint bg-brand-mint/10 border-brand-mint/20',
    blue: 'text-accent-blue bg-accent-blue/10 border-accent-blue/20',
    purple: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
    orange: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20',
  }[tone];

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel icon={icon}>{label}</SectionLabel>
        <div className={`size-8 rounded-md border flex items-center justify-center ${toneClass}`}>
          <Icon name={icon} size="sm" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-black tracking-tight text-text-primary">{value}</div>
        <p className="text-[10px] text-text-secondary">{helper}</p>
      </div>
    </Card>
  );
}

export default function TokenMonitor() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryMetric
          icon="inventory_2"
          label="Total Skills"
          value={numberFormatter.format(totalSkills)}
          helper="Skills monitoradas no baseline desta versão"
        />
        <SummaryMetric
          icon="trending_down"
          label="Economia Média"
          value={`${averageSavings}%`}
          helper="Redução média de contexto por skill compactada"
          tone="blue"
        />
        <SummaryMetric
          icon="token"
          label="Tokens Poupados/sessão"
          value={numberFormatter.format(totalTokensSaved)}
          helper={`${numberFormatter.format(totalTokensBefore)} antes vs ${numberFormatter.format(totalTokensAfter)} depois`}
          tone="purple"
        />
        <SummaryMetric
          icon="payments"
          label="Custo/mês"
          value={currencyFormatter.format(projectedMonthlyCost)}
          helper="Estimativa com 240 execuções mensais no payload otimizado"
          tone="orange"
        />
      </div>

      <Card className="p-4 md:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <SectionLabel icon="monitoring">Monitoramento de Tokens</SectionLabel>
            <p className="text-[11px] text-text-secondary">
              Comparativo hardcoded entre contexto original e versão compactada por skill.
            </p>
          </div>
          <Badge variant="mint" size="sm">
            <Icon name="check_circle" size="xs" />
            Baseline ativo
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-[11px]">
            <thead className="text-[9px] uppercase tracking-[0.14em] text-text-secondary">
              <tr className="border-b border-border-panel">
                <th className="pb-3 pr-4 font-black">Skill</th>
                <th className="pb-3 pr-4 font-black">Estrutura</th>
                <th className="pb-3 pr-4 font-black">Antes</th>
                <th className="pb-3 pr-4 font-black">Depois</th>
                <th className="pb-3 pr-4 font-black">Delta</th>
                <th className="pb-3 font-black">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {skillsData.map((skill) => {
                const savedTokens = skill.tokensBefore - skill.tokensAfter;

                return (
                  <tr
                    key={skill.name}
                    className="border-b border-border-panel/60 transition-colors hover:bg-bg-base/70"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-text-primary">{skill.name}</span>
                        <span className="text-[10px] text-text-secondary">
                          {skill.lines} linhas
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="neutral" size="sm">{skill.sections} seções</Badge>
                    </td>
                    <td className="py-3 pr-4 font-mono text-text-secondary">
                      {numberFormatter.format(skill.tokensBefore)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-brand-mint">
                      {numberFormatter.format(skill.tokensAfter)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-accent-blue">-{numberFormatter.format(savedTokens)}</span>
                        <span className="text-[10px] text-text-secondary">{skill.savings}% economia</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="space-y-1.5">
                        <div className="h-2 rounded-full border border-border-panel bg-bg-base overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-mint via-accent-blue to-accent-purple"
                            style={{ width: `${skill.savings}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-text-secondary">Compactação</span>
                          <span className="font-bold text-text-primary">{skill.savings}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="space-y-1">
            <SectionLabel icon="stacked_bar_chart">Tendência</SectionLabel>
            <p className="text-[11px] text-text-secondary">
              Janela reservada para evolução diária de compressão e custo.
            </p>
          </div>
          <Badge variant="neutral" size="sm">Aguardando histórico</Badge>
        </div>

        <div className="rounded-md border border-dashed border-border-panel bg-bg-base/80 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-border-panel bg-surface">
            <Icon name="monitoring" size="lg" className="text-text-secondary" />
          </div>
          <p className="text-sm font-bold text-text-primary">Dados reais após 7 dias de monitoramento</p>
          <p className="mt-2 text-[11px] text-text-secondary">
            O espaço do gráfico permanece intencionalmente vazio até existir coleta contínua.
          </p>
        </div>
      </Card>
    </div>
  );
}
