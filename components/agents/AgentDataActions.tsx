import React, { useState } from 'react';
import { Icon, SectionLabel, showToast } from '../ui';
import { cn } from '../../utils/cn';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';

// ─── Config ───────────────────────────────────────────────────────────────────

const API_URL = (import.meta.env.VITE_FORM_API_URL as string | undefined) ?? 'https://api.clawdia.com.br/api';
const API_TOKEN = (import.meta.env.VITE_FORM_API_TOKEN as string | undefined) ?? '';

type ActionKind = 'gasto' | 'treino' | 'tarefa' | null;

// ─── Mini form state types ────────────────────────────────────────────────────

interface GastoForm {
  titulo: string;
  valor: string;
  categoria: string;
}

interface TreinoForm {
  tipo: string;
  duracao: string;
  notas: string;
}

interface TarefaForm {
  titulo: string;
  prioridade: 'alta' | 'media' | 'baixa';
  projeto: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function postToNotion(database: string, properties: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/notion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    },
    body: JSON.stringify({ database, properties }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Sub-forms ────────────────────────────────────────────────────────────────

function GastoFormPanel({
  agentName,
  onSuccess,
  onCancel,
}: {
  agentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<GastoForm>({ titulo: '', valor: '', categoria: 'Outros' });
  const [loading, setLoading] = useState(false);

  const categorias = ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Moradia', 'Outros'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.valor) {
      showToast('Preencha título e valor');
      return;
    }
    setLoading(true);
    try {
      await postToNotion('financas', {
        Name: { title: [{ text: { content: form.titulo } }] },
        Valor: { number: parseFloat(form.valor.replace(',', '.')) },
        Categoria: { select: { name: form.categoria } },
        Tipo: { select: { name: 'saida' } },
        Data: { date: { start: new Date().toISOString().slice(0, 10) } },
        Origem: { select: { name: agentName } },
      });
      showToast('Gasto registrado com sucesso');
      onSuccess();
    } catch (err) {
      showToast(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-bg-base border border-border-panel rounded-sm">
      <p className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">Registrar Gasto</p>
      <div>
        <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Titulo</label>
        <input
          type="text"
          value={form.titulo}
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          placeholder="Ex: Almoço restaurante"
          className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/50 outline-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.valor}
            onChange={e => setForm(f => ({ ...f, valor: e.target.value }))}
            placeholder="0,00"
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/50 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Categoria</label>
          <select
            value={form.categoria}
            onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary focus:border-brand-mint/50 outline-none transition-colors"
          >
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Registrar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border border-border-panel text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function TreinoFormPanel({
  agentName,
  onSuccess,
  onCancel,
}: {
  agentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TreinoForm>({ tipo: 'Musculação', duracao: '', notas: '' });
  const [loading, setLoading] = useState(false);

  const tipos = ['Musculação', 'Corrida', 'Ciclismo', 'Natação', 'Yoga', 'HIIT', 'Caminhada', 'Outro'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.duracao) {
      showToast('Preencha a duração');
      return;
    }
    setLoading(true);
    try {
      await postToNotion('saude', {
        Name: { title: [{ text: { content: `${form.tipo} - ${form.duracao}min` } }] },
        Tipo: { select: { name: form.tipo } },
        Duracao: { number: parseInt(form.duracao, 10) },
        Notas: { rich_text: [{ text: { content: form.notas } }] },
        Data: { date: { start: new Date().toISOString().slice(0, 10) } },
        Origem: { select: { name: agentName } },
      });
      showToast('Treino registrado com sucesso');
      onSuccess();
    } catch (err) {
      showToast(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-bg-base border border-border-panel rounded-sm">
      <p className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">Registrar Treino</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary focus:border-brand-mint/50 outline-none transition-colors"
          >
            {tipos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Duracao (min)</label>
          <input
            type="number"
            min="1"
            max="480"
            value={form.duracao}
            onChange={e => setForm(f => ({ ...f, duracao: e.target.value }))}
            placeholder="60"
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/50 outline-none transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Notas (opcional)</label>
        <textarea
          value={form.notas}
          onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
          placeholder="Como foi o treino..."
          rows={2}
          className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/50 outline-none transition-colors resize-none"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-accent-blue/10 border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Registrar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border border-border-panel text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function TarefaFormPanel({
  agentName,
  onSuccess,
  onCancel,
}: {
  agentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TarefaForm>({ titulo: '', prioridade: 'media', projeto: 'Pessoal' });
  const [loading, setLoading] = useState(false);

  const projetos = ['Pessoal', 'Trabalho', 'Zaremba - Gestão', 'Marketing', 'Outros'];
  const prioridades: Array<{ value: TarefaForm['prioridade']; label: string }> = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Media' },
    { value: 'baixa', label: 'Baixa' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo) {
      showToast('Preencha o título da tarefa');
      return;
    }
    setLoading(true);
    try {
      await postToNotion('checklists', {
        Name: { title: [{ text: { content: form.titulo } }] },
        Prioridade: { select: { name: form.prioridade } },
        Projeto: { select: { name: form.projeto } },
        Status: { select: { name: 'A fazer' } },
        Data: { date: { start: new Date().toISOString().slice(0, 10) } },
        Origem: { select: { name: agentName } },
      });
      showToast('Tarefa criada com sucesso');
      onSuccess();
    } catch (err) {
      showToast(`Erro: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 p-3 bg-bg-base border border-border-panel rounded-sm">
      <p className="text-[9px] font-mono text-text-secondary uppercase tracking-widest">Criar Tarefa</p>
      <div>
        <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Titulo</label>
        <input
          type="text"
          value={form.titulo}
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          placeholder="Ex: Revisar contrato com fornecedor"
          className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/50 outline-none transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Prioridade</label>
          <select
            value={form.prioridade}
            onChange={e => setForm(f => ({ ...f, prioridade: e.target.value as TarefaForm['prioridade'] }))}
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary focus:border-brand-mint/50 outline-none transition-colors"
          >
            {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[8px] font-mono text-text-secondary uppercase tracking-widest block mb-1">Projeto</label>
          <select
            value={form.projeto}
            onChange={e => setForm(f => ({ ...f, projeto: e.target.value }))}
            className="w-full bg-surface border border-border-panel rounded-sm px-2 py-1.5 text-xs text-text-primary focus:border-brand-mint/50 outline-none transition-colors"
          >
            {projetos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide bg-accent-purple/10 border border-accent-purple/30 text-accent-purple hover:bg-accent-purple/20 transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Criar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wide border border-border-panel text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AgentDataActionsProps {
  agentId: string;
  agentName?: string;
}

const ACTIONS: Array<{
  kind: ActionKind;
  icon: string;
  label: string;
  desc: string;
  colorClass: string;
}> = [
  {
    kind: 'gasto',
    icon: 'payments',
    label: 'Registrar Gasto',
    desc: 'Lanca uma saida financeira no Notion',
    colorClass: 'border-accent-orange/30 text-accent-orange hover:bg-accent-orange/10',
  },
  {
    kind: 'treino',
    icon: 'fitness_center',
    label: 'Registrar Treino',
    desc: 'Registra atividade fisica e duracao',
    colorClass: 'border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10',
  },
  {
    kind: 'tarefa',
    icon: 'add_task',
    label: 'Criar Tarefa',
    desc: 'Cria uma nova tarefa no Notion',
    colorClass: 'border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10',
  },
];

export default function AgentDataActions({ agentId, agentName = 'Agente' }: AgentDataActionsProps) {
  const [activeKind, setActiveKind] = useState<ActionKind>(null);
  const { refetch } = useSupabaseData();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSuccess = () => {
    setActiveKind(null);
    setLastAction(`Ultima acao concluida: ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`);
    void refetch();
  };

  const handleCancel = () => setActiveKind(null);

  return (
    <div className="space-y-4">
      {/* Header explanation */}
      <div className="p-4 bg-surface border border-border-panel rounded-sm">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-sm bg-brand-mint/10 border border-brand-mint/20 flex items-center justify-center shrink-0">
            <Icon name="database" size="sm" className="text-brand-mint" />
          </div>
          <div>
            <SectionLabel className="mb-1">Dados Pessoais</SectionLabel>
            <p className="text-[10px] text-text-secondary leading-relaxed">
              <span className="font-bold text-text-primary">{agentName}</span> pode registrar dados pessoais
              diretamente no Notion em seu nome. Os dados sao sincronizados automaticamente com o Marco OS.
            </p>
            <p className="mt-1.5 text-[9px] font-mono text-text-secondary">
              Agente: <span className="text-brand-mint">{agentId}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <SectionLabel>Acoes Rapidas</SectionLabel>
        {lastAction && (
          <div className="rounded-sm border border-brand-mint/30 bg-brand-mint/10 px-3 py-2 text-[9px] text-brand-mint">
            {lastAction}
          </div>
        )}
        {ACTIONS.map(action => (
          <div key={action.kind} className="space-y-0">
            <button
              onClick={() => setActiveKind(prev => prev === action.kind ? null : action.kind)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border transition-all text-left',
                activeKind === action.kind
                  ? action.colorClass + ' bg-opacity-10'
                  : 'border-border-panel text-text-secondary hover:text-text-primary hover:border-border-panel/80',
                action.colorClass,
              )}
            >
              <div className={cn(
                'size-7 rounded-sm border flex items-center justify-center shrink-0 transition-colors',
                activeKind === action.kind ? 'bg-opacity-20' : 'bg-surface',
                action.colorClass,
              )}>
                <Icon name={action.icon} size="xs" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold">{action.label}</p>
                <p className="text-[8px] text-text-secondary">{action.desc}</p>
              </div>
              <Icon
                name={activeKind === action.kind ? 'expand_less' : 'expand_more'}
                size="xs"
                className="text-text-secondary shrink-0"
              />
            </button>

            {activeKind === 'gasto' && action.kind === 'gasto' && (
              <GastoFormPanel agentName={agentName} onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
            {activeKind === 'treino' && action.kind === 'treino' && (
              <TreinoFormPanel agentName={agentName} onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
            {activeKind === 'tarefa' && action.kind === 'tarefa' && (
              <TarefaFormPanel agentName={agentName} onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
          </div>
        ))}
      </div>

      {/* Info footer */}
      <div className="p-3 bg-bg-base border border-border-panel rounded-sm">
        <p className="text-[8px] font-mono text-text-secondary leading-relaxed">
          Os dados sao enviados via Bridge API para o Notion e sincronizados de volta ao Marco OS em ate 5 minutos.
          Endpoint: <span className="text-text-primary">{API_URL}/notion</span>
        </p>
      </div>
    </div>
  );
}
