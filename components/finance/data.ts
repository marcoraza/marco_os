import type { Transaction, IncomeSource, RecurringExpense, AssetAllocation, WatchlistToken, PortfolioAsset, StakingAsset, PieDataItem, CashflowDataItem } from './types';
import type { Tab } from '../ui/TabNav';

export const rates: Record<string, number> = {
  'BTC': 64230.50,
  'ETH': 3450.20,
  'SOL': 148.90,
  'USDT': 1.00,
  'USD': 1.00,
  'BRL': 0.18,
  'BIRB': 0.045,
};

export const detailedTransactions: Transaction[] = [
  { id: 'TX-8821', title: 'Amazon AWS', merchant: 'Amazon Web Services', date: '2023-10-05', time: '14:30', amount: -350.00, type: 'expense', category: 'Infraestrutura', method: 'Mastercard •••• 4242', status: 'completed', receipt: true, icon: 'cloud' },
  { id: 'TX-8820', title: 'Pagamento Cliente X', merchant: 'Alpha Corp', date: '2023-10-05', time: '10:15', amount: 4500.00, type: 'income', category: 'Receita', method: 'Transferência Bancária', status: 'completed', receipt: false, icon: 'attach_money' },
  { id: 'TX-8819', title: 'Uber Ride', merchant: 'Uber Technologies', date: '2023-10-04', time: '18:45', amount: -42.90, type: 'expense', category: 'Transporte', method: 'Visa •••• 8899', status: 'completed', receipt: true, icon: 'commute' },
  { id: 'TX-8818', title: 'Apple Store', merchant: 'Apple', date: '2023-10-04', time: '15:20', amount: -12999.00, type: 'expense', category: 'Equipamento', method: 'Mastercard •••• 4242', status: 'processing', receipt: true, icon: 'laptop_mac' },
  { id: 'TX-8817', title: 'Spotify Premium', merchant: 'Spotify', date: '2023-10-03', time: '09:00', amount: -21.90, type: 'expense', category: 'Assinatura', method: 'PayPal', status: 'completed', receipt: false, icon: 'music_note' },
  { id: 'TX-8816', title: 'Venda Produto Digital', merchant: 'Gumroad', date: '2023-10-02', time: '22:10', amount: 150.00, type: 'income', category: 'Vendas', method: 'Stripe', status: 'completed', receipt: false, icon: 'shopping_bag' },
  { id: 'TX-8815', title: 'Supermercado Extra', merchant: 'Extra Hiper', date: '2023-10-01', time: '19:30', amount: -450.20, type: 'expense', category: 'Alimentação', method: 'Visa •••• 8899', status: 'completed', receipt: true, icon: 'shopping_cart' },
  { id: 'TX-8814', title: 'Posto Shell', merchant: 'Shell', date: '2023-10-01', time: '08:15', amount: -180.00, type: 'expense', category: 'Transporte', method: 'Dinheiro', status: 'completed', receipt: true, icon: 'local_gas_station' },
];

export const incomeSources: IncomeSource[] = [
  { name: 'Salário Principal', expected: 12000, received: 12000, date: '05/Out', icon: 'work', status: 'received' },
  { name: 'Freelance Design', expected: 3500, received: 1500, date: '15/Out', icon: 'brush', status: 'partial' },
  { name: 'Dividendos FIIs', expected: 450, received: 0, date: '30/Out', icon: 'apartment', status: 'pending' },
  { name: 'Mentoria Online', expected: 2000, received: 2000, date: '10/Out', icon: 'school', status: 'received' },
  { name: 'Venda Ebook', expected: 500, received: 150, date: '02/Out', icon: 'book', status: 'partial' },
];

export const recurringExpenses: RecurringExpense[] = [
  { name: 'Aluguel Escritório', amount: 2500, date: '10/Out', status: 'pending' },
  { name: 'Servidor AWS', amount: 350, date: '12/Out', status: 'pending' },
  { name: 'Adobe Creative Cloud', amount: 240, date: '15/Out', status: 'scheduled' },
  { name: 'Contador', amount: 600, date: '20/Out', status: 'scheduled' },
  { name: 'Internet Fibra', amount: 150, date: '25/Out', status: 'scheduled' },
];

