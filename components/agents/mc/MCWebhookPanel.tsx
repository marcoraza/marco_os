/**
 * MCWebhookPanel
 *
 * Webhook management table for the agent section.
 * Lists all configured webhooks with status, endpoint, events, and last trigger info.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Types ────────────────────────────────────────────────────────────────────

interface Webhook {
  id: number;
  url: string;
  events: string[];
  active: boolean;
  created_at: number;
  last_triggered?: number;
  last_status?: number;
  failure_count?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30_000;
const SKELETON_ROWS = 3;

// ── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(ts: number | undefined): string {
  if (!ts) return '--';
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'agora';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  return `${Math.floor(diff / 86_400_000)}d`;
}

function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;
  // Remove protocol for display
  const clean = url.replace(/^https?:\/\//, '');
  if (clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen - 3) + '...';
}

function isHealthy(status?: number): boolean {
  if (!status) return false;
  return status >= 200 && status < 300;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {/* Header skeleton */}
      <div className="bg-border-panel animate-pulse rounded-sm h-8" />
      {/* Row skeletons */}
      {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
        <div key={i} className="bg-border-panel animate-pulse rounded-sm h-10" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <span className="material-symbols-outlined text-[32px] text-text-secondary opacity-40">
        webhook
      </span>
      <p className="text-text-secondary text-xs text-center">Nenhum webhook configurado</p>
    </div>
  );
}

function EventBadge({ event }: { event: string }) {
  return (
    <span className="text-[7px] font-bold uppercase tracking-widest bg-surface border border-border-panel px-2 py-0.5 rounded-sm text-text-secondary whitespace-nowrap">
      {event}
    </span>
  );
}

function StatusDot({ active, lastStatus }: { active: boolean; lastStatus?: number }) {
  const healthy = isHealthy(lastStatus);

  if (!active) {
    return (
      <span className="flex items-center justify-center" title="Inativo">
        <span className="w-2 h-2 rounded-full bg-text-secondary" />
      </span>
    );
  }

  return (
    <span
      className="flex items-center justify-center"
      title={healthy ? 'Ativo' : 'Falha'}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          healthy ? 'bg-brand-mint' : 'bg-accent-red',
        )}
      />
    </span>
  );
}

// ── Table header cell ────────────────────────────────────────────────────────

const TH_CLASS = 'text-[8px] font-bold uppercase tracking-widest text-text-secondary text-left py-1.5 px-2';

// ── Main component ───────────────────────────────────────────────────────────

export function MCWebhookPanel() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await mcApi.get<Webhook[] | { data: Webhook[] }>('/api/webhooks');
      const list = Array.isArray(res) ? res : (res as { data: Webhook[] }).data ?? [];
      setWebhooks(list);
    } catch {
      // Silently fail; polling will retry
    } finally {
      setLoading(false);
    }
  }, []);

  useMCPoll(fetchWebhooks, POLL_INTERVAL_MS, { backoff: true });

  // ── Render ─────────────────────────────────────────────────────────────────

  // Loading
  if (loading && webhooks.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Webhooks
        </span>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty
  if (webhooks.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Webhooks
        </span>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Section label */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase tracking-widest text-text-secondary">
          Webhooks
        </span>
        <span className="text-[8px] font-mono text-text-secondary">
          {webhooks.filter((w) => w.active).length}/{webhooks.length} ativos
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-panel rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-panel">
              <th className={cn(TH_CLASS, 'w-8')}>Status</th>
              <th className={TH_CLASS}>Endpoint</th>
              <th className={TH_CLASS}>Eventos</th>
              <th className={cn(TH_CLASS, 'text-right')}>Ultimo</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((wh) => {
              const healthy = isHealthy(wh.last_status);
              const hasFailures = (wh.failure_count ?? 0) > 0;

              return (
                <tr
                  key={wh.id}
                  className="border-b border-border-panel last:border-b-0 hover:bg-surface-hover transition-all duration-300 ease-out"
                >
                  {/* Status dot */}
                  <td className="px-2 py-2">
                    <StatusDot active={wh.active} lastStatus={wh.last_status} />
                  </td>

                  {/* Endpoint */}
                  <td className="px-2 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[9px] font-mono text-text-primary truncate max-w-[220px] block"
                        title={wh.url}
                      >
                        {truncateUrl(wh.url)}
                      </span>
                      {hasFailures && (
                        <span className="text-[8px] text-accent-red font-mono">
                          {wh.failure_count} falha{(wh.failure_count ?? 0) > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Events */}
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.slice(0, 3).map((ev) => (
                        <EventBadge key={ev} event={ev} />
                      ))}
                      {wh.events.length > 3 && (
                        <span className="text-[7px] font-mono text-text-secondary">
                          +{wh.events.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Last triggered */}
                  <td className="px-2 py-2 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[9px] font-mono text-text-secondary">
                        {relativeTime(wh.last_triggered)}
                      </span>
                      {wh.last_status != null && (
                        <span
                          className={cn(
                            'text-[7px] font-mono',
                            healthy ? 'text-brand-mint' : 'text-accent-red',
                          )}
                        >
                          {wh.last_status}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
