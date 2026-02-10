import React, { useState, useEffect, useRef } from 'react';

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
    { name: 'Ações BR', value: 45000, percent: 25, color: 'bg-green-500', icon: 'trending_up', risk: 'Médio', returns: '+12.5%' },
    { name: 'Stocks (US)', value: 65000, percent: 35, color: 'bg-blue-500', icon: 'public', risk: 'Alto', returns: '+18.2%' },
    { name: 'Crypto', value: 35000, percent: 20, color: 'bg-purple-500', icon: 'currency_bitcoin', risk: 'Altíssimo', returns: '-5.4%' },
    { name: 'FIIs', value: 25000, percent: 15, color: 'bg-yellow-500', icon: 'apartment', risk: 'Baixo', returns: '+8.1%' },
    { name: 'Caixa', value: 8000, percent: 5, color: 'bg-gray-500', icon: 'savings', risk: 'Nulo', returns: '+1.0%' },
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

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full font-sans h-full overflow-y-auto relative">
      <div className="flex flex-col gap-6 h-full">
        
        {/* Navigation Tabs */}
        <div className="border-b border-[#2A2A30] shrink-0">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
              {['overview', 'cashflow', 'transactions', 'debts', 'investments', 'crypto'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm flex items-center gap-2 transition-colors uppercase tracking-wide
                    ${activeTab === tab ? 
                      (tab === 'debts' ? 'border-[#135bec] text-[#135bec]' : 
                       tab === 'investments' ? 'border-[#bf5af2] text-[#bf5af2]' :
                       tab === 'crypto' ? 'border-[#FF9F0A] text-[#FF9F0A]' :
                       'border-[#00FF95] text-[#00FF95]') 
                      : 'border-transparent text-[#8A8A8A] hover:text-white hover:border-gray-500'}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {tab === 'overview' && 'dashboard'}
                    {tab === 'transactions' && 'receipt_long'}
                    {tab === 'debts' && 'credit_card'}
                    {tab === 'cashflow' && 'swap_horiz'}
                    {tab === 'investments' && 'candlestick_chart'}
                    {tab === 'crypto' && 'currency_bitcoin'}
                  </span>
                  {tab === 'overview' && 'VISÃO GERAL'}
                  {tab === 'transactions' && 'TRANSAÇÕES'}
                  {tab === 'debts' && 'DÉBITOS'}
                  {tab === 'cashflow' && 'FLUXO DE CAIXA'}
                  {tab === 'investments' && 'INVESTIMENTOS'}
                  {tab === 'crypto' && 'CRIPTO'}
                </button>
              ))}
            </nav>
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full overflow-hidden">
            
            {/* ROW 1: Metrics + Revenue Goal (Compact) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-[#1C1C1C] p-4 rounded border border-[#2A2A30] shadow-sm relative overflow-hidden group hover:border-[#00FF95]/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><span className="material-symbols-outlined text-5xl text-[#00FF95]">trending_up</span></div>
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-1">Receita Mensal</h3>
                        <div className="flex items-baseline gap-2"><span className="text-xl lg:text-2xl font-bold font-mono text-[#00FF95]">R$ 12.500</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-[#00FF95] font-medium"><span className="material-symbols-outlined text-xs mr-1">arrow_upward</span>12% vs mês anterior</div>
                    </div>
                    <div className="bg-[#1C1C1C] p-4 rounded border border-[#2A2A30] shadow-sm relative overflow-hidden group hover:border-[#FF453A]/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><span className="material-symbols-outlined text-5xl text-[#FF453A]">trending_down</span></div>
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-1">Gastos Mensais</h3>
                        <div className="flex items-baseline gap-2"><span className="text-xl lg:text-2xl font-bold font-mono text-[#FF453A]">R$ 11.230</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-[#FF453A] font-medium"><span className="material-symbols-outlined text-xs mr-1">arrow_upward</span>5% vs mês anterior</div>
                    </div>
                    <div className="bg-[#1C1C1C] p-4 rounded border border-[#2A2A30] shadow-sm relative overflow-hidden group hover:border-[#3b82f6]/30 transition-colors flex flex-col justify-center">
                        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><span className="material-symbols-outlined text-5xl text-[#3b82f6]">account_balance_wallet</span></div>
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-1">Saldo Atual</h3>
                        <div className="flex items-baseline gap-2"><span className="text-xl lg:text-2xl font-bold font-mono text-[#3b82f6]">R$ 1.270</span></div>
                        <div className="mt-1 flex items-center text-[10px] text-[#8A8A8A] font-medium"><span className="material-symbols-outlined text-xs mr-1">remove</span>Estável</div>
                    </div>
                </div>
                
                <div className="lg:col-span-4">
                    <div className="bg-[#1C1C1C] rounded border border-[#2A2A30] p-4 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-1">Meta de Receita</h3>
                        <div className="flex items-end gap-2 mb-3">
                            <h2 className="text-xl font-bold font-mono text-white">R$ 12.500</h2>
                            <span className="text-xs text-[#8A8A8A] font-medium mb-1">/ R$ 50.000</span>
                        </div>
                        <div className="w-full h-2 bg-[#121212] rounded-full overflow-hidden border border-[#2A2A30] mb-2">
                            <div className="h-full bg-[#00FF95] rounded-full relative" style={{width: '25%'}}>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50"></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-[#E1E1E1] leading-relaxed">
                            Você atingiu <span className="text-[#00FF95] font-bold">25%</span> da sua meta.
                        </p>
                    </div>
                </div>
            </div>

            {/* ROW 2: Chart + Feed (Flexible) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="bg-[#1C1C1C] p-4 rounded border border-[#2A2A30] shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-4 bg-[#00FF95]"></span> EVOLUÇÃO</h2>
                            <div className="flex gap-2">
                                <div className="flex bg-white/5 rounded p-0.5 border border-[#2A2A30] overflow-hidden">
                                    {['Sem', 'Mês', 'Ano'].map((period, i) => (
                                        <button key={period} className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-sm transition-colors ${i === 1 ? 'bg-[#00FF95] text-black' : 'text-[#8A8A8A] hover:text-white'}`}>{period}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="relative w-full flex-grow rounded border border-[#2A2A30] overflow-hidden bg-[#151515]" style={{ backgroundImage: 'linear-gradient(to right, #2A2A30 1px, transparent 1px), linear-gradient(to bottom, #2A2A30 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #2A2A30 1px, transparent 1px), linear-gradient(to bottom, #2A2A30 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
                            <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between text-[9px] text-[#8A8A8A] font-mono px-1 py-2 border-r border-[#2A2A30] bg-[#1C1C1C]/50">
                                <span>15k</span><span>10k</span><span>5k</span><span>0</span>
                            </div>
                            <div className="absolute left-10 right-0 top-2 bottom-6 flex items-end justify-between px-2 gap-2">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 250">
                                    <defs>
                                        <linearGradient id="gradientGreen" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#00FF95" stopOpacity="0.2"></stop><stop offset="100%" stopColor="#00FF95" stopOpacity="0"></stop></linearGradient>
                                        <linearGradient id="gradientRed" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF453A" stopOpacity="0.2"></stop><stop offset="100%" stopColor="#FF453A" stopOpacity="0"></stop></linearGradient>
                                    </defs>
                                    <path d="M0,180 C50,160 100,100 150,110 C200,120 250,90 300,50 C350,10 400,60 450,40 C500,20 550,60 600,40 C650,20 700,50 800,30 L800,250 L0,250 Z" fill="url(#gradientGreen)" stroke="none"></path>
                                    <path d="M0,180 C50,160 100,100 150,110 C200,120 250,90 300,50 C350,10 400,60 450,40 C500,20 550,60 600,40 C650,20 700,50 800,30" fill="none" stroke="#00FF95" strokeWidth="2"></path>
                                    <path d="M0,220 C50,210 100,180 150,190 C200,200 250,150 300,160 C350,170 400,120 450,130 C500,140 550,100 600,110 C650,120 700,90 800,80 L800,250 L0,250 Z" fill="url(#gradientRed)" stroke="none"></path>
                                    <path d="M0,220 C50,210 100,180 150,190 C200,200 250,150 300,160 C350,170 400,120 450,130 C500,140 550,100 600,110 C650,120 700,90 800,80" stroke="#FF453A" strokeWidth="2" fill="none"></path>
                                </svg>
                            </div>
                            <div className="absolute bottom-0 left-10 right-0 h-6 flex justify-between items-center text-[9px] text-[#8A8A8A] font-mono px-4 border-t border-[#2A2A30] bg-[#1C1C1C]/50">
                                <span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col h-full min-h-0">
                    <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center bg-[#222] shrink-0">
                            <h3 className="font-bold text-white text-[10px] uppercase tracking-wider">Feed Financeiro</h3>
                            <button className="text-[#00FF95] hover:text-[#00CC78] text-[9px] font-bold uppercase tracking-wide transition-colors">Ver tudo</button>
                        </div>
                        <div className="p-2 overflow-y-auto custom-scrollbar flex-grow">
                            <ul className="space-y-1">
                                {detailedTransactions.slice(0, 5).map(tx => (
                                    <li key={tx.id} className="p-2 hover:bg-[#252525] rounded transition-colors flex items-center justify-between group cursor-pointer border border-transparent hover:border-[#2A2A2A]">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded bg-[#121212] border border-[#2A2A2A] flex items-center justify-center ${tx.type === 'income' ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>
                                                <span className="material-symbols-outlined text-sm">{tx.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white">{tx.title}</p>
                                                <p className="text-[9px] text-[#8A8A8A]">{tx.merchant}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{tx.type === 'income' ? '+' : '-'} {formatBRL(Math.abs(tx.amount))}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ROW 3: Categories + Payments (Flex-1) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
                <div className="lg:col-span-8 flex flex-col h-full min-h-0">
                    <div className="bg-[#1C1C1C] p-4 rounded border border-[#2A2A2A] shadow-sm flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2 shrink-0">
                            <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-3 bg-[#8A8A8A]"></span> GASTOS POR CATEGORIA</h2>
                        </div>
                        <div className="flex-grow flex flex-col justify-center space-y-2">
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded bg-[#252525] text-purple-400 border border-[#2A2A2A]"><span className="material-symbols-outlined text-[10px]">home</span></div><span className="text-[10px] font-semibold text-gray-300">Moradia</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-white">R$ 4.500</span></div>
                                </div>
                                <div className="w-full bg-[#121212] border border-[#2A2A2A] rounded-sm h-1.5"><div className="bg-purple-500 h-full rounded-sm relative" style={{width: '40%'}}></div></div>
                            </div>
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded bg-[#252525] text-orange-400 border border-[#2A2A2A]"><span className="material-symbols-outlined text-[10px]">restaurant</span></div><span className="text-[10px] font-semibold text-gray-300">Alimentação</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-white">R$ 2.800</span></div>
                                </div>
                                <div className="w-full bg-[#121212] border border-[#2A2A2A] rounded-sm h-1.5"><div className="bg-orange-500 h-full rounded-sm relative" style={{width: '25%'}}></div></div>
                            </div>
                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <div className="flex items-center gap-2"><div className="p-1 rounded bg-[#252525] text-blue-400 border border-[#2A2A2A]"><span className="material-symbols-outlined text-[10px]">commute</span></div><span className="text-[10px] font-semibold text-gray-300">Transporte</span></div>
                                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-white">R$ 1.680</span></div>
                                </div>
                                <div className="w-full bg-[#121212] border border-[#2A2A2A] rounded-sm h-1.5"><div className="bg-blue-500 h-full rounded-sm relative" style={{width: '15%'}}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col h-full min-h-0">
                    <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-sm flex flex-col h-full overflow-hidden">
                        <div className="p-3 border-b border-[#2A2A2A] flex justify-between items-center bg-[#222] shrink-0">
                            <h3 className="font-bold text-white text-[10px] uppercase tracking-wider">Próximos Pagamentos</h3>
                        </div>
                        <div className="p-3 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-[#2A2A2A] rounded border border-[#333] text-[#8A8A8A]"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-white">10</span></div>
                                    <div><p className="text-[10px] font-bold text-white group-hover:text-[#FF453A] transition-colors">Aluguel</p><p className="text-[9px] text-[#8A8A8A]">Recorrente</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white">R$ 2.500</span>
                            </div>
                            <div className="w-full h-px bg-[#2A2A2A]"></div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-[#2A2A2A] rounded border border-[#333] text-[#8A8A8A]"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-white">12</span></div>
                                    <div><p className="text-[10px] font-bold text-white group-hover:text-[#FF453A] transition-colors">AWS</p><p className="text-[9px] text-[#8A8A8A]">Infra</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white">R$ 350</span>
                            </div>
                            <div className="w-full h-px bg-[#2A2A2A]"></div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-center justify-center w-7 h-7 bg-[#2A2A2A] rounded border border-[#333] text-[#8A8A8A]"><span className="text-[7px] font-bold uppercase">OUT</span><span className="text-[10px] font-bold text-white">15</span></div>
                                    <div><p className="text-[10px] font-bold text-white group-hover:text-[#FF453A] transition-colors">Seguro</p><p className="text-[9px] text-[#8A8A8A]">Anual</p></div>
                                </div>
                                <span className="text-[10px] font-bold font-mono text-white">R$ 390</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        )}

        {/* --- CASHFLOW TAB --- */}
        {activeTab === 'cashflow' && (
          <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* COL 1: INFLOWS */}
                <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] shadow-lg flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#2A2A2A] bg-[#181818]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#00FF95]">arrow_downward</span> Entradas</h3>
                            <button onClick={() => setIsIncomeModalOpen(true)} className="text-[#00FF95] hover:text-white transition-colors bg-[#00FF95]/10 p-1.5 rounded-md hover:bg-[#00FF95]/20"><span className="material-symbols-outlined text-lg">add</span></button>
                        </div>
                        <p className="text-2xl font-mono font-bold text-[#00FF95]">{formatBRL(totalReceived)}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1C1C1C]">
                        {incomeSources.map((source, idx) => (
                            <div key={idx} className="bg-[#121212] p-3 rounded border border-[#2A2A2A] flex justify-between items-center group hover:border-[#00FF95]/30 transition-colors">
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-[#1C1C1C] flex items-center justify-center text-[#00FF95] border border-[#2A2A2A]"><span className="material-symbols-outlined text-sm">{source.icon}</span></div><div><p className="text-xs font-bold text-white">{source.name}</p><p className="text-[10px] text-[#8A8A8A]">Data: {source.date}</p></div></div>
                                <div className="text-right"><p className="text-xs font-mono font-bold text-[#00FF95]">+ R$ {source.expected}</p><span className={`text-[9px] uppercase font-bold px-1.5 rounded ${source.status === 'received' ? 'bg-[#00FF95]/10 text-[#00FF95]' : 'bg-[#2A2A2A] text-[#8A8A8A]'}`}>{source.status === 'received' ? 'Recebido' : 'A Receber'}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* COL 2: OUTFLOWS */}
                <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] shadow-lg flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#2A2A2A] bg-[#181818]">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#FF453A]">arrow_upward</span> Saídas</h3>
                            <button onClick={() => setIsExpenseModalOpen(true)} className="text-[#FF453A] hover:text-white transition-colors bg-[#FF453A]/10 p-1.5 rounded-md hover:bg-[#FF453A]/20"><span className="material-symbols-outlined text-lg">add</span></button>
                        </div>
                        <p className="text-2xl font-mono font-bold text-[#FF453A]">- {formatBRL(totalExpenses)}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#1C1C1C]">
                        {recurringExpenses.map((expense, idx) => (
                            <div key={idx} className="bg-[#121212] p-3 rounded border border-[#2A2A2A] flex justify-between items-center group hover:border-[#FF453A]/30 transition-colors">
                                <div><p className="text-xs font-bold text-white">{expense.name}</p><p className="text-[10px] text-[#8A8A8A]">Vencimento: {expense.date}</p></div>
                                <div className="text-right"><p className="text-xs font-mono font-bold text-[#FF453A]">- R$ {expense.amount}</p><span className={`text-[9px] uppercase font-bold px-1.5 rounded ${expense.status === 'paid' ? 'bg-[#FF453A]/10 text-[#FF453A]' : 'bg-[#2A2A2A] text-[#8A8A8A]'}`}>{expense.status === 'paid' ? 'Pago' : 'Agendado'}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* COL 3: ANALYSIS */}
                <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] shadow-lg flex flex-col p-6 overflow-hidden">
                    <div className="flex justify-between items-start mb-6"><h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#0A84FF]">analytics</span> Análise de Fluxo</h3></div>
                    <div className="flex-1 flex items-end justify-center gap-8 px-4 relative">
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10 z-0 pb-6"><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div><div className="w-full h-px bg-white"></div></div>
                        <div className="flex flex-col items-center gap-2 z-10 w-16 group"><span className="text-[10px] font-bold text-[#00FF95] opacity-0 group-hover:opacity-100 transition-opacity">{(totalReceived/maxBarValue*100).toFixed(0)}%</span><div className="w-full bg-[#00FF95] rounded-t-sm relative transition-all duration-500" style={{height: `${(totalReceived/maxBarValue)*100}%`}}><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div></div><span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Entradas</span></div>
                        <div className="flex flex-col items-center gap-2 z-10 w-16 group"><span className="text-[10px] font-bold text-[#FF453A] opacity-0 group-hover:opacity-100 transition-opacity">{(totalExpenses/maxBarValue*100).toFixed(0)}%</span><div className="w-full bg-[#FF453A] rounded-t-sm relative transition-all duration-500" style={{height: `${(totalExpenses/maxBarValue)*100}%`}}><div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div></div><span className="text-[10px] font-bold text-[#8A8A8A] uppercase">Saídas</span></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-[#2A2A2A] space-y-4">
                        <div className="flex justify-between items-center"><span className="text-xs text-[#8A8A8A] font-bold uppercase tracking-wide">Saldo Líquido</span><span className={`text-sm font-mono font-bold ${netResult >= 0 ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>{netResult >= 0 ? '+' : ''} {formatBRL(netResult)}</span></div>
                        <div className="bg-[#121212] p-3 rounded border border-[#2A2A2A]"><p className="text-[10px] text-[#E1E1E1] leading-snug"><span className="text-[#00FF95] font-bold uppercase mr-1">Insight:</span> Suas despesas representam <span className="text-[#FF453A] font-bold">{((totalExpenses/totalReceived)*100).toFixed(1)}%</span> da sua receita total. Fluxo saudável.</p></div>
                    </div>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <div className="bg-[#1C1C1C] rounded-lg p-4 border border-[#2A2A2A] flex items-center justify-between shadow-sm"><div><p className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider mb-1">Crescimento Entradas</p><p className="text-lg font-mono font-bold text-white">+12.5%</p></div><div className="w-8 h-8 rounded bg-[#00FF95]/10 flex items-center justify-center text-[#00FF95]"><span className="material-symbols-outlined text-sm">trending_up</span></div></div>
                <div className="bg-[#1C1C1C] rounded-lg p-4 border border-[#2A2A2A] flex items-center justify-between shadow-sm"><div><p className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider mb-1">Crescimento Saídas</p><p className="text-lg font-mono font-bold text-[#FF453A]">+3.2%</p></div><div className="w-8 h-8 rounded bg-[#FF453A]/10 flex items-center justify-center text-[#FF453A]"><span className="material-symbols-outlined text-sm">trending_up</span></div></div>
                <div className="bg-[#1C1C1C] rounded-lg p-4 border border-[#2A2A2A] shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between relative z-10"><div><p className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider mb-1">Meta de Otimização</p><p className="text-lg font-mono font-bold text-[#BF5AF2]">{savingsRate.toFixed(1)}% / {optimizationGoal}%</p></div><div className="w-8 h-8 rounded bg-[#BF5AF2]/10 flex items-center justify-center text-[#BF5AF2]"><span className="material-symbols-outlined text-sm">savings</span></div></div>
                    <div className="w-full bg-[#2A2A2A] h-1 rounded-full mt-3 overflow-hidden relative z-10"><div className="bg-[#BF5AF2] h-full rounded-full transition-all duration-1000" style={{width: `${Math.min((savingsRate/optimizationGoal)*100, 100)}%`}}></div></div>
                </div>
             </div>
          </div>
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-[#1C1C1C] p-4 rounded-xl border border-[#2A2A2A]">
                <h2 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2"><span className="material-symbols-outlined text-[#00FF95]">receipt_long</span> Todas as Transações</h2>
                <div className="flex gap-3">
                    <input type="text" placeholder="Buscar..." className="bg-[#121212] border border-[#2A2A2A] rounded px-3 py-1.5 text-sm text-white focus:border-[#00FF95] outline-none" />
                    <button className="bg-[#00FF95] text-black px-4 py-1.5 rounded text-xs font-bold uppercase hover:bg-[#00CC78] transition-colors">Exportar CSV</button>
                </div>
            </div>
            <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#222] text-[#8A8A8A] text-xs uppercase font-bold border-b border-[#2A2A2A]">
                        <tr>
                            <th className="p-4">Descrição</th>
                            <th className="p-4">Categoria</th>
                            <th className="p-4">Data</th>
                            <th className="p-4 text-right">Valor</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]">
                        {detailedTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#252525] transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded bg-[#121212] border border-[#2A2A2A] flex items-center justify-center ${tx.type === 'income' ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>
                                        <span className="material-symbols-outlined text-sm">{tx.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{tx.title}</p>
                                        <p className="text-xs text-[#8A8A8A]">{tx.merchant}</p>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-[#E1E1E1]">{tx.category}</td>
                                <td className="p-4 text-sm text-[#8A8A8A] font-mono">{tx.date}</td>
                                <td className={`p-4 text-right text-sm font-bold font-mono ${tx.type === 'income' ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatBRL(Math.abs(tx.amount))}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${tx.status === 'completed' ? 'bg-green-900/30 text-green-500 border-green-500/30' : 'bg-yellow-900/30 text-yellow-500 border-yellow-500/30'}`}>
                                        {tx.status === 'completed' ? 'Pago' : 'Processando'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* --- DEBTS TAB --- */}
        {activeTab === 'debts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 h-full overflow-hidden">
            {/* Left Col: Stats + Debts Grid */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                <div className="bg-[#1C1C1C] p-5 rounded border border-[#2A2A2A] shadow-lg relative overflow-hidden group hover:border-[#FF453A]/30 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10"><span className="material-symbols-outlined text-6xl text-[#FF453A]">trending_down</span></div>
                  <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">Total em Débitos</h3>
                  <div className="flex items-baseline gap-2"><span className="text-2xl lg:text-3xl font-bold font-mono text-white">R$ 183.750,00</span></div>
                  <div className="mt-2 flex items-center text-xs text-red-500 font-medium"><span className="material-symbols-outlined text-sm mr-1">arrow_upward</span>Juros acumulados: +2.1%</div>
                </div>
                <div className="bg-[#1C1C1C] p-5 rounded border border-[#2A2A2A] shadow-lg relative overflow-hidden group hover:border-[#135bec]/30 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10"><span className="material-symbols-outlined text-6xl text-[#135bec]">calendar_today</span></div>
                  <h3 className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider mb-2">Parcela Mensal Total</h3>
                  <div className="flex items-baseline gap-2"><span className="text-2xl lg:text-3xl font-bold font-mono text-white">R$ 6.980,00</span></div>
                  <div className="mt-2 flex items-center text-xs text-[#135bec] font-medium"><span className="material-symbols-outlined text-sm mr-1">check_circle</span>Em dia</div>
                </div>
              </div>

              <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-lg p-6 flex-1 min-h-0 flex flex-col">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-5 bg-[#135bec]"></span> MEUS DÉBITOS</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#135bec] hover:bg-[#135bec]/90 text-white text-[10px] font-bold uppercase rounded transition-colors"><span className="material-symbols-outlined text-sm">add</span> Novo Débito</button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scrollbar p-1">
                    {/* BLOCK 1: BLUE */}
                    <div className="group relative bg-[#0D0D0F] rounded-lg p-5 border border-[#2A2A2A] hover:border-[#0A84FF]/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#0A84FF]/10 flex items-center justify-center text-[#0A84FF] border border-[#0A84FF]/20"><span className="material-symbols-outlined">home</span></div>
                          <div><h3 className="text-sm font-bold text-white">Financiamento Imóvel</h3><p className="text-xs text-[#8A8A8A]">Banco Santander</p></div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">Em Dia</span>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-[#8A8A8A] mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-tight">R$ 145.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden"><div className="h-full bg-[#0A84FF]" style={{width: '45%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-[#8A8A8A]"><span>Progresso: 45%</span><span className="text-[#0A84FF]">Simular Antecipação</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* BLOCK 2: ORANGE */}
                    <div className="group relative bg-[#0D0D0F] rounded-lg p-5 border border-[#2A2A2A] hover:border-[#FF9F0A]/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#FF9F0A]/10 flex items-center justify-center text-[#FF9F0A] border border-[#FF9F0A]/20"><span className="material-symbols-outlined">directions_car</span></div>
                          <div><h3 className="text-sm font-bold text-white">Jeep Compass</h3><p className="text-xs text-[#8A8A8A]">Financiamento BV</p></div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">Em Dia</span>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-[#8A8A8A] mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-tight">R$ 22.500,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden"><div className="h-full bg-[#FF9F0A]" style={{width: '60%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-[#8A8A8A]"><span>Progresso: 60%</span><span className="text-[#FF9F0A]">Simular Antecipação</span></div>
                        </div>
                      </div>
                    </div>

                    {/* BLOCK 3: PURPLE */}
                    <div className="group relative bg-[#0D0D0F] rounded-lg p-5 border border-[#2A2A2A] hover:border-[#BF5AF2]/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#BF5AF2]/10 flex items-center justify-center text-[#BF5AF2] border border-[#BF5AF2]/20"><span className="material-symbols-outlined">construction</span></div>
                          <div><h3 className="text-sm font-bold text-white">Empréstimo Reforma</h3><p className="text-xs text-[#8A8A8A]">Banco Itaú</p></div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">Em Dia</span>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-[#8A8A8A] mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-tight">R$ 45.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden"><div className="h-full bg-[#BF5AF2]" style={{width: '30%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-[#8A8A8A]"><span>Progresso: 30%</span><span className="text-[#BF5AF2]">Simular Antecipação</span></div>
                        </div>
                      </div>
                    </div>

                    {/* BLOCK 4: GREEN */}
                    <div className="group relative bg-[#0D0D0F] rounded-lg p-5 border border-[#2A2A2A] hover:border-[#00FF95]/50 transition-all duration-300 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#00FF95]/10 flex items-center justify-center text-[#00FF95] border border-[#00FF95]/20"><span className="material-symbols-outlined">school</span></div>
                          <div><h3 className="text-sm font-bold text-white">Crédito Universitário</h3><p className="text-xs text-[#8A8A8A]">Fies</p></div>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/20">Em Dia</span>
                      </div>
                      <div>
                        <div className="mb-3">
                            <p className="text-[10px] text-[#8A8A8A] mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
                            <p className="text-2xl font-mono font-bold text-white tracking-tight">R$ 12.000,00</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1.5 w-full bg-[#2A2A2A] rounded-full overflow-hidden"><div className="h-full bg-[#00FF95]" style={{width: '85%'}}></div></div>
                            <div className="flex justify-between text-[10px] font-bold uppercase text-[#8A8A8A]"><span>Progresso: 85%</span><span className="text-[#00FF95]">Simular Antecipação</span></div>
                        </div>
                      </div>
                    </div>

                 </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
              <div className="bg-[#1C1C1C] rounded-xl p-0 border border-[#2A2A30] flex flex-col relative overflow-hidden flex-1 min-h-0">
                {/* Financial Health Header Color Change */}
                <div className="w-full h-2 bg-[#00FF95]"></div>
                <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center shrink-0">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#00FF95]">PAGAMENTOS DO MÊS</h2>
                    </div>
                    
                    {/* Monthly Progress Bar - Gamified with Tooltip */}
                    <div className="group cursor-pointer relative shrink-0">
                        <div className="flex justify-between text-[10px] font-bold uppercase text-[#8A8A8A] mb-2 group-hover:text-white transition-colors">
                            <span>Progresso</span>
                            <span className="text-[#00FF95]">65%</span>
                        </div>
                        <div className="w-full h-3 bg-[#2A2A2A] rounded-full overflow-hidden border border-[#2A2A2A] relative shadow-inner">
                            <div className="h-full bg-[#00FF95] w-[65%] rounded-full relative overflow-hidden">
                                {/* Animated Stripes */}
                                <div className="absolute inset-0 w-full h-full bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]" style={{backgroundSize: '20px 20px'}}></div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            </div>
                        </div>
                        
                        {/* Visual Streak Tooltip */}
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#121212] border border-[#2A2A2A] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-48">
                            <p className="text-[9px] text-[#8A8A8A] uppercase font-bold text-center mb-2">Streak de Pagamentos</p>
                            <div className="grid grid-cols-6 gap-1">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-full aspect-square bg-[#00FF95] rounded-sm opacity-80 border border-[#00FF95]/30"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col">
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-3 shrink-0">Próximos Vencimentos (30 dias)</h3>
                        <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1">
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A] hover:border-[#FF9F0A]/30 transition-colors"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#FF9F0A] rounded-full"></span><div><p className="text-xs font-bold text-white">Cartão Black</p><p className="text-[10px] text-[#8A8A8A]">Vence Amanhã</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 4.250</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#FF9F0A] rounded-full"></span><div><p className="text-xs font-bold text-white">Seguro Auto</p><p className="text-[10px] text-[#8A8A8A]">Vence em 5 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 390</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#00FF95] rounded-full"></span><div><p className="text-xs font-bold text-white">Condomínio</p><p className="text-[10px] text-[#8A8A8A]">Vence em 8 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 1.200</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#00FF95] rounded-full"></span><div><p className="text-xs font-bold text-white">Plano de Saúde</p><p className="text-[10px] text-[#8A8A8A]">Vence em 10 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 850</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#00FF95] rounded-full"></span><div><p className="text-xs font-bold text-white">Escola Crianças</p><p className="text-[10px] text-[#8A8A8A]">Vence em 12 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 3.200</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#00FF95] rounded-full"></span><div><p className="text-xs font-bold text-white">Seguro Vida</p><p className="text-[10px] text-[#8A8A8A]">Vence em 15 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 180</span></div>
                            <div className="flex justify-between items-center p-2 bg-[#121212] rounded border border-[#2A2A2A]"><div className="flex items-center gap-2"><span className="w-1 h-8 bg-[#00FF95] rounded-full"></span><div><p className="text-xs font-bold text-white">IPVA 3ª Parc</p><p className="text-[10px] text-[#8A8A8A]">Vence em 20 dias</p></div></div><span className="text-xs font-mono font-bold text-white">R$ 980</span></div>
                        </div>
                    </div>
                </div>
              </div>
              
              {/* Score Card - Reduced Size & Square & Flatter */}
              <div className="bg-[#1C1C1C] rounded-xl p-4 border border-[#2A2A30] shadow-lg flex flex-col items-center justify-between shrink-0 h-auto gap-4 group">
                 <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest w-full text-left">Score de Crédito</h3>
                 
                 <div className="flex flex-col items-center justify-center">
                    {/* Square Indicator - Smaller */}
                    <div className="relative w-20 h-20 flex items-center justify-center border-4 border-[#2A2A30] border-t-[#00FF95] border-r-[#00FF95] rounded-lg rotate-45 transition-all group-hover:shadow-[0_0_15px_rgba(0,255,149,0.2)]">
                        <div className="absolute flex flex-col items-center -rotate-45">
                            <span className="text-xl font-black text-white">850</span>
                            <span className="text-[8px] font-bold text-[#00FF95] uppercase tracking-wide">Excelente</span>
                        </div>
                    </div>
                 </div>

                 {/* Bar Chart Visualization - Flatter */}
                 <div className="w-full h-12 relative flex items-end justify-between px-2 gap-1 mt-2">
                    <div className="w-full bg-[#00FF95]/20 hover:bg-[#00FF95] h-[20%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95]/30 hover:bg-[#00FF95] h-[35%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95]/40 hover:bg-[#00FF95] h-[45%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95]/50 hover:bg-[#00FF95] h-[60%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95]/70 hover:bg-[#00FF95] h-[55%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95]/80 hover:bg-[#00FF95] h-[75%] rounded-sm transition-all duration-300"></div>
                    <div className="w-full bg-[#00FF95] h-[90%] rounded-sm shadow-[0_0_10px_rgba(0,255,149,0.5)]"></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* --- INVESTMENTS TAB --- */}
        {activeTab === 'investments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300 h-full overflow-hidden">
             {/* Left Column: Chart & Asset List */}
             <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
               {/* Enhanced Dynamic Chart */}
               <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-lg p-6 relative overflow-hidden shrink-0">
                 <div className="flex justify-between items-center mb-6 relative z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide"><span className="w-1 h-5 bg-[#bf5af2]"></span> PORTFOLIO PERFORMANCE</h2>
                        <p className="text-xs text-[#8A8A8A] mt-1 pl-3">Valor Total: <span className="text-white font-mono font-bold">R$ 178.000,00</span> <span className="text-[#00FF95] ml-2 font-bold">+12.5%</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsInvestModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#bf5af2] hover:bg-[#bf5af2]/90 text-white text-[10px] font-bold uppercase rounded transition-colors shadow-lg shadow-[#bf5af2]/20"><span className="material-symbols-outlined text-sm">add</span> Novo Ativo</button>
                    </div>
                 </div>
                 <div className="relative h-48 w-full bg-[#151515] rounded border border-[#2A2A2A] overflow-hidden group">
                     {/* Detailed Gradient Area Chart */}
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                        <defs>
                            <linearGradient id="investGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#bf5af2" stopOpacity="0.4" /><stop offset="100%" stopColor="#bf5af2" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5" fill="none" stroke="#bf5af2" strokeWidth="0.5" className="group-hover:stroke-width-1 transition-all" />
                        <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5 V50 H0 Z" fill="url(#investGradient)" className="opacity-50 group-hover:opacity-70 transition-opacity" />
                        
                        {/* Comparison Line (Index) */}
                        <path d="M0,48 Q15,45 30,46 T50,40 T70,38 T90,30 T100,25" fill="none" stroke="#8A8A8A" strokeWidth="0.5" strokeDasharray="2,2" />
                     </svg>
                     <div className="absolute top-2 right-2 flex gap-2 text-[9px] font-bold text-[#8A8A8A] uppercase">
                        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#bf5af2]"></span> Portfolio</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#8A8A8A] border-t border-dashed"></span> CDI</span>
                     </div>
                 </div>
               </div>

               {/* Asset List with Pop-up Trigger */}
               <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-lg p-6 flex-1 min-h-0 flex flex-col">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 shrink-0"><span className="material-symbols-outlined text-[#bf5af2]">list</span> Seus Ativos</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                    {assetAllocation.map((asset, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setSelectedInvestment(asset)}
                            className="bg-[#121212] p-4 rounded border border-[#2A2A2A] flex items-center justify-between hover:bg-[#252525] hover:border-[#bf5af2]/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center ${asset.color.replace('bg-', 'text-')}`}>
                                    <span className="material-symbols-outlined">{asset.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white group-hover:text-[#bf5af2] transition-colors">{asset.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-[#8A8A8A] uppercase font-bold tracking-wider">Risco: {asset.risk}</span>
                                        <span className={`text-[9px] font-mono font-bold ${asset.returns.includes('+') ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{asset.returns}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-white">R$ {asset.value.toLocaleString()}</p>
                                <div className="w-24 h-1.5 bg-[#2A2A2A] rounded-full mt-2 overflow-hidden ml-auto">
                                    <div className={`${asset.color} h-full rounded-full`} style={{width: `${asset.percent}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
               </div>
             </div>

             {/* Right Column: Analyst & Allocation */}
             <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                {/* AI Investment Analyst */}
                <div className="bg-gradient-to-b from-[#1C1C1C] to-[#121212] rounded border border-[#bf5af2]/30 shadow-lg p-5 shrink-0 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-6xl text-[#bf5af2]">psychology</span></div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded bg-[#bf5af2]/10 flex items-center justify-center border border-[#bf5af2]/30">
                            <span className="material-symbols-outlined text-[#bf5af2] text-sm animate-pulse">auto_awesome</span>
                        </div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">IA Analyst Insight</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-[#bf5af2]/5 border border-[#bf5af2]/10 rounded">
                            <p className="text-[10px] text-[#E1E1E1] leading-relaxed">
                                <span className="font-bold text-[#bf5af2]">Atenção:</span> A volatilidade em Cripto aumentou <span className="font-mono text-[#FF453A]">15%</span> nas últimas 24h. Considere rebalancear lucros para Renda Fixa (Caixa) para manter a proporção ideal de risco.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-[#2A2A2A] hover:bg-[#333] border border-[#2A2A2A] rounded text-[9px] font-bold text-[#8A8A8A] uppercase transition-colors">Ignorar</button>
                            <button className="flex-1 py-2 bg-[#bf5af2] hover:bg-[#bf5af2]/90 text-white rounded text-[9px] font-bold uppercase transition-colors shadow-lg shadow-[#bf5af2]/10">Rebalancear</button>
                        </div>
                    </div>
                </div>

                {/* Allocation Circle */}
                <div className="bg-[#1C1C1C] rounded border border-[#2A2A2A] shadow-lg p-6 flex-1 min-h-0 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Alocação Atual</h3>
                        <button className="text-[#bf5af2]"><span className="material-symbols-outlined text-sm">more_horiz</span></button>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {/* Simple SVG Donut representation */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2A2A2A" strokeWidth="10" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="35 65" strokeDashoffset="0" /> {/* Stocks 35% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="10" strokeDasharray="25 75" strokeDashoffset="-35" /> {/* BR 25% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="10" strokeDasharray="20 80" strokeDashoffset="-60" /> {/* Crypto 20% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="10" strokeDasharray="15 85" strokeDashoffset="-80" /> {/* FIIs 15% */}
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6b7280" strokeWidth="10" strokeDasharray="5 95" strokeDashoffset="-95" /> {/* Caixa 5% */}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-white">5</span>
                                <span className="text-[9px] font-bold text-[#8A8A8A] uppercase">Classes</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-2 overflow-y-auto custom-scrollbar max-h-[150px]">
                        {assetAllocation.map((asset, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${asset.color}`}></span>
                                    <span className="text-[#E1E1E1] font-bold">{asset.name}</span>
                                </div>
                                <span className="font-mono text-[#8A8A8A]">{asset.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* ... (Crypto Tab - Restored & Optimized for No-Scroll) ... */}
        {activeTab === 'crypto' && (
          <div className="flex flex-col h-full gap-4 p-1 overflow-hidden animate-in fade-in duration-300">
             
             {/* ROW 1: Portfolio Manager (Left) & Side Panel (Right) - Flexible Height */}
             <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. Portfolio Manager (Main - Col 8) */}
                <div className="lg:col-span-8 bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] flex flex-col overflow-hidden shadow-lg relative">
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-[#2A2A2A] shrink-0 bg-[#1C1C1C] z-10">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#FF9F0A]">pie_chart</span> Portfolio Manager</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-mono font-bold text-white tracking-tight">{formatCurrency(totalPortfolioValue)}</p>
                                <div className="flex bg-[#2A2A2A] rounded p-0.5 border border-[#333] scale-75 origin-left">
                                    <button onClick={() => setDisplayCurrency('USD')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${displayCurrency === 'USD' ? 'bg-[#FF9F0A] text-black' : 'text-[#8A8A8A] hover:text-white'}`}>USD</button>
                                    <button onClick={() => setDisplayCurrency('BRL')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${displayCurrency === 'BRL' ? 'bg-[#FF9F0A] text-black' : 'text-[#8A8A8A] hover:text-white'}`}>BRL</button>
                                </div>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-[#FF9F0A] hover:bg-[#FF9F0A]/90 text-black px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-colors shadow-lg shadow-[#FF9F0A]/20"><span className="material-symbols-outlined text-sm">add</span> Ativo</button>
                    </div>
                    {/* Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-[#1C1C1C] z-10 shadow-sm">
                                <tr className="border-b border-[#2A2A2A] text-[9px] text-[#8A8A8A] uppercase tracking-wider">
                                    <th className="py-3 pl-4 font-bold">Ativo</th>
                                    <th className="py-3 text-right font-bold">Preço</th>
                                    <th className="py-3 text-right font-bold">Qtd.</th>
                                    <th className="py-3 text-right font-bold">Total</th>
                                    <th className="py-3 text-right font-bold text-[#E1E1E1]">24h</th>
                                    <th className="py-3 text-right font-bold hidden sm:table-cell">7d</th>
                                    <th className="py-3 pr-4 text-right font-bold hidden md:table-cell">1 Ano</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                    {portfolioAssets.map((asset) => (
                                        <tr key={asset.id} className="border-b border-[#2A2A2A] hover:bg-[#252525] transition-colors group">
                                            <td className="py-3 pl-4"><div className="flex items-center gap-3"><div className="w-1 h-6 rounded-full" style={{backgroundColor: asset.color}}></div><div><div className="flex items-center gap-2"><span className="font-bold text-white text-xs">{asset.name}</span>{asset.type === 'nft' && <span className="text-[7px] bg-[#bf5af2]/20 text-[#bf5af2] px-1 rounded border border-[#bf5af2]/30 font-bold">NFT</span>}</div><span className="text-[9px] text-[#8A8A8A] font-mono">{asset.symbol}</span></div></div></td>
                                            <td className="py-3 text-right font-mono text-[#E1E1E1] text-xs">{formatCurrency(asset.price)}</td>
                                            <td className="py-3 text-right font-mono text-[#8A8A8A] text-xs"><input type="number" value={asset.amount} onChange={(e) => handleAssetAmountChange(asset.id, parseFloat(e.target.value))} className="w-12 bg-transparent border-b border-[#2A2A2A] focus:border-[#FF9F0A] outline-none text-right transition-colors p-0 text-xs"/></td>
                                            <td className="py-3 text-right font-mono font-bold text-white text-xs">{formatCurrency(asset.amount * asset.price)}</td>
                                            <td className={`py-3 text-right font-bold text-xs ${asset.changes.d >= 0 ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{asset.changes.d > 0 ? '+' : ''}{asset.changes.d}%</td>
                                            <td className={`py-3 text-right font-bold text-xs hidden sm:table-cell ${asset.changes.w >= 0 ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{asset.changes.w > 0 ? '+' : ''}{asset.changes.w}%</td>
                                            <td className={`py-3 pr-4 text-right font-bold text-xs hidden md:table-cell ${asset.changes.y >= 0 ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{asset.changes.y > 0 ? '+' : ''}{asset.changes.y}%</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Sidebar (Right - Col 4) */}
                <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
                    {/* Market Summary */}
                    <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] p-4 shrink-0 shadow-lg">
                        <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-sm">analytics</span> Resumo do Mercado</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px]"><span className="text-white font-bold">BTC Dom.</span><span className="text-[#FF9F0A] font-mono font-bold">54.2%</span></div>
                            <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden"><div className="w-[54%] h-full bg-[#FF9F0A]"></div></div>
                            
                            <div className="flex justify-between items-center text-[10px] pt-1"><span className="text-white font-bold">Others Dom.</span><span className="text-[#bf5af2] font-mono font-bold">12.8%</span></div>
                            <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden"><div className="w-[12%] h-full bg-[#bf5af2]"></div></div>

                            <div className="flex justify-between items-center text-[10px] pt-1"><span className="text-white font-bold">USDT Dom.</span><span className="text-[#00FF95] font-mono font-bold">5.1%</span></div>
                            <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden"><div className="w-[5%] h-full bg-[#00FF95]"></div></div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2A2A2A] mt-2">
                                <div className="text-center"><span className="text-[8px] text-[#8A8A8A] uppercase font-bold block">RSI (14D)</span><span className="text-sm font-mono font-bold text-white">42.5</span></div>
                                <div className="text-center"><span className="text-[8px] text-[#8A8A8A] uppercase font-bold block">Fear & Greed</span><span className="text-sm font-mono font-bold text-[#00FF95]">72</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Watchlist (Draggable) */}
                    <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] p-4 flex-1 min-h-0 flex flex-col shadow-lg">
                        <div className="flex justify-between items-center mb-2"><h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-sm">visibility</span> Watchlist</h3></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {watchlistTokens.map((token, index) => (
                                <div key={token.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()} className="flex items-center justify-between p-2 bg-[#121212] rounded border border-[#2A2A2A] hover:border-[#FF9F0A]/50 transition-all cursor-grab active:cursor-grabbing group">
                                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#8A8A8A] text-xs opacity-0 group-hover:opacity-50">drag_indicator</span><span className="text-[10px] font-bold text-white">{token.symbol}</span></div>
                                    <div className="text-right flex items-center gap-2"><span className="text-[9px] text-[#8A8A8A] font-mono">$ {token.price.toLocaleString()}</span><span className={`text-[9px] font-bold ${token.change >= 0 ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{token.change > 0 ? '+' : ''}{token.change}%</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>

             {/* ROW 2: Portfolio Growth Chart (Full Width - Fixed Height) */}
             <div className="h-48 shrink-0 bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] p-0 relative overflow-hidden shadow-lg group">
                <div className="absolute top-3 left-4 z-10"><h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#FF9F0A] rounded-full"></span> Portfolio Growth</h3></div>
                <div className="absolute inset-0 top-0 bottom-0 w-full">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                        <defs>
                            <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.2" /><stop offset="100%" stopColor="#FF9F0A" stopOpacity="0" /></linearGradient>
                        </defs>
                        <path d="M0,150 C100,140 200,160 300,120 C400,80 500,100 600,60 C700,20 800,40 900,10 L1000,30 V200 H0 Z" fill="url(#growthGradient)" />
                        <path d="M0,150 C100,140 200,160 300,120 C400,80 500,100 600,60 C700,20 800,40 900,10 L1000,30" fill="none" stroke="#FF9F0A" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                    </svg>
                </div>
             </div>

             {/* ROW 3: Staking & Converter (Bottom - Fixed Height) */}
             <div className="h-48 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Staking */}
                <div className="bg-[#1C1C1C] rounded-xl border border-[#2A2A2A] p-4 flex flex-col shadow-lg overflow-hidden">
                    <div className="flex justify-between items-center mb-3 shrink-0">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#FF9F0A] text-sm">lock_clock</span> Staking</h3>
                        <div className="flex bg-[#2A2A2A] rounded p-0.5 border border-[#333] scale-75 origin-right">
                            <button onClick={() => setStakingDisplayCurrency('USD')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${stakingDisplayCurrency === 'USD' ? 'bg-[#FF9F0A] text-black' : 'text-[#8A8A8A] hover:text-white'}`}>USD</button>
                            <button onClick={() => setStakingDisplayCurrency('BRL')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded ${stakingDisplayCurrency === 'BRL' ? 'bg-[#FF9F0A] text-black' : 'text-[#8A8A8A] hover:text-white'}`}>BRL</button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {stakingAssets.map((stake) => (
                            <div key={stake.id} className="bg-[#121212] p-3 rounded border border-[#2A2A2A] flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-[#1C1C1C] flex items-center justify-center text-[#FF9F0A] font-bold text-[8px] border border-[#2A2A2A]">{stake.symbol}</div><span className="text-[10px] font-bold text-white">{stake.name}</span></div>
                                    <span className="text-[10px] font-mono text-[#E1E1E1] font-bold">{formatCurrency(stake.amount * stake.price, stakingDisplayCurrency)}</span>
                                </div>
                                <div className="w-full h-1 bg-[#2A2A2A] rounded-full overflow-hidden"><div className="h-full bg-[#FF9F0A]" style={{width: `${(stake.currentDay / stake.totalDays) * 100}%`}}></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Converter (Orange) */}
                <div className="bg-gradient-to-br from-[#1C1C1C] to-[#252525] rounded-xl border border-[#2A2A2A] p-4 flex flex-col justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><span className="material-symbols-outlined text-6xl text-[#FF9F0A]">currency_exchange</span></div>
                    <div className="flex justify-between items-center mb-3"><h3 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#FF9F0A] text-sm">swap_horiz</span> Conversor Rápido</h3></div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="bg-[#121212] rounded p-2 border border-[#2A2A2A] group focus-within:border-[#FF9F0A] transition-colors flex justify-between items-center">
                            <input type="number" value={calcAmount} onChange={(e) => setCalcAmount(parseFloat(e.target.value))} className="bg-transparent border-none p-0 text-white font-mono font-bold text-sm w-20 focus:ring-0 outline-none" />
                            <select value={calcFrom} onChange={(e) => setCalcFrom(e.target.value)} className="bg-[#2A2A2A] border-none text-[9px] font-bold text-white rounded py-0.5 px-2 cursor-pointer focus:ring-0 uppercase">{Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                        <div className="flex justify-center -my-3 relative z-20"><div className="w-6 h-6 rounded-full bg-[#252525] border border-[#2A2A2A] flex items-center justify-center text-[#8A8A8A]"><span className="material-symbols-outlined text-xs">arrow_downward</span></div></div>
                        <div className="bg-[#121212] rounded p-2 border border-[#2A2A2A] group focus-within:border-[#FF9F0A] transition-colors flex justify-between items-center">
                            <span className="text-[#FF9F0A] font-mono font-bold text-sm pl-2">{conversionResult.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span>
                            <select value={calcTo} onChange={(e) => setCalcTo(e.target.value)} className="bg-[#2A2A2A] border-none text-[9px] font-bold text-white rounded py-0.5 px-2 cursor-pointer focus:ring-0 uppercase">{Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}</select>
                        </div>
                    </div>
                </div>
             </div>

          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#181818]">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#00FF95]">add_circle</span> Novo Recebimento</h3>
                 <button onClick={() => setIsIncomeModalOpen(false)} className="text-[#8A8A8A] hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Descrição</label><input type="text" placeholder="Ex: Salário, Freelance..." className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#00FF95] outline-none transition-colors" /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#00FF95] outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Data</label><input type="date" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-[#8A8A8A] focus:border-[#00FF95] outline-none transition-colors" /></div></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Categoria</label><select className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-[#8A8A8A] focus:border-[#00FF95] outline-none transition-colors"><option>Salário</option><option>Freelance</option><option>Investimentos</option><option>Outros</option></select></div>
              </div>
              <div className="p-6 border-t border-[#2A2A2A] bg-[#181818] flex justify-end gap-3"><button onClick={() => setIsIncomeModalOpen(false)} className="px-4 py-2 rounded text-xs font-bold uppercase text-[#8A8A8A] hover:text-white hover:bg-[#2A2A2A] transition-colors">Cancelar</button><button className="px-6 py-2 rounded bg-[#00FF95] text-black text-xs font-bold uppercase hover:bg-[#00CC78] transition-colors shadow-lg shadow-[#00FF95]/20">Confirmar</button></div>
           </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#181818]">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-[#FF453A]">remove_circle</span> Adicionar Custo</h3>
                 <button onClick={() => setIsExpenseModalOpen(false)} className="text-[#8A8A8A] hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-6 space-y-4">
                 <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Descrição</label><input type="text" placeholder="Ex: Aluguel, Mercado..." className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#FF453A] outline-none transition-colors" /></div>
                 <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Valor (R$)</label><input type="number" placeholder="0,00" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#FF453A] outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Data</label><input type="date" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-[#8A8A8A] focus:border-[#FF453A] outline-none transition-colors" /></div></div>
                 <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Categoria</label><select className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-[#8A8A8A] focus:border-[#FF453A] outline-none transition-colors"><option>Moradia</option><option>Alimentação</option><option>Transporte</option><option>Lazer</option><option>Saúde</option></select></div>
              </div>
              <div className="p-6 border-t border-[#2A2A2A] bg-[#181818] flex justify-end gap-3"><button onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 rounded text-xs font-bold uppercase text-[#8A8A8A] hover:text-white hover:bg-[#2A2A2A] transition-colors">Cancelar</button><button className="px-6 py-2 rounded bg-[#FF453A] text-white text-xs font-bold uppercase hover:bg-[#D63A30] transition-colors shadow-lg shadow-[#FF453A]/20">Confirmar</button></div>
           </div>
        </div>
      )}

      {/* Investment Detail Modal */}
      {(isInvestModalOpen || selectedInvestment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-[#2A2A2A] flex justify-between items-center bg-[#181818]">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#bf5af2]">{selectedInvestment ? 'query_stats' : 'add_circle'}</span> 
                    {selectedInvestment ? selectedInvestment.name : 'Novo Ativo'}
                 </h3>
                 <button onClick={() => { setIsInvestModalOpen(false); setSelectedInvestment(null); }} className="text-[#8A8A8A] hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="p-6 space-y-6">
                 {selectedInvestment ? (
                    <>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedInvestment.color.replace('bg-', 'text-')} bg-[#121212] border border-[#2A2A2A]`}>
                                <span className="material-symbols-outlined text-xl">{selectedInvestment.icon}</span>
                            </div>
                            <div>
                                <p className="text-sm text-[#8A8A8A] uppercase font-bold">Valor Atual</p>
                                <p className="text-2xl font-mono font-bold text-white">R$ {selectedInvestment.value.toLocaleString()}</p>
                            </div>
                        </div>
                        {/* Fake Detail Chart */}
                        <div className="h-32 w-full bg-[#121212] rounded border border-[#2A2A2A] relative overflow-hidden">
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                                <path d="M0,40 Q25,10 50,25 T100,5" fill="none" stroke="#bf5af2" strokeWidth="2" />
                                <path d="M0,40 Q25,10 50,25 T100,5 V50 H0 Z" fill="url(#investGradient)" opacity="0.3" />
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-[#121212] rounded border border-[#2A2A2A]">
                                <p className="text-[10px] text-[#8A8A8A] uppercase font-bold">Retorno</p>
                                <p className={`text-sm font-bold ${selectedInvestment.returns.includes('+') ? 'text-[#00FF95]' : 'text-[#FF453A]'}`}>{selectedInvestment.returns}</p>
                            </div>
                            <div className="p-3 bg-[#121212] rounded border border-[#2A2A2A]">
                                <p className="text-[10px] text-[#8A8A8A] uppercase font-bold">Risco</p>
                                <p className="text-sm font-bold text-white">{selectedInvestment.risk}</p>
                            </div>
                        </div>
                    </>
                 ) : (
                    <div className="space-y-4">
                        <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Nome do Ativo</label><input type="text" placeholder="Ex: PETR4, AAPL..." className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#bf5af2] outline-none transition-colors" /></div>
                        <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Quantidade</label><input type="number" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#bf5af2] outline-none transition-colors" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Preço Médio</label><input type="number" className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-white focus:border-[#bf5af2] outline-none transition-colors" /></div></div>
                        <div className="space-y-2"><label className="text-[10px] font-bold text-[#8A8A8A] uppercase">Classe</label><select className="w-full bg-[#121212] border border-[#2A2A2A] rounded p-3 text-sm text-[#8A8A8A] focus:border-[#bf5af2] outline-none transition-colors"><option>Ações BR</option><option>Stocks</option><option>FIIs</option><option>Cripto</option></select></div>
                    </div>
                 )}
              </div>
              <div className="p-6 border-t border-[#2A2A2A] bg-[#181818] flex justify-end gap-3">
                  <button onClick={() => { setIsInvestModalOpen(false); setSelectedInvestment(null); }} className="px-4 py-2 rounded text-xs font-bold uppercase text-[#8A8A8A] hover:text-white hover:bg-[#2A2A2A] transition-colors">Fechar</button>
                  {!selectedInvestment && <button className="px-6 py-2 rounded bg-[#bf5af2] text-white text-xs font-bold uppercase hover:bg-[#a040d0] transition-colors shadow-lg shadow-[#bf5af2]/20">Salvar Ativo</button>}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Finance;