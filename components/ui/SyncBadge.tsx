import React, { useState, useEffect } from 'react';

interface SyncBadgeProps {
  lastSync: string | null;
  isLoading?: boolean;
  className?: string;
}

export function SyncBadge({ lastSync, isLoading, className = '' }: SyncBadgeProps) {
  // Tick every 30s to update relative time display
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);
  if (isLoading) {
    return (
      <span className="text-[8px] font-mono text-text-secondary animate-pulse">
        Sincronizando...
      </span>
    );
  }

  if (!lastSync) {
    return (
      <span className="text-[8px] font-mono text-accent-orange">
        Sem dados
      </span>
    );
  }

  const diff = Date.now() - new Date(lastSync).getTime();
  const minutes = Math.floor(diff / 60000);
  
  let label: string;
  let stale = false;
  
  if (minutes < 1) label = 'Agora mesmo';
  else if (minutes < 60) label = `Ha ${minutes}min`;
  else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    label = `Ha ${hours}h`;
    stale = hours > 1;
  } else {
    const days = Math.floor(minutes / 1440);
    label = `Ha ${days}d`;
    stale = true;
  }

  return (
    <span
      className={`text-[8px] font-mono ${stale ? 'text-accent-orange' : 'text-text-secondary'} ${className}`}
      title={lastSync ?? 'Nunca sincronizado'}
    >
      Sincronizado {label.toLowerCase()}
    </span>
  );
}
