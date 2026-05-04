import { api } from '@/lib/api.axios';
import { useQuery } from '@tanstack/react-query';
 
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/overview').then((r) => r.data),
    refetchInterval: 60_000, // refresca cada minuto
  });
}
 
export function useConversationsTrend(days: 7 | 30 = 30) {
  return useQuery({
    queryKey: ['analytics', 'conversations-trend', days],
    queryFn: () =>
      api.get(`/analytics/conversations-trend?days=${days}`).then((r) => r.data),
  });
}
 
export function useSourcesBreakdown() {
  return useQuery({
    queryKey: ['analytics', 'sources-breakdown'],
    queryFn: () => api.get('/analytics/sources-breakdown').then((r) => r.data),
  });
}
 
export function useActivityFeed() {
  return useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: () => api.get('/analytics/activity').then((r) => r.data),
    refetchInterval: 30_000,
  });
}
 