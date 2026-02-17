/**
 * OpenClaw Gateway Client
 * Endpoint: POST /tools/invoke
 * Token: VITE_OPENCLAW_TOKEN (gateway.auth.token)
 */

const GATEWAY_URL = (import.meta.env.VITE_OPENCLAW_URL || 'http://127.0.0.1:18789').replace(/\/$/, '');
const GATEWAY_TOKEN = import.meta.env.VITE_OPENCLAW_TOKEN || '';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OpenClawMessage {
  role: string;
  content: Array<{ type: string; text?: string }> | string;
  timestamp: number;
  usage?: { totalTokens: number };
}

export interface OpenClawSession {
  key: string;
  kind: string;
  channel: string;
  displayName: string;
  label?: string;
  model: string;
  updatedAt: number;
  sessionId: string;
  totalTokens?: number;
  messages?: OpenClawMessage[];
}

interface ToolsInvokeResponse {
  ok: boolean;
  result?: {
    content: Array<{ type: string; text: string }>;
  };
  details?: any;
  error?: { message: string };
}

// ── HTTP Client ───────────────────────────────────────────────────────────────

async function invokeTooll(tool: string, args: Record<string, any> = {}): Promise<any> {
  const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tool, args }),
  });

  if (!res.ok) throw new Error(`OpenClaw API error: ${res.status}`);

  const data: ToolsInvokeResponse = await res.json();

  if (!data.ok) throw new Error(data.error?.message || 'Tool invocation failed');

  // result.content[0].text contém o JSON como string
  if (data.result?.content?.[0]?.text) {
    return JSON.parse(data.result.content[0].text);
  }

  // Alguns tools retornam direto em details
  return data.details ?? data;
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export async function listSessions(limit = 20, messageLimit = 2): Promise<OpenClawSession[]> {
  const data = await invokeTooll('sessions_list', { limit, messageLimit });
  return data.sessions ?? [];
}

// ── Singleton refresher ────────────────────────────────────────────────────────

let loggedOffline = false;

export async function fetchSessionsSafe(limit = 20): Promise<OpenClawSession[] | null> {
  try {
    const sessions = await listSessions(limit, 2);
    loggedOffline = false;
    return sessions;
  } catch {
    if (!loggedOffline) {
      console.info('[openclaw] Gateway offline — usando mock data. Tentando novamente silenciosamente...');
      loggedOffline = true;
    }
    return null;
  }
}
