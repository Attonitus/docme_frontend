'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, User, FileText, Send, Square, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot as BotType, MessageStream } from '@/types/types';
import { cn } from '@/lib/utils';
import { useChat } from '@/features/useChat';

interface ChatPanelProps {
    conversationId: string;
    bot: BotType;
    initialMessages: MessageStream[];
}

export function ChatPanel({ conversationId, bot, initialMessages }: ChatPanelProps) {
    const { messages, isStreaming, sources, sendMessage, stopStreaming } = useChat({
        conversationId,
        initialMessages
    });
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const isFirstMessage = messages.length === 0;

    // Auto-scroll al llegar nuevos tokens
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
        <div className="flex flex-col h-full">

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto">
                {isFirstMessage ? (
                    <WelcomeScreen bot={bot} onSuggestion={(s) => { setInput(s); inputRef.current?.focus(); }} />
                ) : (
                    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
                        {messages.map((msg) => (
                            <MessageRow key={msg.id} message={msg} bot={bot} />
                        ))}

                        {/* Sources mientras streaming */}
                        {isStreaming && sources.length > 0 && (
                            <div className="flex items-center gap-2 pl-11">
                                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-full">
                                    <FileText className="h-3 w-3" />
                                    Consultando: {sources.map((s) => s.documentName).join(', ')}
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="max-w-3xl mx-auto">
                    <div className="relative flex items-end gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 focus-within:border-indigo-300 dark:focus-within:border-indigo-700 transition-colors">
                        <Textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Pregúntale algo a ${bot.name}...`}
                            className="flex-1 min-h-[44px] max-h-40 resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm placeholder:text-gray-400"
                            rows={1}
                            disabled={isStreaming}
                        />
                        <Button
                            onClick={isStreaming ? stopStreaming : handleSend}
                            disabled={!isStreaming && !input.trim()}
                            size="icon"
                            className={cn(
                                'h-9 w-9 rounded-xl flex-shrink-0 transition-all',
                                isStreaming
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'text-white',
                            )}
                            style={!isStreaming ? { backgroundColor: bot.primaryColor } : undefined}
                        >
                            {isStreaming ? (
                                <Square className="h-3.5 w-3.5 fill-current" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        Enter para enviar · Shift+Enter para nueva línea
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────
// WelcomeScreen
// ─────────────────────────────────────────────────────
function WelcomeScreen({
    bot,
    onSuggestion,
}: {
    bot: BotType;
    onSuggestion: (s: string) => void;
}) {
    const suggestions = [
        '¿Qué información tienes disponible?',
        '¿Puedes darme un resumen de los documentos?',
        '¿Cómo puedo contactar con soporte?',
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center max-w-lg mx-auto">
            <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg"
                style={{ backgroundColor: bot.primaryColor }}
            >
                <Bot className="h-8 w-8 text-white" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                {bot.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm leading-relaxed">
                {bot.welcomeMessage}
            </p>

            {/* Sugerencias */}
            <div className="w-full space-y-2">
                {suggestions.map((s) => (
                    <button
                        key={s}
                        onClick={() => onSuggestion(s)}
                        className="w-full text-left text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all"
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────
// MessageRow
// ─────────────────────────────────────────────────────
function MessageRow({ message, bot }: { message: MessageStream; bot: BotType }) {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const isEmpty = !message.content;

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn('flex gap-3 group', isUser && 'flex-row-reverse')}>
            {/* Avatar */}
            <div
                className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    isUser
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : undefined,
                )}
                style={!isUser ? { backgroundColor: bot.primaryColor + '20' } : undefined}
            >
                {isUser ? (
                    <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                ) : (
                    <Bot className="h-4 w-4" style={{ color: bot.primaryColor }} />
                )}
            </div>

            {/* Bubble */}
            <div className={cn('max-w-[80%] space-y-2', isUser && 'items-end flex flex-col')}>
                <div
                    className={cn(
                        'relative rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        isUser
                            ? 'text-white rounded-tr-sm'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm border border-gray-100 dark:border-gray-700 shadow-sm',
                    )}
                    style={isUser ? { backgroundColor: bot.primaryColor } : undefined}
                >
                    {/* Typing indicator cuando está vacío (esperando primer token) */}
                    {isEmpty ? (
                        <div className="flex gap-1 py-0.5">
                            {[0, 150, 300].map((delay) => (
                                <span
                                    key={delay}
                                    className="h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600 animate-bounce"
                                    style={{ animationDelay: `${delay}ms` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Cursor parpadeante al final del streaming */}
                    {!isUser && !isEmpty && message.id.startsWith('stream-') && (
                        <span className="inline-block h-4 w-0.5 bg-indigo-400 ml-0.5 animate-pulse align-text-bottom" />
                    )}
                </div>

                {/* Fuentes citadas (solo en mensajes del assistant ya completos) */}
                {!isUser && message.sources && message.sources.length > 0 && !message.id.startsWith('stream-') && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                        {message.sources.map((src, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-2.5 py-1"
                            >
                                <FileText className="h-3 w-3 text-indigo-400" />
                                <span>{src.documentName}</span>
                                <span className="text-gray-300 dark:text-gray-600">
                                    {Math.round(src.similarity * 100)}%
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Acciones del mensaje (hover) */}
                {!isUser && !isEmpty && !message.id.startsWith('stream-') && (
                    <div className="flex items-center gap-1 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {copied ? (
                                <><Check className="h-3 w-3 text-emerald-500" /> Copiado</>
                            ) : (
                                <><Copy className="h-3 w-3" /> Copiar</>
                            )}
                        </button>
                        <span className="text-gray-200 dark:text-gray-700">·</span>
                        <span className="text-xs text-gray-300 dark:text-gray-600">
                            {message.tokensUsed > 0 && `${message.tokensUsed} tokens`}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}