'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StatusDot } from './ui';
import { useAgentChat } from '../hooks/useAgentChat';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  sectionId: string;
  agentName: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function ChatPanel({ isOpen, onClose, agentId, sectionId, agentName }: ChatPanelProps) {
  const { messages, isLoading, sendMessage, clearSession } = useAgentChat({ agentId, sectionId });
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 300);
  }, [isOpen]);

  const submit = () => {
    const msg = draft.trim();
    if (!msg || isLoading) return;
    setDraft('');
    sendMessage(msg);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 bottom-0 z-50 w-full md:w-[400px] bg-bg-surface border-l border-border-panel flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border-panel shrink-0">
              <StatusDot color="mint" glow size="sm" />
              <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-text-primary truncate">
                {agentName}
              </span>
              <button
                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                title="Limpar conversa"
                onClick={clearSession}
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              </button>
              <button
                className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                title="Fechar"
                onClick={onClose}
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {messages.length === 0 && !isLoading ? (
                <p className="text-[10px] text-text-secondary text-center mt-8">
                  Nenhuma mensagem ainda.
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex flex-col gap-0.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] px-3 py-2 rounded-sm text-xs text-text-primary
                      ${m.role === 'user'
                        ? 'bg-brand-mint/10 border border-brand-mint/30'
                        : 'bg-bg-base border border-border-panel'}`}>
                      {m.content}
                    </div>
                    <span className="text-[8px] font-mono text-text-secondary px-1">
                      {fmtTime(m.timestamp)}
                    </span>
                  </div>
                ))
              )}

              {/* Loading dots */}
              {isLoading && (
                <div className="flex items-start gap-1 pl-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-brand-mint block"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border-panel shrink-0 flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                rows={2}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Digite uma mensagem..."
                className="flex-1 resize-none bg-bg-base border border-border-panel rounded-sm text-xs text-text-primary placeholder:text-text-secondary px-3 py-2 focus:outline-none focus:border-brand-mint/50 transition-colors"
              />
              <button
                onClick={submit}
                disabled={!draft.trim() || isLoading}
                className="p-2 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm hover:bg-brand-mint/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Enviar"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
