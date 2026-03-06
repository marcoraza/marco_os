import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, FilterPills, SectionLabel } from '../ui';
import { showToast } from '../ui';
import { cn } from '../../utils/cn';
import { getDb } from '../../data/db';

// ─── Types ────────────────────────────────────────────────────────────────────
type CaptureType = 'Nota' | 'Tarefa' | 'Ideia' | 'Decisão';

interface QuickCaptureModalProps {
  open: boolean;
  onClose: () => void;
}

const CAPTURE_TYPES: CaptureType[] = ['Nota', 'Tarefa', 'Ideia', 'Decisão'];

// ─── Animation variants ───────────────────────────────────────────────────────
const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.96, y: -8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: -8 },
};

const transition = { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as const };

// ─── Save to IndexedDB notes store ───────────────────────────────────────────
async function saveCapture(content: string, type: CaptureType): Promise<void> {
  try {
    const db = await getDb();
    const now = new Date().toISOString();
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `capture-${Date.now()}`;

    await db.put('notes', {
      id,
      title: `[${type}] ${content.slice(0, 60)}`,
      body: content,
      createdAt: now,
      updatedAt: now,
      projectId: 'pessoal',
    });
  } catch (err) {
    console.error('[QuickCapture] failed to save:', err);
    throw err;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({ open, onClose }) => {
  const [text, setText] = useState('');
  const [activeType, setActiveType] = useState<CaptureType>('Nota');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea when opened
  useEffect(() => {
    if (open) {
      setText('');
      setActiveType('Nota');
      // Small delay to ensure AnimatePresence has mounted
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [open, onClose]);

  const handleSubmit = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await saveCapture(trimmed, activeType);
      showToast('Salvo');
      setText('');
      onClose();
    } catch {
      showToast('Erro ao salvar');
    }
  }, [text, activeType, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  const typePills = CAPTURE_TYPES.map(t => ({ id: t, label: t }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qc-backdrop"
            className="fixed inset-0 z-50 bg-black/40"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal card */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] pointer-events-none">
            <motion.div
              key="qc-card"
              className="bg-surface border border-border-panel rounded-sm w-[480px] max-w-[90vw] p-4 pointer-events-auto"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              role="dialog"
              aria-modal="true"
              aria-label="Captura rápida"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>CAPTURA RÁPIDA</SectionLabel>
                <button
                  onClick={onClose}
                  className="text-text-secondary hover:text-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none rounded-sm"
                  aria-label="Fechar"
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Captura rápida..."
                rows={4}
                className={cn(
                  'w-full bg-bg-base border border-border-panel rounded-sm px-3 py-2',
                  'text-sm text-text-primary placeholder:text-text-secondary',
                  'resize-none font-sans',
                  'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                  'transition-colors duration-200',
                )}
              />

              {/* Footer row */}
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                {/* Type pills */}
                <FilterPills
                  pills={typePills}
                  activeId={activeType}
                  onSelect={id => setActiveType(id as CaptureType)}
                />

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-[8px] text-text-secondary font-mono">
                    Enter salva · Shift+Enter nova linha
                  </span>
                  <button
                    onClick={() => void handleSubmit()}
                    disabled={!text.trim()}
                    className={cn(
                      'min-h-[44px] px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all',
                      'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                      text.trim()
                        ? 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20'
                        : 'bg-surface border border-border-panel text-text-secondary cursor-not-allowed',
                    )}
                    aria-label="Salvar captura"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickCaptureModal;
