const TZ = 'America/Sao_Paulo';

export function formatRelative(date: string | Date): string {
  const now = Date.now();
  const d = new Date(date).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TZ });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: TZ,
  });
}

export function getDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Alias for formatRelative — used by newer components */
export const formatRelativeTime = formatRelative;

export function groupByWeek<T>(items: T[], getDate: (item: T) => Date): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  items.forEach(item => {
    const d = getDate(item);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = getDayKey(weekStart);
    const arr = groups.get(key) ?? [];
    arr.push(item);
    groups.set(key, arr);
  });
  return groups;
}
