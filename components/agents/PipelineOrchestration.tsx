import { useState, useEffect, useCallback } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { formatRelativeTime } from '../../utils/dateUtils';

interface PipelineStep {
  type: 'agent' | 'script' | 'cron' | string;
  config: string;
}

interface Pipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
  status: 'idle' | 'running' | 'triggered' | string;
  lastRunAt?: string;
}

const STATUS_BADGE: Record<string, string> = {
  idle: 'bg-surface border-border-panel text-text-secondary',
  running: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
  triggered: 'bg-accent-green/10 border-accent-green/20 text-accent-green',
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'Ocioso',
  running: 'Executando',
  triggered: 'Disparado',
};

const bridgeBase = import.meta.env.VITE_FORM_API_URL || '';
const bridgeHeaders: Record<string, string> = {
  Authorization: `Bearer ${import.meta.env.VITE_FORM_API_TOKEN || ''}`,
};

const EMPTY_STEP: PipelineStep = { type: 'agent', config: '' };

export default function PipelineOrchestration() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSteps, setFormSteps] = useState<PipelineStep[]>([{ ...EMPTY_STEP }]);
  const [saving, setSaving] = useState(false);

  const fetchPipelines = useCallback(async () => {
    if (!bridgeBase) {
      setPipelines([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${bridgeBase}/pipelines`, { headers: bridgeHeaders });
      const data = await res.json();
      const list = data.ok ? (data.pipelines ?? data.data ?? []) : [];
      setPipelines(Array.isArray(list) ? list : []);
    } catch {
      setPipelines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  const runPipeline = useCallback(async (id: string) => {
    if (!bridgeBase) return;
    setRunning(id);
    try {
      await fetch(`${bridgeBase}/pipelines/${id}/run`, {
        method: 'POST',
        headers: { ...bridgeHeaders, 'Content-Type': 'application/json' },
      });
      await fetchPipelines();
    } catch {
      // silently fail
    } finally {
      setRunning(null);
    }
  }, [fetchPipelines]);

  const handleSavePipeline = useCallback(async () => {
    if (!bridgeBase || !formName.trim()) return;
    setSaving(true);
    try {
      await fetch(`${bridgeBase}/pipelines`, {
        method: 'POST',
        headers: { ...bridgeHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName.trim(), steps: formSteps }),
      });
      setShowForm(false);
      setFormName('');
      setFormSteps([{ ...EMPTY_STEP }]);
      await fetchPipelines();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }, [formName, formSteps, fetchPipelines]);

  const addStep = () => setFormSteps((prev) => [...prev, { ...EMPTY_STEP }]);
  const removeStep = (idx: number) =>
    setFormSteps((prev) => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, patch: Partial<PipelineStep>) =>
    setFormSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel icon="route">PIPELINES</SectionLabel>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPipelines}
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
            Novo Pipeline
          </button>
        </div>
      </div>

      {/* New pipeline form */}
      {showForm && (
        <Card className="p-4 space-y-4">
          <p className="text-[11px] font-bold text-text-primary uppercase tracking-wide">Novo Pipeline</p>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Nome</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Nome do pipeline"
              className="w-full bg-surface border border-border-panel rounded-sm px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">Steps</label>
              <button
                onClick={addStep}
                className="flex items-center gap-1 text-[10px] text-brand-mint hover:text-text-primary transition-colors"
              >
                <Icon name="add" size="xs" />
                Adicionar step
              </button>
            </div>
            {formSteps.map((step, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select
                  value={step.type}
                  onChange={(e) => updateStep(idx, { type: e.target.value })}
                  className="bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-[11px] text-text-primary focus:outline-none focus:border-brand-mint/40 shrink-0"
                >
                  <option value="agent">Agent</option>
                  <option value="script">Script</option>
                  <option value="cron">Cron</option>
                </select>
                <textarea
                  value={step.config}
                  onChange={(e) => updateStep(idx, { config: e.target.value })}
                  placeholder="Config (JSON ou texto)"
                  rows={2}
                  className="flex-1 bg-surface border border-border-panel rounded-sm px-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-brand-mint/40 resize-none font-mono"
                />
                {formSteps.length > 1 && (
                  <button
                    onClick={() => removeStep(idx)}
                    className="p-1.5 rounded-sm text-text-secondary hover:text-accent-red transition-colors shrink-0"
                  >
                    <Icon name="close" size="xs" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-sm text-[10px] font-bold text-text-secondary hover:text-text-primary border border-border-panel hover:border-text-secondary/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePipeline}
              disabled={saving || !formName.trim()}
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
          {[1, 2].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-2">
                <div className="h-3 bg-border-panel/60 rounded-sm animate-pulse w-1/2" />
                <div className="h-2 bg-border-panel/40 rounded-sm animate-pulse w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && pipelines.length === 0 && (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center gap-3 text-text-secondary">
            <Icon name="route" size="lg" className="opacity-30" />
            <span className="text-[11px]">Nenhum pipeline configurado</span>
          </div>
        </Card>
      )}

      {!loading && pipelines.length > 0 && (
        <div className="space-y-3">
          {pipelines.map((pipeline) => {
            const statusClass = STATUS_BADGE[pipeline.status] ?? STATUS_BADGE.idle;
            const statusLabel = STATUS_LABEL[pipeline.status] ?? pipeline.status;
            return (
              <Card key={pipeline.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-bold text-text-primary">{pipeline.name}</span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-sm border text-[9px] font-bold uppercase tracking-widest',
                          statusClass
                        )}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Icon name="stacks" size="xs" />
                        <span className="font-mono">{pipeline.steps?.length ?? 0}</span> steps
                      </span>
                      {pipeline.lastRunAt && (
                        <span className="flex items-center gap-1">
                          <Icon name="schedule" size="xs" />
                          <span className="font-mono">{formatRelativeTime(pipeline.lastRunAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => runPipeline(pipeline.id)}
                    disabled={running === pipeline.id}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide shrink-0 transition-colors',
                      'bg-accent-blue/10 border border-accent-blue/20 text-accent-blue hover:bg-accent-blue/20 disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                  >
                    <Icon name={running === pipeline.id ? 'progress_activity' : 'play_arrow'} size="xs" className={cn(running === pipeline.id && 'animate-spin')} />
                    {running === pipeline.id ? 'Executando...' : 'Executar'}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
