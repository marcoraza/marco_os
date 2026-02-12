import React from 'react';
import { Icon, SectionLabel, StatusDot } from './ui';

interface MissionDetailProps {
  onBack: () => void;
}

const MissionDetail: React.FC<MissionDetailProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* Header View */}
      <header className="h-16 bg-header-bg border-b border-border-panel px-8 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-brand-mint transition-colors group">
            <Icon name="arrow_back" />
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
          </button>
          <div className="h-6 w-px bg-border-panel"></div>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">Detalhe da Missão</h1>
            <span className="px-3 py-1 bg-accent-blue text-white text-[10px] font-black uppercase tracking-widest rounded-sm">Em Andamento</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border-panel rounded-sm">
            <StatusDot color="mint" pulse />
            <span className="text-[10px] uppercase font-bold text-brand-mint tracking-tight">Sync Active</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center border border-border-panel hover:border-brand-mint transition-colors rounded-sm text-text-secondary hover:text-text-primary">
            <Icon name="more_vert" size="sm" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Details) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Info Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-panel border border-border-panel rounded-sm overflow-hidden">
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Responsável</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-brand-mint/20 flex items-center justify-center rounded-sm">
                    <Icon name="person" className="text-brand-mint text-xs" />
                  </div>
                  <p className="text-xs font-bold text-text-primary uppercase">Cpt. Weaver</p>
                </div>
              </div>
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Prioridade</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent-red rounded-sm"></div>
                  <p className="text-xs font-bold text-text-primary uppercase">Crítica / Nível 01</p>
                </div>
              </div>
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Energia</p>
                <div className="flex items-center gap-2 text-brand-mint">
                  <Icon name="bolt" size="sm" />
                  <p className="text-xs font-bold uppercase">850 kWh</p>
                </div>
              </div>
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Prazo Final</p>
                <p className="text-xs font-bold text-text-primary font-mono">24.MAI.2024 - 18:00</p>
              </div>
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Pontos</p>
                <p className="text-xs font-bold text-text-primary font-mono">1.250 XP</p>
              </div>
              <div className="bg-surface p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-text-secondary tracking-widest">Espaço</p>
                <div className="flex items-center gap-2 text-text-secondary">
                  <Icon name="location_on" size="sm" />
                  <p className="text-xs font-bold uppercase">Setor-G / Lab 04</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="space-y-4">
              <SectionLabel className="text-brand-mint">Descrição da Missão</SectionLabel>
              <div className="bg-surface p-8 border border-border-panel rounded-sm">
                <p className="text-sm leading-relaxed text-text-primary mb-4">
                  A neutralização do vazamento de plasma no Setor-G é imperativa para a estabilidade do reator principal. A equipe deve proceder com trajes de isolamento nível 4 e garantir que todos os protocolos de contenção sejam seguidos.
                </p>
                <p className="text-sm leading-relaxed text-text-primary">
                  Após a contenção, a recalibragem dos sensores de pressão deve ser executada manualmente via console de emergência. Falha no procedimento pode resultar em despressurização catastrófica da ala leste.
                </p>
              </div>
            </section>

            {/* Subtasks */}
            <section className="space-y-4">
              <SectionLabel className="text-brand-mint">Subtarefas Operacionais</SectionLabel>
              <div className="space-y-2">
                <div className="bg-surface border border-border-panel p-4 flex items-center justify-between group rounded-sm hover:border-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-brand-mint flex items-center justify-center rounded-sm cursor-pointer">
                        <Icon name="check" className="text-black text-sm font-bold" />
                    </div>
                    <span className="text-sm font-medium text-text-primary line-through opacity-50">Isolamento térmico do duto primário</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-mint/10 text-brand-mint border border-brand-mint/20 rounded-sm">Concluído</span>
                </div>
                
                <div className="bg-surface border border-border-panel p-4 flex items-center justify-between rounded-sm hover:border-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-border-panel hover:border-brand-mint flex items-center justify-center rounded-sm cursor-pointer transition-colors"></div>
                    <span className="text-sm font-medium text-text-primary">Drenagem do resíduo radioativo (Tanque B)</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent-orange/10 text-accent-orange border border-accent-orange/20 rounded-sm">Em Espera</span>
                </div>

                <div className="bg-surface border border-border-panel p-4 flex items-center justify-between rounded-sm hover:border-surface-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-border-panel hover:border-brand-mint flex items-center justify-center rounded-sm cursor-pointer transition-colors"></div>
                    <span className="text-sm font-medium text-text-primary">Inspeção visual de juntas de vedação</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-text-secondary/10 text-text-secondary border border-text-secondary/20 rounded-sm">Pendente</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (Timeline) */}
          <aside className="space-y-4 flex flex-col h-full">
            <SectionLabel className="text-brand-mint">Timeline de Atividade</SectionLabel>
            
            <div className="bg-surface border border-border-panel p-6 rounded-sm flex-grow">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-border-panel">
                
                {/* Item 1 */}
                <div className="relative pl-10">
                  <StatusDot color="mint" glow className="absolute left-1.5 top-1 z-10" size="md" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-brand-mint">HOJE - 14:22</p>
                    <p className="text-xs font-bold uppercase text-text-primary">Relatório de Status Enviado</p>
                    <p className="text-[11px] text-text-secondary leading-snug">Cpt. Weaver atualizou o progresso da tarefa de isolamento térmico.</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-border-panel rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-text-secondary">HOJE - 11:05</p>
                    <p className="text-xs font-bold uppercase text-text-primary">Missão Inicializada</p>
                    <p className="text-[11px] text-text-secondary leading-snug">Sistema Marco OS registrou a abertura oficial deste ticket operacional.</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-border-panel rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-text-secondary">ONTEM - 23:45</p>
                    <p className="text-xs font-bold uppercase text-text-primary">Alerta de Sistema Detectado</p>
                    <p className="text-[11px] text-text-secondary leading-snug">Sensores de pressão dispararam sinal de anomalia no Setor-G.</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative pl-10 opacity-30">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-border-panel rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-text-secondary">HISTÓRICO</p>
                    <p className="text-xs font-bold uppercase text-text-primary">Dados Consolidados</p>
                  </div>
                </div>

              </div>
            </div>

            <button className="w-full py-4 bg-brand-mint text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(0,255,149,0.3)]">
              <Icon name="send" className="text-sm font-bold" />
              Enviar Relatório Final
            </button>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border-panel bg-header-bg text-center shrink-0">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center border border-brand-mint rounded-sm">
            <span className="text-brand-mint font-black text-xs">M</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">© 2024 MARCO OS • OPERAÇÕES TÁTICAS • BEATPORT EDITION</p>
        </div>
      </footer>
    </div>
  );
};

export default MissionDetail;