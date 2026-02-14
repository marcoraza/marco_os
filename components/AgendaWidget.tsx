import React, { useState } from 'react';
import type { StoredEvent } from '../data/models';
import { Icon, Card, SectionLabel } from './ui';

interface AgendaWidgetProps {
  events: StoredEvent[];
  setEvents: React.Dispatch<React.SetStateAction<StoredEvent[]>>;
  activeProjectId: string;
}

const AgendaWidget: React.FC<AgendaWidgetProps> = ({ events, setEvents, activeProjectId }) => {
  const [quickInput, setQuickInput] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  const todayEvents = events
    .filter(e => e.date === today)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !quickInput.trim()) return;
    const input = quickInput.trim();
    // Parse "HH:MM título"
    const match = input.match(/^(\d{1,2}):(\d{2})\s+(.+)$/);
    const now = new Date().toISOString();
    const id = crypto?.randomUUID?.() ?? `event-${Date.now()}`;

    if (match) {
      const time = `${match[1].padStart(2, '0')}:${match[2]}`;
      const title = match[3];
      setEvents(prev => [...prev, { id, title, date: today, time, createdAt: now, updatedAt: now, projectId: activeProjectId }]);
    } else {
      setEvents(prev => [...prev, { id, title: input, date: today, createdAt: now, updatedAt: now, projectId: activeProjectId }]);
    }
    setQuickInput('');
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="calendar_today" size="lg" className="text-accent-blue" />
          <SectionLabel className="text-[11px] text-text-primary tracking-[0.1em]">Agenda de Hoje</SectionLabel>
        </div>
        <span className="text-[9px] font-bold text-text-secondary bg-surface px-2 py-0.5 rounded-sm border border-border-panel">
          {todayEvents.length} evento{todayEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Quick add */}
      <div className="relative">
        <Icon name="add" size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue" />
        <input
          type="text"
          value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          onKeyDown={handleQuickAdd}
          placeholder='14:30 Reunião de equipe'
          className="w-full bg-bg-base border border-border-panel rounded-md pl-9 pr-3 py-2 text-[11px] text-text-primary focus:outline-none focus:border-accent-blue/50 transition-colors placeholder:text-text-secondary/40"
        />
      </div>

      {/* Events list */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {todayEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <Icon name="event_available" size="lg" className="text-text-secondary/25 mb-2" />
            <p className="text-[10px] font-bold text-text-secondary/35 uppercase tracking-widest">Dia livre</p>
            <p className="text-[8px] text-text-secondary/25 mt-1">Use "HH:MM título" para criar</p>
          </div>
        )}
        {todayEvents.map(ev => (
          <Card key={ev.id} className="p-3 flex items-center gap-3 group">
            {ev.time ? (
              <span className="text-[11px] font-mono font-bold text-accent-blue shrink-0 w-12">{ev.time}</span>
            ) : (
              <span className="text-[11px] font-mono font-bold text-text-secondary/50 shrink-0 w-12">—</span>
            )}
            <span className="text-[11px] text-text-primary flex-1 truncate">{ev.title}</span>
            <button
              onClick={() => deleteEvent(ev.id)}
              className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-accent-red transition-all shrink-0"
            >
              <Icon name="close" size="sm" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgendaWidget;
