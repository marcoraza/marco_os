import React, { useState } from 'react';

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

  return (
    <div className="flex flex-col h-full bg-[#0D0D0F] font-sans text-[#E1E1E1] overflow-hidden">
      <style>{`
        /* Shared & Daily Styles */
        .uppercase-label {
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 700;
        }
        input[type="range"] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type="range"]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            background: #2A2A30;
            border-radius: 0;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            background: #FF9F0A;
            cursor: pointer;
            margin-top: -6px;
            border-radius: 0;
        }
        input[type="range"]:focus {
            outline: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1c1c1e; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3f3f46; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #52525b; 
        }

        /* Trends Specific Styles */
        .grid-bg {
            background-size: 40px 40px;
            background-image:
                linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}</style>

      {/* Header */}
      <header className="h-16 bg-[#121212] border-b border-[#2A2A30] px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#FF9F0A] text-2xl">health_metrics</span>
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF9F0A]">Monitor de Saúde</h1>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => setActiveTab('daily')}
              className={`text-[10px] font-black uppercase tracking-widest pb-5 mt-5 border-b-2 transition-colors ${
                activeTab === 'daily' 
                  ? 'text-[#FF9F0A] border-[#FF9F0A]' 
                  : 'text-[#8E8E93] border-transparent hover:text-[#E1E1E1]'
              }`}
            >
              Registro Diário
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`text-[10px] font-black uppercase tracking-widest pb-5 mt-5 border-b-2 transition-colors ${
                activeTab === 'trends' 
                  ? 'text-[#FF9F0A] border-[#FF9F0A]' 
                  : 'text-[#8E8E93] border-transparent hover:text-[#E1E1E1]'
              }`}
            >
              Tendências & Insights
            </button>
            <a className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] pb-5 mt-5 hover:text-[#E1E1E1] transition-colors" href="#">Histórico</a>
          </nav>
          <div className="flex items-center gap-2 pl-6 border-l border-[#2A2A30]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${activeTab === 'trends' ? 'bg-[#00FF95]' : 'bg-[#FF9F0A]'}`}></span>
            <span className={`text-[10px] uppercase font-bold ${activeTab === 'trends' ? 'text-[#00FF95]' : 'text-[#FF9F0A]'}`}>
              {activeTab === 'trends' ? 'Online' : 'Sincronizado'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* --- DAILY LOG VIEW --- */}
        {activeTab === 'daily' && (
          <div className="flex flex-col min-h-full">
            <main className="max-w-7xl mx-auto py-12 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-grow">
              <div className="lg:col-span-8 space-y-8">
                <section className="bg-[#1A1A1F] border border-[#2A2A30] p-8 space-y-10">
                  <div>
                    <h2 className="uppercase-label text-xs text-[#8E8E93] mb-8 border-b border-[#2A2A30] pb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">analytics</span> Biofeedback
                    </h2>
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
                            <span className="text-xs font-mono font-bold text-[#FF9F0A]">
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
                      <h3 className="uppercase-label text-xs text-[#8E8E93] border-b border-[#2A2A30] pb-2">Hábitos Críticos</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Meditação Diária', key: 'meditation' },
                          { label: 'Zero Açúcar', key: 'sugar' },
                          { label: 'Hidratação (3L)', key: 'hydration' }
                        ].map(h => (
                          <div 
                            key={h.key}
                            onClick={() => toggleHabit(h.key as keyof typeof habits)}
                            className="flex items-center justify-between p-3 bg-[#0D0D0F]/50 border border-[#2A2A30] cursor-pointer hover:bg-[#0D0D0F] transition-colors"
                          >
                            <span className="text-[11px] font-bold uppercase tracking-wider">{h.label}</span>
                            <div className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors ${habits[h.key as keyof typeof habits] ? 'bg-[#FF9F0A]' : 'bg-[#2A2A30]'}`}>
                              <div className={`size-3.5 rounded-full transition-transform duration-200 ${habits[h.key as keyof typeof habits] ? 'bg-black translate-x-4' : 'bg-[#8E8E93] translate-x-0'}`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="uppercase-label text-xs text-[#8E8E93] border-b border-[#2A2A30] pb-2">Observações</h3>
                      <textarea 
                        className="w-full h-[142px] bg-[#111114] border border-[#2A2A30] border rounded-none py-3 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#FF9F0A] focus:border-[#FF9F0A] placeholder:text-[#8E8E93]/30 resize-none custom-scrollbar text-[#E1E1E1]" 
                        placeholder="Notas sobre o desempenho físico ou mental de hoje..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button className="px-10 py-4 bg-[#FF9F0A] text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all">Salvar Registro</button>
                  </div>
                </section>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#1A1A1F] border border-[#2A2A30] p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="uppercase-label text-xs text-[#8E8E93]">Sequência de Hábitos</h2>
                    <span className="material-symbols-outlined text-[#FF9F0A]">local_fire_department</span>
                  </div>
                  <div className="flex flex-col items-center py-6 border-y border-[#2A2A30] mb-8">
                    <span className="text-5xl font-black font-mono text-[#FF9F0A]">14</span>
                    <span className="text-[10px] uppercase font-bold text-[#8E8E93] tracking-[0.2em] mt-2">Dias Consecutivos</span>
                  </div>
                  <div className="space-y-6">
                    <h3 className="uppercase-label text-[10px] text-[#8E8E93]">Resumo do Dia</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#E1E1E1]">Média Biofeedback</span>
                        <span className="text-xs font-mono font-bold">7.0</span>
                      </div>
                      <div className="w-full h-1 bg-[#2A2A30]">
                        <div className="w-[70%] h-full bg-[#FF9F0A]"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-[#0D0D0F] p-4 border border-[#2A2A30]">
                          <p className="text-[9px] uppercase font-bold text-[#8E8E93] mb-1">Hábitos</p>
                          <p className="text-lg font-mono font-black text-[#00FF95]">2/3</p>
                        </div>
                        <div className="bg-[#0D0D0F] p-4 border border-[#2A2A30]">
                          <p className="text-[9px] uppercase font-bold text-[#8E8E93] mb-1">Status</p>
                          <p className="text-lg font-mono font-black text-[#0A84FF]">OTM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#121212] border border-[#2A2A2A] p-6">
                  <h3 className="uppercase-label text-[10px] text-[#8E8E93] mb-4">Dica de Performance</h3>
                  <p className="text-xs leading-relaxed text-[#8E8E93]">
                    Seu nível de <span className="text-[#FF9F0A] font-bold uppercase">foco cognitivo</span> está acima da média hoje. Considere priorizar tarefas de Deep Work no próximo bloco de 90 minutos.
                  </p>
                </div>
                <div className="p-6 border border-dashed border-[#2A2A30] flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-[#8E8E93]">sync</span>
                  <p className="text-[9px] uppercase font-bold text-[#8E8E93] tracking-widest text-center">Última sincronização com biometric wearable às 08:42 AM</p>
                </div>
              </div>
            </main>
            <footer className="py-12 border-t border-[#2A2A30] bg-[#121212] text-center mt-auto shrink-0">
              <div className="flex flex-col items-center gap-4">
                <div className="size-8 flex items-center justify-center border border-[#FF9F0A]">
                  <span className="text-[#FF9F0A] font-black text-xs">M</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8E8E93]">© 2024 MARCO OS • MONITORAMENTO BIOMÉTRICO</p>
              </div>
            </footer>
          </div>
        )}

        {/* --- TRENDS & INSIGHTS VIEW --- */}
        {activeTab === 'trends' && (
          <div className="flex flex-col min-h-full">
            <main className="max-w-7xl mx-auto py-12 px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-grow">
              
              {/* Left Column: Trend Charts (Spans 8 columns) */}
              <div className="lg:col-span-8 space-y-8">
                  
                  {/* Chart 1: Tinnitus Level */}
                  <div className="bg-[#1A1A1F] rounded-sm border border-[#2A2A30] p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]"></span>
                          <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider font-mono">Nível de Tinnitus</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-[#E1E1E1] font-mono">3.2</span>
                          <span className="text-xs text-[#8E8E93]">/ 10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#00FF95] bg-[#00FF95]/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <span className="material-symbols-outlined text-sm" style={{fontSize: '14px'}}>arrow_downward</span>
                        12% vs sem. anterior
                      </div>
                    </div>
                    {/* Chart Visualization Area */}
                    <div className="h-40 w-full relative grid-bg rounded-sm border border-[#2A2A30]">
                      {/* Simulated SVG Line Chart */}
                      <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#FF9F0A" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,70 Q10,65 20,50 T40,45 T60,60 T80,30 T100,20 V100 H0 Z" fill="url(#grad1)"></path>
                        <path d="M0,70 Q10,65 20,50 T40,45 T60,60 T80,30 T100,20" fill="none" stroke="#FF9F0A" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                        {/* Data Points */}
                        <circle className="fill-[#1A1A1F] stroke-[#FF9F0A]" cx="20" cy="50" r="1.5" strokeWidth="1"></circle>
                        <circle className="fill-[#1A1A1F] stroke-[#FF9F0A]" cx="60" cy="60" r="1.5" strokeWidth="1"></circle>
                        <circle className="fill-[#E1E1E1] stroke-[#FF9F0A] animate-ping opacity-75" cx="80" cy="30" r="2.5" strokeWidth="0"></circle>
                        <circle className="fill-[#1A1A1F] stroke-[#FF9F0A]" cx="80" cy="30" r="1.5" strokeWidth="1"></circle>
                      </svg>
                      {/* Axis Labels */}
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-[#8E8E93] font-mono">
                        <span>01 Ago</span>
                        <span>07 Ago</span>
                        <span>14 Ago</span>
                        <span>21 Ago</span>
                        <span>Hoje</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Sleep Quality */}
                  <div className="bg-[#1A1A1F] rounded-sm border border-[#2A2A30] p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]"></span>
                          <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider font-mono">Qualidade do Sono</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-[#E1E1E1] font-mono">84</span>
                          <span className="text-xs text-[#8E8E93]">Pontuação</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <span className="material-symbols-outlined text-sm" style={{fontSize: '14px'}}>arrow_upward</span>
                        5% Estável
                      </div>
                    </div>
                    <div className="h-32 w-full relative grid-bg rounded-sm border border-[#2A2A30]">
                      <svg className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="grad2" x1="0%" x2="0%" y1="0%" y2="100%">
                            <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.2"></stop>
                            <stop offset="100%" stopColor="#0A84FF" stopOpacity="0"></stop>
                          </linearGradient>
                        </defs>
                        <path d="M0,60 Q15,55 25,40 T50,45 T75,30 T100,25 V100 H0 Z" fill="url(#grad2)"></path>
                        <path d="M0,60 Q15,55 25,40 T50,45 T75,30 T100,25" fill="none" stroke="#0A84FF" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      </svg>
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-[#8E8E93] font-mono">
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
                  <div className="bg-[#1A1A1F] rounded-sm border border-[#2A2A30] p-6 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                          <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider font-mono">Nível de Energia</h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold text-[#E1E1E1] font-mono">Alto</span>
                          <span className="text-xs text-[#8E8E93]">Subjetivo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#00FF95] bg-[#00FF95]/10 px-2 py-1 rounded-sm text-xs font-mono font-medium">
                        <span className="material-symbols-outlined text-sm" style={{fontSize: '14px'}}>bolt</span>
                        Pico Matinal
                      </div>
                    </div>
                    <div className="h-32 w-full relative grid-bg rounded-sm border border-[#2A2A30]">
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
                      <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[10px] text-[#8E8E93] font-mono">
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>22:00</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons (Moved to bottom) */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A30]">
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#E1E1E1] bg-[#1A1A1F] border border-[#2A2A30] hover:bg-[#2A2A2A] transition-colors">
                      <span className="material-symbols-outlined text-sm">filter_list</span>
                      Filtrar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-black bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 transition-colors shadow-lg shadow-[#FF9F0A]/20">
                      <span className="material-symbols-outlined text-sm">download</span>
                      Exportar Relatório
                    </button>
                  </div>
              </div>

              {/* Right Column: Insights & Correlations (Spans 4 columns) */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-sm font-semibold text-[#8E8E93] uppercase tracking-widest pl-1">Insights de IA</h2>
                
                {/* Insight Card 1: Breathwork Effect */}
                <div className="bg-[#1A1A1F] rounded-sm border border-[#2A2A30] p-6 shadow-sm flex flex-col h-auto">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#FF9F0A]/10 rounded-lg text-[#FF9F0A]">
                      <span className="material-symbols-outlined">self_improvement</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#E1E1E1]">Efeito do Breathwork</h3>
                      <p className="text-xs text-[#8E8E93] mt-1">Impacto imediato no tinnitus</p>
                    </div>
                  </div>
                  {/* Comparison Bars */}
                  <div className="mt-2 space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-[#8E8E93]">
                        <span>Pré-sessão</span>
                        <span>6.5 (Média)</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 w-[65%] rounded-full"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-[#FF9F0A] font-bold">
                        <span>Pós-sessão</span>
                        <span>3.2 (-51%)</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9F0A] w-[32%] rounded-full shadow-[0_0_10px_rgba(242,127,13,0.5)]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#2A2A30]">
                    <p className="text-xs text-[#8E8E93] leading-relaxed">
                      A prática de 15 minutos de respiração diafragmática demonstra uma correlação consistente com a redução aguda dos sintomas.
                    </p>
                  </div>
                </div>

                {/* Insight Card 2: Sleep Correlation */}
                <div className="bg-[#1A1A1F] rounded-sm border border-[#2A2A30] p-6 shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-[#0A84FF]/10 rounded-lg text-[#0A84FF]">
                      <span className="material-symbols-outlined">bedtime</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#E1E1E1]">Correlação do Sono</h3>
                      <p className="text-xs text-[#8E8E93] mt-1">Duração vs Energia Diurna</p>
                    </div>
                  </div>
                  {/* Mini Scatter Plot Visualization */}
                  <div className="h-32 w-full bg-[#0D0D0F] rounded-sm border border-dashed border-[#2A2A30] relative p-2">
                    {/* Labels */}
                    <span className="absolute top-2 left-2 text-[10px] text-[#8E8E93] font-mono">Energia (y)</span>
                    <span className="absolute bottom-2 right-2 text-[10px] text-[#8E8E93] font-mono">Horas (x)</span>
                    {/* Dots */}
                    <div className="absolute w-full h-full top-0 left-0">
                      {/* Random dots placed to look like correlation */}
                      <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50"></div>
                      <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50"></div>
                      <div className="absolute bottom-[25%] left-[30%] w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50"></div>
                      <div className="absolute bottom-[50%] left-[50%] w-1.5 h-1.5 bg-[#0A84FF] rounded-full"></div>
                      <div className="absolute bottom-[60%] left-[60%] w-1.5 h-1.5 bg-[#0A84FF] rounded-full"></div>
                      <div className="absolute bottom-[80%] left-[75%] w-2 h-2 bg-[#FF9F0A] rounded-full shadow shadow-[#FF9F0A]/50 animate-pulse"></div>
                      <div className="absolute bottom-[75%] left-[80%] w-1.5 h-1.5 bg-[#0A84FF] rounded-full"></div>
                      <div className="absolute bottom-[85%] left-[85%] w-1.5 h-1.5 bg-[#0A84FF] rounded-full"></div>
                      {/* Trend line */}
                      <div className="absolute bottom-[20%] left-[20%] w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#FF9F0A]/50 to-[#FF9F0A] origin-bottom-left rotate-[-35deg] transform translate-y-[-10px]"></div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#8E8E93]">R² = 0.84</span>
                    <span className="text-xs font-bold text-[#FF9F0A]">+1h Sono ≈ +15% Energia</span>
                  </div>
                </div>

                {/* System Recommendation */}
                <div className="bg-gradient-to-br from-[#1A1A1F] to-[#0D0D0F] rounded-sm border border-[#FF9F0A]/20 p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-[#FF9F0A]">auto_awesome</span>
                  </div>
                  <h3 className="text-xs font-bold text-[#FF9F0A] uppercase tracking-wider mb-2">Sugestão do Sistema</h3>
                  <p className="text-sm text-gray-300 leading-snug">
                    Baseado nas tendências atuais, agendar uma sessão de <span className="text-white font-medium">Breathwork às 20:00</span> pode melhorar a qualidade do sono profundo em 8%.
                  </p>
                  <button className="mt-3 w-full py-2 text-xs font-medium bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/20 rounded-sm transition-colors">
                    Agendar Sessão
                  </button>
                </div>
              </div>
            </main>
            {/* Footer / Status Bar */}
            <footer className="mt-auto border-t border-[#2A2A30] bg-[#121212] py-4 shrink-0">
              <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-[10px] text-[#8E8E93] font-mono">
                  DADOS SINCRONIZADOS: <span className="text-[#E1E1E1]">HOJE, 14:32</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                    <span className="w-2 h-2 rounded-full bg-[#FF9F0A]/50"></span>
                    Oura Ring
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                    <span className="w-2 h-2 rounded-full bg-[#00FF95]/50"></span>
                    Apple Health
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8E8E93]">
                    <span className="w-2 h-2 rounded-full bg-[#0A84FF]/50"></span>
                    Manual Input
                  </div>
                </div>
                <div className="text-[10px] text-[#8E8E93]">
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