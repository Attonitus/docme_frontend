'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSourcesBreakdown } from '@/features/useAnalytics';

const COLORS = ['#826CB0', '#C94736', '#626070', '#82C9D7', '#F2CDAC'];

export function SourceBreakdown() {
    const { data, isLoading } = useSourcesBreakdown();

    const total = (data ?? []).reduce((acc: number, d: { value: number }) => acc + d.value, 0);

    return (
        <Card className="bg-white text-grey-900 border-border h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-[20px] font-bold leading-[1.2]">Fuentes por tipo</CardTitle>
                <CardDescription className="text-[14px] leading-[1.5] mt-0.5">
                    Documentos indexados según formato
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[220px] w-full rounded-lg" />
                ) : !data || data.length === 0 ? (
                    <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <div className="h-16 w-16 rounded-full border-4 border-dashed border-border" />
                        Sin documentos indexados aún
                    </div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={52}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {data.map((_: unknown, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#FFFFFF',
                                        border: '1px solid #277C78',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Leyenda manual más compacta */}
                        <div className="space-y-2 mt-2">
                            {data.map((item: { name: string; value: number }, i: number) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="h-2 w-2 rounded-full flex-shrink-0"
                                            style={{ background: COLORS[i % COLORS.length] }}
                                        />
                                        <span className="text-muted-foreground">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-foreground">{item.value}</span>
                                        <span className="text-muted-foreground w-8 text-right">
                                            {Math.round((item.value / total) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}