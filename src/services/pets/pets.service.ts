import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getPetsRepository } from '@/services/pets/pets.repository';
import type { CreatePetPayload } from '@/services/pets/pets.types';

const petsKeys = {
  all: ['pets'] as const,
  list: ['pets', 'list'] as const,
};

/** Pets desaparecidos publicados (visíveis para todos, para a comunidade ajudar). */
export function usePetsQuery(enabled: boolean) {
  return useQuery({
    queryKey: petsKeys.list,
    enabled,
    queryFn: () => getPetsRepository().list(),
  });
}

/** Publica um pet desaparecido (conta conectada + Premium). */
export function useCreatePetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePetPayload) => getPetsRepository().create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: petsKeys.all });
    },
  });
}
