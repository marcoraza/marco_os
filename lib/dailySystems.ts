import type { StoredFinanceEntry, StoredHealthEntry } from '../data/models';

export function summarizeFinanceMonth(entries: StoredFinanceEntry[], monthKey: string) {
  const monthEntries = entries.filter((entry) => entry.data.startsWith(monthKey));
  const income = monthEntries.filter((entry) => entry.tipo === 'entrada').reduce((sum, entry) => sum + entry.valor, 0);
  const expenses = monthEntries.filter((entry) => entry.tipo === 'saida').reduce((sum, entry) => sum + entry.valor, 0);
  return {
    income,
    expenses,
    balance: income - expenses,
  };
}

export function getUpcomingFinanceEntries(entries: StoredFinanceEntry[], fromDate: string, daysAhead = 14) {
  const start = new Date(fromDate);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);
  return entries
    .filter((entry) => entry.tipo === 'saida')
    .filter((entry) => {
      const date = new Date(entry.data);
      return date >= start && date <= end;
    })
    .sort((left, right) => left.data.localeCompare(right.data));
}

export function calculateHealthCheckinStreak(entries: StoredHealthEntry[]): number {
  const checkins = entries
    .filter((entry) => entry.name === 'Check-in diario')
    .map((entry) => entry.data)
    .sort((left, right) => right.localeCompare(left));

  if (checkins.length === 0) return 0;

  let streak = 0;
  const current = new Date(checkins[0]);
  for (const dateKey of checkins) {
    const date = new Date(dateKey);
    if (date.toISOString().slice(0, 10) !== current.toISOString().slice(0, 10)) break;
    streak += 1;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

export function summarizeWeeklyHealth(entries: StoredHealthEntry[], todayKey: string) {
  const end = new Date(todayKey);
  const start = new Date(todayKey);
  start.setDate(start.getDate() - 6);

  const weekEntries = entries.filter((entry) => {
    const date = new Date(entry.data);
    return date >= start && date <= end && entry.name === 'Check-in diario';
  });

  const averageMood = weekEntries.length > 0
    ? Math.round(weekEntries.reduce((sum, entry) => sum + (entry.valor ?? 0), 0) / weekEntries.length)
    : 0;

  return {
    totalCheckins: weekEntries.length,
    averageMood,
  };
}
