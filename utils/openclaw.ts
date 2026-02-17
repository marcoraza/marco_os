/**
 * OpenClaw Gateway Client
 * Conecta no Gateway local via HTTP + WebSocket
 */

const GATEWAY_URL = import.meta.env.VITE_OPENCLAW_URL || 'http://127.0.0.1:18789';
const GATEWAY_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';
const WS_URL = GATEWAY_URL.replace('http', 'ws');

// ── Types ────────────────────────────────────────────────────────────────────

export interface OpenClawSession {
  key: string;
  kind: string;
  channel: string;
  displayName: string;
  model: string;
  updatedAt: number;
  sessionId: string;
  totalTokens?: number;
  lastTo?: string;
  messages?: Array<{
    role: string;
    content: any;
    timestamp: number;
    usage?: { totalTokens: number };
  }>;
}

export interface OpenClawSessionsResponse {
  count: number;
  sessions: OpenClawSession[];
}

// ── HTTP Client ──────────────────────────────────────────────────────────────

async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
  });
  if (!res.ok) throw new Error(`OpenClaw API error: ${res.status} ${path}`);
  return res.json();
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export async function listSessions(limit = 50): Promise<OpenClawSession[]> {
  const data = await httpGet<OpenClawSessionsResponse>(
    `/api/sessions/list?limit=${limit}&messageLimit=3`
  );
  return data.sessions ?? [];
}

export async function getSession(sessionKey: string): Promise<OpenClawSession> {
  return httpGet<OpenClawSession>(
    `/api/sessions/${encodeURIComponent(sessionKey)}`
  );
}

export async function spawnAgent(task: string, model?: string): Promise<{ sessionKey: string }> {
  const res = await fetch(`${GATEWAY_URL}/api/sessions/spawn`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ task, model, cleanup: 'keep' }),
  });
  if (!res.ok) throw new Error(`Spawn failed: ${res.status}`);
  return res.json();
}

export async function sendToSession(sessionKey: string, message: string): Promise<void> {
  const res = await fetch(`${GATEWAY_URL}/api/sessions/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionKey, message }),
  });
  if (!res.ok) throw new Error(`Send failed: ${res.status}`);
}

// ── WebSocket ─────────────────────────────────────────────────────────────────

type WSHandler = (sessions: OpenClawSession[]) => void;

let ws: WebSocket | null = null;
let wsConnected = false;
let wsLoggedOnce = false;

export function connectWebSocket(onUpdate: WSHandler, onStatusChange: (connected: boolean) => void): () => void {
  let retryTimeout: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  function connect() {
    if (destroyed) return;

    try {
      ws = new WebSocket(`${WS_URL}/?token=${GATEWAY_TOKEN}`);

      ws.onopen = () => {
        wsConnected = true;
        wsLoggedOnce = false;
        onStatusChange(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.sessions) onUpdate(data.sessions);
        } catch {}
      };

      ws.onerror = () => {
        if (!wsLoggedOnce) {
          console.info('[openclaw] Gateway offline — using mock data. Retrying silently…');
          wsLoggedOnce = true;
        }
      };

      ws.onclose = () => {
        wsConnected = false;
        onStatusChange(false);
        if (!destroyed) {
          retryTimeout = setTimeout(connect, 5000);
        }
      };
    } catch {
      if (!wsLoggedOnce) {
        console.info('[openclaw] Gateway offline — using mock data. Retrying silently…');
        wsLoggedOnce = true;
      }
      retryTimeout = setTimeout(connect, 5000);
    }
  }

  connect();

  // Cleanup fn
  return () => {
    destroyed = true;
    if (retryTimeout) clearTimeout(retryTimeout);
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  };
}

export function isConnected() {
  return wsConnected;
}
