import React from 'react';
import { cn } from '@/utils/cn';

interface HeatmapGridProps {
  data: Record<string, 0 | 1 | 2 | 3 | 4>;
  weeks?: number;
  onDayClick?: (date: string, value: number) => void;
  streakLabel?: string;
}

const intensityClass: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-border-panel/40',
  1: 'bg-brand-mint/10',
  2: 'bg-brand-mint/30',
  3: 'bg-brand-mint/50',
  4: 'bg-brand-mint',
};

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildGrid(weeks: number): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // End on the last day of the current week (Saturday)
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  // Start: go back (weeks * 7 - 1) days from endDate
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (weeks * 7 - 1));

  const grid: Date[][] = Array.from({ length: 7 }, () => []);

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const dayOfWeek = cursor.getDay(); // 0 = Sun
    grid[dayOfWeek].push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return grid;
}

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export function HeatmapGrid({ data, weeks = 13, onDayClick, streakLabel }: HeatmapGridProps) {
  const grid = buildGrid(weeks);

  // Collect week column dates (Sundays of each week)
  const sundays = grid[0];

  // Month labels: detect month changes across columns
  const monthLabels: Array<{ col: number; label: string }> = [];
  let lastMonth = -1;
  sundays.forEach((date, col) => {
    const m = date.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        col,
        label: date.toLocaleDateString('pt-BR', { month: 'short' }),
      });
      lastMonth = m;
    }
  });

  return (
    <div className="flex flex-col gap-1">
      {/* Month labels row */}
      <div className="flex gap-[2px] ml-8">
        {sundays.map((_, col) => {
          const ml = monthLabels.find(m => m.col === col);
          return (
            <div key={col} className="w-[10px] text-[7px] text-text-secondary font-mono" style={{ width: 10 }}>
              {ml ? ml.label.replace('.', '') : ''}
            </div>
          );
        })}
      </div>

      {/* Grid rows: one per day of week */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px]">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="w-7 text-[7px] text-text-secondary text-right pr-1 leading-[10px]">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>

        {/* Columns (weeks) */}
        <div className="flex gap-[2px]">
          {sundays.map((_, col) => (
            <div key={col} className="flex flex-col gap-[2px]">
              {grid.map((row, dayIdx) => {
                const date = row[col];
                if (!date) {
                  return <div key={dayIdx} className="w-[10px] h-[10px]" />;
                }
                const key = getDateKey(date);
                const value = (data[key] ?? 0) as 0 | 1 | 2 | 3 | 4;
                const label = `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}: ${value} atividades`;

                return (
                  <button
                    key={dayIdx}
                    onClick={() => onDayClick?.(key, value)}
                    aria-label={label}
                    className={cn(
                      'w-[10px] h-[10px] rounded-[1px] transition-opacity hover:opacity-80',
                      'focus-visible:ring-1 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                      intensityClass[value]
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 ml-8 mt-1">
        {streakLabel && (
          <span className="text-[8px] font-mono text-text-secondary mr-2">{streakLabel}</span>
        )}
        <span className="text-[7px] text-text-secondary">menos</span>
        {([0, 1, 2, 3, 4] as const).map(v => (
          <span
            key={v}
            className={cn('w-[8px] h-[8px] rounded-[1px] inline-block', intensityClass[v])}
          />
        ))}
        <span className="text-[7px] text-text-secondary">mais</span>
      </div>
    </div>
  );
}
