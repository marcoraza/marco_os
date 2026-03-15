import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { TabNav, Icon, FormModal, SectionJourney, showToast } from './ui';
import { financeTabs } from './finance/data';
import { getAccentColor } from './finance/utils';
import type { FinanceTab, AssetAllocation } from './finance/types';
import FinanceModals from './finance/FinanceModals';
import { financeFields } from '../lib/formConfigs';
import { putFinanceEntry } from '../data/repository';
import { syncToNotion } from '../lib/notionSync';
import type { StoredFinanceEntry } from '../data/models';
import { useTabSetup } from '../hooks/useTabSetup';
import {
  financeOverviewJourney,
  financeTransactionsJourney,
  financeDebtsJourney,
  financeCashflowJourney,
  financeInvestmentsJourney,
  financeCryptoJourney,
} from '../lib/journeyConfigs/finance';

const FinanceOverview = lazy(() => import('./finance/FinanceOverview'));
const FinanceTransactions = lazy(() => import('./finance/FinanceTransactions'));
const FinanceDebts = lazy(() => import('./finance/FinanceDebts'));
const FinanceCashflow = lazy(() => import('./finance/FinanceCashflow'));
const FinanceInvestments = lazy(() => import('./finance/FinanceInvestments'));
const FinanceCrypto = lazy(() => import('./finance/FinanceCrypto'));

function FinanceTabFallback() {
  return (
    <div className="rounded-md border border-border-panel bg-surface min-h-[320px] flex items-center justify-center text-xs font-mono text-text-secondary animate-pulse">
      Carregando modulo financeiro...
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<FinanceTab>(() => {
    if (typeof window === 'undefined') return 'overview';
    return (localStorage.getItem('finance-last-tab') as FinanceTab) || 'overview';
  });
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<AssetAllocation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleFinanceSubmit = async (data: Record<string, unknown>) => {
    const now = new Date().toISOString();
    const entry: StoredFinanceEntry = {
      id: crypto.randomUUID(),
      name: String(data.name || ''),
      valor: Number(data.valor) || 0,
      tipo: (data.tipo as 'entrada' | 'saida') || 'saida',
      categoria: String(data.categoria || 'outros'),
      data: String(data.data || now.slice(0, 10)),
      recorrente: Boolean(data.recorrente),
      createdAt: now,
      updatedAt: now,
    };
    await putFinanceEntry(entry);
    showToast('Registro financeiro salvo!');
    syncToNotion('create-finance-entry', data);
    triggerRefresh();
  };

  const handleRedoJourney = useCallback((tabId: string) => {
    const setup = setupMap[tabId];
    if (setup) setup.reset();
  }, [setupMap]);

  const handleJourneyComplete = useCallback(() => {
    activeSetup.markDone();
    triggerRefresh();
  }, [activeSetup, triggerRefresh]);

  useEffect(() => {
    localStorage.setItem('finance-last-tab', activeTab);
  }, [activeTab]);

  // If active tab hasn't done its journey, show the journey
  if (!activeSetup.isSetupDone) {
    const journeyConfig = journeyMap[activeTab];
    if (journeyConfig) {
      return (
        <SectionJourney
          config={journeyConfig}
          onComplete={handleJourneyComplete}
          onSkip={activeSetup.markSkipped}
        />
      );
    }
  }

  return (
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
          {activeTab === 'cashflow' && (
            <>
              <button
                onClick={() => setIsIncomeModalOpen(true)}
                className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all flex items-center gap-1 shrink-0"
              >
                <Icon name="arrow_downward" size="xs" />
                Receita
              </button>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-accent-red/20 transition-all flex items-center gap-1 shrink-0"
              >
                <Icon name="arrow_upward" size="xs" />
                Gasto
              </button>
            </>
          )}
          {activeTab === 'investments' && (
            <button
              onClick={() => setIsInvestModalOpen(true)}
              className="bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-accent-blue/20 transition-all flex items-center gap-1 shrink-0"
            >
              <Icon name="trending_up" size="xs" />
              Investir
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all flex items-center gap-1 shrink-0"
          >
            <Icon name="add" size="xs" />
            NOVO
          </button>
        </div>

        <Suspense fallback={<FinanceTabFallback />}>
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
        </Suspense>

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
        title="Novo Registro Financeiro"
        fields={financeFields}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFinanceSubmit}
      />
    </div>
  );
};

export default Finance;
