import React from 'react';
import { Icon, Badge, Card } from '../ui';
import { detailedTransactions } from './data';
import { formatBRL } from './utils';

export default function FinanceTransactions() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <Card className="flex justify-between items-center p-4">
        <h2 className="text-lg font-black text-text-primary uppercase tracking-wide flex items-center gap-2"><Icon name="receipt_long" className="text-brand-mint" /> TODAS AS TRANSAÇÕES</h2>
        <div className="flex gap-3">
          <input type="text" placeholder="Buscar..." className="bg-header-bg border border-border-panel rounded-md px-3 py-1.5 text-base md:text-sm text-text-primary focus:border-brand-mint outline-none" />
          <button className="bg-brand-mint text-black px-4 py-1.5 rounded-sm text-xs font-bold uppercase hover:bg-brand-mint/80 transition-colors">Exportar CSV</button>
        </div>
      </Card>
      <Card className="overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[500px] sm:min-w-full">
          <thead className="bg-surface-hover text-text-secondary text-xs uppercase font-bold border-b border-border-panel">
            <tr>
              <th className="p-4">Descrição</th>
              <th className="p-4 hidden sm:table-cell">Categoria</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-center hidden md:table-cell">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-panel">
            {detailedTransactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-surface-hover transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-sm bg-header-bg border border-border-panel flex items-center justify-center ${tx.type === 'income' ? 'text-brand-mint' : 'text-accent-red'}`}>
                    <Icon name={tx.icon} size="sm" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{tx.title}</p>
                    <p className="text-xs text-text-secondary">{tx.merchant}</p>
                  </div>
                </td>
                <td className="p-4 text-sm text-text-primary hidden sm:table-cell">{tx.category}</td>
                <td className="p-4 text-sm text-text-secondary font-mono">{tx.date}</td>
                <td className={`p-4 text-right text-sm font-bold font-mono ${tx.type === 'income' ? 'text-brand-mint' : 'text-accent-red'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatBRL(Math.abs(tx.amount))}
                </td>
                <td className="p-4 text-center hidden md:table-cell">
                  <Badge variant={tx.status === 'completed' ? 'mint' : 'orange'}>
                    {tx.status === 'completed' ? 'Pago' : 'Processando'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
