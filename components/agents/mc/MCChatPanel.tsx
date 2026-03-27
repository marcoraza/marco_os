import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../../utils/cn';
import { Icon } from '../../ui/Icon';
import { useMissionControlStore } from '../../../store/missionControl';
import { mcApi } from '../../../lib/mcApi';
import { useMCPoll } from '../../../hooks/useMCPoll';

// ── Types ────────────────────────────────────────────────────────────────────

interface Conversation {
  id: string;
  name?: string;
  agent?: string;
  lastMessage?: { content: string; created_at: string };
  updated_at?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  from_agent: string;
  content: string;
  created_at: string;
}

interface MCChatPanelProps {
  agentId?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(isoOrTs: string | number | undefined): string {
  if (!isoOrTs) return '--:--';
  const d = typeof isoOrTs === 'number' ? new Date(isoOrTs) : new Date(isoOrTs);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Message }) {
  const isOperator = msg.from_agent === 'operator' || msg.from_agent === 'user';
  return (
    <div className={cn('flex', isOperator ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-sm p-2.5 border',
          isOperator
            ? 'bg-brand-mint/10 border-brand-mint/30'
            : 'bg-bg-base border-border-panel',
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[8px] font-bold uppercase tracking-widest text-text-secondary">
            {msg.from_agent}
          </span>
          <span className="text-[8px] font-mono text-text-secondary">
            {formatTime(msg.created_at)}
          </span>
        </div>
        <p className="text-xs text-text-primary whitespace-pre-wrap break-words">
          {msg.content}
        </p>
      </div>
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-2 border-b border-border-panel/50">
          <div className="bg-border-panel animate-pulse rounded-sm h-3 w-3/4 mb-1.5" />
          <div className="bg-border-panel animate-pulse rounded-sm h-2 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={cn('flex', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
          <div className="bg-border-panel animate-pulse rounded-sm h-12 w-3/5" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function MCChatPanel({ agentId }: MCChatPanelProps) {
  const connectionStatus = useMissionControlStore((s) => s.connectionStatus);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);

  // ── Fetch conversations ──────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const data = await mcApi.get<Conversation[]>('/api/channels');
      const list = Array.isArray(data) ? data : [];
      setConversations(list);

      // Auto-select by agentId if provided and no selection yet
      if (agentId && !selectedId) {
        const match = list.find(
          (c) =>
            c.agent === agentId ||
            c.name?.toLowerCase().includes(agentId.toLowerCase()),
        );
        if (match) {
          setSelectedId(match.id);
        }
      }
    } catch {
      // Fail silently, conversations remain empty
    } finally {
      setLoadingConversations(false);
    }
  }, [agentId, selectedId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Fetch messages for selected conversation ─────────────────────────────

  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    try {
      const data = await mcApi.get<Message[]>(
        `/api/channels?conversation_id=${encodeURIComponent(selectedId)}`,
      );
      const list = Array.isArray(data) ? data : [];
      setMessages(list);
    } catch {
      // Fail silently, keep existing messages
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) {
      setLoadingMessages(true);
      setMessages([]);
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [selectedId, fetchMessages]);

  // ── Poll messages every 5s ───────────────────────────────────────────────

  useMCPoll(fetchMessages, 5_000, {
    enabled: !!selectedId && connectionStatus === 'connected',
    backoff: true,
  });

  // ── Auto-scroll on new messages ──────────────────────────────────────────

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // ── Send message ─────────────────────────────────────────────────────────

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !selectedId || sending) return;

    setSending(true);
    setInput('');

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedId,
      from_agent: 'operator',
      content: trimmed,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await mcApi.post('/api/channels', {
        conversation_id: selectedId,
        content: trimmed,
        from_agent: 'operator',
      });
      // Refetch to get server-assigned id and any agent response
      await fetchMessages();
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  }, [input, selectedId, sending, fetchMessages]);

  const handleEnter = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  // ── Select conversation ──────────────────────────────────────────────────

  const selectConversation = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-3 h-[calc(100vh-240px)]">
      {/* Left: conversation list */}
      <div className="w-56 shrink-0 border-r border-border-panel overflow-y-auto">
        {loadingConversations ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
            <Icon name="chat_bubble_outline" size="lg" className="text-text-secondary opacity-40" />
            <p className="text-text-secondary text-[10px] text-center">
              Nenhuma conversa ativa
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                'w-full text-left p-2 border-b border-border-panel/50 transition-colors',
                'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                selectedId === conv.id
                  ? 'bg-brand-mint/10'
                  : 'hover:bg-surface-hover',
              )}
            >
              <p className="text-[10px] font-bold text-text-primary truncate">
                {conv.name || conv.id}
              </p>
              <p className="text-[8px] text-text-secondary truncate">
                {conv.lastMessage?.content || 'Sem mensagens'}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Right: message area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Icon name="forum" size="lg" className="text-text-secondary opacity-40" />
            <p className="text-text-secondary text-xs text-center">
              Selecione uma conversa
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto space-y-2 p-2"
            >
              {loadingMessages ? (
                <MessageSkeleton />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Icon
                    name="chat"
                    size="lg"
                    className="text-text-secondary opacity-40"
                  />
                  <p className="text-text-secondary text-xs text-center">
                    Inicie uma conversa
                  </p>
                </div>
              ) : (
                messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border-panel p-2">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleEnter}
                  disabled={sending}
                  className={cn(
                    'flex-1 bg-bg-base border border-border-panel rounded-sm px-3 py-2',
                    'text-xs text-text-primary placeholder:text-text-secondary/50',
                    'focus:border-brand-mint/30 focus:outline-none',
                    'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                    sending && 'opacity-50',
                  )}
                  placeholder="Enviar mensagem..."
                />
                <button
                  onClick={send}
                  disabled={sending || !input.trim()}
                  className={cn(
                    'bg-brand-mint/10 border border-brand-mint/30 text-brand-mint rounded-sm',
                    'px-3 py-2 text-[9px] font-bold uppercase tracking-widest',
                    'hover:bg-brand-mint/20 transition-all',
                    'focus-visible:ring-2 focus-visible:ring-brand-mint/50 focus-visible:outline-none',
                    (sending || !input.trim()) && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <Icon name="send" size="xs" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
