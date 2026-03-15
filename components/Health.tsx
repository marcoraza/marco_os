import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Icon, SectionLabel, StatusDot, TabNav, Badge, FormModal, SectionJourney, showToast } from './ui';
import { healthFields } from '../lib/formConfigs';
import { loadHealthEntries, putHealthEntry } from '../data/repository';
import { syncToNotion } from '../lib/notionSync';
import type { StoredHealthEntry } from '../data/models';
import { useTabSetup } from '../hooks/useTabSetup';
import { healthDailyJourney, healthTrendsJourney } from '../lib/journeyConfigs/health';
import { calculateHealthCheckinStreak, summarizeWeeklyHealth } from '../lib/dailySystems';
const HealthTrendsPanel = lazy(() => import('./health/HealthTrendsPanel'));

const HEALTH_TAB_IDS = ['daily', 'trends'] as const;

const journeyMap: Record<string, import('../lib/journeyTypes').JourneyConfig> = {
  daily: healthDailyJourney,
  trends: healthTrendsJourney,
};

const Health: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'trends'>('daily');
  
  // Daily Log State — persisted to localStorage per date
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `marco-os-health-${todayKey}`;

  const [metrics, setMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).metrics ?? { energy: 8, sleep: 6, focus: 9, recovery: 5, mood: 7 };
    } catch { /* ignore */ }
    return { energy: 8, sleep: 6, focus: 9, recovery: 5, mood: 7 };
  });

  const [habits, setHabits] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).habits ?? { meditation: true, sugar: false, hydration: true };
    } catch { /* ignore */ }
    return { meditation: true, sugar: false, hydration: true };
  });
  const [dailyNotes, setDailyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved).notes ?? '';
    } catch { /* ignore */ }
    return '';
  });

  // Auto-save metrics + habits to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ metrics, habits, notes: dailyNotes, date: todayKey }));
  }, [metrics, habits, dailyNotes, storageKey, todayKey]);

  const handleSliderChange = (key: keyof typeof metrics, value: number) => {
    setMetrics((prev: typeof metrics) => ({ ...prev, [key]: value }));
  };

  const toggleHabit = (key: keyof typeof habits) => {
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [healthEntries, setHealthEntries] = useState<StoredHealthEntry[]>([]);

  // Per-tab journey setup
  const dailySetup = useTabSetup('health', 'daily');
  const trendsSetup = useTabSetup('health', 'trends');

  const setupMap: Record<string, ReturnType<typeof useTabSetup>> = {
    daily: dailySetup,
    trends: trendsSetup,
  };

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const activeSetup = setupMap[activeTab];

  // Which tabs have completed their journey
  const completedTabs = HEALTH_TAB_IDS.filter(
    id => localStorage.getItem(`section_setup_done_health_${id}`) === '1'
  );

  const handleRedoJourney = useCallback((tabId: string) => {
    const setup = setupMap[tabId];
    if (setup) setup.reset();
  }, [setupMap]);

  const handleJourneyComplete = useCallback(() => {
    activeSetup.markDone();
    triggerRefresh();
  }, [activeSetup, triggerRefresh]);

  useEffect(() => {
    loadHealthEntries().then(setHealthEntries).catch(() => setHealthEntries([]));
  }, [refreshKey]);

  const handleHealthSubmit = async (data: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const entry: StoredHealthEntry = {
      id: crypto.randomUUID(),
      name: String(data.name || ''),
      tipo: (data.tipo as StoredHealthEntry['tipo']) || 'treino',
      valor: data.valor ? Number(data.valor) : undefined,
      duracao: data.duracao ? Number(data.duracao) : undefined,
      data: String(data.data || now.slice(0, 10)),
      notas: data.notas ? String(data.notas) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    await putHealthEntry(entry);
    showToast('Registro de saude salvo!');
    syncToNotion('create-health-entry', data);
    triggerRefresh();
  };

  const handleSaveDailyLog = useCallback(async () => {
    const now = new Date().toISOString();
    const average = Math.round((metrics.energy + metrics.sleep + metrics.focus + metrics.recovery + metrics.mood) / 5);
    const entry: StoredHealthEntry = {
      id: crypto.randomUUID(),
      name: 'Check-in diario',
      tipo: 'humor',
      valor: average,
      data: todayKey,
      notas: dailyNotes || `Habitos: meditacao=${habits.meditation ? 'ok' : 'off'}, acucar=${habits.sugar ? 'ok' : 'off'}, hidratacao=${habits.hydration ? 'ok' : 'off'}`,
      createdAt: now,
      updatedAt: now,
    };
    await putHealthEntry(entry);
    showToast('Check-in diario salvo');
    triggerRefresh();
  }, [dailyNotes, habits, metrics, todayKey, triggerRefresh]);

  const tabs = [
    { id: 'daily', label: 'Registro Diario' },
    { id: 'trends', label: 'Tendencias & Insights' }
  ];
  const dailyAverage = Math.round((metrics.energy + metrics.sleep + metrics.focus + metrics.recovery + metrics.mood) / 5);
  const habitsCompleted = Object.values(habits).filter(Boolean).length;
  const streak = calculateHealthCheckinStreak(healthEntries);
  const weeklyHealth = summarizeWeeklyHealth(healthEntries, todayKey);

  // If active tab hasn't done its journey, show the journey
  if (!activeSetup.isSetupDone) {
    const journeyConfig = journeyMap[activeTab];
    if (journeyConfig) {
      return (
        <SectionJourney
          config={journeyConfig}
          onComplete={handleJourneyComplete}
          onSkip={activeSetup.markSkipped}
        />
      );
    }
  }

  return (
    <div className="flex flex-col h-full bg-bg-base font-sans text-text-primary overflow-hidden">
      {/* Navigation Tabs (Replaces Header) */}
      <div className="relative bg-bg-base shrink-0">
        <TabNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as any)}
            accentColor="orange"
            completedTabs={completedTabs}
            onRedoJourney={handleRedoJourney}
        />
        
        {/* Status Badge + NOVO button - Positioned absolutely to align with TabNav */}
        <div className="absolute top-0 right-6 h-full flex items-center gap-2 pointer-events-none">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all flex items-center gap-1 pointer-events-auto"
            >
              <Icon name="add" size="xs" />
              NOVO
            </button>
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
                        value={dailyNotes}
                        onChange={(e) => setDailyNotes(e.target.value)}
                        className="w-full h-[142px] bg-header-bg border border-border-panel border rounded-none py-3 px-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-accent-orange focus:border-accent-orange placeholder:text-text-secondary/30 resize-none custom-scrollbar text-text-primary" 
                        placeholder="Notas sobre o desempenho físico ou mental de hoje..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => void handleSaveDailyLog()}
                      className="px-10 py-4 bg-accent-orange text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
                    >
                      Salvar Registro
                    </button>
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
                        <span className="text-xs font-mono font-bold">{dailyAverage.toFixed(1)}</span>
                      </div>
                      <div className="w-full h-1 bg-border-panel">
                        <div className="h-full bg-accent-orange" style={{ width: `${dailyAverage * 10}%` }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">HÁBITOS</p>
                          <p className="text-lg font-mono font-black text-brand-mint">{habitsCompleted}/3</p>
                        </div>
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">Status</p>
                          <p className="text-lg font-mono font-black text-accent-blue">{dailyAverage >= 8 ? 'OTM' : dailyAverage >= 6 ? 'BOM' : 'ATN'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">CHECK-INS 7D</p>
                          <p className="text-lg font-mono font-black text-text-primary">{weeklyHealth.totalCheckins}</p>
                        </div>
                        <div className="bg-bg-base p-4 border border-border-panel">
                          <p className="text-[9px] uppercase font-bold text-text-secondary mb-1">MÉDIA 7D</p>
                          <p className="text-lg font-mono font-black text-accent-orange">{weeklyHealth.averageMood || '--'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-header-bg border border-border-panel p-6">
                  <SectionLabel className="text-[10px] mb-4">Dica de Performance</SectionLabel>
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {metrics.focus >= 8
                      ? <>Seu nível de <span className="text-accent-orange font-bold uppercase">foco cognitivo</span> está acima da média hoje. Considere priorizar tarefas de Deep Work no próximo bloco de 90 minutos.</>
                      : <>Seu foco está abaixo do ideal hoje. Reduza troca de contexto, proteja energia e priorize uma entrega menor, mas concluída.</>}
                  </p>
                </div>
                <div className="p-6 border border-dashed border-border-panel flex flex-col items-center gap-3">
                  <Icon name="sync" className="text-text-secondary" />
                  <p className="text-[9px] uppercase font-bold text-text-secondary tracking-widest text-center">
                    {streak > 0 ? `${streak} dias seguidos de check-in` : 'Nenhum check-in salvo ainda'}
                  </p>
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
          <Suspense fallback={<div className="min-h-[420px] flex items-center justify-center text-xs font-mono text-text-secondary animate-pulse">Carregando tendencias...</div>}>
            <HealthTrendsPanel />
          </Suspense>
        )}

      </div>

      <FormModal
        title="Novo Registro de Saude"
        fields={healthFields}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleHealthSubmit}
      />
    </div>
  );
};

export default Health;
