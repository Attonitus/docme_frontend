'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, MoreVertical, MessageSquare,
  FileText, Zap, Bot, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot as BotType} from '@/types/types';
import { useBots, useCreateBot, useDeleteBot } from '@/features/useDocMe';

const createSchema = z.object({
  name: z.string().min(2, 'Min. 2 characters').max(60),
  description: z.string().max(300).optional(),
});

type CreateForm = z.infer<typeof createSchema>;

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  training: { label: 'Training', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  draft: { label: 'No docs', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

function getBotStatus(bot: BotType): keyof typeof STATUS_CONFIG {
  if (bot._count.documents === 0) return 'draft';
  return 'active';
}

export default function BotsPage() {
  const router = useRouter();
  const { data: bots, isLoading } = useBots();
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();
  const [showCreate, setShowCreate] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const onSubmit = async (data: CreateForm) => {

    const bot = await createBot.mutateAsync(data);
    reset();
    setShowCreate(false);
    router.push(`/bots/${bot.id}`);
  };

  return (
    <div className="p-8 max-w-[1400px] h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Bots</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {bots?.length ?? 0} bot{bots?.length !== 1 ? 's' : ''} created{bots?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create bot
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : bots?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center">
            <Bot className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Not bots yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first chatbot and upload your documents
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create first bot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots?.map((bot) => {
            const status = getBotStatus(bot);
            const { label, className } = STATUS_CONFIG[status];
            return (
              <Card
                key={bot.id}
                className="bg-white text-grey-900 border-border hover:shadow-md  cursor-pointer"
                onClick={() => router.push(`/bots/${bot.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: bot.primaryColor + '20' }}
                      >
                        <Bot className="h-5 w-5" style={{ color: bot.primaryColor }} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold leading-tight">{bot.name}</CardTitle>
                        <Badge className={`text-xs mt-1 border-0 ${className}`}>{label}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="primary" size="icon" className="h-8 w-8 -mr-1 -mt-1">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/bots/${bot.id}`); }}>
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/bots/${bot.id}?tab=documents`); }}>
                          Upload documents
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red"
                          onClick={(e) => { e.stopPropagation(); deleteBot.mutate(bot.id); }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bot.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{bot.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{bot._count.conversations.toLocaleString()} conversations</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      <span>{bot._count.documents} documents</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      <span className="font-mono">{bot.model}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={(e) => { e.stopPropagation(); router.push(`/bots/${bot.id}?tab=documents`); }}
                    >
                      Documents
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={(e) => { e.stopPropagation(); router.push(`/bots/${bot.id}`); }}
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal crear */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo bot</DialogTitle>
            <DialogDescription>
              Podrás configurar el prompt, modelo y subir documentos después de crearlo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Bot de soporte, Bot de ventas..." {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Descripción <span className="text-muted-foreground">(opcional)</span></Label>
              <Input placeholder="Para qué sirve..." {...register('description')} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="destroy" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createBot.isPending} className="gap-2">
                {createBot.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Crear y configurar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}