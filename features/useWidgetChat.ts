'use client';
import { MessageStream, SourceElement } from '@/types/types';
import { useState, useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface UseWidgetChatOptions {
  apiKey: string;
  conversationId: string | null;
}

export const useWidgetChat = ({ apiKey, conversationId }: UseWidgetChatOptions) => {
  const [messages, setMessages] = useState<MessageStream[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState<SourceElement[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !conversationId) return;

      const userMsg: MessageStream = {
        id: `tmp-${Date.now()}`,
        role: 'user',
        content,
        tokensUsed: 0,
        createdAt: new Date(),
      };

      const assistantMsg: MessageStream = {
        id: `stream-${Date.now()}`,
        role: 'assistant',
        content: '',
        tokensUsed: 0,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);
      setSources([]);

      abortRef.current = new AbortController();

      try {
        const response = await fetch(`${API_URL}/chat/widget/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            conversationId,
            content,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: 'Error de conexión. Intenta de nuevo.' }
                : m,
            ),
          );
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentEvent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));

                if (currentEvent === 'token' && parsed.content !== undefined) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: m.content + parsed.content }
                        : m,
                    ),
                  );
                }

                if (currentEvent === 'sources' && parsed.sources) {
                  setSources(parsed.sources);
                }

                if (currentEvent === 'done') {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? {
                            ...m,
                            id: parsed.messageId ?? m.id,
                            tokensUsed: parsed.tokensUsed ?? 0,
                          }
                        : m,
                    ),
                  );
                }

                if (currentEvent === 'error') {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: parsed.message ?? 'Error desconocido.' }
                        : m,
                    ),
                  );
                }
              } catch {
                // línea SSE no es JSON válido, ignorar
              }
            } else if (line === '') {
              currentEvent = '';
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: 'Error de conexión. Intenta de nuevo.' }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [apiKey, conversationId, isStreaming],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, sources, sendMessage, stopStreaming };
};
