'use client';

import { Bot, PanelRightOpen, PanelRightClose, Plus, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot as BotType } from '@/types/types';
import { cn } from '@/lib/utils';

interface BotHeaderProps {
  bot: BotType;
  docsOpen: boolean;
  onToggleDocs: () => void;
  onNewChat: () => void;
  pendingDocs: number;
  totalDocs: number;
}

export function BotHeader({
  bot,
  docsOpen,
  onToggleDocs,
  onNewChat,
  pendingDocs,
  totalDocs,
}: BotHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
      {/* Back */}
      <Button
        variant="secondary"
        size="icon"
        className="h-8 w-8 text-grey-900 hover:text-gray-600"
        onClick={() => router.push('/bots')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Bot identity */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bot.primaryColor + '20' }}
        >
          <Bot className="h-4 w-4" style={{ color: bot.primaryColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate leading-none">
            {bot.name}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              totalDocs > 0 ? "bg-emerald-500" : "bg-gray-300"
            )} />
            <span className="text-xs text-gray-400">
              {totalDocs} doc{totalDocs !== 1 ? 's' : ''} indexado{totalDocs !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Badge procesando */}
      {pendingDocs > 0 && (
        <Badge
          variant="secondary"
          className="text-xs gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          {pendingDocs} procesando
        </Badge>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-1">
        <Button
          variant="primary"
          size="sm"
          onClick={onNewChat}
          className="gap-1.5 h-8 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo chat
        </Button>

        <Button
          variant="primary"
          size="icon"
          className="h-8 w-8"
          onClick={() => router.push(`/bots/${bot.id}/settings`)}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="tertiary"
          size="icon"
          className={cn(
            'h-8 w-8 transition-colors',
            docsOpen
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-gray-400 hover:text-gray-600',
          )}
          onClick={onToggleDocs}
        >
          {docsOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}