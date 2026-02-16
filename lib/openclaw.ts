/**
 * OpenClaw Gateway WebSocket Client
 *
 * Connects to the OpenClaw gateway daemon and provides:
 * - Auto-reconnection with exponential backoff
 * - Request/response RPC over WebSocket
 * - Event subscription (presence, tick, agent)
 * - Connection state management
 */

import type {
  WsRequest,
  WsResponse,
  WsEvent,
  WsFrame,
  ConnectParams,
  OpenClawConfig,
  ConnectionState,
} from './openclawTypes';

type EventHandler = (payload: unknown) => void;
type StateHandler = (state: ConnectionState) => void;

interface PendingRequest {
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export class OpenClawClient {
  private ws: WebSocket | null = null;
  private config: OpenClawConfig;
  private state: ConnectionState = 'disconnected';
  private reqId = 0;
  private pending = new Map<string, PendingRequest>();
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private stateHandlers = new Set<StateHandler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30_000;
  private shouldReconnect = true;
  private requestTimeout = 15_000;

  constructor(config: OpenClawConfig) {
    this.config = config;
  }

  // ─── CONNECTION ──────────────────────────────────────────────────────────

  connect(): void {
    if (this.state === 'connecting' || this.state === 'connected') return;

    this.shouldReconnect = true;
    this.setState('connecting');

    const protocol = this.config.secure ? 'wss' : 'ws';
    const url = `${protocol}://${this.config.host}:${this.config.port}`;

    try {
      this.ws = new WebSocket(url);
    } catch {
      this.setState('error');
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.handshake();
    };

    this.ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data as string) as WsFrame;
        this.handleFrame(frame);
      } catch {
        // Ignore malformed frames
      }
    };

    this.ws.onclose = () => {
      this.cleanup();
      if (this.shouldReconnect) {
        this.setState('disconnected');
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.cleanup();
    this.setState('disconnected');
  }

  getState(): ConnectionState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state === 'connected';
  }

  // ─── RPC ─────────────────────────────────────────────────────────────────

  async request<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.isConnected()) {
      throw new Error(`Cannot send request: state is ${this.state}`);
    }

    const id = String(++this.reqId);
    const frame: WsRequest = { type: 'req', id, method, ...(params && { params }) };

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Request ${method} timed out`));
      }, this.requestTimeout);

      this.pending.set(id, {
        resolve: resolve as (p: unknown) => void,
        reject,
        timeout,
      });

      this.ws!.send(JSON.stringify(frame));
    });
  }

  // ─── EVENTS ──────────────────────────────────────────────────────────────

  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.eventHandlers.get(event)?.delete(handler);
  }

  onStateChange(handler: StateHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  // ─── CONVENIENCE METHODS ─────────────────────────────────────────────────

  /** Get connected devices/agents presence */
  async getPresence(): Promise<unknown> {
    return this.request('system-presence');
  }

  /** Send a message to an agent session */
  async send(agentId: string, message: string): Promise<unknown> {
    return this.request('send', { agentId, message });
  }

  /** Start an agent run */
  async agent(agentId: string, message: string): Promise<unknown> {
    return this.request('agent', { agentId, message });
  }

  /** List cron jobs */
  async cronList(): Promise<unknown> {
    return this.request('cron.list');
  }

  /** Get cron job status */
  async cronStatus(jobId: string): Promise<unknown> {
    return this.request('cron.status', { jobId });
  }

  /** Get cron run history */
  async cronRuns(jobId: string, limit = 20): Promise<unknown> {
    return this.request('cron.runs', { jobId, limit });
  }

  /** Health check */
  async health(): Promise<unknown> {
    return this.request('health');
  }

  // ─── INTERNALS ───────────────────────────────────────────────────────────

  private async handshake(): Promise<void> {
    const connectParams: ConnectParams = {
      protocol: 1,
      client: { name: 'marco-os', version: '1.0.0' },
      role: 'control',
      ...(this.config.token && { auth: { token: this.config.token } }),
    };

    try {
      await this.request('connect', connectParams as unknown as Record<string, unknown>);
      this.reconnectAttempts = 0;
      this.setState('connected');
    } catch (err) {
      console.error('[openclaw] Handshake failed:', err);
      this.ws?.close();
    }
  }

  private handleFrame(frame: WsFrame): void {
    if (frame.type === 'res') {
      const res = frame as WsResponse;
      const pending = this.pending.get(res.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pending.delete(res.id);
        if (res.ok) {
          pending.resolve(res.payload);
        } else {
          pending.reject(new Error(res.error?.message || 'Request failed'));
        }
      }
    } else if (frame.type === 'event') {
      const evt = frame as WsEvent;
      const handlers = this.eventHandlers.get(evt.event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(evt.payload);
          } catch {
            // Don't let handler errors crash the client
          }
        }
      }
      // Also emit to wildcard listeners
      const wildcardHandlers = this.eventHandlers.get('*');
      if (wildcardHandlers) {
        for (const handler of wildcardHandlers) {
          try {
            handler({ event: evt.event, payload: evt.payload });
          } catch {
            // Ignore
          }
        }
      }
    }
  }

  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    this.state = state;
    for (const handler of this.stateHandlers) {
      try {
        handler(state);
      } catch {
        // Ignore
      }
    }
  }

  private cleanup(): void {
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
      this.pending.delete(id);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.shouldReconnect) return;

    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay,
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
}
