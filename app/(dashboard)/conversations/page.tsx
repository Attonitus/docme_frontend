'use client';
import { useState } from 'react';
import { MessageSquare, Search, Download, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useBots, useConversations } from '@/features/useDocMe';
import { Conversation } from '@/types/types';

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

export default function ConversationsPage() {
    const { data: bots } = useBots();
    const [selectedBot, setSelectedBot] = useState<string>('all');
    const [search, setSearch] = useState('');

    // Usa el primer bot si no hay selección o 'all'
    const botId = selectedBot !== 'all' ? selectedBot : bots?.[0]?.id ?? '';
    const { data, isLoading } = useConversations(botId);

    const conversations = (data?.data ?? []).filter((c: Conversation) => {
        if (!search) return true;

        const lastMsg = c.messages?.[0]?.content ?? '';
        return (
            lastMsg.toLowerCase().includes(search.toLowerCase()) ||
            (c.visitorId ?? '').toLowerCase().includes(search.toLowerCase())
        );
    });

    const exportCsv = () => {
        if (!conversations.length) return;
        const rows = [
            ['ID', 'Bot', 'Mensajes', 'Fecha'],
            ...conversations.map((c: Conversation) => [
                c.id,
                bots?.find((b) => b.id === c.botId)?.name ?? c.botId,
                c._count.messages,
                new Date(c.createdAt).toLocaleString('es'),
            ]),
        ];
        const csv = rows.map((r) => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'conversaciones.csv';
        a.click();
    };

    return (
        <div className="p-8 max-w-[1400px]">
            <div className="mb-8">
                <h1 className="text-[32px] font-bold text-foreground">Conversations</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    
                    Historial de todas las conversaciones de tus bots
                </p>
            </div>

            <Card className="border-border">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <CardTitle className="text-base">Historial</CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                {data?.meta?.total ?? 0} conversaciones en total
                            </CardDescription>
                        </div>
                        <Button size="sm" variant="tertiary" onClick={exportCsv} className="gap-2 h-8">
                            <Download className="h-3.5 w-3.5" /> Exportar CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filtros */}
                    <div className="flex gap-3 mb-6 flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por mensaje o visitante..."
                                className="pl-9 h-9 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={selectedBot} onValueChange={setSelectedBot}>
                            <SelectTrigger className="h-9 w-[180px] text-sm">
                                <SelectValue placeholder="Todos los bots" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los bots</SelectItem>
                                {bots?.map((b) => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lista */}
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-lg">
                                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-3.5 w-48" />
                                        <Skeleton className="h-3 w-64" />
                                    </div>
                                    <Skeleton className="h-6 w-16" />
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                                <MessageSquare className="h-7 w-7 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {search ? 'Sin resultados para tu búsqueda' : 'Sin conversaciones todavía'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {conversations.map((conv: Conversation) => {
                                const botName = bots?.find((b) => b.id === conv.botId)?.name ?? 'Bot';
                                const lastMsg = conv.messages?.[0]?.content;
                                return (
                                    <div
                                        key={conv.id}
                                        className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors cursor-pointer group"
                                    >
                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-foreground">
                                                    {botName}
                                                </p>
                                                {conv.visitorId && (
                                                    <span className="text-xs text-muted-foreground">· {conv.visitorId}</span>
                                                )}
                                            </div>
                                            {lastMsg && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {lastMsg}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                            <Badge variant="secondary" className="text-xs">
                                                {conv._count.messages} msg
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {timeAgo(conv.createdAt.toString())}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}