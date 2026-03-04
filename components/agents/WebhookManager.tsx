import { useState, useEffect, useCallback } from 'react';
import { Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';

interface Webhook {
  id: string;
  name?: string;
  url: string;
  events: string[];
  active: boolean;
}

const ALL_EVENTS = [
  { id: 'task.created', label: 'task.created' },
  { id: 'task.completed', label: 'task.completed' },
  { id: 'pipeline.triggered', label: 'pipeline.triggered' },
  { id: 'cron.executed', label: 'cron.executed' },
];

const bridgeBase = import.meta.env.VITE_FORM_API_URL || '';
const bridgeHeaders: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_FORM_API_TOKEN || ''}`,
};

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formName, setFormName] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!bridgeBase) {
      setWebhooks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${bridgeBase}/webhooks`, { headers: bridgeHeaders });
      const data = await res.json();
      const list = data.ok ? (data.webhooks ?? data.data ?? []) : [];
      setWebhooks(Array.isArray(list) ? list : []);
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!bridgeBase) return;
      setDeleting(id);
      try {
        await fetch(`${bridgeBase}/webhooks/${id}`, {
          method: 'DELETE',
          headers: bridgeHeaders,
        });
        setWebhooks((prev) => prev.filter((w) => w.id !== id));
      } catch {
        // silently fail
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  const handleToggle = useCallback(
    async (webhook: Webhook) => {
      if (!bridgeBase) return;
      setToggling(webhook.id);
      try {
        await fetch(`${bridgeBase}/webhooks/${webhook.id}`, {
          method: 'PATCH',
          headers: { ...bridgeHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: !webhook.active }),
        });
        setWebhooks((prev) =>
          prev.map((w) => (w.id === webhook.id ? { ...w, active: !w.active } : w))
        );
      } catch {
        // silently fail
      } finally {
        setToggling(null);
      }
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!bridgeBase || !formUrl.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${bridgeBase}/webhooks`, {
        method: 'POST',
        headers: { ...bridgeHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: formUrl.trim(),
          name: formName.trim() || undefined,
          events: formEvents,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setShowForm(false);
        setFormUrl('');
        setFormName('');
        setFormEvents([]);
        await fetchWebhooks();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [formUrl, formName, formEvents, fetchWebhooks]);

  const toggleEvent = (eventId: string) =>
    setFormEvents((prev) =>
      prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon="webhook">WEBHOOKS</SectionLabel>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWebhooks}
            disabled={loading}
            className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-40"
          >
            <Icon name="refresh" size="xs" className={cn(loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-brand-mint/10 border border-brand-mint/20 text-brand-mint hover:bg-brand-mint/20 transition-colors"
          >
            <Icon name="add" size="xs" />
            Novo Webhook
          </button>
        </div>
      </div>

      {/* New webhook form */}
      {showForm && (
        <Card className="p-4 space-y-4">
          <p className="text-[11px] font-bold text-text-primary uppercase tracking-wide">Novo Webhook</p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">URL *</label>
            <input
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://example.com/webhook"
              className="w-full bg-surface border border-border-panel rounded-sm px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">
              Nome <span className="normal-case font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nome do webhook"
              className="w-full bg-surface border border-border-panel rounded-sm px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Eventos</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => (
                <label
                  key={ev.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={formEvents.includes(ev.id)}
                    onChange={() => toggleEvent(ev.id)}
                    className="accent-brand-mint rounded-sm"
                  />
                  <span className="text-[10px] font-mono text-text-secondary group-hover:text-text-primary transition-colors">
                    {ev.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-sm text-[10px] font-bold text-text-secondary hover:text-text-primary border border-border-panel hover:border-text-secondary/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formUrl.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-brand-mint/10 border border-brand-mint/20 text-brand-mint hover:bg-brand-mint/20 disabled:opacity-40 transition-colors"
            >
              <Icon name="save" size="xs" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </Card>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-2/3" />
                <div className="h-2 bg-border-panel/40 rounded-sm animate-pulse w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && webhooks.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="webhook" size="lg" className="opacity-30" />
            <span className="text-[11px]">Nenhum webhook configurado</span>
          </div>
        </Card>
      )}

      {!loading && webhooks.length > 0 && (
        <div className="space-y-3">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  {webhook.name && (
                    <p className="text-[12px] font-bold text-text-primary">{webhook.name}</p>
                  )}
                  <p className="text-[10px] font-mono text-text-secondary truncate max-w-[300px]">
                    {webhook.url}
                  </p>
                  {webhook.events.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((ev) => (
                        <span
                          key={ev}
                          className="px-1.5 py-0.5 text-[8px] font-mono font-bold bg-surface border border-border-panel text-text-secondary rounded-sm"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggle(webhook)}
                    disabled={toggling === webhook.id}
                    className={cn(
                      'relative w-8 h-4 rounded-sm border transition-colors disabled:opacity-40',
                      webhook.active
                        ? 'bg-brand-mint/20 border-brand-mint/40'
                        : 'bg-surface border-border-panel'
                    )}
                    title={webhook.active ? 'Desativar' : 'Ativar'}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-3 rounded-sm transition-all',
                        webhook.active
                          ? 'left-4 bg-brand-mint'
                          : 'left-0.5 bg-text-secondary/40'
                      )}
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    disabled={deleting === webhook.id}
                    className="p-1.5 rounded-sm text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-40"
                    title="Excluir"
                  >
                    <Icon name={deleting === webhook.id ? 'progress_activity' : 'delete'} size="xs" className={cn(deleting === webhook.id && 'animate-spin')} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
