import React, { useState } from 'react';
import { Icon, Badge, SectionLabel, TabNav } from './ui';

const Learning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'knowledge' | 'resources'>('curriculum');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const tabs = [
    { id: 'curriculum', label: 'Currículo' },
    { id: 'knowledge', label: 'Conhecimento' }, // Shortened label for mobile fit
    { id: 'resources', label: 'Recursos' }
  ];

  return (
    <div className="flex flex-col h-full bg-bg-base font-sans text-text-primary overflow-hidden">
      {/* Navigation Tabs (Replaces Header) */}
      <div className="bg-bg-base shrink-0">
        <TabNav 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(id) => setActiveTab(id as any)} 
            accentColor="purple" 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Main Column */}
        <div className="flex-1 flex flex-col overflow-y-auto learning-scroll p-4 md:p-8 max-w-5xl mx-auto w-full">
          
          {activeTab === 'curriculum' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* General Progress Card */}
                <div className="bg-surface rounded-md p-4 md:p-6 border border-border-panel mb-6 md:mb-8 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                    <div>
                        <SectionLabel className="mb-1 text-text-secondary">Progresso Geral</SectionLabel>
                        <p className="text-base md:text-lg font-bold text-text-primary">Fase 1: Fundamentos & Ferramentas</p>
                    </div>
                    <span className="text-lg md:text-xl font-bold text-accent-purple">33%</span>
                    </div>
                    <div className="w-full bg-border-panel h-2 rounded-full overflow-hidden">
                    <div className="bg-accent-purple h-full rounded-full" style={{width: '33%'}}></div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-purple"></span> 4 Semanas Concluídas</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-text-secondary"></span> 8 Semanas Restantes</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-0 md:pl-2 pb-10 before:absolute before:inset-y-0 before:left-[15px] before:w-0.5 before:bg-border-panel before:z-0 before:hidden md:before:block">
                    {/* Past Weeks (Collapsed) */}
                    <div className="mb-4 md:mb-6 relative z-10 md:pl-10 group">
                    <div className="hidden md:block absolute left-[9px] top-1 w-3 h-3 rounded-full bg-accent-purple border-2 border-bg-base"></div>
                    <div className="flex items-center justify-between bg-surface/50 p-4 rounded-md border border-border-panel hover:border-text-secondary transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 opacity-50">
                        <Icon name="check_circle" className="text-green-500" />
                        <span className="font-bold text-text-primary text-sm md:text-base">SEMANA 1 — Mentalidade</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-text-secondary uppercase">Concluído</span>
                    </div>
                    </div>
                    <div className="mb-4 md:mb-6 relative z-10 md:pl-10 group">
                    <div className="hidden md:block absolute left-[9px] top-1 w-3 h-3 rounded-full bg-accent-purple border-2 border-bg-base"></div>
                    <div className="flex items-center justify-between bg-surface/50 p-4 rounded-md border border-border-panel hover:border-text-secondary transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 opacity-50">
                        <Icon name="check_circle" className="text-green-500" />
                        <span className="font-bold text-text-primary text-sm md:text-base">SEMANA 2-4 — Lógica</span>
                        </div>
                        <span className="text-[10px] md:text-xs text-text-secondary uppercase">Concluído</span>
                    </div>
                    </div>

                    {/* Active Week (Expanded) */}
                    <div className="mb-6 md:mb-8 relative z-10 md:pl-10">
                    <div className="hidden md:block absolute left-[5px] top-0 w-5 h-5 rounded-full bg-accent-purple shadow-[0_0_15px_rgba(191,90,242,0.8)] border-4 border-bg-base flex items-center justify-center"></div>
                    <div className="bg-surface rounded-md border border-accent-purple/30 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
                        {/* Card Header */}
                        <div className="p-4 md:p-6 border-b border-border-panel relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10">
                            <Icon name="code" className="text-4xl md:text-6xl text-accent-purple transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="bg-accent-purple/20 text-accent-purple text-[10px] md:text-xs font-bold px-3 py-1 rounded-sm border border-accent-purple/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse"></span>
                            EM ANDAMENTO
                            </span>
                            <span className="text-[10px] md:text-xs text-text-secondary font-mono">12 OUT - 19 OUT</span>
                        </div>
                        <h2 className="text-base md:text-lg font-bold text-text-primary mb-2 relative z-10 uppercase tracking-tight">SEMANA 5 — FERRAMENTAS CRIATIVAS</h2>
                        <p className="text-xs md:text-sm text-text-secondary max-w-2xl relative z-10 leading-relaxed">
                            Domine o novo fluxo de desenvolvimento assistido por IA. Foco em utilizar ferramentas generativas para acelerar a prototipagem e a escrita de código limpo.
                        </p>
                        </div>

                        {/* Resources Grid */}
                        <div className="p-4 md:p-6 bg-white/5">
                        <SectionLabel className="mb-4 text-text-secondary">Recursos da Semana</SectionLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            {/* Resource Item */}
                            <a className="group flex items-center gap-4 p-3 rounded-md bg-header-bg hover:bg-surface-hover border border-transparent hover:border-accent-purple/30 transition-all" href="#">
                            <div className="w-10 h-10 rounded-sm bg-black flex items-center justify-center border border-border-panel group-hover:border-accent-purple/50 transition-colors">
                                <img alt="Cursor IDE Logo" className="w-6 h-6 object-contain opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPV6PngJ_7JShE_Mg_vub4VZCgdilvQwLQ0g1tFdYLPaOqHs50rcr-XOa3YXWJJ91lmblaXhnuTqMqEFUax4uYCCbJcqV3v4qZrCKJyazqEs2mM-r-oQyAY0sMx6EC9Tlx9jMmR24DAnpYbq2kremXmswH4VN-RkCXz1w6MbkphrdnPUVq-s6z_SuKJ-HoqBNwakb5Q9tdqidpRiycuL3SvOe5KoddaFsnor2mcTSpEcT18T7J6BxWBVTQiVXUYliH5M1K8i7t_g"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-xs md:text-sm font-bold text-text-primary group-hover:text-accent-purple transition-colors">Cursor IDE</h5>
                                <p className="text-[10px] md:text-xs text-text-secondary">Editor de código AI-first</p>
                            </div>
                            <Icon name="open_in_new" className="text-text-secondary group-hover:text-accent-purple text-xs" />
                            </a>
                            {/* Resource Item */}
                            <a className="group flex items-center gap-4 p-3 rounded-md bg-header-bg hover:bg-surface-hover border border-transparent hover:border-accent-purple/30 transition-all" href="#">
                            <div className="w-10 h-10 rounded-sm bg-indigo-900/30 flex items-center justify-center border border-indigo-900/50 group-hover:border-accent-purple/50 transition-colors">
                                <Icon name="electric_bolt" className="text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <h5 className="text-xs md:text-sm font-bold text-text-primary group-hover:text-accent-purple transition-colors">Bolt.new</h5>
                                <p className="text-[10px] md:text-xs text-text-secondary">Dev Fullstack no browser</p>
                            </div>
                            <Icon name="open_in_new" className="text-text-secondary group-hover:text-accent-purple text-xs" />
                            </a>
                        </div>
                        </div>

                        {/* Weekly Progress */}
                        <div className="p-4 md:p-6 border-t border-border-panel flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] md:text-xs font-bold text-text-secondary uppercase">Progresso</span>
                            <div className="w-24 md:w-32 bg-border-panel h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-3/5 rounded-full"></div>
                            </div>
                        </div>
                        <button className="text-[10px] md:text-xs font-bold text-text-primary hover:text-accent-purple transition-colors flex items-center gap-1 uppercase tracking-wide">
                            Concluir
                            <Icon name="check" className="text-sm" />
                        </button>
                        </div>
                    </div>
                    </div>

                    {/* Future Weeks */}
                    <div className="mb-4 md:mb-6 relative z-10 md:pl-10 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="hidden md:block absolute left-[11px] top-2 w-2 h-2 rounded-full bg-text-secondary border border-bg-base"></div>
                    <div className="p-4 rounded-md border border-dashed border-text-secondary/50 text-text-secondary">
                        <div className="flex items-center justify-between">
                        <span className="font-bold text-xs md:text-sm">SEMANA 6 — Backend / Supabase</span>
                        <Icon name="lock" className="text-xs" />
                        </div>
                    </div>
                    </div>
                    <div className="mb-4 md:mb-6 relative z-10 md:pl-10 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="hidden md:block absolute left-[11px] top-2 w-2 h-2 rounded-full bg-text-secondary border border-bg-base"></div>
                    <div className="p-4 rounded-md border border-dashed border-text-secondary/50 text-text-secondary">
                        <div className="flex items-center justify-between">
                        <span className="font-bold text-xs md:text-sm">SEMANA 7 — APIs e Integrações</span>
                        <Icon name="lock" className="text-xs" />
                        </div>
                    </div>
                    </div>
                    <div className="mb-6 relative z-10 md:pl-10 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="hidden md:block absolute left-[11px] top-2 w-2 h-2 rounded-full bg-text-secondary border border-bg-base"></div>
                    <div className="p-4 rounded-md border border-dashed border-text-secondary/50 text-text-secondary">
                        <div className="flex items-center justify-between">
                        <span className="font-bold text-xs md:text-sm">SEMANA 8-12 — Projeto Final</span>
                        <Icon name="lock" className="text-xs" />
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Controls Toolbar */}
                <div className="bg-surface rounded-md p-4 shadow-sm border border-border-panel flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-40 transition-shadow hover:shadow-md">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="search" className="text-text-secondary text-xl" />
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2 border border-border-panel rounded-md leading-5 bg-header-bg text-text-primary placeholder-text-secondary focus:outline-none focus:placeholder-text-secondary focus:ring-1 focus:ring-accent-purple focus:border-accent-purple text-base md:text-sm transition-colors" placeholder="Buscar anotações..." type="text"/>
                    </div>
                    {/* Filters Group */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Theme Filter Dropdown */}
                        <div className="relative inline-block text-left group">
                            <button className="inline-flex justify-center w-full rounded-md border border-border-panel shadow-sm px-4 py-2 bg-header-bg text-xs md:text-sm font-medium text-text-primary hover:bg-surface-hover focus:outline-none transition-colors" type="button">
                                Filtro: Todos
                                <Icon name="expand_more" className="ml-2 -mr-1 h-5 w-5 text-text-secondary" />
                            </button>
                        </div>
                        {/* Pending Toggle */}
                        <div className="flex items-center gap-2">
                            <label className="flex items-center cursor-pointer relative">
                                <input className="sr-only" type="checkbox" checked={showPendingOnly} onChange={() => setShowPendingOnly(!showPendingOnly)} />
                                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${showPendingOnly ? 'bg-accent-purple' : 'bg-surface-hover'}`}></div>
                                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform ${showPendingOnly ? 'translate-x-5' : 'translate-x-1'}`}></div>
                            </label>
                            <span className="ml-2 text-xs md:text-sm font-medium text-text-secondary">Pendentes</span>
                        </div>
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-4">
                    {/* Card 1: Pending */}
                    <div className="group bg-surface rounded-md p-4 md:p-6 shadow-sm border border-border-panel hover:border-accent-purple/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="purple">IA</Badge>
                                <span className="text-[10px] text-text-secondary">22 Out</span>
                            </div>
                            <Badge variant="orange">PENDENTE</Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4 group-hover:text-accent-purple transition-colors">Estrutura de Prompts para LLMs</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Contexto é rei: sempre inicie definindo a 'persona' da IA para melhor calibração de tom.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Use delimitadores claros (###, """, ---) para separar instruções de dados de entrada.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Chain of Thought: peça para o modelo "pensar passo a passo" antes de responder.</p>
                            </div>
                        </div>
                        <div className="bg-header-bg rounded-md p-3 md:p-4 border border-border-panel flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-accent-purple/10 text-accent-purple">
                                <Icon name="bolt" className="text-sm" />
                            </div>
                            <div>
                                <SectionLabel className="mb-1 text-text-secondary">Item de Ação</SectionLabel>
                                <p className="text-xs md:text-sm font-medium text-text-primary">Testar a técnica de 'Chain of Thought' no próximo relatório de análise de dados.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Reviewed */}
                    <div className="group bg-surface rounded-md p-4 md:p-6 shadow-sm border border-border-panel hover:border-accent-purple/50 transition-all duration-300 hover:shadow-md opacity-80 hover:opacity-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <Badge variant="blue">NEGÓCIOS</Badge>
                                <span className="text-[10px] text-text-secondary">20 Out</span>
                            </div>
                            <Badge variant="mint">REVISADO</Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4 group-hover:text-accent-purple transition-colors">Modelo de Precificação SaaS</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Focar em métricas de retenção (Net Dollar Retention) é mais valioso que aquisição pura.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Tiered Pricing ajuda a segmentar clientes por disposição de pagamento e uso.</p>
                            </div>
                        </div>
                        <div className="bg-header-bg rounded-md p-3 md:p-4 border border-border-panel flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-accent-purple/10 text-accent-purple">
                                <Icon name="bolt" className="text-sm" />
                            </div>
                            <div>
                                <SectionLabel className="mb-1 text-text-secondary">Item de Ação</SectionLabel>
                                <p className="text-xs md:text-sm font-medium text-text-primary line-through opacity-50">Recalcular LTV dos clientes enterprise com novo modelo.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Pending */}
                    <div className="group bg-surface rounded-md p-4 md:p-6 shadow-sm border border-border-panel hover:border-accent-purple/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-pink-900/30 text-pink-300 text-[9px] md:text-xs font-bold px-2.5 py-0.5 rounded-sm border border-pink-800">DESIGN</span>
                                <span className="text-[10px] text-text-secondary">18 Out</span>
                            </div>
                            <Badge variant="orange">PENDENTE</Badge>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-text-primary mb-4 group-hover:text-accent-purple transition-colors">Psicologia das Cores em Dark Mode</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Evite preto puro (#000000); use cinzas escuros para reduzir o cansaço visual.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-accent-purple shrink-0"></div>
                                <p className="text-text-primary text-xs md:text-sm leading-relaxed">Cores saturadas vibram contra fundos escuros; use tons pastéis ou dessaturados.</p>
                            </div>
                        </div>
                        <div className="bg-header-bg rounded-md p-3 md:p-4 border border-border-panel flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-accent-purple/10 text-accent-purple">
                                <Icon name="bolt" className="text-sm" />
                            </div>
                            <div>
                                <SectionLabel className="mb-1 text-text-secondary">Item de Ação</SectionLabel>
                                <p className="text-xs md:text-sm font-medium text-text-primary">Ajustar a paleta de cores do Design System atual para WCAG compliance.</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-bg-base border-l border-border-panel p-6 hidden lg:flex flex-col gap-6 shrink-0 overflow-y-auto learning-scroll">
          {activeTab === 'curriculum' && (
             <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                {/* Statistics Card */}
                <div className="bg-surface rounded-md p-5 border border-border-panel">
                    <div className="flex items-center justify-between mb-4">
                    <SectionLabel className="text-text-secondary">Estatísticas</SectionLabel>
                    <Icon name="bar_chart" className="text-text-secondary text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="bg-header-bg rounded-md p-3 text-center">
                        <span className="block text-lg font-bold text-text-primary mb-1">12</span>
                        <span className="text-[10px] text-text-secondary uppercase">Anotações</span>
                    </div>
                    <div className="bg-header-bg rounded-md p-3 text-center">
                        <span className="block text-lg font-bold text-accent-purple mb-1">5</span>
                        <span className="text-[10px] text-text-secondary uppercase">Semanas</span>
                    </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border-panel">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-secondary">Consistência</span>
                        <span className="text-green-500 font-bold">Alta 🔥</span>
                    </div>
                    <div className="flex gap-1 h-8 items-end">
                        <div className="flex-1 h-[40%] bg-surface-hover rounded-sm"></div>
                        <div className="flex-1 h-[60%] bg-surface-hover rounded-sm"></div>
                        <div className="flex-1 h-[30%] bg-surface-hover rounded-sm"></div>
                        <div className="flex-1 h-[80%] bg-accent-purple/60 rounded-sm"></div>
                        <div className="flex-1 h-[100%] bg-accent-purple rounded-sm"></div>
                        <div className="flex-1 h-[50%] bg-surface-hover rounded-sm"></div>
                        <div className="flex-1 h-[0%] bg-surface-hover rounded-sm"></div>
                    </div>
                    </div>
                </div>

                {/* Reading Queue Card */}
                <div className="bg-surface rounded-md p-5 border border-border-panel flex-1">
                    <div className="flex items-center justify-between mb-6">
                    <SectionLabel className="text-text-secondary">Fila de Leitura</SectionLabel>
                    <button className="text-accent-purple hover:text-text-primary transition-colors">
                        <Icon name="add" className="text-sm" />
                    </button>
                    </div>
                    <div className="flex flex-col gap-5">
                    {/* Book Item */}
                    <div className="flex gap-3">
                        <div className="w-12 h-16 bg-surface-hover rounded-sm overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                        <img alt="Book cover art" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-LLYsozuQl48snyT7QwdD5Ql45EV2EMfJKKiBckQ4NQJIfauJQ9WkVWlIRjH3e_G50s38-tWpOEuqpnNSAdqzie6d9rBVA9g1XZAb4r0geobFXET9k-mpnJDqJIKJf4pqOFRLtmFZ24ljD2ntmWFmX81-rpZ3JeL_gK4TXzBocoBgP_CW4ycfzX8AjFT6wqbxqE2PuRTeaa4KhspC9kaDz_RI494j_zXtKA5do7pK07VZ7Nlht81x8FBOlrJMHfA6lvbL5B8oPA"/>
                        <div className="absolute inset-0 bg-accent-purple/20 hidden group-hover:block"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-primary truncate">Pragmatic Programmer</h4>
                        <p className="text-xs text-text-secondary mb-2">David Thomas</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-border-panel rounded-full overflow-hidden">
                            <div className="w-[45%] h-full bg-blue-500"></div>
                            </div>
                            <span className="text-[10px] text-text-secondary">45%</span>
                        </div>
                        </div>
                    </div>
                    {/* Book Item */}
                    <div className="flex gap-3">
                        <div className="w-12 h-16 bg-surface-hover rounded-sm overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                        <img alt="Book cover art" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxMnAhqrQWK-PyKGBMdQ3n833H8kPP4mvqSrUCA2fxf-SlTLZIWkI2oyZaJ7SZL5-GaayLGYi0ZtkZ44Hzjd5UQAEmRsx6aoroXUmL4X7Jol26RSyUEni_v8YQdfQaxJHqnlFuW2NydsLT4I7NXLA_hoatY3KUJVDgWh5AdquzdG9eYYPkrSKr48F3zH-C6Oo6PsBjT7x1ai6TEoeJxv_ObzwyGRC76iZFMcEl536eC8qqiWI1aYcgEV6C7I6R9MUEyi4NNuMYmg"/>
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-primary truncate">Clean Code</h4>
                        <p className="text-xs text-text-secondary mb-2">Robert C. Martin</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-border-panel rounded-full overflow-hidden">
                            <div className="w-[12%] h-full bg-accent-purple"></div>
                            </div>
                            <span className="text-[10px] text-text-secondary">12%</span>
                        </div>
                        </div>
                    </div>
                    {/* Book Item */}
                    <div className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-16 bg-surface-hover rounded-sm border border-border-panel flex items-center justify-center shrink-0">
                        <Icon name="book" className="text-text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-text-primary truncate">Refactoring UI</h4>
                        <p className="text-xs text-text-secondary">Adam Wathan</p>
                        <span className="text-[10px] text-text-secondary mt-1 uppercase font-bold tracking-wider">Na Fila</span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-gradient-to-br from-accent-purple/20 to-transparent rounded-md p-4 border border-accent-purple/20">
                    <div className="flex gap-3 items-start">
                    <Icon name="lightbulb" className="text-accent-purple text-lg mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-text-primary mb-1">Dica do Dia</h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                        Use `CMD + P` no Cursor para buscar arquivos rapidamente.
                        </p>
                    </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'knowledge' && (
              <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                {/* Weekly Review Card */}
                <div className="bg-gradient-to-b from-surface to-header-bg rounded-md border border-border-panel overflow-hidden relative">
                    {/* Decorative bg pattern */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-accent-purple rounded-full opacity-20 blur-3xl"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-primary tracking-wide">REVISÃO SEMANAL</h2>
                            <Icon name="event_note" className="text-accent-purple" />
                        </div>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-surface-hover border-2 border-border-panel overflow-hidden shrink-0">
                                <img alt="Frank AI Assistant Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzUSaEyIBK7c_NID_WUbZ9obih2J4F_cKzpBbQ5De0b7x9fvQvVDMIglFx2Jdw3OKT-myK5TBlzlwLI-gr_PF1BjhzEanr9UP7cL5w39n0ZUS0E1qOGI1S0Uzom6qGFF_GSkOVGRBOgfok1EEzo29ofe-ge5VO0UuKbNHDI7XG-QxNAjdfneF76v2jlrFGheTUzfxNvbMjgxP8LT8eTtksKTnTHz47EuuYdZ0rbIqSceHWNHrq4jShZSmuikcdb5AsigX0bmpICg"/>
                            </div>
                            <div className="bg-header-bg/80 p-3 rounded-md rounded-tl-none border border-border-panel/50 backdrop-blur-sm">
                                <p className="text-sm text-text-primary italic">"Olá, aqui é o Frank. Você tem <span className="text-accent-purple font-bold">2 anotações pendentes</span> marcadas como importantes essa semana. Revise agora para consolidar o aprendizado."</p>
                            </div>
                        </div>
                        <button className="w-full bg-accent-purple hover:bg-accent-purple/90 text-white font-medium py-3 px-4 rounded-sm transition-all shadow-lg shadow-accent-purple/20 flex items-center justify-center gap-2 group">
                            <span>Iniciar Revisão</span>
                            <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-surface rounded-md p-4 border border-border-panel text-center">
                        <span className="block text-lg font-bold text-text-primary mb-1">12</span>
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Lidos hoje</span>
                    </div>
                    <div className="bg-surface rounded-md p-4 border border-border-panel text-center">
                        <span className="block text-lg font-bold text-emerald-500 mb-1">85%</span>
                        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Retenção</span>
                    </div>
                </div>

                {/* Tags Cloud */}
                <div className="bg-surface rounded-md p-6 border border-border-panel">
                    <SectionLabel className="mb-4 text-text-secondary">Top Tópicos</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                        <a className="px-3 py-1 bg-header-bg hover:bg-surface-hover text-text-primary rounded-sm text-xs font-medium transition-colors border border-border-panel" href="#">#inteligencia-artificial</a>
                        <a className="px-3 py-1 bg-header-bg hover:bg-surface-hover text-text-primary rounded-sm text-xs font-medium transition-colors border border-border-panel" href="#">#produtividade</a>
                        <a className="px-3 py-1 bg-header-bg hover:bg-surface-hover text-text-primary rounded-sm text-xs font-medium transition-colors border border-border-panel" href="#">#saas</a>
                        <a className="px-3 py-1 bg-header-bg hover:bg-surface-hover text-text-primary rounded-sm text-xs font-medium transition-colors border border-border-panel" href="#">#marketing</a>
                        <a className="px-3 py-1 bg-header-bg hover:bg-surface-hover text-text-primary rounded-sm text-xs font-medium transition-colors border border-border-panel" href="#">#ux-design</a>
                    </div>
                </div>
              </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default Learning;