export type FinanceTab = 'overview' | 'transactions' | 'debts' | 'cashflow' | 'investments' | 'crypto';
export type CurrencyDisplay = 'USD' | 'BRL';

export interface Transaction {
  id: string;
  title: string;
  merchant: string;
  date: string;
  time: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  method: string;
  status: 'completed' | 'processing';
  receipt: boolean;
  icon: string;
}

export interface IncomeSource {
  name: string;
  expected: number;
  received: number;
  date: string;
  icon: string;
  status: 'received' | 'partial' | 'pending';
}

export interface RecurringExpense {
  name: string;
  amount: number;
  date: string;
  status: 'pending' | 'scheduled' | 'paid';
}

export interface AssetAllocation {
  name: string;
  value: number;
  percent: number;
  color: string;
  icon: string;
  risk: string;
  returns: string;
}

export interface WatchlistToken {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  holding: number;
}

export interface PortfolioAsset {
  id: number;
  type: 'coin' | 'nft';
  symbol: string;
  name: string;
  amount: number;
  price: number;
  color: string;
  changes: { d: number; w: number; m: number; y: number };
}

export interface StakingAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  currentDay: number;
  totalDays: number;
  color: string;
}

export interface PieDataItem {
  name: string;
  value: number;
}

export interface CashflowDataItem {
  month: string;
  income: number;
  expenses: number;
}
