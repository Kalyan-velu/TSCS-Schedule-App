import { useQuery } from '@tanstack/react-query';
import { fetchBatch, fetchStudents } from '@/lib/api';

export function useProfile() {
  const studentsQuery = useQuery({
    queryKey: ['students'],
    queryFn: fetchStudents,
  });

  const student = studentsQuery.data?.[0] ?? null;

  const batchQuery = useQuery({
    queryKey: ['batch', student?.batchId],
    queryFn: () => fetchBatch(student!.batchId!),
    enabled: !!student?.batchId,
  });

  return {
    student,
    batch: batchQuery.data ?? null,
    loading: studentsQuery.isLoading,
    error: studentsQuery.error ? (studentsQuery.error as Error).message : null,
  };
}
