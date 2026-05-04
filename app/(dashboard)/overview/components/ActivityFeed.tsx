'use client';
import { MessageSquare, FileText, Bot, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useActivityFeed } from '@/features/useAnalytics';

type ActivityEvent = {
    id: string;
    type: 'conversation' | 'document' | 'bot';
    title: string;
    subtitle: string;
    createdAt: string;
};

const EVENT_CONFIG = {
    conversation: { icon: MessageSquare, color: 'text-turquoise', bg: 'transparent' },
    document: { icon: FileText, color: 'text-magenta', bg: 'transparent' },
    bot: { icon: Bot, color: 'text-green', bg: 'transparent' },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
}

export function ActivityFeed() {
    const { data, isLoading } = useActivityFeed();

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[20px] font-bold leading-[1.2]">Actividad reciente</CardTitle>
                    <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        En vivo
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-3 w-12" />
                            </div>
                        ))}
                    </div>
                ) : !data || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-sm text-muted-foreground">
                        <Clock className="h-8 w-8 text-border" />
                        No hay actividad reciente
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {data.map((event: ActivityEvent, i: number) => {
                            const { icon: Icon, color, bg } = EVENT_CONFIG[event.type];
                            return (
                                <li
                                    key={event.id}
                                    className={cn(
                                        'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50',
                                    )}
                                >
                                    <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', bg)}>
                                        <Icon className={cn('h-4 w-4', color)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[14px] font-medium text-foreground leading-tight">
                                            {event.title}
                                        </p>
                                        <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                                            {event.subtitle}
                                        </p>
                                    </div>
                                    <span className="text-[12px] text-muted-foreground flex-shrink-0 mt-0.5">
                                        {timeAgo(event.createdAt)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}