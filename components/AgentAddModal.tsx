import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge, Card, Icon, SectionLabel } from './ui';
import type { Agent, AgentRole } from '../types/agents';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (agent: Agent) => void;
};

export default function AgentAddModal({ open, onClose, onCreate }: Props) {
  const [step, setStep] = useState<'choose' | 'integrate' | 'create'>('choose');

  const [form, setForm] = useState({
    name: '',
    role: 'sub-agent' as AgentRole,
    domain: '',
    handle: '',
    instructions: '',
    model: 'Opus',
    apiKey: '',
    tools: {
      gmail: false,
      calendar: false,
      github: false,
      clawDeck: false,
    },
  });

  const modelOptions = useMemo(() => ['Opus', 'Sonnet', 'GPT-5.2', 'Gemini', 'Claude'], []);

  const reset = () => {
    setStep('choose');
    setForm({
      name: '',
      role: 'sub-agent',
      domain: '',
      handle: '',
      instructions: '',
      model: 'Opus',
      apiKey: '',
      tools: { gmail: false, calendar: false, github: false, clawDeck: false },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative w-full md:max-w-2xl bg-surface rounded-t-xl md:rounded-xl border-t md:border border-border-panel shadow-2xl overflow-hidden max-h-[90vh] md:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 md:px-6 md:py-5 border-b border-border-panel shrink-0">
          <h2 className="text-base md:text-lg font-black tracking-tight text-text-primary flex items-center gap-2">
            <Icon name="person_add" className="text-brand-mint" />
            ADICIONAR AGENTE
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-full hover:bg-border-panel"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
          {step === 'choose' && (
            <div className="space-y-3">
              <Card className="p-3">
                <SectionLabel icon="groups">OPÇÕES</SectionLabel>
                <p className="mt-2 text-[10px] text-text-secondary font-bold">
                  Selecione como deseja adicionar um agente ao seu Centro de Agentes.
                </p>
              </Card>

              <button
                onClick={() => setStep('integrate')}
                className="w-full text-left p-4 rounded-md border border-border-panel bg-bg-base/40 hover:bg-surface-hover transition-colors"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center shrink-0">
                    <Icon name="link" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-text-primary">Integrar agente</p>
                    <p className="text-[10px] text-text-secondary font-bold mt-1">
                      Em breve: conectar agentes existentes e integrações.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('create')}
                className="w-full text-left p-4 rounded-md border border-brand-mint/30 bg-brand-mint/5 hover:bg-brand-mint/10 transition-colors"
                type="button"
              >
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-brand-mint/10 border border-brand-mint/20 text-brand-mint flex items-center justify-center shrink-0">
                    <Icon name="add_circle" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-text-primary">Criar agente do zero</p>
                    <p className="text-[10px] text-text-secondary font-bold mt-1">
                      Defina nome, role, modelo, API key e integrações (mock local).
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'integrate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-md border border-border-card bg-bg-base/40">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-accent-blue flex items-center justify-center shrink-0">
                    <Icon name="construction" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-text-primary">Integrar agente</p>
                    <p className="text-[10px] text-text-secondary font-bold mt-1">Placeholder por enquanto.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('choose')}
                className="px-3 py-2 rounded-md border border-border-panel bg-surface hover:bg-surface-hover transition-colors text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary flex items-center gap-2"
                type="button"
              >
                <Icon name="arrow_back" size="sm" /> Voltar
              </button>
            </div>
          )}

          {step === 'create' && (
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();

                const toolTags = [
                  form.tools.gmail ? 'gmail' : null,
                  form.tools.calendar ? 'calendar' : null,
                  form.tools.github ? 'github' : null,
                  form.tools.clawDeck ? 'clawdeck' : null,
                ].filter(Boolean) as string[];

                const newAgent: Agent = {
                  id: `${form.name || 'agent'}-${Date.now()}`,
                  name: form.name || 'Novo agente',
                  role: form.role,
                  model: form.model,
                  owner: 'Frank',
                  status: 'online',
                  lastHeartbeat: 'agora',
                  uptime: '0m',
                  tags: toolTags.length ? toolTags : ['custom'],
                  domain: form.domain ? form.domain.toUpperCase() : undefined,
                  handle: form.handle || undefined,
                  avatarIcon: form.role === 'integration' ? 'link' : form.role === 'coordinator' ? 'shield' : 'psychology',
                };

                onCreate(newAgent);
                reset();
                onClose();
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Criar agente do zero</p>
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                >
                  Voltar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Nome</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))}
                    type="text"
                    placeholder="Ex: Agente E5"
                    className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Role</label>
                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={(e) => setForm(s => ({ ...s, role: e.target.value as AgentRole }))}
                      className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary appearance-none focus:outline-none focus:border-brand-mint cursor-pointer"
                    >
                      <option value="coordinator">Coordinator</option>
                      <option value="sub-agent">Sub-agent</option>
                      <option value="integration">Integration</option>
                    </select>
                    <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">DOMÍNIO</label>
                  <input
                    value={form.domain}
                    onChange={(e) => setForm(s => ({ ...s, domain: e.target.value }))}
                    type="text"
                    placeholder="Ex: OPERAÇÕES"
                    className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Handle</label>
                  <input
                    value={form.handle}
                    onChange={(e) => setForm(s => ({ ...s, handle: e.target.value }))}
                    type="text"
                    placeholder="Ex: @usuario"
                    className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">INSTRUÇÕES</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm(s => ({ ...s, instructions: e.target.value }))}
                  placeholder="Como o agente deve agir, limites, objetivos..."
                  rows={4}
                  className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary resize-none focus:ring-1 focus:ring-brand-mint"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">Modelo</label>
                  <div className="relative">
                    <select
                      value={form.model}
                      onChange={(e) => setForm(s => ({ ...s, model: e.target.value }))}
                      className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary appearance-none focus:outline-none focus:border-brand-mint cursor-pointer"
                    >
                      {modelOptions.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">API Key</label>
                  <input
                    value={form.apiKey}
                    onChange={(e) => setForm(s => ({ ...s, apiKey: e.target.value }))}
                    type="password"
                    placeholder="••••••••••••••"
                    className="w-full bg-header-bg border border-border-panel rounded-md px-4 py-3 text-base md:text-sm text-text-primary focus:outline-none focus:border-brand-mint transition-colors placeholder-text-secondary focus:ring-1 focus:ring-brand-mint"
                  />
                  <p className="text-[9px] text-text-secondary font-bold">Mock local. Nao persiste e nao envia.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-text-secondary">TOOLS / INTEGRAÇÕES</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { k: 'gmail', label: 'Gmail' },
                      { k: 'calendar', label: 'Calendar' },
                      { k: 'github', label: 'GitHub' },
                      { k: 'clawDeck', label: 'ClawDeck' },
                    ] as const
                  ).map(opt => (
                    <label
                      key={opt.k}
                      className="flex items-center gap-2 p-3 rounded-md border border-border-panel bg-bg-base/40 hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <input
                        checked={form.tools[opt.k]}
                        onChange={(e) => setForm(s => ({ ...s, tools: { ...s.tools, [opt.k]: e.target.checked } }))}
                        type="checkbox"
                        className="accent-brand-mint"
                      />
                      <span className="text-[11px] font-black uppercase tracking-wider text-text-secondary">{opt.label}</span>
                      {form.tools[opt.k] && (
                        <Badge variant="mint" size="xs" className="ml-auto">ON</Badge>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-panel flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-sm text-xs font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-border-panel transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-sm bg-brand-mint text-black text-xs font-bold uppercase hover:bg-brand-mint/80 transition-colors shadow-lg shadow-brand-mint/20"
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="px-4 md:px-6 py-3 border-t border-border-panel bg-header-bg shrink-0">
          <button
            onClick={() => { reset(); onClose(); }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary hover:text-text-primary transition-colors"
            type="button"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
