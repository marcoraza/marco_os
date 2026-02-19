import React from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Icon, Card, SectionLabel } from '../ui';
import { detailedTransactions, pieData, PIE_COLORS, cashflowData } from './data';
import { formatBRL } from './utils';

const pieTotal = pieData.reduce((acc, d) => acc + d.value, 0);

export default function FinanceOverview() {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 h-full overflow-hidden">

      {/* ROW 1: Metrics + Revenue Goal */}
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
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i]} />))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-panel)', borderRadius: 4, fontSize: 10 }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
              />
              <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" fill="var(--color-text-primary)" style={{ fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
                R$ {pieTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="central" fill="var(--color-text-secondary)" style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
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
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-panel)', borderRadius: 4, fontSize: 10 }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
              />
              <Area type="monotone" dataKey="income" stroke="#00FF95" strokeWidth={2} fill="url(#rcIncomeGrad)" name="Receita" />
              <Area type="monotone" dataKey="expenses" stroke="#FF453A" strokeWidth={2} fill="url(#rcExpenseGrad)" name="Despesas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2: Chart + Feed */}
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
            <div className="relative w-full flex-grow rounded-md border border-border-panel overflow-hidden bg-bg-base" style={{ backgroundImage: 'linear-gradient(to right, var(--color-border-panel) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-panel) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
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

      {/* ROW 3: Categories + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-8 flex flex-col h-full min-h-0">
          <Card className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-2 shrink-0">
              <h2 className="text-[9px] font-black text-text-secondary flex items-center gap-2 uppercase tracking-[0.1em]"><span className="w-1 h-3 bg-text-secondary"></span> GASTOS POR CATEGORIA</h2>
            </div>
            <div className="flex-grow flex flex-col justify-center space-y-2">
              {[
                { icon: 'home', label: 'Moradia', value: 'R$ 4.500', percent: 40, color: 'text-accent-purple', barColor: 'bg-accent-purple' },
                { icon: 'restaurant', label: 'ALIMENTAÇÃO', value: 'R$ 2.800', percent: 25, color: 'text-accent-orange', barColor: 'bg-accent-orange' },
                { icon: 'commute', label: 'Transporte', value: 'R$ 1.680', percent: 15, color: 'text-accent-blue', barColor: 'bg-accent-blue' },
              ].map((cat, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-1">
                    <div className="flex items-center gap-2"><div className={`p-1 rounded-sm bg-surface-hover ${cat.color} border border-border-panel`}><Icon name={cat.icon} className="text-[10px]" /></div><span className="text-[10px] font-semibold text-text-secondary">{cat.label}</span></div>
                    <div className="text-right"><span className="block text-[10px] font-bold font-mono text-text-primary">{cat.value}</span></div>
                  </div>
                  <div className="w-full bg-header-bg border border-border-panel rounded-sm h-1.5"><div className={`${cat.barColor} h-full rounded-sm relative`} style={{width: `${cat.percent}%`}}></div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col h-full min-h-0">
          <Card className="flex flex-col h-full overflow-hidden">
            <div className="p-3 border-b border-border-panel flex justify-between items-center bg-surface-hover shrink-0">
              <SectionLabel className="tracking-[0.1em]">PRÓXIMOS PAGAMENTOS</SectionLabel>
            </div>
            <div className="p-3 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
              {[
                { month: 'OUT', day: '10', name: 'Aluguel', type: 'Recorrente', value: 'R$ 2.500' },
                { month: 'OUT', day: '12', name: 'AWS', type: 'Infra', value: 'R$ 350' },
                { month: 'OUT', day: '15', name: 'Seguro', type: 'Anual', value: 'R$ 390' },
              ].map((payment, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <div className="w-full h-px bg-border-panel"></div>}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center justify-center w-7 h-7 bg-border-panel rounded-sm border border-border-panel text-text-secondary"><span className="text-[7px] font-bold uppercase">{payment.month}</span><span className="text-[10px] font-bold text-text-primary">{payment.day}</span></div>
                      <div><p className="text-[10px] font-bold text-text-primary group-hover:text-accent-red transition-colors">{payment.name}</p><p className="text-[9px] text-text-secondary">{payment.type}</p></div>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-text-primary">{payment.value}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
}
