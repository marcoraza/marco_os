import React from 'react';
import { Icon, Badge, Card } from '../ui';

interface DebtCardData {
  icon: string;
  title: string;
  subtitle: string;
  balance: string;
  progress: number;
  color: string;
  hoverBorder: string;
  iconBg: string;
  iconText: string;
  iconBorder: string;
  simColor: string;
}

const debts: DebtCardData[] = [
  { icon: 'home', title: 'Financiamento Imóvel', subtitle: 'Banco Santander', balance: 'R$ 145.000,00', progress: 45, color: 'bg-accent-blue', hoverBorder: 'hover:border-accent-blue/50', iconBg: 'bg-accent-blue/10', iconText: 'text-accent-blue', iconBorder: 'border-accent-blue/20', simColor: 'text-accent-blue' },
  { icon: 'directions_car', title: 'Jeep Compass', subtitle: 'Financiamento BV', balance: 'R$ 22.500,00', progress: 60, color: 'bg-accent-orange', hoverBorder: 'hover:border-accent-orange/50', iconBg: 'bg-accent-orange/10', iconText: 'text-accent-orange', iconBorder: 'border-accent-orange/20', simColor: 'text-accent-orange' },
  { icon: 'construction', title: 'Empréstimo Reforma', subtitle: 'Banco Itaú', balance: 'R$ 45.000,00', progress: 30, color: 'bg-accent-purple', hoverBorder: 'hover:border-accent-purple/50', iconBg: 'bg-accent-purple/10', iconText: 'text-accent-purple', iconBorder: 'border-accent-purple/20', simColor: 'text-accent-purple' },
  { icon: 'school', title: 'Crédito Universitário', subtitle: 'Fies', balance: 'R$ 12.000,00', progress: 85, color: 'bg-brand-mint', hoverBorder: 'hover:border-brand-mint/50', iconBg: 'bg-brand-mint/10', iconText: 'text-brand-mint', iconBorder: 'border-brand-mint/20', simColor: 'text-brand-mint' },
];

function DebtCard({ debt }: { debt: DebtCardData }) {
  return (
    <Card className={`bg-bg-base p-5 ${debt.hoverBorder} transition-all duration-300 flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-sm ${debt.iconBg} flex items-center justify-center ${debt.iconText} border ${debt.iconBorder}`}><Icon name={debt.icon} /></div>
          <div><h3 className="text-sm font-bold text-text-primary">{debt.title}</h3><p className="text-xs text-text-secondary">{debt.subtitle}</p></div>
        </div>
        <Badge variant="mint">Em Dia</Badge>
      </div>
      <div>
        <div className="mb-3">
          <p className="text-[10px] text-text-secondary mb-1 uppercase tracking-wider font-bold">Saldo Devedor</p>
          <p className="text-2xl font-mono font-bold text-text-primary tracking-tight">{debt.balance}</p>
        </div>
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-border-panel rounded-full overflow-hidden"><div className={`h-full ${debt.color}`} style={{width: `${debt.progress}%`}}></div></div>
          <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary"><span>Progresso: {debt.progress}%</span><span className={debt.simColor}>SIMULAR ANTECIPAÇÃO</span></div>
        </div>
      </div>
    </Card>
  );
}

export default function FinanceDebts() {
  return (
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
            {debts.map((debt, idx) => <DebtCard key={idx} debt={debt} />)}
          </div>
        </Card>
      </div>

      {/* Right Col: Payments + Score */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
        <div className="bg-surface rounded-md p-0 border border-border-panel flex flex-col relative overflow-hidden flex-1 min-h-0">
          <div className="w-full h-2 bg-brand-mint"></div>
          <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center shrink-0">
              <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-mint">PAGAMENTOS DO MÊS</h2>
            </div>

            {/* Monthly Progress Bar */}
            <div className="group cursor-pointer relative shrink-0">
              <div className="flex justify-between text-[10px] font-bold uppercase text-text-secondary mb-2 group-hover:text-text-primary transition-colors">
                <span>Progresso</span>
                <span className="text-brand-mint">65%</span>
              </div>
              <div className="w-full h-3 bg-border-panel rounded-full overflow-hidden border border-border-panel relative shadow-inner">
                <div className="h-full bg-brand-mint w-[65%] rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 w-full h-full bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]" style={{backgroundSize: '20px 20px'}}></div>
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                </div>
              </div>
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
                {[
                  { name: 'Cartão Black', due: 'Vence Amanhã', value: 'R$ 4.250', color: 'bg-accent-orange' },
                  { name: 'Seguro Auto', due: 'Vence em 5 dias', value: 'R$ 390', color: 'bg-accent-orange' },
                  { name: 'Condomínio', due: 'Vence em 8 dias', value: 'R$ 1.200', color: 'bg-brand-mint' },
                  { name: 'Plano de Saúde', due: 'Vence em 10 dias', value: 'R$ 850', color: 'bg-brand-mint' },
                  { name: 'Escola Crianças', due: 'Vence em 12 dias', value: 'R$ 3.200', color: 'bg-brand-mint' },
                  { name: 'Seguro Vida', due: 'Vence em 15 dias', value: 'R$ 180', color: 'bg-brand-mint' },
                  { name: 'IPVA 3ª Parc', due: 'Vence em 20 dias', value: 'R$ 980', color: 'bg-brand-mint' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-header-bg rounded-md border border-border-panel hover:border-accent-orange/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-1 h-8 ${item.color} rounded-full`}></span>
                      <div><p className="text-xs font-bold text-text-primary">{item.name}</p><p className="text-[10px] text-text-secondary">{item.due}</p></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <Card className="p-4 shadow-lg flex flex-col items-center justify-between shrink-0 h-auto gap-4 group">
          <h3 className="text-[10px] font-bold text-text-secondary uppercase tracking-widest w-full text-left">SCORE DE CRÉDITO</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-20 h-20 flex items-center justify-center border-4 border-border-panel border-t-brand-mint border-r-brand-mint rounded-md rotate-45 transition-all group-hover:shadow-[0_0_15px_rgba(0,255,149,0.2)]">
              <div className="absolute flex flex-col items-center -rotate-45">
                <span className="text-xl font-black text-text-primary">850</span>
                <span className="text-[8px] font-bold text-brand-mint uppercase tracking-wide">Excelente</span>
              </div>
            </div>
          </div>
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
  );
}
