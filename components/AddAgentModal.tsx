import React, { useState, useRef, useEffect } from 'react';
import { Icon, Badge, StatusDot } from './ui';
import { cn } from '../utils/cn';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SidebarAgent {
  id: string;
  name: string;
  role: 'coordinator' | 'sub-agent' | 'integration';
  status: 'online' | 'busy' | 'idle' | 'offline';
  icon: string;
  description?: string;
  model?: string;
}

interface AddAgentModalProps {
  onClose: () => void;
  onSave: (agent: SidebarAgent) => void;
}

// ─── Templates ──────────────────────────────────────────────────────────────

const AGENT_TEMPLATES = [
  {
    id: 'coordinator',
    name: 'Coordenador',
    role: 'coordinator' as const,
    icon: 'hub',
    description: 'Orquestra outros agentes e distribui tarefas',
    color: 'purple',
    tags: ['orquestração', 'delegação', 'planejamento'],
  },
  {
    id: 'ops',
    name: 'Operações',
    role: 'sub-agent' as const,
    icon: 'engineering',
    description: 'Executa tarefas operacionais e automações',
    color: 'blue',
    tags: ['automação', 'execução', 'devops'],
  },
  {
    id: 'research',
    name: 'Pesquisa',
    role: 'sub-agent' as const,
    icon: 'travel_explore',
    description: 'Coleta dados, analisa informações e gera insights',
    color: 'mint',
    tags: ['análise', 'dados', 'relatórios'],
  },
  {
    id: 'integration',
    name: 'Integração',
    role: 'integration' as const,
    icon: 'cable',
    description: 'Conecta APIs externas, webhooks e serviços',
    color: 'orange',
    tags: ['api', 'webhook', 'sync'],
  },
] as const;

