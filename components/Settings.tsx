import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="flex-grow flex flex-col bg-[#0D0D0F] overflow-y-auto relative scroll-smooth h-full">
      <style>{`
        .switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #2A2A2A;
            transition: .4s;
            border-radius: 34px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 2px;
            bottom: 2px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #00FF95;
        }
        input:focus + .slider {
            box-shadow: 0 0 1px #00FF95;
        }
        input:checked + .slider:before {
            transform: translateX(20px);
            background-color: #0D0D0F;
        }
      `}</style>
      
      <div className="max-w-[800px] w-full mx-auto p-8 space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-6">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#E1E1E1] mb-1">Configurações</h1>
                <p className="text-xs text-[#8E8E93] font-medium">Gerencie suas preferências globais, integrações e perfil.</p>
            </div>
            <button className="bg-[#1C1C1C] hover:bg-[#252525] text-[#E1E1E1] px-4 py-2 rounded border border-[#2A2A2A] text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-base">save</span>
                Salvar Alterações
            </button>
        </div>

        {/* Profile */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">person</span>
                    Perfil
                </h3>
                <span className="text-[9px] bg-[#00FF95]/10 text-[#00FF95] px-2 py-0.5 rounded border border-[#00FF95]/20 font-black uppercase tracking-wider">Verificado</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="size-20 rounded-full overflow-hidden border-2 border-[#2A2A2A] group-hover:border-[#00FF95] transition-colors">
                        <img alt="Profile" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"/>
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="material-symbols-outlined text-white">edit</span>
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase">Nome de Exibição</label>
                        <input className="w-full bg-[#0D0D0F] border border-[#2A2A2A] rounded p-2 text-sm text-[#E1E1E1] focus:border-[#00FF95] focus:outline-none transition-colors" type="text" defaultValue="Marco Anderson"/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase">Função</label>
                        <div className="w-full bg-[#0D0D0F]/50 border border-[#2A2A2A] rounded p-2 text-sm text-[#8E8E93] cursor-not-allowed flex justify-between items-center">
                            <span>Fundador</span>
                            <span className="material-symbols-outlined text-sm">lock</span>
                        </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase">Email</label>
                        <input className="w-full bg-[#0D0D0F] border border-[#2A2A2A] rounded p-2 text-sm text-[#E1E1E1] focus:border-[#00FF95] focus:outline-none transition-colors" type="email" defaultValue="marco@marco-os.com"/>
                    </div>
                </div>
            </div>
        </div>

        {/* Appearance */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">palette</span>
                Aparência
            </h3>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-[#E1E1E1]">Modo Escuro</p>
                        <p className="text-[10px] text-[#8E8E93] mt-0.5">Sempre ativado para melhor contraste.</p>
                    </div>
                    <label className="switch">
                        <input defaultChecked type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="w-full h-[1px] bg-[#2A2A2A]/50"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-[#E1E1E1]">Animações Reduzidas</p>
                        <p className="text-[10px] text-[#8E8E93] mt-0.5">Desativar transições para maior performance.</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="w-full h-[1px] bg-[#2A2A2A]/50"></div>
                <div>
                    <p className="text-sm font-bold text-[#E1E1E1] mb-3">Cor de Destaque (Accent)</p>
                    <div className="flex gap-3">
                        <div className="size-8 rounded-full bg-[#00FF95] border-2 border-white cursor-pointer shadow-[0_0_10px_rgba(0,255,149,0.4)]"></div>
                        <div className="size-8 rounded-full bg-[#0A84FF] border border-[#2A2A2A] cursor-pointer hover:border-white transition-colors opacity-50 hover:opacity-100"></div>
                        <div className="size-8 rounded-full bg-[#FF453A] border border-[#2A2A2A] cursor-pointer hover:border-white transition-colors opacity-50 hover:opacity-100"></div>
                        <div className="size-8 rounded-full bg-[#FF9F0A] border border-[#2A2A2A] cursor-pointer hover:border-white transition-colors opacity-50 hover:opacity-100"></div>
                        <div className="size-8 rounded-full bg-[#BF5AF2] border border-[#2A2A2A] cursor-pointer hover:border-white transition-colors opacity-50 hover:opacity-100"></div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Notifications */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">notifications</span>
                Notificações
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8E8E93]">smartphone</span>
                        <span className="text-sm font-bold text-[#E1E1E1]">Push Notifications</span>
                    </div>
                    <label className="switch">
                        <input defaultChecked type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[#2A2A2A]/50">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8E8E93]">mail</span>
                        <span className="text-sm font-bold text-[#E1E1E1]">Email Digest</span>
                    </div>
                    <label className="switch">
                        <input type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-[#2A2A2A]/50">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#8E8E93]">chat</span>
                        <span className="text-sm font-bold text-[#E1E1E1]">WhatsApp Alertas</span>
                    </div>
                    <label className="switch">
                        <input defaultChecked type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </div>

        {/* Integrations */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">extension</span>
                Integrações
            </h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#0D0D0F] border border-[#2A2A2A] rounded hover:border-[#8E8E93]/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-[#4285F4]/10 rounded flex items-center justify-center border border-[#4285F4]/20 text-[#4285F4]">
                            <span className="material-symbols-outlined">calendar_today</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#E1E1E1]">Google Calendar</h4>
                            <p className="text-[10px] text-[#8E8E93]">Sincronização bidirecional de eventos.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00FF95] uppercase tracking-wide">
                            <span className="size-1.5 bg-[#00FF95] rounded-full"></span> Conectado
                        </span>
                        <button className="text-[#8E8E93] hover:text-[#E1E1E1]">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0D0D0F] border border-[#2A2A2A] rounded hover:border-[#8E8E93]/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-[#D97757]/10 rounded flex items-center justify-center border border-[#D97757]/20 text-[#D97757]">
                            <span className="material-symbols-outlined">smart_toy</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#E1E1E1]">Claude API</h4>
                            <p className="text-[10px] text-[#8E8E93]">Modelo principal de raciocínio.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00FF95] uppercase tracking-wide">
                            <span className="size-1.5 bg-[#00FF95] rounded-full"></span> Conectado
                        </span>
                        <button className="text-[#8E8E93] hover:text-[#E1E1E1]">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#0D0D0F] border border-[#2A2A2A] rounded hover:border-[#8E8E93]/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-white/10 rounded flex items-center justify-center border border-white/20 text-white">
                            <span className="material-symbols-outlined">graphic_eq</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#E1E1E1]">ElevenLabs</h4>
                            <p className="text-[10px] text-[#8E8E93]">Síntese de voz para agentes.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#2A2A2A] rounded text-[10px] font-bold uppercase tracking-wide transition-colors">
                            Conectar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Users */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">group</span>
                    Usuários
                </h3>
                <button className="text-[#00FF95] text-[10px] font-black uppercase tracking-wide hover:text-white transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Convidar Usuário
                </button>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#2A2A2A] overflow-hidden">
                            <img alt="User" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"/>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#E1E1E1]">Marco Anderson</p>
                            <p className="text-[9px] text-[#8E8E93]">marco@marco-os.com</p>
                        </div>
                    </div>
                    <select className="bg-[#0D0D0F] border border-[#2A2A2A] text-[10px] font-bold text-[#8E8E93] rounded p-1 focus:border-[#00FF95] outline-none uppercase">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-[#BF5AF2]/20 flex items-center justify-center text-[#BF5AF2] text-xs font-black">
                            JS
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#E1E1E1]">Jessica Smith</p>
                            <p className="text-[9px] text-[#8E8E93]">jessica@example.com</p>
                        </div>
                    </div>
                    <select className="bg-[#0D0D0F] border border-[#2A2A2A] text-[10px] font-bold text-[#8E8E93] rounded p-1 focus:border-[#00FF95] outline-none uppercase">
                        <option>Editor</option>
                        <option>Admin</option>
                        <option>Viewer</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Spaces */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">workspaces</span>
                    Espaços
                </h3>
                <button className="text-[#00FF95] text-[10px] font-black uppercase tracking-wide hover:text-white transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">add</span>
                    Novo Espaço
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0D0D0F] border border-[#2A2A2A] rounded hover:border-[#8E8E93]/40 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="size-3 rounded-full bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,0.4)]"></div>
                        <span className="material-symbols-outlined text-[#8E8E93]/50 group-hover:text-[#E1E1E1] text-sm">more_vert</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#E1E1E1] mb-1">Empresa 1</h4>
                    <p className="text-[10px] text-[#8E8E93] mb-3">Espaço principal de operações.</p>
                    <div className="flex -space-x-2">
                        <div className="size-6 rounded-full border border-[#0D0D0F] bg-[#1C1C1C] flex items-center justify-center text-[8px] text-[#E1E1E1]">MA</div>
                        <div className="size-6 rounded-full border border-[#0D0D0F] bg-[#1C1C1C] flex items-center justify-center text-[8px] text-[#E1E1E1]">JS</div>
                    </div>
                </div>
                <div className="p-4 bg-[#0D0D0F] border border-[#2A2A2A] rounded hover:border-[#8E8E93]/40 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="size-3 rounded-full bg-[#FF9F0A] shadow-[0_0_8px_rgba(255,159,10,0.4)]"></div>
                        <span className="material-symbols-outlined text-[#8E8E93]/50 group-hover:text-[#E1E1E1] text-sm">more_vert</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#E1E1E1] mb-1">Empresa 2</h4>
                    <p className="text-[10px] text-[#8E8E93] mb-3">Incubadora de projetos.</p>
                    <div className="flex -space-x-2">
                        <div className="size-6 rounded-full border border-[#0D0D0F] bg-[#1C1C1C] flex items-center justify-center text-[8px] text-[#E1E1E1]">MA</div>
                    </div>
                </div>
            </div>
        </div>

        {/* System Data */}
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#8E8E93] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">database</span>
                Dados do Sistema
            </h3>
            <div className="flex gap-4 mb-8">
                <button className="flex-1 py-3 border border-[#2A2A2A] rounded bg-[#0D0D0F] hover:bg-[#0D0D0F]/80 text-[#E1E1E1] text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">download</span>
                    Exportar Tudo (JSON)
                </button>
                <button className="flex-1 py-3 border border-[#2A2A2A] rounded bg-[#0D0D0F] hover:bg-[#0D0D0F]/80 text-[#E1E1E1] text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">upload</span>
                    Importar Backup
                </button>
            </div>
            <div className="border border-[#FF453A]/30 bg-[#FF453A]/5 rounded p-4">
                <h4 className="text-xs font-black text-[#FF453A] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Zona de Perigo
                </h4>
                <p className="text-[10px] text-[#8E8E93] mb-4">Esta ação é irreversível. Todos os dados, agentes e configurações serão apagados permanentemente.</p>
                <button className="px-4 py-2 bg-[#FF453A]/10 border border-[#FF453A]/50 text-[#FF453A] hover:bg-[#FF453A] hover:text-white rounded text-[10px] font-bold uppercase tracking-wide transition-all">
                    Resetar Todos os Dados
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;