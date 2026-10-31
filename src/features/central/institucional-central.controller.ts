import { type Href, useRouter } from 'expo-router';

import { centralCan } from '@/lib/central-rules';
import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { useCentralAccessQuery, useCentralDemo, useDossiersQuery } from '@/services/central/central.service';

/** "/institucional": Central de Inteligência (ambiente institucional) e caminhos para os outros ambientes. */
export function useInstitucionalCentralController() {
  const router = useRouter();
  const goBack = useSafeBack('/perfil' as Href);
  const accessQuery = useCentralAccessQuery();
  const access = accessQuery.data ?? null;
  const canDossiers = centralCan(access, 'view_dossiers');
  const dossiersQuery = useDossiersQuery(canDossiers);
  const demo = useCentralDemo();

  return {
    goBack,
    enabled: env.centralEnabled,
    demo: env.useMocks,
    visionEnabled: env.visionEnabled,
    checking: accessQuery.isLoading,
    checkFailed: accessQuery.isError,
    retryAccess: () => {
      void accessQuery.refetch();
    },
    access,
    canDossiers,
    canAudit: centralCan(access, 'view_audit'),
    canTechnical: centralCan(access, 'view_technical'),
    dossiers: dossiersQuery.data ?? [],
    dossiersLoading: dossiersQuery.isLoading,
    dossiersError: dossiersQuery.isError,
    retryDossiers: () => {
      void dossiersQuery.refetch();
    },
    setDemoRole: demo.setRole,
    setDemoMfa: demo.setMfa,
    openDossier: (id: string) => router.push(`/institucional/dossie/${encodeURIComponent(id)}` as Href),
    goToAudit: () => router.push('/institucional/auditoria' as Href),
    goToTechnical: () => router.push('/central-tecnica' as Href),
    goToVerify: () => router.push('/verificar-integridade' as Href),
    goToVision: () => router.push('/vision/institucional' as Href),
  };
}

export type InstitucionalCentralController = ReturnType<typeof useInstitucionalCentralController>;
