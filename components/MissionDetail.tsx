import React from 'react';

interface MissionDetailProps {
  onBack: () => void;
}

const MissionDetail: React.FC<MissionDetailProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-[#0D0D0F]">
      {/* Header View */}
      <header className="h-16 bg-[#121212] border-b border-[#2A2A2A] px-8 flex items-center justify-between sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="flex items-center gap-2 text-[#8E8E93] hover:text-[#00FF95] transition-colors group">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Voltar</span>
          </button>
          <div className="h-6 w-px bg-[#2A2A2A]"></div>
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-[#E1E1E1]">Detalhe da Missão</h1>
            <span className="px-3 py-1 bg-[#0A84FF] text-white text-[10px] font-black uppercase tracking-widest rounded-sm">Em Andamento</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded-sm">
            <span className="w-1.5 h-1.5 bg-[#00FF95] rounded-full animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold text-[#00FF95] tracking-tight">Sync Active</span>
          </div>
          <button className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] hover:border-[#00FF95] transition-colors rounded-sm text-[#8E8E93] hover:text-[#E1E1E1]">
            <span className="material-symbols-outlined text-sm">more_vert</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN (Details) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Info Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2A2A2A] border border-[#2A2A2A] rounded-sm overflow-hidden">
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Responsável</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#00FF95]/20 flex items-center justify-center rounded-sm">
                    <span className="material-symbols-outlined text-[#00FF95] text-xs">person</span>
                  </div>
                  <p className="text-xs font-bold text-[#E1E1E1] uppercase">Cpt. Weaver</p>
                </div>
              </div>
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Prioridade</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FF375F] rounded-sm"></div>
                  <p className="text-xs font-bold text-[#E1E1E1] uppercase">Crítica / Nível 01</p>
                </div>
              </div>
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Energia</p>
                <div className="flex items-center gap-2 text-[#00FF95]">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <p className="text-xs font-bold uppercase">850 kWh</p>
                </div>
              </div>
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Prazo Final</p>
                <p className="text-xs font-bold text-[#E1E1E1] font-mono">24.MAI.2024 - 18:00</p>
              </div>
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Pontos</p>
                <p className="text-xs font-bold text-[#E1E1E1] font-mono">1.250 XP</p>
              </div>
              <div className="bg-[#1C1C1C] p-5 space-y-1">
                <p className="text-[9px] uppercase font-black text-[#8E8E93] tracking-widest">Espaço</p>
                <div className="flex items-center gap-2 text-[#8E8E93]">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  <p className="text-xs font-bold uppercase">Setor-G / Lab 04</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF95]">Descrição da Missão</h3>
              <div className="bg-[#1C1C1C] p-8 border border-[#2A2A2A] rounded-sm">
                <p className="text-sm leading-relaxed text-[#E1E1E1] mb-4">
                  A neutralização do vazamento de plasma no Setor-G é imperativa para a estabilidade do reator principal. A equipe deve proceder com trajes de isolamento nível 4 e garantir que todos os protocolos de contenção sejam seguidos.
                </p>
                <p className="text-sm leading-relaxed text-[#E1E1E1]">
                  Após a contenção, a recalibragem dos sensores de pressão deve ser executada manualmente via console de emergência. Falha no procedimento pode resultar em despressurização catastrófica da ala leste.
                </p>
              </div>
            </section>

            {/* Subtasks */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF95]">Subtarefas Operacionais</h3>
              <div className="space-y-2">
                <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-4 flex items-center justify-between group rounded-sm hover:border-[#333333] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-[#00FF95] flex items-center justify-center rounded-sm cursor-pointer">
                        <span className="material-symbols-outlined text-black text-sm font-bold">check</span>
                    </div>
                    <span className="text-sm font-medium text-[#E1E1E1] line-through opacity-50">Isolamento térmico do duto primário</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#00FF95]/10 text-[#00FF95] border border-[#00FF95]/20 rounded-sm">Concluído</span>
                </div>
                
                <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-4 flex items-center justify-between rounded-sm hover:border-[#333333] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-[#2A2A2A] hover:border-[#00FF95] flex items-center justify-center rounded-sm cursor-pointer transition-colors"></div>
                    <span className="text-sm font-medium text-[#E1E1E1]">Drenagem do resíduo radioativo (Tanque B)</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20 rounded-sm">Em Espera</span>
                </div>

                <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-4 flex items-center justify-between rounded-sm hover:border-[#333333] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 border-2 border-[#2A2A2A] hover:border-[#00FF95] flex items-center justify-center rounded-sm cursor-pointer transition-colors"></div>
                    <span className="text-sm font-medium text-[#E1E1E1]">Inspeção visual de juntas de vedação</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#8E8E93]/10 text-[#8E8E93] border border-[#8E8E93]/20 rounded-sm">Pendente</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN (Timeline) */}
          <aside className="space-y-4 flex flex-col h-full">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF95]">Timeline de Atividade</h3>
            
            <div className="bg-[#1C1C1C] border border-[#2A2A2A] p-6 rounded-sm flex-grow">
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-[#2A2A2A]">
                
                {/* Item 1 */}
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-[#00FF95] rounded-full shadow-[0_0_8px_rgba(0,255,149,0.5)] z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-[#00FF95]">HOJE - 14:22</p>
                    <p className="text-xs font-bold uppercase text-[#E1E1E1]">Relatório de Status Enviado</p>
                    <p className="text-[11px] text-[#8E8E93] leading-snug">Cpt. Weaver atualizou o progresso da tarefa de isolamento térmico.</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-[#2A2A2A] rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-[#8E8E93]">HOJE - 11:05</p>
                    <p className="text-xs font-bold uppercase text-[#E1E1E1]">Missão Inicializada</p>
                    <p className="text-[11px] text-[#8E8E93] leading-snug">Sistema Marco OS registrou a abertura oficial deste ticket operacional.</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="relative pl-10">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-[#2A2A2A] rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-[#8E8E93]">ONTEM - 23:45</p>
                    <p className="text-xs font-bold uppercase text-[#E1E1E1]">Alerta de Sistema Detectado</p>
                    <p className="text-[11px] text-[#8E8E93] leading-snug">Sensores de pressão dispararam sinal de anomalia no Setor-G.</p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="relative pl-10 opacity-30">
                  <div className="absolute left-1.5 top-1 w-2.5 h-2.5 bg-[#2A2A2A] rounded-full z-10"></div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-[#8E8E93]">HISTÓRICO</p>
                    <p className="text-xs font-bold uppercase text-[#E1E1E1]">Dados Consolidados</p>
                  </div>
                </div>

              </div>
            </div>

            <button className="w-full py-4 bg-[#00FF95] text-black text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(0,255,149,0.3)]">
              <span className="material-symbols-outlined text-sm font-bold">send</span>
              Enviar Relatório Final
            </button>
          </aside>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#2A2A2A] bg-[#121212] text-center shrink-0">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center border border-[#00FF95] rounded-sm">
            <span className="text-[#00FF95] font-black text-xs">M</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#8E8E93]">© 2024 MARCO OS • OPERAÇÕES TÁTICAS • BEATPORT EDITION</p>
        </div>
      </footer>
    </div>
  );
};

export default MissionDetail;