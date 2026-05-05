'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useBot, useChatHistory, useDocuments, useStartConversation } from '@/features/useDocMe';
import { BotHeader } from './components/BotHeader';
import { ChatPanel } from './components/ChatPanel';
import { DocumentsPanel } from './components/DocumentsPanel';
import { ConversationsPanel } from './components/ConversationsPanel';

export default function BotPage({
    params,
}: {
    params: Promise<{ botId: string }>;
}) {
    const { botId } = use(params);
    const router = useRouter();
    const { data: bot, isLoading, isError } = useBot(botId);
    const { data: documents } = useDocuments(botId);
    const startConversation = useStartConversation();

    const [conversationId, setConversationId] = useState<string | null>(null);
    const [docsOpen, setDocsOpen] = useState(true);

    // Historial de la conversación seleccionada
    const { data: history } = useChatHistory(conversationId ?? '');

    const handleSelectConversation = (convId: string) => {
        setConversationId(convId || null);
    };

    const handleNewChat = async () => {
        if (!bot) return;
        try {
            const conv = await startConversation.mutateAsync(bot.id);
            setConversationId(conv.id);
        } catch {
            // error handled by startConversation.isPending state
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen gap-0">
                <Skeleton className="w-64 h-full rounded-none" />
                <div className="flex-1 flex flex-col gap-4 p-6">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="flex-1 rounded-xl" />
                </div>
                <Skeleton className="w-80 h-full rounded-none" />
            </div>
        );
    }

    if (!bot) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 text-center">
                <div className="h-20 w-20 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                </div>
                <div>
                    <p className="font-semibold text-foreground">
                        {isError ? 'Error loading bot' : 'Bot not found'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isError ? 'Something went wrong.' : 'This bot does not exist.'}
                    </p>
                </div>
                <Button variant="secondary" onClick={() => router.push('/bots')}>
                    Back to bots
                </Button>
            </div>
        );
    }

    const pendingDocs =
        documents?.filter(
            (d) => d.status === 'PENDING' || d.status === 'PROCESSING',
        ).length ?? 0;

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* Header */}
            <BotHeader
                bot={bot}
                docsOpen={docsOpen}
                onToggleDocs={() => setDocsOpen((v) => !v)}
                onNewChat={handleNewChat}
                pendingDocs={pendingDocs}
                totalDocs={documents?.length ?? 0}
            />

            {/* 3-panel layout */}
            <div className="flex flex-1 overflow-hidden">

                {/* Panel izquierdo — conversaciones */}
                <ConversationsPanel
                    botId={botId}
                    activeConversationId={conversationId}
                    onSelect={handleSelectConversation}
                    accentColor={bot.primaryColor}
                />

                {/* Panel central — chat */}
                <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900 flex flex-col">
                    {conversationId ? (
                        <ChatPanel
                            key={conversationId}  // re-monta al cambiar conversación
                            conversationId={conversationId}
                            bot={bot}
                            initialMessages={history ?? []}
                        />
                    ) : (
                        <EmptyChat bot={bot} onStart={handleNewChat} />
                    )}
                </div>

                {/* Panel derecho — documentos */}
                <div
                    className={`
            flex-shrink-0 border-l border-gray-100 dark:border-gray-800
            bg-white dark:bg-gray-900 overflow-hidden
            transition-all duration-300 ease-in-out
            ${docsOpen ? 'w-80' : 'w-0'}
          `}
                >
                    {docsOpen && (
                        <DocumentsPanel botId={botId} accentColor={bot.primaryColor} />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────
// Estado vacío — no hay conversación seleccionada
// ─────────────────────────────────────────────────────
function EmptyChat({ bot, onStart }: { bot: { name: string; primaryColor: string; welcomeMessage: string }; onStart: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-5">
            <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: bot.primaryColor }}
            >
                <span className="text-2xl text-white">✦</span>
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{bot.name}</h2>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">{bot.welcomeMessage}</p>
            </div>
            <Button
                onClick={onStart}
                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ backgroundColor: bot.primaryColor }}
            >
                Iniciar nueva conversación
            </Button>
            <p className="text-xs text-gray-300 dark:text-gray-600">
                O selecciona una conversación anterior en el panel izquierdo
            </p>
        </div>
    );
}