import React from 'react';
import { Icon, Card } from '../ui';
import { assetAllocation } from './data';
import type { AssetAllocation } from './types';

interface FinanceInvestmentsProps {
  onOpenInvestModal: () => void;
  onSelectInvestment: (asset: AssetAllocation) => void;
}

export default function FinanceInvestments({ onOpenInvestModal, onSelectInvestment }: FinanceInvestmentsProps) {
  return (
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
              <button onClick={onOpenInvestModal} className="flex items-center gap-2 px-3 py-1.5 bg-accent-purple hover:bg-accent-purple/90 text-white text-[10px] font-bold uppercase rounded-sm transition-colors shadow-lg shadow-accent-purple/20"><Icon name="add" size="sm" /> Novo Ativo</button>
            </div>
          </div>
          <div className="relative h-48 w-full bg-bg-base rounded-md border border-border-panel overflow-hidden group">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
              <defs>
                <linearGradient id="investGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#bf5af2" stopOpacity="0.4" /><stop offset="100%" stopColor="#bf5af2" stopOpacity="0" /></linearGradient>
              </defs>
              <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5" fill="none" className="stroke-accent-purple group-hover:stroke-width-1 transition-all" strokeWidth="0.5" />
              <path d="M0,45 Q10,42 20,44 T40,35 T60,28 T80,15 T100,5 V50 H0 Z" fill="url(#investGradient)" className="opacity-50 group-hover:opacity-70 transition-opacity" />
              <path d="M0,48 Q15,45 30,46 T50,40 T70,38 T90,30 T100,25" fill="none" stroke="var(--color-text-secondary)" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
            <div className="absolute top-2 right-2 flex gap-2 text-[9px] font-bold text-text-secondary uppercase">
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-purple"></span> Portfolio</span>
              <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-text-secondary border-t border-dashed"></span> CDI</span>
            </div>
          </div>
        </Card>

        {/* Asset List */}
        <Card className="shadow-lg p-6 flex-1 min-h-0 flex flex-col">
          <h3 className="text-[9px] font-black text-text-secondary uppercase tracking-[0.1em] flex items-center gap-2 mb-4 shrink-0"><Icon name="list" className="text-accent-purple" /> Seus Ativos</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
            {assetAllocation.map((asset, idx) => (
              <div
                key={idx}
                onClick={() => onSelectInvestment(asset)}
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
              <button className="flex-1 py-2 bg-border-panel hover:bg-border-panel border border-border-panel rounded-sm text-[9px] font-bold text-text-secondary uppercase transition-colors">Ignorar</button>
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
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-border-panel)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="10" strokeDasharray="35 65" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="10" strokeDasharray="25 75" strokeDashoffset="-35" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#a855f7" strokeWidth="10" strokeDasharray="20 80" strokeDashoffset="-60" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="10" strokeDasharray="15 85" strokeDashoffset="-80" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#6b7280" strokeWidth="10" strokeDasharray="5 95" strokeDashoffset="-95" />
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
  );
}
