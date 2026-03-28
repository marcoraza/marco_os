/**
 * MCInterAgentStrip — Sprint 4
 *
 * Collapsible strip showing inter-agent messages from the store.
 * Renders at the top of the Chat tab as a secondary communication layer.
 * Distinct from human↔agent chat: these are agent↔agent signals.
 */
import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore, type MCInterAgentMessage } from '../../../store/missionControl';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatAge(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function agentInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ── Agent avatar chip ─────────────────────────────────────────────────────────

function AgentChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 bg-surface border border-border-panel rounded-sm px-1.5 py-0.5">
      <span className="text-[7px] font-black text-brand-mint">{agentInitials(name)}</span>
      <span className="text-[8px] font-bold text-text-primary">{name}</span>
    </span>
  );
}

// ── Message row ───────────────────────────────────────────────────────────────

function InterAgentRow({ msg }: { msg: MCInterAgentMessage }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border-panel/50 last:border-b-0">
      {/* From → To */}
      <div className="flex items-center gap-1.5 shrink-0">
        <AgentChip name={msg.from} />
        <Icon name="arrow_forward" size="xs" className="text-text-secondary" />
        <AgentChip name={msg.to} />
      </div>

      {/* Content */}
      <p className="flex-1 min-w-0 text-[9px] text-text-primary line-clamp-2 leading-relaxed">
        {msg.content}
      </p>

      {/* Right meta */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[7px] font-mono text-text-secondary">{formatAge(msg.timestamp)}</span>
        {msg.taskRef && (
          <span className="text-[7px] font-mono text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-1.5 py-0.5 rounded-sm">
            {msg.taskRef}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

const MAX_VISIBLE = 8;

export function MCInterAgentStrip() {
  const messages = useMissionControlStore((s) => s.interAgentMessages);
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => b.timestamp - a.timestamp),
    [messages],
  );

  const visible = showAll ? sorted : sorted.slice(0, MAX_VISIBLE);

  if (messages.length === 0) return null;

  return (
    <div className="border-b border-border-panel bg-bg-base">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 transition-colors',
          'hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-accent-purple">hub</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
            Inter-agente
          </span>
          <span className="text-[7px] font-black bg-accent-purple/10 border border-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded-sm font-mono">
            {messages.length}
          </span>
        </div>
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          size="xs"
          className="text-text-secondary"
        />
      </button>

      {/* Expanded list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 max-h-[280px] overflow-y-auto">
              {visible.map((msg) => (
                <InterAgentRow key={msg.id} msg={msg} />
              ))}

              {sorted.length > MAX_VISIBLE && (
                <button
                  onClick={() => setShowAll((p) => !p)}
                  className="w-full text-center py-1.5 text-[8px] font-bold uppercase tracking-widest text-brand-mint hover:text-brand-mint/80 transition-colors focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
                >
                  {showAll
                    ? 'Mostrar menos'
                    : `Ver mais ${sorted.length - MAX_VISIBLE} mensagens`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
