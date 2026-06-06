import { useQuery } from '@tanstack/react-query';
import { fetchBatch, fetchStudent } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

export function useProfile() {
  const currentStudent = useAuthStore((s) => s.student);

  const studentQuery = useQuery({
    queryKey: ['student', currentStudent?.id],
    queryFn: () => fetchStudent(currentStudent!.id),
    enabled: !!currentStudent?.id,
  });

  const student = studentQuery.data ?? currentStudent;

  const batchQuery = useQuery({
    queryKey: ['batch', student?.batchId],
    queryFn: () => fetchBatch(student!.batchId!),
    enabled: !!student?.batchId,
  });

  return {
    student,
    batch: batchQuery.data ?? null,
    loading: studentQuery.isLoading,
    error: studentQuery.error ? (studentQuery.error as Error).message : null,
  };
}
