import React, { useState } from 'react';
import { TabNav } from './ui';
import { financeTabs } from './finance/data';
import { getAccentColor } from './finance/utils';
import type { FinanceTab, AssetAllocation } from './finance/types';
import FinanceOverview from './finance/FinanceOverview';
import FinanceTransactions from './finance/FinanceTransactions';
import FinanceDebts from './finance/FinanceDebts';
import FinanceCashflow from './finance/FinanceCashflow';
import FinanceInvestments from './finance/FinanceInvestments';
import FinanceCrypto from './finance/FinanceCrypto';
import FinanceModals from './finance/FinanceModals';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<AssetAllocation | null>(null);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans h-full overflow-y-auto relative">
      <div className="flex flex-col gap-6 h-full">

        <div className="shrink-0">
          <TabNav
            tabs={financeTabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as FinanceTab)}
            accentColor={getAccentColor(activeTab)}
          />
        </div>

        {activeTab === 'overview' && <FinanceOverview />}
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
    </div>
  );
};

export default Finance;
