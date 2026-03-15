/**
 * OpenClaw HTTP API Client
 *
 * Wraps the POST /tools/invoke endpoint for calling agent tools
 * (memory_search, memory_get, kanban operations, etc.)
 * without needing a persistent WebSocket connection.
 */

import type { OpenClawConfig } from './openclawTypes';

interface ToolInvokeRequest {
  tool: string;
  action?: string;
  args?: Record<string, unknown>;
  sessionKey?: string;
  dryRun?: boolean;
}

interface ToolInvokeResponse<T = unknown> {
  ok: boolean;
  result?: T;
  error?: { type: string; message: string };
}

export class OpenClawHttp {
  private baseUrl: string;
  private token?: string;

  constructor(config: OpenClawConfig) {
    const protocol = config.secure ? 'https' : 'http';
    this.baseUrl = `${protocol}://${config.host}:${config.port}`;
    this.token = config.token;
  }

  // ─── CORE ────────────────────────────────────────────────────────────────

  async invoke<T = unknown>(request: ToolInvokeRequest): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${this.baseUrl}/tools/invoke`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (res.status === 401) throw new Error('Unauthorized: check OPENCLAW_TOKEN');
    if (res.status === 404) throw new Error(`Tool "${request.tool}" not found or not allowed`);
    if (res.status === 429) {
      const retryAfter = res.headers.get('Retry-After');
      throw new Error(`Rate limited. Retry after ${retryAfter || '?'}s`);
    }

    const data = (await res.json()) as ToolInvokeResponse<T>;
    if (!data.ok) {
      throw new Error(data.error?.message || 'Tool invocation failed');
    }

    return data.result as T;
  }

  // ─── MEMORY ──────────────────────────────────────────────────────────────

  /** Semantic search across agent memory */
  async memorySearch(query: string, limit = 10) {
    return this.invoke<{ results: Array<{ path: string; snippet: string; score: number }> }>({
      tool: 'memory_search',
      args: { query, limit },
    });
  }

  /** Read a specific memory file */
  async memoryGet(path: string, fromLine?: number, lines?: number) {
    return this.invoke<{ content: string; path: string }>({
      tool: 'memory_get',
      args: { path, ...(fromLine != null && { fromLine }), ...(lines != null && { lines }) },
    });
  }

  // ─── KANBAN (via workspace files) ────────────────────────────────────────

  /** Read the kanban board JSON from workspace */
  async kanbanGet() {
    return this.invoke<{ content: string; path: string }>({
      tool: 'memory_get',
      args: { path: 'tasks/kanban.json' },
    });
  }

  /** Update kanban via agent (Frank manages the board) */
  async kanbanDispatch(action: 'add' | 'move' | 'update' | 'remove', taskData: Record<string, unknown>) {
    // This sends a message to Frank to update the kanban
    // Frank's TOOLS.md should have kanban_update instructions
    return this.invoke({
      tool: 'exec',
      args: {
        command: 'kanban',
        action,
        ...taskData,
      },
    });
  }

  // ─── FILE OPERATIONS ─────────────────────────────────────────────────────

  /** Read a workspace file */
  async fileRead(path: string) {
    return this.invoke<{ content: string }>({
      tool: 'read',
      args: { path },
    });
  }

  /** Write to a workspace file */
  async fileWrite(path: string, content: string) {
    return this.invoke<{ ok: boolean }>({
      tool: 'write',
      args: { path, content },
    });
  }

  // ─── HEALTH ──────────────────────────────────────────────────────────────

  /** Quick health check via HTTP */
  async ping(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/__openclaw__/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