export const assetAllocation: AssetAllocation[] = [
  { name: 'Ações BR', value: 45000, percent: 25, color: 'bg-brand-mint', icon: 'trending_up', risk: 'Médio', returns: '+12.5%' },
  { name: 'Stocks (US)', value: 65000, percent: 35, color: 'bg-accent-blue', icon: 'public', risk: 'Alto', returns: '+18.2%' },
  { name: 'Crypto', value: 35000, percent: 20, color: 'bg-accent-purple', icon: 'currency_bitcoin', risk: 'Altíssimo', returns: '-5.4%' },
  { name: 'FIIs', value: 25000, percent: 15, color: 'bg-accent-orange', icon: 'apartment', risk: 'Baixo', returns: '+8.1%' },
  { name: 'Caixa', value: 8000, percent: 5, color: 'bg-text-secondary', icon: 'savings', risk: 'Nulo', returns: '+1.0%' },
];

export const initialWatchlistTokens: WatchlistToken[] = [
  { id: 't1', symbol: 'BTC', name: 'Bitcoin', price: 64230.50, change: 2.4, holding: 0.25 },
  { id: 't2', symbol: 'ETH', name: 'Ethereum', price: 3450.20, change: -1.2, holding: 4.5 },
  { id: 't3', symbol: 'SOL', name: 'Solana', price: 148.90, change: 5.7, holding: 150 },
  { id: 't4', symbol: 'LINK', name: 'Chainlink', price: 14.20, change: 0.8, holding: 500 },
  { id: 't5', symbol: 'RENDER', name: 'Render', price: 7.85, change: 12.4, holding: 1200 },
];

export const initialPortfolioAssets: PortfolioAsset[] = [
  { id: 1, type: 'coin', symbol: 'BTC', name: 'Bitcoin', amount: 0.45, price: 64230.50, color: '#F7931A', changes: { d: 2.4, w: 5.1, m: -3.2, y: 120.5 } },
  { id: 2, type: 'coin', symbol: 'ETH', name: 'Ethereum', amount: 3.2, price: 3450.20, color: '#627EEA', changes: { d: -1.2, w: 2.4, m: 8.5, y: 85.2 } },
  { id: 3, type: 'coin', symbol: 'SOL', name: 'Solana', amount: 150, price: 148.90, color: '#14F195', changes: { d: 5.7, w: 12.8, m: 22.4, y: 350.1 } },
  { id: 4, type: 'nft', symbol: 'MOON', name: 'Moonbirds', amount: 2, price: 4250.00, color: '#bf5af2', changes: { d: 0.0, w: -5.4, m: -12.1, y: -45.0 } },
  { id: 5, type: 'nft', symbol: 'MAYC', name: 'Mutant Ape', amount: 1, price: 8900.00, color: '#DFFF00', changes: { d: -2.1, w: -1.2, m: 4.5, y: -15.2 } },
];

export const stakingAssets: StakingAsset[] = [
  { id: 's1', symbol: 'BIRB', name: 'Birb', amount: 25000, price: 0.045, currentDay: 12, totalDays: 30, color: '#FF453A' },
];

export const pieData: PieDataItem[] = [
  { name: 'Infraestrutura', value: 350 },
  { name: 'Transporte', value: 222.90 },
  { name: 'Equipamento', value: 12999 },
  { name: 'Assinatura', value: 21.90 },
  { name: 'Alimentação', value: 450.20 },
];

export const PIE_COLORS = ['#0A84FF', '#BF5AF2', '#FF453A', '#FF9F0A', '#00FF95'];

export const cashflowData: CashflowDataItem[] = [
  { month: 'Set', income: 14000, expenses: 8000 },
  { month: 'Out', income: 16000, expenses: 9000 },
  { month: 'Nov', income: 18000, expenses: 11000 },
  { month: 'Dez', income: 15000, expenses: 8000 },
  { month: 'Jan', income: 17000, expenses: 10000 },
  { month: 'Fev', income: 19000, expenses: 9000 },
];

export const financeTabs: Tab[] = [
  { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
  { id: 'transactions', label: 'Transações', icon: 'receipt_long' },
  { id: 'debts', label: 'Débitos', icon: 'credit_card' },
  { id: 'cashflow', label: 'Fluxo de Caixa', icon: 'swap_horiz' },
  { id: 'investments', label: 'Investimentos', icon: 'candlestick_chart' },
  { id: 'crypto', label: 'Cripto', icon: 'currency_bitcoin' },
];
