import React, { useState } from 'react';

interface MissionModalProps {
  onClose: () => void;
  onSave: (mission: any) => void;
}

const MissionModal: React.FC<MissionModalProps> = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('normal');
  const [energy, setEnergy] = useState('medium');
  const [points, setPoints] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, priority, energy, points, tag: 'GERAL' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0A84FF]">add_task</span>
            NOVA MISSÃO
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#2A2A2A]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Título da Missão</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                placeholder="Ex: Finalizar relatório financeiro Q3" 
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors placeholder-gray-600 focus:ring-1 focus:ring-[#0A84FF]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Descrição</label>
              <textarea 
                placeholder="Adicione detalhes, links ou sub-tarefas necessárias..." 
                rows={3}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors placeholder-gray-600 resize-none focus:ring-1 focus:ring-[#0A84FF]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Space */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Espaço</label>
                <div className="relative">
                  <select className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#0A84FF] cursor-pointer">
                    <option>🏢 Trabalho</option>
                    <option>🏠 Pessoal</option>
                    <option>🚀 Side Project</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm">expand_more</span>
                </div>
              </div>

              {/* Responsible */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Responsável</label>
                <div className="flex items-center w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-3 py-2.5 cursor-pointer hover:border-gray-600 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gray-700 mr-3 border border-gray-600"></div>
                  <span className="text-sm text-white flex-1">Marco Silva</span>
                  <span className="material-symbols-outlined text-gray-500 text-sm">expand_more</span>
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Prioridade</label>
              <div className="grid grid-cols-4 gap-2">
                {['urgente', 'alta', 'normal', 'baixa'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-lg text-xs font-bold uppercase transition-all border ${
                      priority === p 
                      ? p === 'urgente' ? 'bg-[#FF453A] border-[#FF453A] text-white' 
                        : p === 'alta' ? 'bg-[#FF9F0A] border-[#FF9F0A] text-black'
                        : 'bg-[#0A84FF] border-[#0A84FF] text-white'
                      : 'bg-[#121212] border-[#2A2A2A] text-gray-500 hover:bg-[#222]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Nível de Energia</label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEnergy(e)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                      energy === e
                      ? e === 'low' ? 'bg-green-900/30 text-green-500 border-green-500/50'
                        : e === 'medium' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50'
                        : 'bg-red-900/30 text-red-500 border-red-500/50'
                      : 'bg-[#121212] border-[#2A2A2A] text-gray-500 hover:bg-[#222]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {e === 'low' ? 'battery_1_bar' : e === 'medium' ? 'battery_4_bar' : 'battery_full'}
                    </span>
                    {e === 'low' ? 'Baixa' : e === 'medium' ? 'Média' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Prazo</label>
                <input 
                  type="date" 
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors scheme-dark"
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Estimativa (Pontos)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#0A84FF]"
                  />
                  <span className="text-sm font-bold text-[#0A84FF] border border-[#2A2A2A] px-3 py-1 rounded bg-[#121212] min-w-[40px] text-center">{points}</span>
                </div>
              </div>
            </div>

            {/* Recurrence (Toggle) */}
            <div className="flex items-center justify-between py-2 border-t border-b border-[#2A2A2A]">
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer toggle-checkbox" />
                        <div className="w-11 h-6 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer toggle-label after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                    <span className="text-sm font-medium text-gray-300">Missão Recorrente</span>
                </div>
                <select className="bg-transparent text-sm text-gray-500 focus:outline-none cursor-pointer text-right dir-rtl border-none">
                    <option>Semanalmente</option>
                    <option>Diariamente</option>
                    <option>Mensalmente</option>
                </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 bg-[#121212] border border-[#2A2A2A] rounded-lg min-h-[48px]">
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#0A84FF]/20 text-[#0A84FF] text-xs font-bold border border-[#0A84FF]/30">
                  #financeiro
                  <button type="button" className="ml-1 hover:text-white"><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
                <input type="text" placeholder="+ Adicionar tag" className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-white p-0 min-w-[100px] placeholder-gray-600 focus:outline-none" />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-[#151515] border-t border-[#2A2A2A] flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-[#0A84FF] hover:bg-[#0074E0] text-white shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            CRIAR MISSÃO
          </button>
        </div>

      </div>
    </div>
  );
};

export default MissionModal;