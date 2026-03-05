import React, { useState } from 'react';
import type { Task } from '../../lib/appTypes';
import { Card } from '../ui';
import { formatDeadline } from '../../utils/taskMappings';

const STATUS_OPTIONS: { value: Task['status']; label: string }[] = [
  { value: 'assigned',    label: 'Atribuída'   },
  { value: 'started',     label: 'Iniciada'    },
  { value: 'in-progress', label: 'Em Andamento'},
  { value: 'standby',     label: 'Stand By'    },
  { value: 'done',        label: 'Concluída'   },
];

const PRIORITY_OPTIONS: { value: Task['priority']; label: string }[] = [
  { value: 'high',   label: 'Alta'   },
  { value: 'medium', label: 'Normal' },
  { value: 'low',    label: 'Baixa'  },
];

interface TaskEditChanges {
  title: string;
  status: Task['status'];
  priority: Task['priority'];
  deadline: string;
  deadlineIso?: string;
}

interface TaskEditPanelProps {
  task: Task;
  onClose: () => void;
  onSave: (taskId: number, changes: TaskEditChanges) => Promise<void>;
}

const TaskEditPanel: React.FC<TaskEditPanelProps> = ({ task, onClose, onSave }) => {
  const [title, setTitle]       = useState(task.title);
  const [status, setStatus]     = useState<Task['status']>(task.status);
  const [priority, setPriority] = useState<Task['priority']>(task.priority);
  const [deadlineIso, setDeadlineIso] = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const deadline = deadlineIso ? formatDeadline(deadlineIso) : task.deadline;
    await onSave(task.id, {
      title,
      status,
      priority,
      deadline,
      deadlineIso: deadlineIso || undefined,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <Card
        className="relative z-10 w-full max-w-md mx-4 p-5 rounded-sm space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
            Editar Tarefa
          </span>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-lg leading-none w-5 h-5 flex items-center justify-center rounded-sm hover:bg-surface transition-colors"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
            Título
          </label>
          <input
            className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[12px] text-text-primary focus:outline-none focus:border-text-secondary/50"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Status + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
              Status
            </label>
            <select
              className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[11px] font-mono text-text-primary focus:outline-none focus:border-text-secondary/50"
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
              Prioridade
            </label>
            <select
              className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[11px] font-mono text-text-primary focus:outline-none focus:border-text-secondary/50"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tag (read-only) + Prazo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
              Tag
            </label>
            <div className="px-2 py-1.5 bg-bg-base border border-border-panel rounded-sm text-[11px] font-mono text-text-secondary">
              {task.tag || '—'}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
              Prazo
            </label>
            <input
              type="date"
              className="w-full bg-bg-base border border-border-panel rounded-sm px-2 py-1.5 text-[11px] font-mono text-text-primary focus:outline-none focus:border-text-secondary/50"
              value={deadlineIso}
              onChange={(e) => setDeadlineIso(e.target.value)}
              placeholder={task.deadline}
            />
            {!deadlineIso && task.deadline && task.deadline !== 'A definir' && (
              <p className="text-[9px] font-mono text-text-secondary/60">{task.deadline}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest bg-brand-mint/10 text-brand-mint hover:bg-brand-mint/20 border border-brand-mint/30 transition-colors disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            className="flex-1 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest bg-surface text-text-secondary hover:text-text-primary border border-border-panel transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </Card>
    </div>
  );
};

export default TaskEditPanel;
