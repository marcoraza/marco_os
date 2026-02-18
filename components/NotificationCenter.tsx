import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, SectionLabel } from './ui';
import { cn } from '../utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NotificationCategory = 'agent' | 'task' | 'crm' | 'finance' | 'system';

export interface Notification {
  id: string;
  title: string;
  body: string;
  icon: string;
  time: string;          // ISO string
  read: boolean;
  category: NotificationCategory;
}

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-seed-1',
    title: 'Agent completou missao',
    body: 'O agente Cleo finalizou a missao de auditoria financeira com sucesso.',
    icon: 'smart_toy',
    time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    read: false,
    category: 'agent',
  },
  {
    id: 'n-seed-2',
    title: 'Tarefa com prazo expirando',
    body: 'A tarefa "Revisar proposta comercial" vence em 2 horas.',
    icon: 'schedule',
    time: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    read: false,
    category: 'task',
  },
  {
    id: 'n-seed-3',
    title: 'Nova nota criada',
    body: 'Nota "Ideias Sprint Q2" foi adicionada ao painel de notas.',
    icon: 'note_add',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    category: 'system',
  },
  {
    id: 'n-seed-4',
    title: 'Backup automatico realizado',
    body: 'Backup diario concluido. Todos os dados foram salvos com sucesso.',
    icon: 'backup',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
    category: 'system',
  },
  {
    id: 'n-seed-5',
    title: 'Reconexao pendente (CRM)',
    body: 'A integracao com o CRM perdeu conexao. Reconecte para sincronizar dados.',
    icon: 'sync_problem',
    time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    read: false,
    category: 'crm',
  },
  {
    id: 'n-seed-6',
    title: 'Meta de otimizacao atingida',
    body: 'O objetivo de reducao de custos em 15% foi atingido este mes.',
    icon: 'trending_up',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    category: 'finance',
  },
];

const STORAGE_KEY = 'marco-os-notifications';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function loadNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Notification[];
  } catch { /* ignore */ }
  return SEED_NOTIFICATIONS;
}

function saveNotifications(items: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  agent: 'text-brand-mint',
  task: 'text-accent-blue',
  crm: 'text-accent-purple',
  finance: 'text-accent-orange',
  system: 'text-text-secondary',
};

/* ------------------------------------------------------------------ */
/*  useNotifications hook                                              */
/* ------------------------------------------------------------------ */

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);

  // Persist whenever list changes
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'read'>) => {
    const item: Notification = {
      ...n,
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, addNotification, clearAll };
}

/* ------------------------------------------------------------------ */
/*  NotificationBell                                                   */
/* ------------------------------------------------------------------ */

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-md hover:bg-surface-hover transition-colors"
        aria-label="Notificacoes"
      >
        <Icon name="notifications" size="md" className="text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-accent-red text-white text-[8px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-full mt-2 z-50',
              'bg-surface border border-border-panel rounded-md shadow-2xl',
              'w-[calc(100vw-2rem)] sm:w-96',
              'max-h-[70vh] sm:max-h-[500px]',
              'flex flex-col overflow-hidden',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-panel">
              <SectionLabel icon="notifications">Notificacoes</SectionLabel>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[9px] font-bold uppercase tracking-wider text-brand-mint hover:text-brand-mint/80 transition-colors"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[9px] font-bold uppercase tracking-wider text-text-secondary hover:text-accent-red transition-colors"
                    aria-label="Limpar todas"
                  >
                    <Icon name="delete_sweep" size="sm" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-text-secondary gap-2">
                  <Icon name="notifications_off" size="lg" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Nenhuma notificacao
                  </span>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      'w-full text-left flex items-start gap-3 px-4 py-3',
                      'hover:bg-surface-hover transition-colors',
                      !n.read && 'border-l-2 border-l-brand-mint',
                      n.read && 'border-l-2 border-l-transparent opacity-60',
                    )}
                  >
                    {/* Icon */}
                    <span
                      className={cn(
                        'mt-0.5 shrink-0',
                        CATEGORY_COLORS[n.category],
                      )}
                    >
                      <Icon name={n.icon} size="sm" />
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'text-[11px] font-bold truncate',
                            n.read ? 'text-text-secondary' : 'text-text-primary',
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="text-[9px] text-text-secondary shrink-0">
                          {timeAgo(n.time)}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary leading-relaxed mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-brand-mint" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
