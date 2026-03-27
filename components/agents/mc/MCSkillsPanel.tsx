/**
 * MCSkillsPanel — Skill editor with master/detail layout.
 *
 * Left: searchable skill list with status dots and security badges.
 * Right: editable detail panel for selected skill (description, triggers, config).
 * Data from MC API with polling fallback.
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  source: string;
  path: string;
  description?: string;
  registry_slug?: string | null;
  security_status?: string | null;
}

interface SkillGroup {
  source: string;
  path: string;
  skills: Skill[];
}

interface SkillsResponse {
  skills?: Skill[];
  groups?: SkillGroup[];
  total?: number;
}

interface EditableSkillFields {
  description: string;
  triggerWords: string[];
  autoRun: boolean;
  modelPreference: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MODEL_OPTIONS = ['opus', 'sonnet', 'haiku', 'codex'];

const STATUS_DOT: Record<string, { color: string; label: string }> = {
  verified: { color: 'bg-brand-mint', label: 'Verificada' },
  warning: { color: 'bg-accent-orange', label: 'Atencao' },
  blocked: { color: 'bg-accent-red', label: 'Bloqueada' },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function SecurityBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const colorClasses =
    status === 'verified' ? 'text-brand-mint border-brand-mint/30' :
    status === 'warning' ? 'text-accent-orange border-accent-orange/30' :
    status === 'blocked' ? 'text-accent-red border-accent-red/30' :
    'text-text-secondary border-border-panel';

  return (
    <span className={cn('text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.5 border rounded-sm', colorClasses)}>
      {status}
    </span>
  );
}

function TriggerPill({
  word,
  onRemove,
}: {
  word: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 bg-bg-base border border-border-panel rounded-sm px-2 py-0.5 text-[9px] font-mono text-text-primary">
      {word}
      <button
        onClick={onRemove}
        className="text-text-secondary hover:text-accent-red transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        aria-label={`Remover ${word}`}
      >
        <Icon name="close" size="xs" />
      </button>
    </span>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-8 h-4 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        checked ? 'bg-brand-mint/30' : 'bg-border-panel',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full transition-all',
          checked ? 'left-4 bg-brand-mint' : 'left-0.5 bg-text-secondary',
        )}
      />
    </button>
  );
}

// ── Skill List (left panel) ──────────────────────────────────────────────────

function SkillListItem({
  skill,
  isActive,
  onClick,
}: {
  skill: Skill;
  isActive: boolean;
  onClick: () => void;
}) {
  const dot = STATUS_DOT[skill.security_status || ''];
  const dotColor = dot?.color || 'bg-text-secondary/40';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-left transition-all',
        'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        isActive
          ? 'bg-brand-mint/5 border-l-2 border-brand-mint/20'
          : 'hover:bg-surface-hover border-l-2 border-transparent',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
      <span className={cn('text-[10px] font-bold truncate', isActive ? 'text-brand-mint' : 'text-text-primary')}>
        {skill.name}
      </span>
      <span className="ml-auto shrink-0">
        <SecurityBadge status={skill.security_status} />
      </span>
    </button>
  );
}

// ── Detail Panel (right) ─────────────────────────────────────────────────────

function SkillDetailPanel({
  skill,
  editedFields,
  onFieldChange,
  onSave,
  onTest,
  onDelete,
}: {
  skill: Skill;
  editedFields: EditableSkillFields;
  onFieldChange: (fields: Partial<EditableSkillFields>) => void;
  onSave: () => void;
  onTest: () => void;
  onDelete: () => void;
}) {
  const [newTrigger, setNewTrigger] = useState('');
  const triggerInputRef = useRef<HTMLInputElement>(null);

  const dot = STATUS_DOT[skill.security_status || ''];

  const addTrigger = () => {
    const trimmed = newTrigger.trim();
    if (trimmed && !editedFields.triggerWords.includes(trimmed)) {
      onFieldChange({ triggerWords: [...editedFields.triggerWords, trimmed] });
      setNewTrigger('');
      triggerInputRef.current?.focus();
    }
  };

  const removeTrigger = (word: string) => {
    onFieldChange({ triggerWords: editedFields.triggerWords.filter((w) => w !== word) });
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTrigger();
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon name="psychology" size="sm" className="text-accent-purple" />
          <span className="text-xs font-bold text-text-primary">{skill.name}</span>
          <SecurityBadge status={skill.security_status} />
        </div>
        <div className="flex items-center gap-3 text-[8px] font-mono text-text-secondary">
          <span className="flex items-center gap-1">
            <Icon name="folder" size="xs" className="text-text-secondary" />
            {skill.source}
          </span>
          <span className="truncate max-w-[200px]">{skill.path}</span>
        </div>
        {dot && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn('w-1.5 h-1.5 rounded-full', dot.color)} />
            <span className="text-[8px] text-text-secondary">{dot.label}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">
          Descricao
        </label>
        <textarea
          value={editedFields.description}
          onChange={(e) => onFieldChange({ description: e.target.value })}
          rows={3}
          className="w-full bg-bg-base border border-border-panel rounded-sm p-2 text-xs text-text-primary font-mono resize-none placeholder:text-text-secondary/50 focus:border-brand-mint/30 focus:outline-none"
          placeholder="Descricao da skill..."
        />
      </div>

      {/* Trigger Words */}
      <div>
        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-1">
          Trigger words
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {editedFields.triggerWords.map((word) => (
            <TriggerPill key={word} word={word} onRemove={() => removeTrigger(word)} />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            ref={triggerInputRef}
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
            onKeyDown={handleTriggerKeyDown}
            className="flex-1 bg-bg-base border border-border-panel rounded-sm px-2 py-1 text-[10px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/30 focus:outline-none"
            placeholder="Novo trigger..."
          />
          <button
            onClick={addTrigger}
            disabled={!newTrigger.trim()}
            className="bg-surface border border-border-panel text-text-secondary rounded-sm px-2 py-1 text-[9px] hover:text-text-primary hover:border-brand-mint/30 transition-colors disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
          >
            <Icon name="add" size="xs" />
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div>
        <label className="text-[8px] font-black uppercase tracking-widest text-text-secondary block mb-2">
          Configuracao
        </label>
        <div className="flex flex-col gap-3">
          {/* Auto-run toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-primary">Auto-run</span>
            <Toggle checked={editedFields.autoRun} onChange={(val) => onFieldChange({ autoRun: val })} />
          </div>

          {/* Model preference */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-text-primary">Modelo</span>
            <select
              value={editedFields.modelPreference}
              onChange={(e) => onFieldChange({ modelPreference: e.target.value })}
              className="bg-bg-base border border-border-panel rounded-sm px-2 py-1 text-[9px] font-mono text-text-primary focus:border-brand-mint/30 focus:outline-none appearance-none cursor-pointer"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2 pt-3 border-t border-border-panel">
        <button
          onClick={onSave}
          className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Salvar
        </button>
        <button
          onClick={onTest}
          className="bg-surface border border-border-panel text-text-primary rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-surface-hover transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Testar
        </button>
        <button
          onClick={onDelete}
          className="bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-accent-red/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none ml-auto"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function MCSkillsPanel({ agentId }: { agentId?: string }) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [editedFields, setEditedFields] = useState<EditableSkillFields>({
    description: '',
    triggerWords: [],
    autoRun: false,
    modelPreference: 'sonnet',
  });

  const fetchSkills = useCallback(async () => {
    try {
      const params = agentId ? `?agent=${encodeURIComponent(agentId)}` : '';
      const res = await mcApi.get<SkillsResponse>(`/api/skills${params}`);
      const groups = res?.groups || [];
      const flat = groups.flatMap((g) => g.skills);
      const skills = flat.length > 0 ? flat : res?.skills || [];
      const t = res?.total ?? skills.length;
      setAllSkills(skills);
      setTotal(t);

      // Auto-select first skill if nothing selected
      if (skills.length > 0 && !selectedSkillId) {
        const first = skills[0];
        setSelectedSkillId(first.id);
        setEditedFields({
          description: first.description || '',
          triggerWords: first.name ? [first.name] : [],
          autoRun: false,
          modelPreference: 'sonnet',
        });
      }
    } catch {
      // Fallback: keep current state
    } finally {
      setLoading(false);
    }
  }, [agentId, selectedSkillId]);

  useMCPoll(fetchSkills, 60_000);

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return allSkills;
    const q = search.toLowerCase();
    return allSkills.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q),
    );
  }, [allSkills, search]);

  const selectedSkill = useMemo(
    () => allSkills.find((s) => s.id === selectedSkillId) || null,
    [allSkills, selectedSkillId],
  );

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkillId(skill.id);
    setEditedFields({
      description: skill.description || '',
      triggerWords: skill.name ? [skill.name] : [],
      autoRun: false,
      modelPreference: 'sonnet',
    });
  }, []);

  const handleFieldChange = useCallback((fields: Partial<EditableSkillFields>) => {
    setEditedFields((prev) => ({ ...prev, ...fields }));
  }, []);

  const handleSave = useCallback(() => {
    if (!selectedSkill) return;
    // eslint-disable-next-line no-console
    console.log('[MCSkillsPanel] Save skill:', selectedSkill.id, editedFields);
  }, [selectedSkill, editedFields]);

  const handleTest = useCallback(() => {
    if (!selectedSkill) return;
    // eslint-disable-next-line no-console
    console.log('[MCSkillsPanel] Test skill:', selectedSkill.id);
  }, [selectedSkill]);

  const handleDelete = useCallback(() => {
    if (!selectedSkill) return;
    // eslint-disable-next-line no-console
    console.log('[MCSkillsPanel] Delete skill:', selectedSkill.id);
  }, [selectedSkill]);

  const handleAddSkill = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('[MCSkillsPanel] Add new skill');
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex gap-3 h-full">
        <div className="w-64 shrink-0 space-y-2">
          <div className="bg-border-panel animate-pulse rounded-sm h-8" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-border-panel animate-pulse rounded-sm h-10" />
          ))}
        </div>
        <div className="flex-1 space-y-2">
          <div className="bg-border-panel animate-pulse rounded-sm h-12" />
          <div className="bg-border-panel animate-pulse rounded-sm h-32" />
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────

  if (allSkills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">psychology</span>
        <p className="text-text-secondary text-xs text-center">Nenhuma skill encontrada</p>
        <button
          onClick={handleAddSkill}
          className="bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-brand-mint/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
        >
          Nova skill
        </button>
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────

  return (
    <div className="flex gap-3 h-full min-h-0">
      {/* Left panel: skill list */}
      <div className="w-64 shrink-0 flex flex-col bg-surface border border-border-panel rounded-sm overflow-hidden">
        {/* Search + add header */}
        <div className="flex items-center gap-2 p-2 border-b border-border-panel">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-bg-base border border-border-panel rounded-sm px-2 py-1 text-[10px] font-mono text-text-primary placeholder:text-text-secondary/50 focus:border-brand-mint/30 focus:outline-none min-w-0"
            placeholder="Buscar skills..."
          />
          <button
            onClick={handleAddSkill}
            className="shrink-0 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm p-1 hover:bg-brand-mint/20 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
            aria-label="Nova skill"
          >
            <Icon name="add" size="xs" />
          </button>
        </div>

        {/* Total count */}
        <div className="px-3 py-1.5 border-b border-border-panel/50">
          <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
            {filteredSkills.length}/{total} skills
          </span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {filteredSkills.map((skill) => (
            <SkillListItem
              key={skill.id}
              skill={skill}
              isActive={selectedSkillId === skill.id}
              onClick={() => handleSelectSkill(skill)}
            />
          ))}
          {filteredSkills.length === 0 && search.trim() && (
            <p className="text-text-secondary text-[9px] text-center py-4">Nenhum resultado</p>
          )}
        </div>
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 bg-surface border border-border-panel rounded-sm p-3 overflow-y-auto min-h-0">
        {selectedSkill ? (
          <SkillDetailPanel
            skill={selectedSkill}
            editedFields={editedFields}
            onFieldChange={handleFieldChange}
            onSave={handleSave}
            onTest={handleTest}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Icon name="psychology" size="lg" className="text-text-secondary opacity-40" />
            <p className="text-text-secondary text-[9px]">Selecione uma skill para editar</p>
          </div>
        )}
      </div>
    </div>
  );
}
