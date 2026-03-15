import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

interface JourneyCompletionScreenProps {
  sectionTitle: string;
  icon: string;
  stats: { label: string; value: string | number }[];
  onConfirm: () => void;
}

// Suppress unused — icon is part of the interface for future use
export function JourneyCompletionScreen({
  sectionTitle,
  icon,
  stats,
  onConfirm,
}: JourneyCompletionScreenProps) {
  void icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="w-16 h-16 rounded-sm bg-brand-mint/10 border border-brand-mint/30 flex items-center justify-center"
      >
        <Icon name="check_circle" size="lg" className="text-brand-mint" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.5 }}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
          Tudo pronto!
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          {sectionTitle} esta configurado
        </p>
      </motion.div>

      {/* Stats grid */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.7 }}
          className="grid grid-cols-2 gap-3 w-full max-w-sm"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.8 + i * 0.1 }}
              className="bg-header-bg border border-border-panel rounded-sm p-3 text-center"
            >
              <p className="text-lg font-mono font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-secondary mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: 1.0 }}
        onClick={onConfirm}
        className="w-full max-w-sm py-3 bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all"
      >
        Comecar a usar
      </motion.button>
    </div>
  );
}
