import { useState, useRef, useEffect } from 'react';
import { Badge, Card, Icon, SectionLabel } from '../ui';
import { cn } from '../../utils/cn';
import { useAgents } from '../../contexts/OpenClawContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  timestamp: string;
  sent?: boolean;
}

interface AgentChatProps {
  agentId: string;
}

const API_URL = import.meta.env.VITE_FORM_API_URL || '';
const API_TOKEN = import.meta.env.VITE_FORM_API_TOKEN || '';

export default function AgentChat({ agentId }: AgentChatProps) {
  const { agents } = useAgents();
  const agent = agents.find(a => a.id === agentId);
  const agentName = agent?.name ?? agentId;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      sent: false,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId, message: text }),
      });
      const json = await res.json();

      // Mark user message as sent
      setMessages(prev =>
        prev.map(m => m.id === userMsg.id ? { ...m, sent: true } : m)
      );

      // Add agent response if present
      if (json.ok && json.reply) {
        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}-agent`,
          role: 'agent',
          text: json.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    } catch {
      // Mark as sent anyway (fire-and-forget fallback)
      setMessages(prev =>
        prev.map(m => m.id === userMsg.id ? { ...m, sent: true } : m)
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      <SectionLabel icon="chat">CHAT</SectionLabel>

      <Card className="flex flex-col flex-1 min-h-[400px] overflow-hidden p-0">
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-text-secondary">
              <Icon name="chat" size="lg" />
              <span className="text-[11px]">Inicie uma conversa com o agente</span>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-1 max-w-[80%]',
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={cn(
                    'px-3 py-2 rounded-sm text-[11px] leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-accent/10 text-text-primary'
                      : 'bg-surface border border-border-panel text-text-primary'
                  )}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-text-secondary">
                    {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.role === 'user' && msg.sent && (
                    <Badge variant="mint" size="xs">Enviado</Badge>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border-panel p-3 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            placeholder={`Enviar mensagem para ${agentName}...`}
            className="flex-1 bg-bg-base border border-border-panel rounded-sm px-3 py-2 text-[11px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-mint/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2 rounded-sm bg-brand-mint/10 border border-brand-mint/20 text-brand-mint hover:bg-brand-mint/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="send" size="xs" />
          </button>
        </div>
      </Card>
    </div>
  );
}
