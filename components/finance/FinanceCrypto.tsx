import React, { useState, useEffect, useRef } from 'react';
import { Icon, Card } from '../ui';
import { initialWatchlistTokens, initialPortfolioAssets, stakingAssets, rates } from './data';
import { formatCurrency } from './utils';
import type { CurrencyDisplay } from './types';

export default function FinanceCrypto() {
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyDisplay>('USD');
  const [stakingDisplayCurrency, setStakingDisplayCurrency] = useState<CurrencyDisplay>('USD');

  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcFrom, setCalcFrom] = useState('ETH');
  const [calcTo, setCalcTo] = useState('USD');
  const [conversionResult, setConversionResult] = useState<number>(0);

  const [watchlistTokens, setWatchlistTokens] = useState(initialWatchlistTokens);
  const [portfolioAssets, setPortfolioAssets] = useState(initialPortfolioAssets);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => { dragItem.current = position; };
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => { dragOverItem.current = position; };
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const copyListItems = [...watchlistTokens];
    const dragItemContent = copyListItems[dragItem.current!];
    copyListItems.splice(dragItem.current!, 1);
    copyListItems.splice(dragOverItem.current!, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setWatchlistTokens(copyListItems);
  };

  const handleAssetAmountChange = (id: number, newAmount: number) => {
    setPortfolioAssets(prev => prev.map(a => a.id === id ? { ...a, amount: newAmount } : a));
  };

  const totalPortfolioValue = portfolioAssets.reduce((acc, asset) => acc + (asset.amount * asset.price), 0);

  let cumulativePercent = 0;
  const gradientStops = portfolioAssets.map(asset => {
    const value = asset.amount * asset.price;
    const percent = (value / totalPortfolioValue) * 100;
    const start = cumulativePercent;
    cumulativePercent += percent;
    return `${asset.color} ${start}% ${cumulativePercent}%`;
  }).join(', ');

  return (
    <div className="flex flex-col h-full gap-4 p-1 overflow-hidden animate-in fade-in duration-300">

      {/* ROW 1: Portfolio Manager + Side Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Portfolio Manager */}
        <div className="lg:col-span-8 bg-surface rounded-md border border-border-panel flex flex-col overflow-hidden shadow-lg relative">
          <div className="flex justify-between items-center p-4 border-b border-border-panel shrink-0 bg-surface z-10">
            <div>
              <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="pie_chart" className="text-accent-orange" size="sm" /> Portfolio Manager</h3>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">{formatCurrency(totalPortfolioValue, displayCurrency)}</p>
                <div className="flex bg-border-panel rounded-sm p-0.5 border border-border-panel scale-75 origin-left">
                  <button onClick={() => setDisplayCurrency('USD')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${displayCurrency === 'USD' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>USD</button>
                  <button onClick={() => setDisplayCurrency('BRL')} className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm ${displayCurrency === 'BRL' ? 'bg-accent-orange text-black' : 'text-text-secondary hover:text-text-primary'}`}>BRL</button>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-accent-orange hover:bg-accent-orange/90 text-black px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase transition-colors shadow-lg shadow-accent-orange/20"><Icon name="add" size="sm" /> Ativo</button>
          </div>
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
                    <td className="py-3 text-right font-mono text-text-primary text-xs">{formatCurrency(asset.price, displayCurrency)}</td>
                    <td className="py-3 text-right font-mono text-text-secondary text-xs"><input type="number" value={asset.amount} onChange={(e) => handleAssetAmountChange(asset.id, parseFloat(e.target.value))} className="w-12 bg-transparent border-b border-border-panel focus:border-accent-orange outline-none text-right transition-colors p-0 text-xs"/></td>
                    <td className="py-3 text-right font-mono font-bold text-text-primary text-xs">{formatCurrency(asset.amount * asset.price, displayCurrency)}</td>
                    <td className={`py-3 text-right font-bold text-xs ${asset.changes.d >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.d > 0 ? '+' : ''}{asset.changes.d}%</td>
                    <td className={`py-3 text-right font-bold text-xs hidden sm:table-cell ${asset.changes.w >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.w > 0 ? '+' : ''}{asset.changes.w}%</td>
                    <td className={`py-3 pr-4 text-right font-bold text-xs hidden md:table-cell ${asset.changes.y >= 0 ? 'text-brand-mint' : 'text-accent-red'}`}>{asset.changes.y > 0 ? '+' : ''}{asset.changes.y}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
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

      {/* ROW 2: Portfolio Growth Chart */}
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

      {/* ROW 3: Staking & Converter */}
      <div className="h-48 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Staking */}
        <Card className="p-4 flex flex-col shadow-lg overflow-hidden">
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2"><Icon name="lock_clock" className="text-accent-orange" size="sm" /> Staking</h3>
            <div className="flex bg-border-panel rounded-sm p-0.5 border border-border-panel scale-75 origin-right">
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

        {/* Converter */}
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
  );
}
