'use client';
import { Users, Bot, FileText, TrendingUp, Loader } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsOverview } from '@/features/useAnalytics';
import { KpiCard } from './components/KpiCard';
import { ConversationsTrend } from './components/ConversationsTrend';
import { SourceBreakdown } from './components/SourceBreakdown';
import { ActivityFeed } from './components/ActivityFeed';

function formatTokens(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

export default function OverviewPage() {
    const { user } = useAuthStore();
    const { data, isLoading } = useAnalyticsOverview();

    if(isLoading){
        return (
            <div className='flex justify-center items-center min-h-full'>
                <Loader className='animate-spin' />
            </div>
        )
    }

    return (
        <div className="px-8 space-y-8 max-w-[1400px]">
            {/* Saludo */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">
                    Hello, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Here's your activity overview
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    title="Total Conversations"
                    value={data?.totalConversations?.value?.toLocaleString() ?? '—'}
                    change={data?.totalConversations?.change}
                    trend={data?.totalConversations?.trend}
                    icon={Users}
                    iconColor="text-purple"
                    iconBg="bg-transparent"
                    isLoading={isLoading}
                    subtitle="vs. previous month"
                />
                <KpiCard
                    title="Bots activos"
                    className='bg-white text-grey-900'
                    value={
                        data
                            ? `${data.activeBots.value} / ${data.activeBots.total}`
                            : '—'
                    }
                    subtitle="con documentos listos"
                    icon={Bot}
                    iconColor="text-turquoise"
                    iconBg="bg-transparent"
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Documentos indexados"
                    className='bg-white text-grey-900'
                    value={data?.documentsIndexed?.value ?? '—'}
                    subtitle="archivos listos para RAG"
                    icon={FileText}
                    iconColor="text-magenta"
                    iconBg="bg-transparent"
                    isLoading={isLoading}
                />
                <KpiCard
                    title="Tokens este mes"
                    className='bg-white text-grey-900'
                    value={
                        data
                            ? `${formatTokens(data.tokensUsed.used)} / ${formatTokens(data.tokensUsed.limit)}`
                            : '—'
                    }
                    change={data?.tokensUsed?.change}
                    trend="neutral"
                    icon={TrendingUp}
                    iconColor="text-gold"
                    iconBg="bg-transparent"
                    isLoading={isLoading}
                    extra={
                        data ? (
                            <Progress
                                value={data.tokensUsed.percentage}
                                className="h-1.5 mt-2"
                            />
                        ) : undefined
                    }
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ConversationsTrend />
                </div>
                <div>
                    <SourceBreakdown />
                </div>
            </div>

            {/* Activity */}
            <ActivityFeed />
        </div>
    );
}