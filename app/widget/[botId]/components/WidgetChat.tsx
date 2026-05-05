'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, User, FileText, Send, Square, Loader2 } from 'lucide-react';
import { SourceElement } from '@/types/types';
import { useWidgetChat } from '@/features/useWidgetChat';

interface BotInfo {
  name: string;
  primaryColor: string;
  welcomeMessage: string;
}

interface WidgetChatProps {
  botId: string;
  apiKey: string;
}

export function WidgetChat({ botId, apiKey }: WidgetChatProps) {
  const [bot, setBot] = useState<BotInfo | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    fetch(`${API_URL}/chat/widget/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ botId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setConversationId(data.id);
        setBot({
          name: data.bot.name,
          primaryColor: data.bot.primaryColor,
          welcomeMessage: data.bot.welcomeMessage,
        });
      })
      .catch(() => setInitError(true));
  }, [botId, apiKey]);

  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-sm text-gray-500">No se pudo inicializar el chat.</p>
        <p className="text-xs text-gray-400 mt-1">Verifica tu API key.</p>
      </div>
    );
  }

  if (!bot || !conversationId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <WidgetChatInner
      bot={bot}
      apiKey={apiKey}
      conversationId={conversationId}
    />
  );
}

function WidgetChatInner({
  bot,
  apiKey,
  conversationId,
}: {
  bot: BotInfo;
  apiKey: string;
  conversationId: string;
}) {
  const { messages, isStreaming, sources, sendMessage, stopStreaming } =
    useWidgetChat({ apiKey, conversationId });
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstMessage = messages.length === 0;
  const color = bot.primaryColor || '#6366f1';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 text-white" style={{ backgroundColor: color }}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{bot.name}</p>
            <p className="text-xs text-white/70 mt-0.5">En línea</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isFirstMessage ? (
          <WelcomeScreen bot={bot} color={color} onSuggestion={(s) => { setInput(s); inputRef.current?.focus(); }} />
        ) : (
          <div className="px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <MessageRow key={msg.id} message={msg} color={color} />
            ))}

            {isStreaming && sources.length > 0 && (
              <SourcesBar sources={sources} />
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pregúntale algo a ${bot.name}...`}
            className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-gray-300 transition-colors"
            disabled={isStreaming}
          />
          <button
            onClick={isStreaming ? stopStreaming : handleSend}
            disabled={!isStreaming && !input.trim()}
            className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all disabled:opacity-40"
            style={{ backgroundColor: isStreaming ? '#ef4444' : color }}
          >
            {isStreaming ? (
              <Square className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({
  bot,
  color,
  onSuggestion,
}: {
  bot: BotInfo;
  color: string;
  onSuggestion: (s: string) => void;
}) {
  const suggestions = [
    '¿Qué información tienes disponible?',
    '¿Puedes darme un resumen?',
    '¿Cómo puedo contactar soporte?',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center mb-4 shadow-lg"
        style={{ backgroundColor: color }}
      >
        <Bot className="h-6 w-6 text-white" />
      </div>
      <h2 className="text-base font-bold text-gray-900 mb-1">{bot.name}</h2>
      <p className="text-xs text-gray-500 mb-6 max-w-[260px] leading-relaxed">
        {bot.welcomeMessage}
      </p>
      <div className="w-full space-y-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="w-full text-left text-xs px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageRow({ message, color }: { message: { id: string; role: string; content: string; tokensUsed: number; createdAt: Date; sources?: SourceElement[] }; color: string }) {
  const isUser = message.role === 'user';
  const isEmpty = !message.content;

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser ? 'bg-gray-200' : ''
        }`}
        style={!isUser ? { backgroundColor: color + '20' } : undefined}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-gray-500" />
        ) : (
          <Bot className="h-3.5 w-3.5" style={{ color }} />
        )}
      </div>

      <div className={`max-w-[80%] space-y-1.5 ${isUser ? 'items-end flex flex-col' : ''}`}>
        <div
          className={`rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
            isUser
              ? 'text-white rounded-tr-sm'
              : 'bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100'
          }`}
          style={isUser ? { backgroundColor: color } : undefined}
        >
          {isEmpty ? (
            <div className="flex gap-1 py-0.5">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {!isUser && !isEmpty && message.id.startsWith('stream-') && (
            <span className="inline-block h-3 w-0.5 bg-gray-400 ml-0.5 animate-pulse align-text-bottom" />
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && !message.id.startsWith('stream-') && (
          <div className="flex flex-wrap gap-1 pl-1">
            {message.sources.map((src, i) => (
              <div
                key={i}
                className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5"
              >
                <FileText className="h-2.5 w-2.5 text-gray-400" />
                <span>{src.documentName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourcesBar({ sources }: { sources: SourceElement[] }) {
  return (
    <div className="flex items-center gap-2 pl-9">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-full">
        <FileText className="h-3 w-3" />
        Consultando: {sources.map((s) => s.documentName).join(', ')}
      </div>
    </div>
  );
}
