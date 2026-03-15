import React from 'react';
import { Icon } from './Icon';

interface JourneyTriggerButtonProps {
  isConfigured: boolean;
  onClick: () => void;
  className?: string;
}

export function JourneyTriggerButton({ isConfigured, onClick, className = '' }: JourneyTriggerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-text-secondary hover:text-brand-mint border border-border-panel rounded-sm px-3 py-1.5 transition-colors hover:border-brand-mint/50 ${className}`}
    >
      <Icon name={isConfigured ? 'refresh' : 'tune'} size="xs" />
      {isConfigured ? 'Reconfigurar' : 'Configurar'}
    </button>
  );
}
