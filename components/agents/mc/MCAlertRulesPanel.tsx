/**
 * MCAlertRulesPanel — Sprint 2
 *
 * CRUD for alert rules stored in useMissionControlStore.alertRules.
 * Conditions: agent_offline | task_overdue | error_rate | cost_threshold | session_stuck
 * Channels: telegram | email | webhook
 */
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { SectionLabel } from '../../ui/SectionLabel';
import { useMissionControlStore, type MCAlertRule } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const CONDITION_LABELS: Record<MCAlertRule['condition'], string> = {
  agent_offline:   'Agente offline',
  task_overdue:    'Tarefa atrasada',
  error_rate:      'Taxa de erro',
  cost_threshold:  'Limite de custo',
  session_stuck:   'Sessao travada',
};

const CONDITION_ICONS: Record<MCAlertRule['condition'], string> = {
  agent_offline:   'cloud_off',
  task_overdue:    'schedule',
  error_rate:      'error',
  cost_threshold:  'payments',
  session_stuck:   'hourglass_empty',
};

const CHANNEL_LABELS: Record<MCAlertRule['channel'], string> = {
  telegram: 'Telegram',
  email:    'Email',
  webhook:  'Webhook',
};

const CHANNEL_ICONS: Record<MCAlertRule['channel'], string> = {
  telegram: 'send',
  email:    'mail',
  webhook:  'http',
};

const CONDITIONS = Object.keys(CONDITION_LABELS) as MCAlertRule['condition'][];
const CHANNELS = Object.keys(CHANNEL_LABELS) as MCAlertRule['channel'][];

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m atras`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h atras`;
  return `${Math.floor(diff / 86_400_000)}d atras`;
}

// ── Rule card ─────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: MCAlertRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        'bg-surface border border-border-panel rounded-sm p-3 transition-colors',
        rule.enabled && 'border-l-2 border-l-accent-orange',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Left */}
        <div className="flex items-start gap-2 min-w-0">
          <span
            className={cn(
              'material-symbols-outlined text-sm mt-0.5 shrink-0',
              rule.enabled ? 'text-accent-orange' : 'text-text-secondary',
            )}
          >
            {CONDITION_ICONS[rule.condition]}
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-primary truncate">{rule.name}</p>
            <p className="text-[8px] text-text-secondary mt-0.5">
              {CONDITION_LABELS[rule.condition]}
              {rule.threshold != null && (
                <span className="font-mono text-text-primary ml-1">
                  {rule.condition === 'cost_threshold' ? `$${rule.threshold}` : `${rule.threshold}%`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Channel badge */}
          <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-1.5 py-0.5 rounded-sm text-text-secondary">
            <span className="material-symbols-outlined text-[10px]">{CHANNEL_ICONS[rule.channel]}</span>
            {CHANNEL_LABELS[rule.channel]}
          </span>

          {/* Toggle */}
          <button
            onClick={() => onToggle(rule.id)}
            aria-label={rule.enabled ? 'Desativar regra' : 'Ativar regra'}
            className={cn(
              'w-8 h-4 rounded-full border transition-colors relative focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              rule.enabled
                ? 'bg-accent-orange/20 border-accent-orange/50'
                : 'bg-surface border-border-panel',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 w-3 h-3 rounded-full transition-transform',
                rule.enabled
                  ? 'translate-x-4 bg-accent-orange'
                  : 'translate-x-0.5 bg-text-secondary',
              )}
            />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(rule.id)}
            aria-label="Remover regra"
            className="p-1 text-text-secondary hover:text-accent-red transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm"
          >
            <Icon name="delete" size="xs" />
          </button>
        </div>
      </div>

      {/* Last triggered */}
      {rule.lastTriggered && (
        <p className="text-[7px] font-mono text-text-secondary mt-1.5">
          Ultimo disparo: {formatRelative(rule.lastTriggered)}
        </p>
      )}
    </div>
  );
}

// ── New rule form ─────────────────────────────────────────────────────────────

