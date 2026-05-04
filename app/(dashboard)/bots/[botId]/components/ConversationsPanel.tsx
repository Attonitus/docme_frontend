'use client';

import { MessageSquare, Plus, Loader2, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConversations, useStartConversation } from '@/features/useDocMe';
import { api } from '@/lib/api.axios';
import { Conversation } from '@/types/types';

interface ConversationsPanelProps {
  botId: string;
  activeConversationId: string | null;
  onSelect: (conversationId: string) => void;
  accentColor: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export function ConversationsPanel({
  botId,
  activeConversationId,
  onSelect,
  accentColor,
}: ConversationsPanelProps) {
  const qc = useQueryClient();
  const { data, isLoading } = useConversations(botId);
  const startConversation = useStartConversation();
  const [search, setSearch] = useState('');

  const conversations: Conversation[] = data?.data ?? [];

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const lastMsg = c.messages?.[0]?.content ?? '';
    return lastMsg.toLowerCase().includes(search.toLowerCase());
  });

  const handleNew = async () => {
    const conv = await startConversation.mutateAsync(botId);
    qc.invalidateQueries({ queryKey: ['conversations', botId] });
    onSelect(conv.id);
  };

  const handleDelete = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    await api.delete(`/chat/conversations/${convId}`);
    qc.invalidateQueries({ queryKey: ['conversations', botId] });
    // Si era la activa, deseleccionar
    if (activeConversationId === convId) onSelect('');
  };

  return (
    <div className="flex flex-col h-full w-64 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Conversaciones
        </p>
        <Button
          size="icon"
          variant="primary"
          className="h-7 w-7 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          onClick={handleNew}
          disabled={startConversation.isPending}
          title="Nueva conversación"
        >
          {startConversation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-8 h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          />
        </div>
      </div>

      {/* Lista */}
      <ScrollArea className="flex-1">
        <div className="px-2 pb-4 space-y-0.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-2 py-3 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
              <MessageSquare className="h-7 w-7 text-gray-200 dark:text-gray-700" />
              <p className="text-xs text-gray-400">
                {search ? 'Sin resultados' : 'Sin conversaciones aún'}
              </p>
              {!search && (
                <Button
                  size="sm"
                  variant="primary"
                  className="h-7 text-xs mt-1 gap-1"
                  onClick={handleNew}
                >
                  <Plus className="h-3 w-3" />
                  Nueva
                </Button>
              )}
            </div>
          ) : (
            filtered.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const lastMsg = conv.messages?.[0]?.content;
              const msgCount = conv._count?.messages ?? 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'group w-full text-left rounded-lg px-3 py-2.5 transition-colors relative',
                    isActive
                      ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800'
                      : 'hover:bg-white dark:hover:bg-gray-900',
                  )}
                >
                  {/* Indicador activo */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                      style={{ backgroundColor: accentColor }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-1">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                        {lastMsg
                          ? lastMsg.slice(0, 40) + (lastMsg.length > 40 ? '…' : '')
                          : 'Conversación nueva'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-400">
                          {msgCount} msg{msgCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-200 dark:text-gray-700">·</span>
                        <span className="text-xs text-gray-400">
                          {timeAgo(conv.createdAt.toString())}
                        </span>
                      </div>
                    </div>

                    {/* Delete en hover */}
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0 mt-0.5"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer con contador */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
        <p className="text-xs text-gray-400 text-center">
          {data?.meta?.total ?? 0} conversación{data?.meta?.total !== 1 ? 'es' : ''} en total
        </p>
      </div>
    </div>
  );
}