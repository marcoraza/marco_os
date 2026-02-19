import React from 'react';
import { Icon, Badge, Card } from '../ui';
import { incomeSources, recurringExpenses } from './data';
import { formatBRL } from './utils';

interface FinanceCashflowProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
}

export default function FinanceCashflow({ onOpenIncomeModal, onOpenExpenseModal }: FinanceCashflowProps) {
  const totalReceived = incomeSources.reduce((acc, curr) => acc + curr.received, 0);
  const totalExpenses = recurringExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const maxBarValue = Math.max(totalReceived, totalExpenses) * 1.1;
  const netResult = totalReceived - totalExpenses;
  const savingsRate = totalReceived > 0 ? (netResult / totalReceived) * 100 : 0;
  const optimizationGoal = 30;

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* COL 1: INFLOWS */}
        <Card className="flex flex-col overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border-panel bg-header-bg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="arrow_downward" className="text-brand-mint" /> Entradas</h3>
              <button onClick={onOpenIncomeModal} className="text-brand-mint hover:text-text-primary transition-colors bg-brand-mint/10 p-1.5 rounded-sm hover:bg-brand-mint/20"><Icon name="add" size="lg" /></button>
            </div>
            <p className="text-2xl font-mono font-bold text-brand-mint">{formatBRL(totalReceived)}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
            {incomeSources.map((source, idx) => (
              <div key={idx} className="bg-header-bg p-3 rounded-md border border-border-panel flex justify-between items-center group hover:border-brand-mint/30 transition-colors">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-sm bg-surface flex items-center justify-center text-brand-mint border border-border-panel"><Icon name={source.icon} size="sm" /></div><div><p className="text-xs font-bold text-text-primary">{source.name}</p><p className="text-[10px] text-text-secondary">Data: {source.date}</p></div></div>
                <div className="text-right"><p className="text-xs font-mono font-bold text-brand-mint">+ R$ {source.expected}</p><Badge variant={source.status === 'received' ? 'mint' : 'neutral'}>{source.status === 'received' ? 'Recebido' : 'A Receber'}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
        {/* COL 2: OUTFLOWS */}
        <Card className="flex flex-col overflow-hidden shadow-lg">
          <div className="p-6 border-b border-border-panel bg-header-bg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="arrow_upward" className="text-accent-red" /> SAÍDAS</h3>
              <button onClick={onOpenExpenseModal} className="text-accent-red hover:text-text-primary transition-colors bg-accent-red/10 p-1.5 rounded-sm hover:bg-accent-red/20"><Icon name="add" size="lg" /></button>
            </div>
            <p className="text-2xl font-mono font-bold text-accent-red">- {formatBRL(totalExpenses)}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
            {recurringExpenses.map((expense, idx) => (
              <div key={idx} className="bg-header-bg p-3 rounded-md border border-border-panel flex justify-between items-center group hover:border-accent-red/30 transition-colors">
                <div><p className="text-xs font-bold text-text-primary">{expense.name}</p><p className="text-[10px] text-text-secondary">Vencimento: {expense.date}</p></div>
                <div className="text-right"><p className="text-xs font-mono font-bold text-accent-red">- R$ {expense.amount}</p><Badge variant={expense.status === 'paid' ? 'red' : 'neutral'}>{expense.status === 'paid' ? 'Pago' : 'Agendado'}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
        {/* COL 3: ANALYSIS */}
        <Card className="flex flex-col p-6 overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-6"><h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="analytics" className="text-accent-blue" /> ANÁLISE DE FLUXO</h3></div>
          <div className="flex-1 flex items-end justify-center gap-4 sm:gap-8 px-4 relative">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0 pb-6"><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div></div>
            <div className="flex flex-col items-center gap-2 z-10 w-16 group"><span className="text-[10px] font-bold text-brand-mint opacity-0 group-hover:opacity-100 transition-opacity">{(totalReceived/maxBarValue*100).toFixed(0)}%</span><div className="w-full bg-brand-mint rounded-t-sm relative transition-all duration-500" style={{height: `${(totalReceived/maxBarValue)*100}%`}}><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div></div><span className="text-[10px] font-bold text-text-secondary uppercase">Entradas</span></div>
            <div className="flex flex-col items-center gap-2 z-10 w-16 group"><span className="text-[10px] font-bold text-accent-red opacity-0 group-hover:opacity-100 transition-opacity">{(totalExpenses/maxBarValue*100).toFixed(0)}%</span><div className="w-full bg-accent-red rounded-t-sm relative transition-all duration-500" style={{height: `${(totalExpenses/maxBarValue)*100}%`}}><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div></div><span className="text-[10px] font-bold text-text-secondary uppercase">SAÍDAS</span></div>
          </div>
          <div className="mt-6 pt-6 border-t border-border-panel space-y-4">
            <div className="flex justify-between items-center"><span className="text-xs text-text-secondary font-bold uppercase tracking-wide">SALDO LÍQUIDO</span><span className={`text-sm font-mono font-bold ${netResult >= 0 ? 'text-accent-blue' : 'text-accent-red'}`}>{netResult >= 0 ? '+' : ''} {formatBRL(netResult)}</span></div>
            <div className="bg-header-bg p-3 rounded-md border border-border-panel"><p className="text-[10px] text-text-primary leading-snug"><span className="text-brand-mint font-bold uppercase mr-1">Insight:</span> Suas despesas representam <span className="text-accent-red font-bold">{((totalExpenses/totalReceived)*100).toFixed(1)}%</span> da sua receita total. Fluxo saudável.</p></div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <Card className="p-4 flex items-center justify-between shadow-sm"><div><p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Crescimento Entradas</p><p className="text-lg font-mono font-bold text-text-primary">+12.5%</p></div><div className="w-8 h-8 rounded-sm bg-brand-mint/10 flex items-center justify-center text-brand-mint"><Icon name="trending_up" size="sm" /></div></Card>
        <Card className="p-4 flex items-center justify-between shadow-sm"><div><p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">CRESCIMENTO SAÍDAS</p><p className="text-lg font-mono font-bold text-accent-red">+3.2%</p></div><div className="w-8 h-8 rounded-sm bg-accent-red/10 flex items-center justify-center text-accent-red"><Icon name="trending_up" size="sm" /></div></Card>
        <Card className="p-4 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10"><div><p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">META DE OTIMIZAÇÃO</p><p className="text-lg font-mono font-bold text-accent-purple">{savingsRate.toFixed(1)}% / {optimizationGoal}%</p></div><div className="w-8 h-8 rounded-sm bg-accent-purple/10 flex items-center justify-center text-accent-purple"><Icon name="savings" size="sm" /></div></div>
          <div className="w-full bg-border-panel h-1 rounded-full mt-3 overflow-hidden relative z-10"><div className="bg-accent-purple h-full rounded-full transition-all duration-1000" style={{width: `${Math.min((savingsRate/optimizationGoal)*100, 100)}%`}}></div></div>
        </Card>
      </div>
    </div>
  );
}
