import { useState, useEffect, useCallback } from 'react';
import { getDb, type ChatMessage } from '../data/db';
import { sendToGateway, type GatewayMessage } from '../lib/gatewayClient';

interface UseAgentChatOptions {
  agentId: string;
  sectionId: string;
}

export function useAgentChat({ agentId, sectionId }: UseAgentChatOptions) {
  const sessionId = `${agentId}:${sectionId}`;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        const session = await db.get('chat_sessions', sessionId);
        if (session) setMessages(session.messages);
      } catch { /* IndexedDB unavailable — use empty */ }
    })();
  }, [sessionId]);

  // Persist to IndexedDB
  const persist = useCallback(async (msgs: ChatMessage[]) => {
    try {
      const db = await getDb();
      const now = new Date().toISOString();
      const existing = await db.get('chat_sessions', sessionId);
      await db.put('chat_sessions', {
        id: sessionId,
        agentId,
        sectionId,
        openClawSessionId: null,
        messages: msgs,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    } catch { /* silent fail */ }
  }, [sessionId, agentId, sectionId]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    await persist(withUser);
    setIsLoading(true);

    // Temporary "thinking" message
    const thinkingId = crypto.randomUUID();
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: 'agent',
      content: '...',
      timestamp: new Date().toISOString(),
    };
    setMessages([...withUser, thinkingMsg]);

    try {
      // Build gateway-compatible history (map 'agent' → 'assistant')
      const gatewayHistory: GatewayMessage[] = withUser.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const responseText = await sendToGateway(gatewayHistory, sectionId);

      const agentMsg: ChatMessage = {
        id: thinkingId, // reuse same id so UI replaces thinking msg
        role: 'agent',
        content: responseText,
        timestamp: new Date().toISOString(),
      };
      const final_ = [...withUser, agentMsg];
      setMessages(final_);
      await persist(final_);
    } catch {
      const errorMsg: ChatMessage = {
        id: thinkingId,
        role: 'agent',
        content: 'Não consegui conectar ao Frank. Tente novamente.',
        timestamp: new Date().toISOString(),
      };
      const withError = [...withUser, errorMsg];
      setMessages(withError);
      await persist(withError);
    } finally {
      setIsLoading(false);
    }
  }, [messages, persist, sectionId]);

  const clearSession = useCallback(async () => {
    try {
      const db = await getDb();
      await db.delete('chat_sessions', sessionId);
    } catch { /* silent */ }
    setMessages([]);
  }, [sessionId]);

  return { messages, isLoading, sendMessage, clearSession, sessionId };
}
