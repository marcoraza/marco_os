import React, { useState, useCallback } from 'react';
import { TabNav, FormModal, JourneyOverlay, JourneyTriggerButton } from './ui';
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
import { useTabSetup } from '../hooks/useTabSetup';
import {
  financeOverviewJourney,
  financeTransactionsJourney,
  financeDebtsJourney,
  financeCashflowJourney,
  financeInvestmentsJourney,
  financeCryptoJourney,
} from '../lib/journeyConfigs/finance';

const FINANCE_TAB_IDS = ['overview', 'transactions', 'debts', 'cashflow', 'investments', 'crypto'] as const;

const journeyMap: Record<string, import('../lib/journeyTypes').JourneyConfig> = {
  overview: financeOverviewJourney,
  transactions: financeTransactionsJourney,
  debts: financeDebtsJourney,
  cashflow: financeCashflowJourney,
  investments: financeInvestmentsJourney,
  crypto: financeCryptoJourney,
};

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<AssetAllocation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showJourney, setShowJourney] = useState(false);

  // Per-tab journey setup
  const overviewSetup = useTabSetup('finance', 'overview');
  const transactionsSetup = useTabSetup('finance', 'transactions');
  const debtsSetup = useTabSetup('finance', 'debts');
  const cashflowSetup = useTabSetup('finance', 'cashflow');
  const investmentsSetup = useTabSetup('finance', 'investments');
  const cryptoSetup = useTabSetup('finance', 'crypto');

  const setupMap: Record<string, ReturnType<typeof useTabSetup>> = {
    overview: overviewSetup,
    transactions: transactionsSetup,
    debts: debtsSetup,
    cashflow: cashflowSetup,
    investments: investmentsSetup,
    crypto: cryptoSetup,
  };

  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const activeSetup = setupMap[activeTab];

  // Which tabs have completed their journey
  const completedTabs = FINANCE_TAB_IDS.filter(
    id => localStorage.getItem(`section_setup_done_finance_${id}`) === '1'
  );

  const handleRedoJourney = useCallback((tabId: string) => {
    const setup = setupMap[tabId];
    if (setup) setup.reset();
  }, [setupMap]);

  const handleJourneyComplete = useCallback(() => {
    activeSetup.markDone();
    triggerRefresh();
  }, [activeSetup, triggerRefresh]);

  return (
    <>
      {showJourney && journeyMap[activeTab] && (
        <JourneyOverlay
          config={journeyMap[activeTab]}
          isOpen={showJourney}
          onClose={() => setShowJourney(false)}
          onComplete={() => { handleJourneyComplete(); setShowJourney(false); }}
        />
      )}

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans h-full overflow-y-auto relative">
        <div className="flex flex-col gap-6 h-full">

          <div className="shrink-0 flex items-center gap-3">
            <div className="flex-1">
              <TabNav
                tabs={financeTabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as FinanceTab)}
                accentColor={getAccentColor(activeTab)}
                completedTabs={completedTabs}
                onRedoJourney={handleRedoJourney}
              />
            </div>
            <JourneyTriggerButton
              isConfigured={activeSetup.isSetupDone}
              onClick={() => setShowJourney(true)}
              className="shrink-0"
            />
          </div>

          {activeTab === 'overview' && <FinanceOverview refreshKey={refreshKey} />}
          {activeTab === 'transactions' && <FinanceTransactions refreshKey={refreshKey} />}
          {activeTab === 'debts' && <FinanceDebts refreshKey={refreshKey} />}
          {activeTab === 'cashflow' && (
            <FinanceCashflow
              onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
              onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
              refreshKey={refreshKey}
            />
          )}
          {activeTab === 'investments' && (
            <FinanceInvestments
              onOpenInvestModal={() => setIsInvestModalOpen(true)}
              onSelectInvestment={setSelectedInvestment}
              refreshKey={refreshKey}
            />
          )}
          {activeTab === 'crypto' && <FinanceCrypto refreshKey={refreshKey} />}

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
    </>
  );
};

export default Finance;
