// components/dashboard/CalendarWidget.tsx
// Shows upcoming calendar events from Supabase/NotionDataContext.
import React from 'react';
import { Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { useSupabaseData } from '../../contexts/SupabaseDataContext';
import type { CalendarEvent } from '../../lib/dataProvider';

function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function calcDuration(start: string, end: string): string {
  if (!start || !end) return '';
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms <= 0) return '';
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h${m}min` : `${h}h`;
}

interface CalendarWidgetProps {
  onConnectCalendar?: () => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onConnectCalendar }) => {
  const { calendar } = useSupabaseData();
  const events: CalendarEvent[] = calendar.items;

  // Sort by start date, filter future + today, take next 5
  const now = new Date();
  const upcoming = [...events]
    .filter(e => {
      if (!e.start) return false;
      const d = new Date(e.start);
      return !isNaN(d.getTime()) && d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  const hasData = events.length > 0;

  return (
    <div className="bg-surface border border-border-panel rounded-sm p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SectionLabel icon="calendar_today">AGENDA</SectionLabel>
        {hasData && (
          <span className="text-[9px] font-mono text-text-secondary">
            {events.length} evento{events.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!hasData && !calendar.isLoading && (
        <div className="flex flex-col items-center gap-2 py-4">
          <Icon name="calendar_today" size="lg" className="text-text-secondary/40" />
          <p className="text-[10px] text-text-secondary text-center">Nenhum evento encontrado</p>
          <button
            onClick={onConnectCalendar}
            className="px-3 py-1.5 rounded-sm bg-brand-mint/10 border border-brand-mint/30 text-brand-mint text-[9px] font-bold uppercase tracking-widest hover:bg-brand-mint/20 transition-all"
          >
            Conectar Google Calendar
          </button>
        </div>
      )}

      {calendar.isLoading && (
        <div className="flex items-center gap-2 py-3 text-text-secondary">
          <Icon name="hourglass_empty" size="xs" className="animate-spin" />
          <span className="text-[10px]">Carregando agenda...</span>
        </div>
      )}

      {hasData && (
        <div
          className="flex flex-col gap-1.5 overflow-y-auto"
          style={{ maxHeight: '200px' }}
        >
          {upcoming.length === 0 ? (
            <p className="text-[10px] text-text-secondary py-2">Sem eventos proximos</p>
          ) : (
            upcoming.map(event => {
              const today = isToday(event.start);
              const duration = calcDuration(event.start, event.end);
              return (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-start gap-2 px-2 py-1.5 rounded-sm border border-transparent',
                    today
                      ? 'border-l-2 border-l-brand-mint bg-brand-mint/5'
                      : 'bg-bg-base'
                  )}
                >
                  <div className="flex-grow min-w-0">
                    <p className="text-[11px] text-text-primary font-medium truncate leading-tight">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-mono text-text-secondary">
                        {formatDateTime(event.start)}
                      </span>
                      {duration && (
                        <span className="text-[8px] font-mono text-text-secondary/60">
                          {duration}
                        </span>
                      )}
                    </div>
                  </div>
                  {today && (
                    <span className="shrink-0 text-[8px] font-bold text-brand-mint uppercase tracking-wide mt-0.5">
                      Hoje
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
