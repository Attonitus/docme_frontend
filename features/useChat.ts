'use client';
import { getAccessToken } from '@/lib/api.axios';
import { MessageStream, SourceElement } from '@/types/types';
import { useState, useCallback, useRef } from 'react';
 
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
 
interface UseChatOptions {
  conversationId: string;
  initialMessages?: MessageStream[];
}
 
export const useChat = ({ conversationId, initialMessages = [] }: UseChatOptions) => {
  const [messages, setMessages] = useState<MessageStream[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sources, setSources] = useState<SourceElement[]>([]);
  const abortRef = useRef<AbortController | null>(null);
 
  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming) return;
 
      // 1. Agregar mensaje del usuario optimistamente
      const userMsg = {
        id: `tmp-${Date.now()}`,
        role: 'user',
        content,
        tokensUsed: 0,
        createdAt: new Date(),
      };
 
      // 2. Placeholder para la respuesta del assistant (streaming)
      const assistantMsg = {
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
        const response = await fetch(`${API_URL}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
          },
          body: JSON.stringify({ conversationId, content }),
          signal: abortRef.current.signal,
        });
 
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
 
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
 
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // la última línea puede estar incompleta
 
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
 
                // Token — concatenar al mensaje del assistant
                if (parsed.content !== undefined) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: m.content + parsed.content }
                        : m,
                    ),
                  );
                }
 
                // Sources — mostrar las fuentes encontradas
                if (parsed.sources) {
                  setSources(parsed.sources);
                }
 
                // Done — actualizar el mensaje con el id real de DB
                if (parsed.messageId) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, id: parsed.messageId, tokensUsed: parsed.tokensUsed }
                        : m,
                    ),
                  );
                }
 
                // Error
                if (parsed.message && !parsed.messageId) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: '⚠️ ' + parsed.message }
                        : m,
                    ),
                  );
                }
              } catch {
                // línea SSE no es JSON válido, ignorar
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: '⚠️ Error de conexión. Intenta de nuevo.' }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, isStreaming],
  );
 
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);
 
  return { messages, isStreaming, sources, sendMessage, stopStreaming };
};