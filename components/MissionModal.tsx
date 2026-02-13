import React, { useState } from 'react';
import { Icon, Badge } from './ui';

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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal Content - Bottom Sheet on Mobile, Centered Card on Desktop */}
      <div className="relative w-full md:max-w-2xl bg-surface rounded-t-xl md:rounded-xl border-t md:border border-border-panel shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-200 max-h-[90vh] md:max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b border-border-panel shrink-0">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <Icon name="add_task" className="text-accent-blue" />
            NOVA MISSÃO
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-border-panel">
            <Icon name="close" />
          </button>
        </div>

        {/* Body - Scrollable Area */}
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Título da Missão</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text" 
                placeholder="Ex: Finalizar relatório financeiro Q3" 
                className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors placeholder-text-secondary focus:ring-1 focus:ring-accent-blue"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Descrição</label>
              <textarea 
                placeholder="Adicione detalhes, links ou sub-tarefas necessárias..." 
                rows={3}
                className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors placeholder-text-secondary resize-none focus:ring-1 focus:ring-accent-blue"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Space */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Espaço</label>
                <div className="relative">
                  <select className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary appearance-none focus:outline-none focus:border-accent-blue cursor-pointer">
                    <option>🏢 Trabalho</option>
                    <option>🏠 Pessoal</option>
                    <option>🚀 Side Project</option>
                  </select>
                  <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-sm" />
                </div>
              </div>

              {/* Responsible */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Responsável</label>
                <div className="flex items-center w-full bg-header-bg border border-border-panel rounded-md px-3 py-2.5 cursor-pointer hover:border-text-secondary transition-colors">
                  <div className="w-6 h-6 rounded-full bg-border-panel mr-3 border border-text-secondary"></div>
                  <span className="text-sm text-text-primary flex-1">Marco Silva</span>
                  <Icon name="expand_more" className="text-text-secondary text-sm" />
                </div>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Prioridade</label>
              <div className="grid grid-cols-4 gap-2">
                {['urgente', 'alta', 'normal', 'baixa'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2.5 rounded-sm text-[10px] md:text-xs font-bold uppercase transition-all border ${
                      priority === p 
                      ? p === 'urgente' ? 'bg-accent-red border-accent-red text-white' 
                        : p === 'alta' ? 'bg-accent-orange border-accent-orange text-black'
                        : 'bg-accent-blue border-accent-blue text-white'
                      : 'bg-header-bg border-border-panel text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Nível de Energia</label>
              <div className="flex gap-3">
                {['low', 'medium', 'high'].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEnergy(e)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-sm border text-xs font-bold uppercase transition-all ${
                      energy === e
                      ? e === 'low' ? 'bg-green-900/30 text-green-500 border-green-500/50'
                        : e === 'medium' ? 'bg-yellow-900/30 text-yellow-500 border-yellow-500/50'
                        : 'bg-red-900/30 text-red-500 border-red-500/50'
                      : 'bg-header-bg border-border-panel text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon name={e === 'low' ? 'battery_1_bar' : e === 'medium' ? 'battery_4_bar' : 'battery_full'} size="sm" />
                    {e === 'low' ? 'Baixa' : e === 'medium' ? 'Média' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Date */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Prazo</label>
                <input 
                  type="date" 
                  className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors scheme-dark"
                />
              </div>

              {/* Points */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Estimativa (Pontos)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-border-panel rounded-md appearance-none cursor-pointer accent-accent-blue"
                  />
                  <span className="text-sm font-bold text-accent-blue border border-border-panel px-3 py-1 rounded-sm bg-header-bg min-w-[40px] text-center">{points}</span>
                </div>
              </div>
            </div>

            {/* Recurrence (Toggle) */}
            <div className="flex items-center justify-between py-2 border-t border-b border-border-panel">
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer toggle-checkbox" />
                        <div className="w-11 h-6 bg-border-panel peer-focus:outline-none rounded-full peer toggle-label after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                    <span className="text-sm font-medium text-text-primary">Missão Recorrente</span>
                </div>
                <select className="bg-transparent text-base md:text-sm text-text-secondary focus:outline-none cursor-pointer text-right dir-rtl border-none">
                    <option>Semanalmente</option>
                    <option>Diariamente</option>
                    <option>Mensalmente</option>
                </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Tags</label>
              <div className="flex flex-wrap gap-2 p-2 bg-header-bg border border-border-panel rounded-md min-h-[48px]">
                <Badge variant="blue" className="normal-case">
                  #financeiro
                  <button type="button" className="ml-1 hover:text-text-primary"><Icon name="close" size="xs" /></button>
                </Badge>
                <input type="text" placeholder="+ Adicionar tag" className="flex-1 bg-transparent border-none text-base md:text-sm focus:ring-0 text-text-primary p-0 min-w-[100px] placeholder-text-secondary focus:outline-none" />
              </div>
            </div>

          </form>
        </div>

        {/* Footer - Always visible/Sticky behavior via flex layout */}
        <div className="px-4 py-4 md:px-6 md:py-5 bg-header-bg border-t border-border-panel flex items-center justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-sm text-sm font-medium text-text-secondary hover:bg-border-panel hover:text-text-primary transition-colors"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-sm text-sm font-bold bg-accent-blue hover:bg-accent-blue-dim text-white shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Icon name="rocket_launch" size="sm" />
            CRIAR MISSÃO
          </button>
        </div>

      </div>
    </div>
  );
};

export default MissionModal;