const ROLE_LABELS: Record<string, { label: string; variant: 'purple' | 'blue' | 'orange' }> = {
  coordinator: { label: 'COORDENADOR', variant: 'purple' },
  'sub-agent': { label: 'SUB-AGENTE', variant: 'blue' },
  integration: { label: 'INTEGRAÇÃO', variant: 'orange' },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AddAgentModal({ onClose, onSave }: AddAgentModalProps) {
  const [step, setStep] = useState<'template' | 'configure'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<SidebarAgent['role']>('sub-agent');
  const [icon, setIcon] = useState('smart_toy');
  const [model, setModel] = useState('Claude Sonnet');
  const nameRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus name input when entering configure step
  useEffect(() => {
    if (step === 'configure' && nameRef.current) {
      nameRef.current.focus();
    }
  }, [step]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = AGENT_TEMPLATES.find(t => t.id === templateId);
    if (!tmpl) return;
    setSelectedTemplate(templateId);
    setName('');
    setDescription(tmpl.description);
    setRole(tmpl.role);
    setIcon(tmpl.icon);
    setStep('configure');
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: `agent-${Date.now()}`,
      name: name.trim(),
      role,
      status: 'offline',
      icon,
      description: description.trim() || undefined,
      model: role === 'integration' ? undefined : model,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const canSave = name.trim().length > 0;

  const ICON_OPTIONS = [
    'smart_toy', 'hub', 'engineering', 'travel_explore', 'cable',
    'psychology', 'precision_manufacturing', 'robot_2', 'memory', 'terminal',
    'code', 'analytics', 'cloud_sync', 'shield',
  ];

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg mx-4 bg-header-bg border border-border-panel rounded-lg shadow-2xl shadow-black/40 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border-panel shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step === 'configure' && (
                <button
                  onClick={() => setStep('template')}
                  className="p-1 -ml-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Icon name="arrow_back" size="md" />
                </button>
              )}
              <div>
                <h2 className="text-sm font-black text-text-primary uppercase tracking-wide">
                  {step === 'template' ? 'Novo Agente' : 'Configurar Agente'}
                </h2>
                <p className="text-[9px] text-text-secondary font-semibold uppercase tracking-widest mt-0.5">
                  {step === 'template' ? 'Escolha um template para começar' : 'Defina nome e parâmetros'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-sm transition-all">
              <Icon name="close" size="lg" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-colors',
              step === 'template'
                ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20'
                : 'bg-surface text-text-secondary border-border-panel'
            )}>
              <span className="size-3.5 rounded-full bg-brand-mint text-black flex items-center justify-center text-[8px] font-black">1</span>
              Template
            </div>
            <div className="w-4 h-px bg-border-panel" />
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest border transition-colors',
              step === 'configure'
                ? 'bg-brand-mint/10 text-brand-mint border-brand-mint/20'
                : 'bg-surface text-text-secondary border-border-panel'
            )}>
              <span className={cn(
                'size-3.5 rounded-full flex items-center justify-center text-[8px] font-black',
                step === 'configure' ? 'bg-brand-mint text-black' : 'bg-surface border border-border-panel text-text-secondary'
              )}>2</span>
              Config
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1: Template Selection ──────────────────────────────── */}
          {step === 'template' && (
            <div className="grid grid-cols-2 gap-3">
              {AGENT_TEMPLATES.map(tmpl => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={cn(
                      'group relative text-left p-4 rounded-md border transition-all duration-200',
                      'hover:border-brand-mint/40 hover:bg-surface/80',
                      isSelected
                        ? 'border-brand-mint/50 bg-brand-mint/5'
                        : 'border-border-panel bg-surface/30'
                    )}
                  >
                    <div className={cn(
                      'size-10 rounded-md flex items-center justify-center mb-3 transition-colors',
                      tmpl.color === 'purple' && 'bg-accent-purple/10 text-accent-purple',
                      tmpl.color === 'blue' && 'bg-accent-blue/10 text-accent-blue',
                      tmpl.color === 'mint' && 'bg-brand-mint/10 text-brand-mint',
                      tmpl.color === 'orange' && 'bg-accent-orange/10 text-accent-orange',
                    )}>
                      <Icon name={tmpl.icon} size="lg" />
                    </div>
                    <p className="text-[11px] font-black text-text-primary uppercase tracking-wide">{tmpl.name}</p>
                    <p className="text-[9px] text-text-secondary font-medium mt-1 leading-relaxed">{tmpl.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {tmpl.tags.map(tag => (
                        <span key={tag} className="text-[7px] font-bold uppercase tracking-wider bg-bg-base text-text-secondary px-1.5 py-px rounded-sm border border-border-panel">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Icon
                      name="arrow_forward"
                      size="sm"
                      className="absolute top-3 right-3 text-text-secondary/0 group-hover:text-text-secondary/60 transition-all"
                    />
                  </button>
                );
              })}

              {/* Custom / blank */}
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setName('');
                  setDescription('');
                  setRole('sub-agent');
                  setIcon('smart_toy');
                  setStep('configure');
                }}
                className="col-span-2 p-4 rounded-md border border-dashed border-border-panel hover:border-brand-mint/30 hover:bg-surface/40 transition-all group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-md bg-surface border border-border-panel flex items-center justify-center text-text-secondary group-hover:text-brand-mint group-hover:border-brand-mint/30 transition-colors">
                    <Icon name="add" size="lg" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-text-primary uppercase tracking-wide">Custom</p>
                    <p className="text-[9px] text-text-secondary font-medium mt-0.5">Criar agente do zero com configuração manual</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* ── Step 2: Configure Agent ─────────────────────────────────── */}
          {step === 'configure' && (
            <div className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                  Nome do Agente *
                </label>
                <input
                  ref={nameRef}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && canSave) handleSave(); }}
                  placeholder="Ex: Frank, Aria, Sentinel..."
                  className="w-full bg-bg-base border border-border-panel rounded-md px-4 py-2.5 text-sm text-text-primary font-bold placeholder:text-text-secondary/30 focus:outline-none focus:border-brand-mint/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="O que esse agente faz..."
                  rows={2}
                  className="w-full bg-bg-base border border-border-panel rounded-md px-4 py-2.5 text-xs text-text-primary placeholder:text-text-secondary/30 focus:outline-none focus:border-brand-mint/50 transition-colors resize-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                  Tipo / Role
                </label>
                <div className="flex gap-2">
                  {(['coordinator', 'sub-agent', 'integration'] as const).map(r => {
                    const meta = ROLE_LABELS[r];
                    const isActive = role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-md border text-[9px] font-black uppercase tracking-wide transition-all',
                          isActive
                            ? 'border-brand-mint/40 bg-brand-mint/5 text-brand-mint'
                            : 'border-border-panel bg-surface/30 text-text-secondary hover:text-text-primary hover:border-border-panel/80'
                        )}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                  Ícone
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ICON_OPTIONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={cn(
                        'size-9 rounded-md border flex items-center justify-center transition-all',
                        icon === ic
                          ? 'border-brand-mint/50 bg-brand-mint/10 text-brand-mint'
                          : 'border-border-panel bg-surface/30 text-text-secondary hover:text-text-primary hover:border-border-panel/80'
                      )}
                    >
                      <Icon name={ic} size="md" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              {role !== 'integration' && (
                <div>
                  <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                    Modelo LLM
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Claude Opus', 'Claude Sonnet', 'GPT-4o', 'GPT-5.2', 'OpenClaw', 'Custom'].map(m => (
                      <button
                        key={m}
                        onClick={() => setModel(m)}
                        className={cn(
                          'px-3 py-1.5 rounded-md border text-[9px] font-bold uppercase tracking-wide transition-all',
                          model === m
                            ? 'border-brand-mint/40 bg-brand-mint/5 text-brand-mint'
                            : 'border-border-panel bg-surface/30 text-text-secondary hover:text-text-primary hover:border-border-panel/80'
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div>
                <label className="block text-[9px] font-black text-text-secondary uppercase tracking-widest mb-2">
                  Preview
                </label>
                <div className="p-3 bg-bg-base border border-border-panel rounded-md flex items-center gap-3">
                  <div className={cn(
                    'size-9 rounded-sm flex items-center justify-center shrink-0',
                    role === 'coordinator' ? 'bg-accent-purple/10 text-accent-purple' :
                    role === 'integration' ? 'bg-accent-orange/10 text-accent-orange' :
                    'bg-accent-blue/10 text-accent-blue'
                  )}>
                    <Icon name={icon} size="lg" />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-text-primary truncate">
                        {name || 'Nome do Agente'}
                      </p>
                      <Badge variant={ROLE_LABELS[role].variant} size="xs">
                        {ROLE_LABELS[role].label}
                      </Badge>
                      {role !== 'integration' && (
                        <Badge variant="neutral" size="xs">{model}</Badge>
                      )}
                    </div>
                    {description && (
                      <p className="text-[8px] text-text-secondary font-semibold uppercase tracking-tight mt-0.5 truncate">
                        {description}
                      </p>
                    )}
                  </div>
                  <StatusDot color="red" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="px-6 py-4 border-t border-border-panel flex items-center justify-between shrink-0">
            <button
              onClick={() => setStep('template')}
              className="px-4 py-2 text-[10px] font-black uppercase tracking-wide text-text-secondary hover:text-text-primary transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-md text-[11px] font-extrabold uppercase tracking-tight transition-all',
                canSave
                  ? 'bg-brand-mint text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,255,149,0.2)] hover:scale-105'
                  : 'bg-surface text-text-secondary/40 border border-border-panel cursor-not-allowed'
              )}
            >
              <Icon name="add" className="text-sm" />
              Criar Agente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
