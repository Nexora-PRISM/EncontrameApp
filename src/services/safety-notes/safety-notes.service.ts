import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_NEARBY_RADIUS_KM, snapNearbyCoord } from '@/lib/geo';
import { getSafetyNotesRepository } from '@/services/safety-notes/safety-notes.repository';
import type {
  CreateSafetyNotePayload,
  SafetyNoteVote,
} from '@/services/safety-notes/safety-notes.types';

const safetyNotesKeys = {
  all: ['safety-notes'] as const,
  nearby: (latitude: number, longitude: number) =>
    ['safety-notes', 'nearby', latitude, longitude] as const,
};

/** Avisos de segurança perto de um ponto. Desligado sem localização ou com o recurso desligado. */
export function useNearbySafetyNotesQuery(
  point: { latitude: number; longitude: number } | null,
  enabled: boolean,
) {
  const latitude = point ? snapNearbyCoord(point.latitude) : 0;
  const longitude = point ? snapNearbyCoord(point.longitude) : 0;

  return useQuery({
    queryKey: safetyNotesKeys.nearby(latitude, longitude),
    enabled: enabled && point != null,
    staleTime: 60_000,
    queryFn: () =>
      getSafetyNotesRepository().listNearby({
        latitude,
        longitude,
        radiusKm: DEFAULT_NEARBY_RADIUS_KM,
      }),
  });
}

/** Publica um aviso (conta conectada). */
export function useCreateSafetyNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSafetyNotePayload) => getSafetyNotesRepository().create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safetyNotesKeys.all });
    },
  });
}

/** "Continua assim" / "Não está mais assim" (conta conectada, um voto por pessoa). */
export function useVoteSafetyNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vote }: { id: string; vote: SafetyNoteVote }) =>
      getSafetyNotesRepository().vote(id, vote),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: safetyNotesKeys.all });
    },
  });
}
