import React, { useState } from 'react';
import { Icon, SectionLabel, StatusDot, TabNav, Badge } from './ui';

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
                      <SectionLabel className="text-xs border-b border-border-panel pb-2">Hábitos Críticos</SectionLabel>
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
                      <SectionLabel className="text-xs border-b border-border-panel pb-2">Observações</SectionLabel>
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
                    <SectionLabel className="text-xs">Sequência de Hábitos</SectionLabel>
                    <Icon name="local_fire_department" className="text-accent-orange" />
                  </div>
                  <div className="flex flex-col items-center py-6 border-y border-border-panel mb-8">
                    <span className="text-4xl font-black font-mono text-accent-orange">14</span>
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-[0.2em] mt-2">Dias Consecutivos</span>
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
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">Hábitos</p>
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
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest text-center">Última sincronização com biometric wearable às 08:42 AM</p>
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
                  
                  {/* Chart 1: Tinnitus Level */}
                  <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusDot color="orange" />
                          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">Nível de Tinnitus</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-text-primary font-mono">3.2</span>
                          <span className="text-xs text-text-secondary">/ 10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <Icon name="arrow_downward" className="text-sm" style={{fontSize: '14px'}} />
                        12% vs sem. anterior
                      </div>
                    </div>
                    {/* Chart Visualization Area */}
                    <div className="h-40 w-full relative grid-bg rounded-sm border border-border-panel">
                      {/* Simulated SVG Line Chart */}
                      <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#FF9F0A" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,70 Q10,65 20,50 T40,45 T60,60 T80,30 T100,20 V100 H0 Z" fill="url(#grad1)"></path>
                        <path d="M0,70 Q10,65 20,50 T40,45 T60,60 T80,30 T100,20" fill="none" className="stroke-accent-orange" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                        {/* Data Points */}
                        <circle className="stroke-accent-orange" fill="var(--color-bg-header)" cx="20" cy="50" r="1.5" strokeWidth="1"></circle>
                        <circle className="stroke-accent-orange" fill="var(--color-bg-header)" cx="60" cy="60" r="1.5" strokeWidth="1"></circle>
                        <circle className="fill-text-primary stroke-accent-orange animate-ping opacity-75" cx="80" cy="30" r="2.5" strokeWidth="0"></circle>
                        <circle className="stroke-accent-orange" fill="var(--color-bg-header)" cx="80" cy="30" r="1.5" strokeWidth="1"></circle>
                      </svg>
                      {/* Axis Labels */}
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-text-secondary font-mono">
                        <span>01 Ago</span>
                        <span>07 Ago</span>
                        <span>14 Ago</span>
                        <span>21 Ago</span>
                        <span>Hoje</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Sleep Quality */}
                  <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusDot color="blue" />
                          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">Qualidade do Sono</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-text-primary font-mono">84</span>
                          <span className="text-xs text-text-secondary">Pontuação</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-accent-orange bg-accent-orange/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <Icon name="arrow_upward" className="text-sm" style={{fontSize: '14px'}} />
                        5% Estável
                      </div>
                    </div>
                    <div className="h-32 w-full relative grid-bg rounded-sm border border-border-panel">
                      <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,60 Q15,55 25,40 T50,45 T75,30 T100,25 V100 H0 Z" fill="url(#grad2)"></path>
                        <path d="M0,60 Q15,55 25,40 T50,45 T75,30 T100,25" fill="none" className="stroke-accent-blue" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-text-secondary font-mono">
                        <span>Seg</span>
                        <span>Ter</span>
                        <span>Qua</span>
                        <span>Qui</span>
                        <span>Sex</span>
                        <span>Sáb</span>
                        <span>Dom</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 3: Energy Levels */}
                  <div className="bg-header-bg rounded-sm border border-border-panel p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">Nível de Energia</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-text-primary font-mono">Alto</span>
                          <span className="text-xs text-text-secondary">Subjetivo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-brand-mint bg-brand-mint/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <Icon name="bolt" className="text-sm" style={{fontSize: '14px'}} />
                        Pico Matinal
                      </div>
                    </div>
                    <div className="h-32 w-full relative grid-bg rounded-sm border border-border-panel">
                      <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad3" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#facc15" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#facc15" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,80 C20,70 30,20 50,30 S70,80 100,60 V100 H0 Z" fill="url(#grad3)"></path>
                        <path d="M0,80 C20,70 30,20 50,30 S70,80 100,60" fill="none" stroke="#facc15" strokeDasharray="4,4" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-text-secondary font-mono">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>22:00</span>
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
                  <h3 className="text-xs font-bold text-accent-orange uppercase tracking-wider mb-2">Sugestão do Sistema</h3>
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