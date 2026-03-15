import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface FullscreenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function FullscreenOverlay({ isOpen, onClose, children, className }: FullscreenOverlayProps) {
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
    } else {
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn('fixed inset-0 z-50 bg-bg-base', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
