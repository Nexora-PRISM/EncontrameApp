import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { env } from '@/lib/env';
import { useSessionUser } from '@/lib/use-session-user';
import type { CameraAuthorization, MatchClass, PreservationStatus, Reliability, VisionRole } from '@/lib/vision-rules';
import { deriveOperation, deriveReceived } from '@/services/vision/vision.derive';
import { setVisionDemoRole } from '@/services/vision/vision.mock.repository';
import { getVisionRepository } from '@/services/vision/vision.repository';
import type { CreateOperationInput, InstitutionalAccessRequest, SaveCameraInput } from '@/services/vision/vision.types';

const keys = {
  all: ['vision'] as const,
  access: (userId: string) => ['vision', 'access', userId] as const,
  coverage: ['vision', 'coverage'] as const,
  myCameras: ['vision', 'my-cameras'] as const,
  received: ['vision', 'received'] as const,
  operations: ['vision', 'operations'] as const,
  operation: (id: string) => ['vision', 'operation', id] as const,
  audit: (operationId: string) => ['vision', 'audit', operationId] as const,
};

const repo = () => getVisionRepository();

/** Função e habilitação da conta no Vision (sem conta: só a cobertura pública). */
export function useVisionAccessQuery() {
  const userId = useSessionUser()?.id;
  return useQuery({
    queryKey: keys.access(userId ?? 'anon'),
    queryFn: () => repo().getAccess(),
    enabled: env.visionEnabled && userId != null,
  });
}

export function useVisionCoverageQuery() {
  return useQuery({ queryKey: keys.coverage, queryFn: () => repo().getCoverage(), enabled: env.visionEnabled });
}

export function useMyCamerasQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.myCameras, queryFn: () => repo().getMyCameras(), enabled: env.visionEnabled && enabled });
}

export function useReceivedRequestsQuery(enabled: boolean) {
  return useQuery({
    queryKey: keys.received,
    queryFn: async () => deriveReceived(await repo().getReceivedRequests(), Date.now()),
    enabled: env.visionEnabled && enabled,
  });
}

export function useOperationsQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.operations, queryFn: () => repo().getOperations(), enabled: env.visionEnabled && enabled });
}

export function useOperationQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.operation(id),
    queryFn: async () => deriveOperation(await repo().getOperation(id), Date.now()),
    enabled: env.visionEnabled && enabled && id.length > 0,
  });
}

export function useVisionAuditQuery(operationId: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.audit(operationId),
    queryFn: () => repo().getAudit(operationId || undefined),
    enabled: env.visionEnabled && enabled,
  });
}

/** Ações do Vision. Depois de cada uma (mesmo recusada), tudo do módulo é recarregado, inclusive a auditoria. */
export function useVisionActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });

  return {
    requestAccess: useMutation({
      mutationFn: (input: InstitutionalAccessRequest) => repo().requestInstitutionalAccess(input),
      onSettled: refresh,
    }),
    saveCamera: useMutation({
      mutationFn: (input: { id: string | null; camera: SaveCameraInput }) => repo().saveCamera(input.id, input.camera),
      onSettled: refresh,
    }),
    setParticipation: useMutation({
      mutationFn: (input: { id: string; next: CameraAuthorization }) => repo().setCameraParticipation(input.id, input.next),
      onSettled: refresh,
    }),
    createOperation: useMutation({
      mutationFn: (input: CreateOperationInput) => repo().createOperation(input),
      onSettled: refresh,
    }),
    changeRadius: useMutation({
      mutationFn: (input: { operationId: string; radiusKm: number; justification: string }) =>
        repo().changeRadius(input.operationId, input.radiusKm, input.justification),
      onSettled: refresh,
    }),
    requestPreservation: useMutation({
      mutationFn: (input: { operationId: string; cameraId: string; from: string; to: string; justification: string }) =>
        repo().requestPreservation(input.operationId, input),
      onSettled: refresh,
    }),
    movePreservation: useMutation({
      mutationFn: (input: { requestId: string; status: PreservationStatus; note: string }) =>
        repo().movePreservation(input.requestId, input.status, input.note),
      onSettled: refresh,
    }),
    classifyMatch: useMutation({
      mutationFn: (input: { matchId: string; classification: MatchClass; note: string }) =>
        repo().classifyMatch(input.matchId, input.classification, input.note),
      onSettled: refresh,
    }),
    openClip: useMutation({
      mutationFn: (input: { clipId: string; justification: string }) => repo().openClip(input.clipId, input.justification),
      onSettled: refresh,
    }),
    rateInfo: useMutation({
      mutationFn: (input: { infoId: string; reliability: Reliability; note: string }) =>
        repo().rateInfo(input.infoId, input.reliability, input.note),
      onSettled: refresh,
    }),
  };
}

/** Troca o perfil de demonstração e recarrega o módulo (só no modo de demonstração). */
export function useVisionDemoRole() {
  const queryClient = useQueryClient();
  return (role: VisionRole) => {
    if (!env.useMocks) return;
    setVisionDemoRole(role);
    void queryClient.invalidateQueries({ queryKey: keys.all });
  };
}
