import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { Icon, SectionLabel, StatusDot, TabNav, Badge } from './ui';

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

const HealthTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border text-xs font-mono" style={{ background: '#1C1C1C', borderColor: '#2A2A2A', padding: '10px 14px' }}>
      <p className="font-bold text-text-primary mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="leading-relaxed">
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Health: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'trends'>('daily');
  
  // Daily Log State
  const [metrics, setMetrics] = useState({
    energy: 8,
    sleep: 6,
    focus: 9,
    recovery: 5,
    mood: 7
  });

  const [habits, setHabits] = useState({
    meditation: true,
    sugar: false,
    hydration: true
  });

  const handleSliderChange = (key: keyof typeof metrics, value: number) => {
    setMetrics(prev => ({ ...prev, [key]: value }));
  };

  const toggleHabit = (key: keyof typeof habits) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
    { id: 'daily', label: 'Registro Diário' },
    { id: 'trends', label: 'Tendências & Insights' }
  ];

  return (
    <div className="flex flex-col h-full bg-bg-base font-sans text-text-primary overflow-hidden">
      {/* Navigation Tabs (Replaces Header) */}
      <div className="relative bg-bg-base shrink-0">
        <TabNav 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(id) => setActiveTab(id as any)} 
            accentColor="orange" 
        />
        
        {/* Status Badge - Positioned absolutely to align with TabNav */}
        <div className="absolute top-0 right-6 h-full flex items-center pointer-events-none">
            <div className="flex items-center gap-2 bg-surface px-2 py-1 rounded border border-border-panel pointer-events-auto">
                <StatusDot 
                    color={activeTab === 'trends' ? 'mint' : 'orange'} 
                    pulse 
                    className={activeTab === 'trends' ? '' : 'animate-none'} 
                />
                <span className={`text-[9px] uppercase font-bold ${activeTab === 'trends' ? 'text-brand-mint' : 'text-accent-orange'}`}>
                  {activeTab === 'trends' ? 'Online' : 'Sincronizado'}
                </span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* --- DAILY LOG VIEW --- */}
        {activeTab === 'daily' && (
          <div className="flex flex-col min-h-full">
            <main className="max-w-7xl mx-auto py-6 md:py-12 px-4 md:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full flex-grow">
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-header-bg border border-border-panel p-8 space-y-10">
                  <div>
                    <SectionLabel icon="analytics" className="mb-8 border-b border-border-panel pb-2 text-xs">Biofeedback</SectionLabel>
                    <div className="space-y-10">
                      {[
                        { label: 'Nível de Energia', key: 'energy' },
                        { label: 'Qualidade do Sono', key: 'sleep' },
                        { label: 'Foco Cognitivo', key: 'focus' },
                        { label: 'Recuperação Física', key: 'recovery' },
                        { label: 'Humor Geral', key: 'mood' },
                      ].map(m => (
                        <div key={m.key} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <label className="text-[11px] font-bold uppercase tracking-wider">{m.label}</label>
                            <span className="text-xs font-mono font-bold text-accent-orange">
                              {String(metrics[m.key as keyof typeof metrics]).padStart(2, '0')}/10
                            </span>
                          </div>
                          <input 
                            max="10" min="0" type="range" 
                            value={metrics[m.key as keyof typeof metrics]} 
                            onChange={(e) => handleSliderChange(m.key as keyof typeof metrics, parseInt(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
                    <div className="space-y-6">
                      <SectionLabel className="text-xs border-b border-border-panel pb-2">HÁBITOS CRÍTICOS</SectionLabel>
                      <div className="space-y-4">
                        {[
                          { label: 'Meditação Diária', key: 'meditation' },
                          { label: 'Zero Açúcar', key: 'sugar' },
                          { label: 'Hidratação (3L)', key: 'hydration' }
                        ].map(h => (
                          <div 
                            key={h.key}
                            onClick={() => toggleHabit(h.key as keyof typeof habits)}
                            className="flex items-center justify-between p-3 bg-bg-base/50 border border-border-panel cursor-pointer hover:bg-bg-base transition-colors"
                          >
                            <span className="text-[11px] font-bold uppercase tracking-wider">{h.label}</span>
                            <div className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors ${habits[h.key as keyof typeof habits] ? 'bg-accent-orange' : 'bg-border-panel'}`}>
                              <div className={`size-3.5 rounded-full transition-transform duration-200 ${habits[h.key as keyof typeof habits] ? 'bg-black translate-x-4' : 'bg-text-secondary translate-x-0'}`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <SectionLabel className="text-xs border-b border-border-panel pb-2">OBSERVAÇÕES</SectionLabel>
                      <textarea 
                        className="w-full h-[142px] bg-header-bg border border-border-panel border rounded-none py-3 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent-orange focus:border-accent-orange placeholder:text-text-secondary/30 resize-none custom-scrollbar text-text-primary" 
                        placeholder="Notas sobre o desempenho físico ou mental de hoje..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="px-10 py-4 bg-accent-orange text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Salvar Registro</button>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-header-bg border border-border-panel p-6">
                  <div className="flex items-center justify-between mb-8">
                    <SectionLabel className="text-xs">SEQUÊNCIA DE HÁBITOS</SectionLabel>
                    <Icon name="local_fire_department" className="text-accent-orange" />
                  </div>
                  <div className="flex flex-col items-center py-6 border-y border-border-panel mb-8">
                    <span className="text-4xl font-black font-mono text-accent-orange">14</span>
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-[0.2em] mt-2">DIAS CONSECUTIVOS</span>
                  </div>
                  <div className="space-y-6">
                    <SectionLabel className="text-[10px]">Resumo do Dia</SectionLabel>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-text-primary">Média Biofeedback</span>
                        <span className="text-xs font-mono font-bold">7.0</span>
                      </div>
                      <div className="w-full h-1 bg-border-panel">
                        <div className="w-[70%] h-full bg-accent-orange"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">HÁBITOS</p>
                          <p className="text-lg font-mono font-black text-brand-mint">2/3</p>
                        </div>
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">Status</p>
                          <p className="text-lg font-mono font-black text-accent-blue">OTM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-header-bg border border-border-panel p-6">
                  <SectionLabel className="text-[10px] mb-4">Dica de Performance</SectionLabel>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Seu nível de <span className="text-accent-orange font-bold uppercase">foco cognitivo</span> está acima da média hoje. Considere priorizar tarefas de Deep Work no próximo bloco de 90 minutos.
                  </p>
                </div>
                <div className="p-6 border border-dashed border-border-panel flex flex-col items-center gap-3">
                  <Icon name="sync" className="text-text-secondary" />
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest text-center">ÚLTIMA SINCRONIZAÇÃO COM BIOMETRIC WEARABLE ÀS 08:42 AM</p>
                </div>
              </div>
            </main>
            <footer className="py-12 border-t border-border-panel bg-header-bg text-center mt-auto shrink-0">
              <div className="flex flex-col items-center gap-4">
                <div className="size-8 flex items-center justify-center border border-accent-orange">
                  <span className="text-accent-orange font-black text-xs">M</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">© 2024 MARCO OS • MONITORAMENTO BIOMÉTRICO</p>
              </div>
            </footer>
          </div>
        )}

        {/* --- TRENDS & INSIGHTS VIEW --- */}
        {activeTab === 'trends' && (
          <div className="flex flex-col min-h-full">
            <main className="max-w-7xl mx-auto py-6 md:py-12 px-4 md:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full flex-grow">
              
              {/* Left Column: Trend Charts (Spans 8 columns) */}
              <div className="lg:col-span-8 space-y-8">
                  
                  {/* Chart: 14-Day Health Metrics */}
                  <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-1">MÉTRICAS DE SAÚDE — 14 Dias</h3>
                        <p className="text-xs text-text-secondary">Evolução diária dos 5 indicadores principais</p>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData14Days} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                          <XAxis dataKey="day" tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={{ stroke: '#2A2A2A' }} tickLine={false} />
                          <YAxis domain={[0, 10]} tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={{ stroke: '#2A2A2A' }} tickLine={false} />
                          <Tooltip content={<HealthTooltip />} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#8E8E93' }} />
                          <Line type="monotone" dataKey="energy" name="Energia" stroke="#facc15" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="sleep" name="Sono" stroke="#0A84FF" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="focus" name="Foco" stroke="#00FF95" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="recovery" name="Recuperação" stroke="#BF5AF2" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="mood" name="Humor" stroke="#FF9F0A" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Row: Radar + Habits Streak */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Radar: Weekly Score */}
                    <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-4">Score Semanal</h3>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                            <PolarGrid stroke="#2A2A2A" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#8E8E93', fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar dataKey="value" stroke="#00FF95" fill="#00FF95" fillOpacity={0.15} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Stacked Bar: Habits Streak */}
                    <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
                      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono mb-4">STREAK DE HÁBITOS</h3>
                      <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={habitsStreakData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                            <XAxis dataKey="day" tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={{ stroke: '#2A2A2A' }} tickLine={false} />
                            <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={{ stroke: '#2A2A2A' }} tickLine={false} />
                            <Tooltip content={<HealthTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#8E8E93' }} />
                            <Bar dataKey="meditation" name="Meditação" stackId="a" fill="#BF5AF2" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="sugarFree" name="Sem Açúcar" stackId="a" fill="#0A84FF" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="hydration" name="Hidratação" stackId="a" fill="#00FF95" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Moved to bottom) */}
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

              {/* Right Column: Insights & Correlations (Spans 4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest pl-1">Insights de IA</h2>
                
                {/* Insight Card 1: Breathwork Effect */}
                <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm flex flex-col h-auto">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-accent-orange/10 rounded-md text-accent-orange">
                      <Icon name="self_improvement" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Efeito do Breathwork</h3>
                      <p className="text-xs text-text-secondary mt-1">Impacto imediato no tinnitus</p>
                    </div>
                  </div>
                  {/* Comparison Bars */}
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

                {/* Insight Card 2: Sleep Correlation */}
                <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-accent-blue/10 rounded-md text-accent-blue">
                      <Icon name="bedtime" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">Correlação do Sono</h3>
                      <p className="text-xs text-text-secondary mt-1">Duração vs Energia Diurna</p>
                    </div>
                  </div>
                  {/* Mini Scatter Plot Visualization */}
                  <div className="h-32 w-full bg-bg-base rounded-sm border border-dashed border-border-panel relative p-2">
                    {/* Labels */}
                    <span className="absolute top-2 left-2 text-[10px] text-text-secondary font-mono">Energia (y)</span>
                    <span className="absolute bottom-2 right-2 text-[10px] text-text-secondary font-mono">Horas (x)</span>
                    {/* Dots */}
                    <div className="absolute w-full h-full top-0 left-0">
                      {/* Random dots placed to look like correlation */}
                      <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                      <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                      <div className="absolute bottom-[25%] left-[30%] w-1.5 h-1.5 bg-text-secondary rounded-full opacity-50"></div>
                      <div className="absolute bottom-[50%] left-[50%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                      <div className="absolute bottom-[60%] left-[60%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                      <div className="absolute bottom-[80%] left-[75%] w-2 h-2 bg-accent-orange rounded-full shadow shadow-accent-orange/50 animate-pulse"></div>
                      <div className="absolute bottom-[75%] left-[80%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                      <div className="absolute bottom-[85%] left-[85%] w-1.5 h-1.5 bg-accent-blue rounded-full"></div>
                      {/* Trend line */}
                      <div className="absolute bottom-[20%] left-[20%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-accent-orange/50 to-accent-orange origin-bottom-left rotate-[-35deg] transform translate-y-[-10px]"></div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono text-text-secondary">R² = 0.84</span>
                    <span className="text-xs font-bold text-accent-orange">+1h Sono ≈ +15% Energia</span>
                  </div>
                </div>

                {/* System Recommendation */}
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
            {/* Footer / Status Bar */}
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
        )}

      </div>
    </div>
  );
};

export default Health;