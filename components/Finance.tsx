import React, { useState } from 'react';
import { TabNav, FormModal, showToast } from './ui';
import { financeTabs } from './finance/data';
import { getAccentColor } from './finance/utils';
import type { FinanceTab, AssetAllocation } from './finance/types';
import FinanceOverview from './finance/FinanceOverview';
import FinanceTransactions from './finance/FinanceTransactions';
import FinanceDebts from './finance/FinanceDebts';
import FinanceCashflow from './finance/FinanceCashflow';
import FinanceInvestments from './finance/FinanceInvestments';
import FinanceCrypto from './finance/FinanceCrypto';
import FinancePatrimonio from './finance/FinancePatrimonio';
import FinanceModals from './finance/FinanceModals';
import { financeConfig } from '../lib/formConfigs';
import { syncToNotion } from '../lib/notionSync';
import { putFinanceEntry } from '../data/repository';
import type { StoredFinanceEntry } from '../data/models';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<AssetAllocation | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleFinanceSubmit = async (data: Record<string, unknown>) => {
    const entry: StoredFinanceEntry = {
      id: crypto.randomUUID(),
      name: String(data.name ?? ''),
      valor: String(data.valor ?? ''),
      tipo: String(data.tipo ?? ''),
      categoria: String(data.categoria ?? ''),
      data: String(data.data ?? ''),
      recorrente: Boolean(data.recorrente),
      createdAt: new Date().toISOString(),
    };
    await putFinanceEntry(entry);
    syncToNotion('financas', data);
    showToast('Transação salva');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans h-full overflow-y-auto relative">
      <div className="flex flex-col gap-6 h-full">

        <div className="shrink-0 flex items-center gap-2">
          <div className="flex-1">
            <TabNav
              tabs={financeTabs}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as FinanceTab)}
              accentColor={getAccentColor(activeTab)}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-sm text-[9px] font-bold uppercase tracking-widest bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none shrink-0"
            aria-label="Nova transação"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            Novo
          </button>
        </div>

        {activeTab === 'overview' && <FinanceOverview />}
        {activeTab === 'patrimonio' && <FinancePatrimonio />}
        {activeTab === 'transactions' && <FinanceTransactions />}
        {activeTab === 'debts' && <FinanceDebts />}
        {activeTab === 'cashflow' && (
          <FinanceCashflow
            onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
            onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
          />
        )}
        {activeTab === 'investments' && (
          <FinanceInvestments
            onOpenInvestModal={() => setIsInvestModalOpen(true)}
            onSelectInvestment={setSelectedInvestment}
          />
        )}
        {activeTab === 'crypto' && <FinanceCrypto />}

      </div>

      <FinanceModals
        isIncomeModalOpen={isIncomeModalOpen}
        onCloseIncome={() => setIsIncomeModalOpen(false)}
        isExpenseModalOpen={isExpenseModalOpen}
        onCloseExpense={() => setIsExpenseModalOpen(false)}
        isInvestModalOpen={isInvestModalOpen}
        onCloseInvest={() => setIsInvestModalOpen(false)}
        selectedInvestment={selectedInvestment}
        onClearSelectedInvestment={() => setSelectedInvestment(null)}
      />

      <FormModal
        title={financeConfig.title}
        fields={financeConfig.fields}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFinanceSubmit}
      />
    </div>
  );
};

export default Finance;
