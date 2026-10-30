import { type Href, useRouter } from 'expo-router';

import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { useSessionUser } from '@/lib/use-session-user';
import { can, isInstitutional } from '@/lib/vision-rules';
import { useVisionAccessQuery, useVisionCoverageQuery, useVisionDemoRole } from '@/services/vision/vision.service';

/** "/vision": entrada do Encontra-me Vision — cobertura por região (pública) e caminhos para os outros ambientes. */
export function useVisionHomeController() {
  const router = useRouter();
  const goBack = useSafeBack('/inicio' as Href);
  const user = useSessionUser();
  const accessQuery = useVisionAccessQuery();
  const coverageQuery = useVisionCoverageQuery();
  const setDemoRole = useVisionDemoRole();
  const access = accessQuery.data ?? null;

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    loggedIn: user != null,
    access,
    institutional: isInstitutional(access),
    canSeeTechnical: can(access, 'view_technical_status'),
    coverage: coverageQuery.data?.areas ?? [],
    coverageLoading: coverageQuery.isLoading,
    coverageError: coverageQuery.isError,
    retryCoverage: () => {
      void coverageQuery.refetch();
    },
    setDemoRole,
    goToMyCameras: () => router.push('/vision/minhas-cameras' as Href),
    goToRequests: () => router.push('/vision/pedidos' as Href),
    goToInstitutional: () => router.push('/vision/institucional' as Href),
    goToMissing: () => router.push('/pessoas-desaparecidas' as Href),
    goToHelp: () => router.push('/ajuda?assunto=vision' as Href),
  };
}

export type VisionHomeController = ReturnType<typeof useVisionHomeController>;
