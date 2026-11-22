import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_NEARBY_RADIUS_KM, isValidCoordinate, snapNearbyCoord } from '@/lib/geo';
import { sanitizeSafetyNotes } from '@/lib/safety-notes';
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

/**
 * Avisos de segurança perto de um ponto (a posição da pessoa ou o centro da área vista no mapa).
 * Desligado sem ponto válido ou com a camada escondida.
 *
 * - O ponto é arredondado (~1 km) só para a chave do cache; a lista volta limpa
 *   (`sanitizeSafetyNotes`): sem coordenada inválida, vencido, derrubado ou repetido.
 * - Ao trocar de região, os avisos anteriores ficam no mapa até os novos chegarem (sem piscar).
 * - Sem internet, tenta de novo poucas vezes e volta a buscar quando a conexão voltar; a tela
 *   mostra o estado (o modal geral de erro não aparece para esta consulta de fundo).
 */
export function useNearbySafetyNotesQuery(
  point: { latitude: number; longitude: number } | null,
  enabled: boolean,
) {
  const valid = point != null && isValidCoordinate(point.latitude, point.longitude);
  const latitude = valid ? snapNearbyCoord(point.latitude) : 0;
  const longitude = valid ? snapNearbyCoord(point.longitude) : 0;

  return useQuery({
    queryKey: safetyNotesKeys.nearby(latitude, longitude),
    enabled: enabled && valid,
    staleTime: 60_000,
    refetchInterval: enabled && valid ? 5 * 60_000 : false,
    refetchOnReconnect: true,
    retry: 2,
    placeholderData: keepPreviousData,
    queryFn: async () =>
      sanitizeSafetyNotes(
        await getSafetyNotesRepository().listNearby({
          latitude,
          longitude,
          radiusKm: DEFAULT_NEARBY_RADIUS_KM,
        }),
      ),
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
