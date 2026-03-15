import React from 'react';
import { Icon } from '../ui';
import { MiniLineAreaChart, MiniRadarChart, MiniStackedBarChart } from '../ui/LightweightCharts';

const trendData14Days = [
  { day: 'D1', energy: 6, sleep: 7, focus: 5, recovery: 6, mood: 7 },
  { day: 'D2', energy: 7, sleep: 6, focus: 6, recovery: 5, mood: 6 },
  { day: 'D3', energy: 5, sleep: 8, focus: 7, recovery: 7, mood: 7 },
  { day: 'D4', energy: 8, sleep: 7, focus: 8, recovery: 6, mood: 8 },
  { day: 'D5', energy: 7, sleep: 5, focus: 6, recovery: 4, mood: 5 },
  { day: 'D6', energy: 6, sleep: 6, focus: 7, recovery: 5, mood: 6 },
  { day: 'D7', energy: 8, sleep: 8, focus: 9, recovery: 7, mood: 8 },
  { day: 'D8', energy: 7, sleep: 7, focus: 8, recovery: 8, mood: 7 },
  { day: 'D9', energy: 9, sleep: 6, focus: 7, recovery: 6, mood: 8 },
  { day: 'D10', energy: 6, sleep: 8, focus: 6, recovery: 7, mood: 6 },
  { day: 'D11', energy: 8, sleep: 9, focus: 8, recovery: 8, mood: 9 },
  { day: 'D12', energy: 7, sleep: 7, focus: 9, recovery: 7, mood: 7 },
  { day: 'D13', energy: 9, sleep: 8, focus: 8, recovery: 9, mood: 8 },
  { day: 'D14', energy: 8, sleep: 7, focus: 9, recovery: 8, mood: 9 },
];

const radarData = [
  { metric: 'Energia', value: 7.4 },
  { metric: 'Sono', value: 7.6 },
  { metric: 'Foco', value: 8.1 },
  { metric: 'Recuperação', value: 7.3 },
  { metric: 'Humor', value: 7.7 },
];

const habitsStreakData = [
  { day: 'Seg', meditation: 1, sugarFree: 1, hydration: 1 },
  { day: 'Ter', meditation: 1, sugarFree: 0, hydration: 1 },
  { day: 'Qua', meditation: 0, sugarFree: 1, hydration: 1 },
  { day: 'Qui', meditation: 1, sugarFree: 1, hydration: 0 },
  { day: 'Sex', meditation: 1, sugarFree: 1, hydration: 1 },
  { day: 'Sáb', meditation: 1, sugarFree: 0, hydration: 1 },
  { day: 'Dom', meditation: 1, sugarFree: 1, hydration: 1 },
];

