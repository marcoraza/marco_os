import React, { useState } from 'react';
import TasksBoard from './TasksBoard';
import ContentPipeline from './ContentPipeline';
import MemoryScreen from './MemoryScreen';
import TeamScreen from './TeamScreen';
import { Icon } from '../ui';

type MissionControlScreen = 'dashboard' | 'tasks' | 'content' | 'memory' | 'team';

type MissionControlProps = {
  setCurrentView: (view: string) => void;
};

const cards: Array<{
  id: Exclude<MissionControlScreen, 'dashboard'>;
  title: string;
  description: string;
  icon: string;
}> = [
  { id: 'tasks', title: 'Tasks Board', description: 'Track execution across Todo, In Progress, and Done.', icon: 'view_kanban' },
  { id: 'content', title: 'Content Pipeline', description: 'Move content from idea to published.', icon: 'movie' },
  { id: 'memory', title: 'Memory', description: 'Search and review mission-critical context.', icon: 'memory' },
  { id: 'team', title: 'Team', description: 'Monitor agent roles and live status.', icon: 'groups' },
];

const MissionControl: React.FC<MissionControlProps> = ({ setCurrentView }) => {
  const [screen, setScreen] = useState<MissionControlScreen>('dashboard');

  if (screen === 'tasks') {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => setScreen('dashboard')}
          className="mb-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-brand-mint transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          Back
        </button>
        <TasksBoard />
      </div>
    );
  }

  if (screen === 'content') {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => setScreen('dashboard')}
          className="mb-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-brand-mint transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          Back
        </button>
        <ContentPipeline />
      </div>
    );
  }

  if (screen === 'memory') {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => setScreen('dashboard')}
          className="mb-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-brand-mint transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          Back
        </button>
        <MemoryScreen />
      </div>
    );
  }

  if (screen === 'team') {
    return (
      <div className="p-6 md:p-8">
        <button
          onClick={() => setScreen('dashboard')}
          className="mb-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-brand-mint transition-colors"
        >
          <Icon name="arrow_back" size="sm" />
          Back
        </button>
        <TeamScreen />
      </div>
    );
  }

  return (
    <div className="h-full bg-bg-base text-text-primary p-6 md:p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide">Mission Control</h1>
          <p className="text-sm text-text-secondary mt-2">Operational command center for execution, content, memory, and team state.</p>
        </div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-1 px-3 py-2 border border-border-panel bg-surface rounded-sm text-[10px] font-black uppercase tracking-wider text-text-secondary hover:text-brand-mint hover:border-brand-mint/30 transition-colors"
        >
          <Icon name="home" size="sm" />
          Central
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setScreen(card.id)}
            className="text-left p-5 bg-surface border border-border-panel rounded-md hover:border-brand-mint/40 hover:bg-surface-hover transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="size-10 rounded-sm bg-brand-mint/10 text-brand-mint border border-brand-mint/20 flex items-center justify-center">
                <Icon name={card.icon} size="md" />
              </span>
              <Icon name="arrow_forward" size="sm" className="text-text-secondary" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-wide">{card.title}</h2>
            <p className="text-sm text-text-secondary mt-2">{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MissionControl;
