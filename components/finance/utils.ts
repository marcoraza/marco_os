import { rates } from './data';
import type { FinanceTab, CurrencyDisplay } from './types';

export const formatCurrency = (valueInUSD: number, currencyState: CurrencyDisplay = 'USD'): string => {
  if (currencyState === 'BRL') {
    const valueInBRL = valueInUSD / rates['BRL'];
    return `R$ ${valueInBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$ ${valueInUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatBRL = (val: number): string =>
  `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

export const getAccentColor = (activeTab: FinanceTab): 'mint' | 'blue' | 'purple' | 'orange' => {
  switch (activeTab) {
    case 'debts': return 'blue';
    case 'investments': return 'purple';
    case 'crypto': return 'orange';
    default: return 'mint';
  }
};
