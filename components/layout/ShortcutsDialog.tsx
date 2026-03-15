import { motion, AnimatePresence } from 'framer-motion';
import { SHORTCUTS } from '../../hooks/useHotkeys';
import { Icon } from '../ui';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="shortcuts-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 4 }}
            transition={{ duration: 0.2 }}
            className="bg-surface border border-border-panel rounded-md p-6 w-[420px] max-w-[90vw] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-text-primary">Atalhos de Teclado</h2>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
                <Icon name="close" />
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(s => (
                <div key={s.key + s.label} className="flex items-center justify-between py-2 border-b border-border-panel/50 last:border-0">
                  <span className="text-xs text-text-secondary">{s.description}</span>
                  <kbd className="px-2 py-0.5 bg-bg-base border border-border-panel rounded text-[10px] font-mono font-bold text-text-primary">{s.label}</kbd>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-text-secondary mt-4 text-center">Pressione <kbd className="px-1 py-0.5 bg-bg-base border border-border-panel rounded text-[9px] font-mono">?</kbd> para fechar</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
