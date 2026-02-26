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
  });

  const mutation = useMutation({
    mutationFn: setDisasterMode,
    onSuccess: (_data, isActive) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.disasterMode });
      toast.success(
        isActive ? '🚨 Disaster mode activated' : '✅ Disaster mode deactivated',
      );
    },
    onError: () => toast.error('Failed to update disaster mode'),
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
      await updateStudentStatus(student.id, newStatus);
      await createStatusLog({
        student_id: student.student_id,
        status: newStatus,
        source: 'ADMIN',
        is_valid: true,
        notes: 'Manual override by admin',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students });
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });
}