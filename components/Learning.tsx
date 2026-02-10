import React, { useState } from 'react';

const Learning: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'knowledge' | 'resources'>('curriculum');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#0D0D0F] font-sans text-gray-200 overflow-hidden">
      <style>{`
        /* Custom scrollbar for webkit */
        .learning-scroll::-webkit-scrollbar {
            width: 8px;
        }
        .learning-scroll::-webkit-scrollbar-track {
            background: #0D0D0F; 
        }
        .learning-scroll::-webkit-scrollbar-thumb {
            background: #2a2a2c; 
            border-radius: 4px;
        }
        .learning-scroll::-webkit-scrollbar-thumb:hover {
            background: #bf5af2; 
        }
        .timeline-line::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 15px;
            width: 2px;
            background: #2a2a2c;
            z-index: 0;
        }
        .glass-panel {
            background: rgba(28, 28, 33, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-gray-800 bg-[#1C1C1C] flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#bf5af2] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">grid_view</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide uppercase text-gray-400">Marco OS</h1>
            <h2 className="text-lg font-bold text-white leading-none">Protocolo de Aprendizado</h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#bf5af2] hover:bg-[#bf5af2]/90 text-white rounded-lg font-medium transition-colors text-sm shadow-[0_0_15px_rgba(191,90,242,0.3)]">
            <span className="material-symbols-outlined text-sm">add</span>
            NOVA ANOTAÇÃO
          </button>
          <div className="w-10 h-10 rounded-full bg-[#2a2a2c] overflow-hidden border border-gray-700">
            <img 
              alt="Profile avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8t4xPfF2lwTtrD5ErukJC5QwQMRcK3UvecZq_9sYfzfgBOQ-8X6iDWiUT6VppLVp7NHuWxJrfTBfBmN4_7VneF0SU53DLGJRB15KDGNZmH8Tx59XtLml1Tc_p2vk0g17Tqgw73LfviqMEo5mbo_uNXNd_894PYY9oXSYKe16anznaYsOnGv0goQ_hdySMsC1vDQPp7Wb53svAw03Sxvn6jJHAHDH5ywlgtUsV1oNI_SmFDRZJjvCpIQR-es1XqPO5rLbkOjtdXQ"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Main Column */}
        <div className="flex-1 flex flex-col overflow-y-auto learning-scroll p-6 md:p-8 max-w-5xl mx-auto w-full">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-gray-800 mb-8 shrink-0">
            <button 
                onClick={() => setActiveTab('curriculum')}
                className={`pb-3 border-b-2 font-semibold text-sm tracking-wide transition-colors ${activeTab === 'curriculum' ? 'border-[#bf5af2] text-[#bf5af2]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                CURRÍCULO
            </button>
            <button 
                onClick={() => setActiveTab('knowledge')}
                className={`pb-3 border-b-2 font-semibold text-sm tracking-wide transition-colors ${activeTab === 'knowledge' ? 'border-[#bf5af2] text-[#bf5af2]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                BANCO DE CONHECIMENTO
            </button>
            <button 
                onClick={() => setActiveTab('resources')}
                className={`pb-3 border-b-2 font-semibold text-sm tracking-wide transition-colors ${activeTab === 'resources' ? 'border-[#bf5af2] text-[#bf5af2]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
            >
                RECURSOS
            </button>
          </div>

          {activeTab === 'curriculum' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* General Progress Card */}
                <div className="bg-[#1C1C1C] rounded-xl p-6 border border-gray-800 mb-8 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Progresso Geral</h3>
                        <p className="text-2xl font-bold text-white">Fase 1: Fundamentos & Ferramentas</p>
                    </div>
                    <span className="text-3xl font-bold text-[#bf5af2]">33%</span>
                    </div>
                    <div className="w-full bg-[#2a2a2c] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#bf5af2] h-full rounded-full" style={{width: '33%'}}></div>
                    </div>
                    <div className="mt-4 flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#bf5af2]"></span> 4 Semanas Concluídas</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-600"></span> 8 Semanas Restantes</span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative timeline-line pl-2 pb-10">
                    {/* Past Weeks (Collapsed) */}
                    <div className="mb-6 relative z-10 pl-10 group">
                    <div className="absolute left-[9px] top-1 w-3 h-3 rounded-full bg-[#bf5af2] border-2 border-[#0D0D0F]"></div>
                    <div className="flex items-center justify-between bg-[#1C1C1C]/50 p-4 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 opacity-50">
                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                        <span className="font-bold text-gray-300">SEMANA 1 — Mentalidade & Configuração</span>
                        </div>
                        <span className="text-xs text-gray-500">Concluído</span>
                    </div>
                    </div>
                    <div className="mb-6 relative z-10 pl-10 group">
                    <div className="absolute left-[9px] top-1 w-3 h-3 rounded-full bg-[#bf5af2] border-2 border-[#0D0D0F]"></div>
                    <div className="flex items-center justify-between bg-[#1C1C1C]/50 p-4 rounded-lg border border-gray-800/50 hover:border-gray-700 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4 opacity-50">
                        <span className="material-symbols-outlined text-green-500">check_circle</span>
                        <span className="font-bold text-gray-300">SEMANA 2-4 — Lógica de Programação</span>
                        </div>
                        <span className="text-xs text-gray-500">Concluído</span>
                    </div>
                    </div>

                    {/* Active Week (Expanded) */}
                    <div className="mb-8 relative z-10 pl-10">
                    <div className="absolute left-[5px] top-0 w-5 h-5 rounded-full bg-[#bf5af2] shadow-[0_0_15px_rgba(191,90,242,0.8)] border-4 border-[#0D0D0F] flex items-center justify-center"></div>
                    <div className="bg-[#1C1C1C] rounded-xl border border-[#bf5af2]/30 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
                        {/* Card Header */}
                        <div className="p-6 border-b border-gray-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <span className="material-symbols-outlined text-9xl text-[#bf5af2] transform rotate-12 translate-x-4 -translate-y-4">code</span>
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="bg-[#bf5af2]/20 text-[#bf5af2] text-xs font-bold px-3 py-1 rounded-full border border-[#bf5af2]/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-pulse"></span>
                            EM ANDAMENTO
                            </span>
                            <span className="text-xs text-gray-400 font-mono">12 DE OUT - 19 DE OUT</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">SEMANA 5 — FERRAMENTAS CRIATIVAS</h2>
                        <p className="text-gray-400 max-w-2xl relative z-10">
                            Domine o novo fluxo de desenvolvimento assistido por IA. Foco em utilizar ferramentas generativas para acelerar a prototipagem e a escrita de código limpo.
                        </p>
                        </div>

                        {/* Resources Grid */}
                        <div className="p-6 bg-[#f7f6f8]/5 dark:bg-[#0D0D0F]/30">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-wider">Recursos da Semana</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Resource Item */}
                            <a className="group flex items-center gap-4 p-3 rounded-lg bg-[#2a2a2c]/50 hover:bg-[#2a2a2c] border border-transparent hover:border-[#bf5af2]/30 transition-all" href="#">
                            <div className="w-10 h-10 rounded bg-black flex items-center justify-center border border-gray-800 group-hover:border-[#bf5af2]/50 transition-colors">
                                <img alt="Cursor IDE Logo" className="w-6 h-6 object-contain opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPV6PngJ_7JShE_Mg_vub4VZCgdilvQwLQ0g1tFdYLPaOqHs50rcr-XOa3YXWJJ91lmblaXhnuTqMqEFUax4uYCCbJcqV3v4qZrCKJyazqEs2mM-r-oQyAY0sMx6EC9Tlx9jMmR24DAnpYbq2kremXmswH4VN-RkCXz1w6MbkphrdnPUVq-s6z_SuKJ-HoqBNwakb5Q9tdqidpRiycuL3SvOe5KoddaFsnor2mcTSpEcT18T7J6BxWBVTQiVXUYliH5M1K8i7t_g"/>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-bold text-gray-200 group-hover:text-[#bf5af2] transition-colors">Cursor IDE</h5>
                                <p className="text-xs text-gray-500">Editor de código AI-first</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-600 group-hover:text-[#bf5af2] text-sm">open_in_new</span>
                            </a>
                            {/* Resource Item */}
                            <a className="group flex items-center gap-4 p-3 rounded-lg bg-[#2a2a2c]/50 hover:bg-[#2a2a2c] border border-transparent hover:border-[#bf5af2]/30 transition-all" href="#">
                            <div className="w-10 h-10 rounded bg-indigo-900/30 flex items-center justify-center border border-indigo-900/50 group-hover:border-[#bf5af2]/50 transition-colors">
                                <span className="material-symbols-outlined text-indigo-400">electric_bolt</span>
                            </div>
                            <div className="flex-1">
                                <h5 className="text-sm font-bold text-gray-200 group-hover:text-[#bf5af2] transition-colors">Bolt.new</h5>
                                <p className="text-xs text-gray-500">Desenvolvimento Fullstack no navegador</p>
                            </div>
                            <span className="material-symbols-outlined text-gray-600 group-hover:text-[#bf5af2] text-sm">open_in_new</span>
                            </a>
                        </div>
                        </div>

                        {/* Weekly Progress */}
                        <div className="p-6 border-t border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400">SEU PROGRESSO</span>
                            <div className="w-32 bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-3/5 rounded-full"></div>
                            </div>
                        </div>
                        <button className="text-xs font-bold text-white hover:text-[#bf5af2] transition-colors flex items-center gap-1">
                            MARCAR COMO CONCLUÍDO
                            <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        </div>
                    </div>
                    </div>

                    {/* Future Weeks */}
                    <div className="mb-6 relative z-10 pl-10 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="absolute left-[11px] top-2 w-2 h-2 rounded-full bg-gray-600 border border-[#0D0D0F]"></div>
                    <div className="p-4 rounded-lg border border-dashed border-gray-700 text-gray-500">
                        <div className="flex items-center justify-between">
                        <span className="font-bold">SEMANA 6 — Backend com Supabase</span>
                        <span className="material-symbols-outlined text-sm">lock</span>
                        </div>
                    </div>
                    </div>
                    <div className="mb-6 relative z-10 pl-10 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="absolute left-[11px] top-2 w-2 h-2 rounded-full bg-gray-600 border border-[#0D0D0F]"></div>
                    <div className="p-4 rounded-lg border border-dashed border-gray-700 text-gray-500">
                        <div className="flex items-center justify-between">
                        <span className="font-bold">SEMANA 7 — APIs e Integrações</span>
                        <span className="material-symbols-outlined text-sm">lock</span>
                        </div>
                    </div>
                    </div>
                    <div className="mb-6 relative z-10 pl-10 opacity-40 hover:opacity-100 transition-opacity">
                    <div className="absolute left-[11px] top-2 w-2 h-2 rounded-full bg-gray-600 border border-[#0D0D0F]"></div>
                    <div className="p-4 rounded-lg border border-dashed border-gray-700 text-gray-500">
                        <div className="flex items-center justify-between">
                        <span className="font-bold">SEMANA 8-12 — Projeto Final</span>
                        <span className="material-symbols-outlined text-sm">lock</span>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Controls Toolbar */}
                <div className="bg-[#1C1C1C] rounded-xl p-4 shadow-sm border border-slate-800/60 flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-0 z-40 transition-shadow hover:shadow-md">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-[#27272a] text-slate-100 placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-[#bf5af2] focus:border-[#bf5af2] sm:text-sm transition-colors" placeholder="Buscar anotações..." type="text"/>
                    </div>
                    {/* Filters Group */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Theme Filter Dropdown */}
                        <div className="relative inline-block text-left group">
                            <button className="inline-flex justify-center w-full rounded-lg border border-slate-700 shadow-sm px-4 py-2 bg-[#27272a] text-sm font-medium text-slate-200 hover:bg-slate-700 focus:outline-none transition-colors" type="button">
                                Filtro: Todos
                                <span className="material-symbols-outlined ml-2 -mr-1 h-5 w-5 text-slate-400">expand_more</span>
                            </button>
                        </div>
                        {/* Pending Toggle */}
                        <div className="flex items-center gap-2">
                            <label className="flex items-center cursor-pointer relative">
                                <input className="sr-only" type="checkbox" checked={showPendingOnly} onChange={() => setShowPendingOnly(!showPendingOnly)} />
                                <div className={`w-10 h-6 rounded-full shadow-inner transition-colors ${showPendingOnly ? 'bg-[#bf5af2]' : 'bg-slate-700'}`}></div>
                                <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-1 transition-transform ${showPendingOnly ? 'translate-x-5' : 'translate-x-1'}`}></div>
                            </label>
                            <span className="ml-2 text-sm font-medium text-slate-400">Apenas pendentes</span>
                        </div>
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-4">
                    {/* Card 1: Pending */}
                    <div className="group bg-[#1C1C1C] rounded-xl p-6 shadow-sm border border-slate-800/60 hover:border-[#bf5af2]/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-purple-900/30 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded border border-purple-800">IA</span>
                                <span className="text-xs text-slate-400">22 Out, 2023</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-800">
                                PENDENTE
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#bf5af2] transition-colors">Estrutura de Prompts para LLMs</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Contexto é rei: sempre inicie definindo a 'persona' da IA para melhor calibração de tom.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Use delimitadores claros (###, """, ---) para separar instruções de dados de entrada.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Chain of Thought: peça para o modelo "pensar passo a passo" antes de responder.</p>
                            </div>
                        </div>
                        <div className="bg-[#27272a] rounded-lg p-4 border border-slate-700/50 flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-[#bf5af2]/10 text-[#bf5af2]">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item de Ação</h4>
                                <p className="text-sm font-medium text-slate-200">Testar a técnica de 'Chain of Thought' no próximo relatório de análise de dados.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Reviewed */}
                    <div className="group bg-[#1C1C1C] rounded-xl p-6 shadow-sm border border-slate-800/60 hover:border-[#bf5af2]/50 transition-all duration-300 hover:shadow-md opacity-80 hover:opacity-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-blue-900/30 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-800">NEGÓCIOS</span>
                                <span className="text-xs text-slate-400">20 Out, 2023</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                                REVISADO
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#bf5af2] transition-colors">Modelo de Precificação SaaS</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Focar em métricas de retenção (Net Dollar Retention) é mais valioso que aquisição pura.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Tiered Pricing ajuda a segmentar clientes por disposição de pagamento e uso.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Evitar precificação baseada em usuários para produtos colaborativos; preferir baseada em uso.</p>
                            </div>
                        </div>
                        <div className="bg-[#27272a] rounded-lg p-4 border border-slate-700/50 flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-[#bf5af2]/10 text-[#bf5af2]">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item de Ação</h4>
                                <p className="text-sm font-medium text-slate-200 line-through opacity-50">Recalcular LTV dos clientes enterprise com novo modelo.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Pending */}
                    <div className="group bg-[#1C1C1C] rounded-xl p-6 shadow-sm border border-slate-800/60 hover:border-[#bf5af2]/50 transition-all duration-300 hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-pink-900/30 text-pink-300 text-xs font-bold px-2.5 py-0.5 rounded border border-pink-800">DESIGN</span>
                                <span className="text-xs text-slate-400">18 Out, 2023</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-800">
                                PENDENTE
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#bf5af2] transition-colors">Psicologia das Cores em Dark Mode</h3>
                        <div className="mb-6 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Evite preto puro (#000000); use cinzas escuros para reduzir o cansaço visual.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Cores saturadas vibram contra fundos escuros; use tons pastéis ou dessaturados.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1.5 w-2 h-2 rounded-full bg-[#bf5af2] shrink-0"></div>
                                <p className="text-slate-300 text-sm leading-relaxed">Elevação deve ser representada por tons mais claros de cinza, não apenas sombras.</p>
                            </div>
                        </div>
                        <div className="bg-[#27272a] rounded-lg p-4 border border-slate-700/50 flex items-start gap-3">
                            <div className="p-1.5 rounded-md bg-[#bf5af2]/10 text-[#bf5af2]">
                                <span className="material-symbols-outlined text-sm">bolt</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item de Ação</h4>
                                <p className="text-sm font-medium text-slate-200">Ajustar a paleta de cores do Design System atual para WCAG compliance.</p>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 bg-[#0D0D0F] border-l border-gray-800 p-6 hidden lg:flex flex-col gap-6 shrink-0 overflow-y-auto learning-scroll">
          {activeTab === 'curriculum' && (
             <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                {/* Statistics Card */}
                <div className="bg-[#1C1C1C] rounded-xl p-5 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estatísticas</h3>
                    <span className="material-symbols-outlined text-gray-600 text-sm">bar_chart</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#2a2a2c] rounded-lg p-3 text-center">
                        <span className="block text-2xl font-bold text-white">12</span>
                        <span className="text-[10px] text-gray-400 uppercase">Anotações</span>
                    </div>
                    <div className="bg-[#2a2a2c] rounded-lg p-3 text-center">
                        <span className="block text-2xl font-bold text-[#bf5af2]">5</span>
                        <span className="text-[10px] text-gray-400 uppercase">Semanas</span>
                    </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Consistência</span>
                        <span className="text-green-500 font-bold">Alta 🔥</span>
                    </div>
                    <div className="flex gap-1 h-8 items-end">
                        <div className="flex-1 h-[40%] bg-gray-700 rounded-sm"></div>
                        <div className="flex-1 h-[60%] bg-gray-700 rounded-sm"></div>
                        <div className="flex-1 h-[30%] bg-gray-700 rounded-sm"></div>
                        <div className="flex-1 h-[80%] bg-[#bf5af2]/60 rounded-sm"></div>
                        <div className="flex-1 h-[100%] bg-[#bf5af2] rounded-sm"></div>
                        <div className="flex-1 h-[50%] bg-gray-700 rounded-sm"></div>
                        <div className="flex-1 h-[0%] bg-gray-700 rounded-sm"></div>
                    </div>
                    </div>
                </div>

                {/* Reading Queue Card */}
                <div className="bg-[#1C1C1C] rounded-xl p-5 border border-gray-800 flex-1">
                    <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fila de Leitura</h3>
                    <button className="text-[#bf5af2] hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                    </div>
                    <div className="flex flex-col gap-5">
                    {/* Book Item */}
                    <div className="flex gap-3">
                        <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                        <img alt="Book cover art" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-LLYsozuQl48snyT7QwdD5Ql45EV2EMfJKKiBckQ4NQJIfauJQ9WkVWlIRjH3e_G50s38-tWpOEuqpnNSAdqzie6d9rBVA9g1XZAb4r0geobFXET9k-mpnJDqJIKJf4pqOFRLtmFZ24ljD2ntmWFmX81-rpZ3JeL_gK4TXzBocoBgP_CW4ycfzX8AjFT6wqbxqE2PuRTeaa4KhspC9kaDz_RI494j_zXtKA5do7pK07VZ7Nlht81x8FBOlrJMHfA6lvbL5B8oPA"/>
                        <div className="absolute inset-0 bg-[#bf5af2]/20 hidden group-hover:block"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-200 truncate">Pragmatic Programmer</h4>
                        <p className="text-xs text-gray-500 mb-2">David Thomas</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="w-[45%] h-full bg-blue-500"></div>
                            </div>
                            <span className="text-[10px] text-gray-400">45%</span>
                        </div>
                        </div>
                    </div>
                    {/* Book Item */}
                    <div className="flex gap-3">
                        <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden shrink-0 shadow-lg relative group cursor-pointer">
                        <img alt="Book cover art" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxMnAhqrQWK-PyKGBMdQ3n833H8kPP4mvqSrUCA2fxf-SlTLZIWkI2oyZaJ7SZL5-GaayLGYi0ZtkZ44Hzjd5UQAEmRsx6aoroXUmL4X7Jol26RSyUEni_v8YQdfQaxJHqnlFuW2NydsLT4I7NXLA_hoatY3KUJVDgWh5AdquzdG9eYYPkrSKr48F3zH-C6Oo6PsBjT7x1ai6TEoeJxv_ObzwyGRC76iZFMcEl536eC8qqiWI1aYcgEV6C7I6R9MUEyi4NNuMYmg"/>
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-200 truncate">Clean Code</h4>
                        <p className="text-xs text-gray-500 mb-2">Robert C. Martin</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="w-[12%] h-full bg-[#bf5af2]"></div>
                            </div>
                            <span className="text-[10px] text-gray-400">12%</span>
                        </div>
                        </div>
                    </div>
                    {/* Book Item */}
                    <div className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-gray-600">book</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-300 truncate">Refactoring UI</h4>
                        <p className="text-xs text-gray-500">Adam Wathan</p>
                        <span className="text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-wider">Na Fila</span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Quick Tip */}
                <div className="bg-gradient-to-br from-[#bf5af2]/20 to-transparent rounded-xl p-4 border border-[#bf5af2]/20">
                    <div className="flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[#bf5af2] text-lg mt-0.5">lightbulb</span>
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Dica do Dia</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
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
                <div className="bg-gradient-to-b from-[#1c1c21] to-[#27272a] rounded-xl border border-slate-800 overflow-hidden relative">
                    {/* Decorative bg pattern */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#bf5af2] rounded-full opacity-20 blur-3xl"></div>
                    <div className="p-6 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white tracking-wide">REVISÃO SEMANAL</h2>
                            <span className="material-symbols-outlined text-[#bf5af2]">event_note</span>
                        </div>
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden shrink-0">
                                <img alt="Frank AI Assistant Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzUSaEyIBK7c_NID_WUbZ9obih2J4F_cKzpBbQ5De0b7x9fvQvVDMIglFx2Jdw3OKT-myK5TBlzlwLI-gr_PF1BjhzEanr9UP7cL5w39n0ZUS0E1qOGI1S0Uzom6qGFF_GSkOVGRBOgfok1EEzo29ofe-ge5VO0UuKbNHDI7XG-QxNAjdfneF76v2jlrFGheTUzfxNvbMjgxP8LT8eTtksKTnTHz47EuuYdZ0rbIqSceHWNHrq4jShZSmuikcdb5AsigX0bmpICg"/>
                            </div>
                            <div className="bg-[#27272a]/80 p-3 rounded-lg rounded-tl-none border border-slate-700/50 backdrop-blur-sm">
                                <p className="text-sm text-slate-300 italic">"Olá, aqui é o Frank. Você tem <span className="text-[#bf5af2] font-bold">2 anotações pendentes</span> marcadas como importantes essa semana. Revise agora para consolidar o aprendizado."</p>
                            </div>
                        </div>
                        <button className="w-full bg-[#bf5af2] hover:bg-[#bf5af2]/90 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg shadow-[#bf5af2]/20 flex items-center justify-center gap-2 group">
                            <span>Iniciar Revisão</span>
                            <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1C1C1C] rounded-xl p-4 border border-slate-800/60 text-center">
                        <span className="block text-3xl font-bold text-white mb-1">12</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lidos hoje</span>
                    </div>
                    <div className="bg-[#1C1C1C] rounded-xl p-4 border border-slate-800/60 text-center">
                        <span className="block text-3xl font-bold text-emerald-500 mb-1">85%</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Retenção</span>
                    </div>
                </div>

                {/* Tags Cloud */}
                <div className="bg-[#1C1C1C] rounded-xl p-6 border border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Top Tópicos</h3>
                    <div className="flex flex-wrap gap-2">
                        <a className="px-3 py-1 bg-[#27272a] hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors border border-slate-700" href="#">#inteligencia-artificial</a>
                        <a className="px-3 py-1 bg-[#27272a] hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors border border-slate-700" href="#">#produtividade</a>
                        <a className="px-3 py-1 bg-[#27272a] hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors border border-slate-700" href="#">#saas</a>
                        <a className="px-3 py-1 bg-[#27272a] hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors border border-slate-700" href="#">#marketing</a>
                        <a className="px-3 py-1 bg-[#27272a] hover:bg-slate-700 text-slate-300 rounded-full text-xs font-medium transition-colors border border-slate-700" href="#">#ux-design</a>
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