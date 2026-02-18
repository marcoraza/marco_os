import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Icon } from './Icon';

interface ToastItem {
  id: number;
  message: string;
}

let toastIdCounter = 0;
let globalShowToast: ((message: string) => void) | null = null;

export function showToast(message: string) {
  globalShowToast?.(message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((message: string) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-2), { id, message }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timersRef.current.delete(id);
    }, 2000);
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
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md',
              'bg-surface border border-brand-mint/30 shadow-lg'
            )}
          >
            <Icon name="check_circle" size="sm" className="text-brand-mint" />
            <span className="text-[11px] font-bold text-text-primary">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
