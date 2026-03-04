import React from 'react';
import { Icon } from './Icon';
import { SectionJourney } from './SectionJourney';
import type { JourneyConfig } from '../../lib/journeyTypes';

interface JourneyOverlayProps {
  config: JourneyConfig;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function JourneyOverlay({ config, isOpen, onClose, onComplete }: JourneyOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-stretch bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex-1 flex flex-col bg-bg-base overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-text-secondary hover:text-text-primary rounded-sm border border-border-panel bg-surface hover:bg-surface-hover transition-colors"
          title="Fechar"
        >
          <Icon name="close" size="sm" />
        </button>

        <SectionJourney
          config={config}
          onComplete={() => {
            onComplete();
            onClose();
          }}
          onSkip={onClose}
        />
      </div>
    </div>
  );
}
