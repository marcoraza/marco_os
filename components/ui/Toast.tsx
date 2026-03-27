import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
  action?: ToastAction;
}

let toastIdCounter = 0;
let globalShowToast: ((message: string, variant: 'success' | 'error' | 'info', action?: ToastAction) => void) | null = null;

export function getToastAppearance(variant: 'success' | 'error' | 'info') {
  if (variant === 'error') {
    return {
      icon: 'error',
      className: 'bg-surface border border-accent-red/30 shadow-lg',
      iconClassName: 'text-accent-red',
    };
  }
  if (variant === 'info') {
    return {
      icon: 'info',
      className: 'bg-surface border border-accent-blue/30 shadow-lg',
      iconClassName: 'text-accent-blue',
    };
  }
  return {
    icon: 'check_circle',
    className: 'bg-surface border border-brand-mint/30 shadow-lg',
    iconClassName: 'text-brand-mint',
  };
}

export function showToast(message: string, variant: 'success' | 'error' | 'info' = 'success', action?: ToastAction) {
  globalShowToast?.(message, variant, action);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((message: string, variant: 'success' | 'error' | 'info', action?: ToastAction) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-2), { id, message, variant, action }]);
    const duration = action ? 5000 : 2000; // Longer duration when undo available
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timersRef.current.delete(id);
    }, duration);
    timersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    globalShowToast = addToast;
    return () => { globalShowToast = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-sm', getToastAppearance(t.variant).className)}
          >
            <Icon name={getToastAppearance(t.variant).icon} size="sm" className={getToastAppearance(t.variant).iconClassName} />
            <span className="text-[11px] font-bold text-text-primary">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  setToasts(prev => prev.filter(x => x.id !== t.id));
                  const timer = timersRef.current.get(t.id);
                  if (timer) { clearTimeout(timer); timersRef.current.delete(t.id); }
                }}
                className="ml-2 text-[10px] font-black uppercase tracking-widest text-brand-mint hover:text-brand-mint/80 transition-colors pointer-events-auto"
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
