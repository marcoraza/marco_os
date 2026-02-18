import React, { useRef, useState } from 'react';
import { Card, Icon, SectionLabel, showToast } from './ui';
import { useSettings, type AppSettings } from '../hooks/useSettings';

const accentOptions: { id: AppSettings['appearance']['accentColor']; bg: string; glow: string }[] = [
  { id: 'mint',   bg: 'bg-brand-mint',    glow: 'shadow-[0_0_10px_rgba(0,255,149,0.4)]' },
  { id: 'blue',   bg: 'bg-accent-blue',   glow: 'shadow-[0_0_10px_rgba(10,132,255,0.4)]' },
  { id: 'red',    bg: 'bg-accent-red',    glow: 'shadow-[0_0_10px_rgba(255,69,58,0.4)]' },
  { id: 'orange', bg: 'bg-accent-orange', glow: 'shadow-[0_0_10px_rgba(255,159,10,0.4)]' },
  { id: 'purple', bg: 'bg-accent-purple', glow: 'shadow-[0_0_10px_rgba(191,90,242,0.4)]' },
];

const Settings: React.FC = () => {
  const { settings, update, resetAll, exportAll, importBackup } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleImport = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importBackup(file);
      showToast('Backup importado com sucesso', 'success');
    }
    e.target.value = '';
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetAll();
    showToast('Todos os dados foram resetados', 'success');
    setConfirmReset(false);
  };

  const handleExport = () => {
    exportAll();
    showToast('Backup exportado', 'success');
  };

  return (
    <div className="flex-grow flex flex-col bg-bg-base overflow-y-auto relative scroll-smooth h-full">
      <div className="max-w-[800px] w-full mx-auto p-8 space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-panel pb-6">
            <div>
                <h1 className="text-lg font-black uppercase tracking-tight text-text-primary mb-1">CONFIGURAÇÕES</h1>
                <p className="text-xs text-text-secondary font-medium">Gerencie suas preferências globais, integrações e perfil.</p>
            </div>
            <span className="text-[9px] text-text-secondary font-mono">Auto-save ativo</span>
        </div>

        {/* Profile */}
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <SectionLabel icon="person">Perfil</SectionLabel>
                <span className="text-[9px] bg-brand-mint/10 text-brand-mint px-2 py-0.5 rounded-sm border border-brand-mint/20 font-black uppercase tracking-wider">Verificado</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <div className="size-20 rounded-full overflow-hidden border-2 border-border-panel group-hover:border-brand-mint transition-colors">
                        <img alt="Profile" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"/>
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Icon name="edit" className="text-white" />
                    </div>
                </div>
                <div className="flex-grow grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">NOME DE EXIBIÇÃO</label>
                        <input
                          className="w-full bg-bg-base border border-border-panel rounded-md p-2 text-base md:text-sm text-text-primary focus:border-brand-mint focus:outline-none transition-colors"
                          type="text"
                          value={settings.profile.displayName}
                          onChange={e => update('profile', { displayName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">FUNÇÃO</label>
                        <div className="w-full bg-bg-base/50 border border-border-panel rounded-md p-2 text-base md:text-sm text-text-secondary cursor-not-allowed flex justify-between items-center">
                            <span>Fundador</span>
                            <Icon name="lock" size="sm" />
                        </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Email</label>
                        <input
                          className="w-full bg-bg-base border border-border-panel rounded-md p-2 text-base md:text-sm text-text-primary focus:border-brand-mint focus:outline-none transition-colors"
                          type="email"
                          value={settings.profile.email}
                          onChange={e => update('profile', { email: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
            <SectionLabel icon="palette" className="mb-6">APARÊNCIA</SectionLabel>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-text-primary">Modo Escuro</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Sempre ativado para melhor contraste.</p>
                    </div>
                    <label className="switch">
                        <input checked disabled type="checkbox"/>
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="w-full h-[1px] bg-border-panel/50"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-text-primary">ANIMAÇÕES REDUZIDAS</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Desativar transições para maior performance.</p>
                    </div>
                    <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.appearance.reducedMotion}
                          onChange={e => update('appearance', { reducedMotion: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="w-full h-[1px] bg-border-panel/50"></div>
                <div>
                    <p className="text-sm font-bold text-text-primary mb-3">Cor de Destaque (Accent)</p>
                    <div className="flex gap-3">
                        {accentOptions.map(opt => (
                          <div
                            key={opt.id}
                            onClick={() => update('appearance', { accentColor: opt.id })}
                            className={`size-8 rounded-full ${opt.bg} cursor-pointer transition-all ${
                              settings.appearance.accentColor === opt.id
                                ? `border-2 border-white ${opt.glow}`
                                : 'border border-border-panel opacity-50 hover:opacity-100 hover:border-white'
                            }`}
                          />
                        ))}
                    </div>
                </div>
            </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
            <SectionLabel icon="notifications" className="mb-6">NOTIFICAÇÕES</SectionLabel>
            <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                        <Icon name="smartphone" className="text-text-secondary" />
                        <span className="text-sm font-bold text-text-primary">Push Notifications</span>
                    </div>
                    <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.push}
                          onChange={e => update('notifications', { push: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border-panel/50">
                    <div className="flex items-center gap-3">
                        <Icon name="mail" className="text-text-secondary" />
                        <span className="text-sm font-bold text-text-primary">Email Digest</span>
                    </div>
                    <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.emailDigest}
                          onChange={e => update('notifications', { emailDigest: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border-panel/50">
                    <div className="flex items-center gap-3">
                        <Icon name="chat" className="text-text-secondary" />
                        <span className="text-sm font-bold text-text-primary">WhatsApp Alertas</span>
                    </div>
                    <label className="switch">
                        <input
                          type="checkbox"
                          checked={settings.notifications.whatsapp}
                          onChange={e => update('notifications', { whatsapp: e.target.checked })}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>
        </Card>

        {/* Integrations */}
        <Card className="p-6">
            <SectionLabel icon="extension" className="mb-6">INTEGRAÇÕES</SectionLabel>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-bg-base border border-border-panel rounded-md hover:border-text-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-[#4285F4]/10 rounded-md flex items-center justify-center border border-[#4285F4]/20 text-[#4285F4]">
                            <Icon name="calendar_today" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text-primary">Google Calendar</h4>
                            <p className="text-[10px] text-text-secondary">Sincronização bidirecional de eventos.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-mint uppercase tracking-wide">
                            <span className="size-1.5 bg-brand-mint rounded-full"></span> Conectado
                        </span>
                        <button className="text-text-secondary hover:text-text-primary">
                            <Icon name="settings" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-bg-base border border-border-panel rounded-md hover:border-text-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-[#D97757]/10 rounded-md flex items-center justify-center border border-[#D97757]/20 text-[#D97757]">
                            <Icon name="smart_toy" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text-primary">Claude API</h4>
                            <p className="text-[10px] text-text-secondary">Modelo principal de raciocínio.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-mint uppercase tracking-wide">
                            <span className="size-1.5 bg-brand-mint rounded-full"></span> Conectado
                        </span>
                        <button className="text-text-secondary hover:text-text-primary">
                            <Icon name="settings" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-bg-base border border-border-panel rounded-md hover:border-text-secondary/30 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-white/10 rounded-md flex items-center justify-center border border-white/20 text-text-primary">
                            <Icon name="graphic_eq" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text-primary">ElevenLabs</h4>
                            <p className="text-[10px] text-text-secondary">Síntese de voz para agentes.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border-panel rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors">
                            Conectar
                        </button>
                    </div>
                </div>
            </div>
        </Card>

        {/* Users */}
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <SectionLabel icon="group">USUÁRIOS</SectionLabel>
                <button className="text-brand-mint text-[10px] font-black uppercase tracking-wide hover:text-text-primary transition-colors flex items-center gap-1">
                    <Icon name="add" size="sm" />
                    Convidar Usuário
                </button>
            </div>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-border-panel overflow-hidden">
                            <img alt="User" className="w-full h-full object-cover grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP7JXjTU37vKSlINqzka68iHN7f0ORN-zJoJrWycfR_x5JZii_6nZxKtJ_qNuhT6BywYOGEOnjtdOvypS8jjYwoyQzl3Hub2AJAWTaxT9M9YB2RkcP1hHNqP8VrCB7yAfiMeYVbeyJU_Gj9tOvGVpaybTbAGiEygTljwNl0ethjRW6EDzBWgD2rovQefiMUWgi5zwAQ52cJWrZgCFLShhvT0QbsKYz2rNJ0sbYXNByrLZBp9g90wwfq0LoZoE8dVhJvbRr6DokRQ"/>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-primary">{settings.profile.displayName}</p>
                            <p className="text-[9px] text-text-secondary">{settings.profile.email}</p>
                        </div>
                    </div>
                    <select className="bg-bg-base border border-border-panel text-[10px] font-bold text-text-secondary rounded-md p-1 focus:border-brand-mint outline-none uppercase">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple text-xs font-black">
                            JS
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-primary">Jessica Smith</p>
                            <p className="text-[9px] text-text-secondary">jessica@example.com</p>
                        </div>
                    </div>
                    <select className="bg-bg-base border border-border-panel text-[10px] font-bold text-text-secondary rounded-md p-1 focus:border-brand-mint outline-none uppercase">
                        <option>Editor</option>
                        <option>Admin</option>
                        <option>Viewer</option>
                    </select>
                </div>
            </div>
        </Card>

        {/* Spaces */}
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <SectionLabel icon="workspaces">ESPAÇOS</SectionLabel>
                <button className="text-brand-mint text-[10px] font-black uppercase tracking-wide hover:text-text-primary transition-colors flex items-center gap-1">
                    <Icon name="add" size="sm" />
                    Novo Espaço
                </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-base border border-border-panel rounded-md hover:border-text-secondary/40 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="size-3 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(10,132,255,0.4)]"></div>
                        <Icon name="more_vert" size="sm" className="text-text-secondary/50 group-hover:text-text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-text-primary mb-1">Empresa 1</h4>
                    <p className="text-[10px] text-text-secondary mb-3">Espaço principal de operações.</p>
                    <div className="flex -space-x-2">
                        <div className="size-6 rounded-full border border-bg-base bg-surface flex items-center justify-center text-[8px] text-text-primary">MA</div>
                        <div className="size-6 rounded-full border border-bg-base bg-surface flex items-center justify-center text-[8px] text-text-primary">JS</div>
                    </div>
                </div>
                <div className="p-4 bg-bg-base border border-border-panel rounded-md hover:border-text-secondary/40 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="size-3 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(255,159,10,0.4)]"></div>
                        <Icon name="more_vert" size="sm" className="text-text-secondary/50 group-hover:text-text-primary" />
                    </div>
                    <h4 className="text-sm font-bold text-text-primary mb-1">Empresa 2</h4>
                    <p className="text-[10px] text-text-secondary mb-3">Incubadora de projetos.</p>
                    <div className="flex -space-x-2">
                        <div className="size-6 rounded-full border border-bg-base bg-surface flex items-center justify-center text-[8px] text-text-primary">MA</div>
                    </div>
                </div>
            </div>
        </Card>

        {/* System Data */}
        <Card className="p-6">
            <SectionLabel icon="database" className="mb-6">Dados do Sistema</SectionLabel>
            <div className="flex gap-4 mb-8">
                <button
                  onClick={handleExport}
                  className="flex-1 py-3 border border-border-panel rounded-md bg-bg-base hover:bg-bg-base/80 text-text-primary text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                    <Icon name="download" size="md" />
                    Exportar Tudo (JSON)
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 py-3 border border-border-panel rounded-md bg-bg-base hover:bg-bg-base/80 text-text-primary text-[10px] font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                >
                    <Icon name="upload" size="md" />
                    Importar Backup
                </button>
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="border border-accent-red/30 bg-accent-red/5 rounded-md p-4">
                <h4 className="text-xs font-black text-accent-red uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Icon name="warning" size="sm" />
                    Zona de Perigo
                </h4>
                <p className="text-[10px] text-text-secondary mb-4">Esta ação é irreversível. Todos os dados, agentes e configurações serão apagados permanentemente.</p>
                <button
                  onClick={handleReset}
                  className={`px-4 py-2 border rounded-md text-[10px] font-bold uppercase tracking-wide transition-all ${
                    confirmReset
                      ? 'bg-accent-red text-white border-accent-red'
                      : 'bg-accent-red/10 border-accent-red/50 text-accent-red hover:bg-accent-red hover:text-white'
                  }`}
                >
                    {confirmReset ? 'Confirmar Reset — Clique Novamente' : 'Resetar Todos os Dados'}
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