interface NewRuleFormProps {
  onSave: (rule: Omit<MCAlertRule, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function NewRuleForm({ onSave, onCancel }: NewRuleFormProps) {
  const [name, setName] = useState('');
  const [condition, setCondition] = useState<MCAlertRule['condition']>('agent_offline');
  const [threshold, setThreshold] = useState('');
  const [channel, setChannel] = useState<MCAlertRule['channel']>('telegram');

  const hasThreshold = condition === 'error_rate' || condition === 'cost_threshold';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      condition,
      threshold: hasThreshold && threshold ? parseFloat(threshold) : undefined,
      channel,
      enabled: true,
    });
  };

  const fieldClass =
    'bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[10px] text-text-primary focus:outline-none focus:border-brand-mint/50 transition-colors w-full font-sans';

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-brand-mint/20 rounded-sm p-3 space-y-2">
      <SectionLabel>Nova regra</SectionLabel>

      {/* Name */}
      <input
        className={fieldClass}
        placeholder="Nome da regra"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-2">
        {/* Condition */}
        <div className="flex flex-col gap-1">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Condicao</span>
          <select
            className={fieldClass}
            value={condition}
            onChange={(e) => setCondition(e.target.value as MCAlertRule['condition'])}
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-1">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">Canal</span>
          <select
            className={fieldClass}
            value={channel}
            onChange={(e) => setChannel(e.target.value as MCAlertRule['channel'])}
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Threshold (conditional) */}
      {hasThreshold && (
        <div className="flex flex-col gap-1">
          <span className="text-[7px] font-black uppercase tracking-widest text-text-secondary">
            {condition === 'cost_threshold' ? 'Limite ($)' : 'Limite (%)'}
          </span>
          <input
            className={fieldClass}
            type="number"
            placeholder={condition === 'cost_threshold' ? '10.00' : '5'}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            min={0}
            step={condition === 'cost_threshold' ? '0.01' : '1'}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-surface border border-border-panel text-text-secondary rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:text-text-primary transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCAlertRulesPanel() {
  const alertRules = useMissionControlStore((s) => s.alertRules);
  const setAlertRules = useMissionControlStore((s) => s.setAlertRules);
  const [showForm, setShowForm] = useState(false);

  // Fetch persisted rules from API on mount; fall back to local state on error
  useEffect(() => {
    mcApi.get<MCAlertRule[]>('/api/alert-rules')
      .then((data) => { if (Array.isArray(data) && data.length > 0) setAlertRules(data); })
      .catch(() => { /* keep local state */ });
  }, [setAlertRules]);

  const handleToggle = useCallback(
    (id: string) => {
      const updated = alertRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      setAlertRules(updated);
      const rule = updated.find((r) => r.id === id);
      if (rule) {
        mcApi.patch(`/api/alert-rules/${id}`, { enabled: rule.enabled }).catch(() => {});
      }
    },
    [alertRules, setAlertRules],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setAlertRules(alertRules.filter((r) => r.id !== id));
      mcApi.delete(`/api/alert-rules/${id}`).catch(() => {});
    },
    [alertRules, setAlertRules],
  );

  const handleSave = useCallback(
    async (draft: Omit<MCAlertRule, 'id' | 'createdAt'>) => {
      const localRule: MCAlertRule = { ...draft, id: `rule-${Date.now()}`, createdAt: Date.now() };
      setAlertRules([...alertRules, localRule]);
      setShowForm(false);
      // Persist to API; update local id if server returns one
      try {
        const saved = await mcApi.post<MCAlertRule>('/api/alert-rules', localRule);
        if (saved?.id && saved.id !== localRule.id) {
          const current = useMissionControlStore.getState().alertRules;
          setAlertRules(current.map((r) => (r.id === localRule.id ? { ...r, id: saved.id } : r)));
        }
      } catch { /* keep local */ }
    },
    [alertRules, setAlertRules],
  );

  const activeCount = alertRules.filter((r) => r.enabled).length;

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel>Regras de alerta</SectionLabel>
          {alertRules.length > 0 && (
            <p className="text-[8px] text-text-secondary mt-0.5 font-mono">
              {activeCount} ativa{activeCount !== 1 ? 's' : ''} de {alertRules.length}
            </p>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            <Icon name="add" size="xs" />
            Nova
          </button>
        )}
      </div>

      {/* New rule form */}
      {showForm && (
        <NewRuleForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      )}

      {/* Rules list */}
      {alertRules.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">notifications_off</span>
          <p className="text-text-secondary text-xs text-center">Nenhuma regra configurada</p>
          <p className="text-text-secondary text-[9px] text-center max-w-[220px]">
            Crie regras para receber alertas automaticos sobre seus agentes
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            Criar primeira regra
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {alertRules.map((rule) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
