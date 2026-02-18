import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icon, Badge, Card, SectionLabel, TabNav } from './ui';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'debts' | 'cashflow' | 'investments' | 'crypto'>('overview');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Investments State
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  // Currency State for Portfolio
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'BRL'>('USD');
  // Independent Currency State for Staking
  const [stakingDisplayCurrency, setStakingDisplayCurrency] = useState<'USD' | 'BRL'>('USD');

  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcFrom, setCalcFrom] = useState('ETH');
  const [calcTo, setCalcTo] = useState('USD');
  const [conversionResult, setConversionResult] = useState<number>(0);

  // Mock Rates (Base USD)
  const rates: Record<string, number> = {
    'BTC': 64230.50,
    'ETH': 3450.20,
    'SOL': 148.90,
    'USDT': 1.00,
    'USD': 1.00,
    'BRL': 0.18,
    'BIRB': 0.045
  };

  useEffect(() => {
    const fromRate = rates[calcFrom] || 0;
    const toRate = rates[calcTo] || 1;
    let result = 0;

    if (calcTo === 'USD') result = calcAmount * fromRate;
    else if (calcFrom === 'USD') result = calcAmount / toRate;
    else {
        const inUSD = calcAmount * fromRate;
        result = inUSD / toRate;
    }

    setConversionResult(result);
  }, [calcAmount, calcFrom, calcTo]);

  const formatCurrency = (valueInUSD: number, currencyState: 'USD' | 'BRL' = displayCurrency) => {
    if (currencyState === 'BRL') {
      const valueInBRL = valueInUSD / rates['BRL'];
      return `R$ ${valueInBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$ ${valueInUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatBRL = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const detailedTransactions = [
    { id: 'TX-8821', title: 'Amazon AWS', merchant: 'Amazon Web Services', date: '2023-10-05', time: '14:30', amount: -350.00, type: 'expense', category: 'Infraestrutura', method: 'Mastercard •••• 4242', status: 'completed', receipt: true, icon: 'cloud' },
    { id: 'TX-8820', title: 'Pagamento Cliente X', merchant: 'Alpha Corp', date: '2023-10-05', time: '10:15', amount: 4500.00, type: 'income', category: 'Receita', method: 'Transferência Bancária', status: 'completed', receipt: false, icon: 'attach_money' },
    { id: 'TX-8819', title: 'Uber Ride', merchant: 'Uber Technologies', date: '2023-10-04', time: '18:45', amount: -42.90, type: 'expense', category: 'Transporte', method: 'Visa •••• 8899', status: 'completed', receipt: true, icon: 'commute' },
    { id: 'TX-8818', title: 'Apple Store', merchant: 'Apple', date: '2023-10-04', time: '15:20', amount: -12999.00, type: 'expense', category: 'Equipamento', method: 'Mastercard •••• 4242', status: 'processing', receipt: true, icon: 'laptop_mac' },
    { id: 'TX-8817', title: 'Spotify Premium', merchant: 'Spotify', date: '2023-10-03', time: '09:00', amount: -21.90, type: 'expense', category: 'Assinatura', method: 'PayPal', status: 'completed', receipt: false, icon: 'music_note' },
    { id: 'TX-8816', title: 'Venda Produto Digital', merchant: 'Gumroad', date: '2023-10-02', time: '22:10', amount: 150.00, type: 'income', category: 'Vendas', method: 'Stripe', status: 'completed', receipt: false, icon: 'shopping_bag' },
    { id: 'TX-8815', title: 'Supermercado Extra', merchant: 'Extra Hiper', date: '2023-10-01', time: '19:30', amount: -450.20, type: 'expense', category: 'Alimentação', method: 'Visa •••• 8899', status: 'completed', receipt: true, icon: 'shopping_cart' },
    { id: 'TX-8814', title: 'Posto Shell', merchant: 'Shell', date: '2023-10-01', time: '08:15', amount: -180.00, type: 'expense', category: 'Transporte', method: 'Dinheiro', status: 'completed', receipt: true, icon: 'local_gas_station' },
  ];

  const incomeSources = [
    { name: 'Salário Principal', expected: 12000, received: 12000, date: '05/Out', icon: 'work', status: 'received' },
    { name: 'Freelance Design', expected: 3500, received: 1500, date: '15/Out', icon: 'brush', status: 'partial' },
    { name: 'Dividendos FIIs', expected: 450, received: 0, date: '30/Out', icon: 'apartment', status: 'pending' },
    { name: 'Mentoria Online', expected: 2000, received: 2000, date: '10/Out', icon: 'school', status: 'received' },
    { name: 'Venda Ebook', expected: 500, received: 150, date: '02/Out', icon: 'book', status: 'partial' },
  ];

  const recurringExpenses = [
    { name: 'Aluguel Escritório', amount: 2500, date: '10/Out', status: 'pending' },
    { name: 'Servidor AWS', amount: 350, date: '12/Out', status: 'pending' },
    { name: 'Adobe Creative Cloud', amount: 240, date: '15/Out', status: 'scheduled' },
    { name: 'Contador', amount: 600, date: '20/Out', status: 'scheduled' },
    { name: 'Internet Fibra', amount: 150, date: '25/Out', status: 'scheduled' },
  ];

  const totalReceived = incomeSources.reduce((acc, curr) => acc + curr.received, 0);
  const totalExpenses = recurringExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const maxBarValue = Math.max(totalReceived, totalExpenses) * 1.1;
  const netResult = totalReceived - totalExpenses;
  const savingsRate = totalReceived > 0 ? (netResult / totalReceived) * 100 : 0;
  const optimizationGoal = 30;

  const assetAllocation = [
    { name: 'Ações BR', value: 45000, percent: 25, color: 'bg-brand-mint', icon: 'trending_up', risk: 'Médio', returns: '+12.5%' },
    { name: 'Stocks (US)', value: 65000, percent: 35, color: 'bg-accent-blue', icon: 'public', risk: 'Alto', returns: '+18.2%' },
    { name: 'Crypto', value: 35000, percent: 20, color: 'bg-accent-purple', icon: 'currency_bitcoin', risk: 'Altíssimo', returns: '-5.4%' },
    { name: 'FIIs', value: 25000, percent: 15, color: 'bg-accent-orange', icon: 'apartment', risk: 'Baixo', returns: '+8.1%' },
    { name: 'Caixa', value: 8000, percent: 5, color: 'bg-text-secondary', icon: 'savings', risk: 'Nulo', returns: '+1.0%' },
  ];

  const [watchlistTokens, setWatchlistTokens] = useState([
    { id: 't1', symbol: 'BTC', name: 'Bitcoin', price: 64230.50, change: 2.4, holding: 0.25 },
    { id: 't2', symbol: 'ETH', name: 'Ethereum', price: 3450.20, change: -1.2, holding: 4.5 },
    { id: 't3', symbol: 'SOL', name: 'Solana', price: 148.90, change: 5.7, holding: 150 },
    { id: 't4', symbol: 'LINK', name: 'Chainlink', price: 14.20, change: 0.8, holding: 500 },
    { id: 't5', symbol: 'RENDER', name: 'Render', price: 7.85, change: 12.4, holding: 1200 },
  ]);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const copyListItems = [...watchlistTokens];
    const dragItemContent = copyListItems[dragItem.current!];
    copyListItems.splice(dragItem.current!, 1);
    copyListItems.splice(dragOverItem.current!, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setWatchlistTokens(copyListItems);
  };

  const removeToken = (id: string) => {
    setWatchlistTokens(watchlistTokens.filter(t => t.id !== id));
  };

  const [portfolioAssets, setPortfolioAssets] = useState([
    { id: 1, type: 'coin', symbol: 'BTC', name: 'Bitcoin', amount: 0.45, price: 64230.50, color: '#F7931A', changes: { d: 2.4, w: 5.1, m: -3.2, y: 120.5 } },
    { id: 2, type: 'coin', symbol: 'ETH', name: 'Ethereum', amount: 3.2, price: 3450.20, color: '#627EEA', changes: { d: -1.2, w: 2.4, m: 8.5, y: 85.2 } },
    { id: 3, type: 'coin', symbol: 'SOL', name: 'Solana', amount: 150, price: 148.90, color: '#14F195', changes: { d: 5.7, w: 12.8, m: 22.4, y: 350.1 } },
    { id: 4, type: 'nft', symbol: 'MOON', name: 'Moonbirds', amount: 2, price: 4250.00, color: '#bf5af2', changes: { d: 0.0, w: -5.4, m: -12.1, y: -45.0 } },
    { id: 5, type: 'nft', symbol: 'MAYC', name: 'Mutant Ape', amount: 1, price: 8900.00, color: '#DFFF00', changes: { d: -2.1, w: -1.2, m: 4.5, y: -15.2 } },
  ]);

  const totalPortfolioValue = portfolioAssets.reduce((acc, asset) => acc + (asset.amount * asset.price), 0);

  let cumulativePercent = 0;
  const gradientStops = portfolioAssets.map(asset => {
    const value = asset.amount * asset.price;
    const percent = (value / totalPortfolioValue) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return `${asset.color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  const handleAssetAmountChange = (id: number, newAmount: number) => {
    setPortfolioAssets(prev => prev.map(a => a.id === id ? { ...a, amount: newAmount } : a));
  };

  const stakingAssets = [
    { id: 's1', symbol: 'BIRB', name: 'Birb', amount: 25000, price: 0.045, currentDay: 12, totalDays: 30, color: '#FF453A' },
  ];

  const getAccentColor = () => {
    switch (activeTab) {
        case 'debts': return 'blue';
        case 'investments': return 'purple';
        case 'crypto': return 'orange';
        default: return 'mint';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
    { id: 'transactions', label: 'Transações', icon: 'receipt_long' },
    { id: 'debts', label: 'Débitos', icon: 'credit_card' },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: 'swap_horiz' },
    { id: 'investments', label: 'Investimentos', icon: 'candlestick_chart' },
    { id: 'crypto', label: 'Cripto', icon: 'currency_bitcoin' },
  ];

  // Recharts data for overview charts
  const pieData = [
    { name: 'Infraestrutura', value: 350 },
    { name: 'Transporte', value: 222.90 },
    { name: 'Equipamento', value: 12999 },
    { name: 'Assinatura', value: 21.90 },
    { name: 'Alimentação', value: 450.20 },
  ];
  const PIE_COLORS = ['#0A84FF', '#BF5AF2', '#FF453A', '#FF9F0A', '#00FF95'];
  const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);

  const cashflowData = [
    { month: 'Set', income: 14000, expenses: 8000 },
    { month: 'Out', income: 16000, expenses: 9000 },
    { month: 'Nov', income: 18000, expenses: 11000 },
    { month: 'Dez', income: 15000, expenses: 8000 },
    { month: 'Jan', income: 17000, expenses: 10000 },
    { month: 'Fev', income: 19000, expenses: 9000 },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans h-full overflow-y-auto relative">
      <div className="flex flex-col gap-6 h-full">

        {/* Navigation Tabs */}
        <div className="shrink-0">
           <TabNav
             tabs={tabs}
             activeTab={activeTab}
             onTabChange={(id) => setActiveTab(id as any)}
             accentColor={getAccentColor()}
           />
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          // TODO: Extract to FinanceOverview.tsx
          <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full overflow-hidden">

            {/* ROW 1: Metrics + Revenue Goal (Compact) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card className="p-4 relative overflow-hidden group hover:border-brand-mint/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Icon name="trending_up" className="text-5xl text-brand-mint" /></div>
                        <SectionLabel className="mb-1 text-text-secondary tracking-[0.1em]">Receita Mensal</SectionLabel>
                        <div className="flex items-baseline gap-2"><span className="text-2xl font-bold font-mono text-brand-mint">R$ 12.500</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-brand-mint font-medium"><Icon name="arrow_upward" className="text-xs mr-1" />12% vs mês anterior</div>
                    </Card>
                    <Card className="p-4 relative overflow-hidden group hover:border-accent-red/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Icon name="trending_down" className="text-5xl text-accent-red" /></div>
                        <SectionLabel className="mb-1 text-text-secondary tracking-[0.1em]">Gastos Mensais</SectionLabel>
                        <div className="flex items-baseline gap-2"><span className="text-2xl font-bold font-mono text-accent-red">R$ 11.230</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-accent-red font-medium"><Icon name="arrow_upward" className="text-xs mr-1" />5% vs mês anterior</div>
                    </Card>
                    <Card className="p-4 relative overflow-hidden group hover:border-accent-blue/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Icon name="account_balance_wallet" className="text-5xl text-accent-blue" /></div>
                        <SectionLabel className="mb-1 text-text-secondary tracking-[0.1em]">Saldo Atual</SectionLabel>
                        <div className="flex items-baseline gap-2"><span className="text-2xl font-bold font-mono text-accent-blue">R$ 1.270</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-text-secondary font-medium"><Icon name="remove" className="text-xs mr-1" />Estável</div>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="p-4 relative overflow-hidden h-full flex flex-col justify-center">
                        <SectionLabel className="mb-1 text-text-secondary tracking-wider">Meta de Receita</SectionLabel>
                        <div className="flex items-end gap-2 mb-3">
                            <h2 className="text-lg font-bold font-mono text-text-primary">R$ 12.500</h2>
                            <span className="text-xs text-text-secondary font-medium mb-1">/ R$ 50.000</span>
                        </div>
                        <div className="w-full h-2 bg-header-bg rounded-full overflow-hidden border border-border-panel mb-2">
                            <div className="h-full bg-brand-mint rounded-full relative" style={{width: '25%'}}>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-text-primary leading-relaxed">
                            Você atingiu <span className="text-brand-mint font-bold">25%</span> da sua meta.
                        </p>
                    </Card>
                </div>
            </div>

            {/* ROW 1.5: Recharts — Pie + Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                {/* Donut: Monthly Expenses by Category */}
                <div className="bg-header-bg border border-border-panel p-4 rounded">
                    <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-1 h-3 bg-accent-blue"></span> GASTOS POR CATEGORIA</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                dataKey="value"
                                stroke="none"
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 4, fontSize: 10 }}
                                itemStyle={{ color: '#E1E1E1' }}
                                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                            />
                            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" fill="#E1E1E1" style={{ fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                                R$ {pieTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </text>
                            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" fill="#8E8E93" style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
                                Total
                            </text>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                        {pieData.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                                <span className="text-[9px] text-text-secondary">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Area: Cash Flow (6 months) */}
                <div className="bg-header-bg border border-border-panel p-4 rounded">
                    <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-widest mb-3 flex items-center gap-2"><span className="w-1 h-3 bg-brand-mint"></span> FLUXO DE CAIXA (6 MESES)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={cashflowData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="rcIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00FF95" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#00FF95" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="rcExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#FF453A" stopOpacity={0.25} />
                                    <stop offset="100%" stopColor="#FF453A" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#8E8E93' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: '#8E8E93' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 4, fontSize: 10 }}
                                itemStyle={{ color: '#E1E1E1' }}
                                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                            />
                            <Area type="monotone" dataKey="income" stroke="#00FF95" strokeWidth={2} fill="url(#rcIncomeGrad)" name="Receita" />
                            <Area type="monotone" dataKey="expenses" stroke="#FF453A" strokeWidth={2} fill="url(#rcExpenseGrad)" name="Despesas" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROW 2: Chart + Feed (Flexible) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <Card className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-[9px] font-black text-text-secondary flex items-center gap-2 uppercase tracking-[0.1em]"><span className="w-1 h-4 bg-brand-mint"></span> EVOLUÇÃO</h2>
                            <div className="flex gap-2">
                                <div className="flex bg-white/5 rounded-sm p-0.5 border border-border-panel overflow-hidden">
                                    {['Sem', 'Mês', 'Ano'].map((period, i) => (
                                        <button key={period} className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm transition-colors ${i === 1 ? 'bg-brand-mint text-black' : 'text-text-secondary hover:text-text-primary'}`}>{period}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full flex-grow rounded-md border border-border-panel overflow-hidden bg-[#151515] bg-bg-base" style={{ backgroundImage: 'linear-gradient(to right, var(--color-border-panel) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-panel) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, var(--color-border-panel) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-panel) 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                            <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[9px] text-text-secondary font-mono px-1 py-2 border-r border-border-panel bg-surface/50">
                                <span>15k</span><span>10k</span><span>5k</span><span>0</span>
                            </div>
                            <div className="absolute left-10 right-0 top-2 bottom-6 flex items-end justify-between px-2 gap-2">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 250">
                                    <defs>
                                        <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00FF95" stopOpacity="0.2"></stop><stop offset="100%" stopColor="#00FF95" stopOpacity="0"></stop></linearGradient>
                                        <linearGradient id="gradientRed" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF453A" stopOpacity="0.2"></stop><stop offset="100%" stopColor="#FF453A" stopOpacity="0"></stop></linearGradient>
                                    </defs>
                                    <path d="M0,180 C50,160 100,100 150,110 C200,120 250,90 300,50 C350,10 400,60 450,40 C500,20 550,60 600,40 C650,20 700,50 800,30 L800,250 L0,250 Z" fill="url(#gradientGreen)" stroke="none"></path>
                                    <path d="M0,180 C50,160 100,100 150,110 C200,120 250,90 300,50 C350,10 400,60 450,40 C500,20 550,60 600,40 C650,20 700,50 800,30" fill="none" className="stroke-brand-mint" strokeWidth="2"></path>
                                    <path d="M0,220 C50,210 100,180 150,190 C200,200 250,150 300,160 C350,170 400,120 450,130 C500,140 550,100 600,110 C650,120 700,90 800,80 L800,250 L0,250 Z" fill="url(#gradientRed)" stroke="none"></path>
                                    <path d="M0,220 C50,210 100,180 150,190 C200,200 250,150 300,160 C350,170 400,120 450,130 C500,140 550,100 600,110 C650,120 700,90 800,80" className="stroke-accent-red" strokeWidth="2" fill="none"></path>
                                </svg>
                            </div>
                            <div className="absolute bottom-0 left-10 right-0 h-6 flex justify-between items-center text-[9px] text-text-secondary font-mono px-4 border-t border-border-panel bg-surface/50">
                                <span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col h-full min-h-0">
                    <Card className="flex flex-col h-full overflow-hidden">
                        <div className="p-3 border-b border-border-panel flex justify-between items-center bg-surface-hover shrink-0">
                            <SectionLabel className="tracking-[0.1em]">Feed Financeiro</SectionLabel>
                            <button className="text-brand-mint hover:text-brand-mint/80 text-[9px] font-bold uppercase tracking-wide transition-colors">Ver tudo</button>
                        </div>
                        <div className="p-2 overflow-y-auto custom-scrollbar flex-grow">
                            <ul className="space-y-1">
                                {detailedTransactions.slice(0, 5).map(tx => (
                                    <li key={tx.id} className="p-2 hover:bg-surface-hover rounded-md transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-border-panel">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-sm bg-header-bg border border-border-panel flex items-center justify-center ${tx.type === 'income' ? 'text-brand-mint' : 'text-accent-red'}`}>
                                                <Icon name={tx.icon} size="sm" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-text-primary">{tx.title}</p>
                                                <p className="text-[9px] text-text-secondary">{tx.merchant}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-brand-mint' : 'text-accent-red'}`}>{tx.type === 'income' ? '+' : '-'} {formatBRL(Math.abs(tx.amount))}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                </div>
            </div>

            {/* ROW 3: Categories + Payments (Flex-1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <Card className="p-4 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2 shrink-0">
                            <h2 className="text-[9px] font-black text-text-secondary flex items-center gap-2 uppercase tracking-[0.1em]"><span className="w-1 h-3 bg-text-secondary"></span> GASTOS POR CATEGORIA</h2>
                        </div>
                        <div className="flex-grow flex flex-col justify-center space-y-2">
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded-sm bg-surface-hover text-accent-purple border border-border-panel"><Icon name="home" className="text-[10px]" /></div><span className="text-[10px] font-semibold text-text-secondary">Moradia</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-text-primary">R$ 4.500</span></div>
                                </div>
                                <div className="w-full bg-header-bg border border-border-panel rounded-sm h-1.5"><div className="bg-accent-purple h-full rounded-sm relative" style={{width: '40%'}}></div></div>
                            </div>
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded-sm bg-surface-hover text-accent-orange border border-border-panel"><Icon name="restaurant" className="text-[10px]" /></div><span className="text-[10px] font-semibold text-text-secondary">ALIMENTAÇÃO</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-text-primary">R$ 2.800</span></div>
                                </div>
                                <div className="w-full bg-header-bg border border-border-panel rounded-sm h-1.5"><div className="bg-accent-orange h-full rounded-sm relative" style={{width: '25%'}}></div></div>
                            </div>
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded-sm bg-surface-hover text-accent-blue border border-border-panel"><Icon name="commute" className="text-[10px]" /></div><span className="text-[10px] font-semibold text-text-secondary">Transporte</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-text-primary">R$ 1.680</span></div>
                                </div>
                                <div className="w-full bg-header-bg border border-border-panel rounded-sm h-1.5"><div className="bg-accent-blue h-full rounded-sm relative" style={{width: '15%'}}></div></div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col h-full min-h-0">
                    <Card className="flex flex-col h-full overflow-hidden">
                        <div className="p-3 border-b border-border-panel flex justify-between items-center bg-surface-hover shrink-0">
                            <SectionLabel className="tracking-[0.1em]">PRÓXIMOS PAGAMENTOS</SectionLabel>
                        </div>
                        <div className="p-3 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-border-panel rounded-sm border border-[#333] text-text-secondary"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-text-primary">10</span></div>
                                    <div><p className="text-[10px] font-bold text-text-primary group-hover:text-accent-red transition-colors">Aluguel</p><p className="text-[9px] text-text-secondary">Recorrente</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-text-primary">R$ 2.500</span>
                            </div>
                            <div className="w-full h-px bg-border-panel"></div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-border-panel rounded-sm border border-[#333] text-text-secondary"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-text-primary">12</span></div>
                                    <div><p className="text-[10px] font-bold text-text-primary group-hover:text-accent-red transition-colors">AWS</p><p className="text-[9px] text-text-secondary">Infra</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-text-primary">R$ 350</span>
                            </div>
                            <div className="w-full h-px bg-border-panel"></div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-border-panel rounded-sm border border-[#333] text-text-secondary"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-text-primary">15</span></div>
                                    <div><p className="text-[10px] font-bold text-text-primary group-hover:text-accent-red transition-colors">Seguro</p><p className="text-[9px] text-text-secondary">Anual</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-text-primary">R$ 390</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

          </div>
        )}

        {/* --- CASHFLOW TAB --- */}
        {activeTab === 'cashflow' && (
          // TODO: Extract to FinanceCashflow.tsx
          <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* COL 1: INFLOWS */}
                <Card className="flex flex-col overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-border-panel bg-header-bg">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="arrow_downward" className="text-brand-mint" /> Entradas</h3>
                            <button onClick={() => setIsIncomeModalOpen(true)} className="text-brand-mint hover:text-text-primary transition-colors bg-brand-mint/10 p-1.5 rounded-sm hover:bg-brand-mint/20"><Icon name="add" size="lg" /></button>
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
                            <button onClick={() => setIsExpenseModalOpen(true)} className="text-accent-red hover:text-text-primary transition-colors bg-accent-red/10 p-1.5 rounded-sm hover:bg-accent-red/20"><Icon name="add" size="lg" /></button>
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
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          // TODO: Extract to FinanceTransactions.tsx
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
        )}

        {/* --- DEBTS TAB --- */}
        {activeTab === 'debts' && (
          // TODO: Extract to FinanceDebts.tsx
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 h-full overflow-hidden">
            {/* Left Col: Stats + Debts Grid */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                <Card className="p-5 shadow-lg relative overflow-hidden group hover:border-accent-red/30 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10"><Icon name="trending_down" className="text-6xl text-accent-red" /></div>
                  <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] mb-2">TOTAL EM DÉBITOS</h3>
                  <div className="flex items-baseline gap-2"><span className="text-2xl font-bold font-mono text-text-primary">R$ 183.750,00</span></div>
                  <div className="mt-2 flex items-center text-xs text-red-500 font-medium"><Icon name="arrow_upward" className="text-sm mr-1" />Juros acumulados: +2.1%</div>
                </Card>
                <Card className="p-5 shadow-lg relative overflow-hidden group hover:border-accent-blue/30 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10"><Icon name="calendar_today" className="text-6xl text-accent-blue" /></div>
                  <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] mb-2">Parcela Mensal Total</h3>
                  <div className="flex items-baseline gap-2"><span className="text-2xl font-bold font-mono text-text-primary">R$ 6.980,00</span></div>
                  <div className="mt-2 flex items-center text-xs text-accent-blue font-medium"><Icon name="check_circle" className="text-sm mr-1" />Em dia</div>
                </Card>
              </div>

              <Card className="shadow-lg p-6 flex-1 min-h-0 flex flex-col">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-5 bg-accent-blue"></span> MEUS DÉBITOS</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue/90 text-white text-[10px] font-bold uppercase rounded-sm transition-colors"><Icon name="add" size="sm" /> NOVO DÉBITO</button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar p-1">
                    {/* BLOCK 1: BLUE */}
                    <Card className="bg-bg-base p-5 hover:border-accent-blue/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-accent-blue/10 flex items-center justify-center text-accent-blue border border-accent-blue/20"><Icon name="home" /></div>
                          <div><h3 className="text-sm font-bold text-text-primary">Financiamento Imóvel</h3><p className="text-xs text-text-secondary">Banco Santander</p></div>
                        </div>
                        <Badge variant="mint">Em Dia</Badge>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">R$ 145.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-border-panel rounded-full overflow-hidden"><div className="h-full bg-accent-blue" style={{width: '45%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary"><span>Progresso: 45%</span><span className="text-accent-blue">SIMULAR ANTECIPAÇÃO</span></div>
                        </div>
                      </div>
                    </Card>

                    {/* BLOCK 2: ORANGE */}
                    <Card className="bg-bg-base p-5 hover:border-accent-orange/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-accent-orange/10 flex items-center justify-center text-accent-orange border border-accent-orange/20"><Icon name="directions_car" /></div>
                          <div><h3 className="text-sm font-bold text-text-primary">Jeep Compass</h3><p className="text-xs text-text-secondary">Financiamento BV</p></div>
                        </div>
                        <Badge variant="mint">Em Dia</Badge>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">R$ 22.500,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-border-panel rounded-full overflow-hidden"><div className="h-full bg-accent-orange" style={{width: '60%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary"><span>Progresso: 60%</span><span className="text-accent-orange">SIMULAR ANTECIPAÇÃO</span></div>
                        </div>
                      </div>
                    </Card>

                    {/* BLOCK 3: PURPLE */}
                    <Card className="bg-bg-base p-5 hover:border-accent-purple/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-accent-purple/10 flex items-center justify-center text-accent-purple border border-accent-purple/20"><Icon name="construction" /></div>
                          <div><h3 className="text-sm font-bold text-text-primary">Empréstimo Reforma</h3><p className="text-xs text-text-secondary">Banco Itaú</p></div>
                        </div>
                        <Badge variant="mint">Em Dia</Badge>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">R$ 45.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-border-panel rounded-full overflow-hidden"><div className="h-full bg-accent-purple" style={{width: '30%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary"><span>Progresso: 30%</span><span className="text-accent-purple">SIMULAR ANTECIPAÇÃO</span></div>
                        </div>
                      </div>
                    </Card>

                    {/* BLOCK 4: GREEN */}
                    <Card className="bg-bg-base p-5 hover:border-brand-mint/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-sm bg-brand-mint/10 flex items-center justify-center text-brand-mint border border-brand-mint/20"><Icon name="school" /></div>
                          <div><h3 className="text-sm font-bold text-text-primary">Crédito Universitário</h3><p className="text-xs text-text-secondary">Fies</p></div>
                        </div>
                        <Badge variant="mint">Em Dia</Badge>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">R$ 12.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-border-panel rounded-full overflow-hidden"><div className="h-full bg-brand-mint" style={{width: '85%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary"><span>Progresso: 85%</span><span className="text-brand-mint">SIMULAR ANTECIPAÇÃO</span></div>
                        </div>
                      </div>
                    </Card>

                 </div>
              </Card>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
              <div className="bg-surface rounded-md p-0 border border-border-panel flex flex-col relative overflow-hidden flex-1 min-h-0">
                {/* Financial Health Header Color Change */}
                <div className="w-full h-2 bg-brand-mint"></div>
                <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center shrink-0">
                        <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-mint">PAGAMENTOS DO MÊS</h2>
                    </div>

                    {/* Monthly Progress Bar - Gamified with Tooltip */}
                    <div className="group cursor-pointer relative shrink-0">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary mb-2 group-hover:text-text-primary transition-colors">
                            <span>Progresso</span>
                            <span className="text-brand-mint">65%</span>
                        </div>
                        <div className="w-full h-3 bg-border-panel rounded-full overflow-hidden border border-border-panel relative shadow-inner">
                            <div className="h-full bg-brand-mint w-[65%] rounded-full relative overflow-hidden">
                                {/* Animated Stripes */}
                                <div className="absolute inset-0 w-full h-full bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]" style={{backgroundSize: '20px 20px'}}></div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>

                        {/* Visual Streak Tooltip */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-header-bg border border-border-panel p-2 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                            <p className="text-[9px] text-text-secondary uppercase font-bold text-center mb-2">Streak de Pagamentos</p>
                            <div className="grid grid-cols-6 gap-1">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full aspect-square bg-brand-mint rounded-sm opacity-80 border border-brand-mint/30"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col">
                        <h3 className="text-[10px] font-bold text-text-secondary uppercase mb-3 shrink-0">PRÓXIMOS VENCIMENTOS (30 dias)</h3>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel hover:border-accent-orange/30 transition-colors"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-accent-orange rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Cartão Black</p><p className="text-[10px] text-text-secondary">Vence Amanhã</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 4.250</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-accent-orange rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Seguro Auto</p><p className="text-[10px] text-text-secondary">Vence em 5 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 390</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-brand-mint rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Condomínio</p><p className="text-[10px] text-text-secondary">Vence em 8 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 1.200</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-brand-mint rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Plano de Saúde</p><p className="text-[10px] text-text-secondary">Vence em 10 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 850</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-brand-mint rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Escola Crianças</p><p className="text-[10px] text-text-secondary">Vence em 12 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 3.200</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-brand-mint rounded-full"></span><div><p className="text-xs font-bold text-text-primary">Seguro Vida</p><p className="text-[10px] text-text-secondary">Vence em 15 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 180</span></div>
                            <div className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-brand-mint rounded-full"></span><div><p className="text-xs font-bold text-text-primary">IPVA 3ª Parc</p><p className="text-[10px] text-text-secondary">Vence em 20 dias</p></div></div><span className="text-xs font-mono font-bold text-text-primary">R$ 980</span></div>
                        </div>
                    </div>
                </div>
              </div>

              {/* Score Card - Reduced Size & Square & Flatter */}
              <Card className="p-4 shadow-lg flex flex-col items-center justify-between shrink-0 h-auto gap-4 group">
                 <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest w-full text-left">SCORE DE CRÉDITO</h3>

                 <div className="flex flex-col items-center justify-center">
                    {/* Square Indicator - Smaller */}
                    <div className="relative w-20 h-20 flex items-center justify-center border-4 border-border-panel border-t-brand-mint border-r-brand-mint rounded-md rotate-45 transition-all group-hover:shadow-[0_0_15px_rgba(0,255,149,0.2)]">
                        <div className="absolute flex flex-col items-center -rotate-45">
                            <span className="text-xl font-black text-text-primary">850</span>
                            <span className="text-[8px] font-bold text-brand-mint uppercase tracking-wide">Excelente</span>
                        </div>
                    </div>
                 </div>

                 {/* Bar Chart Visualization - Flatter */}
                 <div className="w-full h-12 relative flex items-end justify-between px-2 gap-1 mt-2">
                    <div className="w-full bg-brand-mint/20 hover:bg-brand-mint h-[20%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint/30 hover:bg-brand-mint h-[35%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint/40 hover:bg-brand-mint h-[45%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint/50 hover:bg-brand-mint h-[60%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint/70 hover:bg-brand-mint h-[55%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint/80 hover:bg-brand-mint h-[75%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-brand-mint h-[90%] rounded-sm shadow-[0_0_10px_rgba(0,255,149,0.5)]"></div>
                 </div>
              </Card>
            </div>
          </div>
        )}

        {/* --- INVESTMENTS TAB --- */}
        {activeTab === 'investments' && (
          // TODO: Extract to FinanceInvestments.tsx
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 h-full overflow-hidden">
             {/* Left Column: Chart & Asset List */}
             <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
               {/* Enhanced Dynamic Chart */}
               <Card className="shadow-lg p-6 relative overflow-hidden shrink-0">
                 <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h2 className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-5 bg-accent-purple"></span> PORTFOLIO PERFORMANCE</h2>
                        <p className="text-xs text-text-secondary mt-1 pl-3">Valor Total: <span className="text-text-primary font-mono font-bold text-lg">R$ 178.000,00</span> <span className="text-brand-mint ml-2 font-bold">+12.5%</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsInvestModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-accent-purple hover:bg-accent-purple/90 text-white text-[10px] font-bold uppercase rounded-sm transition-colors shadow-lg shadow-accent-purple/20"><Icon name="add" size="sm" /> Novo Ativo</button>
                    </div>
                 </div>
                 <div className="relative h-48 w-full bg-[#151515] rounded-md border border-border-panel overflow-hidden group">
                     {/* Detailed Gradient Area Chart */}
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                        <defs>
                            <linearGradient id="investGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#bf5af2" stopOpacity="0.4" /><stop offset="100%" stopColor="#bf5af2" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5" fill="none" className="stroke-accent-purple group-hover:stroke-width-1 transition-all" strokeWidth="0.5" />
                        <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5 V50 H0 Z" fill="url(#investGradient)" className="opacity-50 group-hover:opacity-70 transition-opacity" />

                        {/* Comparison Line (Index) */}
                        <path d="M0,48 Q15,45 30,46 T50,40 T70,38 T90,30 T100,25" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeDasharray="2,2" />
                     </svg>
                     <div className="absolute top-2 right-2 flex gap-2 text-[9px] font-bold text-text-secondary uppercase">
                        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-purple"></span> Portfolio</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#8A8A8A] border-t border-dashed"></span> CDI</span>
                     </div>
                 </div>
               </Card>

               {/* Asset List with Pop-up Trigger */}
               <Card className="shadow-lg p-6 flex-1 min-h-0 flex flex-col">
                  <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2 mb-4 shrink-0"><Icon name="list" className="text-accent-purple" /> Seus Ativos</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {assetAllocation.map((asset, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedInvestment(asset)}
                            className="bg-header-bg p-4 rounded-md border border-border-panel flex items-center justify-between hover:bg-surface-hover hover:border-accent-purple/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <div className={`w-10 h-10 rounded-sm bg-surface border border-border-panel flex items-center justify-center ${asset.color.replace('bg-', 'text-')} shrink-0`}>
                                    <Icon name={asset.icon} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-text-primary group-hover:text-accent-purple transition-colors truncate">{asset.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Risco: {asset.risk}</span>
                                        <span className={`text-[9px] font-mono font-bold ${asset.returns.includes('+') ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.returns}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-sm font-mono font-bold text-text-primary">R$ {asset.value.toLocaleString()}</p>
                                <div className="w-24 h-1.5 bg-border-panel rounded-full mt-2 overflow-hidden ml-auto">
                                    <div className={`${asset.color} h-full rounded-full`} style={{width: `${asset.percent}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
               </Card>
             </div>

             {/* Right Column: Analyst & Allocation */}
             <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                {/* AI Investment Analyst */}
                <div className="bg-gradient-to-b from-surface to-header-bg rounded-md border border-accent-purple/30 shadow-lg p-5 shrink-0 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Icon name="psychology" className="text-6xl text-accent-purple" /></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-sm bg-accent-purple/10 flex items-center justify-center border border-accent-purple/30">
                            <Icon name="auto_awesome" className="text-accent-purple text-sm animate-pulse" />
                        </div>
                        <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em]">IA Analyst Insight</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-accent-purple/5 border border-accent-purple/10 rounded-sm">
                            <p className="text-[10px] text-text-primary leading-relaxed">
                                <span className="font-bold text-accent-purple">Atenção:</span> A volatilidade em Cripto aumentou <span className="font-mono text-accent-red">15%</span> nas últimas 24h. Considere rebalancear lucros para Renda Fixa (Caixa) para manter a proporção ideal de risco.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-border-panel hover:bg-[#333] border border-border-panel rounded-sm text-[9px] font-bold text-text-secondary uppercase transition-colors">Ignorar</button>
                            <button className="flex-1 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-sm text-[9px] font-bold uppercase transition-colors shadow-lg shadow-accent-purple/10">Rebalancear</button>
                        </div>
                    </div>
                </div>

                {/* Allocation Circle */}
                <Card className="shadow-lg p-6 flex-1 min-h-0 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em]">ALOCAÇÃO ATUAL</h3>
                        <button className="text-accent-purple"><Icon name="more_horiz" size="sm" /></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {/* Simple SVG Donut representation */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border-panel)" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="35 65" strokeDashoffset="0" /> {/* Stocks 35% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="10" strokeDasharray="25 75" strokeDashoffset="-35" /> {/* BR 25% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="10" strokeDasharray="20 80" strokeDashoffset="-60" /> {/* Crypto 20% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="10" strokeDasharray="15 85" strokeDashoffset="-80" /> {/* FIIs 15% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6b7280" strokeWidth="10" strokeDasharray="5 95" strokeDashoffset="-95" /> {/* Caixa 5% */}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-text-primary">5</span>
                                <span className="text-[9px] font-bold text-text-secondary uppercase">Classes</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2 overflow-y-auto custom-scrollbar max-h-[150px]">
                        {assetAllocation.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${asset.color}`}></span>
                                    <span className="text-text-primary font-bold">{asset.name}</span>
                                </div>
                                <span className="font-mono text-text-secondary">{asset.percent}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
             </div>
          </div>
        )}

        {/* ... (Crypto Tab - Restored & Optimized for No-Scroll) ... */}
        {activeTab === 'crypto' && (
          // TODO: Extract to FinanceCrypto.tsx
          <div className="flex flex-col h-full gap-4 p-1 overflow-hidden animate-in fade-in duration-300">

             {/* ROW 1: Portfolio Manager (Left) & Side Panel (Right) - Flexible Height */}
             <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. Portfolio Manager (Main - Col 8) */}
                <div className="lg:col-span-8 bg-surface rounded-md border border-border-panel flex flex-col overflow-hidden shadow-lg relative">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-border-panel shrink-0 bg-surface z-10">
                        <div>
                            <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="pie_chart" className="text-accent-orange" size="sm" /> Portfolio Manager</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">{formatCurrency(totalPortfolioValue)}</p>
                                <div className="flex bg-border-panel rounded-sm p-0.5 border border-[#333] scale-75 origin-left">
                                    <button onClick={() => setDisplayCurrency('USD')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${displayCurrency === 'USD' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>USD</button>
                                    <button onClick={() => setDisplayCurrency('BRL')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${displayCurrency === 'BRL' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>BRL</button>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-black px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors shadow-lg shadow-accent-orange/20"><Icon name="add" size="sm" /> Ativo</button>
                    </div>
                    {/* Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
                            <thead className="sticky top-0 bg-surface z-10 shadow-sm">
                                <tr className="border-b border-border-panel text-[9px] text-text-secondary uppercase tracking-wider">
                                    <th className="py-3 pl-4 font-bold">Ativo</th>
                                    <th className="py-3 text-right font-bold">Preço</th>
                                    <th className="py-3 text-right font-bold">Qtd.</th>
                                    <th className="py-3 text-right font-bold">Total</th>
                                    <th className="py-3 text-right font-bold text-text-primary">24h</th>
                                    <th className="py-3 text-right font-bold hidden sm:table-cell">7d</th>
                                    <th className="py-3 pr-4 text-right font-bold hidden md:table-cell">1 Ano</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                    {portfolioAssets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-border-panel hover:bg-surface-hover transition-colors group">
                                            <td className="py-3 pl-4"><div className="flex items-center gap-3"><div className="w-1 h-6 rounded-full" style={{backgroundColor: asset.color}}></div><div><div className="flex items-center gap-2"><span className="font-bold text-text-primary text-xs">{asset.name}</span>{asset.type === 'nft' && <span className="text-[7px] bg-accent-purple/20 text-accent-purple px-1 rounded-sm border border-accent-purple/30 font-bold">NFT</span>}</div><span className="text-[9px] text-text-secondary font-mono">{asset.symbol}</span></div></div></td>
                                            <td className="py-3 text-right font-mono text-text-primary text-xs">{formatCurrency(asset.price)}</td>
                                            <td className="py-3 text-right font-mono text-text-secondary text-xs"><input type="number" value={asset.amount} onChange={(e) => handleAssetAmountChange(asset.id, parseFloat(e.target.value))} className="w-12 bg-transparent border-b border-border-panel focus:border-accent-orange outline-none text-right transition-colors p-0 text-xs"/></td>
                                            <td className="py-3 text-right font-mono font-bold text-text-primary text-xs">{formatCurrency(asset.amount * asset.price)}</td>
                                            <td className={`py-3 text-right font-bold text-xs ${asset.changes.d >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.d > 0 ? '+' : ''}{asset.changes.d}%</td>
                                            <td className={`py-3 text-right font-bold text-xs hidden sm:table-cell ${asset.changes.w >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.w > 0 ? '+' : ''}{asset.changes.w}%</td>
                                            <td className={`py-3 pr-4 text-right font-bold text-xs hidden md:table-cell ${asset.changes.y >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.y > 0 ? '+' : ''}{asset.changes.y}%</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Sidebar (Right - Col 4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    {/* Market Summary */}
                    <Card className="p-4 shrink-0 shadow-lg">
                        <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] mb-3 flex items-center gap-2"><Icon name="analytics" size="sm" /> Resumo do Mercado</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]"><span className="text-text-primary font-bold">BTC Dom.</span><span className="text-accent-orange font-mono font-bold">54.2%</span></div>
                            <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden"><div className="w-[54%] h-full bg-accent-orange"></div></div>

                            <div className="flex justify-between items-center text-[10px] pt-1"><span className="text-text-primary font-bold">Others Dom.</span><span className="text-accent-purple font-mono font-bold">12.8%</span></div>
                            <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden"><div className="w-[12%] h-full bg-accent-purple"></div></div>

                            <div className="flex justify-between items-center text-[10px] pt-1"><span className="text-text-primary font-bold">USDT Dom.</span><span className="text-brand-mint font-mono font-bold">5.1%</span></div>
                            <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden"><div className="w-[5%] h-full bg-brand-mint"></div></div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-panel mt-2">
                                <div className="text-center"><span className="text-[8px] text-text-secondary uppercase font-bold block">RSI (14D)</span><span className="text-sm font-mono font-bold text-text-primary">42.5</span></div>
                                <div className="text-center"><span className="text-[8px] text-text-secondary uppercase font-bold block">Fear & Greed</span><span className="text-sm font-mono font-bold text-brand-mint">72</span></div>
                            </div>
                        </div>
                    </Card>

                    {/* Watchlist (Draggable) */}
                    <Card className="p-4 flex-1 min-h-0 flex flex-col shadow-lg">
                        <div className="flex justify-between items-center mb-2"><h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="visibility" size="sm" /> Watchlist</h3></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {watchlistTokens.map((token, index) => (
                                <div key={token.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="flex items-center justify-between p-2 bg-header-bg rounded-md border border-border-panel hover:border-accent-orange/50 transition-all cursor-grab active:cursor-grabbing group">
                                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-text-secondary text-xs opacity-0 group-hover:opacity-50">drag_indicator</span><span className="text-[10px] font-bold text-text-primary">{token.symbol}</span></div>
                                    <div className="text-right flex items-center gap-2"><span className="text-[9px] text-text-secondary font-mono">$ {token.price.toLocaleString()}</span><span className={`text-[9px] font-bold ${token.change >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{token.change > 0 ? '+' : ''}{token.change}%</span></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
             </div>

             {/* ROW 2: Portfolio Growth Chart (Full Width - Fixed Height) */}
             <div className="h-48 shrink-0 bg-surface rounded-md border border-border-panel p-0 relative overflow-hidden shadow-lg group">
                <div className="absolute top-3 left-4 z-10"><h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-accent-orange rounded-full"></span> Portfolio Growth</h3></div>
                <div className="absolute inset-0 top-0 bottom-0 w-full">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                        <defs>
                            <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.2" /><stop offset="100%" stopColor="#FF9F0A" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d="M0,150 C100,140 200,160 300,120 C400,80 500,100 600,60 C700,20 800,40 900,10 L1000,30 V200 H0 Z" fill="url(#growthGradient)" />
                        <path d="M0,150 C100,140 200,160 300,120 C400,80 500,100 600,60 C700,20 800,40 900,10 L1000,30" fill="none" className="stroke-accent-orange" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                    </svg>
                </div>
             </div>

             {/* ROW 3: Staking & Converter (Bottom - Fixed Height) */}
             <div className="h-48 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staking */}
                <Card className="p-4 flex flex-col shadow-lg overflow-hidden">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="lock_clock" className="text-accent-orange" size="sm" /> Staking</h3>
                        <div className="flex bg-border-panel rounded-sm p-0.5 border border-[#333] scale-75 origin-right">
                            <button onClick={() => setStakingDisplayCurrency('USD')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${stakingDisplayCurrency === 'USD' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>USD</button>
                            <button onClick={() => setStakingDisplayCurrency('BRL')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${stakingDisplayCurrency === 'BRL' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>BRL</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {stakingAssets.map((stake) => (
                            <div key={stake.id} className="bg-header-bg p-3 rounded-md border border-border-panel flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-accent-orange font-bold text-[8px] border border-border-panel">{stake.symbol}</div><span className="text-[10px] font-bold text-text-primary">{stake.name}</span></div>
                                    <span className="text-[10px] font-mono text-text-primary font-bold">{formatCurrency(stake.amount * stake.price, stakingDisplayCurrency)}</span>
                                </div>
                                <div className="w-full h-1 bg-border-panel rounded-full overflow-hidden"><div className="h-full bg-accent-orange" style={{width: `${(stake.currentDay / stake.totalDays) * 100}%`}}></div></div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Converter (Orange) */}
                <div className="bg-gradient-to-br from-surface to-surface-hover rounded-md border border-border-panel p-4 flex flex-col justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Icon name="currency_exchange" className="text-6xl text-accent-orange" /></div>
                    <div className="flex justify-between items-center mb-3"><h3 className="text-[9px] font-black text-text-primary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="swap_horiz" className="text-accent-orange" size="sm" /> CONVERSOR RÁPIDO</h3></div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="bg-header-bg rounded-md p-2 border border-border-panel group focus-within:border-accent-orange transition-colors flex justify-between items-center">
                            <input type="number" value={calcAmount} onChange={(e) => setCalcAmount(parseFloat(e.target.value))} className="bg-transparent border-none p-0 text-text-primary font-mono font-bold text-sm w-20 focus:ring-0 outline-none" />
                            <select value={calcFrom} onChange={(e) => setCalcFrom(e.target.value)} className="bg-border-panel border-none text-[9px] font-bold text-text-primary rounded-sm py-0.5 px-2 cursor-pointer focus:ring-0 uppercase">{Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                        <div className="flex justify-center -my-3 relative z-20"><div className="w-6 h-6 rounded-full bg-surface-hover border border-border-panel flex items-center justify-center text-text-secondary"><Icon name="arrow_downward" size="xs" /></div></div>
                        <div className="bg-header-bg rounded-md p-2 border border-border-panel group focus-within:border-accent-orange transition-colors flex justify-between items-center">
                            <span className="text-accent-orange font-mono font-bold text-sm pl-2">{conversionResult.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                            <select value={calcTo} onChange={(e) => setCalcTo(e.target.value)} className="bg-border-panel border-none text-[9px] font-bold text-text-primary rounded-sm py-0.5 px-2 cursor-pointer focus:ring-0 uppercase">{Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                    </div>
                </div>
             </div>

          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {/* TODO: Extract Modals to separate components */}

      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface border border-border-panel rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
                 <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="add_circle" className="text-brand-mint" /> Novo Recebimento</h3>
                 <button onClick={() => setIsIncomeModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">DESCRIÇÃO</label><input type="text" placeholder="Ex: Salário, Freelance..." className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-brand-mint outline-none transition-colors" /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-brand-mint outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Data</label><input type="date" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-brand-mint outline-none transition-colors" /></div></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">CATEGORIA</label><select className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-brand-mint outline-none transition-colors"><option>SALÁRIO</option><option>Freelance</option><option>Investimentos</option><option>Outros</option></select></div>
              </div>
              <div className="p-6 border-t border-border-panel bg-header-bg flex justify-end gap-3"><button onClick={() => setIsIncomeModalOpen(false)} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Cancelar</button><button className="px-6 py-2 rounded-sm bg-brand-mint text-black text-xs font-bold uppercase hover:bg-brand-mint/80 transition-colors shadow-lg shadow-brand-mint/20">Confirmar</button></div>
           </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface border border-border-panel rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
                 <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2"><Icon name="remove_circle" className="text-accent-red" /> Adicionar Custo</h3>
                 <button onClick={() => setIsExpenseModalOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">DESCRIÇÃO</label><input type="text" placeholder="Ex: Aluguel, Mercado..." className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-red outline-none transition-colors" /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-primary focus:border-accent-red outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Data</label><input type="date" className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-accent-red outline-none transition-colors" /></div></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-text-secondary uppercase">Categoria</label><select className="w-full bg-header-bg border border-border-panel rounded-md p-3 text-base md:text-sm text-text-secondary focus:border-accent-red outline-none transition-colors"><option>Moradia</option><option>ALIMENTAÇÃO</option><option>Transporte</option><option>Lazer</option><option>SAÚDE</option></select></div>
              </div>
              <div className="p-6 border-t border-border-panel bg-header-bg flex justify-end gap-3"><button onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Cancelar</button><button className="px-6 py-2 rounded-sm bg-accent-red text-white text-xs font-bold uppercase hover:bg-accent-red/90 transition-colors shadow-lg shadow-accent-red/20">Confirmar</button></div>
           </div>
        </div>
      )}

      {/* Investment Detail Modal */}
      {(isInvestModalOpen || selectedInvestment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-surface border border-border-panel rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-border-panel flex justify-between items-center bg-header-bg">
                 <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Icon name={selectedInvestment ? 'query_stats' : 'add_circle'} className="text-accent-purple" />
                    {selectedInvestment ? selectedInvestment.name : 'Novo Ativo'}
                 </h3>
                 <button onClick={() => { setIsInvestModalOpen(false); setSelectedInvestment(null); }} className="text-text-secondary hover:text-text-primary transition-colors"><Icon name="close" /></button>
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
                        {/* Fake Detail Chart */}
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
                  <button onClick={() => { setIsInvestModalOpen(false); setSelectedInvestment(null); }} className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors">Fechar</button>
                  {!selectedInvestment && <button className="px-6 py-2 rounded-sm bg-accent-purple text-white text-xs font-bold uppercase hover:bg-accent-purple/90 transition-colors shadow-lg shadow-accent-purple/20">Salvar Ativo</button>}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Finance;
