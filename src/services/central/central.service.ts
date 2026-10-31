import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CentralRole, ClosureOutcome, LegalBasis, TipStatus } from '@/lib/central-rules';
import { env } from '@/lib/env';
import { useSessionUser } from '@/lib/use-session-user';
import { deriveDossier } from '@/services/central/central.derive';
import { setCentralDemoMfa, setCentralDemoRole } from '@/services/central/central.mock.repository';
import { getCentralRepository } from '@/services/central/central.repository';
import type { ConfidentialTipBody, ExportRecord } from '@/services/central/central.types';

const keys = {
  all: ['central'] as const,
  access: (userId: string) => ['central', 'access', userId] as const,
  dossiers: ['central', 'dossiers'] as const,
  dossier: (id: string) => ['central', 'dossier', id] as const,
  audit: ['central', 'audit'] as const,
  technical: ['central', 'technical'] as const,
};

const repo = () => getCentralRepository();

export function useCentralAccessQuery() {
  const userId = useSessionUser()?.id;
  return useQuery({
    queryKey: keys.access(userId ?? 'anon'),
    queryFn: () => repo().getAccess(),
    enabled: env.centralEnabled && userId != null,
  });
}

export function useDossiersQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.dossiers, queryFn: () => repo().listDossiers(), enabled: env.centralEnabled && enabled });
}

export function useDossierQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: keys.dossier(id),
    queryFn: async () => deriveDossier(await repo().getDossier(id), Date.now()),
    enabled: env.centralEnabled && enabled && id.length > 0,
  });
}

export function useCentralAuditQuery(enabled: boolean) {
  return useQuery({ queryKey: keys.audit, queryFn: () => repo().getAudit(), enabled: env.centralEnabled && enabled });
}

export function useTechnicalStatusQuery(enabled: boolean) {
  return useQuery({
    queryKey: keys.technical,
    queryFn: () => repo().getTechnicalStatus(),
    enabled: env.centralEnabled && enabled,
  });
}

/** Pista confidencial (ambiente público). */
export function useConfidentialTipMutation() {
  return useMutation({ mutationFn: (body: ConfidentialTipBody) => repo().submitConfidentialTip(body) });
}

/** Ações institucionais. Depois de cada uma (mesmo recusada), a Central é recarregada, inclusive a auditoria. */
export function useCentralActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });
  return {
    reviewTip: useMutation({
      mutationFn: (input: { dossierId: string; tipId: string; status: TipStatus; note: string }) =>
        repo().reviewTip(input.dossierId, input.tipId, input.status, input.note),
      onSettled: refresh,
    }),
    openIdentity: useMutation({
      mutationFn: (input: { dossierId: string; tipId: string; justification: string }) =>
        repo().openWitnessIdentity(input.dossierId, input.tipId, input.justification),
      onSettled: refresh,
    }),
    addPreservation: useMutation({
      mutationFn: (input: {
        dossierId: string;
        legalBasis: LegalBasis;
        reference: string;
        scope: string;
        until: string;
        justification: string;
      }) => repo().addPreservation(input.dossierId, input),
      onSettled: refresh,
    }),
    changeMobilization: useMutation({
      mutationFn: (input: { dossierId: string; areaId: string; action: 'expand' | 'pause' | 'resume'; justification: string }) =>
        repo().changeMobilization(input.dossierId, input),
      onSettled: refresh,
    }),
    closeCase: useMutation({
      mutationFn: (input: { dossierId: string; outcome: ClosureOutcome; justification: string }) =>
        repo().closeCase(input.dossierId, input),
      onSettled: refresh,
    }),
    registerExport: useMutation({
      mutationFn: (input: { dossierId: string; record: Omit<ExportRecord, 'id' | 'at' | 'byName' | 'links'> & { justification: string } }) =>
        repo().registerExport(input.dossierId, input.record),
      onSettled: refresh,
    }),
    createLink: useMutation({
      mutationFn: (input: { dossierId: string; exportId: string; hours: number; justification: string }) =>
        repo().createLink(input.dossierId, input.exportId, input.hours, input.justification),
      onSettled: refresh,
    }),
    revokeLink: useMutation({
      mutationFn: (input: { dossierId: string; exportId: string; linkId: string; justification: string }) =>
        repo().revokeLink(input.dossierId, input.exportId, input.linkId, input.justification),
      onSettled: refresh,
    }),
    exceptionalAccess: useMutation({
      mutationFn: (input: { target: string; justification: string }) =>
        repo().requestExceptionalAccess(input.target, input.justification),
      onSettled: refresh,
    }),
  };
}

/** Bytes originais de um arquivo (para montar o pacote de exportação no aparelho). */
export function getCentralFileBytes(dossierId: string, fileId: string) {
  return repo().getFileBytes(dossierId, fileId);
}

/** Troca de perfil e de segundo fator do modo de demonstração. */
export function useCentralDemo() {
  const queryClient = useQueryClient();
  const refresh = () => void queryClient.invalidateQueries({ queryKey: keys.all });
  return {
    setRole: (next: CentralRole) => {
      if (!env.useMocks) return;
      setCentralDemoRole(next);
      refresh();
    },
    setMfa: (next: boolean) => {
      if (!env.useMocks) return;
      setCentralDemoMfa(next);
      refresh();
    },
  };
}
