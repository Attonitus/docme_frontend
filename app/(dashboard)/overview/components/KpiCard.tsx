import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string | null;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  isLoading?: boolean;
  extra?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  change,
  trend = 'neutral',
  icon: Icon,
  iconColor,
  iconBg,
  isLoading,
  extra,
  className
}: KpiCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-gray-400';

  return (
    <Card className={`border-border ${className}`}>
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] leading-[1.5] tracking-wider">
            {title}
          </p>
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[32px] font-bold leading-[1.2]">{value}</p>
            <div className="flex items-center gap-2">
              {change && (
                <span className={cn('flex items-center gap-0.5 text-[12px]', trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  {change}
                </span>
              )}
              {subtitle && (
                <span className="text-[12px]">{subtitle}</span>
              )}
            </div>
            {extra}
          </div>
        )}
      </CardContent>
    </Card>
  );
}