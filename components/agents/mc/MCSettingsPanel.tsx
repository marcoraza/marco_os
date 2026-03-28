/**
 * MCSettingsPanel — Sprint 3
 *
 * Config sub-tab in Sistema. Shows gateway connection settings,
 * polling config, and manual reconnect. Env vars are read-only at
 * runtime — user must update .env to change them.
 */
import React, { useState, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { SectionLabel } from '../../ui/SectionLabel';
import { StatusDot } from '../../ui/StatusDot';
import { useMissionControlStore } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (!key || key.length < 8) return key ? '••••••••' : '(nao configurada)';
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 6, 12))}${key.slice(-2)}`;
}

function getEnvValue(key: string): string {
  const env = (import.meta as ImportMeta).env;
  return (env as Record<string, string>)?.[key]?.trim() || '';
}

// ── Config row ────────────────────────────────────────────────────────────────

function ConfigRow({
  label,
  value,
  mono = false,
  dim = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border-panel last:border-b-0">
      <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary shrink-0">{label}</span>
      <span
        className={cn(
          'text-[10px] text-right break-all',
          mono && 'font-mono',
          dim ? 'text-text-secondary' : 'text-text-primary',
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MCSettingsPanel() {
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);
  const setConnectionStatus = useMissionControlStore((s) => s.setConnectionStatus);
  const [checking, setChecking] = useState(false);

  const gatewayUrl = getEnvValue('VITE_MC_API_URL') || 'http://127.0.0.1:3000';
  const apiKey = getEnvValue('VITE_MC_API_KEY');

  const handleReconnect = useCallback(async () => {
    setChecking(true);
    setConnectionStatus('connecting');
    try {
      const ok = await mcApi.healthy();
      setConnectionStatus(ok ? 'connected' : 'error');
    } catch {
      setConnectionStatus('error');
    } finally {
      setChecking(false);
    }
  }, [setConnectionStatus]);

  const statusColor: 'mint' | 'red' | 'orange' | 'blue' = {
    connected:    'mint',
    disconnected: 'red',
    connecting:   'orange',
    error:        'red',
  }[connectionStatus] as 'mint' | 'red' | 'orange' | 'blue';

  const statusLabel = {
    connected:    'Conectado',
    disconnected: 'Desconectado',
    connecting:   'Conectando...',
    error:        'Erro de conexao',
  }[connectionStatus];

  return (
    <div className="p-3 space-y-4">
      {/* Connection status */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <SectionLabel>Conexao</SectionLabel>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <StatusDot color={statusColor} glow={connectionStatus === 'connected'} size="md" />
            <span className="text-xs text-text-primary">{statusLabel}</span>
          </div>
          <button
            onClick={handleReconnect}
            disabled={checking}
            className={cn(
              'flex items-center gap-1 rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1 transition-all',
              'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
              checking
                ? 'bg-surface border border-border-panel text-text-secondary cursor-not-allowed'
                : 'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint hover:bg-brand-mint/20',
            )}
          >
            <Icon name={checking ? 'sync' : 'refresh'} size="xs" className={checking ? 'animate-spin' : ''} />
            {checking ? 'Verificando...' : 'Reconectar'}
          </button>
        </div>
      </div>

      {/* Gateway config */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <SectionLabel>Gateway</SectionLabel>
        <div className="mt-2">
          <ConfigRow label="URL" value={gatewayUrl} mono />
          <ConfigRow label="API Key" value={maskKey(apiKey)} mono dim={!apiKey} />
          <ConfigRow label="Timeout" value="15s" mono />
        </div>
        <p className="text-[8px] text-text-secondary mt-2">
          Configure via{' '}
          <span className="font-mono text-text-primary">.env</span>
          {' '}usando{' '}
          <span className="font-mono text-text-primary">VITE_MC_API_URL</span>
          {' '}e{' '}
          <span className="font-mono text-text-primary">VITE_MC_API_KEY</span>.
        </p>
      </div>

      {/* Polling config */}
      <div className="bg-surface border border-border-panel rounded-sm p-3">
        <SectionLabel>Polling</SectionLabel>
        <div className="mt-2">
          <ConfigRow label="Agentes" value="30s" mono />
          <ConfigRow label="Tarefas" value="15s" mono />
          <ConfigRow label="Atividade" value="20s" mono />
          <ConfigRow label="Logs" value="5s" mono />
          <ConfigRow label="Tokens" value="60s" mono />
          <ConfigRow label="Sessoes" value="30s" mono />
        </div>
        <p className="text-[8px] text-text-secondary mt-2">
          Polling pausado automaticamente quando a aba esta em segundo plano.
          Backoff 3x aplicado em caso de erro.
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-surface border border-accent-red/20 rounded-sm p-3">
        <SectionLabel>Zona de risco</SectionLabel>
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] text-text-primary">Limpar dados locais</p>
              <p className="text-[8px] text-text-secondary">Remove cache e dados mock do store</p>
            </div>
            <button
              onClick={() => {
                useMissionControlStore.getState().setAgents([]);
                useMissionControlStore.getState().setTasks([]);
                useMissionControlStore.getState().setActivities([]);
                useMissionControlStore.getState().setLogs([]);
              }}
              className="flex items-center gap-1 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-sm text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-accent-red/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none"
            >
              <Icon name="delete_sweep" size="xs" />
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
