// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GATEWAY_URL = (import.meta as any).env?.VITE_GATEWAY_URL || 'http://localhost:18792';

export interface GatewayMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendToGateway(
  messages: GatewayMessage[],
  sectionContext?: string
): Promise<string> {
  const systemPrompt = sectionContext
    ? `Contexto: o usuário está na seção "${sectionContext}" do Marco OS. Responda de forma concisa e útil.`
    : undefined;

  const response = await fetch(`${GATEWAY_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'main',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages,
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'Erro: resposta vazia do gateway.';
}
