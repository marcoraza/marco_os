/**
 * MC Service API client.
 *
 * All agent-section data flows through this module.
 * The MC service (mission-control Next.js) runs as a headless backend
 * and exposes /api/* routes consumed by the V1 SPA.
 */

const DEFAULT_MC_URL = 'http://127.0.0.1:3000';
const DEFAULT_TIMEOUT_MS = 15_000;

function getBaseUrl(): string {
  const env = (import.meta as ImportMeta).env;
  const raw = env?.VITE_MC_API_URL?.trim();
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    return raw.replace(/\/+$/, '');
  }
  return DEFAULT_MC_URL;
}

function getApiKey(): string {
  const env = (import.meta as ImportMeta).env;
  return env?.VITE_MC_API_KEY?.trim() || '';
}

export interface MCApiError {
  status: number;
  statusText: string;
  body: unknown;
  url: string;
}

function isMCApiError(err: unknown): err is MCApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'url' in err;
}

async function mcFetch<T = unknown>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

  const url = `${getBaseUrl()}${path}`;
  const apiKey = getApiKey();

  const headers = new Headers(fetchOptions.headers);
  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const error: MCApiError = {
        status: response.status,
        statusText: response.statusText,
        body: tryParseJson(body),
        url,
      };
      throw error;
    }

    const text = await response.text();
    return tryParseJson(text) as T;
  } finally {
    clearTimeout(timer);
  }
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const mcApi = {
  get: <T = unknown>(path: string, opts?: RequestInit & { timeoutMs?: number }) =>
    mcFetch<T>(path, { ...opts, method: 'GET' }),

  post: <T = unknown>(path: string, body?: unknown, opts?: RequestInit & { timeoutMs?: number }) =>
    mcFetch<T>(path, { ...opts, method: 'POST', body: body != null ? JSON.stringify(body) : undefined }),

  put: <T = unknown>(path: string, body?: unknown, opts?: RequestInit & { timeoutMs?: number }) =>
    mcFetch<T>(path, { ...opts, method: 'PUT', body: body != null ? JSON.stringify(body) : undefined }),

  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestInit & { timeoutMs?: number }) =>
    mcFetch<T>(path, { ...opts, method: 'PATCH', body: body != null ? JSON.stringify(body) : undefined }),

  delete: <T = unknown>(path: string, opts?: RequestInit & { timeoutMs?: number }) =>
    mcFetch<T>(path, { ...opts, method: 'DELETE' }),

  /** Health check: resolves true if MC service responds, false otherwise. */
  healthy: async (): Promise<boolean> => {
    try {
      await mcFetch('/api/status', { timeoutMs: 5_000 });
      return true;
    } catch {
      return false;
    }
  },

  /** Returns the configured base URL for debugging. */
  baseUrl: getBaseUrl,

  isMCApiError,
};
