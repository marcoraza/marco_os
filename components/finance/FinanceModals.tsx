import React from 'react';
import { Icon } from '../ui';
import type { AssetAllocation } from './types';

interface FinanceModalsProps {
  isIncomeModalOpen: boolean;
  onCloseIncome: () => void;
  isExpenseModalOpen: boolean;
  onCloseExpense: () => void;
  isInvestModalOpen: boolean;
  onCloseInvest: () => void;
  selectedInvestment: AssetAllocation | null;
  onClearSelectedInvestment: () => void;
}

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border-panel rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function FinanceModals({
  isIncomeModalOpen, onCloseIncome,
  isExpenseModalOpen, onCloseExpense,
  isInvestModalOpen, onCloseInvest,
  selectedInvestment, onClearSelectedInvestment,
}: FinanceModalsProps) {
  const handleCloseInvest = () => { onCloseInvest(); onClearSelectedInvestment(); };

  return (
    <>
      {isIncomeModalOpen && (
        <ModalShell onClose={onCloseIncome}>
          <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="add_circle" className="text-brand-mint" /> Novo Recebimento</h3>
            <button onClick={onCloseIncome} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">DESCRIÇÃO</label><input type="text" placeholder="Ex: Salário, Freelance..." className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-brand-mint outline-none transition-colors" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-brand-mint outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Data</label><input type="date" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-brand-mint outline-none transition-colors" /></div></div>
            <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">CATEGORIA</label><select className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-brand-mint outline-none transition-colors"><option>SALÁRIO</option><option>Freelance</option><option>Investimentos</option><option>Outros</option></select></div>
          </div>
          <div className="p-6 border-t border-border-panel bg-header-bg flex justify-end gap-3"><button onClick={onCloseIncome} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Cancelar</button><button className="px-6 py-2 rounded-sm bg-brand-mint text-black text-xs font-bold uppercase hover:bg-brand-mint/80 transition-colors shadow-lg shadow-brand-mint/20">Confirmar</button></div>
        </ModalShell>
      )}

      {isExpenseModalOpen && (
        <ModalShell onClose={onCloseExpense}>
          <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="remove_circle" className="text-accent-red" /> Adicionar Custo</h3>
            <button onClick={onCloseExpense} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">DESCRIÇÃO</label><input type="text" placeholder="Ex: Aluguel, Mercado..." className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-red outline-none transition-colors" /></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-red outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Data</label><input type="date" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-accent-red outline-none transition-colors" /></div></div>
            <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Categoria</label><select className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-accent-red outline-none transition-colors"><option>Moradia</option><option>ALIMENTAÇÃO</option><option>Transporte</option><option>Lazer</option><option>SAÚDE</option></select></div>
          </div>
          <div className="p-6 border-t border-border-panel bg-header-bg flex justify-end gap-3"><button onClick={onCloseExpense} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Cancelar</button><button className="px-6 py-2 rounded-sm bg-accent-red text-white text-xs font-bold uppercase hover:bg-accent-red/90 transition-colors shadow-lg shadow-accent-red/20">Confirmar</button></div>
        </ModalShell>
      )}

      {(isInvestModalOpen || selectedInvestment) && (
        <ModalShell onClose={handleCloseInvest}>
          <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Icon name={selectedInvestment ? 'query_stats' : 'add_circle'} className="text-accent-purple" />
              {selectedInvestment ? selectedInvestment.name : 'Novo Ativo'}
            </h3>
            <button onClick={handleCloseInvest} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
          </div>
          <div className="p-6 space-y-6">
            {selectedInvestment ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedInvestment.color.replace('bg-', 'text-')} bg-header-bg border border-border-panel`}>
                    <Icon name={selectedInvestment.icon} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary uppercase font-bold">Valor Atual</p>
                    <p className="text-2xl font-mono font-bold text-text-primary">R$ {selectedInvestment.value.toLocaleString()}</p>
                  </div>
                </div>
                <div className="h-32 w-full bg-header-bg rounded-md border border-border-panel relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path d="M0,40 Q25,10 50,25 T100,5" fill="none" className="stroke-accent-purple" strokeWidth="2" />
                    <path d="M0,40 Q25,10 50,25 T100,5 V50 H0 Z" fill="url(#investGradient)" opacity="0.3" />
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-header-bg rounded-md border border-border-panel">
                    <p className="text-[10px] text-text-secondary uppercase font-bold">Retorno</p>
                    <p className={`text-sm font-bold ${selectedInvestment.returns.includes('+') ? 'text-brand-mint' : 'text-accent-red'}`}>{selectedInvestment.returns}</p>
                  </div>
                  <div className="p-3 bg-header-bg rounded-md border border-border-panel">
                    <p className="text-[10px] text-text-secondary uppercase font-bold">Risco</p>
                    <p className="text-sm font-bold text-text-primary">{selectedInvestment.risk}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Nome do Ativo</label><input type="text" placeholder="Ex: PETR4, AAPL..." className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-purple outline-none transition-colors" /></div>
                <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Quantidade</label><input type="number" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-purple outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">PREÇO MÉDIO</label><input type="number" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-purple outline-none transition-colors" /></div></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">CLASSE</label><select className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-accent-purple outline-none transition-colors"><option>AÇÕES BR</option><option>Stocks</option><option>FIIs</option><option>Cripto</option></select></div>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-border-panel bg-header-bg flex justify-end gap-3">
            <button onClick={handleCloseInvest} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Fechar</button>
            {!selectedInvestment && <button className="px-6 py-2 rounded-sm bg-accent-purple text-white text-xs font-bold uppercase hover:bg-accent-purple/90 transition-colors shadow-lg shadow-accent-purple/20">Salvar Ativo</button>}
          </div>
        </ModalShell>
      )}
    </>
  );
}
