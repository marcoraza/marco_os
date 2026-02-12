import React from 'react';
import { cn } from '../../utils/cn';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  accentColor?: 'mint' | 'orange' | 'purple' | 'blue';
  className?: string;
}

const accentStyles = {
  mint: {
    active: 'border-brand-mint text-brand-mint',
    inactive: 'border-transparent text-text-secondary hover:text-text-primary'
  },
  orange: {
    active: 'border-accent-orange text-accent-orange',
    inactive: 'border-transparent text-text-secondary hover:text-text-primary'
  },
  purple: {
    active: 'border-accent-purple text-accent-purple',
    inactive: 'border-transparent text-text-secondary hover:text-text-primary'
  },
  blue: {
    active: 'border-accent-blue text-accent-blue',
    inactive: 'border-transparent text-text-secondary hover:text-text-primary'
  },
};

export function TabNav({ tabs, activeTab, onTabChange, accentColor = 'mint', className }: TabNavProps) {
  const styles = accentStyles[accentColor];

  return (
    <div className={cn('border-b border-border-panel shrink-0', className)}>
      <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 outline-none',
              activeTab === tab.id ? styles.active : styles.inactive
            )}
          >
            {tab.icon && <span className="material-symbols-outlined text-base">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}