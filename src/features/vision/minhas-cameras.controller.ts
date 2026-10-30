import { type Href, useRouter } from 'expo-router';

import { env } from '@/lib/env';
import { useSafeBack } from '@/lib/safe-back';
import { useMyCamerasQuery, useReceivedRequestsQuery } from '@/services/vision/vision.service';

/** "/vision/minhas-cameras": painel do responsável por câmera (qualquer conta pode cadastrar). */
export function useMinhasCamerasController() {
  const router = useRouter();
  const goBack = useSafeBack('/vision' as Href);
  const camerasQuery = useMyCamerasQuery(true);
  const requestsQuery = useReceivedRequestsQuery(true);
  const waiting = (requestsQuery.data ?? []).filter((item) => item.status === 'sent').length;

  return {
    goBack,
    enabled: env.visionEnabled,
    demo: env.useMocks,
    cameras: camerasQuery.data ?? [],
    loading: camerasQuery.isLoading,
    error: camerasQuery.isError,
    retry: () => {
      void camerasQuery.refetch();
    },
    waitingRequests: waiting,
    hasRequests: (requestsQuery.data ?? []).length > 0,
    addCamera: () => router.push('/vision/minhas-cameras/nova' as Href),
    openCamera: (id: string) => router.push(`/vision/minhas-cameras/${encodeURIComponent(id)}` as Href),
    goToRequests: () => router.push('/vision/pedidos' as Href),
  };
}

export type MinhasCamerasController = ReturnType<typeof useMinhasCamerasController>;
