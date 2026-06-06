import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/lib/api';
import { getWeekRange, toClassItem, type ClassItem } from '@/lib/event-utils';

export { getWeekRange } from '@/lib/event-utils';

function toSortedClassItems(raw: Awaited<ReturnType<typeof fetchEvents>>): ClassItem[] {
  return [...raw]
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map(toClassItem);
}

export function useWeekEvents(weekOffset = 0, batchId?: string | null) {
  const { from, to } = getWeekRange(weekOffset);
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['events', 'week', from, to, batchId],
    queryFn: () => fetchEvents({ from, to, batchId: batchId || undefined }).then(toSortedClassItems),
    enabled: !!batchId,
  });
  return { events: data, loading: isLoading, error: error ? (error as Error).message : null };
}
