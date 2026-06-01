import { useQuery } from '@tanstack/react-query';
import { fetchEvent } from '@/lib/api';
import { toClassItem } from '@/lib/event-utils';

export function useClassDetail(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEvent(id).then(toClassItem),
    enabled: !!id,
  });
  return { classItem: data ?? null, loading: isLoading, error: error ? (error as Error).message : null };
}