export default function HealthTrendsPanel() {
  return (
    <div className="flex flex-col min-h-full">
      <main className="max-w-7xl mx-auto py-6 md:py-12 px-4 md:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full flex-grow">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-1">MÉTRICAS DE SAÚDE — 14 Dias</h3>
                <p className="text-xs text-text-secondary">Evolução diária dos 5 indicadores principais</p>
              </div>
            </div>
            <div className="h-64 w-full">
              <MiniLineAreaChart
                data={trendData14Days}
                xKey="day"
                yMax={10}
                series={[
                  { key: 'energy', label: 'Energia', color: '#facc15' },
                  { key: 'sleep', label: 'Sono', color: '#0A84FF' },
                  { key: 'focus', label: 'Foco', color: '#00FF95' },
                  { key: 'recovery', label: 'Recuperação', color: '#BF5AF2' },
                  { key: 'mood', label: 'Humor', color: '#FF9F0A' },
                ]}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-secondary">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#facc15]" />Energia</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0A84FF]" />Sono</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#00FF95]" />Foco</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#BF5AF2]" />Recuperação</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#FF9F0A]" />Humor</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-4">Score Semanal</h3>
              <div className="h-52 w-full">
                <MiniRadarChart
                  data={radarData.map((item) => ({ label: item.metric, value: item.value }))}
                  color="#00FF95"
                />
              </div>
            </div>

            <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-4">STREAK DE HÁBITOS</h3>
              <div className="h-52 w-full">
                <MiniStackedBarChart
                  data={habitsStreakData.map((item) => ({ label: item.day, ...item }))}
                  keys={[
                    { key: 'meditation', color: '#BF5AF2' },
                    { key: 'sugarFree', color: '#0A84FF' },
                    { key: 'hydration', color: '#00FF95' },
                  ]}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-secondary">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#BF5AF2]" />Meditação</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0A84FF]" />Sem Açúcar</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#00FF95]" />Hidratação</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-panel">
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-primary bg-header-bg border border-border-panel hover:bg-border-panel transition-colors">
              <Icon name="filter_list" className="text-sm" />
              Filtrar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-black bg-accent-orange hover:bg-accent-orange/90 transition-colors shadow-lg shadow-accent-orange/20">
              <Icon name="download" className="text-sm" />
              Exportar Relatório
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest pl-1">Insights de IA</h2>

          <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm flex flex-col h-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-accent-orange/10 rounded-sm text-accent-orange">
                <Icon name="self_improvement" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Efeito do Breathwork</h3>
                <p className="text-xs text-text-secondary mt-1">Impacto imediato no tinnitus</p>
              </div>
            </div>
            <div className="mt-2 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-text-secondary">
                  <span>Pré-sessão</span>
                  <span>6.5 (Média)</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-border-panel w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-accent-orange font-bold">
                  <span>Pós-sessão</span>
                  <span>3.2 (-51%)</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-orange w-[32%] rounded-full shadow-[0_0_10px_rgba(242,127,13,0.5)]"></div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border-panel">
              <p className="text-xs text-text-secondary leading-relaxed">
                A prática de 15 minutos de respiração diafragmática demonstra uma correlação consistente com a redução aguda dos sintomas.
              </p>
            </div>
          </div>

          <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-accent-blue/10 rounded-sm text-accent-blue">
                <Icon name="bedtime" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">Correlação do Sono</h3>
                <p className="text-xs text-text-secondary mt-1">Duração vs Energia Diurna</p>
              </div>
            </div>
            <div className="h-32 w-full bg-bg-base rounded-sm border border-dashed border-border-panel relative p-2">
              <span className="absolute top-2 left-2 text-[10px] text-text-secondary font-mono">Energia (y)</span>
              <span className="absolute bottom-2 right-2 text-[10px] text-text-secondary font-mono">Horas (x)</span>
              <div className="absolute w-full h-full top-0 left-0">
                <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                <div className="absolute bottom-[25%] left-[30%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                <div className="absolute bottom-[50%] left-[50%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                <div className="absolute bottom-[60%] left-[60%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                <div className="absolute bottom-[80%] left-[75%] w-2 h-2 bg-accent-orange rounded-full shadow shadow-accent-orange/50 animate-pulse"></div>
                <div className="absolute bottom-[75%] left-[80%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                <div className="absolute bottom-[85%] left-[85%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                <div className="absolute bottom-[20%] left-[20%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-accent-orange/50 to-accent-orange origin-bottom-left rotate-[-35deg] transform translate-y-[-10px]"></div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-mono text-text-secondary">R² = 0.84</span>
              <span className="text-xs font-bold text-accent-orange">+1h Sono ≈ +15% Energia</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-header-bg to-bg-base rounded-sm border border-accent-orange/20 p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Icon name="auto_awesome" className="text-6xl text-accent-orange" />
            </div>
            <h3 className="text-xs font-bold text-accent-orange uppercase tracking-wider mb-2">SUGESTÃO DO SISTEMA</h3>
            <p className="text-sm text-text-primary leading-snug">
              Baseado nas tendências atuais, agendar uma sessão de <span className="text-text-primary font-medium">Breathwork às 20:00</span> pode melhorar a qualidade do sono profundo em 8%.
            </p>
            <button className="mt-3 w-full py-2 text-xs font-medium bg-accent-orange/10 hover:bg-accent-orange/20 text-accent-orange border border-accent-orange/20 rounded-sm transition-colors">
              Agendar Sessão
            </button>
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-border-panel bg-header-bg py-4 shrink-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] text-text-secondary font-mono">
            DADOS SINCRONIZADOS: <span className="text-text-primary">HOJE, 14:32</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-orange/50"></span>
              Oura Ring
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-brand-mint/50"></span>
              Apple Health
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent-blue/50"></span>
              Manual Input
            </div>
          </div>
          <div className="text-[10px] text-text-secondary">
            © 2023 MARCO OS. HEALTH MONITORING UNIT.
          </div>
        </div>
      </footer>
    </div>
  );
}
