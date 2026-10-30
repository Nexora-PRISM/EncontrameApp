import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSessionUser } from '@/lib/use-session-user';
import { getSightingsRepository } from '@/services/sightings/sightings.repository';
import type { SightingReportPayload } from '@/services/sightings/sightings.types';

const sightingKeys = {
  all: ['sightings'] as const,
  mine: (viewerId: string) => ['sightings', 'mine', viewerId] as const,
};

/** Envia um relato de avistamento. Não mexe no caso: o último local só muda depois da análise. */
export function useSubmitSightingReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SightingReportPayload) => getSightingsRepository().submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sightingKeys.all });
    },
  });
}

/** Relatos enviados pela conta logada. Sem conta ou com o recurso desligado, não consulta. */
export function useMySightingReportsQuery(enabled: boolean) {
  const userId = useSessionUser()?.id;

  return useQuery({
    queryKey: sightingKeys.mine(userId ?? 'anon'),
    queryFn: () => getSightingsRepository().listMine(),
    enabled: enabled && userId != null,
  });
}
