import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  fetchStudents,
  fetchActiveEvacuationCenters,
  fetchDisasterMode,
  setDisasterMode,
  updateStudentStatus,
  createStatusLog,
} from '@/lib/api';
import type { Student, EvacuationCenter, StudentStatus } from '@/types';
import { toast } from 'sonner';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  students: ['students'] as const,
  evacuationCenters: ['evacuationCenters'] as const,
  disasterMode: ['disasterMode'] as const,
};

// ─── Students ────────────────────────────────────────────────────────────────

export function useStudents(): UseQueryResult<Student[]> {
  return useQuery({
    queryKey: queryKeys.students,
    queryFn: fetchStudents,
    refetchInterval: 10_000,
  });
}

// ─── Evacuation Centers ───────────────────────────────────────────────────────

export function useEvacuationCenters(): UseQueryResult<EvacuationCenter[]> {
  return useQuery({
    queryKey: queryKeys.evacuationCenters,
    queryFn: fetchActiveEvacuationCenters,
  });
}

// ─── Disaster Mode ────────────────────────────────────────────────────────────

export function useDisasterMode() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.disasterMode,
    queryFn: fetchDisasterMode,
    staleTime: 60_000, // Consider data fresh for 60 seconds
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  const mutation = useMutation({
    mutationFn: setDisasterMode,
    onMutate: async (isActive) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.disasterMode });
      
      // Snapshot the previous value
      const previousValue = queryClient.getQueryData(queryKeys.disasterMode);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.disasterMode, isActive);
      
      // Return context with previous value for rollback
      return { previousValue };
    },
    onSuccess: (_data, isActive) => {
      // Keep the optimistic update, don't refetch
      toast.success(
        isActive ? '🚨 Disaster mode activated' : '✅ Disaster mode deactivated',
      );
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous value on error
      if (context?.previousValue !== undefined) {
        queryClient.setQueryData(queryKeys.disasterMode, context.previousValue);
      }
      toast.error('Failed to update disaster mode');
    },
  });

  return { ...query, toggle: mutation.mutate, isToggling: mutation.isPending };
}

// ─── Status Override ──────────────────────────────────────────────────────────

export function useStatusOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      student,
      newStatus,
    }: {
      student: Student;
      newStatus: StudentStatus;
    }) => {
      await updateStudentStatus(student.student_id, newStatus);
      await createStatusLog({
        student_id: student.student_id,
        status: newStatus,
        source: 'ADMIN',
        validation_flag: true,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });
}
